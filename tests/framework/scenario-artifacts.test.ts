import assert from 'node:assert/strict';
import {mkdtempSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {after, afterEach, before, beforeEach, describe, it} from 'node:test';
import {chromium, type Browser, type BrowserContext} from '@playwright/test';
import type {World} from '@cucumber/cucumber';
import {TraceMode} from '../../test-options';
import {
    artifactStem,
    ScenarioArtifacts,
    type ScenarioOutcome,
} from '../../src/support/ScenarioArtifacts';

const scenario = (overrides: Partial<ScenarioOutcome> = {}): ScenarioOutcome => ({
    scenarioId: 'POS-04',
    name: 'Full-year entitlement',
    attempt: 1,
    uniqueId: '1a2b3c4d-0000-0000-0000-000000000000',
    failed: false,
    ...overrides,
});

describe('artifactStem', () => {
    it('leads with the scenario ID and attempt so CI downloads sort and search by test case', () => {
        assert.equal(
            artifactStem(scenario({name: 'Full-year entitlement: 5 days!'})),
            'POS-04-attempt1-Full-year_entitlement_5_days-1a2b3c4d',
        );
    });

    it('marks untagged scenarios and keeps Scenario Outline examples apart', () => {
        const first = artifactStem(scenario({scenarioId: undefined, uniqueId: 'aaaaaaaa-1'}));
        const second = artifactStem(scenario({scenarioId: undefined, uniqueId: 'bbbbbbbb-2'}));
        assert.match(first, /^NO-ID-attempt1-/);
        assert.notEqual(first, second);
    });
});

describe('ScenarioArtifacts', () => {
    let browser: Browser;
    let context: BrowserContext;
    let directory: string;
    let attached: string[];
    let warn: typeof console.warn;

    // Records attachments the way the Cucumber report would show them.
    const attach = ((data: unknown, mediaType: string): void => {
        attached.push(mediaType === 'image/png' ? '[png]' : String(data));
    }) as World['attach'];
    const files = () => readdirSync(directory).sort();
    const artifacts = (trace: TraceMode, screenshotTimeout = 10000) =>
        new ScenarioArtifacts({directory, trace, screenshotTimeout});

    async function openPage(html = '<h1>evidence</h1>') {
        const page = await context.newPage();
        await page.setContent(html);
        return page;
    }

    before(async () => {
        browser = await chromium.launch();
        warn = console.warn;
    });
    after(async () => {
        await browser.close();
    });
    beforeEach(async () => {
        directory = mkdtempSync(path.join(tmpdir(), 'artifacts-'));
        attached = [];
        context = await browser.newContext();
        console.warn = () => {}; // Capture problems are asserted through attachments instead.
    });
    afterEach(async () => {
        console.warn = warn;
        await context.close();
        rmSync(directory, {recursive: true, force: true});
    });

    describe('trace modes', () => {
        const cases: [TraceMode, boolean, string[]][] = [
            ['on-failure', false, []],
            ['on-failure', true, ['.png', '.zip']],
            ['on', false, ['.zip']],
            ['off', true, ['.png']],
        ];
        for (const [mode, failed, expected] of cases) {
            it(`${mode}, ${failed ? 'failed' : 'passed'} -> ${expected.join(' + ') || 'nothing kept'}`, async () => {
                const evidence = artifacts(mode);
                await evidence.start(context, 1, attach);
                await openPage();
                await evidence.finish(context, scenario({failed}), attach);
                assert.deepEqual(
                    files().map((file) => path.extname(file)),
                    expected,
                );
                for (const file of files()) assert.match(file, /^POS-04-attempt1-/);
            });
        }

        it('on-first-retry traces only attempt 2 and keeps it whatever the outcome', () => {
            const evidence = artifacts('on-first-retry');
            assert.deepEqual(
                [1, 2, 3].map((attempt) => evidence.shouldTrace(attempt)),
                [false, true, false],
            );
        });

        it('on-first-retry keeps the retry trace even when the retry passes', async () => {
            const evidence = artifacts('on-first-retry');
            await evidence.start(context, 2, attach);
            await openPage();
            await evidence.finish(context, scenario({attempt: 2}), attach);
            assert.deepEqual(files(), ['POS-04-attempt2-Full-year_entitlement-1a2b3c4d.zip']);
        });
    });

    describe('failure evidence', () => {
        it('captures every open page, including popups', async () => {
            const evidence = artifacts('off');
            await evidence.start(context, 1, attach);
            await openPage();
            await openPage('<h1>popup</h1>');
            await evidence.finish(context, scenario({failed: true}), attach);
            assert.deepEqual(files(), [
                'POS-04-attempt1-Full-year_entitlement-1a2b3c4d-page2.png',
                'POS-04-attempt1-Full-year_entitlement-1a2b3c4d.png',
            ]);
        });

        it('explains a missing screenshot when no page is open', async () => {
            const evidence = artifacts('off');
            await evidence.start(context, 1, attach);
            const page = await openPage();
            await page.close();
            await evidence.finish(context, scenario({failed: true}), attach);
            assert.deepEqual(files(), []);
            assert.match(attached.join('\n'), /No screenshot: no page was open at failure/);
            assert.doesNotMatch(
                attached.join('\n'),
                /trace/i,
                'TRACE=off must not point to a trace',
            );
        });

        it('reports a renderer crash, even in a scenario that otherwise passed', async () => {
            const evidence = artifacts('off');
            await evidence.start(context, 1, attach);
            const page = await openPage();
            // chrome://crash is blocked as a navigation; crash the renderer through DevTools instead.
            // The renderer dies before it can reply, so the send never settles: wait on the event only.
            const crashed = page.waitForEvent('crash', {timeout: 5000});
            void (await context.newCDPSession(page)).send('Page.crash').catch(() => {});
            await crashed;
            await evidence.finish(context, scenario({failed: false}), attach);
            assert.match(attached.join('\n'), /Page crashed during the scenario/);
        });

        it('uses the configured screenshot timeout and attaches, never throws, on failure', async () => {
            const evidence = artifacts('off', 1);
            await evidence.start(context, 1, attach);
            await openPage();
            await evidence.finish(context, scenario({failed: true}), attach);
            assert.match(
                attached.join('\n'),
                /Screenshot of page about:blank failed: .*Timeout 1ms/,
            );
        });
    });

    describe('evidence problems never change the outcome', () => {
        it('stays silent about tracing that never started, instead of a misleading stop error', async () => {
            const evidence = artifacts('on-failure');
            // start() deliberately not called: a Before hook failed before evidence began.
            await evidence.finish(context, scenario({failed: true}), attach);
            assert.doesNotMatch(attached.join('\n'), /tracing|trace/i);
        });

        it('attaches a trace-save failure on a passing scenario rather than failing it', async () => {
            writeFileSync(path.join(directory, 'blocker'), '');
            const blocked = new ScenarioArtifacts({
                directory: path.join(directory, 'blocker', 'nested'),
                trace: 'on',
                screenshotTimeout: 10000,
            });
            await blocked.start(context, 1, attach);
            await openPage();
            await blocked.finish(context, scenario({failed: false}), attach);
            assert.match(attached.join('\n'), /Trace capture failed/);
        });
    });
});
