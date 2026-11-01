import {Locator, Page} from '@playwright/test';
import {expect} from '../../support/assertions';
import {HoursWorkedPerWeekPage} from './HoursWorkedPerWeekPage';
import logger from '../logger/logger';

/** Compressed hours use the weekly-hours question, followed by working days. */
export class CompressedHoursPage extends HoursWorkedPerWeekPage {
    readonly calculationBasisAnswer: Locator;
    readonly changeCalculationBasisLink: Locator;
    readonly basisQuestionForm: Locator;
    readonly workingDaysForm: Locator;

    constructor(page: Page) {
        super(page);
        const row = this.summary.row('Is the holiday entitlement based on:');
        this.calculationBasisAnswer = row.locator('.govuk-summary-list__value');
        this.changeCalculationBasisLink = row.getByRole('link', {
            name: 'Change Is the holiday entitlement based on:',
            exact: true,
        });
        this.basisQuestionForm = this.main.locator(
            'form[data-question-key="basis-of-calculation"]',
        );
        this.workingDaysForm = this.main.locator(
            'form[data-question-key="how-many-days-per-week-for-hours"]',
        );
    }

    override async expectLoaded(): Promise<void> {
        await super.expectLoaded();
        await this.expectCompressedHoursBasis();
        logger.info('Compressed hours page loaded');
    }

    async expectCompressedHoursBasis(): Promise<void> {
        await expect(this.calculationBasisAnswer).toHaveText('compressed hours');
        logger.info('Compressed hours basis expected');
        await expect(this.changeCalculationBasisLink).toBeVisible();
        logger.info('Change calculation basis link visible');
    }

    async changeCalculationBasis(): Promise<void> {
        await this.changeCalculationBasisLink.click();
        logger.info('Change calculation basis link clicked');
        await expect(this.basisQuestionForm).toBeVisible();
        logger.info('Basis question form visible');
    }

    override async submitHours(value: string): Promise<void> {
        await super.submitHours(value);
        logger.info('Hours submitted');
        await expect(this.workingDaysForm).toBeVisible();
        logger.info('Working days form visible');
    }
}
