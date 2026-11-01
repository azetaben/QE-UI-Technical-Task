import {Then, When} from '@cucumber/cucumber';
import {CustomWorld} from '../../hooks/CustomWorld';
import {namedPage, questionPages} from './page-targets';

Then(
    'the {string} calculator page should be displayed',
    async function (this: CustomWorld, name: string) {
        await namedPage(questionPages(this.pages), name).expectLoaded();
    },
);

When(
    'I continue from the {string} calculator page',
    async function (this: CustomWorld, name: string) {
        await namedPage(questionPages(this.pages), name).continue();
    },
);

Then(
    'the {string} calculator page should explain its question',
    async function (this: CustomWorld, name: string) {
        const pages = {
            'worker type': this.pages.calculateHolidayEntitlement,
            'regular hours': this.pages.regularHours,
            'irregular hours': this.pages.irregularHours,
            'calculation basis': this.pages.basisOfCalculation,
            'hours worked per week': this.pages.hoursWorkedPerWeek,
            'compressed hours': this.pages.compressedHours,
            'days worked per week for hours': this.pages.daysWorkedPerWeekForHours,
        };
        await namedPage(pages, name).expectExplanation();
    },
);

Then(
    'the {string} calculator page should have the expected form configuration',
    async function (this: CustomWorld, name: string) {
        const pages = {
            'worker type': this.pages.calculateHolidayEntitlement,
            'irregular hours': this.pages.irregularHours,
            'calculation basis': this.pages.basisOfCalculation,
            'leave year period': this.pages.leaveYearPeriod,
            'annualised hours': this.pages.annualisedHours,
            'hours worked per week': this.pages.hoursWorkedPerWeek,
            'compressed hours': this.pages.compressedHours,
            'days worked per week for hours': this.pages.daysWorkedPerWeekForHours,
        };
        await namedPage(pages, name).expectFormConfiguration();
    },
);

Then(
    'the calculator question key should be {string}',
    async function (this: CustomWorld, key: string) {
        await this.calculator.question.expectKey(key);
    },
);

Then(
    'the answer summary should contain {string} with answer {string}',
    async function (this: CustomWorld, question: string, answer: string) {
        await this.calculator.question.summary.expectAnswer(question, answer);
    },
);

Then(
    'the answer summary should omit {string}',
    async function (this: CustomWorld, question: string) {
        await this.calculator.question.summary.expectMissing(question);
    },
);

When(
    'I change the summary answer for {string}',
    async function (this: CustomWorld, question: string) {
        await this.calculator.question.change(question);
    },
);
