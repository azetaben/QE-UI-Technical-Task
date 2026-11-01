const {loadConfiguration, loadSupport} = require('@cucumber/cucumber/api');

async function main() {
    const {runConfiguration} = await loadConfiguration({file: 'cucumber.cjs'});
    const support = await loadSupport(runConfiguration);
    const seen = new Map();
    for (const definition of support.stepDefinitions) {
        // Cucumber ignores Given/When/Then when matching. Treat the same expression
        // under different keywords as a duplicate, including unused definitions.
        const key = `${typeof definition.pattern}:${definition.pattern.toString()}`;
        const location = `${definition.uri}:${definition.line}`;
        if (seen.has(key)) {
            throw new Error(
                `Duplicate step ${definition.pattern}: ${seen.get(key)} and ${location}`,
            );
        }
        seen.set(key, location);
    }
    console.log(`Verified ${seen.size} unique step patterns.`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
