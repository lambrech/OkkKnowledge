import { test, expect } from '@playwright/test';

test.describe('Statistics Page', () => {
  test('should show no-data message when no games played', async ({ page }) => {
    await page.goto('/stats');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.locator('.no-data')).toBeVisible();
    await expect(page.locator('.no-data')).toContainText(/Noch keine|No data/);
  });

  test('should show quiz stats after playing a quiz', async ({ page }) => {
    // Play a short quiz first
    await page.goto('/quiz');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.locator('button', { hasText: /Runde starten|Start Round/ }).click();

    // Answer 3 questions
    for (let i = 0; i < 3; i++) {
      await page.locator('.options .option-btn').first().click();
      await page.locator('.next-btn').click();
    }

    // Navigate to stats
    await page.goto('/stats');

    // Should show quiz stats card
    await expect(page.locator('h1')).toContainText(/Statistik|Statistics/);
    const quizStatsCard = page.locator('mat-card', { hasText: /Quiz/ });
    await expect(quizStatsCard).toBeVisible();

    // Should show total answered >= 3
    await expect(quizStatsCard).toContainText('3');
  });

  test('should show category breakdown', async ({ page }) => {
    // Set up some quiz progress
    await page.goto('/stats');
    await page.evaluate(() => {
      localStorage.setItem('wissensapp_progress', JSON.stringify({
        quiz: {
          totalAnswered: 10,
          totalCorrect: 7,
          byCategory: {
            'geography': { answered: 3, correct: 2 },
            'history': { answered: 3, correct: 2 },
            'famous-people': { answered: 2, correct: 1 },
            'science-tech': { answered: 2, correct: 2 },
          },
          streak: 2,
          bestStreak: 4,
        },
        timeline: { gamesPlayed: 0, totalEventsPlaced: 0, totalCorrectPlacements: 0, exactYearBonuses: 0, bestGameScore: 0 },
        answeredQuestionIds: [],
        lastPlayed: new Date().toISOString(),
        preferredLanguage: 'de',
        theme: 'system',
      }));
    });
    await page.reload();

    // Should display category names
    await expect(page.locator('text=/Geografie|Geography/')).toBeVisible();
    await expect(page.locator('text=/Geschichte|History/')).toBeVisible();
  });

  test('should show progress bars', async ({ page }) => {
    await page.goto('/stats');
    await page.evaluate(() => {
      localStorage.setItem('wissensapp_progress', JSON.stringify({
        quiz: {
          totalAnswered: 10, totalCorrect: 7,
          byCategory: { 'geography': { answered: 3, correct: 2 }, 'history': { answered: 3, correct: 2 }, 'famous-people': { answered: 2, correct: 1 }, 'science-tech': { answered: 2, correct: 2 } },
          streak: 0, bestStreak: 4,
        },
        timeline: { gamesPlayed: 0, totalEventsPlaced: 0, totalCorrectPlacements: 0, exactYearBonuses: 0, bestGameScore: 0 },
        answeredQuestionIds: [], lastPlayed: '', preferredLanguage: 'de', theme: 'system',
      }));
    });
    await page.reload();

    // Wait for page content to load
    await expect(page.locator('h1')).toContainText(/Statistik|Statistics/);

    const progressBars = page.locator('mat-progress-bar');
    await expect(progressBars.first()).toBeVisible({ timeout: 5000 });
    expect(await progressBars.count()).toBeGreaterThanOrEqual(1);
  });
});
