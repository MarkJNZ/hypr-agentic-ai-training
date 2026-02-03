import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Admin UI/);

    // Expect header
    await expect(page.locator('h1')).toContainText('Admin Console');
});

test('can navigate to create app', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Applications'); // Ensure we are on apps
    await expect(page.locator('app-list')).toBeVisible();

    // Wait for load
    // If no apps, we see proper message or empty list
});
