import { test, expect } from '@playwright/test';
import { navigateWithRetry } from './helpers';

test.describe('Application Form Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('**/api/v1/applications', async route => {
            if (route.request().method() === 'POST') {
                await route.fulfill({ json: { id: 'new-id', name: 'Test Playwright App', comments: 'Test' } });
            } else {
                await route.fulfill({ json: [] });
            }
        });
        await page.addInitScript(() => window.localStorage.setItem('auth_token', 'test-token'));
        await navigateWithRetry(page, '/#apps/create', page.getByRole('heading', { name: 'Create Application' }));
    });

    test('should render form fields correctly', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Create Application' })).toBeVisible();

        // Check for Name input
        await expect(page.getByLabel('Name')).toBeVisible();

        // Check for Description textarea
        await expect(page.getByLabel('Description')).toBeVisible();

        // Check for buttons
        await expect(page.getByRole('button', { name: 'Create Application' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    });

    test('should show error when creating without required name', async ({ page }) => {
        // Attempt to submit empty form
        await page.getByRole('button', { name: 'Create Application' }).click();

        // Assert HTML5 validation blocks submission - verify we stay on create page
        await expect(page).toHaveURL(/.*#apps\/create$/);
    });

    test('should allow filling and submitting the form', async ({ page }) => {
        // Fill form
        await page.getByLabel('Name').fill('Test Playwright App');
        await page.getByLabel('Description').fill('This is a description from playwright');

        // Submit form
        const responsePromise = page.waitForResponse('**/api/v1/applications');
        await page.getByRole('button', { name: 'Create Application' }).click();
        await responsePromise;

        // Wait for it to navigate back to the list
        await expect(page).toHaveURL(/.*#apps$/);
    });

    test('should navigate back when Cancel is clicked', async ({ page }) => {
        await page.getByRole('button', { name: 'Cancel' }).click();
        await expect(page).toHaveURL(/.*#apps$/);
    });
});
