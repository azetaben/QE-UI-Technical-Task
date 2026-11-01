import type {Page} from '@playwright/test';
import {expect} from '../support/assertions';
import logger from "../test/logger/logger";

/** The supplied accessibility exercise has no GOV.UK landmarks or calculator components. */
export class LocalContactPage {
    constructor(readonly page: Page) {}

    get name() {
        return this.page.getByPlaceholder('Full name', {exact: true});
    }
    get email() {
        return this.page.getByPlaceholder('Email', {exact: true});
    }
    get message() {
        return this.page.getByPlaceholder('Your message...', {exact: true});
    }
    get submit() {
        return this.page.getByRole('button', {name: 'Done 🎉', exact: true});
    }

    async open(): Promise<void> {
        // Make the audit repeatable/offline: only the supplied local assets are loaded.
        await this.page.route('**/*', async (route) => {
            if (new URL(route.request().url()).origin === 'http://localhost:8080')
                await route.continue();
            else await route.abort();
        });
        logger.info('Custom world page opened');
        const response = await this.page.goto('http://localhost:8080/', {waitUntil: 'load'});
        expect(response?.status()).toBe(200);
        await expect(
            this.page.getByRole('heading', {name: 'Accesibility Chat Robot'}),
        ).toBeVisible();
        await expect(this.page.locator('.contact-form-heading')).toHaveCSS('font-size', '48px');
        expect(
            await this.page
                .locator('.contact-image')
                .evaluate((image) => (image as HTMLImageElement).naturalWidth),
        ).toBeGreaterThan(0);
    }

    async fillUsingKeyboard(): Promise<void> {
        await this.page.keyboard.press('Tab');
        logger.info('Custom world keyboard input started');
        await expect(this.name).toBeFocused();
        await this.page.keyboard.type('Local Tester');
        logger.info('Custom world keyboard input finished');
        await this.page.keyboard.press('Tab');
        logger.info('Custom world keyboard input started');
        await expect(this.email).toBeFocused();
        logger.info('Custom world keyboard input finished');
        await this.page.keyboard.type('tester@example.com');
        logger.info('Custom world keyboard input finished');
        await this.page.keyboard.press('Tab');
        logger.info('Custom world keyboard input started');
        await expect(this.message).toBeFocused();
        logger.info('Custom world keyboard input finished');
        await this.page.keyboard.type('Accessibility check');
        logger.info('Custom world keyboard input finished');
        await this.page.keyboard.press('Tab');
        logger.info('Custom world keyboard input started');
        await expect(this.submit).toBeFocused();
        logger.info('Custom world keyboard input finished');
        await expect(this.name).toHaveValue('Local Tester');
        logger.info('Custom world keyboard input finished');
        await expect(this.email).toHaveValue('tester@example.com');
        logger.info('Custom world keyboard input finished');
        await expect(this.message).toHaveValue('Accessibility check');
        logger.info('Custom world keyboard input finished');
    }
}
