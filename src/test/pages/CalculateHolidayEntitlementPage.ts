import {RadioOptions} from './components/RadioOptions';
import {Locator, Page} from '@playwright/test';
import {expect} from '../../support/assertions';
import {BaseQuestionPage} from './BaseQuestionPage';
import {Feedback} from './components/Feedback';
import logger from '../logger/logger';

/** First calculator question: regular hours versus irregular hours or part-year work. */
export class CalculateHolidayEntitlementPage extends BaseQuestionPage {
    readonly options: RadioOptions;
    readonly fieldset: Locator;
    readonly yesRadio: Locator;
    readonly noRadio: Locator;
    readonly feedback: Feedback;

    constructor(
        page: Page,
        readonly url = 'https://www.gov.uk/calculate-your-holiday-entitlement/y',
    ) {
        super(page, page.getByRole('main').locator('form[data-question-key="regular-or-irregular-hours"]'),);
        this.options = new RadioOptions(this.form);
        this.fieldset = this.form.getByRole('group', {
            name: 'Does the employee work irregular hours or for part of the year?',
            exact: true,
        });
        this.yesRadio = this.options.option('Yes');
        this.noRadio = this.options.option('No');
        this.feedback = new Feedback(page);
    }

    override async open(): Promise<void> {
        await this.navigate(this.url);
        logger.info('Navigated to calculate holiday entitlement page');
        await this.cookies.rejectOptionalCookies();
        logger.info('Rejected cookies');
        await this.expectLoaded();
        logger.info('Form loaded');
    }

    override async expectLoaded(): Promise<void> {
        await super.expectLoaded();
        await expect(this.yesRadio).toBeVisible();
        logger.info('Yes radio visible');
        await expect(this.noRadio).toBeVisible();
        logger.info('No radio visible');
    }

    async expectExplanation(): Promise<void> {
        await expect(this.hint).toBeVisible();
        logger.info('Explanation visible');
        await expect(this.hint).toContainText(
            'the number of hours an employee works in a pay period often or always changes',
        );
        logger.info('Explanation contains text');
        await expect(this.hint).toContainText(
            'periods of at least a week in a leave year where the employee does not need to work and is not paid',
        );
        logger.info('Explanation contains text');
    }

    async expectFormConfiguration(): Promise<void> {
        await expect(this.form).toBeSmartAnswerForm({
            type: 'radio_question',
            action: '/calculate-your-holiday-entitlement/y',
        });
        logger.info('Form configuration visible');
        logger.info('Yes radio visible');
        await expect(this.yesRadio).toHaveValue('irregular-hours-and-part-year');
        logger.info('No radio visible');
        await expect(this.noRadio).toHaveValue('regular');
        logger.info('No radio visible');
    }

    async selectYes(): Promise<void> {
        await this.yesRadio.check();
        logger.info('Yes radio selected');
    }

    async selectNo(): Promise<void> {
        await this.noRadio.check();
        logger.info('No radio selected');
    }

    async expectSelected(answer: 'Yes' | 'No'): Promise<void> {
        await expect(answer === 'Yes' ? this.yesRadio : this.noRadio).toBeChecked();
        await expect(answer === 'Yes' ? this.noRadio : this.yesRadio).not.toBeChecked();
    }

    async expectNoSelection(): Promise<void> {
        await expect(this.yesRadio).not.toBeChecked();
        logger.info('No radio not selected');
        await expect(this.noRadio).not.toBeChecked();
        logger.info('No radio not selected');
    }

    async answer(answer: 'Yes' | 'No'): Promise<void> {
        if (answer === 'Yes') await this.selectYes();
        else await this.selectNo();
        logger.info('Answer selected: %s', answer);
        await this.continue();
        logger.info('Continue button clicked');
        await expect(this.form).toBeHidden();
        logger.info('Form hidden');
    }
}
