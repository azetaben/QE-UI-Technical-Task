import {Locator} from '@playwright/test';
import {expect} from '../../../support/assertions';

/** Known radio labels, reusable across regular and irregular calculator routes. */
export const radioOptionLabels = {
    workPattern: ['Yes', 'No'],
    calculationBasis: [
        'days worked per week',
        'hours worked per week',
        'annualised hours',
        'compressed hours',
        'shifts',
    ],
    calculationPeriod: [
        'for a full leave year',
        'for someone starting part way through a leave year',
        'for someone leaving part way through a leave year',
        'for someone starting and leaving part way through a leave year',
    ],
} as const;

/** Radio interactions scoped to one form or fieldset, excluding other page controls. */
export class RadioOptions {
    readonly radios: Locator;
    readonly selectedRadios: Locator;
    readonly labels: Locator;

    constructor(private readonly scope: Locator) {
        this.radios = scope.getByRole('radio');
        this.selectedRadios = scope.locator('input[type="radio"]:checked');
        this.labels = scope.locator('.govuk-radios__label');
    }

    option(label: string): Locator {
        return this.scope.getByRole('radio', {name: label, exact: true});
    }

    async select(label: string): Promise<void> {
        await this.option(label).check();
    }

    async expectSelected(label: string): Promise<void> {
        await expect(this.option(label)).toBeChecked();
        await expect(this.selectedRadios).toHaveCount(1);
    }

    async expectNoSelection(): Promise<void> {
        await expect(this.selectedRadios).toHaveCount(0);
    }

    async expectOptions(labels: readonly string[]): Promise<void> {
        await expect(this.radios).toHaveCount(labels.length);
        await expect(this.labels).toHaveText([...labels]);
        for (const label of labels) await expect(this.option(label)).toBeVisible();
    }

    async expectValue(label: string, value: string): Promise<void> {
        await expect(this.option(label)).toHaveValue(value);
    }
}
