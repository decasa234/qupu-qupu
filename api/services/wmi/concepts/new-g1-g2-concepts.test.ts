import { describe, expect, test } from 'vitest'
import missingAddend, { answer as missingAnswer } from './missing-addend/index.js'
import arrangeDigits, { numbers } from './arrange-digits-to-form-number/index.js'
import visualPattern, { answer as visualAnswer } from './visual-pattern-next/index.js'
import shapeTransform, { answer as transformAnswer } from './shape-transformation-rule/index.js'
import netProgress, { answer as netAnswer } from './net-progress-cycles/index.js'
import ropeWraps, { answer as ropeAnswer } from './rope-wraps-ratio/index.js'
import equivalentFraction, { answer as fractionAnswer } from './equivalent-fraction-fill/index.js'
import tableLookup, { answer as tableAnswer } from './table-lookup-combine/index.js'
import orderClues, { answer as orderAnswer } from './truth-order-clues/index.js'
import groupsLeftover, { answer as leftoverAnswer } from './make-groups-leftover/index.js'

describe('new G1/G2 concepts', () => {
  test('missing-addend answers the hidden addend', () => {
    expect(missingAnswer({ a: 23, b: 19 })).toBe(23)
    expect(missingAddend.render({ a: 23, b: 19 }).answer).toBe('23')
  })

  test('missing-addend renders the unknown as a question mark', () => {
    expect(missingAddend.render({ a: 23, b: 19 }).body_en).toContain('? + 19 = 42')
  })

  test('arrange-digits enumerates two-digit numbers without repeats', () => {
    expect(numbers({ digits: [1, 3, 2], rank: 4 })).toEqual([12, 13, 21, 23, 31, 32])
    expect(arrangeDigits.render({ digits: [1, 3, 2], rank: 4 }).answer).toBe('23')
  })

  test('visual-pattern-next projects the cycle', () => {
    expect(visualAnswer({ cycle: ['circle', 'triangle'], shown: 5 })).toBe('triangle')
    expect(visualPattern.render({ cycle: ['circle', 'triangle'], shown: 5 }).answer).toBe('B')
  })

  test('shape-transformation-rule applies the selected transform', () => {
    expect(transformAnswer({ shape: '▶', transform: 'flip' })).toBe('◀')
    expect(shapeTransform.render({ shape: '▶', transform: 'flip' }).answer).toBe('D')
  })

  test('net-progress-cycles uses net gain per cycle', () => {
    expect(netAnswer({ up: 5, down: 2, cycles: 4 })).toBe(12)
    expect(netProgress.render({ up: 5, down: 2, cycles: 4 }).answer).toBe('12')
  })

  test('rope-wraps-ratio scales inverse wrap counts', () => {
    expect(ropeAnswer({ aWraps: 4, bWraps: 8, bSecond: 16 })).toBe(8)
    expect(ropeWraps.render({ aWraps: 4, bWraps: 8, bSecond: 16 }).answer).toBe('8')
  })

  test('equivalent-fraction-fill scales numerator with denominator', () => {
    expect(fractionAnswer({ num: 3, den: 4, m: 5 })).toBe(15)
    expect(equivalentFraction.render({ num: 3, den: 4, m: 5 }).answer).toBe('15')
  })

  test('table-lookup-combine adds or subtracts table values', () => {
    expect(tableAnswer({ apples: 24, oranges: 9, mode: 'diff' })).toBe(15)
    expect(tableLookup.render({ apples: 24, oranges: 9, mode: 'diff' }).answer).toBe('15')
  })

  test('truth-order-clues returns first in the chain', () => {
    expect(orderAnswer({ order: ['Ben', 'Amy', 'Cody', 'Dina', 'Evan'], clueOrder: [2, 0, 3, 1] })).toBe('Ben')
    expect(orderClues.render({ order: ['Ben', 'Amy', 'Cody', 'Dina', 'Evan'], clueOrder: [2, 0, 3, 1] }).answer).toBe('Ben')
  })

  test('make-groups-leftover returns the remainder', () => {
    expect(leftoverAnswer({ total: 26, groupSize: 6 })).toBe(2)
    expect(groupsLeftover.render({ total: 26, groupSize: 6 }).answer).toBe('2')
  })
})
