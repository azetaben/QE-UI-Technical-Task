import {Given, Then, When} from '@cucumber/cucumber';
import {expect} from '../../support/assertions';
import {CustomWorld} from '../../hooks/CustomWorld';
import {DatePart, DateParts} from '../../hooks/ScenarioState';

const DATE_PARTS: DatePart[] = ['day', 'month', 'year'];

const questionKey = (world: CustomWorld) =>
    world.required('questionKey', 'A question must be selected by an earlier step');

async function numericQuestion(world: CustomWorld): Promise<void> {
    await world.calculator.regular();
    world.state.questionKey = 'how-many-days-per-week';
}

async function submitDate(world: CustomWorld, date: DateParts): Promise<void> {
    world.state.submittedDate = date;
    await world.calculator.question.date(date.day, date.month, date.year);
    await world.calculator.question.continue();
}

/** Reads each date input back from the page so retention is proven, not assumed. */
async function readDate(world: CustomWorld): Promise<DateParts> {
    const read = (part: DatePart) =>
        world.calculator.question.form.locator(`input[name="response[${part}]"]`).inputValue();
    return {day: await read('day'), month: await read('month'), year: await read('year')};
}

Given(
    /^I am on (?:a required numeric question|a days-or-hours numeric question|the working-days-per-week question|a text-capable calculator input)$/,
    async function (this: CustomWorld) {
        await numericQuestion(this);
    },
);
Given(
    /^I am on the (working days per week|hours worked per pay period) question$/,
    async function (this: CustomWorld, field: string) {
        if (field === 'working days per week') await numericQuestion(this);
        else {
            await this.calculator.irregular();
            this.state.questionKey = 'hours-in-pay-period';
        }
    },
);
Then('zero should be rejected for that field', async function (this: CustomWorld) {
    const hoursQuestion = questionKey(this) === 'hours-in-pay-period';
    await this.calculator.question.expectRecoverableError(questionKey(this));
    await this.calculator.question.number(hoursQuestion ? '30' : '5');
    await this.calculator.result.expectEntitlement(
        hoursQuestion ? 4 : 28,
        hoursQuestion ? 'hours' : 'days',
    );
});
Given('I am on a required date question', async function (this: CustomWorld) {
    await this.calculator.irregularDate();
    this.state.questionKey = 'when-does-your-leave-year-start';
});
When('I continue without selecting a worker type', async function (this: CustomWorld) {
    await this.calculator.question.continue();
});
Then('I should remain on the worker-type question', async function (this: CustomWorld) {
    await this.calculator.question.expectKey('regular-or-irregular-hours');
});
Then(
    'a required-selection error should identify the unanswered question',
    async function (this: CustomWorld) {
        await this.calculator.question.expectRecoverableError('regular-or-irregular-hours');
        await this.calculator.question.answer('No');
        await this.calculator.question.expectKey('basis-of-calculation');
    },
);
When('I leave the numeric answer blank and continue', async function (this: CustomWorld) {
    await this.calculator.question.number('');
});
When('I enter {string} and continue', async function (this: CustomWorld, value: string) {
    await this.calculator.question.number(value);
});
When('I enter a number containing 100 digits and continue', async function (this: CustomWorld) {
    await this.calculator.question.number('9'.repeat(100));
});
When(
    'I enter day {int}, month {int} and year {int} and continue',
    async function (this: CustomWorld, day: number, month: number, year: number) {
        await submitDate(this, {day: String(day), month: String(month), year: String(year)});
    },
);
When(
    /^I enter a valid date except for a missing (day|month|year) and continue$/,
    async function (this: CustomWorld, component: DatePart) {
        await submitDate(this, {day: '1', month: '4', year: '2026', [component]: ''});
    },
);
Then(
    /^I should receive a recoverable (?:required-field|numeric-entry|invalid-value|invalid-date|incomplete-date) error$/,
    async function (this: CustomWorld) {
        await this.calculator.question.expectRecoverableError(questionKey(this));
        if (this.state.submittedDate) {
            // Capture what the page kept before correcting it, so retention can be asserted.
            this.state.retainedDate = await readDate(this);
            expect(this.state.retainedDate).toEqual(this.state.submittedDate);
            await this.calculator.question.date('1', '4', '2026');
            await this.calculator.question.continue();
            await this.calculator.question.expectKey('hours-in-pay-period');
        } else {
            await this.calculator.question.number('5');
            await this.calculator.result.expectEntitlement(28, 'days');
        }
    },
);
Then(
    'I should receive a recoverable error explaining the permitted range',
    async function (this: CustomWorld) {
        await this.calculator.question.expectRecoverableError(questionKey(this));
        await expect(this.calculator.question.errors).toContainText('7 days');
        await this.calculator.question.number('5');
        await this.calculator.result.expectEntitlement(28, 'days');
    },
);
Then('the completed date components should be retained', function (this: CustomWorld) {
    // Values were read from the page by the error step, before the date was corrected.
    const retained = this.required('retainedDate', 'Run the validation-error step first');
    const submitted = this.required('submittedDate', 'Submit a date first');
    const completed = DATE_PARTS.filter((part) => submitted[part] !== '');
    expect(completed).toHaveLength(2);
    for (const part of DATE_PARTS) expect(retained[part], part).toBe(submitted[part]);
});
Then(
    'no overflow, service crash or calculated result should be displayed',
    async function (this: CustomWorld) {
        // The preceding step verified rejection before making a successful corrected calculation.
        await expect(this.page.locator('main')).not.toContainText(
            /Internal Server Error|NaN|Infinity|stack trace/i,
        );
    },
);
When('I enter {string} and submit the answer', async function (this: CustomWorld, value: string) {
    await this.calculator.question.number(value);
});
Then('no script should execute', async function (this: CustomWorld) {
    expect(this.state.dialogs).toEqual([]);
    expect(await this.page.locator('main script').filter({hasText: 'alert(1)'}).count()).toBe(0);
});
Then(
    'the input should be rejected or rendered as literal text',
    async function (this: CustomWorld) {
        await this.calculator.question.expectRecoverableError('how-many-days-per-week');
        await expect(this.calculator.question.numeric).toHaveValue('<script>alert(1)</script>');
    },
);
Given('I have a valid calculator journey URL', async function (this: CustomWorld) {
    await this.calculator.landing.start();
});
When(
    /^I open that URL after inserting an (unsupported answer|malformed value)$/,
    async function (this: CustomWorld, value: string) {
        const answer = value === 'unsupported answer' ? 'unsupported-answer' : '%3Cinvalid%3E';
        await this.page.goto(`${this.options.baseURL}/y/${answer}`, {
            waitUntil: 'domcontentloaded',
        });
    },
);
Then(
    'the service should show a recoverable error or a valid restart path',
    async function (this: CustomWorld) {
        await this.calculator.question.expectRecoverableError('regular-or-irregular-hours');
        await this.calculator.question.answer('No');
        await this.calculator.question.expectKey('basis-of-calculation');
    },
);
Then(
    'no stack trace or unhandled service error should be displayed',
    async function (this: CustomWorld) {
        await expect(this.page.locator('main')).not.toContainText(
            /Internal Server Error|stack trace|Exception:/i,
        );
    },
);
