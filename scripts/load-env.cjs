// Loads configuration with one precedence order for every entry point:
//   1. real environment variables (shell, CI, IDE run configuration)
//   2. a personal, git-ignored .env in the project root
//   3. the committed env/.env.<ENV> profile (ENV defaults to "local")
//   4. defaults in test-options.ts
// dotenv never overrides a variable that is already set, so loading in that order is enough.
const {existsSync, readdirSync} = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

const PROFILE_PREFIX = '.env.';

function availableProfiles(profileDir) {
    if (!existsSync(profileDir)) return [];
    return readdirSync(profileDir)
        .filter((file) => file.startsWith(PROFILE_PREFIX))
        .map((file) => file.slice(PROFILE_PREFIX.length))
        .sort();
}

function loadEnvironment({rootDir = path.resolve(__dirname, '..'), env = process.env} = {}) {
    const profileDir = path.join(rootDir, 'env');
    const profile = env.ENV?.trim() || 'local';
    const profiles = availableProfiles(profileDir);
    if (!profiles.includes(profile)) {
        throw new Error(
            `ENV=${profile} has no env/${PROFILE_PREFIX}${profile} profile. Available: ${profiles.join(', ') || 'none'}`,
        );
    }
    env.ENV = profile;
    const personal = path.join(rootDir, '.env');
    if (existsSync(personal)) dotenv.config({path: personal, processEnv: env, quiet: true});
    dotenv.config({
        path: path.join(profileDir, PROFILE_PREFIX + profile),
        processEnv: env,
        quiet: true,
    });
    return profile;
}

module.exports = {loadEnvironment, availableProfiles};
