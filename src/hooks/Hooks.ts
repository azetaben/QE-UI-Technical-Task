import {
    After,
    AfterAll,
    Before,
    BeforeAll,
    type ITestCaseHookParameter,
    setDefaultTimeout,
    Status,
} from '@cucumber/cucumber';
import {getTestOptions} from '../../test-options';
import {CustomWorld} from './CustomWorld';
import {BrowserManager} from '../support/BrowserManager';
import {HarContract} from '../support/HarContract';
import {ScenarioArtifacts} from '../support/ScenarioArtifacts';
import * as allure from 'allure-js-commons';
import logger from "../test/logger/logger";

const options = getTestOptions();
const browser = new BrowserManager(options);
const artifacts = new ScenarioArtifacts({
    directory: options.artifactsDir,
    trace: options.trace,
    screenshotTimeout: options.actionTimeout,
});
const har = new HarContract(options);
setDefaultTimeout(options.stepTimeout);

// Cucumber does not pass the attempt number to hooks. Retries run in the same worker with the
// same pickle, so counting per pickle ID gives 1 for the first run, 2 for the first retry, ...
const attempts = new Map<string, number>();
const SCENARIO_ID = /^@[A-Z]+-\d+$/;

function identify(pickle: ITestCaseHookParameter['pickle'], uniqueId: string) {
    const tag = pickle.tags.map((t) => t.name).find((name) => SCENARIO_ID.test(name));
    return {
        scenarioId: tag?.slice(1),
        name: pickle.name,
        attempt: attempts.get(pickle.id) ?? 1,
        uniqueId,
    };
}

BeforeAll(async function () {
    await browser.launch();
});
Before(async function (this: CustomWorld, {pickle}) {
    attempts.set(pickle.id, (attempts.get(pickle.id) ?? 0) + 1);
    await allure.parameter('browser', options.browser);
    await allure.parameter('environment', options.environment);
    // Jenkins combines contract and live results; these are distinct executions, not retries.
    await allure.parameter('har', options.har);
    await allure.parameter('attempt', String(attempts.get(pickle.id)), {excluded: true});
    this.context = await browser.newContext();
    // Start evidence first: anything below that fails (e.g. a missing HAR) is then traced.
    await artifacts.start(this.context, attempts.get(pickle.id)!, this.attach);
    this.context.on('page', (page) =>
        // Popups included: record and dismiss every JavaScript dialog the scenario triggers.
        page.on('dialog', async (dialog) => {
            this.state.dialogs.push(dialog.message());
            await dialog.dismiss();
        }),
    );
    const recording = await har.route(
        this.context,
        pickle.tags.map((tag) => tag.name),
    );
    if (recording) this.attach(`HAR ${options.har}: ${recording}`, 'text/plain');
    this.initialisePage(await this.context.newPage());
});
After(async function (this: CustomWorld, {pickle, result, testCaseStartedId}) {
    try {
        const failed = result?.status === Status.FAILED;
        const scenario = identify(pickle, testCaseStartedId);
        if (failed) {
            this.attach(
                [
                    `Scenario: ${scenario.scenarioId ?? 'NO-ID'} attempt ${scenario.attempt}`,
                    `URL: ${this.currentPage?.url() ?? 'no page'}`,
                    `Environment: ${options.environment}`,
                    `Browser: ${options.browser} ${browser.version()}`,
                ].join('\n'),
                'text/plain',
            );
        }
        if (this.context) await artifacts.finish(this.context, {...scenario, failed}, this.attach);
    } finally {
        // Closing the context also writes any HAR being recorded.
        await this.context?.close();
        this.context = undefined;
    }
});
AfterAll(async function () {
    await browser.close();
    logger.info('Custom world browser closed');
});
