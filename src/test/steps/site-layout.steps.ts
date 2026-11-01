import {DataTable, Then, When} from '@cucumber/cucumber';
import {CustomWorld} from '../../hooks/CustomWorld';

When(/^I (open|close) the navigation menu$/, async function (this: CustomWorld, action: string) {
    await this.pages.navigation.setMenuOpen(action === 'open');
});

Then(
    /^the navigation menu should be (open|closed)$/,
    async function (this: CustomWorld, state: string) {
        await this.pages.navigation.expectMenuOpen(state === 'open');
    },
);

Then(
    'the navigation menu should show its service and government sections',
    async function (this: CustomWorld) {
        await this.pages.navigation.expectMenuSections();
    },
);

Then(
    'the navigation menu link {string} should point to {string}',
    async function (this: CustomWorld, title: string, href: string) {
        await this.pages.navigation.expectMenuLink(title, href);
    },
);

When('I follow navigation menu link {string}', async function (this: CustomWorld, title: string) {
    await this.pages.navigation.openMenuLink(title);
});

When('I follow the GOV.UK header logo', async function (this: CustomWorld) {
    await this.pages.navigation.goToHomepage();
});

When('I close site-wide search', async function (this: CustomWorld) {
    await this.pages.navigation.setSearchOpen(false);
});

Then(
    'the footer should be displayed with licence and copyright information',
    async function (this: CustomWorld) {
        await this.pages.footer.scrollIntoView();
        await this.pages.footer.expectVisible();
        await this.pages.footer.expectLicenceAndCopyright();
    },
);

Then(
    'the footer link {string} should point to {string}',
    async function (this: CustomWorld, title: string, href: string) {
        await this.pages.footer.expectLink(title, href);
    },
);

Then(
    'the footer should list these support links in order:',
    async function (this: CustomWorld, table: DataTable) {
        await this.pages.footer.expectSupportLinks(table.raw().map(([title]) => title));
    },
);

When('I follow footer link {string}', async function (this: CustomWorld, title: string) {
    await this.pages.footer.openLink(title);
});

Then('the feedback prompt should be in its initial state', async function (this: CustomWorld) {
    await this.pages.feedback.scrollIntoView();
    await this.pages.feedback.expectInitialState();
});

// Feedback submissions intentionally remain outside automatic coverage scenarios.
When('I report a problem using the feedback prompt', async function (this: CustomWorld) {
    await this.pages.feedback.reportProblem();
});

Then('the feedback question should be hidden', async function (this: CustomWorld) {
    await this.pages.feedback.expectPromptHidden();
});

Then(
    'the landing page should list the supported leave year options',
    async function (this: CustomWorld) {
        await this.pages.statutoryLeave.expectLeaveYearOptions();
    },
);

Then('the landing page should show all related content links', async function (this: CustomWorld) {
    await this.pages.statutoryLeave.expectRelatedContent();
});

Then('the landing page should show both explore topic links', async function (this: CustomWorld) {
    await this.pages.statutoryLeave.expectExploreTopics();
});

When('I follow related content link {string}', async function (this: CustomWorld, title: string) {
    await this.pages.statutoryLeave.openRelatedLink(title);
});

When('I explore the statutory leave and time off topic', async function (this: CustomWorld) {
    await this.pages.statutoryLeave.openStatutoryLeaveTopic();
});

Then(
    'the breadcrumb link {string} should point to {string}',
    async function (this: CustomWorld, title: string, href: string) {
        await this.pages.breadcrumbs.expectLink(title, href);
    },
);

Then(
    'the related content link {string} should point to {string}',
    async function (this: CustomWorld, title: string, href: string) {
        await this.pages.relatedContent.expectRelatedLink(title, href);
    },
);
