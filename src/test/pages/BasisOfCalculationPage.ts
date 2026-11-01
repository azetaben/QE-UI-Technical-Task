import {RadioOptions} from './components/RadioOptions';
import {Locator, Page} from '@playwright/test';
import {expect} from '../../support/assertions';
import {BaseQuestionPage} from './BaseQuestionPage';
import {CalculationBasis} from './RegularHoursPage';
import logger from '../logger/logger';

export class BasisOfCalculationPage extends BaseQuestionPage {
    readonly options: RadioOptions;
    readonly fieldset: Locator;
    readonly previousAnswer: Locator;
    readonly changeAnswerLink: Locator;
    readonly daysWorkedPerWeekRadio: Locator;
    readonly hoursWorkedPerWeekRadio: Locator;
    readonly annualisedHoursRadio: Locator;
    readonly compressedHoursRadio: Locator;
    readonly shiftsRadio: Locator;
    readonly radios: Locator;
    readonly selectedRadios: Locator;
    readonly optionLabels: Locator;
    readonly leaveYearAnswer: Locator;
    readonly changeLeaveYearLink: Locator;

    constructor(page: Page) {
        super(page, page.getByRole('main').locator('form[data-question-key="basis-of-calculation"]'));
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
        this.radios = this.options.radios;
        this.selectedRadios = this.options.selectedRadios;
        this.optionLabels = this.options.labels;
        this.leaveYearAnswer = this.summary
            .row('When does the leave year start?')
            .locator('.govuk-summary-list__value');
        this.changeLeaveYearLink = this.summary
            .row('When does the leave year start?')
            .getByRole('link', {name: 'Change When does the leave year start?', exact: true});
    }

    override async expectLoaded(): Promise<void> {
        await super.expectLoaded();
        await expect(this.daysWorkedPerWeekRadio).toBeVisible();
        logger.info('Days worked per week radio visible');
        await expect(this.hoursWorkedPerWeekRadio).toBeVisible();
        logger.info('Hours worked per week radio visible');
        await expect(this.annualisedHoursRadio).toBeVisible();
        logger.info('Annualised hours radio visible');
        await expect(this.compressedHoursRadio).toBeVisible();
        logger.info('Compressed hours radio visible');
        await expect(this.shiftsRadio).toBeVisible();
        logger.info('Shifts radio visible');
        await this.expectPreviousAnswer();
    }

    override async expectPreviousAnswer(): Promise<void> {
        await expect(this.answersHeading).toBeVisible();
        logger.info('Previous answer heading visible');
        await expect(this.previousAnswer).toHaveText('Yes');
        logger.info('Previous answer visible');
        await expect(this.changeAnswerLink).toBeVisible();
    }

    async expectExplanation(): Promise<void> {
        await expect(this.hint).toBeVisible();
        logger.info('Explanation visible');
        // Editorial copy: assert the guidance it gives, not its exact wording.
        await expect(this.hint).toContainText(/employment contract/i);
        logger.info('Explanation contains guidance');
    }

    async expectLeaveYearAnswer(date: string): Promise<void> {
        await expect(this.leaveYearAnswer).toHaveText(date);
        logger.info('Leave year answer visible');
        await expect(this.changeLeaveYearLink).toBeVisible();
    }

    async changeLeaveYear(): Promise<void> {
        await this.changeLeaveYearLink.click();
        await expect(this.main.locator('form[data-question-key="when-does-your-leave-year-start"]')).toBeVisible();
        logger.info('Leave year change form visible');
    }

    async expectNoSelection(): Promise<void> {
        await expect(this.selectedRadios).toHaveCount(0);
        logger.info('No selection visible');
    }

    async expectOptions(): Promise<void> {
        await expect(this.radios).toHaveCount(5);
        await expect(this.optionLabels).toHaveText([
            'days worked per week',
            'hours worked per week',
            'annualised hours',
            'compressed hours',
            'shifts',
        ]);
        logger.info('Options visible');
        await expect(this.daysWorkedPerWeekRadio).toHaveValue('days-worked-per-week');
        logger.info('Days worked per week option visible');
        await expect(this.hoursWorkedPerWeekRadio).toHaveValue('hours-worked-per-week');
        logger.info('Hours worked per week option visible');
        await expect(this.annualisedHoursRadio).toHaveValue('annualised-hours');
        logger.info('Annualised hours option visible');
        await expect(this.compressedHoursRadio).toHaveValue('compressed-hours');
        logger.info('Compressed hours option visible');
        await expect(this.shiftsRadio).toHaveValue('shift-worker');
        logger.info('Shifts option visible');
        await expect(this.nextInput).toHaveValue('1');
    }

    async expectFormConfiguration(action?: string): Promise<void> {
        logger.info('Form configuration visible');
        await expect(this.form).toBeSmartAnswerForm({type: 'radio_question', action});
    }

    async selectDaysWorkedPerWeek(): Promise<void> {
        await this.daysWorkedPerWeekRadio.check();
        logger.info('Days worked per week option selected');
    }

    async selectHoursWorkedPerWeek(): Promise<void> {
        await this.hoursWorkedPerWeekRadio.check();
        logger.info('Hours worked per week option selected');
    }

    async selectAnnualisedHours(): Promise<void> {
        await this.annualisedHoursRadio.check();
        logger.info('Annualised hours option selected');
    }

    async selectCompressedHours(): Promise<void> {
        await this.compressedHoursRadio.check();
        logger.info('Compressed hours option selected');
    }

    async selectShifts(): Promise<void> {
        await this.shiftsRadio.check();
        logger.info('Shifts option selected');
    }

    override async changePreviousAnswer(): Promise<void> {
        await this.summary.change('Does the employee work irregular hours or for part of the year?',);
        logger.info('Previous answer changed');
        await expect(this.main.locator('form[data-question-key="regular-or-irregular-hours"]')).toBeVisible();
        logger.info('Form visible');
    }

    option(basis: CalculationBasis): Locator {
        logger.info(`Option for basis ${basis} selected`);
        return this.options.option(basis);
    }

    async selectBasis(basis: CalculationBasis): Promise<void> {
        logger.info(`Selecting basis ${basis}`);
        await this.options.select(basis);
    }

    async expectSelected(basis: CalculationBasis): Promise<void> {
        await expect(this.option(basis)).toBeChecked();
        logger.info(`Basis ${basis} selected`);
        await expect(this.selectedRadios).toHaveCount(1);
        logger.info(`Basis ${basis} selected`);
    }

    async answer(basis: CalculationBasis): Promise<void> {
        await this.selectBasis(basis);
        logger.info(`Answering with basis ${basis}`);
        await this.continue();
        logger.info('Continuing');
        await expect(this.form).toBeHidden();
        logger.info('Form hidden');
    }
}
