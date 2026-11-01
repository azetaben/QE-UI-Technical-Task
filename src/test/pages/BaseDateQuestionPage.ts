import {Locator, Page} from '@playwright/test';
import {expect} from '../../support/assertions';
import {BaseQuestionPage} from './BaseQuestionPage';
import logger from '../logger/logger';

export abstract class BaseDateQuestionPage extends BaseQuestionPage {
    readonly dayInput: Locator;
    readonly monthInput: Locator;
    readonly yearInput: Locator;

    protected constructor(page: Page, form: Locator) {
        super(page, form);
        this.dayInput = form.getByRole('textbox', {name: 'Day', exact: true});
        this.monthInput = form.getByRole('textbox', {name: 'Month', exact: true});
        this.yearInput = form.getByRole('textbox', {name: 'Year', exact: true});
    }

    override async expectLoaded(): Promise<void> {
        await super.expectLoaded();
        await expect(this.dayInput).toBeVisible();
        await expect(this.monthInput).toBeVisible();
        await expect(this.yearInput).toBeVisible();
        logger.info('Date question loaded');
    }

    async fillDay(value: string): Promise<void> {
        await this.dayInput.fill(value);
        logger.info('Day input filled: ' + value);
    }

    async fillMonth(value: string): Promise<void> {
        await this.monthInput.fill(value);
        logger.info('Month input filled: ' + value);
    }

    async fillYear(value: string): Promise<void> {
        await this.yearInput.fill(value);
        logger.info('Year input filled: ' + value);
    }

    async fillDate(day: string, month: string, year: string): Promise<void> {
        await this.fillDay(day);
        logger.info('Date filled: ' + day + '/' + month + '/' + year);
        await this.fillMonth(month);
        logger.info('Month filled: ' + month);
        await this.fillYear(year);
        logger.info('Year filled: ' + year);
    }

    async clearDate(): Promise<void> {
        await this.fillDate('', '', '');
        logger.info('Date cleared');
    }

    async expectDate(day: string, month: string, year: string): Promise<void> {
        await expect(this.dayInput).toHaveValue(day);
        logger.info('Day input expected: ' + day);
        await expect(this.monthInput).toHaveValue(month);
        logger.info('Month input expected: ' + month);
        await expect(this.yearInput).toHaveValue(year);
        logger.info('Year input expected: ' + year);
    }

    async submitDate(day: string, month: string, year: string): Promise<void> {
        await this.fillDate(day, month, year);
        logger.info('Date submitted: ' + day + '/' + month + '/' + year);
        await this.continue();
        logger.info('Date question submitted');
        await expect(this.form).toBeHidden();
        logger.info('Date question form hidden');
    }
}
