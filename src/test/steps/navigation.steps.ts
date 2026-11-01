import {Then, When} from '@cucumber/cucumber';
import {CustomWorld} from '../../hooks/CustomWorld';

Then(
    'the calculator should explain full-year and part-year calculations',
    async function (this: CustomWorld) {
        await this.calculator.landing.expectIntroduction();
    },
);
Then(
    'the breadcrumbs should identify the statutory leave section',
    async function (this: CustomWorld) {
        await this.pages.breadcrumbs.expectTrail([
            'Home',
            'Employing people',
            'Statutory leave and time off',
        ]);
        await this.pages.breadcrumbs.expectLink(
            'Statutory leave and time off',
            '/browse/employing-people/time-off',
        );
    },
);
Then('the header should link to the GOV.UK homepage', async function (this: CustomWorld) {
    await this.pages.navigation.expectHomepageLink();
});
When('I expand and collapse the site navigation menu', async function (this: CustomWorld) {
    await this.pages.navigation.setMenuOpen(true);
    await this.pages.navigation.setMenuOpen(false);
});
Then('the calculator landing page should still be usable', async function (this: CustomWorld) {
    await this.calculator.landing.start();
    await this.calculator.question.expectKey('regular-or-irregular-hours');
});
Then(
    'the related content should link to holiday entitlement guidance',
    async function (this: CustomWorld) {
        await this.pages.relatedContent.expectRelatedLink(
            'Holiday entitlement',
            '/holiday-entitlement-rights',
        );
    },
);
Then(
    'the topic navigation should link to statutory leave and time off',
    async function (this: CustomWorld) {
        await this.calculator.landing.expectTopicLink(
            'Statutory leave and time off',
            '/browse/employing-people/time-off',
        );
    },
);
