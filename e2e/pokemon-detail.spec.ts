import { test, expect } from '@playwright/test'

test.describe('Pokemon Detail Page', () => {
  test('should display Pokemon details', async ({ page }) => {
    await page.goto('/pokemon/pikachu')

    // Check Pokemon name is displayed
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // Check stats section
    await expect(page.getByText(/Base Stats/i)).toBeVisible({ timeout: 10000 })

    // Check types section
    await expect(page.getByText(/Types/i)).toBeVisible()
  })

  test('should navigate with previous/next buttons', async ({ page }) => {
    await page.goto('/pokemon/25') // Pikachu

    // Click next button
    const nextButton = page.getByLabel(/Next Pokemon/i)
    await nextButton.click()

    // Should navigate to next Pokemon
    await expect(page).toHaveURL(/\/pokemon\/26/)
  })

  test('should navigate with keyboard arrows', async ({ page }) => {
    await page.goto('/pokemon/25')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Press right arrow
    await page.keyboard.press('ArrowRight')

    // Should navigate to next Pokemon
    await expect(page).toHaveURL(/\/pokemon\/26/, { timeout: 5000 })
  })

  test('should toggle shiny sprite', async ({ page }) => {
    await page.goto('/pokemon/pikachu')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Look for shiny toggle button
    const shinyButton = page.getByLabel(/Switch to.*sprite/i).first()
    if (await shinyButton.isVisible()) {
      await shinyButton.click()
      // Should show shiny form text
      await expect(page.getByText(/Shiny form/i)).toBeVisible()
    }
  })

  test('should copy share link', async ({ page, context }) => {
    await page.goto('/pokemon/pikachu')

    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    const shareButton = page.getByLabel(/Share Pokemon link/i)
    await shareButton.click()

    // Check for toast notification
    await expect(page.getByText(/Link copied to clipboard/i)).toBeVisible({ timeout: 2000 })
  })
})
