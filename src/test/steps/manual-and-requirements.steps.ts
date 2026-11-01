import {defineStep} from '@cucumber/cucumber';
import {CustomWorld} from '../../hooks/CustomWorld';

// These cases deliberately report pending if selected explicitly. They must not
// be represented as successful browser automation while their oracle is undefined.
const requirements: (string | RegExp)[] = [
    "every numeric field's minimum, maximum and smallest accepted increment have been approved",
    /^I submit (?:the minimum|the maximum|one increment below minimum|one increment above maximum) for each numeric field in a fresh journey$/,
    /^each submission should be (?:accepted|rejected)$/,
    /^approved dates, accrual rules and an independent numeric expected result exist for (?:employment starting on the final leave-year day|a supported one-day employment period)$/,
    'I calculate entitlement using those dates',
    'no negative or erroneous full-year entitlement should be displayed',
    'the accepted numeric-format rules have been approved',
    'I am on a suitable numeric question',
    /^I submit the numeric format (?:5 with leading whitespace|5 with trailing whitespace|05 with a leading zero|3,5 with a comma decimal separator) and continue$/,
    'supported formats should be normalised according to those rules',
    'unsupported formats should receive a clear validation error',
    'the value should not be silently misinterpreted',
    'the supported browser versions and device matrix have been approved',
    /^I open the GOV.UK holiday entitlement calculator in (?:Chrome|Edge|Firefox|Safari) on (?:desktop|mobile)$/,
    'I complete representative regular and irregular-worker journeys',
    'I exercise required-field and invalid-input validation',
    'navigation and validation should remain usable',
    'the calculations should match the approved reference results',
    'I should record the browser version and device with the evidence',
];
for (const expression of requirements) {
    defineStep(expression, function (this: CustomWorld) {
        this.attach(
            'Pending: see features README. Define numeric limits, expected formatting/date behaviour or the approved actual-browser/device matrix before executing this case.',
            'text/plain',
        );
        return 'pending';
    });
}
const manual: (string | RegExp)[] = [
    'I am using a supported screen reader and browser combination',
    /^I trigger a (?:required-field|invalid-input) error$/,
    'the question labels, hints and errors should be correctly associated',
    'the error and correction path should be discoverable with the screen reader',
    'I complete a valid calculation and read the result',
    'the entitlement value, unit and relevant explanation should be understandable together',
    'the browser is configured for 400 percent browser zoom',
];
for (const expression of manual) {
    defineStep(expression, function (this: CustomWorld) {
        this.attach(
            'Manual verification required: record actual screen-reader output or native browser zoom behaviour and evidence against this test ID.',
            'text/plain',
        );
        return 'pending';
    });
}
