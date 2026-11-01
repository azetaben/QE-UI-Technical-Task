import {Locator, Page, Response} from '@playwright/test';
import {expect} from '../../../support/assertions';
import {CookieBanner} from '../components/CookieBanner';
import logger from '../../logger/logger';

/** Shared navigation and page landmarks; domain behaviour belongs to subclasses. */
export abstract class BasePage {
    readonly main: Locator;
    private cookieBanner?: CookieBanner;

    protected constructor(readonly page: Page) {
        this.main = page.getByRole('main');
    }

    get cookies(): CookieBanner {
        logger.info('Cookies banner loaded');
        return (this.cookieBanner ??= new CookieBanner(this.page));
    }

    async navigate(url: string): Promise<void> {
        const response = await this.page.goto(url, {waitUntil: 'domcontentloaded'});
        await this.expectSuccessfulNavigation(response);
        logger.info('Page navigated to: ' + url);
        logger.info('Page loaded');
    }

    async expectHeading(name: string | RegExp): Promise<void> {
        await expect(
            this.main.getByRole('heading', {name, exact: typeof name === 'string'}),
        ).toBeVisible();
        logger.info('Page heading found: ' + name);
    }

    async reload(): Promise<void> {
        await this.expectSuccessfulNavigation(
            await this.page.reload({waitUntil: 'domcontentloaded'}),);
        logger.info('Page reloaded');
    }

    protected async expectSuccessfulNavigation(response: Response | null): Promise<void> {
        if (response && response.status() >= 400) {
            throw new Error(`Navigation failed with HTTP ${response.status()}: ${response.url()}`);
        }
        await expect(this.main).toBeVisible();
        logger.info('Page loaded');
    }

    /** Follow a same-tab link and verify its destination, using Playwright auto-waiting. */
    protected async followLink(link: Locator): Promise<void> {
        const href = await link.getAttribute('href');
        if (!href) throw new Error('Expected a navigation link with an href');
        const destination = new URL(href, this.page.url()).href;
        await link.click();
        logger.info('Link clicked');
        await expect(this.page).toHaveURL(destination);
        logger.info('Page navigated to: ' + destination);
        await expect(this.main).toBeVisible();
        logger.info('Page loaded');
    }
}
