import {Then, When} from '@cucumber/cucumber';
import {CustomWorld} from '../../hooks/CustomWorld';
import {CalculationBasis} from '../pages/RegularHoursPage';
import {LeaveYearPeriod} from '../pages/LeaveYearPeriodPage';
import {namedPage} from './page-targets';

function basisPage(world: CustomWorld, name: string) {
    return namedPage(
        {
            'regular hours': world.pages.regularHours,
            'calculation basis': world.pages.basisOfCalculation,
        },
        name,
    );
}

function calculationBasis(value: string): CalculationBasis {
    const values: CalculationBasis[] = [
        'days worked per week',
        'hours worked per week',
        'annualised hours',
        'compressed hours',
        'shifts',
    ];
    const basis = values.find((basis) => basis === value);
    if (!basis) throw new Error(`Unsupported calculation basis: ${value}`);
    return basis;
}

function leaveYearPeriod(value: string): LeaveYearPeriod {
    const values: LeaveYearPeriod[] = ['full-year', 'starting', 'leaving', 'starting-and-leaving'];
    const period = values.find((period) => period === value);
    if (!period) throw new Error(`Unsupported leave year period: ${value}`);
    return period;
}

When(
    /^I select (Yes|No) on the worker type page$/,
    async function (this: CustomWorld, answer: 'Yes' | 'No') {
        if (answer === 'Yes') await this.pages.calculateHolidayEntitlement.selectYes();
        else await this.pages.calculateHolidayEntitlement.selectNo();
    },
);

Then(
    /^only (Yes|No) should be selected on the worker type page$/,
    async function (this: CustomWorld, answer: 'Yes' | 'No') {
        await this.pages.calculateHolidayEntitlement.expectSelected(answer);
    },
);

Then('the worker type page should have no selection', async function (this: CustomWorld) {
    await this.pages.calculateHolidayEntitlement.expectNoSelection();
});

When(
    'I select calculation basis {string} on the {string} page',
    async function (this: CustomWorld, value: string, name: string) {
        await basisPage(this, name).selectBasis(calculationBasis(value));
    },
);

Then(
    'calculation basis {string} should be selected on the {string} page',
    async function (this: CustomWorld, value: string, name: string) {
        await basisPage(this, name).expectSelected(calculationBasis(value));
    },
);

Then(
    'the calculation basis page should offer all five options',
    async function (this: CustomWorld) {
        await this.pages.basisOfCalculation.expectOptions();
    },
);

Then('the calculation basis page should have no selection', async function (this: CustomWorld) {
    await this.pages.basisOfCalculation.expectNoSelection();
});

When('I select leave year period {string}', async function (this: CustomWorld, value: string) {
    await this.pages.leaveYearPeriod.selectPeriod(leaveYearPeriod(value));
});

Then(
    'leave year period {string} should be selected',
    async function (this: CustomWorld, value: string) {
        await this.pages.leaveYearPeriod.expectSelected(leaveYearPeriod(value));
    },
);

Then('all four leave year periods should be available', async function (this: CustomWorld) {
    await this.pages.leaveYearPeriod.expectOptions();
});

Then('no leave year period should be selected', async function (this: CustomWorld) {
    await this.pages.leaveYearPeriod.expectNoSelection();
});

When('I change the annualised hours calculation basis', async function (this: CustomWorld) {
    await this.pages.annualisedHours.changeCalculationBasis();
});

When('I change the compressed hours calculation basis', async function (this: CustomWorld) {
    await this.pages.compressedHours.changeCalculationBasis();
});
