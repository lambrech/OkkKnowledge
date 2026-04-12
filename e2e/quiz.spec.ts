import { test, expect, Page } from '@playwright/test';

test.describe('Quiz Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quiz');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should show category selection screen', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Wissensquiz|Knowledge Quiz/);
    await expect(page.locator('h3').first()).toContainText(/Kategorien|Categories/);
  });

  test('should show geography group and other category buttons', async ({ page }) => {
    // Geography group button should be visible
    const geoGroup = page.locator('.geo-group-row');
    await expect(geoGroup).toBeVisible();
    // 3 non-geo categories should exist (History, Famous People, Science&Tech)
    await expect(page.locator('.category-chips > button', { hasText: /Geschichte|History/ })).toBeVisible();
    await expect(page.locator('.category-chips > button', { hasText: /Persönlichkeiten|Famous/ })).toBeVisible();
    await expect(page.locator('.category-chips > button', { hasText: /Wissenschaft|Science/ })).toBeVisible();
  });

  test('should toggle category selection', async ({ page }) => {
    // Click a non-geo category to deselect it
    const historyCat = page.locator('.category-chips > button', { hasText: /Geschichte|History/ });
    await historyCat.click();
    await expect(historyCat).not.toHaveClass(/selected/);
    // Click again to reselect
    await historyCat.click();
    await expect(historyCat).toHaveClass(/selected/);
  });

  test('should start a quiz round and display a question', async ({ page }) => {
    await page.locator('button', { hasText: /Runde starten|Start Round/ }).click();

    // Should show question text
    await expect(page.locator('.question-text')).toBeVisible();
    // Should show 4 answer options
    const options = page.locator('.options .option-btn');
    await expect(options).toHaveCount(4);
    // Should show progress bar
    await expect(page.locator('mat-progress-bar')).toBeVisible();
    // Should show question counter
    await expect(page.locator('.quiz-header')).toContainText(/Frage|Question/);
  });

  test('should provide feedback on correct answer', async ({ page }) => {
    await page.locator('button', { hasText: /Runde starten|Start Round/ }).click();
    await expect(page.locator('.question-text')).toBeVisible();

    // Find the correct answer by checking which button gets the .correct class
    // Click first option and check for feedback
    await page.locator('.options .option-btn').first().click();

    // Feedback should appear
    await expect(page.locator('.feedback')).toBeVisible();
    // Should show source link
    await expect(page.locator('.source-link a')).toBeVisible();
    // Should show next button
    await expect(page.locator('.next-btn')).toBeVisible();
  });

  test('should highlight correct answer in green', async ({ page }) => {
    await page.locator('button', { hasText: /Runde starten|Start Round/ }).click();
    await expect(page.locator('.question-text')).toBeVisible();

    // Click any option
    await page.locator('.options .option-btn').first().click();

    // Exactly one button should be marked as correct
    const correctButtons = page.locator('.options .option-btn.correct');
    await expect(correctButtons).toHaveCount(1);
  });

  test('should disable all options after answering', async ({ page }) => {
    await page.locator('button', { hasText: /Runde starten|Start Round/ }).click();
    await expect(page.locator('.question-text')).toBeVisible();

    await page.locator('.options .option-btn').first().click();

    // All buttons should be disabled
    const allButtons = page.locator('.options .option-btn');
    const count = await allButtons.count();
    for (let i = 0; i < count; i++) {
      await expect(allButtons.nth(i)).toBeDisabled();
    }
  });

  test('should advance to next question when clicking Next', async ({ page }) => {
    await page.locator('button', { hasText: /Runde starten|Start Round/ }).click();
    await expect(page.locator('.question-text')).toBeVisible();

    // Get first question text
    const firstQuestion = await page.locator('.question-text').textContent();

    // Answer and go next
    await page.locator('.options .option-btn').first().click();
    await page.locator('.next-btn').click();

    // Second question should be different
    await expect(page.locator('.question-text')).toBeVisible();
    const secondQuestion = await page.locator('.question-text').textContent();
    expect(firstQuestion).not.toBe(secondQuestion);
  });

  test('should complete a full quiz round and show results', async ({ page }) => {
    await page.locator('button', { hasText: /Runde starten|Start Round/ }).click();

    // Answer all questions (click first option each time, then next)
    for (let i = 0; i < 20; i++) {
      await expect(page.locator('.options .option-btn').first()).toBeVisible({ timeout: 5000 });
      await page.locator('.options .option-btn').first().click();

      const btnText = await page.locator('.next-btn').textContent();
      await page.locator('.next-btn').click();

      if (btnText?.includes('beenden') || btnText?.includes('Finish')) {
        break;
      }
    }

    // Should show result screen
    await expect(page.locator('.big-score')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button', { hasText: /Nochmal|Play Again/ })).toBeVisible();
    await expect(page.locator('button', { hasText: /Startseite|Home/ })).toBeVisible();
  });

  test('should show source link with valid URL for each question', async ({ page }) => {
    await page.locator('button', { hasText: /Runde starten|Start Round/ }).click();
    await page.locator('.options .option-btn').first().click();

    const sourceLink = page.locator('.source-link a');
    await expect(sourceLink).toBeVisible();
    const href = await sourceLink.getAttribute('href');
    expect(href).toMatch(/^https?:\/\//);
    expect(href).toContain('wikipedia.org');
  });

  test('should persist score after completing a quiz', async ({ page }) => {
    await page.locator('button', { hasText: /Runde starten|Start Round/ }).click();

    // Answer 3 questions
    for (let i = 0; i < 3; i++) {
      await page.locator('.options .option-btn').first().click();
      await page.locator('.next-btn').click();
    }

    // Check localStorage has progress
    const progress = await page.evaluate(() => {
      const raw = localStorage.getItem('wissensapp_progress');
      return raw ? JSON.parse(raw) : null;
    });
    expect(progress).not.toBeNull();
    expect(progress.quiz.totalAnswered).toBeGreaterThanOrEqual(3);
  });

  test('should allow playing again from result screen', async ({ page }) => {
    await page.locator('button', { hasText: /Runde starten|Start Round/ }).click();

    // Answer all quickly
    for (let i = 0; i < 20; i++) {
      await expect(page.locator('.options .option-btn').first()).toBeVisible({ timeout: 5000 });
      await page.locator('.options .option-btn').first().click();
      const btnText = await page.locator('.next-btn').textContent();
      await page.locator('.next-btn').click();
      if (btnText?.includes('beenden') || btnText?.includes('Finish')) break;
    }

    await expect(page.locator('.big-score')).toBeVisible({ timeout: 5000 });
    await page.locator('button', { hasText: /Nochmal|Play Again/ }).click();

    // Should start a new round with a question
    await expect(page.locator('.question-text')).toBeVisible({ timeout: 5000 });
  });

  test('should expand geography sub-categories', async ({ page }) => {
    // Click expand button
    await page.locator('.expand-btn').click();

    // Sub-categories should be visible
    const subCats = page.locator('.geo-subcategories button');
    await expect(subCats).toHaveCount(4);
  });

  test('should show continent filter when flags sub-category selected', async ({ page }) => {
    // By default all categories are selected including flags -> continent filter should show
    await expect(page.locator('h3', { hasText: /Kontinent|Continent/ })).toBeVisible();
  });

  test('should hide continent filter when only non-geo categories selected', async ({ page }) => {
    // Deselect geography group
    const geoBtn = page.locator('.geo-group-row button').first();
    await geoBtn.click();

    // Continent filter should be hidden
    await expect(page.locator('h3', { hasText: /Kontinent|Continent/ })).not.toBeVisible();
  });

  test('should auto-reset when all questions are answered', async ({ page }) => {
    // Seed localStorage with all flag question IDs answered for Europe
    // Then start a quiz with only flags + Europe -> should auto-reset and show questions
    await page.evaluate(() => {
      const ids: string[] = [];
      for (let i = 1; i <= 200; i++) {
        ids.push('flg-' + String(i).padStart(3, '0'));
        ids.push('cap-' + String(i).padStart(3, '0'));
      }
      const progress = {
        quiz: {
          totalAnswered: 0, totalCorrect: 0,
          byCategory: {
            geography: { answered: 0, correct: 0 },
            history: { answered: 0, correct: 0 },
            'famous-people': { answered: 0, correct: 0 },
            'science-tech': { answered: 0, correct: 0 },
            flags: { answered: 0, correct: 0 },
            capitals: { answered: 0, correct: 0 },
            map: { answered: 0, correct: 0 },
          },
          streak: 0, bestStreak: 0, bestRoundScore: 0, bestRoundTotal: 0,
        },
        timeline: { gamesPlayed: 0, totalEventsPlaced: 0, totalCorrectPlacements: 0, exactYearBonuses: 0, bestGameScore: 0 },
        answeredQuestionIds: ids,
        lastPlayed: '',
        preferredLanguage: 'de',
        theme: 'system',
        questionsPerRound: 20,
      };
      localStorage.setItem('wissensapp_progress', JSON.stringify(progress));
    });
    await page.reload();

    // Expand geo and deselect all non-flag categories
    // First deselect geography group
    await page.locator('.geo-group-row button').first().click();
    // Deselect other categories
    for (const cat of ['Geschichte', 'History', 'Berühmte', 'Famous', 'Wissenschaft', 'Science']) {
      const btn = page.locator('.category-chips > button', { hasText: new RegExp(cat) });
      if (await btn.count() > 0 && await btn.first().evaluate(el => el.classList.contains('selected'))) {
        await btn.first().click();
      }
    }
    // Expand geo and select only flags
    await page.locator('.expand-btn').click();
    await page.locator('.geo-subcategories button', { hasText: /Flaggen|Flags/ }).click();

    // Start quiz - should auto-reset and work
    await page.locator('button', { hasText: /Runde starten|Start Round/ }).click();
    await expect(page.locator('.question-text')).toBeVisible({ timeout: 5000 });
  });
});
