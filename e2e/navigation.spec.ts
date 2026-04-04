import { test, expect, Page } from '@playwright/test';

test.describe('App Shell & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the app title in toolbar', async ({ page }) => {
    const toolbar = page.locator('mat-toolbar');
    await expect(toolbar).toBeVisible();
    await expect(toolbar).toContainText('WissensApp');
  });

  test('should show bottom navigation on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const bottomNav = page.locator('.bottom-nav');
    await expect(bottomNav).toBeVisible();
    await expect(bottomNav.locator('a')).toHaveCount(5);
  });

  test('should navigate to quiz via bottom nav', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.locator('.bottom-nav a', { hasText: 'Quiz' }).click();
    await expect(page).toHaveURL(/\/quiz/);
  });

  test('should navigate to timeline via bottom nav', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.locator('.bottom-nav a', { hasText: /Zeitstrahl|Timeline/ }).click();
    await expect(page).toHaveURL(/\/timeline/);
  });

  test('should navigate to stats via bottom nav', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.locator('.bottom-nav a', { hasText: /Statistik|Stats/ }).click();
    await expect(page).toHaveURL(/\/stats/);
  });

  test('should navigate to settings via bottom nav', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.locator('.bottom-nav a', { hasText: /Einstellungen|Settings/ }).click();
    await expect(page).toHaveURL(/\/settings/);
  });

  test('should open sidenav when hamburger menu is clicked', async ({ page }) => {
    const menuButton = page.locator('mat-toolbar button[mat-icon-button]').first();
    await menuButton.click();
    const sidenav = page.locator('mat-sidenav');
    await expect(sidenav).toBeVisible();
    await expect(sidenav.locator('a')).toHaveCount(5);
  });

  test('should navigate via sidenav and close it', async ({ page }) => {
    const menuButton = page.locator('mat-toolbar button[mat-icon-button]').first();
    await menuButton.click();
    const sidenav = page.locator('mat-sidenav');
    await sidenav.locator('a', { hasText: 'Quiz' }).click();
    await expect(page).toHaveURL(/\/quiz/);
    // sidenav should be closed after navigation
    await expect(sidenav).not.toBeVisible();
  });

  test('should navigate back home from any page', async ({ page }) => {
    await page.goto('/quiz');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.locator('.bottom-nav a').first().click();
    await expect(page).toHaveURL('/');
  });
});
