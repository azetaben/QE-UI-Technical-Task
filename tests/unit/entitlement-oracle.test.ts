import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {fixtures} from '../../src/test/test_data/Fixtures';
import {
    partialYearDays,
    regularDays,
    regularHours,
    roundUpToTenth,
    STATUTORY_CAP_DAYS,
} from '../../src/test/test_data/EntitlementOracle';

const isoDays = (from: string, count: number) =>
    Array.from({length: count}, (_, index) =>
        new Date(Date.parse(`${from}T00:00:00Z`) + index * 86_400_000).toISOString().slice(0, 10),
    );

describe('entitlement oracle', () => {
    describe('agrees with every hand-calculated fixture', () => {
        // Two independent derivations of each expected result: if they disagree, one is wrong.
        for (const [name, fixture] of Object.entries(fixtures)) {
            it(`${name}: ${fixture.expected} days`, () =>
                assert.equal(partialYearDays(fixture), fixture.expected));
        }
    });

    describe('regular workers, full leave year', () => {
        for (const [days, expected] of [
            [5, 28],
            [3, 16.8],
            [1, 5.6],
            [4.5, 25.2],
        ]) {
            it(`${days} days per week -> ${expected} days`, () =>
                assert.equal(regularDays(days), expected));
        }

        it('caps six- and seven-day weeks at 28 days', () => {
            assert.equal(regularDays(6), STATUTORY_CAP_DAYS);
            assert.equal(regularDays(7), STATUTORY_CAP_DAYS);
        });

        it('never decreases as working days increase and never exceeds the cap', () => {
            let previous = 0;
            for (let tenths = 1; tenths <= 70; tenths++) {
                const entitlement = regularDays(tenths / 10);
                assert.ok(entitlement >= previous, `${tenths / 10} days dropped to ${entitlement}`);
                assert.ok(entitlement <= STATUTORY_CAP_DAYS);
                previous = entitlement;
            }
        });

        it('35 hours over 5 days -> 196 hours', () => assert.equal(regularHours(35, 5), 196));

        it('caps hours at 28 working days', () => assert.equal(regularHours(48, 6), 224));

        for (const days of [0, -1, 7.5, Number.NaN]) {
            it(`rejects ${days} days per week`, () =>
                assert.throws(() => regularDays(days), RangeError));
        }
    });

    describe('partial leave year', () => {
        it('never exceeds the full-year entitlement for any leaving date in 2026 or 2024', () => {
            for (const [leaveYear, length] of [
                ['2026-01-01', 365],
                ['2024-01-01', 366],
            ] as const) {
                for (const end of isoDays(leaveYear, length)) {
                    const days = partialYearDays({route: 'leaving', end, leaveYear});
                    assert.ok(days > 0 && days <= STATUTORY_CAP_DAYS, `${end} gave ${days}`);
                }
            }
        });

        it('gives the full entitlement for the whole leave year, including a leap year', () => {
            assert.equal(
                partialYearDays({route: 'leaving', end: '2024-12-31', leaveYear: '2024-01-01'}),
                28,
            );
        });

        it('uses the leave year containing the date, not the calendar year', () => {
            assert.equal(
                partialYearDays({route: 'leaving', end: '2027-03-31', leaveYear: '2026-04-01'}),
                28,
            );
        });

        it('refuses a mid-month starter, whose rule has not been confirmed', () => {
            assert.throws(
                () =>
                    partialYearDays({
                        route: 'starting',
                        start: '2026-07-15',
                        leaveYear: '2026-01-01',
                    }),
                /month boundary/,
            );
        });

        it('rejects impossible and reversed dates', () => {
            assert.throws(() =>
                partialYearDays({route: 'leaving', end: '2026-02-29', leaveYear: '2026-01-01'}),
            );
            assert.throws(() =>
                partialYearDays({
                    route: 'starting-and-leaving',
                    start: '2026-09-30',
                    end: '2026-04-01',
                }),
            );
            assert.throws(() =>
                partialYearDays({
                    route: 'starting-and-leaving',
                    start: '2026-04-01',
                    end: '2027-04-01',
                }),
            );
        });
    });

    describe('roundUpToTenth', () => {
        it('rounds up, never down, and ignores floating-point noise', () => {
            assert.equal(roundUpToTenth(13.885), 13.9);
            assert.equal(roundUpToTenth(14.000000000000002), 14);
            assert.equal(roundUpToTenth(16.8), 16.8);
        });
    });
});
