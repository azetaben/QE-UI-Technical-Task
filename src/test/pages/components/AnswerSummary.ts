import {Locator, Page} from '@playwright/test';
import {expect} from '../../../support/assertions';
import logger from "../../logger/logger";

/** Only the answer summary and its change/restart navigation. */
export class AnswerSummary {
    readonly rows: Locator;
    readonly restartLink: Locator;
    readonly startButton: Locator;

    constructor(private readonly page: Page) {
        this.restartLink = page.getByRole('link', {name: 'Start again', exact: true});
        this.startButton = page.getByRole('button', {name: 'Start now', exact: true});
        this.rows = page.locator('.govuk-summary-list__row');
    }

    row(question: string): Locator {
        return this.rows.filter({has: this.page.locator('dt', {hasText: question})});
    }

    async change(question: string): Promise<void> {
        await this.row(question)
            .getByRole('link', {name: /^Change/})
            .click();
    }

    async expectAnswer(question: string, answer: string): Promise<void> {
        await expect(this.row(question).locator('.govuk-summary-list__value')).toHaveText(answer);
    }

    async expectMissing(question: string): Promise<void> {
        await expect(this.row(question)).toHaveCount(0);
    }

    async restart(): Promise<void> {
        await this.restartLink.click();
        logger.info('Result page restart clicked');
        await expect(this.startButton).toBeVisible();

    }
}
