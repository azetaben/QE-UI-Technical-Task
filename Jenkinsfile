pipeline {
    // See docs/jenkins.md for the agent, plugins and Allure tool installation.
    agent { label 'linux && docker' }

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timeout(time: 60, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '10'))
    }

    parameters {
        booleanParam(name: 'RUN_LIVE', defaultValue: true, description: 'Run GOV.UK tests after the local and recorded-contract tests')
        choice(name: 'BROWSER', choices: ['all', 'chromium', 'firefox', 'webkit'], description: 'Browser engines for the live suite; contract tests always use Chromium')
        choice(name: 'LIVE_SUITE', choices: ['full', 'smoke'], description: 'Live scenario selection')
        choice(name: 'WORKERS', choices: ['2', '1', '0'], description: 'Cucumber workers; 0 runs serially')
        choice(name: 'RETRIES', choices: ['1', '0', '2'], description: 'Scenario retries; retry details are printed to the console')
    }

    environment {
        ENV = 'ci'
        // The BROWSER parameter can be 'all'; framework configuration needs a real engine.
        BROWSER = 'chromium'
        HAR = 'off'
        HEADLESS = 'true'
        CHANNEL = ''
        PARALLEL = "${params.WORKERS}"
        RETRY = "${params.RETRIES}"
        // Retain first-attempt failure evidence even when retries are disabled.
        TRACE = 'on-failure'
        FORCE_COLOR = '0'
        npm_config_cache = '/tmp/holiday-ui-npm-cache'
    }

    stages {
        stage('Checkout') {
            steps {
                // A fresh workspace prevents old reports or a personal .env affecting this build.
                deleteDir()
                checkout scm
            }
        }

        stage('Test framework') {
            agent {
                docker {
                    image 'mcr.microsoft.com/playwright:v1.64.1-noble'
                    args '--init --ipc=host'
                    reuseNode true
                }
            }
            stages {
                stage('Install and check') {
                    steps {
                        sh 'node --version && npm --version'
                        sh 'npm ci'
                        sh 'npm run check'
                        sh 'npm run build'
                    }
                }

                stage('Framework tests') {
                    steps {
                        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE', catchInterruptions: false) {
                            sh 'npm run test:framework'
                        }
                    }
                }

                stage('Local accessibility') {
                    environment {
                        BROWSER = 'chromium'
                        REPORT_DIR = 'test-results/jenkins/local-app'
                    }
                    steps {
                        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE', catchInterruptions: false) {
                            sh 'npm run test:local'
                        }
                    }
                }

                stage('Recorded contracts') {
                    environment {
                        BROWSER = 'chromium'
                        REPORT_DIR = 'test-results/jenkins/contract'
                    }
                    steps {
                        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE', catchInterruptions: false) {
                            sh 'npm run test:contract'
                        }
                    }
                    post {
                        always {
                            script {
                                if (fileExists('test-results/jenkins/contract/contract-messages.ndjson')) {
                                    sh 'npm run report:flaky'
                                }
                            }
                        }
                    }
                }

                stage('Live browser suites') {
                    when { expression { params.RUN_LIVE } }
                    steps {
                        script {
                            def browsers = params.BROWSER == 'all' ? ['chromium', 'firefox', 'webkit'] : [params.BROWSER]
                            def branches = [:]
                            browsers.each { browser ->
                                branches[browser] = {
                                    stage("Live ${browser}") {
                                        withEnv(["BROWSER=${browser}", "REPORT_DIR=test-results/jenkins/${browser}", 'HAR=off']) {
                                            catchError(buildResult: 'FAILURE', stageResult: 'FAILURE', catchInterruptions: false) {
                                                try {
                                                    sh(params.LIVE_SUITE == 'smoke' ? 'npm run test:smoke' : 'npm test')
                                                } finally {
                                                    if (fileExists("test-results/jenkins/${browser}/messages.ndjson")) {
                                                        sh 'npm run report:flaky'
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            parallel branches
                        }
                    }
                }
            }
        }
    }

    // This runs on the host agent, where Java and the Jenkins Allure tool are installed.
    post {
        always {
            script {
                def suites = ['local-app', 'contract', 'chromium', 'firefox', 'webkit']
                def results = []
                for (def suite in suites) {
                    def directory = "test-results/jenkins/${suite}"
                    def xml = "${directory}/${suite == 'contract' ? 'contract-' : ''}junit.xml"
                    if (fileExists(xml)) {
                        catchError(buildResult: 'FAILURE', catchInterruptions: false) {
                            junit testResults: xml, allowEmptyResults: false
                        }
                    }
                    if (fileExists("${directory}/allure-results")) {
                        results.add([path: "${directory}/allure-results"])
                    }
                }
                if (results) {
                    catchError(buildResult: 'FAILURE', catchInterruptions: false) {
                        allure commandline: 'Allure-2.46.1',
                            includeProperties: false,
                            reportBuildPolicy: 'ALWAYS',
                            results: results,
                            report: 'test-results/jenkins/allure-report'
                    }
                } else {
                    echo 'No Allure results were produced; inspect the failed setup/check stage.'
                }
            }
        }
        cleanup {
            // Still archive raw evidence when report generation fails.
            archiveArtifacts artifacts: 'test-results/**', excludes: '**/npm-cache/**',
                allowEmptyArchive: true, fingerprint: true
        }
    }
}
