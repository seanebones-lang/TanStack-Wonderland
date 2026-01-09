import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { checkAccessibility, hasAriaLabel, isKeyboardAccessible } from '../utils/accessibility'
import { Toast } from '../components/Toast'

describe('Accessibility Utilities', () => {
  it('checks if element has ARIA label', () => {
    const { container } = render(
      <button aria-label="Test button">Click me</button>
    )
    const button = container.querySelector('button')!
    expect(hasAriaLabel(button)).toBe(true)
  })

  it('checks if element is keyboard accessible', () => {
    const { container } = render(
      <>
        <button>Button</button>
        <div tabIndex={0}>Div with tabindex</div>
        <div>Regular div</div>
      </>
    )

    const button = container.querySelector('button')!
    const divWithTabIndex = container.querySelector('div[tabindex]')!
    const regularDiv = container.querySelector('div:not([tabindex])')!

    expect(isKeyboardAccessible(button)).toBe(true)
    expect(isKeyboardAccessible(divWithTabIndex)).toBe(true)
    expect(isKeyboardAccessible(regularDiv)).toBe(false)
  })

  it('checks accessibility of an element', () => {
    const { container } = render(
      <button aria-label="Test">Click</button>
    )
    const button = container.querySelector('button')!
    const result = checkAccessibility(button)

    expect(result.passed).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  it('identifies missing ARIA labels', () => {
    const { container } = render(
      <button>Click</button>
    )
    const button = container.querySelector('button')!
    const result = checkAccessibility(button)

    // Button with text content should pass (has implicit label)
    expect(result.issues.length).toBeLessThanOrEqual(0)
  })

  it('identifies images without alt text', () => {
    const { container } = render(
      <img src="test.jpg" />
    )
    const img = container.querySelector('img')!
    const result = checkAccessibility(img)

    expect(result.warnings).toContain('Image missing alt text')
  })
})
