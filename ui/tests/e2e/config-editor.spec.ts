import { test, expect } from '@playwright/test';

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
        // Retry navigation up to 3 times to mitigate Firefox NS_ERROR_CONNECTION_REFUSED
        for (let i = 0; i < 3; i++) {
            try {
                await page.goto('/#configs/create/123', { waitUntil: 'load', timeout: 10000 });
                break;
            } catch (error) {
                if (i === 2) throw error;
                await page.waitForTimeout(500); // wait before retry
            }
        }
    });

    test('should render form fields in visual mode by default', async ({ page }) => {
        const header = page.locator('h2');
        await expect(header).toHaveText('Create Configuration');

        // Check common fields
        await expect(page.locator('#name')).toBeVisible();
        await expect(page.locator('#comments')).toBeVisible();

        // Check Visual Editor mode elements
        await expect(page.locator('#visual-editor')).toBeVisible();
        await expect(page.locator('#add-row')).toBeVisible();
        await expect(page.locator('#add-row')).toHaveText('+ Add Key-Value Pair');

        // Check JSON Editor is hidden
        await expect(page.locator('#json-wrapper')).toBeHidden();

        // Check Save/Cancel buttons
        await expect(page.locator('#submit-btn')).toHaveText('Create Configuration');
        await expect(page.locator('#cancel')).toBeVisible();
    });

    test('should toggle to JSON mode', async ({ page }) => {
        const modeSwitch = page.locator('#mode-switch');
        await modeSwitch.check();

        // Visual editor should hide, JSON editor should show
        await expect(page.locator('#visual-editor')).toBeHidden();
        const jsonWrapper = page.locator('#json-wrapper');
        await expect(jsonWrapper).toBeVisible();
    });

    test('should add and remove key-value rows in visual mode', async ({ page }) => {
        const addRowBtn = page.locator('#add-row');
        await addRowBtn.click();

        // Row should appear
        const kvContainer = page.locator('#kv-container');
        const rows = kvContainer.locator('.kv-row');
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
        await page.locator('#cancel').click();
        await expect(page).toHaveURL(/.*#apps\/123$/);
    });
});
