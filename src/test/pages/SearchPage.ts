import {Locator, Page} from '@playwright/test';
import {expect} from '../../support/assertions';
import {BasePage} from './base/BasePage';
import logger from "../logger/logger";

/** Site-wide search UI from the supplied header outerHTML. */
export class SearchPage extends BasePage {
    readonly form: Locator;
    readonly query: Locator;
    readonly toggle: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
        super(page);
        this.form = page.getByRole('search', {name: 'Site-wide', exact: true});
        this.query = this.form.getByRole('combobox', {name: 'Search GOV.UK', exact: true});
        this.submitButton = this.form.getByRole('button', {name: 'Search', exact: true});
        this.toggle = page.getByRole('button', {name: 'Show search menu', exact: true});
    }

    async openSearch(): Promise<void> {
        if (!(await this.form.isVisible()))
            logger.info('Search page search form not visible');
            await this.toggle.click();
        logger.info('Search page search form visible');
        await expect(this.query).toBeVisible();
    }

    async searchFor(term: string): Promise<void> {
        if (!term.trim()) throw new Error('Search term cannot be empty');
        await this.openSearch();
        await this.query.fill(term);
        logger.info('Search page search term entered');
        await this.submitButton.click();
        logger.info('Search page search submitted');
        await expect(this.page).toHaveURL(
            (url) => url.pathname === '/search/all' && url.searchParams.get('keywords') === term,
        );
    }
}
