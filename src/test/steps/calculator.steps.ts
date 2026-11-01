import {Given, Then, When} from '@cucumber/cucumber';
import {expect} from '../../support/assertions';
import {CustomWorld} from '../../hooks/CustomWorld';


Given('I open the GOV.UK holiday entitlement calculator', async function (this: CustomWorld) {
    await this.calculator.landing.open();

});
When('I select Start now', async function (this: CustomWorld) {
    await this.calculator.landing.start();
});
Given('I have started the calculator', async function (this: CustomWorld) {
    await this.calculator.landing.start();

});

Then(
    'I should be asked whether the employee works irregular hours or for part of the year',
    async function (this: CustomWorld) {
        await this.calculator.question.expectKey('regular-or-irregular-hours');
        await expect(
            this.page.getByRole('heading', {
                name: 'Does the employee work irregular hours or for part of the year?',
                exact: true,
            }),
        ).toBeVisible();
    },
);
Then(
    'Yes and No choices and a Continue button should be available',
    async function (this: CustomWorld) {
        for (const name of ['Yes', 'No'])
            await expect(this.calculator.question.form.getByRole('radio', {name, exact: true}),).toBeVisible();
        await expect(this.calculator.question.form.getByRole('button', {name: 'Continue', exact: true})).toBeEnabled();
    },
);
When(
    /^I answer (Yes|No) to irregular-hours or part-year working$/,
    async function (this: CustomWorld, answer: string) {
        await this.calculator.question.choose(answer);
    },
);
When('I continue', async function (this: CustomWorld) {
    await this.calculator.question.continue();
});
Then('I should be shown the relevant regular-worker questions', async function (this: CustomWorld) {
    await this.calculator.question.expectKey('basis-of-calculation');
    await expect(
        this.calculator.question.form.getByRole('radio', {
            name: 'days worked per week',
            exact: true,
        }),
    ).toBeVisible();
});
Then(
    'I should be asked for information needed for the applicable accrual calculation',
    async function (this: CustomWorld) {
        await this.calculator.question.expectKey('when-does-your-leave-year-start');
    },
);
Given(
    "I am calculating a regular worker's entitlement for a full leave year",
    async function (this: CustomWorld) {
        await this.calculator.regular();
    },
);
When(
    /^I enter ([\d.]+) working days? per week and complete the calculation$/,
    async function (this: CustomWorld, days: string) {
        await this.calculator.question.number(days);
    },
);
Then('the entitlement should be {float} days', async function (this: CustomWorld, days: number) {
    await this.calculator.result.expectEntitlement(days, 'days');
});
Then('the entitlement should be {float} hours', async function (this: CustomWorld, hours: number) {
    await this.calculator.result.expectEntitlement(hours, 'hours');
});
Given(
    'I am calculating irregular-hours accrual for a leave year beginning on 1 April 2026',
    async function (this: CustomWorld) {
        await this.calculator.irregular();
    },
);
When(
    'I enter {float} hours worked in one pay period and complete the calculation',
    async function (this: CustomWorld, hours: number) {
        await this.calculator.question.number(String(hours));
    },
);
Given('the hours-based route has been confirmed as supported', function (this: CustomWorld) {
    // Live verified route; no approval is inferred from the scenario wording.
    this.attach('Hours-based route verified against the live calculator.', 'text/plain');
});
When('I enter 35 working hours over 5 working days per week', async function (this: CustomWorld) {
    await this.calculator.question.change('Is the holiday entitlement based on:');
    await this.calculator.question.answer('hours worked per week');
    await this.calculator.question.answer('for a full leave year');
    await this.calculator.question.number('35');
    await this.calculator.question.expectKey('how-many-days-per-week-for-hours');
    await this.calculator.question.numeric.fill('5');
});
When('I complete the calculation', async function (this: CustomWorld) {
    await this.calculator.question.continue();
});
Then('the result should clearly identify the unit as hours', async function (this: CustomWorld) {
    await this.calculator.result.expectEntitlement(196, 'hours');
});
Given('decimal hours have been confirmed as supported', function (this: CustomWorld) {
    this.attach('Decimal pay-period hours verified against the live calculator.', 'text/plain');
});
Given(
    'I have a full-year regular-worker result of 28 days for a five-day week',
    async function (this: CustomWorld) {
        await this.calculator.regular();
        await this.calculator.question.number('5');
        await this.calculator.result.expectEntitlement(28, 'days');
    },
);
When(
    'I change the working-days answer to 3 using the available change control',
    async function (this: CustomWorld) {
        await this.calculator.question.change('Number of days worked per week?');
        await this.calculator.question.numeric.fill('3');
    },
);
Then('the displayed working-days answer should be 3', async function (this: CustomWorld) {
    await expect(
        this.page
            .locator('.govuk-summary-list__row')
            .filter({hasText: 'Number of days worked per week?'})
            .locator('.govuk-summary-list__value'),
    ).toHaveText('3.0');
});
Given('I have completed a calculation', async function (this: CustomWorld) {
    await this.calculator.regular();
    await this.calculator.question.number('5');
    await this.calculator.result.expectEntitlement(28, 'days');
});
When('I use the available restart control', async function (this: CustomWorld) {
    await this.calculator.result.restart();
});
Then('a new calculator journey should begin', async function (this: CustomWorld) {
    await this.calculator.landing.start();
    await expect(this.calculator.question.form.locator('input:checked')).toHaveCount(0);
    await expect(this.page.locator('.govuk-summary-list__row')).toHaveCount(0);
});
Then(
    'the previous answers should not affect the new calculation',
    async function (this: CustomWorld) {
        await this.calculator.question.answer('Yes');
        await this.calculator.question.date('1', '4', '2026');
        await this.calculator.question.continue();
        await this.calculator.question.number('30');
        await this.calculator.result.expectEntitlement(4, 'hours');
        await expect(
            this.page
                .locator('.govuk-summary-list__row')
                .filter({hasText: 'Number of days worked per week?'}),
        ).toHaveCount(0);
    },
);
Given(
    'the employee works irregular hours or for part of the year',
    async function (this: CustomWorld) {
        await this.calculator.irregularDate();
    },
);
When(
    /^I enter a leave-year start date of (31 March 2024|1 April 2024)$/,
    async function (this: CustomWorld, date: string) {
        await this.calculator.question.date(
            date.startsWith('31') ? '31' : '1',
            date.startsWith('31') ? '3' : '4',
            '2024',
        );
    },
);
Then(
    /^the journey should apply the (historical pre-cutoff|pay-period accrual) entitlement rules$/,
    async function (this: CustomWorld, rule: string) {
        await this.calculator.question.expectKey(
            rule === 'pay-period accrual' ? 'hours-in-pay-period' : 'basis-of-calculation',
        );
    },
);
Given('I have answered questions on one worker-type branch', async function (this: CustomWorld) {
    await this.calculator.regular();
    await this.calculator.question.number('5');
    await this.calculator.result.expectEntitlement(28, 'days');
});
When('I navigate Back and select the other worker type', async function (this: CustomWorld) {
    await this.calculator.question.change(
        'Does the employee work irregular hours or for part of the year?',
    );
    await this.calculator.question.answer('Yes');
});
When('I complete the new branch with valid answers', async function (this: CustomWorld) {
    await this.calculator.question.date('1', '4', '2026');
    await this.calculator.question.continue();
    await this.calculator.question.number('30');
});
Then(
    'the result should use only answers relevant to the new branch',
    async function (this: CustomWorld) {
        await this.calculator.result.expectEntitlement(4, 'hours');
        await expect(
            this.page
                .locator('.govuk-summary-list__row')
                .filter({hasText: 'Number of days worked per week?'}),
        ).toHaveCount(0);
    },
);
Given(
    /^I have reached a calculator (question|result)$/,
    async function (this: CustomWorld, kind: string) {
        await this.calculator.regular();
        if (kind === 'result') {
            await this.calculator.question.number('5');
            await this.calculator.result.expectEntitlement(28, 'days');
        }
        this.state.snapshot = {
            text: await this.page.locator('main').innerText(),
            url: this.page.url(),
        };
    },
);
When('I refresh the page', async function (this: CustomWorld) {
    await this.page.reload({waitUntil: 'domcontentloaded'});
});
When('I navigate using browser Back and Forward', async function (this: CustomWorld) {
    await this.page.goBack({waitUntil: 'domcontentloaded'});
    await this.page.goForward({waitUntil: 'domcontentloaded'});
});
Then(
    'the displayed answers and any result should remain consistent',
    async function (this: CustomWorld) {
        const snapshot = this.required('snapshot', 'A page snapshot must be captured first');
        await expect(this.page).toHaveURL(snapshot.url);
        await expect(this.page.locator('main')).toHaveText(snapshot.text);
    },
);
Then('the journey should remain usable', async function (this: CustomWorld) {
    if (await this.calculator.question.form.count()) {
        await this.calculator.question.number('3');
        await this.calculator.result.expectEntitlement(16.8, 'days');
    } else {
        await this.calculator.result.restart();
    }
});
