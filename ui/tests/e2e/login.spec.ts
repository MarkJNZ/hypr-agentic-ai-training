import { test, expect } from '@playwright/test';
import { navigateWithRetry } from './helpers';

test.describe('Login Page', () => {
    test('should display login page components correctly', async ({ page }) => {
        await navigateWithRetry(page, '/', page.getByRole('heading', { name: 'Admin Console' }));

        // Assert header
        await expect(page.getByRole('heading', { name: 'Admin Console' })).toBeVisible();

        // Assert info text
        await expect(page.getByText('Sign in to manage your application configurations')).toBeVisible();

        // Assert Sign in with GitHub button
        const githubBtn = page.getByRole('button', { name: 'Sign in with GitHub' });
        await expect(githubBtn).toBeVisible();
    });

    // Note: Since this is OAuth, fully mocking the auth flow might be required for a complete E2E 
    // without actually hitting GitHub. For now, testing the UI elements are present.
    // Testing the mock auth via local storage if implemented.
});
