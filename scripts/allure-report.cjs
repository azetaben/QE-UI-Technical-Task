const fs = require('node:fs');
const path = require('node:path');
require('./load-env.cjs').loadEnvironment();
require('ts-node/register/transpile-only');
const {getTestOptions} = require('../test-options');
const {allureOptions} = require('./allure-config.cjs');
const options = getTestOptions();
const results = path.resolve(allureOptions(options).resultsDir);
const report = path.resolve(
    process.env.ALLURE_REPORT_DIR?.trim() || path.join(options.reportDir, 'allure-report'),
);
const command = process.argv[2];
const extra = process.argv.slice(3);

// Output cleanup must never target source files, the results directory or its parents.
const outputRoot = path.resolve('test-results');
const inside = (parent, child) => {
    const relative = path.relative(parent, child);
    return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
};
if (
    !inside(outputRoot, report) ||
    report === results ||
    inside(report, results) ||
    inside(results, report)
) {
    throw new Error(
        'ALLURE_REPORT_DIR must be below test-results/ and separate from ALLURE_RESULTS_DIR',
    );
}

if (command === 'clean') {
    // Only delete recognized generated files. Keep history and unrelated files intact.
    if (fs.existsSync(results)) {
        for (const entry of fs.readdirSync(results, {withFileTypes: true})) {
            if (
                entry.isFile() &&
                (/^[a-f0-9-]+-(result\.json|container\.json|attachment(?:\..+)?)$/i.test(
                    entry.name,
                ) ||
                    ['categories.json', 'environment.properties', 'executor.json'].includes(
                        entry.name,
                    ))
            ) {
                fs.unlinkSync(path.join(results, entry.name));
            }
        }
    }
    console.log(`Cleaned Allure results in ${results}; history retained.`);
} else if (['generate', 'open', 'serve'].includes(command)) {
    if (command !== 'open') {
        if (
            !fs.existsSync(results) ||
            !fs.readdirSync(results).some((file) => file.endsWith('-result.json'))
        ) {
            throw new Error(`No Allure test results in ${results}. Run the tests first.`);
        }
        const history = path.join(report, 'history');
        if (fs.existsSync(history))
            fs.cpSync(history, path.join(results, 'history'), {recursive: true});
        if (process.env.GITHUB_ACTIONS === 'true') {
            const buildUrl = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
            fs.writeFileSync(
                path.join(results, 'executor.json'),
                JSON.stringify(
                    {
                        name: 'GitHub Actions',
                        type: 'github',
                        buildUrl,
                        buildName: `${process.env.GITHUB_WORKFLOW} #${process.env.GITHUB_RUN_NUMBER}`,
                        buildOrder: Number(process.env.GITHUB_RUN_NUMBER),
                    },
                    null,
                    2,
                ),
            );
        }
    } else if (!fs.existsSync(path.join(report, 'index.html'))) {
        throw new Error('No generated Allure report. Run npm run allure:generate first.');
    }
    const args =
        command === 'generate'
            ? ['generate', results, '--clean', '-o', report, ...extra]
            : command === 'open'
              ? ['open', report, ...extra]
              : ['serve', results, ...extra];
    const child = require('allure-commandline')(args);
    child.on('error', (error) => {
        console.error(error.message);
        process.exitCode = 1;
    });
    child.on('exit', (code) => {
        process.exitCode = code ?? 1;
    });
} else {
    throw new Error(
        'Usage: node scripts/allure-report.cjs <clean|generate|open|serve> [Allure CLI options]',
    );
}
