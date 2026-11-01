import {Locator, Page} from '@playwright/test';
import {expect} from '../../support/assertions';
import {LeaveYearPeriodPage} from './LeaveYearPeriodPage';
import logger from '../logger/logger';

/** Annualised-hours route asks for the calculation period, not numeric hours. */
export class AnnualisedHoursPage extends LeaveYearPeriodPage {
    readonly calculationBasisAnswer: Locator;
    readonly changeCalculationBasisLink: Locator;
    readonly basisQuestionForm: Locator;

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
    }

    override async expectLoaded(): Promise<void> {
        await super.expectLoaded();
        await this.expectAnnualisedHoursBasis();
        logger.info('Annualised hours page loaded');
    }

    async expectAnnualisedHoursBasis(): Promise<void> {
        await expect(this.calculationBasisAnswer).toHaveText('annualised hours');
        logger.info('Expected annualised hours basis');
        await expect(this.changeCalculationBasisLink).toBeVisible();
        logger.info('Expected annualised hours basis link visible');
    }

    async changeCalculationBasis(): Promise<void> {
        await this.changeCalculationBasisLink.click();
        logger.info('Change calculation basis link clicked');
        logger.info('Basis question form visible');
        await expect(this.basisQuestionForm).toBeVisible();
    }
}
