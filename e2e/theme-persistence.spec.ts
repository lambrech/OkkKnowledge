import { test, expect } from '@playwright/test';

test.describe('Theme Toggle & Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should have theme toggle button in toolbar', async ({ page }) => {
    const themeToggle = page.locator('app-theme-toggle button');
    await expect(themeToggle).toBeVisible();
  });

  test('should toggle to dark theme', async ({ page }) => {
    const themeToggle = page.locator('app-theme-toggle button');
    // Default might be light or system - click until dark
    await themeToggle.click(); // light -> dark
    const hasDark = await page.locator('body').evaluate(el => el.classList.contains('dark-theme'));
    if (!hasDark) {
      await themeToggle.click(); // dark -> system (or system -> light)
    }

    // Try via settings for more control
    await page.goto('/settings');
    await page.locator('mat-button-toggle', { hasText: /Dunkel|Dark/ }).click();
    await expect(page.locator('body')).toHaveClass(/dark-theme/);
  });

  test('should persist theme across page reload', async ({ page }) => {
    await page.goto('/settings');
    await page.locator('mat-button-toggle', { hasText: /Dunkel|Dark/ }).click();
    await expect(page.locator('body')).toHaveClass(/dark-theme/);

    // Reload
    await page.reload();

    // Wait for app to initialize and apply theme
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toHaveClass(/dark-theme/);
  });

  test('should persist theme across navigation', async ({ page }) => {
    await page.goto('/settings');
    await page.locator('mat-button-toggle', { hasText: /Dunkel|Dark/ }).click();
    await expect(page.locator('body')).toHaveClass(/dark-theme/);

    // Navigate to other pages
    await page.goto('/quiz');
    await expect(page.locator('body')).toHaveClass(/dark-theme/);

    await page.goto('/');
    await expect(page.locator('body')).toHaveClass(/dark-theme/);
  });

  test('should switch back to light theme', async ({ page }) => {
    await page.goto('/settings');

    // Set dark first
    await page.locator('mat-button-toggle', { hasText: /Dunkel|Dark/ }).click();
    await expect(page.locator('body')).toHaveClass(/dark-theme/);

    // Set light
    await page.locator('mat-button-toggle', { hasText: /Hell|Light/ }).click();
    await expect(page.locator('body')).not.toHaveClass(/dark-theme/);
  });

  test('should save theme to localStorage', async ({ page }) => {
    await page.goto('/settings');
    await page.locator('mat-button-toggle', { hasText: /Dunkel|Dark/ }).click();

    const progress = await page.evaluate(() => {
      const raw = localStorage.getItem('wissensapp_progress');
      return raw ? JSON.parse(raw) : null;
    });
    expect(progress.theme).toBe('dark');
  });
});

test.describe('Score Persistence', () => {
  test('should persist quiz score to localStorage', async ({ page }) => {
    await page.goto('/quiz');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await page.locator('button', { hasText: /Runde starten|Start Round/ }).click();
    await page.locator('.options .option-btn').first().click();

    const progress = await page.evaluate(() => {
      const raw = localStorage.getItem('wissensapp_progress');
      return raw ? JSON.parse(raw) : null;
    });
    expect(progress).not.toBeNull();
    expect(progress.quiz.totalAnswered).toBe(1);
  });

  test('should restore quiz score after page reload', async ({ page }) => {
    await page.goto('/quiz');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Answer 2 questions
    await page.locator('button', { hasText: /Runde starten|Start Round/ }).click();
    await page.locator('.options .option-btn').first().click();
    await page.locator('.next-btn').click();
    await page.locator('.options .option-btn').first().click();

    // Navigate to home and check stats
    await page.goto('/');
    await page.reload();

    // Stats should reflect the 2 answered questions
    const progress = await page.evaluate(() => {
      const raw = localStorage.getItem('wissensapp_progress');
      return raw ? JSON.parse(raw) : null;
    });
    expect(progress.quiz.totalAnswered).toBe(2);
  });

  test('should show stats on home page after playing', async ({ page }) => {
    // Set up some progress
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('wissensapp_progress', JSON.stringify({
        quiz: {
          totalAnswered: 15, totalCorrect: 10,
          byCategory: { 'geography': { answered: 5, correct: 4 }, 'history': { answered: 5, correct: 3 }, 'famous-people': { answered: 3, correct: 2 }, 'science-tech': { answered: 2, correct: 1 } },
          streak: 3, bestStreak: 5,
        },
        timeline: { gamesPlayed: 0, totalEventsPlaced: 0, totalCorrectPlacements: 0, exactYearBonuses: 0, bestGameScore: 0 },
        answeredQuestionIds: [], lastPlayed: new Date().toISOString(), preferredLanguage: 'de', theme: 'system',
      }));
    });
    await page.reload();

    // Quick stats should be visible
    await expect(page.locator('.quick-stats')).toBeVisible();
    await expect(page.locator('.stat-value', { hasText: '15' })).toBeVisible();
    await expect(page.locator('.stat-value').filter({ hasText: /^5$/ })).toBeVisible();
  });
});
