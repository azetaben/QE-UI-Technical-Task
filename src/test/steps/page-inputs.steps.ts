import {Then, When} from '@cucumber/cucumber';
import {CustomWorld} from '../../hooks/CustomWorld';
import {datePages, namedPage, numericPages} from './page-targets';

When(
    'I fill {string} on the {string} numeric page',
    async function (this: CustomWorld, value: string, name: string) {
        await namedPage(numericPages(this.pages), name).fillValue(value);
    },
);

When('I clear the {string} numeric page', async function (this: CustomWorld, name: string) {
    await namedPage(numericPages(this.pages), name).clearValue();
});

Then(
    'the {string} numeric page should retain {string}',
    async function (this: CustomWorld, name: string, value: string) {
        await namedPage(numericPages(this.pages), name).expectValue(value);
    },
);

When(
    'I fill day {string}, month {string} and year {string} on the {string} date page',
    async function (this: CustomWorld, day: string, month: string, year: string, name: string) {
        await namedPage(datePages(this.pages), name).fillDate(day, month, year);
    },
);

When('I clear the {string} date page', async function (this: CustomWorld, name: string) {
    await namedPage(datePages(this.pages), name).clearDate();
});

Then(
    'the {string} date page should retain day {string}, month {string} and year {string}',
    async function (this: CustomWorld, name: string, day: string, month: string, year: string) {
        await namedPage(datePages(this.pages), name).expectDate(day, month, year);
    },
);

// These classes share the validation contract; register it once for all inputs.
function inputPages(world: CustomWorld) {
    return {
        ...datePages(world.pages),
        'days worked per week': world.pages.daysWorkedPerWeek,
        'days worked per week for hours': world.pages.daysWorkedPerWeekForHours,
        'hours worked per week': world.pages.hoursWorkedPerWeek,
        'compressed hours': world.pages.compressedHours,
        'hours in pay period': world.pages.hoursInPayPeriod,
        'leave year period': world.pages.leaveYearPeriod,
        'annualised hours': world.pages.annualisedHours,
    };
}

Then(
    'the {string} input page should show validation error {string}',
    async function (this: CustomWorld, name: string, message: string) {
        await namedPage(inputPages(this), name).expectValidationError(message);
    },
);

Then(
    'the {string} input page should have no validation errors',
    async function (this: CustomWorld, name: string) {
        await namedPage(inputPages(this), name).expectNoValidationErrors();
    },
);
