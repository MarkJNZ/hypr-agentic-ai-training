import { test, expect } from '@playwright/test';

test.describe('Application Detail Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('**/api/v1/applications', async route => {
            await route.fulfill({ json: [{ id: '123', name: 'Test App', comments: 'Test Desc' }] });
        });
        await page.route('**/api/v1/applications/123', async route => {
            await route.fulfill({ json: { id: '123', name: 'Test App', comments: 'Test Desc', configurationIds: ['conf1'] } });
        });
        await page.route('**/api/v1/configurations/conf1', async route => {
            await route.fulfill({ json: { id: 'conf1', name: 'Config 1', comments: 'Test Conf Desc' } });
        });
        await page.addInitScript(() => window.localStorage.setItem('auth_token', 'test-token'));
        // Retry navigation up to 3 times to mitigate Firefox NS_ERROR_CONNECTION_REFUSED
        for (let i = 0; i < 3; i++) {
            try {
                await page.goto('/#apps/123', { waitUntil: 'load', timeout: 10000 });
                break;
            } catch (error) {
                if (i === 2) throw error;
                await page.waitForTimeout(500); // wait before retry
            }
        }
    });

    test('should render application details and configuration list', async ({ page }) => {
        // Check Back to Apps link
        const backLink = page.locator('a', { hasText: 'Back to Apps' });
        await expect(backLink).toBeVisible();

        // Check Add Configuration button
        const addConfigBtn = page.locator('#add-config');
        await expect(addConfigBtn).toBeVisible();
        await expect(addConfigBtn).toHaveText('Add Configuration');

        // Check configuration list section
        const configHeader = page.locator('h3', { hasText: 'Configurations' });
        await expect(configHeader).toBeVisible();

        const configList = page.locator('#config-list');
        await expect(configList).toBeVisible();
    });

    test('should navigate to add configuration page', async ({ page }) => {
        await page.locator('#add-config').click();

        // Assert URL changes to create config with appId
        await expect(page).toHaveURL(/.*#configs\/create\/123/);
    });

    test('should navigate back to app list', async ({ page }) => {
        await page.locator('a', { hasText: 'Back to Apps' }).click();
        await expect(page).toHaveURL(/.*#apps$/);
    });
});
