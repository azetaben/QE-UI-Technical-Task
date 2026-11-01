const {existsSync, readFileSync} = require('node:fs');
const {spawnSync} = require('node:child_process');
const path = require('node:path');
require('./load-env.cjs').loadEnvironment();
const reportDirectory = process.env.REPORT_DIR?.trim() || 'test-results/cucumber';
const file = path.join(reportDirectory, 'rerun.txt');
if (!existsSync(file) || !readFileSync(file, 'utf8').trim()) {
    console.error(`No failed scenario locations found in ${file}. Run npm test first.`);
    process.exitCode = 1;
} else {
    // Read locations before Cucumber opens any output formatter. Do not rerun the full suite.
    const locations = readFileSync(file, 'utf8').trim().split(/\s+/);
    const cli = path.join(
        path.dirname(require.resolve('@cucumber/cucumber/package.json')),
        'bin/cucumber.js',
    );
    const result = spawnSync(
        process.execPath,
        [
            cli,
            '--config',
            'cucumber.cjs',
            '--profile',
            'rerun',
            ...locations,
            ...process.argv.slice(2),
        ],
        {stdio: 'inherit'},
    );
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
}
