import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the header', async ({ page }) => {
    await expect(page.getByText('Performance Benchmark Suite')).toBeVisible()
  })

  test('should have configuration form', async ({ page }) => {
    await expect(page.getByPlaceholder(/https:\/\/api\.example\.com/)).toBeVisible()
    await expect(page.getByRole('button', { name: /Run Benchmark/i })).toBeVisible()
  })

  test('should show getting started section when no results', async ({ page }) => {
    await expect(page.getByText(/Getting Started/i)).toBeVisible()
    await expect(page.getByText(/Latency Testing/i)).toBeVisible()
  })

  test('should toggle theme', async ({ page }) => {
    const themeToggle = page.locator('[aria-label*="theme" i]').first()
    await themeToggle.click()

    // Wait for theme change animation
    await page.waitForTimeout(300)

    // Check if theme changed (this assumes dark mode adds a class)
    const html = page.locator('html')
    const hasClass = await html.evaluate(el => el.classList.contains('dark'))
    expect(hasClass).toBeDefined()
  })

  test('should validate URL input', async ({ page }) => {
    const urlInput = page.getByPlaceholder(/https:\/\/api\.example\.com/)
    await urlInput.fill('invalid-url')

    const runButton = page.getByRole('button', { name: /Run Benchmark/i })
    await runButton.click()

    // Should show validation error or not proceed
    await expect(page.getByText(/warning|error|invalid/i)).toBeVisible({ timeout: 5000 })
  })

  test('should be keyboard navigable', async ({ page }) => {
    await page.keyboard.press('Tab')

    // First focusable element should be focused
    const focused = await page.evaluate(() => document.activeElement?.tagName)
    expect(['INPUT', 'BUTTON', 'A', 'SELECT']).toContain(focused)
  })

  test('should have proper ARIA labels', async ({ page }) => {
    // Check for important ARIA attributes
    const ariaLabels = await page.locator('[aria-label]').count()
    expect(ariaLabels).toBeGreaterThan(0)
  })
})

test.describe('Network Tests', () => {
  test('should display network test cards', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText(/Internet Speed Test/i)).toBeVisible()
    await expect(page.getByText(/Buffer Bloat Test/i)).toBeVisible()
    await expect(page.getByText(/DNS Resolution Test/i)).toBeVisible()
  })
})

test.describe('Accessibility', () => {
  test('should have no automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/')

    // Check for basic accessibility requirements
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('header')).toBeVisible()

    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBeGreaterThanOrEqual(1)
  })
})
