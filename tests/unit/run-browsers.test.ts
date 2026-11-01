import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {it} from 'node:test';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- the CLI runner is CommonJS
const {runBrowsers} = require('../../scripts/run-browsers.cjs') as {
    runBrowsers(options: {cli: string; args: string[]; env: NodeJS.ProcessEnv}): Promise<number>;
};

it('starts all three browsers concurrently, isolates outputs and waits for every result after a failure', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'browser-matrix-'));
    try {
        const cli = path.join(root, 'fixture.cjs');
        writeFileSync(
            cli,
            `
const fs = require('node:fs');
const path = require('node:path');
const root = process.env.MATRIX_BARRIER;
const browser = process.env.BROWSER;
const timer = setTimeout(() => {console.error('All three processes must be running together');process.exit(2);}, 10000);
const watcher = fs.watch(root, finish);
let done = false;
function finish() {
    if (done || !['chromium','firefox','webkit'].every(b => fs.existsSync(path.join(root,b+'.started')))) return;
    done = true;
    fs.writeFileSync(path.join(root,browser+'.done'), JSON.stringify({
        report:process.env.REPORT_DIR, artifacts:process.env.ARTIFACTS_DIR,
        allure:process.env.ALLURE_RESULTS_DIR, channel:process.env.CHANNEL,
    }));
    clearTimeout(timer);
    watcher.close();
    process.exitCode = browser === 'firefox' ? 1 : 0;
}
fs.writeFileSync(path.join(root,browser+'.started'), '');
finish();
`,
        );
        const code = await runBrowsers({
            cli,
            args: [],
            env: {
                ...process.env,
                HAR: 'off',
                CHANNEL: 'chrome',
                MATRIX_BARRIER: root,
                CROSS_BROWSER_REPORT_DIR: path.join(root, 'reports'),
                ARTIFACTS_DIR: path.join(root, 'artifacts'),
                ALLURE_RESULTS_DIR: path.join(root, 'allure'),
            },
        });
        assert.equal(code, 1);
        for (const browser of ['chromium', 'firefox', 'webkit']) {
            assert.deepEqual(JSON.parse(readFileSync(path.join(root, `${browser}.done`), 'utf8')), {
                report: path.join(root, 'reports', browser),
                artifacts: path.join(root, 'artifacts', browser),
                allure: path.join(root, 'allure', browser),
                channel: '',
            });
        }
    } finally {
        rmSync(root, {recursive: true, force: true});
    }
});

it('rejects concurrent HAR recording before starting any browser', async () => {
    await assert.rejects(
        runBrowsers({cli: 'unused', args: [], env: {HAR: 'record'}}),
        /one browser/,
    );
});
