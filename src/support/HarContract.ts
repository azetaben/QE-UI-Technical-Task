import {BrowserContext} from '@playwright/test';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {TestOptions} from '../../test-options';

export const CONTRACT_TAG = '@contract';
const SCENARIO_ID = /^@[A-Z]+-\d+$/;

/**
 * Serves @contract scenarios from a recorded HAR so pull requests get a fast, hermetic signal
 * that does not depend on GOV.UK being reachable. The full live suite still runs on a schedule:
 * a contract run proves the tests and recorded pages agree, not that the live site is unchanged.
 */
export class HarContract {
    constructor(private readonly options: Pick<TestOptions, 'har' | 'harDir'>) {}

    /** HAR path for a scenario, keyed by its stable ID tag; undefined when HAR does not apply. */
    fileFor(tags: readonly string[]): string | undefined {
        if (this.options.har === 'off' || !tags.includes(CONTRACT_TAG)) return undefined;
        const ids = tags.filter((tag) => SCENARIO_ID.test(tag));
        if (ids.length !== 1) {
            throw new Error(
                `${CONTRACT_TAG} scenarios need exactly one ID tag such as @POS-01, found: ${ids}`,
            );
        }
        return path.join(this.options.harDir, `${ids[0].slice(1)}.har.zip`);
    }

    async route(context: BrowserContext, tags: readonly string[]): Promise<string | undefined> {
        const file = this.fileFor(tags);
        if (!file) return undefined;
        const record = this.options.har === 'record';
        if (!record && !existsSync(file)) {
            throw new Error(
                `No recording at ${file}. Run npm run test:contract:record against the live site.`,
            );
        }
        // Replay aborts anything unrecorded, so an unexpected request fails instead of leaking to the network.
        await context.routeFromHAR(file, {
            update: record,
            updateContent: 'attach',
            updateMode: 'minimal',
            notFound: 'abort',
        });
        return file;
    }
}
