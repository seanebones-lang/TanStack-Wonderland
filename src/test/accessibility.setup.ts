import { toHaveNoViolations } from 'jest-axe'
import * as matchers from '@testing-library/jest-dom/matchers'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { initAxe } from '../utils/accessibility'

// Extend Vitest matchers
expect.extend(matchers)

// Extend with axe matchers if available
try {
  expect.extend(toHaveNoViolations)
} catch (e) {
  // jest-axe not available, skip
}

// Initialize axe-core
if (typeof window !== 'undefined') {
  initAxe()
}

// Cleanup after each test
afterEach(() => {
  cleanup()
})
