import { describe, test, expect } from 'vitest'
import { isShellDowngrade } from './paperFiles.js'

describe('isShellDowngrade', () => {
  test('returns true when incoming is a shell (0) and existing has questions', () => {
    expect(isShellDowngrade(0, 25)).toBe(true)
  })

  test('returns false when incoming is a shell and existing is also a shell (0)', () => {
    expect(isShellDowngrade(0, 0)).toBe(false)
  })

  test('returns false when incoming is a real paper over an existing shell', () => {
    expect(isShellDowngrade(25, 0)).toBe(false)
  })

  test('returns false when both incoming and existing have questions', () => {
    expect(isShellDowngrade(25, 25)).toBe(false)
  })
})
