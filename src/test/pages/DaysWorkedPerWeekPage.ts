import {Page} from '@playwright/test';
import {BaseNumericQuestionPage} from './BaseNumericQuestionPage';
import logger from '../logger/logger';

/** how many days per week calculator question. */
export class DaysWorkedPerWeekPage extends BaseNumericQuestionPage {
    constructor(page: Page) {
        super(page, 'how-many-days-per-week');
    }

    get daysInput() {
        return this.numericInput;
    }

    async fillDays(value: string): Promise<void> {
        logger.info('Filling days worked per week input:' +value);
        await this.fillValue(value);
        logger.info('Days worked per week input filled');
    }

    async clearDays(): Promise<void> {
        logger.info('Clearing days worked per week input');
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
}
