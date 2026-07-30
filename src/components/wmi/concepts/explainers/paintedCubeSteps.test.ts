import { describe, test, expect } from 'vitest'
import {
  buildPaintedCubeSteps,
  paintedClassCount,
  paintedFacesAt,
  PAINTED_CLASS_FACES,
} from './paintedCubeSteps'

/** Independent brute-force count: walk every unit cube of the n-cube. */
function bruteCount(n: number, faces: number): number {
  let total = 0
  for (let z = 0; z < n; z++) {
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (paintedFacesAt(n, x, y, z) === faces) total += 1
      }
    }
  }
  return total
}

const SIZES = [3, 4, 5]

describe('paintedClassCount', () => {
  test('matches a brute-force walk of every unit cube, for every n and class', () => {
    for (const n of SIZES) {
      for (const faces of PAINTED_CLASS_FACES) {
        expect(paintedClassCount(n, faces)).toBe(bruteCount(n, faces))
      }
    }
  })

  test('corners are always 8; the four classes add up to n cubed', () => {
    for (const n of SIZES) {
      expect(paintedClassCount(n, 3)).toBe(8)
      const sum = PAINTED_CLASS_FACES.reduce((s, f) => s + paintedClassCount(n, f), 0)
      expect(sum).toBe(n ** 3)
    }
  })
})

describe('buildPaintedCubeSteps', () => {
  test('classes are walked corners → edges → face centres → interior, counts derived from n', () => {
    const sb = buildPaintedCubeSteps(4, 2, 'id')
    expect(sb.classes.map((c) => c.faces)).toEqual([3, 2, 1, 0])
    expect(sb.classes.map((c) => c.count)).toEqual([8, 24, 24, 8])
    expect(sb.total).toBe(64)
    const classBeats = sb.steps.filter((s) => s.kind === 'class')
    expect(classBeats.map((s) => s.activeIndex)).toEqual([0, 1, 2, 3])
  })

  test('answer equals the target class count for every (n, k) the generator can emit', () => {
    for (const n of SIZES) {
      for (const k of [0, 1, 2, 3]) {
        const sb = buildPaintedCubeSteps(n, k, 'en')
        expect(sb.answer).toBe(bruteCount(n, k))
        expect(sb.classes[sb.targetIndex].faces).toBe(k)
        expect(sb.classes[sb.targetIndex].count).toBe(sb.answer)
      }
    }
  })

  test('storyboard always has more than three beats and ends on the only result beat', () => {
    for (const n of SIZES) {
      for (const k of [0, 1, 2, 3]) {
        const sb = buildPaintedCubeSteps(n, k, 'id')
        expect(sb.steps.length).toBeGreaterThanOrEqual(3)
        expect(sb.finalIndex).toBe(sb.steps.length - 1)
        expect(sb.steps.filter((s) => s.result)).toHaveLength(1)
        expect(sb.steps[sb.finalIndex].result).toBe(true)
        expect(sb.steps[sb.finalIndex].caption).toContain(String(sb.answer))
      }
    }
  })

  test('the target class count is withheld until the last beat', () => {
    for (const n of SIZES) {
      for (const k of [0, 1, 2, 3]) {
        const sb = buildPaintedCubeSteps(n, k, 'id')
        for (let i = 0; i < sb.finalIndex; i++) {
          expect(sb.steps[i].counts[sb.targetIndex]).toBeNull()
        }
        expect(sb.steps[sb.finalIndex].counts[sb.targetIndex]).toBe(sb.answer)
      }
    }
  })

  test('non-target class counts are revealed exactly on their own beat and stay revealed', () => {
    const sb = buildPaintedCubeSteps(5, 1, 'en')
    const firstClassBeat = sb.steps.findIndex((s) => s.kind === 'class')
    sb.classes.forEach((cls, j) => {
      if (j === sb.targetIndex) return
      const own = firstClassBeat + j
      expect(sb.steps[own - 1].counts[j]).toBeNull()
      for (let i = own; i <= sb.finalIndex; i++) {
        expect(sb.steps[i].counts[j]).toBe(cls.count)
      }
    })
  })

  test('no beat before the last states the answer sentence', () => {
    for (const n of SIZES) {
      for (const k of [0, 1, 2, 3]) {
        for (const lang of ['en', 'id'] as const) {
          const sb = buildPaintedCubeSteps(n, k, lang)
          const finalCaption = sb.steps[sb.finalIndex].caption
          for (let i = 0; i < sb.finalIndex; i++) {
            expect(sb.steps[i].caption).not.toBe(finalCaption)
          }
          // When no other quantity on screen happens to equal the answer, the
          // numeral itself must not appear anywhere before the final beat.
          const others = sb.classes.filter((_, j) => j !== sb.targetIndex).map((c) => c.count)
          const alsoOnScreen = [...others, n, n - 2, n ** 3, 6, 8, 12]
          const collides = alsoOnScreen.includes(sb.answer)
          if (!collides) {
            for (let i = 0; i < sb.finalIndex; i++) {
              expect(sb.steps[i].caption).not.toContain(String(sb.answer))
            }
          }
        }
      }
    }
  })

  test('the board slices the cube open before any class is counted', () => {
    const sb = buildPaintedCubeSteps(5, 0, 'id')
    expect(sb.steps[0].mode).toBe('solid')
    expect(sb.steps[0].walked.every((w) => !w)).toBe(true)
    expect(sb.steps[1].kind).toBe('cut')
    expect(sb.steps[1].mode).toBe('layers')
    expect(sb.steps[1].activeIndex).toBe(-1)
    expect(sb.steps.slice(2).every((s) => s.mode === 'layers')).toBe(true)
  })

  test('the check line adds the four class counts to n cubed', () => {
    for (const n of SIZES) {
      const sb = buildPaintedCubeSteps(n, 3, 'id')
      expect(sb.checkText).toBe(`${sb.classes.map((c) => c.count).join(' + ')} = ${sb.total}`)
      const sum = sb.classes.reduce((s, c) => s + c.count, 0)
      expect(sum).toBe(n ** 3)
    }
  })

  test('language switch: id and en captions differ but share the same numbers', () => {
    const en = buildPaintedCubeSteps(4, 1, 'en')
    const id = buildPaintedCubeSteps(4, 1, 'id')
    expect(id.steps[0].caption).toContain('dicat')
    expect(en.steps[0].caption).toContain('paint')
    expect(id.classes.map((c) => c.label)).toEqual(['Sudut', 'Rusuk', 'Tengah sisi', 'Dalam'])
    expect(en.classes.map((c) => c.label)).toEqual(['Corner', 'Edge', 'Face centre', 'Inside'])
    expect(id.answer).toBe(en.answer)
    expect(id.steps.length).toBe(en.steps.length)
  })

  test('holds: every beat but the last waits, the last holds indefinitely', () => {
    const sb = buildPaintedCubeSteps(3, 2, 'id')
    expect(sb.steps[sb.finalIndex].hold).toBe(0)
    expect(sb.steps.slice(0, sb.finalIndex).every((s) => s.hold > 1000)).toBe(true)
  })

  test('junk params fall back to a valid 3×3×3 storyboard instead of NaN', () => {
    const sb = buildPaintedCubeSteps(undefined, 'x', 'id')
    expect(sb.n).toBe(3)
    expect(sb.k).toBe(1)
    expect(sb.answer).toBe(6)
    expect(JSON.stringify(sb)).not.toContain('NaN')
    expect(JSON.stringify(sb)).not.toContain('undefined')
  })

  test('out-of-range params are clamped, never crashing the target lookup', () => {
    const low = buildPaintedCubeSteps(1, -4, 'en')
    expect(low.n).toBe(3)
    expect(low.k).toBe(0)
    expect(low.targetIndex).toBeGreaterThanOrEqual(0)
    const high = buildPaintedCubeSteps(99, 9, 'en')
    expect(high.n).toBe(8)
    expect(high.k).toBe(3)
    expect(high.answer).toBe(8)
  })
})

describe('paintedFacesAt', () => {
  test('a corner sees 3 painted faces, the deepest cube sees none', () => {
    expect(paintedFacesAt(5, 0, 0, 0)).toBe(3)
    expect(paintedFacesAt(5, 4, 4, 4)).toBe(3)
    expect(paintedFacesAt(5, 2, 2, 2)).toBe(0)
    expect(paintedFacesAt(5, 2, 0, 0)).toBe(2)
    expect(paintedFacesAt(5, 2, 2, 0)).toBe(1)
  })
})
