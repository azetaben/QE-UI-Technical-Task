import {RadioOptions} from './components/RadioOptions';
import {Locator, Page} from '@playwright/test';
import {expect} from '../../support/assertions';
import {BaseQuestionPage} from './BaseQuestionPage';
import logger from '../logger/logger';

export type LeaveYearPeriod = 'full-year' | 'starting' | 'leaving' | 'starting-and-leaving';

/** Full leave year or a partial year based on employment start/end dates. */
export class LeaveYearPeriodPage extends BaseQuestionPage {
    readonly options: RadioOptions;
    readonly fieldset: Locator;
    readonly fullYearRadio: Locator;
    readonly startingRadio: Locator;
    readonly leavingRadio: Locator;
    readonly startingAndLeavingRadio: Locator;
    readonly radios: Locator;
    readonly selectedRadios: Locator;

    constructor(page: Page) {
        super(page, page.getByRole('main').locator('form[data-question-key="calculation-period"]'));
        this.options = new RadioOptions(this.form);
        this.fieldset = this.form.getByRole('group', {
            name: 'Do you want to work out holiday:',
            exact: true,
        });
        this.fullYearRadio = this.options.option('for a full leave year');
        this.startingRadio = this.options.option(
            'for someone starting part way through a leave year',
        );
        this.leavingRadio = this.options.option(
            'for someone leaving part way through a leave year',
        );
        this.startingAndLeavingRadio = this.options.option(
            'for someone starting and leaving part way through a leave year',
        );
        this.radios = this.options.radios;
        this.selectedRadios = this.options.selectedRadios;
    }

    override async expectLoaded(): Promise<void> {
        await super.expectLoaded();
        await expect(this.fullYearRadio).toBeVisible();
        await expect(this.startingRadio).toBeVisible();
        await expect(this.leavingRadio).toBeVisible();
        logger.info('Leave year period page loaded');
        await expect(this.startingAndLeavingRadio).toBeVisible();
    }

    option(period: LeaveYearPeriod): Locator {
        const options: Record<LeaveYearPeriod, Locator> = {
            'full-year': this.fullYearRadio,
            starting: this.startingRadio,
            leaving: this.leavingRadio,
            'starting-and-leaving': this.startingAndLeavingRadio,
        };
        return options[period];
    }

    async selectPeriod(period: LeaveYearPeriod): Promise<void> {
        await this.option(period).check();
        logger.info(`Selected period: ${period}`);
    }

    async selectFullYear(): Promise<void> {
        await this.fullYearRadio.check();
        logger.info('Selected full year');
    }

    async selectStartingPartWay(): Promise<void> {
        await this.startingRadio.check();
        logger.info('Selected starting part way');
    }

    async selectLeavingPartWay(): Promise<void> {
        await this.leavingRadio.check();
        logger.info('Selected leaving part way');
    }

    async selectStartingAndLeavingPartWay(): Promise<void> {
        await this.startingAndLeavingRadio.check();
        logger.info('Selected starting and leaving part way');
    }

    async answer(period: LeaveYearPeriod): Promise<void> {
        await this.selectPeriod(period);
        logger.info(`Answered period: ${period}`);
        await this.continue();
        logger.info('Form submitted');
        await expect(this.form).toBeHidden();
        logger.info('Leave year period page answered');
    }

    async expectOptions(): Promise<void> {
        await expect(this.radios).toHaveCount(4);
        await expect(this.fullYearRadio).toHaveValue('full-year');
        await expect(this.startingRadio).toHaveValue('starting');
        await expect(this.leavingRadio).toHaveValue('leaving');
        await expect(this.startingAndLeavingRadio).toHaveValue('starting-and-leaving');
        await expect(this.fullYearRadio).toBeVisible();
        await expect(this.startingRadio).toBeVisible();
        await expect(this.leavingRadio).toBeVisible();
        await expect(this.startingAndLeavingRadio).toBeVisible();
    }

    async expectFormConfiguration(action?: string): Promise<void> {
        logger.info('Expecting form configuration');
        await expect(this.form).toBeSmartAnswerForm({type: 'radio_question', action});
        logger.info('Form configuration expected');
    }

    async expectSelected(period: LeaveYearPeriod): Promise<void> {
        await expect(this.option(period)).toBeChecked();
        logger.info(`Expected period: ${period}`);
        await expect(this.selectedRadios).toHaveCount(1);
        logger.info(`Expected period: ${period} selected`);
    }

    async expectNoSelection(): Promise<void> {
        await expect(this.selectedRadios).toHaveCount(0);
    }

    async expectHoursBasedAnswers(leaveYearStart: string): Promise<void> {
        await this.expectPreviousAnswer(
            'Does the employee work irregular hours or for part of the year?',
            'Yes',
        );
        await this.expectPreviousAnswer('When does the leave year start?', leaveYearStart);
        await this.expectPreviousAnswer(
            'Is the holiday entitlement based on:',
            'hours worked per week',
        );
        logger.info('Expected hours based answers');
    }
}
