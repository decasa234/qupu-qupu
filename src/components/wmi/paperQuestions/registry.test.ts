import { describe, test, expect } from 'vitest'
import { getQuestionIllustration, getQuestionExplainer } from './registry'

describe('paper question visual registry', () => {
  test('returns star components for WMI-19F1A-Q1', () => {
    expect(getQuestionIllustration('WMI-19F1A-Q1')).toBeTruthy()
    expect(getQuestionExplainer('WMI-19F1A-Q1')).toBeTruthy()
  })
  test('returns null for unknown or missing codes', () => {
    expect(getQuestionIllustration('WMI-19F1A-Q2')).toBeNull()
    expect(getQuestionExplainer(undefined)).toBeNull()
  })
})
