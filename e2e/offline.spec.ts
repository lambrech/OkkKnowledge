import { test, expect } from '@playwright/test';

test.describe('Offline PWA', () => {
  // These tests verify the service worker configuration is correct.
  // Full offline testing requires a production build, but we can test
  // basic offline resilience of the app structure.

  test('should have correct ngsw-config.json', async () => {
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync('ngsw-config.json', 'utf8'));

    // Verify asset groups exist
    expect(config.assetGroups).toHaveLength(3);

    // App group should prefetch core files
    const appGroup = config.assetGroups.find((g: any) => g.name === 'app');
    expect(appGroup).toBeDefined();
    expect(appGroup.installMode).toBe('prefetch');
    expect(appGroup.resources.files).toContain('/index.html');

    // Assets group should prefetch data files
    const assetsGroup = config.assetGroups.find((g: any) => g.name === 'assets');
    expect(assetsGroup).toBeDefined();
    expect(assetsGroup.installMode).toBe('prefetch');
    expect(assetsGroup.resources.files).toContain('/assets/data/**');

    // Flags group should be lazy
    const flagsGroup = config.assetGroups.find((g: any) => g.name === 'flags');
    expect(flagsGroup).toBeDefined();
    expect(flagsGroup.installMode).toBe('lazy');
  });

  test('app should load and render without errors', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });

    // Navigate to quiz
    await page.goto('/quiz');
    await expect(page.locator('h1')).toContainText(/Quiz|Wissensquiz/);

    // Navigate to settings
    await page.goto('/settings');
    await expect(page.locator('h1')).toContainText(/Einstellungen|Settings/);
  });

  test('manifest.webmanifest should have correct configuration', async () => {
    const fs = require('fs');
    const manifest = JSON.parse(fs.readFileSync('public/manifest.webmanifest', 'utf8'));

    expect(manifest.name).toBe('OkkKnowledge');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test('should handle navigation to unknown routes', async ({ page }) => {
    await page.goto('/nonexistent-page');
    // Should redirect to home
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  });
});
