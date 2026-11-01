import {Page} from '@playwright/test';
import {LandingPage} from './LandingPage';
import {QuestionPage} from './QuestionPage';
import {ResultPage} from './ResultPage';
import {PARTIAL_YEAR_DAYS_PER_WEEK, PartialPeriod} from '../test_data/Fixtures';
import logger from '../logger/logger';

export interface CalculatorPages {
    readonly landing: LandingPage;
    readonly question: QuestionPage;
    readonly result: ResultPage;
}

/** Scenario journeys composed of page objects; this is not a UI page. */
export class Calculator {
    readonly landing: LandingPage;
    readonly question: QuestionPage;
    readonly result: ResultPage;

    constructor(
        readonly page: Page,
        url: string,
        pages?: CalculatorPages) {
        this.landing = pages?.landing ?? new LandingPage(page, url);
        this.question = pages?.question ?? new QuestionPage(page);
        this.result = pages?.result ?? new ResultPage(page);
    }

    async regular(basis = 'days worked per week'): Promise<void> {
        await this.landing.start();
        logger.info('Landing page started');
        await this.question.answer('No');
        logger.info('Answer selected: No');
        await this.question.answer(basis);
        logger.info('Answer selected: %s', basis);
        await this.question.answer('for a full leave year');
        logger.info('Answer selected: for a full leave year');
        await this.question.expectKey(
            basis === 'days worked per week' ? 'how-many-days-per-week' : 'how-many-hours-per-week',
        );
    }

    async irregularDate(): Promise<void> {
        await this.landing.start();
        logger.info('Landing page started');
        await this.question.answer('Yes');
        logger.info('Answer selected: Yes');
        await this.question.expectKey('when-does-your-leave-year-start');
    }

    async irregular(day = '1', month = '4', year = '2026'): Promise<void> {
        await this.irregularDate();
        logger.info('Irregular date question answered');
        await this.question.date(day, month, year);
        await this.question.continue();
        logger.info('Continue button clicked');
        await this.question.expectKey('hours-in-pay-period');
    }

    async partialPeriod(route: 'starting' | 'leaving' | 'starting-and-leaving'): Promise<void> {
        await this.landing.start();
        logger.info('Landing page started');
        await this.question.answer('No');
        logger.info('Answer selected: No');
        await this.question.answer('days worked per week');
        logger.info('Answer selected: days worked per week');
        const label = route === 'starting-and-leaving' ? 'starting and leaving' : route;
        await this.question.answer(`for someone ${label} part way through a leave year`);
        logger.info('Answer selected: for someone %s part way through a leave year', label);
    }

    async isoDate(iso: string): Promise<void> {
        const [year, month, day] = iso.split('-');
        await this.question.date(String(Number(day)), String(Number(month)), year);
        logger.info('Date question answered: %s', iso);
        await this.question.continue();
        logger.info('Continue button clicked');
    }

    async finishPartial(data: PartialPeriod): Promise<void> {
        await this.partialPeriod(data.route);
        switch (data.route) {
            case 'starting':
                await this.isoDate(data.start);
                logger.info('Date question answered: %s', data.start);
                await this.isoDate(data.leaveYear);
                logger.info('Date question answered: %s', data.leaveYear);
                break;
            case 'leaving':
                await this.isoDate(data.end);
                logger.info('Date question answered: %s', data.end);
                await this.isoDate(data.leaveYear);
                logger.info('Date question answered: %s', data.leaveYear);
                break;
            case 'starting-and-leaving':
                await this.isoDate(data.start);
                logger.info('Date question answered: %s', data.start);
                await this.isoDate(data.end);
                logger.info('Date question answered: %s', data.end);
                break;
        }
        await this.question.expectKey('how-many-days-per-week');
        logger.info('Question key expected: how-many-days-per-week');
        await this.question.number(String(PARTIAL_YEAR_DAYS_PER_WEEK));
        logger.info('Number question answered: %s', PARTIAL_YEAR_DAYS_PER_WEEK);
    }
}
