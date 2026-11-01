import {Then, When} from '@cucumber/cucumber';
import {expect} from '../../support/assertions';
import {CustomWorld} from '../../hooks/CustomWorld';

When('I search GOV.UK for {string}', async function (this: CustomWorld, term: string) {
    await this.pages.search.searchFor(term);
});
Then(
    'the search results should include {string}',
    async function (this: CustomWorld, title: string) {
        await this.pages.searchResults.expectResult(title);
    },
);
When('I open the search result {string}', async function (this: CustomWorld, title: string) {
    await this.pages.searchResults.openResult(title);
});
Then('the holiday calculator landing page should be displayed', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(this.options.baseURL);
    await this.calculator.landing.expectHeading('Calculate holiday entitlement');
});
When('I open site-wide search', async function (this: CustomWorld) {
    await this.pages.search.openSearch();
});
Then('the site-wide search input should be available', async function (this: CustomWorld) {
    await expect(this.pages.search.query).toBeVisible();
    await expect(this.pages.search.query).toHaveAttribute('name', 'keywords');
});
Then('the worker-type question should remain unanswered', async function (this: CustomWorld) {
    await this.calculator.question.expectKey('regular-or-irregular-hours');
    await expect(this.calculator.question.form.locator('input:checked')).toHaveCount(0);
});
