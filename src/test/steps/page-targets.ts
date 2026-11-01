import {PageManager} from '../pages/base/PageManager';

// One vocabulary for page-specific steps. Infrastructure classes and compatibility
// aliases deliberately do not register additional Gherkin bindings.
export function questionPages(pages: PageManager) {
    return {
        'worker type': pages.calculateHolidayEntitlement,
        'regular hours': pages.regularHours,
        'irregular hours': pages.irregularHours,
        'calculation basis': pages.basisOfCalculation,
        'leave year period': pages.leaveYearPeriod,
        'annualised hours': pages.annualisedHours,
        'compressed hours': pages.compressedHours,
        'days worked per week': pages.daysWorkedPerWeek,
        'days worked per week for hours': pages.daysWorkedPerWeekForHours,
        'hours worked per week': pages.hoursWorkedPerWeek,
        'hours in pay period': pages.hoursInPayPeriod,
        'employment start date': pages.employmentStartDate,
        'employment end date': pages.employmentEndDate,
    };
}

export function numericPages(pages: PageManager) {
    return {
        'days worked per week': pages.daysWorkedPerWeek,
        'days worked per week for hours': pages.daysWorkedPerWeekForHours,
        'hours worked per week': pages.hoursWorkedPerWeek,
        'compressed hours': pages.compressedHours,
        'hours in pay period': pages.hoursInPayPeriod,
    };
}

export function datePages(pages: PageManager) {
    return {
        'irregular hours': pages.irregularHours,
        'employment start date': pages.employmentStartDate,
        'employment end date': pages.employmentEndDate,
    };
}

export function namedPage<T extends object>(pages: T, name: string): T[keyof T] {
    if (!Object.hasOwn(pages, name)) {
        throw new Error(
            `Unknown page "${name}". Supported pages: ${Object.keys(pages).join(', ')}`,
        );
    }
    return pages[name as keyof T];
}
