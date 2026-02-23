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
        await navigateWithRetry(page, '/#apps', '#list-container');
    });

    test('should display applications list with correct headers and buttons', async ({ page }) => {
        const header = page.locator('h2');
        await expect(header).toHaveText('Applications');

        // Check for Create New App button
        const createBtn = page.locator('#create-btn', { hasText: 'Create New App' });
        await expect(createBtn).toBeVisible();

        // Check search field
        const searchInput = page.locator('#search');
        await expect(searchInput).toBeVisible();
        await expect(searchInput).toHaveAttribute('placeholder', 'Search applications...');

        // Wait for list container
        const listContainer = page.locator('#list-container');
        await expect(listContainer).toBeVisible();
    });

    test('should navigate to create application page', async ({ page }) => {
        await page.locator('#create-btn').click();

        // Assert URL changes
        await expect(page).toHaveURL(/.*#apps\/create/);
    });

    test('should filter applications when searching', async ({ page }) => {
        // Wait and find the search box
        const searchInput = page.locator('#search');

        // Type a filter
        await searchInput.fill('Non Existent App 123');

        // Assert empty state or filtered list
        const noAppsText = page.locator('#list-container p');
        await expect(noAppsText).toHaveText('No applications found.');
    });
});
