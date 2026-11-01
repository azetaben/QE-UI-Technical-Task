import {Locator, Page} from '@playwright/test';
import {expect} from '../../support/assertions';
import {LandingPage} from './LandingPage';
import logger from "../logger/logger";

/** Calculator landing page supplied under the Statutory leave and time off-topic. */
export class StatutoryLeaveAndTimeOffPage extends LandingPage {
    readonly breadcrumbs: Locator;
    readonly breadcrumbLinks: Locator;
    readonly homeLink: Locator;
    readonly employingPeopleLink: Locator;
    readonly statutoryLeaveBreadcrumbLink: Locator;
    readonly introduction: Locator;
    readonly leaveYearOptions: Locator;
    readonly irregularHoursDescription: Locator;
    readonly exploreTopics: Locator;
    readonly topicLinks: Locator;
    readonly statutoryLeaveTopicLink: Locator;
    readonly holidaysAndTimeOffLink: Locator;
    readonly relatedContent: Locator;
    readonly relatedHeading: Locator;
    readonly relatedLinks: Locator;
    readonly agriculturalHolidayEntitlementLink: Locator;
    readonly holidayEntitlementLink: Locator;
    readonly nightWorkingHoursLink: Locator;
    readonly sundayWorkingLink: Locator;

    constructor(page: Page, url = 'https://www.gov.uk/calculate-your-holiday-entitlement') {
        super(page, url);
        this.breadcrumbs = page.getByRole('navigation', {name: 'Breadcrumb', exact: true});
        this.breadcrumbLinks = this.breadcrumbs.getByRole('link');
        this.homeLink = this.breadcrumbs.getByRole('link', {name: 'Home', exact: true});
        this.employingPeopleLink = this.breadcrumbs.getByRole('link', {
            name: 'Employing people',
            exact: true,
        });
        this.statutoryLeaveBreadcrumbLink = this.breadcrumbs.getByRole('link', {
            name: 'Statutory leave and time off',
            exact: true,
        });
        this.introduction = this.main.getByRole('article').locator('.gem-c-govspeak');
        this.leaveYearOptions = this.introduction.getByRole('listitem');
        this.irregularHoursDescription = this.introduction
            .locator('p')
            .filter({hasText: 'If an employee works irregular hours or for part of the year'});
        this.exploreTopics = this.main.getByRole('navigation', {
            name: 'Explore the topic',
            exact: true,
        });
        this.topicLinks = this.exploreTopics.getByRole('link');
        this.statutoryLeaveTopicLink = this.exploreTopics.getByRole('link', {
            name: 'Statutory leave and time off',
            exact: true,
        });
        this.holidaysAndTimeOffLink = this.exploreTopics.getByRole('link', {
            name: 'Holidays, time off, sick leave, maternity and paternity leave',
            exact: true,
        });
        this.relatedContent = this.main.locator('.gem-c-contextual-sidebar');
        this.relatedHeading = this.relatedContent.getByRole('heading', {
            name: 'Related content',
            exact: true,
        });
        this.relatedLinks = this.relatedContent.getByRole('link');
        this.agriculturalHolidayEntitlementLink = this.relatedContent.getByRole('link', {
            name: 'Calculate your agricultural worker holiday entitlement',
            exact: true,
        });
        this.holidayEntitlementLink = this.relatedContent.getByRole('link', {
            name: 'Holiday entitlement',
            exact: true,
        });
        this.nightWorkingHoursLink = this.relatedContent.getByRole('link', {
            name: 'Night working hours',
            exact: true,
        });
        this.sundayWorkingLink = this.relatedContent.getByRole('link', {
            name: 'Sunday working',
            exact: true,
        });
    }

    relatedLink(title: string): Locator {
        return this.relatedContent.getByRole('link', {name: title, exact: true});
    }

    async expectBreadcrumbTrail(): Promise<void> {
        await expect(this.breadcrumbLinks).toHaveText([
            'Home',
            'Employing people',
            'Statutory leave and time off',
        ]);
        await expect(this.homeLink).toHaveAttribute('href', '/');
        await expect(this.employingPeopleLink).toHaveAttribute('href', '/browse/employing-people');
        await expect(this.statutoryLeaveBreadcrumbLink).toHaveAttribute(
            'href',
            '/browse/employing-people/time-off',
        );
    }

    async expectLeaveYearOptions(): Promise<void> {
        await expect(this.leaveYearOptions).toHaveText([
            'a full leave year',
            'part of a leave year, if the job started or finished part way through the year',
        ]);
        await expect(this.irregularHoursDescription).toBeVisible();
        await expect(this.irregularHoursDescription).toContainText('over a pay period');
    }

    async expectRelatedLink(title: string, href: string): Promise<void> {
        await expect(this.relatedHeading).toBeVisible();
        await expect(this.relatedLink(title)).toBeVisible();
        await expect(this.relatedLink(title)).toHaveAttribute('href', href);
    }

    async expectRelatedContent(): Promise<void> {
        await expect(this.relatedLinks).toHaveCount(4);
        await this.expectRelatedLink(
            'Calculate your agricultural worker holiday entitlement',
            '/calculate-agricultural-holiday-entitlement',
        );
        await this.expectRelatedLink('Holiday entitlement', '/holiday-entitlement-rights');
        await this.expectRelatedLink('Night working hours', '/night-working-hours');
        await this.expectRelatedLink('Sunday working', '/sunday-working');
        logger.info('Statutory leave and time off page related content expected');
    }

    async expectExploreTopics(): Promise<void> {
        await expect(this.topicLinks).toHaveCount(2);
        await this.expectTopicLink(
            'Statutory leave and time off',
            '/browse/employing-people/time-off',
        );
        await this.expectTopicLink(
            'Holidays, time off, sick leave, maternity and paternity leave',
            '/browse/working/time-off',
        );
        logger.info('Statutory leave and time off page explore topics expected');
    }

    async openStatutoryLeaveTopic(): Promise<void> {
        await this.followLink(this.statutoryLeaveTopicLink);
        logger.info('Statutory leave and time off page statutory leave topic opened');
    }

    async openHolidaysAndTimeOffTopic(): Promise<void> {
        await this.followLink(this.holidaysAndTimeOffLink);
        logger.info('Statutory leave and time off page holidays and time off topic opened');
    }

    async openRelatedLink(title: string): Promise<void> {
        await this.followLink(this.relatedLink(title));
        logger.info('Statutory leave and time off page related link opened');
    }
}
