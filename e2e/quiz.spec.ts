import { test, expect, Page } from '@playwright/test';

test.describe('Quiz Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quiz');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should show category selection screen', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Wissensquiz|Knowledge Quiz/);
    await expect(page.locator('h3')).toContainText(/Kategorien|Categories/);
  });

  test('should show all 4 category buttons', async ({ page }) => {
    const categoryButtons = page.locator('.category-chips button');
    await expect(categoryButtons).toHaveCount(4);
  });

  test('should toggle category selection', async ({ page }) => {
    const firstCat = page.locator('.category-chips button').first();
    // All are selected by default - click to deselect
    await firstCat.click();
    await expect(firstCat).not.toHaveClass(/selected/);
    // Click again to reselect
    await firstCat.click();
    await expect(firstCat).toHaveClass(/selected/);
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
});
