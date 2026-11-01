import type {PartialYearCase} from '../test/test_data/Fixtures';

export type DatePart = 'day' | 'month' | 'year';
export type DateParts = Record<DatePart, string>;

/** Data handed between the steps of one scenario. Cucumber builds a new World, and therefore
 * a new state, for every scenario, so nothing can leak between scenarios. */
export interface ScenarioState {
    /** Smart-answer question key the scenario is exercising. */
    questionKey?: string;
    /** Date components exactly as submitted, including deliberately empty ones. */
    submittedDate?: DateParts;
    /** Date components read back from the page after a validation error. */
    retainedDate?: DateParts;
    /** Page text and URL captured before navigation, for consistency checks. */
    snapshot?: {text: string; url: string};
    /** Messages of any JavaScript dialogs opened (and dismissed) during the scenario. */
    dialogs: string[];
    /** Selected partial-year fixture with its independent expected result. */
    partial?: PartialYearCase;
}

export const newScenarioState = (): ScenarioState => ({dialogs: []});
