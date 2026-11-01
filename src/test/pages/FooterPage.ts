import {Locator, Page} from '@playwright/test';
import {expect} from '../../support/assertions';
import {BasePage} from './base/BasePage';
import logger from '../logger/logger';

/** Shared GOV.UK footer; all locators are scoped to the footer landmark. */
export class FooterPage extends BasePage {
    readonly footer: Locator;
    readonly crown: Locator;
    readonly servicesHeading: Locator;
    readonly governmentHeading: Locator;
    readonly supportHeading: Locator;
    readonly serviceLinks: Locator;
    readonly governmentLinks: Locator;
    readonly supportLinks: Locator;
    readonly allLinks: Locator;
    readonly licenceLogo: Locator;
    readonly licenceDescription: Locator;
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
    readonly howGovernmentWorksLink: Locator;
    readonly getInvolvedLink: Locator;
    readonly helpLink: Locator;
    readonly privacyLink: Locator;
    readonly cookiesLink: Locator;
    readonly accessibilityStatementLink: Locator;
    readonly contactLink: Locator;
    readonly termsAndConditionsLink: Locator;
    readonly welshServicesLink: Locator;
    readonly governmentDigitalServiceLink: Locator;
    readonly openGovernmentLicenceLink: Locator;
    readonly crownCopyrightLink: Locator;

    constructor(page: Page) {
        super(page);
        this.footer = page.getByRole('contentinfo');
        this.crown = this.footer.locator('.govuk-footer__crown');
        this.servicesHeading = this.footer.getByRole('heading', {
            name: 'Services and information',
            exact: true,
        });
        this.governmentHeading = this.footer.getByRole('heading', {
            name: 'Government activity',
            exact: true,
        });
        this.supportHeading = this.footer.getByRole('heading', {
            name: 'Support links',
            exact: true,
        });
        this.serviceLinks = this.footer.locator('.govuk-footer__list--columns-2').getByRole('link');
        this.governmentLinks = this.footer
            .locator('.govuk-footer__list--columns-1')
            .getByRole('link');
        this.supportLinks = this.footer.locator('.govuk-footer__inline-list').getByRole('link');
        this.allLinks = this.footer.getByRole('link');
        this.licenceLogo = this.footer.locator('.govuk-footer__licence-logo');
        this.licenceDescription = this.footer.locator('.govuk-footer__licence-description');
        this.benefitsLink = this.footer.getByRole('link', {name: 'Benefits', exact: true});
        this.birthsDeathMarriagesAndCareLink = this.footer.getByRole('link', {
            name: 'Births, death, marriages and care',
            exact: true,
        });
        this.businessAndSelfEmployedLink = this.footer.getByRole('link', {
            name: 'Business and self-employed',
            exact: true,
        });
        this.childcareAndParentingLink = this.footer.getByRole('link', {
            name: 'Childcare and parenting',
            exact: true,
        });
        this.citizenshipAndLivingInTheUKLink = this.footer.getByRole('link', {
            name: 'Citizenship and living in the UK',
            exact: true,
        });
        this.crimeJusticeAndTheLawLink = this.footer.getByRole('link', {
            name: 'Crime, justice and the law',
            exact: true,
        });
        this.disabledPeopleLink = this.footer.getByRole('link', {
            name: 'Disabled people',
            exact: true,
        });
        this.drivingAndTransportLink = this.footer.getByRole('link', {
            name: 'Driving and transport',
            exact: true,
        });
        this.educationAndLearningLink = this.footer.getByRole('link', {
            name: 'Education and learning',
            exact: true,
        });
        this.employingPeopleLink = this.footer.getByRole('link', {
            name: 'Employing people',
            exact: true,
        });
        this.environmentAndCountrysideLink = this.footer.getByRole('link', {
            name: 'Environment and countryside',
            exact: true,
        });
        this.housingAndLocalServicesLink = this.footer.getByRole('link', {
            name: 'Housing and local services',
            exact: true,
        });
        this.moneyAndTaxLink = this.footer.getByRole('link', {name: 'Money and tax', exact: true});
        this.passportsTravelAndLivingAbroadLink = this.footer.getByRole('link', {
            name: 'Passports, travel and living abroad',
            exact: true,
        });
        this.visasAndImmigrationLink = this.footer.getByRole('link', {
            name: 'Visas and immigration',
            exact: true,
        });
        this.workingJobsAndPensionsLink = this.footer.getByRole('link', {
            name: 'Working, jobs and pensions',
            exact: true,
        });
        this.departmentsLink = this.footer.getByRole('link', {name: 'Departments', exact: true});
        this.newsLink = this.footer.getByRole('link', {name: 'News', exact: true});
        this.guidanceAndRegulationLink = this.footer.getByRole('link', {
            name: 'Guidance and regulation',
            exact: true,
        });
        this.researchAndStatisticsLink = this.footer.getByRole('link', {
            name: 'Research and statistics',
            exact: true,
        });
        this.policyPapersAndConsultationsLink = this.footer.getByRole('link', {
            name: 'Policy papers and consultations',
            exact: true,
        });
        this.transparencyLink = this.footer.getByRole('link', {name: 'Transparency', exact: true});
        this.howGovernmentWorksLink = this.footer.getByRole('link', {
            name: 'How government works',
            exact: true,
        });
        this.getInvolvedLink = this.footer.getByRole('link', {name: 'Get involved', exact: true});
        this.helpLink = this.footer.getByRole('link', {name: 'Help', exact: true});
        this.privacyLink = this.footer.getByRole('link', {name: 'Privacy', exact: true});
        this.cookiesLink = this.footer.getByRole('link', {name: 'Cookies', exact: true});
        this.accessibilityStatementLink = this.footer.getByRole('link', {
            name: 'Accessibility statement',
            exact: true,
        });
        this.contactLink = this.footer.getByRole('link', {name: 'Contact', exact: true});
        this.termsAndConditionsLink = this.footer.getByRole('link', {
            name: 'Terms and conditions',
            exact: true,
        });
        this.welshServicesLink = this.footer.getByRole('link', {
            name: 'Rhestr o Wasanaethau Cymraeg',
            exact: true,
        });
        this.governmentDigitalServiceLink = this.footer.getByRole('link', {
            name: 'Government Digital Service',
            exact: true,
        });
        this.openGovernmentLicenceLink = this.footer.getByRole('link', {
            name: 'Open Government Licence v3.0',
            exact: true,
        });
        this.crownCopyrightLink = this.footer.getByRole('link', {
            name: '© Crown copyright',
            exact: true,
        });
    }

    link(title: string): Locator {
        return this.footer.getByRole('link', {name: title, exact: true});
    }

    async scrollIntoView(): Promise<void> {
        await this.footer.scrollIntoViewIfNeeded();
    }

    async expectVisible(): Promise<void> {
        await expect(this.footer).toBeVisible();
        logger.info('Footer is visible');
        await expect(this.crown).toBeVisible();
        logger.info('Crown copyright link is visible');
        await expect(this.servicesHeading).toBeVisible();
        logger.info('Services heading is visible');
        await expect(this.governmentHeading).toBeVisible();
        logger.info('Government heading is visible');
        // The supplied support heading is intentionally visually hidden.
        await expect(this.supportHeading).toHaveText('Support links');
        logger.info('Support heading is visible');
    }

    async expectServiceLinks(titles: string[]): Promise<void> {
        await expect(this.serviceLinks).toHaveText(titles);
        logger.info('Service links are visible');
    }

    async expectGovernmentLinks(titles: string[]): Promise<void> {
        await expect(this.governmentLinks).toHaveText(titles);
        logger.info('Government links are visible');
    }

    async expectSupportLinks(titles: string[]): Promise<void> {
        await expect(this.supportLinks).toHaveText(titles);
        logger.info('Support links are visible');
    }

    async expectLink(title: string, href: string): Promise<void> {
        await expect(this.link(title)).toBeVisible();
        logger.info('Link is visible');
        await expect(this.link(title)).toHaveAttribute('href', href);
        logger.info('Link has correct href');
    }

    async expectLinkCounts(): Promise<void> {
        await expect(this.serviceLinks).toHaveCount(16);
        logger.info('Service links count is correct');
        await expect(this.governmentLinks).toHaveCount(8);
        logger.info('Government links count is correct');
        await expect(this.supportLinks).toHaveCount(8);
        logger.info('Support links count is correct');
        await expect(this.allLinks).toHaveCount(34);
        logger.info('All links count is correct');
    }

    async expectLicenceAndCopyright(): Promise<void> {
        await expect(this.licenceLogo).toBeVisible();
        logger.info('Licence logo is visible');
        await expect(this.licenceDescription).toHaveText(
            'All content is available under the Open Government Licence v3.0, except where otherwise stated',
        );
        logger.info('Licence description is correct');
        await this.expectLink(
            'Open Government Licence v3.0',
            'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/',
        );
        logger.info('Open Government Licence link is correct');
        await expect(this.openGovernmentLicenceLink).toHaveAttribute('rel', 'license');
        logger.info('Open Government Licence link has correct rel attribute');
        await this.expectLink(
            '© Crown copyright',
            'https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/',
        );
        logger.info('Crown copyright link is correct');
    }

    async expectWelshServicesLink(): Promise<void> {
        await this.expectLink('Rhestr o Wasanaethau Cymraeg', '/cymraeg');
        logger.info('Welsh services link is correct');
        await expect(this.welshServicesLink).toHaveAttribute('lang', 'cy');
        logger.info('Welsh services link has correct lang attribute');
    }

    async openLink(title: string): Promise<void> {
        await this.followLink(this.link(title));
        logger.info('Link opened');
    }
}
