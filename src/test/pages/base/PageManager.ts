import {Page} from '@playwright/test';
import {CompressedHoursPage} from '../CompressedHoursPage';
import {AnnualisedHoursPage} from '../AnnualisedHoursPage';
import {EmploymentEndDatePage} from '../EmploymentEndDatePage';
import {EmploymentStartDatePage} from '../EmploymentStartDatePage';
import {DaysWorkedPerWeekForHoursPage} from '../DaysWorkedPerWeekForHoursPage';
import {HoursWorkedPerWeekPage} from '../HoursWorkedPerWeekPage';
import {LeaveYearPeriodPage} from '../LeaveYearPeriodPage';
import {BasisOfCalculationPage} from '../BasisOfCalculationPage';
import {DaysWorkedPerWeekPage} from '../DaysWorkedPerWeekPage';
import {FeedbackPage} from '../components/FeedbackPage';
import {HoursInPayPeriodPage} from '../HoursInPayPeriodPage';
import {IrregularHoursAndPartYearPage} from '../IrregularHoursAndPartYearPage';
import {RegularHoursPage} from '../RegularHoursPage';
import {FooterPage} from '../FooterPage';
import {CalculateHolidayEntitlementPage} from '../CalculateHolidayEntitlementPage';
import {StatutoryLeaveAndTimeOffPage} from '../StatutoryLeaveAndTimeOffPage';
import {Calculator} from '../CalculatorPage';
import {SearchPage} from '../SearchPage';
import {SearchResultsPage} from '../SearchResultsPage';
import {TopNavigationPage} from '../TopNavigationPage';
import {BreadCrumbsPage} from '../components/BreadCrumbsPage';
import {LeftSideWidgetPage} from '../components/LeftSideWidgetPage';
import {LandingPage} from '../LandingPage';
import {QuestionPage} from '../QuestionPage';
import {ResultPage} from '../ResultPage';

interface PageObjects {
    landing: LandingPage;
    question: QuestionPage;
    result: ResultPage;
    calculator: Calculator;
    compressedHours: CompressedHoursPage;
    annualisedHours: AnnualisedHoursPage;
    employmentEndDate: EmploymentEndDatePage;
    employmentStartDate: EmploymentStartDatePage;
    daysWorkedPerWeekForHours: DaysWorkedPerWeekForHoursPage;
    hoursWorkedPerWeek: HoursWorkedPerWeekPage;
    leaveYearPeriod: LeaveYearPeriodPage;
    basisOfCalculation: BasisOfCalculationPage;
    hoursInPayPeriod: HoursInPayPeriodPage;
    daysWorkedPerWeek: DaysWorkedPerWeekPage;
    irregularHours: IrregularHoursAndPartYearPage;
    regularHours: RegularHoursPage;
    calculateHolidayEntitlement: CalculateHolidayEntitlementPage;
    statutoryLeave: StatutoryLeaveAndTimeOffPage;
    search: SearchPage;
    searchResults: SearchResultsPage;
    navigation: TopNavigationPage;
    footer: FooterPage;
    feedback: FeedbackPage;
    breadcrumbs: BreadCrumbsPage;
    relatedContent: LeftSideWidgetPage;
}

/** One typed, lazily constructed instance of each page per scenario.
 * Owns no browser/context lifecycle; independent managers never share state. */
export class PageManager {
    readonly baseURL: string;
    private readonly instances: Partial<PageObjects> = {};


    constructor(
        readonly page: Page,
        calculatorURL: string,
    ) {
        this.baseURL = calculatorURL.replace(/\/+$/, '');
    }

    get landing(): LandingPage {
        return this.getOrCreate('landing', () => new LandingPage(this.page, this.baseURL));
    }

    get question(): QuestionPage {
        return this.getOrCreate('question', () => new QuestionPage(this.page));
    }

    get result(): ResultPage {
        return this.getOrCreate('result', () => new ResultPage(this.page));
    }

    get calculator(): Calculator {
        return this.getOrCreate(
            'calculator',
            () =>
                new Calculator(this.page, this.baseURL, {
                    landing: this.landing,
                    question: this.question,
                    result: this.result,
                }),
        );
    }

    get compressedHours(): CompressedHoursPage {
        return this.getOrCreate('compressedHours', () => new CompressedHoursPage(this.page));
    }

    get annualisedHours(): AnnualisedHoursPage {
        return this.getOrCreate('annualisedHours', () => new AnnualisedHoursPage(this.page));
    }

    get employmentEndDate(): EmploymentEndDatePage {
        return this.getOrCreate('employmentEndDate', () => new EmploymentEndDatePage(this.page));
    }

    get employmentStartDate(): EmploymentStartDatePage {
        return this.getOrCreate(
            'employmentStartDate',
            () => new EmploymentStartDatePage(this.page),
        );
    }

    get daysWorkedPerWeekForHours(): DaysWorkedPerWeekForHoursPage {
        return this.getOrCreate(
            'daysWorkedPerWeekForHours',
            () => new DaysWorkedPerWeekForHoursPage(this.page),
        );
    }

    get hoursWorkedPerWeek(): HoursWorkedPerWeekPage {
        return this.getOrCreate('hoursWorkedPerWeek', () => new HoursWorkedPerWeekPage(this.page));
    }

    get leaveYearPeriod(): LeaveYearPeriodPage {
        return this.getOrCreate('leaveYearPeriod', () => new LeaveYearPeriodPage(this.page));
    }

    get basisOfCalculation(): BasisOfCalculationPage {
        return this.getOrCreate('basisOfCalculation', () => new BasisOfCalculationPage(this.page));
    }

    get hoursInPayPeriod(): HoursInPayPeriodPage {
        return this.getOrCreate('hoursInPayPeriod', () => new HoursInPayPeriodPage(this.page));
    }

    get daysWorkedPerWeek(): DaysWorkedPerWeekPage {
        return this.getOrCreate('daysWorkedPerWeek', () => new DaysWorkedPerWeekPage(this.page));
    }

    get irregularHours(): IrregularHoursAndPartYearPage {
        return this.getOrCreate(
            'irregularHours',
            () =>
                new IrregularHoursAndPartYearPage(
                    this.page,
                    this.route('y/irregular-hours-and-part-year'),
                ),
        );
    }

    get regularHours(): RegularHoursPage {
        return this.getOrCreate(
            'regularHours',
            () => new RegularHoursPage(this.page, this.route('y/regular')),
        );
    }

    get calculateHolidayEntitlement(): CalculateHolidayEntitlementPage {
        return this.getOrCreate(
            'calculateHolidayEntitlement',
            () => new CalculateHolidayEntitlementPage(this.page, this.route('y')),
        );
    }

    get statutoryLeave(): StatutoryLeaveAndTimeOffPage {
        return this.getOrCreate(
            'statutoryLeave',
            () => new StatutoryLeaveAndTimeOffPage(this.page, this.baseURL),
        );
    }

    get search(): SearchPage {
        return this.getOrCreate('search', () => new SearchPage(this.page));
    }

    get searchResults(): SearchResultsPage {
        return this.getOrCreate('searchResults', () => new SearchResultsPage(this.page));
    }

    get navigation(): TopNavigationPage {
        return this.getOrCreate('navigation', () => new TopNavigationPage(this.page, this.search));
    }

    get footer(): FooterPage {
        return this.getOrCreate('footer', () => new FooterPage(this.page));
    }

    get feedback(): FeedbackPage {
        return this.getOrCreate('feedback', () => new FeedbackPage(this.page));
    }

    get breadcrumbs(): BreadCrumbsPage {
        return this.getOrCreate('breadcrumbs', () => new BreadCrumbsPage(this.page));
    }

    get relatedContent(): LeftSideWidgetPage {
        return this.getOrCreate('relatedContent', () => new LeftSideWidgetPage(this.page));
    }

    private route(path: string): string {
        return new URL(path, this.baseURL + '/').href;
    }

    private getOrCreate<K extends keyof PageObjects>(
        key: K,
        create: () => PageObjects[K],
    ): PageObjects[K] {
        const existing = this.instances[key];
        if (existing) return existing;
        const instance = create();
        this.instances[key] = instance;
        return instance;
    }
}
