const {spawnSync} = require('node:child_process');
const {readFileSync, mkdtempSync, rmSync} = require('node:fs');
const {tmpdir} = require('node:os');
const path = require('node:path');

// Cucumber dry-run can exit successfully with undefined steps; inspect its report too.
const temporaryDirectory = mkdtempSync(path.join(tmpdir(), 'holiday-steps-'));
try {
    const report = path.join(temporaryDirectory, 'steps.json');
    const cli = path.join(
        path.dirname(require.resolve('@cucumber/cucumber/package.json')),
        'bin/cucumber.js',
    );
    const run = spawnSync(
        process.execPath,
        [
            cli,
            '--config',
            'cucumber.cjs',
            '--profile',
            'all',
            '--dry-run',
            'src/test/features/**/*.feature',
            '--format',
            `json:${JSON.stringify(report.replaceAll('\\', '/'))}`,
        ],
        {stdio: 'inherit'},
    );
    if (run.error) throw run.error;
    if (run.status !== 0) process.exitCode = run.status ?? 1;
    else {
        const features = JSON.parse(readFileSync(report, 'utf8'));
        const scenarios = features.flatMap((feature) => feature.elements ?? []);
        const invalid = scenarios
            .flatMap((scenario) => scenario.steps ?? [])
            .filter((step) => ['undefined', 'ambiguous'].includes(step.result?.status));
        const ids = new Set(
            scenarios.flatMap((scenario) => scenario.tags ?? []).map((tag) => tag.name),
        );
        const missing = [];
        for (const [prefix, count] of Object.entries({
            POS: 14,
            NEG: 12,
            EDGE: 15,
            ACC: 4,
            COMP: 1,
        })) {
            for (let index = 1; index <= count; index++) {
                const id = `@${prefix}-${String(index).padStart(2, '0')}`;
                if (!ids.has(id)) missing.push(id);
            }
        }
        if (!scenarios.length || invalid.length || missing.length) {
            throw new Error(
                `Coverage failed. Undefined/ambiguous: ${invalid.map((step) => step.name)}. Missing IDs: ${missing}`,
            );
        }
        console.log(
            `Verified ${scenarios.length} scenarios, all 47 scenario IDs, and no undefined or ambiguous bindings.`,
        );
    }
} finally {
    rmSync(temporaryDirectory, {recursive: true, force: true});
}
