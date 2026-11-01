import {Locator, Page} from '@playwright/test';
import {expect} from '../../support/assertions';
import {BasePage} from './base/BasePage';
import logger from '../logger/logger';

export class LandingPage extends BasePage {
    private readonly header: Locator;
    private readonly pageContent: Locator;
    private readonly startButton: Locator;
    private readonly exploreTopicContainer: Locator;
    private readonly initialQuestionForm: Locator;

    constructor(
        page: Page,
        readonly url: string,
    ) {
        super(page);
        this.header = page.getByRole('heading', {
            name: 'Calculate holiday entitlement',
            exact: true,
            level: 1,
        });
        this.initialQuestionForm = page.locator(
            'form[data-question-key="regular-or-irregular-hours"]',
        );
        this.pageContent = this.main.locator('.gem-c-govspeak');
        this.startButton = page.getByRole('button', {name: 'Start now', exact: true});
        this.exploreTopicContainer = this.main.getByRole('navigation', {
            name: 'Explore the topic',
            exact: true,
        });
    }

    async open(): Promise<void> {
        await this.navigate(this.url);
        await expect(this.header).toBeVisible();
        await this.cookies.rejectOptionalCookies();
    }

    async start(): Promise<void> {
        // The supplied outerHTML uses an anchor with role="button".
        await this.startButton.click();
        logger.info('Start button clicked');
        await expect(this.initialQuestionForm).toBeVisible();
    }

    async expectIntroduction(): Promise<void> {
        await expect(this.pageContent).toContainText('a full leave year');
        logger.info('Introduction expected');
        await expect(this.pageContent).toContainText('part of a leave year');
    }

    async expectTopicLink(title: string, href: string): Promise<void> {
        const link = this.exploreTopicContainer.getByRole('link', {name: title, exact: true});
        await expect(link).toBeVisible();
        logger.info('Topic link expected');
        await expect(link).toHaveAttribute('href', href);
    }
}
