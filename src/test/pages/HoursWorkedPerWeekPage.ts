import {Page} from '@playwright/test';
import {expect} from '../../support/assertions';
import {BaseNumericQuestionPage} from './BaseNumericQuestionPage';
import logger from '../logger/logger';

/** how many hours per week calculator question. */
export class HoursWorkedPerWeekPage extends BaseNumericQuestionPage {
    constructor(page: Page) {
        super(page, 'how-many-hours-per-week');
    }

    get hoursInput() {
        return this.numericInput;
    }

    async fillHours(value: string): Promise<void> {
        await this.fillValue(value);
        logger.info('Hours filled');
    }

    async clearHours(): Promise<void> {
        await this.clearValue();
        logger.info('Hours cleared');
    }

    async expectHours(value: string): Promise<void> {
        await this.expectValue(value);
        logger.info('Hours expected');
    }

    async submitHours(value: string): Promise<void> {
        await this.submitValue(value);
        logger.info('Hours submitted');
    }

    async expectExplanation(): Promise<void> {
        await expect(this.hint).toBeVisible();
        logger.info('Explanation expected');
        await expect(this.hint).toHaveText('Include half-hours, for example 40.5.');
    }
}
