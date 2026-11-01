import {Locator, Page} from '@playwright/test';
import {expect} from '../../support/assertions';
import {BasePage} from './base/BasePage';
import {AnswerSummary} from './components/AnswerSummary';
import logger from '../logger/logger';

export class ResultPage extends BasePage {
    readonly summary: AnswerSummary;
    readonly resultInfo: Locator;
    readonly heading: Locator;
    readonly caption: Locator;
    readonly entitlement: Locator;
    readonly guidance: Locator;
    readonly employerRules: Locator;
    readonly useCalculatorAgainLink: Locator;
    readonly holidayPayLink: Locator;
    readonly detailedGuidanceLink: Locator;
    readonly answersHeading: Locator;
    readonly answerRows: Locator;
    readonly changeAnswerLinks: Locator;
    readonly startAgainLink: Locator;
    readonly resultParagraphs: Locator;
    readonly questionForm: Locator;

    constructor(page: Page) {
        super(page);
        this.summary = new AnswerSummary(page);
        this.resultInfo = this.main.locator('#result-info');
        this.heading = this.resultInfo.getByRole('heading', {
            name: /Information based on your answers/,
            level: 1,
        });
        this.caption = this.heading.locator('.govuk-caption-xl');
        // Regular and pay-period results use different wrappers. Match the statutory
        // entitlement statement within the result, excluding summary answers/guidance.
        this.entitlement = this.resultInfo.locator('p').filter({
            hasText:
                /^The statutory (?:holiday entitlement|entitlement(?: for this pay period)?) is /,
        });
        this.guidance = this.resultInfo.locator('.gem-c-govspeak');
        this.employerRules = this.guidance.getByRole('listitem');
        this.useCalculatorAgainLink = this.guidance.getByRole('link', {
            name: 'use the calculator again',
            exact: true,
        });
        this.holidayPayLink = this.guidance.getByRole('link', {name: 'holiday pay', exact: true});
        this.detailedGuidanceLink = this.guidance.getByRole('link', {
            name: 'Read detailed guidance on how holiday entitlement is calculated',
            exact: true,
        });
        this.answersHeading = this.resultInfo.getByRole('heading', {
            name: 'Your answers',
            exact: true,
        });
        this.answerRows = this.resultInfo.locator('.govuk-summary-list__row');
        this.changeAnswerLinks = this.answerRows.getByRole('link', {name: /^Change/});
        this.startAgainLink = this.resultInfo.getByRole('link', {name: 'Start again', exact: true});
        this.resultParagraphs = this.resultInfo.locator('p');
        this.questionForm = page.locator('form[data-question-key]');
    }

    async expectLoaded(): Promise<void> {
        await expect(this.resultInfo).toBeVisible();
        await expect(this.heading).toBeVisible();
        await expect(this.caption).toHaveText('Calculate holiday entitlement:');
        await expect(this.entitlement).toBeVisible();
        await expect(this.answersHeading).toBeVisible();
        await expect(this.startAgainLink).toBeVisible();
        await expect(this.questionForm).toHaveCount(0);
    }

    async expectEntitlementText(text: string | RegExp): Promise<void> {
        await expect(this.entitlement).toBeVisible();
        await expect(this.entitlement).toHaveText(text);
        logger.info('Result page entitlement text expected');
        await expect(this.questionForm).toHaveCount(0);
        logger.info('Result page form hidden');
    }

    async expectAnswer(question: string, answer: string): Promise<void> {
        await this.summary.expectAnswer(question, answer);
        logger.info('Result page answer expected:' + question);
    }

    async expectAnswerCount(count: number): Promise<void> {
        await expect(this.answerRows).toHaveCount(count);
        logger.info('Result page answer rows expected');
        await expect(this.changeAnswerLinks).toHaveCount(count);
        logger.info('Result page change answer links expected');
    }

    changeAnswerLink(question: string): Locator {
        logger.info('Result page change answer link found');
        return this.answerRows
            .filter({
                has: this.page.getByRole('term').filter({hasText: question}),
            })
            .getByRole('link', {name: /^Change/});
    }

    async changeAnswer(question: string): Promise<void> {
        await this.changeAnswerLink(question).click();
        logger.info('Result page change answer link clicked');
        await expect(this.questionForm).toBeVisible();
        logger.info('Result page form visible');
        await expect(this.resultInfo).toBeHidden();
        logger.info('Result page result info hidden');
    }

    async expectGuidance(): Promise<void> {
        await expect(this.employerRules).toHaveCount(4);
        logger.info('Result page employer rules expected');
        await expect(this.guidance).toContainText(
            'can choose to round up the holiday entitlement, but cannot round it down',
        );
        logger.info('Result page guidance expected');
        await expect(this.holidayPayLink).toHaveAttribute(
            'href',
            '/holiday-entitlement-rights/holiday-pay-the-basics',
        );
        logger.info('Result page holiday pay link expected');
        await expect(this.detailedGuidanceLink).toHaveAttribute(
            'href',
            '/holiday-entitlement-rights',
        );
        logger.info('Result page detailed guidance link expected');
    }

    async useCalculatorAgain(): Promise<void> {
        await this.useCalculatorAgainLink.click();
        logger.info('Result page use calculator again link clicked');
        await expect(this.questionForm).toHaveAttribute(
            'data-question-key',
            'regular-or-irregular-hours',
        );
        await expect(this.questionForm).toBeVisible();
        logger.info('Result page form visible');
    }

    async expectEntitlement(value: number, unit: 'days' | 'hours' | 'weeks'): Promise<void> {
        const number = String(value).replace('.', '\\.');
        const word = unit === 'hours' ? 'hours?' : unit === 'weeks' ? 'weeks?' : 'days?';
        // Match the result paragraph, not a number in the answer summary or guidance.
        await expect(this.entitlement).toBeVisible();
        await expect(
            this.entitlement.filter({
                hasText: new RegExp(
                    `^The statutory (?:holiday entitlement|entitlement(?: for this pay period)?) is ${number} ${word}(?: holiday)?\\.$`,
                ),
            }),
        ).toHaveCount(1);
        await expect(this.questionForm).toHaveCount(0);
        logger.info('Result page entitlement expected');
    }

    /** The entitlement the page actually displays, for comparisons against an oracle. */
    async displayedEntitlement(): Promise<{value: number; unit: string}> {
        await expect(this.entitlement).toHaveCount(1);
        logger.info('Result page entitlement displayed');
        const text = await this.entitlement.innerText();
        const match = / is (\d+(?:\.\d+)?) (days?|hours?|weeks?)\b/.exec(text);
        if (!match) throw new Error(`No entitlement value found in result text: ${text}`);
        return {value: Number(match[1]), unit: match[2].replace(/s$/, '')};
    }

    async restart(): Promise<void> {
        await this.summary.restart();
    }
}
