import {setWorldConstructor, World} from '@cucumber/cucumber';
import {BrowserContext, Page} from '@playwright/test';
import {getTestOptions} from '../../test-options';
import {Calculator} from '../test/pages/CalculatorPage';
import {PageManager} from '../test/pages/base/PageManager';
import {PartialYearCase} from '../test/test_data/Fixtures';
import {newScenarioState, ScenarioState} from './ScenarioState';
import logger from "../test/logger/logger";

export class CustomWorld extends World {
    readonly options = getTestOptions();
    readonly state: ScenarioState = newScenarioState();
    context?: BrowserContext;
    private activePage?: Page;
    private pageManager?: PageManager;

    get currentPage(): Page | undefined {
        return this.activePage;
    }

    get page(): Page {
        if (!this.activePage)
            throw new Error('Scenario page is not initialised. Run the Before hook first.');
        return this.activePage;
    }

    get pages(): PageManager {
        if (!this.pageManager)
            throw new Error('Scenario pages are not initialised. Run the Before hook first.');
        return this.pageManager;
    }

    get calculator(): Calculator {
        return this.pages.calculator;
    }

    get partialFixture(): PartialYearCase {
        return this.required('partial', 'A partial-year test-data fixture must be selected first');
    }

    /** Reads state an earlier step must have set, failing with a step-ordering message if not. */
    required<K extends keyof ScenarioState>(
        key: K,
        message: string,
    ): NonNullable<ScenarioState[K]> {
        const value = this.state[key];
        if (value === undefined || value === null) throw new Error(message);
        return value as NonNullable<ScenarioState[K]>;
    }

    initialisePage(page: Page): void {
        if (this.activePage) throw new Error('A scenario page is already initialised');
        this.activePage = page;
        this.pageManager = new PageManager(page, this.options.baseURL);
        logger.info('Custom world page initialised');
    }
}

setWorldConstructor(CustomWorld);
logger.info('Custom world initialised');
