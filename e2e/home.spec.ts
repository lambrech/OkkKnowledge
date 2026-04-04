import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display welcome message', async ({ page }) => {
    await expect(page.locator('.welcome-title')).toContainText(/Willkommen|Welcome/);
  });

  test('should display quiz and timeline game cards', async ({ page }) => {
    const gameCards = page.locator('.game-card');
    await expect(gameCards).toHaveCount(2);
  });

  test('should have a working Start Quiz button', async ({ page }) => {
    await page.locator('a', { hasText: /Quiz starten|Start Quiz/ }).click();
    await expect(page).toHaveURL(/\/quiz/);
  });

  test('should have a working Play Timeline button', async ({ page }) => {
    await page.locator('a', { hasText: /Zeitstrahl spielen|Play Timeline/ }).click();
    await expect(page).toHaveURL(/\/timeline/);
  });

  test('should not show stats section when no games played', async ({ page }) => {
    // Clear localStorage first
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.locator('.quick-stats')).not.toBeVisible();
  });
});
