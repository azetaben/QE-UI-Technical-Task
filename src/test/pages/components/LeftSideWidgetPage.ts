import {Locator, Page} from '@playwright/test';
import {expect} from '../../../support/assertions';
import {BasePage} from '../base/BasePage';

export class LeftSideWidgetPage extends BasePage {
    private readonly header: Locator;
    private readonly relatedTopicContainer: Locator;

    constructor(page: Page) {
        super(page);
        this.relatedTopicContainer = page.locator('.gem-c-contextual-sidebar');
        this.header = this.relatedTopicContainer.getByRole('heading', {
            name: 'Related content',
            exact: true,
            level: 2,
        });
    }

    async expectRelatedLink(title: string, href: string): Promise<void> {
        await expect(this.header).toBeVisible();
        const link = this.relatedTopicContainer.getByRole('link', {name: title, exact: true});
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('href', href);
    }
}
