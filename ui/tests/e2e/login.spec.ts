import { test, expect } from '@playwright/test';
import { navigateWithRetry } from './helpers';

test.describe('Login Page', () => {
    test('should display login page components correctly', async ({ page }) => {
        await navigateWithRetry(page, '/', 'text=Admin Console');

        // Assert header
        await expect(page.locator('h2')).toContainText('Admin Console');

        // Assert info text
        await expect(page.locator('p')).toContainText('Sign in to manage your application configurations');

        // Assert Sign in with GitHub button
        const githubBtn = page.locator('#github-login-btn');
        await expect(githubBtn).toBeVisible();
        await expect(githubBtn).toContainText('Sign in with GitHub');
    });

    // Note: Since this is OAuth, fully mocking the auth flow might be required for a complete E2E 
    // without actually hitting GitHub. For now, testing the UI elements are present.
    // Testing the mock auth via local storage if implemented.
});
