import {Locator, Page} from '@playwright/test';
import {expect} from '../../support/assertions';
import {BasePage} from './base/BasePage';
import {SearchPage} from './SearchPage';
import logger from "../logger/logger";

/** Header navigation and menu controls from the supplied GOV.UK markup. */
export class TopNavigationPage extends BasePage {
    readonly navigation: Locator;
    readonly logo: Locator;
    readonly menuToggle: Locator;
    readonly menu: Locator;
    readonly servicesAndInformation: Locator;
    readonly servicesHeading: Locator;
    readonly serviceLinks: Locator;
    readonly governmentActivity: Locator;
    readonly governmentHeading: Locator;
    readonly governmentLinks: Locator;
    readonly governmentDescriptions: Locator;
    readonly searchToggle: Locator;
    readonly searchMenu: Locator;
    readonly search: SearchPage;
    readonly benefitsLink: Locator;
    readonly birthsDeathMarriagesAndCareLink: Locator;
    readonly businessAndSelfEmployedLink: Locator;
    readonly childcareAndParentingLink: Locator;
    readonly citizenshipAndLivingInTheUKLink: Locator;
    readonly crimeJusticeAndTheLawLink: Locator;
    readonly disabledPeopleLink: Locator;
    readonly drivingAndTransportLink: Locator;
    readonly educationAndLearningLink: Locator;
    readonly employingPeopleLink: Locator;
    readonly environmentAndCountrysideLink: Locator;
    readonly housingAndLocalServicesLink: Locator;
    readonly moneyAndTaxLink: Locator;
    readonly passportsTravelAndLivingAbroadLink: Locator;
    readonly visasAndImmigrationLink: Locator;
    readonly workingJobsAndPensionsLink: Locator;
    readonly departmentsLink: Locator;
    readonly newsLink: Locator;
    readonly guidanceAndRegulationLink: Locator;
    readonly researchAndStatisticsLink: Locator;
    readonly policyPapersAndConsultationsLink: Locator;
    readonly transparencyLink: Locator;

    constructor(page: Page, search = new SearchPage(page)) {
        super(page);
        this.navigation = page.getByRole('navigation', {name: 'Navigation menu', exact: true});
        this.logo = this.navigation.getByRole('link', {
            name: 'Go to the GOV.UK homepage',
            exact: true,
        });
        this.menuToggle = this.navigation.getByRole('button', {
            name: /^(Show|Hide) navigation menu$/,
        });
        this.menu = this.navigation.locator('#super-navigation-menu');
        this.servicesAndInformation = this.menu.locator(
            '.gem-c-layout-super-navigation-header__column--services-and-information',
        );
        this.servicesHeading = this.servicesAndInformation.getByRole('heading', {
            name: 'Services and information',
            exact: true,
        });
        this.serviceLinks = this.servicesAndInformation.getByRole('link');
        this.governmentActivity = this.menu.locator(
            '.gem-c-layout-super-navigation-header__column--government-activity',
        );
        this.governmentHeading = this.governmentActivity.getByRole('heading', {
            name: 'Government activity',
            exact: true,
        });
        this.governmentLinks = this.governmentActivity.getByRole('link');
        this.governmentDescriptions = this.governmentActivity.locator(
            '.gem-c-layout-super-navigation-header__navigation-second-item-description',
        );
        this.searchToggle = this.navigation.getByRole('button', {
            name: /^(Show|Hide) search menu$/,
        });
        this.searchMenu = this.navigation.locator('#super-search-menu');
        this.search = search;
        this.benefitsLink = this.servicesAndInformation.getByRole('link', {
            name: 'Benefits',
            exact: true,
        });
        this.birthsDeathMarriagesAndCareLink = this.servicesAndInformation.getByRole('link', {
            name: 'Births, death, marriages and care',
            exact: true,
        });
        this.businessAndSelfEmployedLink = this.servicesAndInformation.getByRole('link', {
            name: 'Business and self-employed',
            exact: true,
        });
        this.childcareAndParentingLink = this.servicesAndInformation.getByRole('link', {
            name: 'Childcare and parenting',
            exact: true,
        });
        this.citizenshipAndLivingInTheUKLink = this.servicesAndInformation.getByRole('link', {
            name: 'Citizenship and living in the UK',
            exact: true,
        });
        this.crimeJusticeAndTheLawLink = this.servicesAndInformation.getByRole('link', {
            name: 'Crime, justice and the law',
            exact: true,
        });
        this.disabledPeopleLink = this.servicesAndInformation.getByRole('link', {
            name: 'Disabled people',
            exact: true,
        });
        this.drivingAndTransportLink = this.servicesAndInformation.getByRole('link', {
            name: 'Driving and transport',
            exact: true,
        });
        this.educationAndLearningLink = this.servicesAndInformation.getByRole('link', {
            name: 'Education and learning',
            exact: true,
        });
        this.employingPeopleLink = this.servicesAndInformation.getByRole('link', {
            name: 'Employing people',
            exact: true,
        });
        this.environmentAndCountrysideLink = this.servicesAndInformation.getByRole('link', {
            name: 'Environment and countryside',
            exact: true,
        });
        this.housingAndLocalServicesLink = this.servicesAndInformation.getByRole('link', {
            name: 'Housing and local services',
            exact: true,
        });
        this.moneyAndTaxLink = this.servicesAndInformation.getByRole('link', {
            name: 'Money and tax',
            exact: true,
        });
        this.passportsTravelAndLivingAbroadLink = this.servicesAndInformation.getByRole('link', {
            name: 'Passports, travel and living abroad',
            exact: true,
        });
        this.visasAndImmigrationLink = this.servicesAndInformation.getByRole('link', {
            name: 'Visas and immigration',
            exact: true,
        });
        this.workingJobsAndPensionsLink = this.servicesAndInformation.getByRole('link', {
            name: 'Working, jobs and pensions',
            exact: true,
        });
        this.departmentsLink = this.governmentActivity.getByRole('link', {
            name: 'Departments',
            exact: true,
        });
        this.newsLink = this.governmentActivity.getByRole('link', {name: 'News', exact: true});
        this.guidanceAndRegulationLink = this.governmentActivity.getByRole('link', {
            name: 'Guidance and regulation',
            exact: true,
        });
        this.researchAndStatisticsLink = this.governmentActivity.getByRole('link', {
            name: 'Research and statistics',
            exact: true,
        });
        this.policyPapersAndConsultationsLink = this.governmentActivity.getByRole('link', {
            name: 'Policy papers and consultations',
            exact: true,
        });
        this.transparencyLink = this.governmentActivity.getByRole('link', {
            name: 'Transparency',
            exact: true,
        });
    }

    menuLink(title: string): Locator {
        return this.menu.getByRole('link', {name: title, exact: true});
    }

    async expectHomepageLink(): Promise<void> {
        await expect(this.logo).toBeVisible();
        logger.info('Top navigation page homepage link expected');
        await expect(this.logo).toHaveAttribute('href', '/');
    }

    async goToHomepage(): Promise<void> {
        await this.logo.click();
        logger.info('Top navigation page homepage link clicked');
        await expect(this.page).toHaveURL((url) => url.pathname === '/');
        await expect(this.main).toBeVisible();
        logger.info('Top navigation page homepage opened');
    }

    async setMenuOpen(open: boolean): Promise<void> {
        const expanded = await this.menuToggle.getAttribute('aria-expanded');
        if ((expanded === 'true') !== open) await this.menuToggle.click();
        logger.info('Top navigation page menu toggle clicked');
        await this.expectMenuOpen(open);
        logger.info('Top navigation page menu opened');
    }

    async expectMenuOpen(open: boolean): Promise<void> {
        await expect(this.menuToggle).toHaveAttribute('aria-expanded', String(open));
        if (open) await expect(this.menu).toBeVisible();
        else await expect(this.menu).toBeHidden();
        logger.info('Top navigation page menu sections expected');
    }

    async setSearchOpen(open: boolean): Promise<void> {
        const expanded = await this.searchToggle.getAttribute('aria-expanded');
        if ((expanded === 'true') !== open) await this.searchToggle.click();
        await expect(this.searchToggle).toHaveAttribute('aria-expanded', String(open));
        if (open) {
            await expect(this.searchMenu).toBeVisible();
            await expect(this.search.query).toBeVisible();
        } else await expect(this.searchMenu).toBeHidden();
    }

    async searchFor(term: string): Promise<void> {
        await this.search.searchFor(term);
        logger.info('Top navigation page search performed');
    }

    async expectMenuSections(): Promise<void> {
        await this.setMenuOpen(true);
        await expect(this.servicesHeading).toBeVisible();
        await expect(this.governmentHeading).toBeVisible();
        logger.info('Top navigation page menu sections expected');
    }

    async expectServiceLinks(titles: string[]): Promise<void> {
        await this.setMenuOpen(true);
        logger.info('Top navigation page menu sections opened');
        await expect(this.serviceLinks).toHaveText(titles);
        logger.info('Top navigation page menu service links expected');
    }

    async expectGovernmentLinks(titles: string[]): Promise<void> {
        await this.setMenuOpen(true);
        logger.info('Top navigation page menu sections opened');
        await expect(this.governmentLinks).toHaveText(titles);
        logger.info('Top navigation page menu government links expected');
    }

    async expectMenuLink(title: string, href: string): Promise<void> {
        await this.setMenuOpen(true);
        logger.info('Top navigation page menu sections opened');
        await expect(this.menuLink(title)).toBeVisible();
        await expect(this.menuLink(title)).toHaveAttribute('href', href);
        logger.info('Top navigation page menu link expected');
    }

    async expectGovernmentDescription(title: string, description: string): Promise<void> {
        await this.setMenuOpen(true);
        logger.info('Top navigation page menu sections opened');
        const item = this.governmentActivity
            .getByRole('listitem')
            .filter({has: this.page.getByRole('link', {name: title, exact: true})});
        await expect(item.locator('p')).toHaveText(description);
        logger.info('Top navigation page menu government description expected');
    }

    async openMenuLink(title: string): Promise<void> {
        await this.setMenuOpen(true);
        logger.info('Top navigation page menu sections opened');
        await this.followLink(this.menuLink(title));
        logger.info('Top navigation page menu link followed');
    }
}
