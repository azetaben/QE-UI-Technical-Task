const os = require('node:os');
const path = require('node:path');

// All supported adapter options live here; no credentials or wholesale process.env export.
function allureOptions(options, env = process.env) {
    const links = {};
    for (const type of ['issue', 'tms']) {
        const template = env[`ALLURE_${type.toUpperCase()}_URL_TEMPLATE`]?.trim();
        if (template) {
            if (!/^https?:\/\//.test(template) || !template.includes('%s')) {
                throw new Error(
                    `ALLURE_${type.toUpperCase()}_URL_TEMPLATE must be an HTTP(S) URL containing %s`,
                );
            }
            links[type] = {
                pattern: [new RegExp(`^@${type}:(.+)$`)],
                urlTemplate: template,
                nameTemplate: `${type.toUpperCase()} %s`,
            };
        }
    }
    return {
        resultsDir:
            env.ALLURE_RESULTS_DIR?.trim() || path.join(options.reportDir, 'allure-results'),
        labels: [
            ...[
                'epic',
                'feature',
                'story',
                'severity',
                'owner',
                'suite',
                'parentSuite',
                'subSuite',
            ].map((name) => ({
                name,
                pattern: [new RegExp(`^@${name}:(.+)$`)],
            })),
            {name: 'testCaseId', pattern: [/^@([A-Z]+-\d+)$/]},
        ],
        links,
        categories: [
            {
                name: 'Timeouts',
                messageRegex: '.*[Tt]imeout.*',
                matchedStatuses: ['failed', 'broken'],
            },
            {name: 'Assertion failures', matchedStatuses: ['failed']},
            {name: 'Test or environment errors', matchedStatuses: ['broken']},
        ],
        environmentInfo: {
            environment: options.environment,
            browser: options.browser,
            channel: options.channel || 'Playwright bundled',
            base_url: options.baseURL,
            headless: String(options.headless),
            viewport: `${options.viewport.width}x${options.viewport.height}`,
            trace: options.trace,
            har: options.har,
            node_version: process.version,
            os_platform: os.platform(),
            os_release: os.release(),
        },
        globalLabels: [
            {name: 'layer', value: 'UI'},
            {name: 'host', value: os.hostname()},
            {name: 'browser', value: options.browser},
            {name: 'environment', value: options.environment},
        ],
    };
}

module.exports = {allureOptions};
