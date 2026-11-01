import {Locator, Page} from '@playwright/test';
import {expect} from '../../support/assertions';
import {BaseQuestionPage} from './BaseQuestionPage';

export abstract class BaseNumericQuestionPage extends BaseQuestionPage {
    readonly numericInput: Locator;

    protected constructor(page: Page, questionKey: string) {
        super(page, page.getByRole('main').locator(`form[data-question-key="${questionKey}"]`));
        this.numericInput = this.form.locator('input[name="response"][type="text"]');
    }

    override async expectLoaded(): Promise<void> {
        await super.expectLoaded();
        await expect(this.numericInput).toBeVisible();
    }

    async fillValue(value: string): Promise<void> {
        await this.numericInput.fill(value);
    }

    async clearValue(): Promise<void> {
        await this.fillValue('');
    }

    async expectValue(value: string): Promise<void> {
        await expect(this.numericInput).toHaveValue(value);
    }

    async submitValue(value: string): Promise<void> {
        await this.fillValue(value);
        await this.continue();
        await expect(this.form).toBeHidden();
    }

    async expectFormConfiguration(action?: string): Promise<void> {
        await expect(this.form).toBeSmartAnswerForm({type: 'value_question', action});
    }
}
