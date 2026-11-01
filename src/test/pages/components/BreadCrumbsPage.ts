import {Locator, Page} from '@playwright/test';
import {expect} from '../../../support/assertions';
import {BasePage} from '../base/BasePage';

export class BreadCrumbsPage extends BasePage {
    private readonly breadcrumbsList: Locator;
    private readonly links: Locator;

    constructor(page: Page) {
        super(page);
        this.breadcrumbsList = page
            .getByRole('navigation', {name: 'Breadcrumb', exact: true})
            .getByRole('list');
        this.links = this.breadcrumbsList.getByRole('link');
    }

    async expectTrail(titles: string[]): Promise<void> {
        await expect(this.links).toHaveText(titles);
    }

    async expectLink(title: string, href: string): Promise<void> {
        await expect(
            this.breadcrumbsList.getByRole('link', {name: title, exact: true}),
        ).toHaveAttribute('href', href);
    }
}
