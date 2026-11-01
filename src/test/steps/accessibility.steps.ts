import {Given, Then, When} from '@cucumber/cucumber';
import {Locator} from '@playwright/test';
import {expect} from '../../support/assertions';
import {CustomWorld} from '../../hooks/CustomWorld';

async function tabTo(world: CustomWorld, target: Locator): Promise<void> {
    for (let index = 0; index < 70; index++) {
        await world.page.keyboard.press('Tab');
        if (await target.evaluate((element) => element === document.activeElement)) {
            const style = await target.evaluate((element) => {
                const css = getComputedStyle(element);
                return {
                    outline: css.outlineStyle !== 'none' && parseFloat(css.outlineWidth) > 0,
                    shadow: css.boxShadow !== 'none',
                };
            });
            expect(
                style.outline || style.shadow,
                'Keyboard focus needs a visible outline or shadow',
            ).toBe(true);
            return;
        }
    }
    throw new Error('Control was not reachable within 70 Tab presses');
}

async function keyboardContinue(world: CustomWorld): Promise<void> {
    const form = world.calculator.question.form;
    const previousKey = await form.getAttribute('data-question-key');
    await tabTo(world, form.getByRole('button', {name: 'Continue', exact: true}));
    await world.page.keyboard.press('Enter');
    await expect
        .poll(async () =>
            form
                .count()
                .then(async (count) => (count ? form.getAttribute('data-question-key') : null)),
        )
        .not.toBe(previousKey);
}

When(
    /^I complete a representative (regular|irregular-hours) journey using only the keyboard$/,
    async function (this: CustomWorld, worker: string) {
        await tabTo(this, this.page.getByRole('button', {name: 'Start now', exact: true}));
        await this.page.keyboard.press('Enter');
        await this.calculator.question.expectKey('regular-or-irregular-hours');
        await tabTo(
            this,
            this.calculator.question.form.getByRole('radio', {name: 'Yes', exact: true}),
        );
        if (worker === 'regular') await this.page.keyboard.press('ArrowDown');
        else await this.page.keyboard.press('Space');
        await keyboardContinue(this);
        if (worker === 'regular') {
            await tabTo(
                this,
                this.calculator.question.form.getByRole('radio', {
                    name: 'days worked per week',
                    exact: true,
                }),
            );
            await this.page.keyboard.press('Space');
            await keyboardContinue(this);
            await tabTo(
                this,
                this.calculator.question.form.getByRole('radio', {
                    name: 'for a full leave year',
                    exact: true,
                }),
            );
            await this.page.keyboard.press('Space');
            await keyboardContinue(this);
        } else {
            for (const [label, value] of [
                ['Day', '1'],
                ['Month', '4'],
                ['Year', '2026'],
            ]) {
                await tabTo(this, this.calculator.question.form.getByLabel(label, {exact: true}));
                await this.page.keyboard.type(value);
            }
            await keyboardContinue(this);
        }
        await tabTo(this, this.calculator.question.numeric);
        await this.page.keyboard.type(worker === 'regular' ? '5' : '30');
        await keyboardContinue(this);
        await this.calculator.result.expectEntitlement(
            worker === 'regular' ? 28 : 4,
            worker === 'regular' ? 'days' : 'hours',
        );
    },
);
Then('all controls should be reachable and operable', async function (this: CustomWorld) {
    await expect(this.calculator.question.form).toHaveCount(0);
    await tabTo(this, this.page.getByRole('link', {name: 'Start again', exact: true}));
});
Then('keyboard focus should be visible and logically ordered', async function (this: CustomWorld) {
    // tabTo asserts visible focus at each meaningful control during the journey.
    await expect(this.page.getByRole('link', {name: 'Start again', exact: true})).toBeFocused();
    this.attach(
        'Keyboard route and focus styles checked. Full visual focus-order review remains a manual accessibility activity.',
        'text/plain',
    );
});
Given('the browser is configured for a narrow mobile viewport', async function (this: CustomWorld) {
    await this.page.setViewportSize({width: 320, height: 800});
});
When('I complete a journey including an error and a result', async function (this: CustomWorld) {
    await this.calculator.regular();
    await this.calculator.question.number('8');
    await this.calculator.question.expectRecoverableError('how-many-days-per-week');
    await assertReflow(this);
    await this.calculator.question.number('5');
    await this.calculator.result.expectEntitlement(28, 'days');
});

const REFLOW_TARGETS =
    'main h1, main input:not([type="hidden"]), main button, main .govuk-error-summary';

async function assertReflow(world: CustomWorld): Promise<void> {
    await expect(world.page).toHaveNoHorizontalScroll();
    await expect(world.page.locator(REFLOW_TARGETS)).toFitWithinViewport();
}

Then('the content should reflow', async function (this: CustomWorld) {
    await assertReflow(this);
});
Then(
    'controls, errors and results should remain usable without clipping',
    async function (this: CustomWorld) {
        await assertReflow(this);
        await this.calculator.result.restart();
    },
);

When(
    /^I reach the calculator (landing page|first question|validation error|result)$/,
    async function (this: CustomWorld, stage: string) {
        if (stage === 'landing page') return;
        if (stage === 'first question') return this.calculator.landing.start();
        await this.calculator.regular();
        if (stage === 'validation error') {
            await this.calculator.question.number('');
            await this.calculator.question.expectRecoverableError('how-many-days-per-week');
        } else {
            await this.calculator.question.number('5');
            await this.calculator.result.expectEntitlement(28, 'days');
        }
    },
);
Then(
    'the page should have no automatically detectable WCAG 2.2 AA violations',
    async function (this: CustomWorld) {
        await expect(this.page).toPassAxe();
    },
);
