import { test, expect } from '@playwright/test';
import { navigateWithRetry } from './helpers';

test.describe('Application List Page', () => {
    test.beforeEach(async ({ page }) => {
        // Mock API responses
        await page.route('**/api/v1/applications*', async route => {
            const mockApps = [
                { id: '1', name: 'App 1', comments: 'Desc 1' },
                { id: '123', name: 'App 123', comments: 'Desc 123' }
            ];
            await route.fulfill({ json: mockApps });
        });

        // Bypass login
        await page.addInitScript(() => window.localStorage.setItem('auth_token', 'test-token'));
        await navigateWithRetry(page, '/#apps', page.locator('#list-container'));
    });

    test('should display applications list with correct headers and buttons', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Applications' })).toBeVisible();

        // Check for Create New App button
        const createBtn = page.getByRole('button', { name: 'Create New App' });
        await expect(createBtn).toBeVisible();

        // Check search field
        const searchInput = page.getByPlaceholder('Search applications...');
        await expect(searchInput).toBeVisible();

        // Wait for list container
        await expect(page.locator('#list-container')).toBeVisible();
    });

    test('should navigate to create application page', async ({ page }) => {
        await page.getByRole('button', { name: 'Create New App' }).click();

        // Assert URL changes
        await expect(page).toHaveURL(/.*#apps\/create/);
    });

    test('should filter applications when searching', async ({ page }) => {
        // Wait and find the search box
        const searchInput = page.getByPlaceholder('Search applications...');

        // Type a filter
        await searchInput.fill('Non Existent App 123');

        // Assert empty state or filtered list
        await expect(page.getByText('No applications found.')).toBeVisible();
    });
});
