
import { test, expect } from '@playwright/test'

test.describe('Catalog Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/catalog')
  })

  test('should display catalog page with products', async ({ page }) => {
    await expect(page.getByText('Fresh Groceries Delivered')).toBeVisible()
    await expect(page.getByText('Discover organic, sustainable products')).toBeVisible()
    
    await expect(page.getByText(/items/)).toBeVisible()
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible()
  })

  test('should search for products', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search products...')
    await searchInput.fill('apple')
    await searchInput.press('Enter')
    
    await expect(page.getByText('Search results for "apple"')).toBeVisible()
  })

  test('should handle empty search results', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search products...')
    await searchInput.fill('nonexistentproduct123')
    await searchInput.press('Enter')
    
    await expect(page.getByText('No products found')).toBeVisible()
  })

  test('should navigate through pagination', async ({ page }) => {
    const pagination = page.locator('[data-testid="pagination-next"]')
    if (await pagination.isVisible()) {
      await pagination.click()
      await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible()
    }
  })

  test('should display product details on product cards', async ({ page }) => {
    const firstProduct = page.locator('[data-testid="product-card"]').first()
    await expect(firstProduct).toBeVisible()
    
    await expect(firstProduct.locator('img')).toBeVisible()
    await expect(firstProduct.getByText(/\$/)).toBeVisible() 
    await expect(firstProduct.getByText(/./)).toBeVisible() 
  })

  test('should handle mobile search input', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/catalog')
    
    const mobileSearchInput = page.getByPlaceholder('Search products...')
    await expect(mobileSearchInput).toBeVisible()
    
    await mobileSearchInput.fill('banana')
    await mobileSearchInput.press('Enter')
    
    await expect(page.getByText('Search results for "banana"')).toBeVisible()
  })
})