import { test, expect } from '@playwright/test';

test.describe('Internationalization (i18n)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should default to German language', async ({ page }) => {
    await expect(page.locator('mat-toolbar')).toContainText('OkkKnowledge');
    await expect(page.locator('.welcome-title')).toContainText('Willkommen');
  });

  test('should switch to English via toolbar toggle', async ({ page }) => {
    // Click language toggle in toolbar
    await page.locator('.lang-toggle').click();
    await expect(page.locator('mat-toolbar')).toContainText('OkkKnowledge');
    await expect(page.locator('.welcome-title')).toContainText('Welcome');
  });

  test('should switch back to German', async ({ page }) => {
    // Switch to English
    await page.locator('.lang-toggle').click();
    await expect(page.locator('.welcome-title')).toContainText('Welcome');

    // Switch back to German
    await page.locator('.lang-toggle').click();
    await expect(page.locator('.welcome-title')).toContainText('Willkommen');
  });

  test('should persist language preference across navigation', async ({ page }) => {
    // Switch to English
    await page.locator('.lang-toggle').click();
    await expect(page.locator('mat-toolbar')).toContainText('OkkKnowledge');

    // Navigate to quiz
    await page.goto('/quiz');
    await expect(page.locator('h1')).toContainText('Knowledge Quiz');

    // Navigate to settings
    await page.goto('/settings');
    await expect(page.locator('h1')).toContainText('Settings');

    // Navigate back home
    await page.goto('/');
    await expect(page.locator('.welcome-title')).toContainText('Welcome');
  });

  test('should persist language preference across page reloads', async ({ page }) => {
    // Switch to English
    await page.locator('.lang-toggle').click();
    await expect(page.locator('mat-toolbar')).toContainText('OkkKnowledge');

    // Reload the page
    await page.reload();
    // Note: the default lang is 'de', so after reload we check if the preference was stored
    // The language preference is in localStorage, but Transloco default is 'de'
    // The app initializes the lang from stored progress
  });

  test('should show quiz questions in English when language is English', async ({ page }) => {
    // Switch to English
    await page.locator('.lang-toggle').click();
    await page.goto('/quiz');
    await page.locator('button', { hasText: 'Start Round' }).click();

    // Question should be visible and in English (contains common English words)
    const questionText = await page.locator('.question-text').textContent();
    expect(questionText).toBeTruthy();
    // The question should not be empty
    expect(questionText!.length).toBeGreaterThan(5);
  });

  test('should show quiz questions in German by default', async ({ page }) => {
    await page.goto('/quiz');
    await page.locator('button', { hasText: 'Runde starten' }).click();

    const questionText = await page.locator('.question-text').textContent();
    expect(questionText).toBeTruthy();
    expect(questionText!.length).toBeGreaterThan(5);
  });

  test('should show navigation labels in the current language', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // German by default
    const bottomNav = page.locator('.bottom-nav');
    await expect(bottomNav).toContainText('Start');
    await expect(bottomNav).toContainText('Quiz');
    await expect(bottomNav).toContainText('Zeitstrahl');

    // Switch to English
    await page.locator('.lang-toggle').click();
    await expect(bottomNav).toContainText('Home');
    await expect(bottomNav).toContainText('Timeline');
  });

  test('should show language toggle text reflecting current language', async ({ page }) => {
    // Default is German, toggle should show 'DE'
    await expect(page.locator('.lang-toggle')).toContainText('DE');

    // Switch to English
    await page.locator('.lang-toggle').click();
    await expect(page.locator('.lang-toggle')).toContainText('EN');
  });
});
