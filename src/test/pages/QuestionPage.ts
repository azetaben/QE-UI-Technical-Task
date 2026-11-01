import {RadioOptions} from './components/RadioOptions';
import {Locator, Page} from '@playwright/test';
import {expect} from '../../support/assertions';
import {BaseQuestionPage} from './BaseQuestionPage';
import logger from '../logger/logger';

export class QuestionPage extends BaseQuestionPage {
    readonly options: RadioOptions;
    readonly numeric: Locator;
    readonly dayInput: Locator;
    readonly monthInput: Locator;
    readonly yearInput: Locator;

    constructor(page: Page) {
        super(page, page.getByRole('main').locator('form[data-question-key]'));
        this.options = new RadioOptions(this.form);
        this.numeric = this.form.locator('input[name="response"][type="text"]');
        this.dayInput = this.form.getByLabel('Day', {exact: true});
        this.monthInput = this.form.getByLabel('Month', {exact: true});
        this.yearInput = this.form.getByLabel('Year', {exact: true});
    }

    async expectKey(key: string): Promise<void> {
        await expect(this.form).toHaveAttribute('data-question-key', key);
    }

    async choose(label: string): Promise<void> {
        logger.info('Choosing option: ' + label);
        await this.options.select(label);
    }

    async answer(label: string): Promise<void> {
        await this.choose(label);
        logger.info('Answering question');
        await this.continue();
        logger.info('Question answered');
    }

    async number(value: string): Promise<void> {
        await this.numeric.fill(value);
        logger.info('Answering number question');
        await this.continue();
        logger.info('Clicked the continue button');
    }

    async date(day: string, month: string, year: string): Promise<void> {
        await this.dayInput.fill(day);
        logger.info('Answering date question');
        await this.monthInput.fill(month);
        logger.info('Answering date question');
        await this.yearInput.fill(year);
        logger.info('Answering date question');
    }

    async change(question: string): Promise<void> {
        await this.summary.change(question);
        logger.info('Question changed: ' + question);
    }

    async expectRecoverableError(key: string): Promise<void> {
        await this.expectKey(key);
        logger.info('Expecting recoverable error:' + key);
        await this.expectValidationError();
        logger.info('Recoverable error expected');
    }
}
