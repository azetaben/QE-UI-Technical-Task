/** Independent implementation of the published statutory rules, never derived from the UI.
 * Reference: https://www.gov.uk/government/publications/calculating-holiday-entitlement-for-workers
 * Only rules confirmed against that guidance are encoded; anything else throws instead of guessing.
 */
import type {PartialPeriod} from './Fixtures';

/** 5.6 weeks of statutory leave, capped at 28 days. */
export const STATUTORY_WEEKS = 5.6;
export const STATUTORY_CAP_DAYS = 28;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Employers may round up but never down, so the oracle rounds up to one decimal place. */
export function roundUpToTenth(value: number): number {
    // Remove floating-point noise first so 14.000000000000002 does not become 14.1.
    return Math.ceil(Number((value * 10).toFixed(6))) / 10;
}

function requireRange(name: string, value: number, minimum: number, maximum: number): void {
    if (!Number.isFinite(value) || value <= minimum || value > maximum) {
        throw new RangeError(`${name} must be greater than ${minimum} and at most ${maximum}`);
    }
}

/** Full-year entitlement in days for a regular worker. */
export function regularDays(daysPerWeek: number): number {
    requireRange('daysPerWeek', daysPerWeek, 0, 7);
    return Math.min(roundUpToTenth(daysPerWeek * STATUTORY_WEEKS), STATUTORY_CAP_DAYS);
}

/** Full-year entitlement in hours: 5.6 working weeks, capped at 28 working days' hours. */
export function regularHours(hoursPerWeek: number, daysPerWeek: number): number {
    requireRange('hoursPerWeek', hoursPerWeek, 0, 168);
    requireRange('daysPerWeek', daysPerWeek, 0, 7);
    const capHours = (hoursPerWeek / daysPerWeek) * STATUTORY_CAP_DAYS;
    return Math.min(roundUpToTenth(hoursPerWeek * STATUTORY_WEEKS), roundUpToTenth(capHours));
}

function utc(iso: string): number {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new RangeError(`Expected an ISO date, got ${iso}`);
    const time = Date.parse(`${iso}T00:00:00Z`);
    if (Number.isNaN(time) || new Date(time).toISOString().slice(0, 10) !== iso) {
        throw new RangeError(`${iso} is not a real calendar date`);
    }
    return time;
}

function addYears(iso: string, years: number): number {
    const date = new Date(utc(iso));
    date.setUTCFullYear(date.getUTCFullYear() + years);
    return date.getTime();
}

/** Inclusive day count, so a one-day period is 1. */
function daysInclusive(from: number, to: number): number {
    return Math.round((to - from) / DAY_MS) + 1;
}

/** Leave year that starts on the anniversary of `leaveYearStart` and contains `date`. */
function leaveYearContaining(date: number, leaveYearStart: string): {start: number; end: number} {
    let years = new Date(date).getUTCFullYear() - new Date(utc(leaveYearStart)).getUTCFullYear();
    while (addYears(leaveYearStart, years) > date) years--;
    while (addYears(leaveYearStart, years + 1) <= date) years++;
    return {
        start: addYears(leaveYearStart, years),
        end: addYears(leaveYearStart, years + 1) - DAY_MS,
    };
}

function proRata(fraction: number): number {
    return roundUpToTenth(STATUTORY_CAP_DAYS * fraction);
}

/** Partial-year entitlement in days for a five-day regular worker. */
export function partialYearDays(period: PartialPeriod): number {
    switch (period.route) {
        case 'starting': {
            // Starters accrue by whole months remaining. The rule for a mid-month start has not
            // been confirmed, so refuse it rather than invent an expected result.
            const start = new Date(utc(period.start));
            if (start.getUTCDate() !== new Date(utc(period.leaveYear)).getUTCDate()) {
                throw new RangeError('Starter dates must fall on a leave-year month boundary');
            }
            const year = leaveYearContaining(start.getTime(), period.leaveYear);
            const first = new Date(year.start);
            const monthsElapsed =
                (start.getUTCFullYear() - first.getUTCFullYear()) * 12 +
                (start.getUTCMonth() - first.getUTCMonth());
            return proRata((12 - monthsElapsed) / 12);
        }
        case 'leaving': {
            const end = utc(period.end);
            const year = leaveYearContaining(end, period.leaveYear);
            return proRata(daysInclusive(year.start, end) / daysInclusive(year.start, year.end));
        }
        case 'starting-and-leaving': {
            const start = utc(period.start);
            const end = utc(period.end);
            if (end < start)
                throw new RangeError('The leaving date must not precede the start date');
            // Without a supplied leave year, measure against the 12 months beginning on the start date.
            const yearEnd = addYears(period.start, 1) - DAY_MS;
            if (end > yearEnd) throw new RangeError('Both dates must fall within one leave year');
            return proRata(daysInclusive(start, end) / daysInclusive(start, yearEnd));
        }
    }
}
