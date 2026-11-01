import {Page} from '@playwright/test';
import {expect} from '../../support/assertions';
import {BaseNumericQuestionPage} from './BaseNumericQuestionPage';
import logger from "../logger/logger";

/** how many days per week for hours calculator question. */
export class DaysWorkedPerWeekForHoursPage extends BaseNumericQuestionPage {
    constructor(page: Page) {
        super(page, 'how-many-days-per-week-for-hours');
    }

    get daysInput() {
        return this.numericInput;
    }

    async fillDays(value: string): Promise<void> {
        await this.fillValue(value);
        logger.info('Days worked per week input filled');

    }

    async clearDays(): Promise<void> {
        await this.clearValue();
        logger.info('Days worked per week input cleared');
    }

    async expectDays(value: string): Promise<void> {
        await this.expectValue(value);
        logger.info('Days worked per week input has expected value');
    }

    async submitDays(value: string): Promise<void> {
        await this.submitValue(value);
        logger.info('Days worked per week submitted');
    }

    async expectExplanation(): Promise<void> {
        await expect(this.hint).toBeVisible();
        logger.info('Days worked per week explanation visible');
        // The behavioural promise (decimal days are accepted) matters; the surrounding copy does not.
        await expect(this.hint).toContainText(/half-days, for example 3\.5/);
        logger.info('Days worked per week explanation contains expected text');
    }
}
