const path = require('node:path');
const {spawn} = require('node:child_process');
const {createServer} = require('http-server');

const mode = process.argv[2] || 'start';
if (!['start', 'test', 'test-existing'].includes(mode)) throw new Error('Unknown local app mode');
let child;
let server;
let stopping = false;
function stop(code) {
    if (stopping) return;
    stopping = true;
    process.exitCode = code;
    if (child && child.exitCode === null) child.kill('SIGTERM');
    if (server) {
        server.server.close();
        server.server.closeAllConnections?.();
    }
}
process.on('SIGINT', () => stop(130));
process.on('SIGTERM', () => stop(143));

function runTests() {
    const reportDir = process.env.REPORT_DIR;
    require('./load-env.cjs').loadEnvironment();
    child = spawn(
        process.execPath,
        [
            path.resolve('node_modules/@cucumber/cucumber/bin/cucumber.js'),
            '--config',
            'cucumber.cjs',
            '--profile',
            'local-app',
            'src/test/features/local-app.feature',
            ...process.argv.slice(3),
        ],
        {
            stdio: 'inherit',
            env: {
                ...process.env,
                HOLIDAY_BASE_URL: 'http://localhost:8080',
                REPORT_DIR: reportDir || 'test-results/local-app',
                HEADLESS: 'true',
                BROWSER_WIDTH: '1280',
                BROWSER_HEIGHT: '800',
                HAR: 'off',
                RETRY: '0',
                TRACE: 'on-failure',
            },
        },
    );
    child.on('error', (error) => {
        console.error(error);
        stop(1);
    });
    child.on('exit', (code) => stop(code ?? 1));
}

if (mode === 'test-existing') {
    // Explicit opt-in only: never silently test an unrelated process occupying port 8080.
    runTests();
} else {
    server = createServer({root: path.resolve('public'), cache: -1, showDir: false});
    server.server.on('error', (error) => {
        console.error(
            error.code === 'EADDRINUSE'
                ? 'Port 8080 is busy. Stop its server, or use npm run test:local:running for your existing npm start session.'
                : error,
        );
        stop(1);
    });
    server.listen(8080, '127.0.0.1', () => {
        console.log('Local app ready: http://localhost:8080/');
        if (mode === 'test') runTests();
    });
}
