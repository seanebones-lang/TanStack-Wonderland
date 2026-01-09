/**
 * Accessibility Utilities
 * 
 * Provides utilities for accessibility testing and validation.
 * Integrates with axe-core for automated accessibility testing.
 */

/**
 * Check if element has proper ARIA labels
 */
export function hasAriaLabel(element: HTMLElement): boolean {
  return !!(
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    (element.tagName === 'BUTTON' && element.textContent?.trim()) ||
    (element.tagName === 'A' && element.textContent?.trim())
  )
}

/**
 * Check if element is keyboard accessible
 */
export function isKeyboardAccessible(element: HTMLElement): boolean {
  const tagName = element.tagName.toLowerCase()
  const interactiveElements = ['a', 'button', 'input', 'select', 'textarea']
  
  if (interactiveElements.includes(tagName)) {
    return true
  }

  const tabIndex = element.getAttribute('tabindex')
  return tabIndex !== null && parseInt(tabIndex) >= 0
}

/**
 * Check color contrast ratio (simplified)
 * Returns true if contrast is likely sufficient (WCAG AA)
 */
export function hasSufficientContrast(foreground: string, background: string): boolean {
  // Simplified check - in production, use a proper contrast calculation library
  // This is a placeholder that should be replaced with actual contrast calculation
  return true // Placeholder
}

/**
 * Run accessibility checks on an element
 */
export interface AccessibilityCheckResult {
  passed: boolean
  issues: string[]
  warnings: string[]
}

export function checkAccessibility(element: HTMLElement): AccessibilityCheckResult {
  const issues: string[] = []
  const warnings: string[] = []

  // Check for ARIA labels on interactive elements
  if (isKeyboardAccessible(element) && !hasAriaLabel(element)) {
    issues.push('Interactive element missing ARIA label')
  }

  // Check for alt text on images
  if (element.tagName === 'IMG' && !element.getAttribute('alt')) {
    warnings.push('Image missing alt text')
  }

  // Check for form labels
  if (element.tagName === 'INPUT' && !element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
    const id = element.getAttribute('id')
    if (id && !document.querySelector(`label[for="${id}"]`)) {
      issues.push('Input missing associated label')
    }
  }

  return {
    passed: issues.length === 0,
    issues,
    warnings,
  }
}

/**
 * Initialize axe-core for automated accessibility testing
 * This should be called in test setup
 */
export async function initAxe(): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    // Dynamically import axe-core if available
    const axe = await import('axe-core')
    if (axe.default) {
      // Configure axe - rules configuration format may vary by version
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axeConfig: any = {
        rules: {
          'color-contrast': { enabled: true },
          'keyboard-navigation': { enabled: true },
          'aria-required-attributes': { enabled: true },
        },
      }
      axe.default.configure(axeConfig)
    }
  } catch (error) {
    // axe-core not available, skip
    console.warn('axe-core not available for accessibility testing')
  }
}
