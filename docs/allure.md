# Allure reporting

Every executing Cucumber profile writes Allure results alongside the existing HTML, JSON, JUnit,
message and rerun reports. Discovery profiles do not instantiate the Allure reporter.
The pinned `allure-cucumberjs` adapter and `allure-js-commons` runtime use Allure Report 2 via
`allure-commandline`. Node runs the tests; **Java 17+** (on PATH, or via JAVA_HOME) generates/views reports.

```sh
npm run allure:clean
npm run test:contract
npm run allure:generate
npm run allure:open
```

Generate after a failing test command too. `npm run allure:serve` generates a temporary report and
opens it. `npm run allure:generate -- --single-file` creates a portable HTML report. `open` and `serve`
accept options such as `--port 5050`. The server stays running until stopped.

## Configuration

`scripts/allure-config.cjs` exposes every adapter option: `resultsDir`, `labels`, `links`, `categories`,
`environmentInfo`, and `globalLabels`. Edit that file for project-specific mappings or categories.
See the [official adapter configuration](https://allurereport.org/docs/cucumberjs-configuration/).

| Variable | Default / use |
|---|---|
| `ALLURE_RESULTS_DIR` | `<REPORT_DIR>/allure-results` |
| `ALLURE_REPORT_DIR` | `<REPORT_DIR>/allure-report`; must be below `test-results/`, separate from results |
| `ALLURE_ISSUE_URL_TEMPLATE` | Optional tracker URL, e.g. `https://tracker.example/browse/%s` |
| `ALLURE_TMS_URL_TEMPLATE` | Optional test-management URL containing `%s` |
| `ALLURE_LABEL_<name>` | Allure native global label, e.g. `ALLURE_LABEL_team=QE` |
| `ALLURE_TESTPLAN_PATH` | Optional Allure TestOps test-plan JSON path |

The usual shell > personal `.env` > `env/.env.<ENV>` precedence applies. No tracker links are fabricated
when a URL template is absent. Environment details use an explicit allowlist, never a dump of secrets.
Default failure categories distinguish timeouts, assertion failures and broken tests.

## Metadata and steps

Existing ID tags such as `@POS-04` become `testCaseId` labels. Features/scenarios/steps, timing,
statuses, errors and retries are captured automatically. Browser and environment are parameters,
so runs in different environments do not become retries of each other; attempt is excluded from
history identity. Keep separate result directories for distinct runs/browser jobs when appropriate.

```gherkin
@epic:HolidayEntitlement @story:FullYear @severity:critical @owner:QE
@suite:Calculator @parentSuite:GOVUK @subSuite:RegularWorkers
@issue:BUG-123 @tms:TC-456
Scenario: Full-year entitlement
```

`@feature:<value>` is also supported. Native tags such as `@allure.label.owner:QE` and
`@allure.id:123` remain available. Metadata can be set dynamically in hooks or steps:

```ts
import * as allure from 'allure-js-commons';

await allure.description('Verify statutory entitlement for a regular worker.');
await allure.owner('QE');
await allure.severity('critical');
await allure.issue('BUG-123');
await allure.parameter('days per week', '5');
await allure.step('Check the calculation', async () => {
    // Existing page-object calls and assertions go here.
});
```

See the [runtime API reference](https://allurereport.org/docs/cucumberjs-reference/) for links,
hierarchies, attachments, descriptions and parameter display modes. Masking a parameter does not
remove it from raw result files; do not attach credentials or secrets.

## Evidence, retries and history

Failure screenshots, diagnostic text and retained Playwright trace ZIPs are embedded as attachments.
Trace capture follows `TRACE`; download the ZIP and use `npx playwright show-trace <downloaded.zip>`.
Allure shows Cucumber hooks and Gherkin steps; it does not automatically record every Playwright API call.

Results accumulate deliberately: retries and `npm run test:failed` join the original run. Run
`allure:clean` before a new independent run to prevent stale tests appearing. It deletes only recognized
Allure result/attachment/metadata files and preserves history and unrelated files. Never clean during
execution. The existing Cucumber reports are preserved.

`allure:generate` copies the previous generated report's `history/` into the results before replacing
the HTML report. Generate once per completed run, and retain the previous HTML report for local trends.
CI generates reports even after failures and uploads raw results plus HTML under the existing
`test-results/` artifact. Each browser job is isolated and includes GitHub executor/build details.
Cross-run CI trends require restoring the previous report's history; this workflow does not persist
history across jobs/runs or publish a public site. The [Jenkins pipeline](jenkins.md) instead uses
the Allure Jenkins plugin to combine suites and manage its report lifecycle; HAR mode is included
as a parameter to distinguish recorded contracts from live runs. Docker writes raw results to the mounted
`test-results/`; generate on the host with Java installed.
