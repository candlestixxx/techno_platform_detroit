import { test, expect } from '@playwright/test';

test.describe('Detroit Underground Platform E2E', () => {
  test('should load the main hub and display the map', async ({ page }) => {
    await page.goto('/');

    // Check main title
    await expect(page.getByText('Detroit Underground Hub')).toBeVisible();

    // The feed tab is active by default. We should see the mock loading state or feed.
    await expect(page.getByText('Social Feed')).toBeVisible();

    // Click the Map tab to render the UndergroundMap component
    await page.getByRole('button', { name: 'Explore Map' }).click();

    // Verify the mapbox container is present. In CI/Headless Mapbox might render the container as hidden/collapsed without full WebGL support, so we just check it exists.
    await expect(page.locator('.mapboxgl-map')).toBeAttached({ timeout: 10000 });
  });

  test('should load the marketplace and contain items', async ({ page }) => {
    await page.goto('/marketplace');

    await expect(page.getByText('Detroit Underground Exchange')).toBeVisible();

    // The mock DB items fallback should render
    await expect(page.getByText('Support local artists and businesses')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Claim', exact: true }).or(page.getByRole('button', { name: 'Buy', exact: true })).first()).toBeVisible({ timeout: 10000 });
  });
});
