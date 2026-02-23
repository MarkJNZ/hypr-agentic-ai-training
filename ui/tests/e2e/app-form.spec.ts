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
        await navigateWithRetry(page, '/#apps/create', 'text=Create Application');
    });

    test('should render form fields correctly', async ({ page }) => {
        const header = page.locator('h2');
        await expect(header).toHaveText('Create Application');

        // Check for Name input
        const nameInput = page.locator('#name');
        await expect(nameInput).toBeVisible();

        // Check for Description textarea
        const descInput = page.locator('#comments');
        await expect(descInput).toBeVisible();

        // Check for buttons
        const submitBtn = page.locator('#submit-btn');
        await expect(submitBtn).toBeVisible();
        await expect(submitBtn).toHaveText('Create Application');

        const cancelBtn = page.locator('#cancel');
        await expect(cancelBtn).toBeVisible();
    });

    test('should show error when creating without required name', async ({ page }) => {
        // Attempt to submit empty form
        await page.locator('#submit-btn').click();

        // Assert HTML5 validation logic (name is required)
        // Note: Playwright can check validity state or we check if toast appears.
        // Assuming toast appears if our custom validation catches it first, or HTML5 blocks it.
        // The implementation has `required` on input and `!hasValue(name)` check.

        const nameInput = page.locator('#name');

        // Simple assertion to ensure stay on page or validation message
        const isValid = await nameInput.evaluate((el: HTMLInputElement) => el.checkValidity());
        expect(isValid).toBe(false);
    });

    test('should allow filling and submitting the form', async ({ page }) => {
        // Fill form
        await page.locator('#name').fill('Test Playwright App');
        await page.locator('#comments').fill('This is a description from playwright');

        // Submit form (might fail API call, but we test interaction)
        // With an actual mocked API, we'd verify navigation
        const responsePromise = page.waitForResponse('**/api/v1/applications');
        await page.locator('#submit-btn').click();
        await responsePromise;

        // Wait for it to navigate back to the list
        await expect(page).toHaveURL(/.*#apps$/);
    });

    test('should navigate back when Cancel is clicked', async ({ page }) => {
        await page.locator('#cancel').click();
        await expect(page).toHaveURL(/.*#apps$/);
    });
});
