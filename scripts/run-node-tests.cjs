// Runs node:test suites under a directory. `node --test <glob>` passes with zero tests when the
// glob matches nothing, which turns a missing suite into a false green; fail loudly instead.
const {existsSync, readdirSync} = require('node:fs');
const {spawnSync} = require('node:child_process');
const path = require('node:path');

const directory = process.argv[2];
if (!directory) throw new Error('Usage: node scripts/run-node-tests.cjs <test-directory>');
const files = existsSync(directory)
    ? readdirSync(directory)
          .filter((file) => file.endsWith('.test.ts'))
          .sort()
          .map((file) => path.join(directory, file))
    : [];
if (!files.length) {
    console.error(`No *.test.ts files found in ${directory}; refusing to report an empty pass.`);
    process.exitCode = 1;
} else {
    const result = spawnSync(
        process.execPath,
        // A hung test must fail, not stall CI until the job is killed.
        [
            '--require',
            'ts-node/register/transpile-only',
            '--test',
            '--test-timeout=60000',
            ...files,
        ],
        {stdio: 'inherit'},
    );
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
}
