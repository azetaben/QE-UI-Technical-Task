import {Locator, Page} from '@playwright/test';
import logger from "../../logger/logger";

export class CookieBanner {
    readonly cookiesDescription: Locator;
    readonly cookiesAcceptButton: Locator;
    readonly cookiesTitle: Locator;
    readonly cookiesHideButton: Locator;
    readonly cookiesRejectButton: Locator;

    constructor(page: Page) {
        this.cookiesRejectButton = page.getByRole('button', {
            name: 'Reject additional cookies',
            exact: true,
        });
        this.cookiesTitle = page.getByRole('heading', {
            name: 'Cookies on GOV.UK',
            exact: true,
            level: 2,
        });
        this.cookiesDescription = page.getByText(
            'We use some essential cookies to make this website',
        );
        this.cookiesAcceptButton = page.getByRole('button', {
            name: 'Accept additional cookies',
            exact: true,
        });
        this.cookiesHideButton = page.getByRole('button', {
            name: 'Hide cookie message',
            exact: true,
        });
    }

    async rejectOptionalCookies(): Promise<void> {
        if (await this.cookiesRejectButton.isVisible())
            await this.cookiesRejectButton.click();
        if (await this.cookiesHideButton.isVisible())
            await this.cookiesHideButton.click();
        logger.info('Optional cookies rejected');
    }
}
