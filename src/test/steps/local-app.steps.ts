import {Given, Then, When} from '@cucumber/cucumber';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import type {CustomWorld} from '../../hooks/CustomWorld';
import {LocalContactPage} from '../../local/LocalContactPage';
import {expect} from '../../support/assertions';

Given('the local accessibility exercise is open', async function (this: CustomWorld) {
    await new LocalContactPage(this.page).open();
});

When(
    'I complete the local contact fields using only the keyboard',
    async function (this: CustomWorld) {
        await new LocalContactPage(this.page).fillUsingKeyboard();
    },
);

Then('the local Done button should have keyboard focus', async function (this: CustomWorld) {
    await expect(new LocalContactPage(this.page).submit).toBeFocused();
});

Then(
    'the local page should pass the automated accessibility audit',
    async function (this: CustomWorld) {
        const results = await new AxeBuilder({page: this.page})
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
            .analyze();
        const json = JSON.stringify(results, null, 2);
        this.attach(Buffer.from(json), {
            mediaType: 'application/json',
            fileName: 'local-axe-results.json',
        });
        await mkdir(this.options.reportDir, {recursive: true});
        await writeFile(path.join(this.options.reportDir, 'local-axe-results.json'), json);
        assert.deepEqual(
            results.violations.map(({id, impact, nodes}) => ({
                id,
                impact,
                targets: nodes.map((node) => node.target),
            })),
            [],
            'Local WCAG A/AA and best-practice violations; see the attached axe JSON',
        );
    },
);

When('the local viewport is narrowed to 320 CSS pixels', async function (this: CustomWorld) {
    await this.page.setViewportSize({width: 320, height: 800});
});

Then(
    'the local form and illustration should fit without clipping',
    async function (this: CustomWorld) {
        const clipped = await this.page.locator('form, .contact-image').evaluateAll((elements) => {
            const width = document.documentElement.clientWidth;
            return elements
                .map((element) => {
                    const {left, right} = element.getBoundingClientRect();
                    return {element: element.tagName, left, right, viewportWidth: width};
                })
                .filter(({left, right}) => left < -1 || right > width + 1);
        });
        this.attach(JSON.stringify({clipped}), 'application/json');
        assert.deepEqual(clipped, [], 'Content must fit within the 320px viewport');
        const overflow = await this.page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        assert.ok(overflow <= 1, `Document has ${overflow}px horizontal overflow`);
    },
);

Then(
    'the populated local fields should retain visible associated labels',
    async function (this: CustomWorld) {
        const missing = await this.page
            .locator('input, textarea')
            .evaluateAll((fields) =>
                fields
                    .filter(
                        (field) =>
                            !Array.from((field as HTMLInputElement).labels ?? []).some(
                                (label) =>
                                    label.checkVisibility() && Boolean(label.textContent?.trim()),
                            ),
                    )
                    .map((field) => field.getAttribute('placeholder')),
            );
        this.attach(JSON.stringify({fieldsWithoutVisibleLabels: missing}), 'application/json');
        assert.deepEqual(
            missing,
            [],
            'Placeholders disappear when populated; persistent visible labels are required',
        );
    },
);
