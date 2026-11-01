import assert from 'node:assert/strict';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {afterEach, beforeEach, describe, it} from 'node:test';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- the loader is CommonJS so cucumber.cjs can use it
const {loadEnvironment, availableProfiles} = require('../../scripts/load-env.cjs') as {
    loadEnvironment(options: {rootDir: string; env: NodeJS.ProcessEnv}): string;
    availableProfiles(profileDir: string): string[];
};

describe('loadEnvironment', () => {
    let rootDir: string;

    const write = (file: string, content: string) => {
        mkdirSync(path.dirname(path.join(rootDir, file)), {recursive: true});
        writeFileSync(path.join(rootDir, file), content);
    };

    beforeEach(() => {
        rootDir = mkdtempSync(path.join(tmpdir(), 'load-env-'));
        write('env/.env.local', 'BROWSER=firefox\nHEADLESS=false\nRETRY=0\n');
        write('env/.env.ci', 'BROWSER=webkit\nRETRY=1\n');
    });
    afterEach(() => rmSync(rootDir, {recursive: true, force: true}));

    it('loads the local profile by default', () => {
        const env: NodeJS.ProcessEnv = {};
        assert.equal(loadEnvironment({rootDir, env}), 'local');
        assert.deepEqual(env, {ENV: 'local', BROWSER: 'firefox', HEADLESS: 'false', RETRY: '0'});
    });

    it('loads the profile named by ENV', () => {
        const env: NodeJS.ProcessEnv = {ENV: 'ci'};
        loadEnvironment({rootDir, env});
        assert.equal(env.BROWSER, 'webkit');
        assert.equal(env.HEADLESS, undefined, 'values must not leak in from other profiles');
    });

    it('applies precedence: real environment > personal .env > profile', () => {
        write('.env', 'BROWSER=chromium\nHEADLESS=true\n');
        const env: NodeJS.ProcessEnv = {HEADLESS: 'false'};
        loadEnvironment({rootDir, env});
        assert.equal(env.HEADLESS, 'false', 'real environment wins');
        assert.equal(env.BROWSER, 'chromium', 'personal .env beats the profile');
        assert.equal(env.RETRY, '0', 'profile fills the remaining gaps');
    });

    it('rejects an unknown profile and lists the available ones', () => {
        assert.throws(
            () => loadEnvironment({rootDir, env: {ENV: 'prod'}}),
            /ENV=prod has no env\/\.env\.prod profile\. Available: ci, local/,
        );
    });

    it('lists profiles from the committed env directory', () => {
        assert.deepEqual(availableProfiles(path.resolve(__dirname, '../../env')), [
            'ci',
            'local',
            'staging',
        ]);
    });
});
