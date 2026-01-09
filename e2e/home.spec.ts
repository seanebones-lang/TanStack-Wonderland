import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load and display Pokemon grid', async ({ page }) => {
    await page.goto('/')

    // Check page title
    await expect(page.getByRole('heading', { name: /Welcome to TanStack Wonderland/i })).toBeVisible()

    // Check search input is present
    const searchInput = page.getByLabel('Search Pokemon')
    await expect(searchInput).toBeVisible()

    // Wait for Pokemon cards to load
    await expect(page.getByText(/Showing \d+ of \d+ Pokemon/i)).toBeVisible({ timeout: 10000 })

    // Check that Pokemon cards are rendered
    const pokemonCards = page.locator('[aria-label*="View details for"]')
    await expect(pokemonCards.first()).toBeVisible()
  })

  test('should filter Pokemon by search query', async ({ page }) => {
    await page.goto('/')

    const searchInput = page.getByLabel('Search Pokemon')
    await searchInput.fill('pikachu')

    // Wait for filtered results
    await expect(page.getByText(/matching "pikachu"/i)).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to Pokemon detail page on card click', async ({ page }) => {
    await page.goto('/')

    // Wait for cards to load
    await page.waitForSelector('[aria-label*="View details for"]', { timeout: 10000 })

    // Click first Pokemon card
    const firstCard = page.locator('[aria-label*="View details for"]').first()
    await firstCard.click()

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/pokemon\/\w+/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should load more Pokemon on scroll', async ({ page }) => {
    await page.goto('/')

    // Scroll to bottom
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })

    // Wait for loading indicator
    await page.waitForTimeout(1000)

    // Check that more Pokemon are loaded
    const resultsText = await page.getByText(/Showing \d+ of \d+ Pokemon/i).textContent()
    const match = resultsText?.match(/Showing (\d+) of (\d+) Pokemon/)
    if (match) {
      const showing = parseInt(match[1])
      expect(showing).toBeGreaterThan(20) // Should have loaded more than initial 20
    }
  })
})
