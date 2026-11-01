import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {getTestOptions} from '../../test-options';

// Every case passes an explicit environment so the developer's shell cannot leak in.
const options = (env: NodeJS.ProcessEnv = {}) => getTestOptions(env);
const rejects = (env: NodeJS.ProcessEnv, message: RegExp) =>
    assert.throws(() => options(env), message);

describe('getTestOptions', () => {
    it('provides safe defaults when nothing is configured', () => {
        assert.deepEqual(options(), {
            environment: 'local',
            baseURL: 'https://www.gov.uk/calculate-your-holiday-entitlement',
            browser: 'chromium',
            channel: undefined,
            headless: true,
            stepTimeout: 60000,
            actionTimeout: 10000,
            navigationTimeout: 30000,
            expectTimeout: 5000,
            viewport: {width: 1280, height: 800},
            artifactsDir: 'test-results/cucumber/artifacts',
            reportDir: 'test-results/cucumber',
            parallel: 0,
            retry: 0,
            trace: 'on-failure',
            har: 'off',
            harDir: 'resources/har',
        });
    });

    describe('browser', () => {
        for (const browser of ['chromium', 'firefox', 'webkit']) {
            it(`accepts ${browser}`, () =>
                assert.equal(options({BROWSER: browser}).browser, browser));
        }

        it('rejects an unknown browser', () =>
            rejects({BROWSER: 'safari'}, /BROWSER must be one of/));

        it('accepts a branded channel only for chromium', () => {
            assert.equal(options({CHANNEL: 'msedge'}).channel, 'msedge');
            rejects({BROWSER: 'firefox', CHANNEL: 'chrome'}, /requires BROWSER=chromium/);
            rejects({CHANNEL: 'opera'}, /CHANNEL must be chrome or msedge/);
        });

        it('treats an empty CHANNEL as unset', () =>
            assert.equal(options({CHANNEL: ''}).channel, undefined));

        it('parses HEADLESS strictly', () => {
            assert.equal(options({HEADLESS: 'false'}).headless, false);
            rejects({HEADLESS: 'no'}, /HEADLESS must be one of: true, false/);
            rejects({HEADLESS: 'TRUE'}, /HEADLESS/);
        });
    });

    describe('HOLIDAY_BASE_URL', () => {
        it('strips one trailing slash', () =>
            assert.equal(
                options({HOLIDAY_BASE_URL: 'http://localhost:8080/'}).baseURL,
                'http://localhost:8080',
            ));

        for (const [label, url] of [
            ['a malformed URL', 'not a url'],
            ['a non-HTTP protocol', 'ftp://example.com'],
            ['credentials', 'https://user:secret@example.com'],
            ['a query', 'https://example.com?x=1'],
            ['a fragment', 'https://example.com#top'],
        ]) {
            it(`rejects ${label}`, () => rejects({HOLIDAY_BASE_URL: url}, /HOLIDAY_BASE_URL must/));
        }
    });

    describe('integers', () => {
        it('parses timeouts and viewport', () => {
            const parsed = options({
                ACTION_TIMEOUT: '2500',
                BROWSER_WIDTH: '320',
                BROWSER_HEIGHT: '640',
            });
            assert.equal(parsed.actionTimeout, 2500);
            assert.deepEqual(parsed.viewport, {width: 320, height: 640});
        });

        it('allows zero only where zero means "disabled"', () => {
            assert.equal(options({PARALLEL: '0', RETRY: '0'}).parallel, 0);
            rejects(
                {STEP_TIMEOUT: '0'},
                /STEP_TIMEOUT must be an integer greater than or equal to 1/,
            );
        });

        for (const value of ['-1', '1.5', '10ms', ' ', '9007199254740993']) {
            it(`rejects ${JSON.stringify(value)}`, () =>
                rejects({EXPECT_TIMEOUT: value}, /EXPECT_TIMEOUT must be an integer/));
        }
    });

    describe('evidence', () => {
        it('derives the artifacts directory from REPORT_DIR unless overridden', () => {
            assert.equal(options({REPORT_DIR: 'out'}).artifactsDir, 'out/artifacts');
            assert.equal(
                options({REPORT_DIR: 'out', ARTIFACTS_DIR: 'evidence'}).artifactsDir,
                'evidence',
            );
            assert.equal(options({REPORT_DIR: '  '}).reportDir, 'test-results/cucumber');
        });

        it('validates TRACE and HAR modes', () => {
            assert.equal(options({TRACE: 'off'}).trace, 'off');
            assert.equal(options({HAR: 'replay'}).har, 'replay');
            rejects({TRACE: 'always'}, /TRACE must be one of: off, on-failure, on-first-retry, on/);
            rejects({HAR: 'mock'}, /HAR must be one of: off, record, replay/);
        });

        it('allows on-first-retry only when a retry can happen', () => {
            assert.equal(options({TRACE: 'on-first-retry', RETRY: '1'}).trace, 'on-first-retry');
            rejects({TRACE: 'on-first-retry'}, /records nothing unless RETRY is at least 1/);
            rejects({TRACE: 'on-first-retry', RETRY: '0'}, /RETRY is at least 1/);
        });

        it('records the selected profile name', () =>
            assert.equal(options({ENV: 'ci'}).environment, 'ci'));
    });
});
