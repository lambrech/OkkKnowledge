import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should show settings title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Einstellungen|Settings/);
  });

  test('should show language toggle buttons', async ({ page }) => {
    await expect(page.locator('mat-button-toggle', { hasText: 'Deutsch' })).toBeVisible();
    await expect(page.locator('mat-button-toggle', { hasText: 'English' })).toBeVisible();
  });

  test('should show theme toggle buttons', async ({ page }) => {
    await expect(page.locator('mat-button-toggle', { hasText: /Hell|Light/ })).toBeVisible();
    await expect(page.locator('mat-button-toggle', { hasText: /Dunkel|Dark/ })).toBeVisible();
    await expect(page.locator('mat-button-toggle', { hasText: 'System' })).toBeVisible();
  });

  test('should switch language to English', async ({ page }) => {
    await page.locator('mat-button-toggle', { hasText: 'English' }).click();
    // Title should change to English
    await expect(page.locator('h1')).toContainText('Settings');
    // Toolbar should also change
    await expect(page.locator('mat-toolbar')).toContainText('OkkKnowledge');
  });

  test('should switch language to German', async ({ page }) => {
    // Switch to English first, then back
    await page.locator('mat-button-toggle', { hasText: 'English' }).click();
    await expect(page.locator('h1')).toContainText('Settings');

    await page.locator('mat-button-toggle', { hasText: 'Deutsch' }).click();
    await expect(page.locator('h1')).toContainText('Einstellungen');
    await expect(page.locator('mat-toolbar')).toContainText('OkkKnowledge');
  });

  test('should apply dark theme', async ({ page }) => {
    await page.locator('mat-button-toggle', { hasText: /Dunkel|Dark/ }).click();
    // body should have dark-theme class
    await expect(page.locator('body')).toHaveClass(/dark-theme/);
  });

  test('should apply light theme', async ({ page }) => {
    // First set dark, then light
    await page.locator('mat-button-toggle', { hasText: /Dunkel|Dark/ }).click();
    await expect(page.locator('body')).toHaveClass(/dark-theme/);

    await page.locator('mat-button-toggle', { hasText: /Hell|Light/ }).click();
    await expect(page.locator('body')).not.toHaveClass(/dark-theme/);
  });

  test('should show reset progress section in expansion panel', async ({ page }) => {
    const expansionPanel = page.locator('mat-expansion-panel');
    await expect(expansionPanel).toBeVisible();
    await expansionPanel.click();

    await expect(page.locator('button', { hasText: /Quiz.*zurücksetzen|Reset Quiz/ })).toBeVisible();
    await expect(page.locator('button', { hasText: /Zeitstrahl.*zurücksetzen|Reset Timeline/ })).toBeVisible();
    await expect(page.locator('button', { hasText: /Alles zurücksetzen|Reset All/ })).toBeVisible();
  });

  test('should reset quiz progress', async ({ page }) => {
    // Set some progress first
    await page.evaluate(() => {
      localStorage.setItem('wissensapp_progress', JSON.stringify({
        quiz: {
          totalAnswered: 10, totalCorrect: 7,
          byCategory: { 'geography': { answered: 3, correct: 2 }, 'history': { answered: 3, correct: 2 }, 'famous-people': { answered: 2, correct: 1 }, 'science-tech': { answered: 2, correct: 2 } },
          streak: 2, bestStreak: 4,
        },
        timeline: { gamesPlayed: 5, totalEventsPlaced: 20, totalCorrectPlacements: 15, exactYearBonuses: 3, bestGameScore: 80 },
        answeredQuestionIds: ['q1', 'q2'], lastPlayed: '', preferredLanguage: 'de', theme: 'system',
      }));
    });
    await page.reload();

    // Open expansion panel and reset quiz
    await page.locator('mat-expansion-panel').click();
    await page.locator('button', { hasText: /Quiz.*zurücksetzen|Reset Quiz/ }).click();

    // Verify quiz was reset but timeline wasn't
    const progress = await page.evaluate(() => {
      const raw = localStorage.getItem('wissensapp_progress');
      return raw ? JSON.parse(raw) : null;
    });
    expect(progress.quiz.totalAnswered).toBe(0);
    expect(progress.timeline.gamesPlayed).toBe(5); // timeline should be untouched
  });

  test('should reset all progress', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('wissensapp_progress', JSON.stringify({
        quiz: { totalAnswered: 10, totalCorrect: 7, byCategory: { 'geography': { answered: 3, correct: 2 }, 'history': { answered: 3, correct: 2 }, 'famous-people': { answered: 2, correct: 1 }, 'science-tech': { answered: 2, correct: 2 } }, streak: 2, bestStreak: 4 },
        timeline: { gamesPlayed: 5, totalEventsPlaced: 20, totalCorrectPlacements: 15, exactYearBonuses: 3, bestGameScore: 80 },
        answeredQuestionIds: ['q1'], lastPlayed: '', preferredLanguage: 'en', theme: 'dark',
      }));
    });
    await page.reload();

    await page.locator('mat-expansion-panel').click();
    await page.locator('button', { hasText: /Alles zurücksetzen|Reset All/ }).click();

    const progress = await page.evaluate(() => {
      const raw = localStorage.getItem('wissensapp_progress');
      return raw ? JSON.parse(raw) : null;
    });
    expect(progress.quiz.totalAnswered).toBe(0);
    expect(progress.timeline.gamesPlayed).toBe(0);
    // Language and theme should be preserved
    expect(progress.preferredLanguage).toBe('en');
    expect(progress.theme).toBe('dark');
  });

  test('should show snackbar after reset', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('wissensapp_progress', JSON.stringify({
        quiz: { totalAnswered: 5, totalCorrect: 3, byCategory: { 'geography': { answered: 5, correct: 3 }, 'history': { answered: 0, correct: 0 }, 'famous-people': { answered: 0, correct: 0 }, 'science-tech': { answered: 0, correct: 0 } }, streak: 0, bestStreak: 2 },
        timeline: { gamesPlayed: 0, totalEventsPlaced: 0, totalCorrectPlacements: 0, exactYearBonuses: 0, bestGameScore: 0 },
        answeredQuestionIds: [], lastPlayed: '', preferredLanguage: 'de', theme: 'system',
      }));
    });
    await page.reload();

    await page.locator('mat-expansion-panel').click();
    await page.locator('button', { hasText: /Quiz.*zurücksetzen|Reset Quiz/ }).click();

    // Should show snackbar notification
    await expect(page.locator('mat-snack-bar-container')).toBeVisible({ timeout: 5000 });
  });
});
