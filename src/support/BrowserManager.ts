import {Browser, BrowserContext, chromium, firefox, webkit} from '@playwright/test';
import {TestOptions} from '../../test-options';
import logger from "../test/logger/logger";

/** One browser per Cucumber worker, one context per scenario. */
export class BrowserManager {
    private browser?: Browser;

    constructor(private readonly options: TestOptions) {}

    async launch(): Promise<void> {
        if (this.browser?.isConnected()) return;
        this.browser = await {chromium, firefox, webkit}[this.options.browser].launch({
            headless: this.options.headless,
            channel: this.options.channel,
        });
        logger.info('Custom world browser launched');
    }

    async newContext(): Promise<BrowserContext> {
        if (!this.browser) throw new Error('Browser must be launched before creating a scenario');
        const context = await this.browser.newContext({
            viewport: this.options.viewport,
            locale: 'en-GB',
            timezoneId: 'Europe/London',
        });
        context.setDefaultTimeout(this.options.actionTimeout);
        context.setDefaultNavigationTimeout(this.options.navigationTimeout);
        return context;
    }

    version(): string {
        return this.browser?.version() ?? 'not launched';
    }

    async close(): Promise<void> {
        const browser = this.browser;
        this.browser = undefined;
        await browser?.close();
        logger.info('Custom world browser closed');
    }
}
