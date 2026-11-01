import {Locator, Page} from '@playwright/test';
import {expect} from '../../../support/assertions';
import {BasePage} from '../base/BasePage';

/** Reusable feedback prompt, separate from calculator question controls. */
export class FeedbackPage extends BasePage {
    readonly container: Locator;
    readonly prompt: Locator;
    readonly questionAnswer: Locator;
    readonly optionList: Locator;
    readonly maybeLink: Locator;
    readonly heading: Locator;
    readonly usefulButton: Locator;
    readonly notUsefulButton: Locator;
    readonly reportProblemButton: Locator;
    readonly successMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.container = page.locator('.gem-c-feedback__prompt');
        this.prompt = this.container.locator('.gem-c-feedback__prompt-content');
        this.questionAnswer = this.prompt.locator('.gem-c-feedback__prompt-question-answer');
        this.optionList = this.questionAnswer.getByRole('list');
        this.maybeLink = this.optionList.locator('a[role="button"][href="/contact/govuk"]');
        this.heading = this.prompt.getByRole('heading', {
            name: 'Is this page useful?',
            exact: true,
        });
        this.usefulButton = this.prompt.getByRole('button', {
            name: 'Yes this page is useful',
            exact: true,
        });
        this.notUsefulButton = this.prompt.getByRole('button', {
            name: 'No this page is not useful',
            exact: true,
        });
        this.reportProblemButton = this.prompt.getByRole('button', {
            name: 'Report a problem with this page',
            exact: true,
        });
        this.successMessage = this.prompt.getByRole('alert');
    }

    async expectVisible(): Promise<void> {
        await expect(this.container).toBeVisible();
        await expect(this.heading).toBeVisible();
        await expect(this.usefulButton).toBeVisible();
        await expect(this.notUsefulButton).toBeVisible();
        await expect(this.reportProblemButton).toBeVisible();
    }

    async expectInitialState(): Promise<void> {
        await this.expectVisible();
        await expect(this.maybeLink).toBeHidden();
        await expect(this.successMessage).toBeHidden();
        await expect(this.notUsefulButton).toHaveAttribute('aria-controls', 'page-is-not-useful');
        await expect(this.reportProblemButton).toHaveAttribute(
            'aria-controls',
            'something-is-wrong',
        );
    }

    async scrollIntoView(): Promise<void> {
        await this.container.scrollIntoViewIfNeeded();
    }

    async focus(): Promise<void> {
        await this.container.focus();
        await expect(this.container).toBeFocused();
    }

    async expectPromptHidden(): Promise<void> {
        await expect(this.questionAnswer).toBeHidden();
    }

    async markUseful(): Promise<void> {
        await this.usefulButton.click();
        await this.expectThankYou();
    }

    async markNotUseful(): Promise<void> {
        await this.notUsefulButton.click();
    }

    async reportProblem(): Promise<void> {
        await this.reportProblemButton.click();
    }

    async expectThankYou(): Promise<void> {
        await expect(this.successMessage).toBeVisible();
        await expect(this.successMessage).toHaveText('Thank you for your feedback');
    }
}
