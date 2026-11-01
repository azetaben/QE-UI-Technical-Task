/** The single runtime contract shared by Cucumber, browser lifecycle and pages. */
export interface TestOptions {
    /** Name of the loaded env/.env.<ENV> profile, recorded with failure evidence. */
    environment: string;
    baseURL: string;
    browser: Browser;
    channel?: Channel;
    headless: boolean;
    stepTimeout: number;
    actionTimeout: number;
    navigationTimeout: number;
    expectTimeout: number;
    viewport: {width: number; height: number};
    artifactsDir: string;
    reportDir: string;
    parallel: number;
    retry: number;
    trace: TraceMode;
    har: HarMode;
    harDir: string;
}

export const BROWSERS = ['chromium', 'firefox', 'webkit'] as const;
export const CHANNELS = ['chrome', 'msedge'] as const;
/**
 * `on-failure` records every attempt but keeps only failing traces. `on-first-retry` records only
 * the first retry (Playwright's CI default): first attempts run untraced, so it is far cheaper.
 */
export const TRACE_MODES = ['off', 'on-failure', 'on-first-retry', 'on'] as const;
/** `replay` serves @contract scenarios from recorded HAR files; `record` refreshes them. */
export const HAR_MODES = ['off', 'record', 'replay'] as const;

export type Browser = (typeof BROWSERS)[number];
export type Channel = (typeof CHANNELS)[number];
export type TraceMode = (typeof TRACE_MODES)[number];
export type HarMode = (typeof HAR_MODES)[number];

const DEFAULT_BASE_URL = 'https://www.gov.uk/calculate-your-holiday-entitlement';
const DEFAULT_REPORT_DIR = 'test-results/cucumber';

function integer(env: NodeJS.ProcessEnv, name: string, fallback: number, minimum = 1): number {
    const value = env[name] ?? String(fallback);
    if (!/^\d+$/.test(value) || Number(value) < minimum || !Number.isSafeInteger(Number(value))) {
        throw new Error(`${name} must be an integer greater than or equal to ${minimum}`);
    }
    return Number(value);
}

function oneOf<T extends string>(
    env: NodeJS.ProcessEnv,
    name: string,
    allowed: readonly T[],
    fallback: T,
): T {
    const value = env[name] ?? fallback;
    if (!(allowed as readonly string[]).includes(value)) {
        throw new Error(`${name} must be one of: ${allowed.join(', ')}`);
    }
    return value as T;
}

function directory(env: NodeJS.ProcessEnv, name: string, fallback: string): string {
    return env[name]?.trim() || fallback;
}

function baseURL(env: NodeJS.ProcessEnv): string {
    const value = env.HOLIDAY_BASE_URL ?? DEFAULT_BASE_URL;
    let parsed: URL;
    try {
        parsed = new URL(value);
    } catch {
        throw new Error('HOLIDAY_BASE_URL must be a valid URL');
    }
    if (
        !['http:', 'https:'].includes(parsed.protocol) ||
        parsed.username ||
        parsed.password ||
        parsed.search ||
        parsed.hash
    ) {
        throw new Error(
            'HOLIDAY_BASE_URL must use HTTP(S) without credentials, a query or a fragment',
        );
    }
    return value.replace(/\/$/, '');
}

export function getTestOptions(env: NodeJS.ProcessEnv = process.env): TestOptions {
    const browser = oneOf(env, 'BROWSER', BROWSERS, 'chromium');
    const channel = env.CHANNEL || undefined;
    if (channel && (!(CHANNELS as readonly string[]).includes(channel) || browser !== 'chromium')) {
        throw new Error('CHANNEL must be chrome or msedge and requires BROWSER=chromium');
    }
    const reportDir = directory(env, 'REPORT_DIR', DEFAULT_REPORT_DIR);
    const retry = integer(env, 'RETRY', 0, 0);
    const trace = oneOf(env, 'TRACE', TRACE_MODES, 'on-failure');
    if (trace === 'on-first-retry' && retry === 0) {
        throw new Error('TRACE=on-first-retry records nothing unless RETRY is at least 1');
    }
    return {
        environment: env.ENV?.trim() || 'local',
        baseURL: baseURL(env),
        browser,
        channel: channel as Channel | undefined,
        headless: oneOf(env, 'HEADLESS', ['true', 'false'], 'true') === 'true',
        stepTimeout: integer(env, 'STEP_TIMEOUT', 60000),
        actionTimeout: integer(env, 'ACTION_TIMEOUT', 10000),
        navigationTimeout: integer(env, 'NAVIGATION_TIMEOUT', 30000),
        expectTimeout: integer(env, 'EXPECT_TIMEOUT', 5000),
        viewport: {
            width: integer(env, 'BROWSER_WIDTH', 1280),
            height: integer(env, 'BROWSER_HEIGHT', 800),
        },
        artifactsDir: directory(env, 'ARTIFACTS_DIR', `${reportDir}/artifacts`),
        reportDir,
        parallel: integer(env, 'PARALLEL', 0, 0),
        retry,
        trace,
        har: oneOf(env, 'HAR', HAR_MODES, 'off'),
        harDir: directory(env, 'HAR_DIR', 'resources/har'),
    };
}
