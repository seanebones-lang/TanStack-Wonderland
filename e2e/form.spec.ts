import { test, expect } from '@playwright/test'

test.describe('Team Builder Form', () => {
  test('should display form with 6 Pokemon slots', async ({ page }) => {
    await page.goto('/form')

    // Check form title
    await expect(page.getByRole('heading', { name: /Pokemon Team Builder/i })).toBeVisible()

    // Check all 6 slots are present
    for (let i = 1; i <= 6; i++) {
      await expect(page.getByLabel(`Pokemon ${i}`)).toBeVisible()
    }
  })

  test('should show autocomplete suggestions', async ({ page }) => {
    await page.goto('/form')

    const firstInput = page.getByLabel('Pokemon 1')
    await firstInput.fill('pik')

    // Wait for suggestions to appear
    await expect(page.getByRole('listbox')).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('option', { name: /pikachu/i })).toBeVisible()
  })

  test('should prevent duplicate Pokemon', async ({ page }) => {
    await page.goto('/form')

    const firstInput = page.getByLabel('Pokemon 1')
    const secondInput = page.getByLabel('Pokemon 2')

    // Fill first slot
    await firstInput.fill('pikachu')
    await page.getByRole('option', { name: /pikachu/i }).first().click()

    // Try to fill second slot with same Pokemon
    await secondInput.fill('pikachu')
    await page.getByRole('option', { name: /pikachu/i }).first().click()

    // Should show duplicate error
    await expect(page.getByText(/Duplicate/i)).toBeVisible()
  })

  test('should validate minimum 6 Pokemon', async ({ page }) => {
    await page.goto('/form')

    // Fill only 5 slots
    for (let i = 1; i <= 5; i++) {
      const input = page.getByLabel(`Pokemon ${i}`)
      await input.fill(`pokemon${i}`)
    }

    // Submit button should be disabled or show error
    const submitButton = page.getByRole('button', { name: /Submit Team/i })
    const isDisabled = await submitButton.isDisabled()
    expect(isDisabled).toBeTruthy()
  })

  test('should save team to localStorage', async ({ page, context }) => {
    await page.goto('/form')

    // Fill a team
    const firstInput = page.getByLabel('Pokemon 1')
    await firstInput.fill('pikachu')
    await page.getByRole('option', { name: /pikachu/i }).first().click()

    // Click save button
    const saveButton = page.getByLabel(/Save team to local storage/i)
    await saveButton.click()

    // Check for success message
    await expect(page.getByText(/Team saved locally/i)).toBeVisible()
  })
})
