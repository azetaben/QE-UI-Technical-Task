import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {
    existsSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    readdirSync,
    rmSync,
    writeFileSync,
} from 'node:fs';
import path from 'node:path';
import {it} from 'node:test';
import {getTestOptions} from '../../test-options';

it('writes Allure steps, metadata, binary attachments and retry attempts in parallel without hiding failures', () => {
    const root = path.resolve('test-results');
    mkdirSync(root, {recursive: true});
    const directory = mkdtempSync(path.join(root, 'allure-verification-'));
    try {
        const results = path.join(directory, 'results');
        const feature = path.join(directory, 'reporting.feature');
        const support = path.join(directory, 'steps.cjs');
        const config = path.join(directory, 'cucumber.cjs');
        writeFileSync(
            feature,
            `@owner:QE @severity:critical @POS-04
Feature: Reporter verification
  Scenario: Pass
    Given a passing step
  Scenario: Retry
    Given a retrying step
  Scenario: Fail
    Given a failing step
`,
        );
        writeFileSync(
            support,
            `
require('allure-cucumberjs');
const {Given, After} = require('@cucumber/cucumber');
const allure = require('allure-js-commons');
let attempts = 0;
Given('a passing step', async function () {
    await allure.parameter('browser', 'chromium');
    await allure.step('Nested runtime step', async () => { await allure.owner('Runtime owner'); });
});
Given('a retrying step', function () { if (++attempts === 1) throw new Error('Retry me'); });
Given('a failing step', function () { throw new Error('Expected failure'); });
After(function () {
    this.attach(Buffer.from('png-evidence'), {mediaType: 'image/png', fileName: 'screenshot.png'});
    this.attach(Buffer.from('zip-evidence'), {mediaType: 'application/zip', fileName: 'trace.zip'});
});
`,
        );
        writeFileSync(
            config,
            `module.exports = {default: {
            require: [${JSON.stringify(support.replaceAll('\\', '/'))}],
            format: ['allure-cucumberjs/reporter'],
            formatOptions: require(${JSON.stringify(path.resolve('scripts/allure-config.cjs'))}).allureOptions(
                ${JSON.stringify(getTestOptions({}))}, ${JSON.stringify({ALLURE_RESULTS_DIR: results})}
            ), parallel: 2, retry: 1
        }};`,
        );
        const run = spawnSync(
            process.execPath,
            [
                path.resolve('node_modules/@cucumber/cucumber/bin/cucumber.js'),
                '--config',
                path.relative(process.cwd(), config),
                path.relative(process.cwd(), feature).replaceAll('\\', '/'),
            ],
            {
                encoding: 'utf8',
                timeout: 30000,
                env: {...process.env, ALLURE_TESTPLAN_PATH: '', FORCE_COLOR: '0'},
            },
        );
        assert.equal(run.status, 1, run.stdout + run.stderr);
        assert.ok(existsSync(results), run.stdout + run.stderr);
        const files = readdirSync(results);
        const tests = files
            .filter((file) => file.endsWith('-result.json'))
            .map(
                (file) =>
                    JSON.parse(readFileSync(path.join(results, file), 'utf8')) as {
                        name: string;
                        status: string;
                        historyId: string;
                        labels: {name: string; value: string}[];
                        steps: unknown[];
                    },
            );
        assert.equal(tests.length, 5);
        assert.equal(tests.filter((test) => test.name === 'Retry').length, 2);
        assert.equal(
            new Set(tests.filter((test) => test.name === 'Retry').map((test) => test.historyId))
                .size,
            1,
        );
        assert.ok(tests.some((test) => test.name === 'Retry' && test.status === 'passed'));
        assert.ok(tests.some((test) => test.name === 'Fail' && test.status !== 'passed'));
        const passed = tests.find((test) => test.name === 'Pass')!;
        assert.ok(
            passed.labels.some((label) => label.name === 'severity' && label.value === 'critical'),
        );
        assert.match(JSON.stringify(passed.steps), /Nested runtime step/);
        assert.ok(files.includes('categories.json'));
        assert.ok(files.includes('environment.properties'));
        assert.ok(
            files.some(
                (file) =>
                    file.endsWith('.png') &&
                    readFileSync(path.join(results, file), 'utf8') === 'png-evidence',
            ),
        );
        assert.ok(
            files.some(
                (file) =>
                    file.endsWith('.zip') &&
                    readFileSync(path.join(results, file), 'utf8') === 'zip-evidence',
            ),
        );
    } finally {
        rmSync(directory, {recursive: true, force: true});
    }
});
