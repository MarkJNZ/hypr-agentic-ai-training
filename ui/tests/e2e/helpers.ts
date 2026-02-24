import { Page, Locator } from '@playwright/test';

/**
 * Navigate to a page with retry logic to mitigate Firefox NS_ERROR_CONNECTION_REFUSED
 * and other transient connection issues in parallel test execution.
 *
 * Uses `domcontentloaded` instead of `load` since these are SPA hash-routed pages.
 * Applies exponential backoff between retries and reloads the page on subsequent
 * attempts to force a fresh navigation.
 *
 * @param page - Playwright Page object
 * @param url - URL path to navigate to (e.g. '/#apps')
 * @param waitForLocator - Locator to wait for after navigation
 * @param retries - Number of retry attempts (default: 3)
 */
export async function navigateWithRetry(
    page: Page,
    url: string,
    waitForLocator: Locator,
    retries = 3
): Promise<void> {
    for (let i = 0; i < retries; i++) {
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15_000 });
            await waitForLocator.waitFor({ state: 'visible', timeout: 10_000 });
            return;
        } catch {
            if (i === retries - 1) throw new Error(
                `navigateWithRetry failed after ${retries} attempts for ${url}`
            );
            // Wait with exponential backoff before retry
            await page.waitForTimeout(1000 * Math.pow(2, i));
        }
    }
}
