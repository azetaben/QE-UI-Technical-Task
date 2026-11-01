import {
    expect as playwrightExpect,
    type ExpectMatcherState,
    type Locator,
    type MatcherReturnType,
    type Page,
} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {getTestOptions} from '../../test-options';

/** Question types rendered by the GOV.UK smart-answer engine (the form's `data-type`). */
export type SmartAnswerType = 'value_question' | 'radio_question' | 'date_question';

export interface SmartAnswerForm {
    type: SmartAnswerType;
    /** Submission path; omit when the step under test does not pin it. */
    action?: string;
}

interface MatcherOptions {
    timeout?: number;
}

/** axe-core tags for every WCAG 2.0, 2.1 and 2.2 level A and AA success criterion. */
export const WCAG_22_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] as const;

export interface AxeOptions {
    /** CSS selector limiting the scan, e.g. to content the team owns. */
    include?: string;
    /** Rules to skip; each exclusion should reference a logged defect or an accepted risk. */
    disableRules?: string[];
}

/** Layout rounding can leave a 1px sub-pixel difference that is not real clipping. */
const SUBPIXEL_TOLERANCE_PX = 1;

/**
 * Re-evaluates `probe` until it equals `expected` (or, under `.not`, differs from it) within the
 * timeout, so domain matchers retry like Playwright's built-in web-first assertions.
 */
async function pollUntilEqual<T>(
    state: ExpectMatcherState,
    name: string,
    description: string,
    probe: () => Promise<T>,
    expected: T,
    options: MatcherOptions = {},
): Promise<MatcherReturnType> {
    const timeout = options.timeout ?? state.timeout;
    let actual: T | undefined;
    let failure: string | undefined;
    try {
        const assertion = playwrightExpect.poll(async () => (actual = await probe()), {timeout});
        await (state.isNot ? assertion.not : assertion).toEqual(expected);
    } catch (error) {
        failure = error instanceof Error ? error.message : String(error);
    }
    const hint = state.utils.matcherHint(name, undefined, undefined, {isNot: state.isNot});
    return {
        name,
        pass: failure === undefined ? !state.isNot : state.isNot,
        expected,
        actual,
        timeout,
        message: () => `${hint}\n\n${description}\n\n${failure ?? ''}`,
    };
}

/**
 * The project-wide `expect`: Playwright's assertions with the configured EXPECT_TIMEOUT, plus
 * domain matchers for checks that would otherwise be repeated across page objects and steps.
 */
export const expect = playwrightExpect.configure({timeout: getTestOptions().expectTimeout}).extend({
    /** Asserts the GOV.UK smart-answer form contract: question type, GET submission and `next=1`. */
    async toBeSmartAnswerForm(
        this: ExpectMatcherState,
        form: Locator,
        expected: SmartAnswerForm,
        options?: MatcherOptions,
    ) {
        const includeAction = expected.action !== undefined;
        return pollUntilEqual(
            this,
            'toBeSmartAnswerForm',
            'smart-answer form contract',
            () =>
                form.evaluateAll(
                    (elements, withAction) =>
                        elements.map((element) => ({
                            type: element.getAttribute('data-type'),
                            method: element.getAttribute('method'),
                            next:
                                element.querySelector<HTMLInputElement>(
                                    'input[type="hidden"][name="next"]',
                                )?.value ?? null,
                            ...(withAction ? {action: element.getAttribute('action')} : {}),
                        })),
                    includeAction,
                ),
            // Exactly one matching form: duplicates are a defect, not something to tolerate.
            [
                {
                    type: expected.type,
                    method: 'get',
                    next: '1',
                    ...(includeAction ? {action: expected.action} : {}),
                },
            ],
            options,
        );
    },

    /** WCAG 2.2 SC 1.4.10 Reflow: the page must not scroll horizontally. */
    async toHaveNoHorizontalScroll(this: ExpectMatcherState, page: Page, options?: MatcherOptions) {
        return pollUntilEqual(
            this,
            'toHaveNoHorizontalScroll',
            'horizontal overflow of the document in px',
            () =>
                page.evaluate((tolerance) => {
                    const root = document.documentElement;
                    const overflow = root.scrollWidth - root.clientWidth;
                    return overflow > tolerance ? overflow : 0;
                }, SUBPIXEL_TOLERANCE_PX),
            0,
            options,
        );
    },

    /** Every visible element matched by the locator lies horizontally inside the viewport. */
    async toFitWithinViewport(
        this: ExpectMatcherState,
        locator: Locator,
        options?: MatcherOptions,
    ) {
        return pollUntilEqual(
            this,
            'toFitWithinViewport',
            'visible elements clipped by the viewport',
            () =>
                locator.evaluateAll((elements, tolerance) => {
                    const viewportWidth = document.documentElement.clientWidth;
                    return elements
                        .filter((element) => element.checkVisibility())
                        .map((element) => ({element, bounds: element.getBoundingClientRect()}))
                        .filter(
                            ({bounds}) =>
                                bounds.left < -tolerance ||
                                bounds.right > viewportWidth + tolerance,
                        )
                        .map(({element, bounds}) => ({
                            element: element.outerHTML.slice(0, 80),
                            left: Math.round(bounds.left),
                            right: Math.round(bounds.right),
                            viewportWidth,
                        }));
                }, SUBPIXEL_TOLERANCE_PX),
            [],
            options,
        );
    },

    /**
     * Automated WCAG 2.2 A/AA scan with axe-core. Runs once rather than polling (a scan is costly),
     * so call it once the page has settled. Automation finds roughly a third of WCAG issues; it
     * complements the manual screen-reader and zoom checks rather than replacing them.
     */
    async toPassAxe(this: ExpectMatcherState, page: Page, options: AxeOptions = {}) {
        const builder = new AxeBuilder({page}).withTags([...WCAG_22_AA]);
        if (options.include) builder.include(options.include);
        if (options.disableRules?.length) builder.disableRules(options.disableRules);
        const violations = (await builder.analyze()).violations.map((violation) => ({
            rule: violation.id,
            impact: violation.impact,
            help: violation.help,
            targets: violation.nodes.map((node) => node.target.join(' ')),
        }));
        const hint = this.utils.matcherHint('toPassAxe', 'page', '', {isNot: this.isNot});
        return {
            name: 'toPassAxe',
            pass: violations.length === 0,
            expected: [],
            actual: violations,
            message: () =>
                this.isNot
                    ? `${hint}\n\nExpected accessibility violations but axe found none.`
                    : `${hint}\n\n${violations.length} WCAG 2.2 AA violation(s) at ${page.url()}:\n` +
                      violations
                          .map(
                              (v) =>
                                  `- ${v.rule} (${v.impact}): ${v.help}\n    ${v.targets.join('\n    ')}`,
                          )
                          .join('\n'),
        };
    },
});
