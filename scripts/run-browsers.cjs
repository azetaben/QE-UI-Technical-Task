const {spawn} = require('node:child_process');
const {mkdirSync} = require('node:fs');
const path = require('node:path');
const {createInterface} = require('node:readline');

const browsers = ['chromium', 'firefox', 'webkit'];

async function runBrowsers({cli, args, env}) {
    if (env.HAR === 'record') {
        throw new Error(
            'Record HAR files with one browser using test:contract:record; concurrent writers would overwrite recordings.',
        );
    }
    const root = env.CROSS_BROWSER_REPORT_DIR?.trim() || 'test-results/cross-browser';
    const children = new Set();
    let interrupted = false;
    const stop = () => {
        interrupted = true;
        for (const child of children) child.kill('SIGTERM');
    };
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
    try {
        const outcomes = await Promise.all(
            browsers.map(
                (browser) =>
                    new Promise((resolve) => {
                        const reportDir = path.join(root, browser);
                        mkdirSync(reportDir, {recursive: true});
                        console.log(`[${browser}] Starting Cucumber; reports: ${reportDir}`);
                        const child = spawn(process.execPath, [cli, ...args], {
                            env: {
                                ...env,
                                BROWSER: browser,
                                CHANNEL: '',
                                REPORT_DIR: reportDir,
                                ARTIFACTS_DIR: env.ARTIFACTS_DIR
                                    ? path.join(env.ARTIFACTS_DIR, browser)
                                    : path.join(reportDir, 'artifacts'),
                                ALLURE_RESULTS_DIR: env.ALLURE_RESULTS_DIR
                                    ? path.join(env.ALLURE_RESULTS_DIR, browser)
                                    : path.join(reportDir, 'allure-results'),
                            },
                            stdio: ['ignore', 'pipe', 'pipe'],
                        });
                        children.add(child);
                        for (const stream of [child.stdout, child.stderr]) {
                            createInterface({input: stream}).on('line', (line) =>
                                console.log(`[${browser}] ${line}`),
                            );
                        }
                        child.on('error', (error) =>
                            console.error(`[${browser}] ${error.message}`),
                        );
                        child.on('close', (code) => {
                            children.delete(child);
                            console.log(`[${browser}] Finished with exit code ${code ?? 1}`);
                            resolve(code ?? 1);
                        });
                    }),
            ),
        );
        return interrupted ? 130 : outcomes.every((code) => code === 0) ? 0 : 1;
    } finally {
        process.removeListener('SIGINT', stop);
        process.removeListener('SIGTERM', stop);
    }
}

if (require.main === module) {
    const headless = process.env.HEADLESS ?? 'true';
    require('./load-env.cjs').loadEnvironment();
    runBrowsers({
        cli: path.resolve('node_modules/@cucumber/cucumber/bin/cucumber.js'),
        args: [
            '--config',
            'cucumber.cjs',
            'src/test/features/**/*.feature',
            ...process.argv.slice(2),
        ],
        env: {...process.env, HEADLESS: headless},
    })
        .then((code) => {
            process.exitCode = code;
        })
        .catch((error) => {
            console.error(error);
            process.exitCode = 1;
        });
}

module.exports = {runBrowsers};
