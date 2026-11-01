import {Page} from '@playwright/test';
import {BaseDateQuestionPage} from './BaseDateQuestionPage';
export class EmploymentEndDatePage extends BaseDateQuestionPage {
    constructor(page: Page) {
        super(
            page,
            page
                .getByRole('main')
                .locator('form[data-question-key]')
                .filter({
                    has: page.getByRole('heading', {name: /employment end date/i, level: 1}),
                }),
        );
    }
}
