import {World} from '@cucumber/cucumber';
import {BrowserContext, Page} from '@playwright/test';
import {mkdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {TraceMode} from '../../test-options';

export interface ArtifactOptions {
    directory: string;
    trace: TraceMode;
    /** Upper bound for each failure screenshot; the configured ACTION_TIMEOUT. */
    screenshotTimeout: number;
}

export interface ScenarioIdentity {
    /** Stable ID tag without the @, e.g. POS-04; undefined for untagged scenarios. */
    scenarioId?: string;
    name: string;
    /** 1 for the first run, 2 for the first retry, and so on. */
    attempt: number;
    /** Cucumber's per-attempt ID; keeps Scenario Outline examples that share an ID apart. */
    uniqueId: string;
}

export interface ScenarioOutcome extends ScenarioIdentity {
    failed: boolean;
}

/** `POS-04-attempt1-Full-year_entitlement-1a2b3c4d`: sortable by ID, attempt-aware, collision-free. */
export function artifactStem({scenarioId, name, attempt, uniqueId}: ScenarioIdentity): string {
    const slug = name
        .replace(/[^a-z0-9-]+/gi, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 60);
    return `${scenarioId ?? 'NO-ID'}-attempt${attempt}-${slug}-${uniqueId.slice(0, 8)}`;
}

/**
 * Failure evidence and tracing only; never owns scenario/browser state.
 *
 * Design choice: evidence problems never change a scenario's outcome. A passing scenario stays
 * green and a failing one keeps its original error; any capture problem is attached to the report
 * and written to stderr instead, so it is visible without being mistaken for a product defect.
 */
export class ScenarioArtifacts {
    private readonly tracing = new WeakSet<BrowserContext>();
    private readonly crashes = new WeakMap<BrowserContext, string[]>();

    constructor(private readonly options: ArtifactOptions) {}

    /** Whether this attempt is recorded. `on-first-retry` records only attempt 2, like Playwright. */
    shouldTrace(attempt: number): boolean {
        switch (this.options.trace) {
            case 'off':
                return false;
            case 'on-first-retry':
                return attempt === 2;
            default:
                return true;
        }
    }

    /** Call as soon as the context exists, before anything that can fail, so failures are traced. */
    async start(context: BrowserContext, attempt: number, attach: World['attach']): Promise<void> {
        const crashes: string[] = [];
        this.crashes.set(context, crashes);
        context.on('page', (page) => page.on('crash', () => crashes.push(page.url())));
        if (!this.shouldTrace(attempt)) return;
        try {
            await context.tracing.start({screenshots: true, snapshots: true, sources: true});
            this.tracing.add(context);
        } catch (error) {
            this.report(attach, `Trace could not be started: ${String(error)}`);
        }
    }

    async finish(
        context: BrowserContext,
        outcome: ScenarioOutcome,
        attach: World['attach'],
    ): Promise<void> {
        const stem = artifactStem(outcome);
        for (const url of this.crashes.get(context) ?? []) {
            this.report(attach, `Page crashed during the scenario at ${url || 'an unknown URL'}`);
        }
        if (outcome.failed) await this.screenshots(context, stem, attach);
        await this.stopTrace(context, outcome.failed, stem, attach);
    }

    private async screenshots(
        context: BrowserContext,
        stem: string,
        attach: World['attach'],
    ): Promise<void> {
        const pages = context.pages().filter((page) => !page.isClosed());
        if (!pages.length) {
            const traced = this.tracing.has(context) ? ' The trace shows what happened.' : '';
            this.report(
                attach,
                `No screenshot: no page was open at failure (never created, closed or crashed).${traced}`,
            );
            return;
        }
        // Every open page, so evidence from popups and new tabs is not lost.
        for (const [index, page] of pages.entries()) {
            const file = path.join(this.options.directory, `${stem}${pageSuffix(index)}.png`);
            try {
                await mkdir(this.options.directory, {recursive: true});
                attach(
                    await page.screenshot({
                        path: file,
                        fullPage: true,
                        timeout: this.options.screenshotTimeout,
                    }),
                    'image/png',
                );
            } catch (error) {
                this.report(attach, `Screenshot of ${describe(page)} failed: ${String(error)}`);
            }
        }
    }

    private async stopTrace(
        context: BrowserContext,
        failed: boolean,
        stem: string,
        attach: World['attach'],
    ): Promise<void> {
        // Never started (TRACE=off, a skipped attempt or a start failure): nothing to stop or report.
        if (!this.tracing.delete(context)) return;
        const keep = this.options.trace !== 'on-failure' || failed;
        const file = keep ? path.join(this.options.directory, `${stem}.zip`) : undefined;
        try {
            if (file) await mkdir(this.options.directory, {recursive: true});
            await context.tracing.stop(file ? {path: file} : {});
            if (file) {
                attach(await readFile(file), {
                    mediaType: 'application/zip',
                    fileName: path.basename(file),
                });
            }
        } catch (error) {
            this.report(attach, `Trace capture failed: ${String(error)}`);
        }
    }

    private report(attach: World['attach'], message: string): void {
        attach(message, 'text/plain');
        console.warn(`[evidence] ${message}`);
    }
}

const pageSuffix = (index: number) => (index === 0 ? '' : `-page${index + 1}`);

function describe(page: Page): string {
    return page.url() ? `page ${page.url()}` : 'a blank page';
}
