// Lints for correctness only; formatting belongs to Prettier.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const nodeGlobals = {
    require: 'readonly',
    module: 'writable',
    process: 'readonly',
    console: 'readonly',
    __dirname: 'readonly',
};

export default tseslint.config(
    {ignores: ['node_modules/', 'dist/', 'test-results/', 'public/', 'resources/']},
    js.configs.recommended,
    {
        files: ['**/*.ts'],
        extends: [tseslint.configs.recommended],
        languageOptions: {
            parserOptions: {projectService: true, tsconfigRootDir: import.meta.dirname},
        },
        rules: {
            // An un-awaited Playwright call races the next step: the main source of flaky UI tests.
            '@typescript-eslint/no-floating-promises': [
                'error',
                {
                    // node:test's describe/it return promises the runner itself awaits.
                    allowForKnownSafeCalls: [
                        {from: 'package', package: 'node:test', name: ['describe', 'it']},
                    ],
                },
            ],
            '@typescript-eslint/no-misused-promises': 'error',
            '@typescript-eslint/await-thenable': 'error',
            '@typescript-eslint/require-await': 'error',
            '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
            // Cucumber binds `this` to the World; step callbacks must stay regular functions.
            'prefer-arrow-callback': 'off',
            'no-restricted-syntax': [
                'error',
                {
                    selector: "CallExpression[callee.property.name='waitForTimeout']",
                    message: 'Use a web-first assertion instead of a fixed sleep.',
                },
            ],
        },
    },
    {
        files: ['**/*.cjs'],
        languageOptions: {sourceType: 'commonjs', globals: nodeGlobals},
    },
);
