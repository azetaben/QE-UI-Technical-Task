import {RadioOptions} from './components/RadioOptions';
import {Locator, Page} from '@playwright/test';
import {expect} from '../../support/assertions';
import {BaseQuestionPage} from './BaseQuestionPage';
import logger from '../logger/logger';

export type CalculationBasis =
    | 'days worked per week'
    | 'hours worked per week'
    | 'annualised hours'
    | 'compressed hours'
    | 'shifts';

export class RegularHoursPage extends BaseQuestionPage {
    readonly options: RadioOptions;
    readonly fieldset: Locator;
    readonly previousAnswer: Locator;
    readonly changeAnswerLink: Locator;
    readonly daysWorkedPerWeekRadio: Locator;
    readonly hoursWorkedPerWeekRadio: Locator;
    readonly annualisedHoursRadio: Locator;
    readonly compressedHoursRadio: Locator;
    readonly shiftsRadio: Locator;

    constructor(
        page: Page,
        readonly url = 'https://www.gov.uk/calculate-your-holiday-entitlement/y/regular',
    ) {
        super(
            page,
            page.getByRole('main').locator('form[data-question-key="basis-of-calculation"]'),
        );
        this.options = new RadioOptions(this.form);
        this.fieldset = this.form.getByRole('group', {
            name: 'Is the holiday entitlement based on:',
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
        this.daysWorkedPerWeekRadio = this.options.option('days worked per week');
        this.hoursWorkedPerWeekRadio = this.options.option('hours worked per week');
        this.annualisedHoursRadio = this.options.option('annualised hours');
        this.compressedHoursRadio = this.options.option('compressed hours');
        this.shiftsRadio = this.options.option('shifts');
    }

    override async open(): Promise<void> {
        await this.navigate(this.url);
        logger.info('Regular hours page opened');
        await this.cookies.rejectOptionalCookies();
        await this.expectLoaded();
    }

    override async expectLoaded(): Promise<void> {
        await super.expectLoaded();
        await expect(this.daysWorkedPerWeekRadio).toBeVisible();
        await expect(this.hoursWorkedPerWeekRadio).toBeVisible();
        await expect(this.annualisedHoursRadio).toBeVisible();
        await expect(this.compressedHoursRadio).toBeVisible();
        await expect(this.shiftsRadio).toBeVisible();
        await this.expectPreviousAnswer();
    }

    override async expectPreviousAnswer(): Promise<void> {
        await expect(this.answersHeading).toBeVisible();
        await expect(this.previousAnswer).toHaveText('No');
        await expect(this.changeAnswerLink).toBeVisible();
    }

    async expectExplanation(): Promise<void> {
        await expect(this.hint).toBeVisible();
        // Editorial copy: assert the guidance it gives, not its exact wording.
        await expect(this.hint).toContainText(/employment contract/i);
        logger.info('Regular hours page explanation expected');
    }

    override async changePreviousAnswer(): Promise<void> {
        await this.summary.change(
            'Does the employee work irregular hours or for part of the year?',
        );
        logger.info('Clicked the change link');
        await expect(
            this.main.locator('form[data-question-key="regular-or-irregular-hours"]'),
        ).toBeVisible();
    }

    option(basis: CalculationBasis): Locator {
        return this.options.option(basis);
    }

    async selectBasis(basis: CalculationBasis): Promise<void> {
        await this.options.select(basis);
        logger.info('Clicked the basis option');
    }

    async expectSelected(basis: CalculationBasis): Promise<void> {
        await expect(this.option(basis)).toBeChecked();
        logger.info('Regular hours page basis option expected');
    }

    async answer(basis: CalculationBasis): Promise<void> {
        await this.selectBasis(basis);
        logger.info('Regular hours page basis option selected');
        await this.continue();
        logger.info('Regular hours page form continued');
        await expect(this.form).toBeHidden();
        logger.info('Regular hours page form hidden');
    }
}
