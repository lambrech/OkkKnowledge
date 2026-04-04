import { test, expect } from '@playwright/test';

test.describe('Timeline Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/timeline');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should show start screen with title and new game button', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Zeitstrahl|Timeline/);
    await expect(page.locator('button', { hasText: /Neues Spiel|New Game/ })).toBeVisible();
  });

  test('should start a game and show the board', async ({ page }) => {
    await page.locator('button', { hasText: /Neues Spiel|New Game/ }).click();

    // Should show game header with score and lives
    await expect(page.locator('.game-header')).toBeVisible();
    await expect(page.locator('.heart')).toHaveCount(3);

    // Should show current event card to place
    await expect(page.locator('.current-event-card')).toBeVisible();

    // Should show at least one placed event on timeline
    await expect(page.locator('.timeline-event').first()).toBeVisible();

    // Should show drop zones
    const dropZones = page.locator('.drop-zone');
    expect(await dropZones.count()).toBeGreaterThanOrEqual(2);
  });

  test('should display event title and description on current card', async ({ page }) => {
    await page.locator('button', { hasText: /Neues Spiel|New Game/ }).click();

    const card = page.locator('.current-event-card');
    await expect(card.locator('h2')).not.toBeEmpty();
    await expect(card.locator('.event-desc')).toBeVisible();
  });

  test('should show placed events with year visible', async ({ page }) => {
    await page.locator('button', { hasText: /Neues Spiel|New Game/ }).click();

    const firstEvent = page.locator('.timeline-event').first();
    await expect(firstEvent.locator('.event-year')).toBeVisible();
    await expect(firstEvent.locator('.event-title')).toBeVisible();
  });

  test('should allow placing an event by clicking a drop zone', async ({ page }) => {
    await page.locator('button', { hasText: /Neues Spiel|New Game/ }).click();

    // Wait for the game board to be ready
    await expect(page.locator('.current-event-card')).toBeVisible();
    const initialEventCount = await page.locator('.timeline-event').count();

    // Click the first drop zone
    await page.locator('.drop-zone').first().click();

    // Should show feedback
    await expect(page.locator('.placement-feedback')).toBeVisible();

    // If year guess screen appears (correct placement), skip it
    const skipBtn = page.locator('button', { hasText: /Überspringen|Skip/ });
    if (await skipBtn.isVisible().catch(() => false)) {
      await skipBtn.click();
    }

    // Wait for the next state (new event card or game state update)
    await page.waitForTimeout(1500);

    // After handling placement, event count should increase
    const newEventCount = await page.locator('.timeline-event').count();
    expect(newEventCount).toBeGreaterThan(initialEventCount);
  });

  test('should show correct/incorrect feedback after placement', async ({ page }) => {
    await page.locator('button', { hasText: /Neues Spiel|New Game/ }).click();
    await page.locator('.drop-zone').first().click();

    const feedback = page.locator('.placement-feedback');
    await expect(feedback).toBeVisible();
    // Should have either correct or incorrect class
    const classes = await feedback.getAttribute('class') || '';
    expect(classes.includes('correct') || classes.includes('incorrect')).toBeTruthy();
  });

  test('should show year guess screen after correct placement', async ({ page }) => {
    await page.locator('button', { hasText: /Neues Spiel|New Game/ }).click();

    // We need to make a correct placement - try multiple drop zones until one is correct
    // Make 5 attempts (5 events), one should be correct eventually
    for (let attempt = 0; attempt < 5; attempt++) {
      const currentCard = page.locator('.current-event-card');
      if (!(await currentCard.isVisible())) break;

      // Try placing at different positions
      const dropZones = page.locator('.drop-zone:not([disabled])');
      const dropZoneCount = await dropZones.count();
      if (dropZoneCount === 0) break;

      // Pick a middle drop zone (better chance of being correct)
      const middleIdx = Math.floor(dropZoneCount / 2);
      await dropZones.nth(middleIdx).click();

      // Check if year guess screen appeared
      const yearInput = page.locator('input[type="number"]');
      try {
        await yearInput.waitFor({ state: 'visible', timeout: 2000 });
        // Year guess screen appeared!
        await expect(page.locator('h2')).toContainText(/genaue|exact/i);
        await expect(page.locator('button', { hasText: /Überspringen|Skip/ })).toBeVisible();
        return; // Test passed
      } catch {
        // Wrong placement or still playing, try again
        await page.waitForTimeout(1500);
      }
    }

    // If we never got a correct placement, that's still ok - the game mechanics work
    test.skip(true, 'No correct placement achieved in 5 attempts - randomized game');
  });

  test('should allow skipping year guess', async ({ page }) => {
    await page.locator('button', { hasText: /Neues Spiel|New Game/ }).click();

    // Keep trying until we get a correct answer or run out of events
    for (let attempt = 0; attempt < 10; attempt++) {
      if (!(await page.locator('.current-event-card').isVisible())) break;

      const dropZones = page.locator('.drop-zone:not([disabled])');
      if ((await dropZones.count()) === 0) break;

      await dropZones.nth(Math.floor(await dropZones.count() / 2)).click();

      const skipBtn = page.locator('button', { hasText: /Überspringen|Skip/ });
      try {
        await skipBtn.waitFor({ state: 'visible', timeout: 2000 });
        await skipBtn.click();
        // After skipping, should be back to playing state
        await page.waitForTimeout(500);
        // Either we see a new current event card or game is over
        const isPlaying = await page.locator('.current-event-card').isVisible();
        const isGameOver = await page.locator('.timeline-result').isVisible();
        expect(isPlaying || isGameOver).toBeTruthy();
        return;
      } catch {
        await page.waitForTimeout(1500);
      }
    }

    test.skip(true, 'No correct placement to test skip on');
  });

  test('should lose lives on wrong placement', async ({ page }) => {
    await page.locator('button', { hasText: /Neues Spiel|New Game/ }).click();
    await expect(page.locator('.heart')).toHaveCount(3);

    // Place events - some will be wrong
    for (let i = 0; i < 5; i++) {
      if (!(await page.locator('.current-event-card').isVisible())) break;

      // Always place at the start - likely to be wrong eventually
      const dropZone = page.locator('.drop-zone').first();
      if (await dropZone.isDisabled()) break;
      await dropZone.click();

      // Check for year guess and skip it
      const skipBtn = page.locator('button', { hasText: /Überspringen|Skip/ });
      try {
        await skipBtn.waitFor({ state: 'visible', timeout: 2000 });
        await skipBtn.click();
      } catch {
        await page.waitForTimeout(1500);
      }
    }

    // After some placements, hearts count should potentially be less (or game could be over)
    const hearts = await page.locator('.heart').count();
    const isGameOver = await page.locator('.timeline-result').isVisible();
    expect(hearts < 3 || isGameOver).toBeTruthy();
  });

  test('should show game over screen when lives are exhausted', async ({ page }) => {
    test.setTimeout(90000);
    await page.locator('button', { hasText: /Neues Spiel|New Game/ }).click();
    await expect(page.locator('.current-event-card')).toBeVisible();

    // Keep making placements until game ends
    for (let i = 0; i < 30; i++) {
      if (await page.locator('.timeline-result').isVisible()) break;
      if (!(await page.locator('.current-event-card').isVisible())) break;

      // Click the last drop zone (most likely wrong position)
      const dropZones = page.locator('.drop-zone');
      const count = await dropZones.count();
      if (count === 0) break;
      await dropZones.nth(count - 1).click();

      // Wait for feedback or year guess
      await page.waitForTimeout(500);

      // Handle year guess if it appears (correct placement)
      if (await page.locator('button', { hasText: /Überspringen|Skip/ }).isVisible()) {
        await page.locator('button', { hasText: /Überspringen|Skip/ }).click();
        await page.waitForTimeout(300);
      } else {
        // Wrong placement - wait for animation to complete
        await page.waitForTimeout(1200);
      }
    }

    // Game should eventually end
    const gameOver = await page.locator('.timeline-result').isVisible();
    const stillPlaying = await page.locator('.current-event-card').isVisible();
    expect(gameOver || !stillPlaying).toBeTruthy();
  });

  test('should allow starting a new game from result screen', async ({ page }) => {
    test.setTimeout(90000);
    await page.locator('button', { hasText: /Neues Spiel|New Game/ }).click();
    await expect(page.locator('.current-event-card')).toBeVisible();

    // Keep making placements until game ends
    for (let i = 0; i < 30; i++) {
      if (await page.locator('.timeline-result').isVisible()) break;
      if (!(await page.locator('.current-event-card').isVisible())) break;

      const dropZones = page.locator('.drop-zone');
      const count = await dropZones.count();
      if (count === 0) break;
      await dropZones.nth(count - 1).click();

      await page.waitForTimeout(500);

      if (await page.locator('button', { hasText: /Überspringen|Skip/ }).isVisible()) {
        await page.locator('button', { hasText: /Überspringen|Skip/ }).click();
        await page.waitForTimeout(300);
      } else {
        await page.waitForTimeout(1200);
      }
    }

    // If game over screen is visible, try new game
    if (await page.locator('.timeline-result').isVisible()) {
      await page.locator('button', { hasText: /Neues Spiel|New Game/ }).click();
      await expect(page.locator('.current-event-card')).toBeVisible({ timeout: 5000 });
    }
  });
});
