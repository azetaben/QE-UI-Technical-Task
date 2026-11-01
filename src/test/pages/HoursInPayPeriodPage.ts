import {Page} from '@playwright/test';
import {BaseNumericQuestionPage} from './BaseNumericQuestionPage';
import logger from '../logger/logger';

/** hours in pay period calculator question. */
export class HoursInPayPeriodPage extends BaseNumericQuestionPage {
    constructor(page: Page) {
        super(page, 'hours-in-pay-period');
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
}
