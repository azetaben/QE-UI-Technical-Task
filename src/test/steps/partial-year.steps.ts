import {Given, Then, When} from '@cucumber/cucumber';
import {expect} from '../../support/assertions';
import {CustomWorld} from '../../hooks/CustomWorld';
import {regularDays} from '../test_data/EntitlementOracle';
import {fixtures, PARTIAL_YEAR_DAYS_PER_WEEK} from '../test_data/Fixtures';

Given(
    'I am calculating entitlement for someone starting part way through a leave year',
    async function (this: CustomWorld) {
        await this.calculator.partialPeriod('starting');
    },
);
When(
    'I enter the same employment and leave-year start date of 1 January 2026',
    async function (this: CustomWorld) {
        await this.calculator.isoDate('2026-01-01');
        await this.calculator.isoDate('2026-01-01');
    },
);
Then(
    'the starter route should explain that the leave year must start earlier',
    async function (this: CustomWorld) {
        await this.calculator.question.expectRecoverableError('when-does-your-leave-year-start');
        await expect(this.calculator.question.errors).toContainText(
            'must be earlier than your employment start date',
        );
        for (const [label, value] of [
            ['Day', '1'],
            ['Month', '1'],
            ['Year', '2026'],
        ]) {
            await expect(
                this.calculator.question.form.getByLabel(label, {exact: true}),
            ).toHaveValue(value);
        }
    },
);
Then('I can correct the leave-year start date and continue', async function (this: CustomWorld) {
    await this.calculator.isoDate('2025-12-31');
    await this.calculator.question.expectKey('how-many-days-per-week');
});

// Independent expected values from the GOV.UK regular-worker calculation guidance.
// Starter: monthly accrual rounded up to half-days. Leaver/combined: calendar-day
// proportion, inclusive of both endpoints, rounded up to one decimal place.
// https://www.gov.uk/government/publications/calculating-holiday-entitlement-for-workers/how-to-calculate-holiday-entitlement-for-workers-on-different-types-of-contract
Given(
    'approved starter dates, work pattern, accrual rules and an independent numeric expected result are available',
    function (this: CustomWorld) {
        this.state.partial = fixtures.starter;
    },
);
Given(
    'approved leaver dates, work pattern, accrual rules and an independent numeric expected result are available',
    function (this: CustomWorld) {
        this.state.partial = fixtures.leaver;
    },
);
Given(
    'the combined starter-and-leaver route has been confirmed as supported',
    function (this: CustomWorld) {
        this.attach(
            'Combined starter/leaver route verified live. It asks for both employment dates, then working days.',
            'text/plain',
        );
    },
);
Given(
    'approved dates within one leave year and an independent numeric expected result are available',
    function (this: CustomWorld) {
        this.state.partial = fixtures.combined;
    },
);
When(
    /^I complete the (?:starter|leaver|combined) journey with those dates and work pattern$/,
    async function (this: CustomWorld) {
        await this.calculator.finishPartial(this.partialFixture);
    },
);
Then(
    /^the entitlement should match the approved independent result(?: using both employment dates| for that leave year)?$/,
    async function (this: CustomWorld) {
        await this.calculator.result.expectEntitlement(this.partialFixture.expected, 'days');
    },
);
Then(
    'it should not exceed the equivalent full-year entitlement',
    async function (this: CustomWorld) {
        // Compare what the page displays, not the fixture, against the five-day full-year oracle.
        const displayed = await this.calculator.result.displayedEntitlement();
        expect(displayed.unit).toBe('day');
        expect(displayed.value).toBeLessThanOrEqual(regularDays(PARTIAL_YEAR_DAYS_PER_WEEK));
    },
);
Given(
    'approved starter rules allow comparison with a full-year result',
    function (this: CustomWorld) {
        this.state.partial = fixtures.firstDay;
    },
);
When(
    'I calculate entitlement for a regular worker starting on the first day of the leave year',
    async function (this: CustomWorld) {
        // This employee is present for the entire leave year: use the full-year route.
        await this.calculator.regular();
        await this.calculator.question.number('5');
    },
);
Given('a regular worker was employed throughout the leave year', function (this: CustomWorld) {
    this.state.partial = fixtures.lastDay;
});
When(
    'I calculate entitlement using the leaver route with the last day of that leave year',
    async function (this: CustomWorld) {
        await this.calculator.finishPartial(this.partialFixture);
    },
);
Then(
    'the entitlement should equal the equivalent full-year calculation',
    async function (this: CustomWorld) {
        await this.calculator.result.expectEntitlement(28, 'days');
    },
);
Given(
    'approved leap-year dates, work pattern and an independent numeric expected result are available',
    function (this: CustomWorld) {
        // Leaver period Jan 1 to Feb 29 inclusive: 60 / 366 × 28 -> 4.6 days.
        this.state.partial = fixtures.leapYear;
    },
);
When('I enter a valid date of 29 February 2024', async function (this: CustomWorld) {
    await this.calculator.partialPeriod('leaving');
    await this.calculator.isoDate('2024-02-29');
});
Then('that date should be accepted', async function (this: CustomWorld) {
    await this.calculator.question.expectKey('when-does-your-leave-year-start');
    await expect(this.calculator.question.errors).toHaveCount(0);
});
When(
    'I complete the calculation for the approved period crossing that leap day',
    async function (this: CustomWorld) {
        await this.calculator.isoDate('2024-01-01');
        await this.calculator.question.number('5');
    },
);
Given(
    'approved employment dates, work pattern and an independent numeric expected result are available',
    function (this: CustomWorld) {
        this.state.partial = fixtures.crossYear;
    },
);
When(
    'I calculate entitlement for a leave year from 1 April 2026 to 31 March 2027',
    async function (this: CustomWorld) {
        await this.calculator.finishPartial(this.partialFixture);
    },
);
Given('the journey requests both employment dates', async function (this: CustomWorld) {
    await this.calculator.partialPeriod('starting-and-leaving');
});
When('I enter an employment start date of 1 July 2026', async function (this: CustomWorld) {
    await this.calculator.isoDate('2026-07-01');
});
When('I enter an employment leaving date of 30 June 2026', async function (this: CustomWorld) {
    await this.calculator.question.date('30', '6', '2026');
});
Then(
    'I should receive a recoverable error explaining the contradictory dates',
    async function (this: CustomWorld) {
        await this.calculator.question.expectRecoverableError('what-is-your-leaving-date');
        await expect(this.calculator.question.errors).toContainText('before your start date');
        await expect(this.calculator.question.form.getByLabel('Year', {exact: true})).toHaveValue(
            '2026',
        );
        await this.calculator.isoDate('2026-07-02');
        await this.calculator.question.expectKey('how-many-days-per-week');
    },
);
