/** Fixed independent oracles, not values scraped from the system under test.
 * Regular-worker reference: https://www.gov.uk/government/publications/calculating-holiday-entitlement-for-workers/how-to-calculate-holiday-entitlement-for-workers-on-different-types-of-contract
 */
export type PartialPeriod =
    | {route: 'starting'; start: string; leaveYear: string}
    | {route: 'leaving'; end: string; leaveYear: string}
    | {route: 'starting-and-leaving'; start: string; end: string};

export type PartialYearCase = PartialPeriod & {expected: number};

/** Every partial-year journey uses a five-day week, so expected values are pro-rated from 28 days. */
export const PARTIAL_YEAR_DAYS_PER_WEEK = 5;

export const fixtures = {
    starter: {route: 'starting', start: '2026-07-01', leaveYear: '2026-01-01', expected: 14}, // 28 × 6/12
    leaver: {route: 'leaving', end: '2026-06-30', leaveYear: '2026-01-01', expected: 13.9}, // 28 × 181/365, rounded up to 0.1
    combined: {
        route: 'starting-and-leaving',
        start: '2026-04-01',
        end: '2026-09-30',
        expected: 14.1,
    }, // 28 × 183/365, rounded up
    firstDay: {route: 'starting', start: '2026-01-01', leaveYear: '2026-01-01', expected: 28}, // Full-year route
    lastDay: {route: 'leaving', end: '2026-12-31', leaveYear: '2026-01-01', expected: 28},
    leapYear: {route: 'leaving', end: '2024-02-29', leaveYear: '2024-01-01', expected: 4.6}, // 28 × 60/366
    crossYear: {route: 'leaving', end: '2026-09-30', leaveYear: '2026-04-01', expected: 14.1}, // 28 × 183/365
} satisfies Record<string, PartialYearCase>;
