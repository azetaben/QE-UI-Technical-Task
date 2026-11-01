# Jenkins pipeline

The root `Jenkinsfile` runs checks/build, Chromium framework tests, recorded contracts, then the
selected live browser suites. A local accessibility stage also starts/stops the supplied app and runs
`npm run test:local` in Chromium. It runs even when live testing is disabled and currently fails on
the [documented accessibility defects](local-accessibility.md), preserving a failing build status.
It uses the same Playwright `1.64.1` image as the framework's Dockerfile,
with browsers and system dependencies already installed. `npm ci` installs the locked packages.

## Jenkins setup

1. Install **Pipeline** (including Declarative), **Git**, **Docker Pipeline**, **JUnit**, and
   **Allure Report** plugins under **Manage Jenkins → Plugins**.
2. Provide a Linux agent with both `linux` and `docker` labels. Its Jenkins account needs Git,
   Docker CLI/daemon access, a writable workspace and Java 17+ on PATH (or JAVA_HOME).
   The Docker daemon must run on the agent and be able to mount its workspace. The controller
   itself does not need browsers or Node.js. Container processes run as the agent UID through
   Docker Pipeline; `/tmp/holiday-ui-npm-cache` avoids an unwritable home-directory npm cache.
3. Under **Manage Jenkins → Tools → Allure Commandline**, create an installation named exactly
   **Allure-2.46.1**, using version **2.46.1**, matching `package.json`. If the installer does not
   offer that version, provision it on the agent and configure its installation directory.
   Use the plugin's Allure 2 mode/default. Java/report generation runs on the host after the
   test container exits; Java is not required inside the Playwright container.
4. Create a **Multibranch Pipeline**, connect this repository with the appropriate Jenkins SCM
   credentials, and leave the script path as `Jenkinsfile`. Alternatively, create a Pipeline
   job using **Pipeline script from SCM**, selecting this repository and the same script path.
5. Run the first build to register the parameters; subsequent builds expose **Build with Parameters**.
   Configure repository webhooks/branch discovery in Jenkins. No nightly schedule is enabled
   automatically; optionally add one in the job configuration according to your test budget.

The agent/container requires access to the container registry and npm for setup. Live tests also
need GOV.UK access. Framework/contract scenarios use local HTML or committed HAR responses. Keep
credentials in Jenkins SCM configuration; the tests do not need credentials injected into reports.

References: [Docker Pipeline setup](https://www.jenkins.io/doc/book/pipeline/docker/),
[Allure plugin/tool setup](https://allurereport.org/docs/integrations-jenkins/),
[Allure pipeline step](https://www.jenkins.io/doc/pipeline/steps/allure-jenkins-plugin/).

## Build parameters

| Parameter | Default | Options |
|---|---|---|
| `RUN_LIVE` | true | Disable for checks, framework tests and recorded contracts only |
| `BROWSER` | all | all, chromium, firefox, webkit; only affects live tests |
| `LIVE_SUITE` | full | full or smoke |
| `WORKERS` | 2 | 2, 1, or 0 (serial) |
| `RETRIES` | 1 | 1, 0, or 2 |

All runs use `ENV=ci`, headless browsers, no branded channel and `TRACE=on-failure` (including
first-attempt failures with retries disabled). With `BROWSER=all`, engines run concurrently using
Jenkins parallel branches, each with its own Cucumber workers and output directory. The default
`WORKERS=2` allows up to six scenario workers; select 1 or 0 on smaller agents. A failing browser
does not cancel the others. The pipeline has a 60-minute timeout, disables concurrent builds of the same job, retains
20 builds and keeps artifacts for the latest 10. Adjust these settings in `Jenkinsfile` as needed.

## Results and failure handling

Checks/install/build failures stop testing. Test failures mark the build **FAILURE**, while allowing
the other suites to finish. Manual aborts and timeouts propagate instead of being swallowed by
`catchError`. Retry summaries appear in the console. No shell command suppresses a test failure.

Each run starts with a clean Jenkins workspace. Report paths are:

| Suite | Directory |
|---|---|
| Contracts | `test-results/jenkins/contract` |
| Local accessibility | `test-results/jenkins/local-app` |
| Live browser | `test-results/jenkins/chromium`, `firefox`, or `webkit` |
| Combined Allure HTML | `test-results/jenkins/allure-report` |

The pipeline publishes Cucumber JUnit XML to Jenkins **Test Result** and combines Allure result
directories into **Allure Report**, even after tests fail. Browser, environment and HAR-mode
parameters keep live/recorded executions distinct in Allure history. The Allure Jenkins plugin
owns report generation/build metadata/history; `npm run allure:generate` is for local/other CI use.
Framework/unit `node:test` output stays in the console; those suites do not produce Cucumber JUnit.

Raw Allure results, Cucumber HTML/JSON/XML/messages, screenshots and traces are archived in the
final cleanup action even if Allure generation fails. Missing results after failed setup are
reported without manufacturing an empty passing report. The archive does not include `node_modules`.

## Validation

The Jenkins agent and plugin installation are deployment prerequisites, not provisioned by the
repository. Before enabling regular builds, validate the Jenkinsfile with the target controller's
Declarative Pipeline linter (`/pipeline-model-converter/validate`) and run a build with
`RUN_LIVE=false`, then a live smoke build. Check report links, attachments and build status.
This repository does not imply that a hosted Jenkins build has already run successfully.
