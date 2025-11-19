import { test, expect } from '@playwright/test'

test.describe('Cart Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cart')
    await page.evaluate(() => {
      localStorage.removeItem('cart')
      localStorage.removeItem('saved')
    })
  })

  test('should display empty cart state', async ({ page }) => {
    await page.goto('/cart')
    await expect(page.getByText('Your cart is empty.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Browse products' })).toBeVisible()
  })

  test('should navigate to catalog from empty cart', async ({ page }) => {
    await page.goto('/cart')
    await page.getByRole('button', { name: 'Browse products' }).click()
    await expect(page).toHaveURL(/.*catalog.*/)
  })

  test('should display cart items and allow checkout', async ({ page }) => {
    await page.goto('/products/test-product-1')
    await page.getByRole('button', { name: /add to cart/i }).click()
    
    await expect(page.getByText(/added to cart|item added/i).first()).toBeVisible()
    
    await page.goto('/cart')
    await expect(page.getByText('Items (1)')).toBeVisible()
    await expect(page.getByText('Test Product 1')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Checkout' })).toBeEnabled()
  })

  test('should handle multiple items in cart', async ({ page }) => {
    await page.goto('/products/test-product-1')
    await page.getByRole('button', { name: /add to cart/i }).click()
    
    await page.goto('/products/test-product-2')
    await page.getByRole('button', { name: /add to cart/i }).click()
    
    await page.goto('/cart')
    await expect(page.getByText('Items (2)')).toBeVisible()
    await expect(page.getByText('Test Product 1')).toBeVisible()
    await expect(page.getByText('Test Product 2')).toBeVisible()
  })

  test('should calculate totals correctly', async ({ page }) => {
    await page.goto('/products/test-product-1') 
    await page.getByRole('button', { name: /add to cart/i }).click()
    
    await page.goto('/products/test-product-2') 
    await page.getByRole('button', { name: /add to cart/i }).click()
    
    await page.goto('/cart')
    
    await expect(page.getByText('$79.98')).toBeVisible()
    
    await expect(page.getByText(/fees.*\$\d+\.\d{2}/)).toBeVisible()
    await expect(page.getByText(/total.*\$\d+\.\d{2}/)).toBeVisible()
  })

  test('should update quantities and recalculate totals', async ({ page }) => {
    await page.goto('/products/test-product-1')
    await page.getByRole('button', { name: /add to cart/i }).click()
    
    await page.goto('/cart')
    
    await page.getByRole('button', { name: /increase/i }).click()
    
    await expect(page.getByText('2')).toBeVisible()
    
    await expect(page.getByText('$59.98')).toBeVisible()
  })

  test('should allow removing items from cart', async ({ page }) => {
    await page.goto('/products/test-product-1')
    await page.getByRole('button', { name: /add to cart/i }).click()
    
    await page.goto('/cart')
    await expect(page.getByText('Test Product 1')).toBeVisible()
    
    await page.getByRole('button', { name: /remove|delete/i }).click()
    
    await expect(page.getByText('Your cart is empty.')).toBeVisible()
  })

  test('should allow clearing cart', async ({ page }) => {
    await page.goto('/products/test-product-1')
    await page.getByRole('button', { name: /add to cart/i }).click()
    await page.goto('/products/test-product-2')
    await page.getByRole('button', { name: /add to cart/i }).click()
    
    await page.goto('/cart')
    await expect(page.getByText('Items (2)')).toBeVisible()
    
    await page.getByRole('button', { name: 'Clear cart' }).click()
    
    await expect(page.getByText('Your cart is empty.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Checkout' })).toBeDisabled()
  })

  test('should handle saved for later items', async ({ page }) => {
    await page.goto('/products/test-product-1')
    await page.getByRole('button', { name: /add to cart/i }).click()
    
    await page.goto('/cart')
    
    await page.getByRole('button', { name: /save for later/i }).click()
    
    await expect(page.getByText('Saved for later')).toBeVisible()
    await expect(page.getByText('Test Product 1')).toBeVisible()
    
    await page.getByRole('button', { name: 'Move to cart' }).click()
    await expect(page.getByText('Items (1)')).toBeVisible()
  })

  test('should persist cart between sessions', async ({ page }) => {
    await page.goto('/products/test-product-1')
    await page.getByRole('button', { name: /add to cart/i }).click()
    
    await page.goto('/cart')
    await expect(page.getByText('Items (1)')).toBeVisible()
    
    await page.reload()
    await expect(page.getByText('Items (1)')).toBeVisible()
    
    await page.goto('/')
    await page.goto('/cart')
    await expect(page.getByText('Items (1)')).toBeVisible()
  })

  test('should handle checkout process', async ({ page }) => {
    await page.goto('/products/test-product-1')
    await page.getByRole('button', { name: /add to cart/i }).click()
    
    await page.goto('/cart')
    await page.getByRole('button', { name: 'Checkout' }).click()
    
    await expect(page).toHaveURL(/.*checkout.*/)
    await expect(page.getByText(/shipping|payment/i)).toBeVisible()
  })
})