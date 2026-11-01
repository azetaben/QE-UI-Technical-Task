// One configuration for local runs, CI and parallel Cucumber workers.
const fs = require('node:fs');
const path = require('node:path');
require('./scripts/load-env.cjs').loadEnvironment();
process.env.FORCE_COLOR ??= '0';
process.env.TS_NODE_PROJECT ??= path.resolve(__dirname, 'tsconfig.json');
// Type safety is enforced by npm run check; avoid a compiler instance per UI worker.
require('ts-node/register/transpile-only');
const {getTestOptions} = require('./test-options');
const options = getTestOptions();
const {allureOptions} = require('./scripts/allure-config.cjs');
fs.mkdirSync(options.reportDir, {recursive: true});
const runnable = 'not @manual and not @requires_confirmation and not @local_app';
// Feature paths are supplied by npm scripts or the IDE, never merged from here.
const support = {
    requireModule: ['ts-node/register/transpile-only'],
    require: [
        require.resolve('allure-cucumberjs').replaceAll('\\', '/'),
        'src/hooks/CustomWorld.ts',
        'src/hooks/Hooks.ts',
        'src/test/steps/**/*.ts',
    ],
    formatOptions: {snippetInterface: 'async-await', ...allureOptions(options)},
    parallel: options.parallel,
    retry: options.retry,
    strict: true,
};
const fileFormat = (type, name) =>
    `${type}:${JSON.stringify(path.join(options.reportDir, name).replaceAll('\\', '/'))}`;
// html for people, json/junit for tools, message (NDJSON) for the flaky-retry report.
const reports = (prefix = '') => [
    'progress',
    fileFormat('allure-cucumberjs/reporter', `${prefix}allure-formatter.log`),
    fileFormat('html', `${prefix}report.html`),
    fileFormat('json', `${prefix}report.json`),
    fileFormat('junit', `${prefix}junit.xml`),
    fileFormat('message', `${prefix}messages.ndjson`),
    fileFormat('rerun', 'rerun.txt'),
];
module.exports = {
    default: {...support, tags: runnable, format: reports()},
    smoke: {...support, tags: `(${runnable}) and @smoke`, format: reports()},
    contract: {...support, tags: `(${runnable}) and @contract`, format: reports('contract-')},
    'local-app': {...support, tags: '@local_app', format: reports()},
    // Discovery only: never write report files, so a dry run cannot clobber a real run's evidence.
    'dry-run': {...support, tags: runnable, dryRun: true, format: ['summary']},
    all: {...support, dryRun: true, format: ['summary']},
    rerun: {...support, tags: runnable, format: reports('rerun-')},
};
