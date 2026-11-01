import assert from 'node:assert/strict';
import {after, afterEach, before, beforeEach, describe, it} from 'node:test';
import {chromium, type Browser, type BrowserContext, type Page} from '@playwright/test';
import {expect} from '../../src/support/assertions';

// Short timeouts keep the negative cases fast; retries are proven separately.
const FAST = {timeout: 300};

const smartAnswerForm = (attributes: string, next = '1') =>
    `<form ${attributes}><input type="hidden" name="next" value="${next}"></form>`;

describe('custom assertions', () => {
    let browser: Browser;
    let context: BrowserContext;
    let page: Page;

    before(async () => {
        browser = await chromium.launch();
    });
    after(async () => {
        await browser.close();
    });
    afterEach(async () => {
        await context.close();
    });
    beforeEach(async () => {
        context = await browser.newContext({viewport: {width: 320, height: 600}});
        page = await context.newPage();
    });

    describe('toBeSmartAnswerForm', () => {
        it('passes for the GOV.UK smart-answer contract, with or without an action', async () => {
            await page.setContent(
                smartAnswerForm('data-type="radio_question" method="get" action="/y"'),
            );
            await expect(page.locator('form')).toBeSmartAnswerForm({type: 'radio_question'});
            await expect(page.locator('form')).toBeSmartAnswerForm({
                type: 'radio_question',
                action: '/y',
            });
        });

        it('reports the mismatching attribute when the contract is broken', async () => {
            await page.setContent(smartAnswerForm('data-type="radio_question" method="post"'));
            await assert.rejects(
                expect(page.locator('form')).toBeSmartAnswerForm({type: 'radio_question'}, FAST),
                /toBeSmartAnswerForm[\s\S]*"method": "post"/,
            );
        });

        it('fails when the hidden next=1 input is missing or wrong', async () => {
            await page.setContent(smartAnswerForm('data-type="value_question" method="get"', '0'));
            await assert.rejects(
                expect(page.locator('form')).toBeSmartAnswerForm({type: 'value_question'}, FAST),
            );
        });

        it('fails when the locator matches no form or duplicate forms', async () => {
            await page.setContent('<p>no form</p>');
            await assert.rejects(
                expect(page.locator('form')).toBeSmartAnswerForm({type: 'date_question'}, FAST),
            );
            const form = smartAnswerForm('data-type="date_question" method="get"');
            await page.setContent(form + form);
            await assert.rejects(
                expect(page.locator('form')).toBeSmartAnswerForm({type: 'date_question'}, FAST),
            );
        });

        it('retries until the form renders, like a web-first assertion', async () => {
            await page.setContent('<main></main>');
            await page.evaluate(
                (html) => setTimeout(() => (document.querySelector('main')!.innerHTML = html), 200),
                smartAnswerForm('data-type="value_question" method="get"'),
            );
            await expect(page.locator('form')).toBeSmartAnswerForm(
                {type: 'value_question'},
                {timeout: 2000},
            );
        });

        it('supports .not', async () => {
            await page.setContent(smartAnswerForm('data-type="radio_question" method="get"'));
            await expect(page.locator('form')).not.toBeSmartAnswerForm(
                {type: 'value_question'},
                FAST,
            );
            await assert.rejects(
                expect(page.locator('form')).not.toBeSmartAnswerForm(
                    {type: 'radio_question'},
                    FAST,
                ),
            );
        });
    });

    describe('toHaveNoHorizontalScroll', () => {
        it('passes when content reflows into the viewport', async () => {
            await page.setContent('<p>Short content</p>');
            await expect(page).toHaveNoHorizontalScroll();
        });

        it('fails with the overflow in px when the page scrolls sideways', async () => {
            await page.setContent(
                '<style>body{margin:0}</style><div style="width:1000px">wide</div>',
            );
            await assert.rejects(expect(page).toHaveNoHorizontalScroll(FAST), /Received: 680/);
        });
    });

    describe('toFitWithinViewport', () => {
        it('passes when every visible match is inside the viewport', async () => {
            await page.setContent('<button>Continue</button><button>Back</button>');
            await expect(page.locator('button')).toFitWithinViewport();
        });

        it('ignores hidden elements', async () => {
            await page.setContent(
                '<button>Ok</button><button hidden style="margin-left:2000px">Off</button>',
            );
            await expect(page.locator('button')).toFitWithinViewport();
        });

        it('identifies the clipped element', async () => {
            await page.setContent(
                '<button>Ok</button><button id="clipped" style="position:absolute;left:300px;width:100px">Wide</button>',
            );
            await assert.rejects(
                expect(page.locator('button')).toFitWithinViewport(FAST),
                /id=\\"clipped\\"/,
            );
        });
    });

    describe('toPassAxe', () => {
        const accessible =
            '<html lang="en"><head><title>Accessible</title></head><body><main><h1>Title</h1>' +
            '<label for="days">Days</label><input id="days"></main></body></html>';

        it('passes for an accessible page', async () => {
            await page.setContent(accessible);
            await expect(page).toPassAxe();
        });

        it('fails and names each violated rule and element', async () => {
            await page.setContent(
                '<html lang="en"><head><title>Broken</title></head><body><main>' +
                    '<img src="x.png" id="logo"><input id="unlabelled"></main></body></html>',
            );
            await assert.rejects(expect(page).toPassAxe(), (error: Error) => {
                assert.match(error.message, /image-alt \(critical\)/);
                assert.match(error.message, /#logo/);
                assert.match(error.message, /label/);
                return true;
            });
        });

        it('can scope the scan and skip a documented rule', async () => {
            await page.setContent(
                '<html lang="en"><head><title>Scoped</title></head><body>' +
                    '<header><img src="x.png"></header><main><h1>Owned content</h1></main></body></html>',
            );
            await expect(page).toPassAxe({include: 'main'});
            await expect(page).toPassAxe({disableRules: ['image-alt']});
        });
    });
});
