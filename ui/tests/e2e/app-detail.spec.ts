import { test, expect } from '@playwright/test';
import { navigateWithRetry } from './helpers';

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
        await navigateWithRetry(page, '/#apps/123', page.getByRole('heading', { name: 'Configurations' }));
    });

    test('should render application details and configuration list', async ({ page }) => {
        // Check Back to Apps link
        const backLink = page.getByRole('link', { name: 'Back to Apps' });
        await expect(backLink).toBeVisible();

        // Check Add Configuration button
        const addConfigBtn = page.getByRole('button', { name: 'Add Configuration' });
        await expect(addConfigBtn).toBeVisible();

        // Check configuration list section
        await expect(page.getByRole('heading', { name: 'Configurations' })).toBeVisible();

        await expect(page.locator('#config-list')).toBeVisible();
    });

    test('should navigate to add configuration page', async ({ page }) => {
        await page.getByRole('button', { name: 'Add Configuration' }).click();

        // Assert URL changes to create config with appId
        await expect(page).toHaveURL(/.*#configs\/create\/123/);
    });

    test('should navigate back to app list', async ({ page }) => {
        await page.getByRole('link', { name: 'Back to Apps' }).click();
        await expect(page).toHaveURL(/.*#apps$/);
    });
});
