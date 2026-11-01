import {Locator, Page} from '@playwright/test';
import {expect} from '../../support/assertions';
import {BasePage} from './base/BasePage';
import {AnswerSummary} from './components/AnswerSummary';
import logger from '../logger/logger';

/** Shared question controls; route-specific pages supply their own scoped form. */
export abstract class BaseQuestionPage extends BasePage {
    readonly form: Locator;
    readonly currentQuestion: Locator;
    readonly caption: Locator;
    readonly heading: Locator;
    readonly hint: Locator;
    readonly nextInput: Locator;
    readonly continueButton: Locator;
    readonly errors: Locator;
    readonly errorLinks: Locator;
    readonly inlineErrors: Locator;
    readonly answersHeading: Locator;
    readonly startAgainLink: Locator;
    readonly summary: AnswerSummary;

    protected constructor(page: Page, form: Locator) {
        super(page);
        this.form = form;
        this.currentQuestion = form.locator('#current-question');
        this.caption = this.currentQuestion.locator('.govuk-caption-l');
        this.heading = form.getByRole('heading', {level: 1});
        this.hint = form.locator('.govuk-hint');
        this.nextInput = form.locator('input[type="hidden"][name="next"]');
        this.continueButton = form.getByRole('button', {name: 'Continue', exact: true});
        this.errors = this.main.locator('.govuk-error-summary');
        this.errorLinks = this.errors.getByRole('link');
        this.inlineErrors = form.locator('.govuk-error-message');
        this.answersHeading = this.main.getByRole('heading', {name: 'Your answers', exact: true});
        this.summary = new AnswerSummary(page);
        this.startAgainLink = this.summary.restartLink;
    }

    async open(url: string): Promise<void> {
        await this.navigate(url);
        await this.cookies.rejectOptionalCookies();
        await this.expectLoaded();
    }

    async expectLoaded(): Promise<void> {
        await expect(this.form).toBeVisible();
        await expect(this.caption).toHaveText('Calculate holiday entitlement');
        await expect(this.heading).toBeVisible();
        await expect(this.continueButton).toBeVisible();
        logger.info('Base question page loaded');
    }

    async expectQuestion(text: string | RegExp): Promise<void> {
        await expect(this.heading).toHaveText(text);
        logger.info('Expected question');
    }

    async continue(): Promise<void> {
        await this.continueButton.click();
        logger.info('Continue button clicked');
    }

    async expectValidationError(message?: string | RegExp): Promise<void> {
        await expect(this.form).toBeVisible();
        await expect(this.errors).toBeVisible();
        await expect(this.errorLinks.first()).toHaveText(/\S/);
        await expect(this.inlineErrors.first()).toBeVisible();
        if (message !== undefined) await expect(this.inlineErrors.first()).toContainText(message);
        logger.info('Validation error expected');
    }

    async expectNoValidationErrors(): Promise<void> {
        await expect(this.errors).toBeHidden();
        await expect(this.inlineErrors).toHaveCount(0);
        logger.info('No validation errors expected');
    }

    async expectPreviousAnswer(question: string, answer: string): Promise<void> {
        await expect(this.answersHeading).toBeVisible();
        await this.summary.expectAnswer(question, answer);
        logger.info('Previous answer expected');
    }

    async changePreviousAnswer(question: string): Promise<void> {
        await this.summary.change(question);
        logger.info('Previous answer changed');
        await expect(this.form).toBeHidden();
        logger.info('Form hidden after changing previous answer');
    }

    async restart(): Promise<void> {
        await this.summary.restart();
        logger.info('Restart button clicked');
    }
}
