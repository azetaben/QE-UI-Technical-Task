import {Locator, Page} from '@playwright/test';
import {expect} from '../../support/assertions';
import {BaseDateQuestionPage} from './BaseDateQuestionPage';
import logger from '../logger/logger';

export class IrregularHoursAndPartYearPage extends BaseDateQuestionPage {
    readonly fieldset: Locator;
    readonly previousAnswer: Locator;
    readonly changeAnswerLink: Locator;

    constructor(
        page: Page,
        readonly url = 'https://www.gov.uk/calculate-your-holiday-entitlement/y/irregular-hours-and-part-year',
    ) {
        super(
            page,
            page
                .getByRole('main')
                .locator('form[data-question-key="when-does-your-leave-year-start"]'),
        );
        this.fieldset = this.form.getByRole('group', {
            name: 'When does the leave year start?',
            exact: true,
        });
        this.previousAnswer = this.summary
            .row('Does the employee work irregular hours or for part of the year?')
            .locator('.govuk-summary-list__value');
        this.changeAnswerLink = this.summary
            .row('Does the employee work irregular hours or for part of the year?')
            .getByRole('link', {
                name: 'Change Does the employee work irregular hours or for part of the year?',
                exact: true,
            });
    }

    override async open(): Promise<void> {
        await this.navigate(this.url);
        logger.info('Page opened');
        await this.cookies.rejectOptionalCookies();
        logger.info('Cookies rejected');
        await this.expectLoaded();
    }

    override async expectLoaded(): Promise<void> {
        await super.expectLoaded();
        await this.expectPreviousAnswer();
    }

    override async expectPreviousAnswer(): Promise<void> {
        await expect(this.answersHeading).toBeVisible();
        logger.info('Previous answer expected');
        await expect(this.previousAnswer).toHaveText('Yes');
        logger.info('Previous answer expected');
        await expect(this.changeAnswerLink).toBeVisible();
        logger.info('Change answer link expected');
    }

    async expectExplanation(): Promise<void> {
        await expect(this.hint).toBeVisible();
        await expect(this.hint).toContainText('This is usually in the employment contract.');
        await expect(this.hint).toContainText(
            'If the job was started on or before 1 October 1998, the leave year will start on 1 October.',
        );
    }

    override async changePreviousAnswer(): Promise<void> {
        await this.summary.change(
            'Does the employee work irregular hours or for part of the year?',
        );
        await expect(
            this.main.locator('form[data-question-key="regular-or-irregular-hours"]'),
        ).toBeVisible();
    }

    async expectFormConfiguration(): Promise<void> {
        await expect(this.form).toBeSmartAnswerForm({type: 'date_question'});
        logger.info('Form configuration expected');
        await expect(this.dayInput).toHaveAttribute('name', 'response[day]');
        logger.info('Day input expected');
        await expect(this.monthInput).toHaveAttribute('name', 'response[month]');
        logger.info('Month input expected');
        await expect(this.yearInput).toHaveAttribute('name', 'response[year]');
        logger.info('Year input expected');
    }
}
