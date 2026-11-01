import {Locator, Page} from '@playwright/test';
import {expect} from '../../support/assertions';
import {BasePage} from './base/BasePage';
import logger from "../logger/logger";

/** Search result verification and navigation, separate from submitting a search. */
export class SearchResultsPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    result(title: string): Locator {
        return this.main.getByRole('link', {name: title, exact: true});
    }

    async expectResult(title: string): Promise<void> {
        await expect(this.result(title)).toBeVisible();
        logger.info('Search results page result expected');
    }

    async openResult(title: string): Promise<void> {
        await this.followLink(this.result(title));
        logger.info('Search results page result opened');
    }
}
