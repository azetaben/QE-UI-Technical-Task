// Reports scenarios that needed a retry. RETRY keeps a noisy live site from blocking the pipeline,
// but a pass on retry is still a signal: list every one instead of letting it read as green.
// Reads Cucumber's message (NDJSON) output; appends a table to the GitHub job summary when present.
const {appendFileSync, existsSync, readdirSync, readFileSync} = require('node:fs');
const path = require('node:path');
require('./load-env.cjs').loadEnvironment();

const reportDir = process.env.REPORT_DIR?.trim() || 'test-results/cucumber';

function attemptsByScenario(file) {
    const pickles = new Map();
    const testCases = new Map();
    const started = new Map();
    const scenarios = new Map();
    for (const [index, line] of readFileSync(file, 'utf8').split('\n').entries()) {
        if (!line.trim()) continue;
        let message;
        try {
            message = JSON.parse(line);
        } catch {
            // Usually two runs wrote the same REPORT_DIR at once; the evidence cannot be trusted.
            throw new Error(
                `${file}:${index + 1} is not valid NDJSON. Was another run writing to ${reportDir}?`,
            );
        }
        if (message.pickle) pickles.set(message.pickle.id, message.pickle);
        else if (message.testCase) testCases.set(message.testCase.id, message.testCase.pickleId);
        else if (message.testCaseStarted) {
            const {id, testCaseId} = message.testCaseStarted;
            started.set(id, {pickle: pickles.get(testCases.get(testCaseId)), failed: false});
        } else if (message.testStepFinished) {
            const status = message.testStepFinished.testStepResult.status;
            if (status === 'FAILED')
                started.get(message.testStepFinished.testCaseStartedId).failed = true;
        } else if (message.testCaseFinished) {
            const attempt = started.get(message.testCaseFinished.testCaseStartedId);
            const key = attempt.pickle.id;
            const entry = scenarios.get(key) ?? {pickle: attempt.pickle, attempts: []};
            entry.attempts.push(attempt.failed ? 'failed' : 'passed');
            scenarios.set(key, entry);
        }
    }
    return [...scenarios.values()];
}

const files = existsSync(reportDir)
    ? readdirSync(reportDir).filter((file) => file.endsWith('messages.ndjson'))
    : [];
if (!files.length) {
    console.error(`No Cucumber message reports in ${reportDir}; run the suite first.`);
    process.exitCode = 1;
} else {
    const retried = files
        .flatMap((file) => attemptsByScenario(path.join(reportDir, file)))
        .filter(({attempts}) => attempts.length > 1)
        .map(({pickle, attempts}) => ({
            id: pickle.tags.map((tag) => tag.name).find((tag) => /^@[A-Z]+-\d+$/.test(tag)) ?? '-',
            name: pickle.name,
            uri: pickle.uri,
            outcome:
                attempts.at(-1) === 'passed' ? 'flaky (passed on retry)' : 'failed every attempt',
            attempts: attempts.join(' → '),
        }));
    const lines = retried.length
        ? [
              `### ${retried.length} scenario(s) needed a retry`,
              '',
              '| ID | Scenario | Outcome | Attempts |',
              '| --- | --- | --- | --- |',
              ...retried.map((r) => `| ${r.id} | ${r.name} | ${r.outcome} | ${r.attempts} |`),
          ]
        : ['### No scenario needed a retry'];
    console.log(lines.join('\n'));
    if (process.env.GITHUB_STEP_SUMMARY) {
        appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`);
    }
}
