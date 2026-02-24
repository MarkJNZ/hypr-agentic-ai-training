import { test, expect } from '@playwright/test';
import { navigateWithRetry } from './helpers';

test.describe('Configuration Editor Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('**/api/v1/applications', async route => {
            await route.fulfill({ json: [{ id: '123', name: 'Test App', comments: 'Test Desc' }] });
        });
        await page.route('**/api/v1/applications/123', async route => {
            await route.fulfill({ json: { id: '123', name: 'Test App', comments: 'Test Desc', configurationIds: [] } });
        });
        await page.route('**/api/v1/configurations*', async route => {
            await route.fulfill({ json: { id: 'new-conf', name: 'Config', comments: 'Desc' } });
        });
        await page.addInitScript(() => window.localStorage.setItem('auth_token', 'test-token'));
        await navigateWithRetry(page, '/#configs/create/123', page.getByRole('heading', { name: 'Create Configuration' }));
    });

    test('should render form fields in visual mode by default', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Create Configuration' })).toBeVisible();

        // Check common fields
        await expect(page.getByLabel('Name')).toBeVisible();
        await expect(page.getByLabel('Description')).toBeVisible();

        // Check Visual Editor mode elements
        await expect(page.locator('#visual-editor')).toBeVisible();
        const addRowBtn = page.getByRole('button', { name: '+ Add Key-Value Pair' });
        await expect(addRowBtn).toBeVisible();

        // Check JSON Editor is hidden
        await expect(page.locator('#json-wrapper')).toBeHidden();

        // Check Save/Cancel buttons
        await expect(page.getByRole('button', { name: 'Create Configuration' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    });

    test('should toggle to JSON mode', async ({ page }) => {
        const modeSwitch = page.getByLabel('Edit as JSON');
        await modeSwitch.check();

        // Visual editor should hide, JSON editor should show
        await expect(page.locator('#visual-editor')).toBeHidden();
        await expect(page.locator('#json-wrapper')).toBeVisible();
    });

    test('should add and remove key-value rows in visual mode', async ({ page }) => {
        const addRowBtn = page.getByRole('button', { name: '+ Add Key-Value Pair' });
        await addRowBtn.click();

        // Row should appear
        const rows = page.locator('#kv-container .kv-row');
        await expect(rows).toHaveCount(2);

        // Inputs should be visible
        await expect(rows.first().locator('.kv-key')).toBeVisible();
        await expect(rows.first().locator('.kv-val')).toBeVisible();

        // Delete row
        const deleteBtn = rows.first().locator('.btn-icon');
        await deleteBtn.click();

        await expect(rows).toHaveCount(1);
    });

    test('should navigate back when Cancel is clicked', async ({ page }) => {
        // Should go back to the app details (123)
        await page.getByRole('button', { name: 'Cancel' }).click();
        await expect(page).toHaveURL(/.*#apps\/123$/);
    });
});
