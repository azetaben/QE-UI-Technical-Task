import {Then, When} from '@cucumber/cucumber';
import {CustomWorld} from '../../hooks/CustomWorld';

Then('the result page should be displayed', async function (this: CustomWorld) {
    await this.calculator.result.expectLoaded();
});

Then('the result page should explain the entitlement guidance', async function (this: CustomWorld) {
    await this.calculator.result.expectGuidance();
});

Then(
    'the result page should contain {int} changeable answers',
    async function (this: CustomWorld, count: number) {
        await this.calculator.result.expectAnswerCount(count);
    },
);

Then(
    'the entitlement statement should be {string}',
    async function (this: CustomWorld, text: string) {
        await this.calculator.result.expectEntitlementText(text);
    },
);

When('I change result answer {string}', async function (this: CustomWorld, question: string) {
    await this.calculator.result.changeAnswer(question);
});

When('I use the calculator again from the result page', async function (this: CustomWorld) {
    await this.calculator.result.useCalculatorAgain();
});
