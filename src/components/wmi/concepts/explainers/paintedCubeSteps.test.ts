import { describe, test, expect } from 'vitest'
import {
  buildPaintedCubeSteps,
  isPeelCell,
  paintedClassCount,
  paintedFacesAt,
  pieceCount,
  pieceDims,
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

/** Every (n, k) the generator can emit — n ∈ [3, 5], k ∈ [0, 3] (api paramsSchema). */
const SIZES = [3, 4, 5]
const KS = [0, 1, 2, 3]

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

  test('a class is its pieces times what survives the peel: pieces × m^dims', () => {
    for (const n of SIZES) {
      const m = n - 2
      for (const k of KS) {
        expect(paintedClassCount(n, k)).toBe(pieceCount(k) * m ** pieceDims(k))
      }
    }
  })
})

describe('isPeelCell', () => {
  test('what survives the peel on one piece is exactly m^dims, for every n and k', () => {
    for (const n of SIZES) {
      const m = n - 2
      for (const k of KS) {
        const dims = pieceDims(k)
        const gw = dims >= 1 ? n : 1
        const gh = dims >= 2 ? n : 1
        const subGrids = dims >= 3 ? n : 1
        let kept = 0
        for (let i = 0; i < subGrids; i++) {
          for (let r = 0; r < gh; r++) {
            for (let c = 0; c < gw; c++) {
              if (!isPeelCell(n, dims, i, c, r)) kept += 1
            }
          }
        }
        expect(kept).toBe(m ** dims)
      }
    }
  })

  test('on a cube layer the peeled cells are exactly the painted ones', () => {
    for (const n of SIZES) {
      for (let z = 0; z < n; z++) {
        for (let y = 0; y < n; y++) {
          for (let x = 0; x < n; x++) {
            expect(isPeelCell(n, 3, z, x, y)).toBe(paintedFacesAt(n, x, y, z) > 0)
          }
        }
      }
    }
  })
})

describe('buildPaintedCubeSteps', () => {
  test('answer equals the target class count for every (n, k) the generator can emit', () => {
    for (const n of SIZES) {
      for (const k of KS) {
        const sb = buildPaintedCubeSteps(n, k, 'en')
        expect(sb.answer).toBe(bruteCount(n, k))
        expect(sb.groups).toBe(pieceCount(k))
        expect(sb.dims).toBe(pieceDims(k))
        expect(sb.m).toBe(n - 2)
        expect(sb.total).toBe(n ** 3)
      }
    }
  })

  test('4 to 6 beats, ending on the only result beat', () => {
    for (const n of SIZES) {
      for (const k of KS) {
        for (const lang of ['en', 'id'] as const) {
          const sb = buildPaintedCubeSteps(n, k, lang)
          expect(sb.steps.length).toBeGreaterThanOrEqual(4)
          expect(sb.steps.length).toBeLessThanOrEqual(6)
          expect(sb.finalIndex).toBe(sb.steps.length - 1)
          expect(sb.steps.filter((s) => s.result)).toHaveLength(1)
          expect(sb.steps[sb.finalIndex].result).toBe(true)
          expect(sb.steps[sb.finalIndex].caption).toContain(String(sb.answer))
        }
      }
    }
  })

  test('every beat is about the asked class or the cube it came out of', () => {
    for (const n of SIZES) {
      for (const k of KS) {
        const sb = buildPaintedCubeSteps(n, k, 'id')
        const kinds = sb.steps.map((s) => s.kind)
        expect(kinds[0]).toBe('intro')
        expect(kinds[1]).toBe('cut')
        expect(kinds[2]).toBe('locate')
        expect(kinds[kinds.length - 1]).toBe('answer')
        // No beat counts a class the question did not ask about.
        expect(kinds.filter((kind) => kind === 'answer')).toHaveLength(1)
        // From the locate beat on, the board only ever shows the asked class's own pieces.
        for (const step of sb.steps.slice(3)) {
          expect(step.groups).toBe(sb.groups)
          expect(step.dims).toBe(sb.dims)
        }
      }
    }
  })

  test('the board opens the cube up before the asked class is pointed at', () => {
    for (const n of SIZES) {
      for (const k of KS) {
        const sb = buildPaintedCubeSteps(n, k, 'id')
        expect(sb.steps[0].view).toBe('solid')
        expect(sb.steps[0].lit).toBe(false)
        expect(sb.steps[1].kind).toBe('cut')
        expect(sb.steps[1].view).toBe('pieces')
        expect(sb.steps[1].dims).toBe(3)
        expect(sb.steps[1].lit).toBe(false)
        // Classes that live on the skin are pointed at on the assembled cube;
        // the hidden class is pointed at inside the opened layers.
        expect(sb.steps[2].view).toBe(k === 0 ? 'pieces' : 'solid')
        expect(sb.steps[2].lit).toBe(true)
      }
    }
  })

  test('n − 2 is peeled, never asserted: the pieces are seen whole before the peel', () => {
    for (const n of SIZES) {
      for (const k of [0, 1, 2]) {
        const sb = buildPaintedCubeSteps(n, k, 'id')
        const peelAt = sb.steps.findIndex((s) => s.kind === 'peel')
        expect(peelAt).toBeGreaterThan(1)
        // The same board, intact, is on screen on the beat before the peel.
        const before = sb.steps[peelAt - 1]
        expect(before.view).toBe('pieces')
        expect(before.groups).toBe(sb.groups)
        expect(before.dims).toBe(sb.dims)
        expect(before.peel).toBe(0)
        expect(sb.steps[peelAt].peel).toBe(1)
        expect(sb.steps[sb.finalIndex].peel).toBe(2)
        // And the arithmetic that earns it is on the peel beat itself.
        expect(sb.steps[peelAt].derivation).toBe(`${n} − 2 = ${n - 2}`)
      }
    }
  })

  test('corners need no peel — they are earned as 4 on top plus 4 underneath', () => {
    for (const n of SIZES) {
      const sb = buildPaintedCubeSteps(n, 3, 'id')
      expect(sb.steps.some((s) => s.kind === 'peel')).toBe(false)
      const gather = sb.steps.find((s) => s.kind === 'gather')
      expect(gather).toBeDefined()
      expect(gather?.litPieces).toBe(4)
      expect(gather?.peel).toBe(0)
      expect(sb.steps[sb.finalIndex].litPieces).toBe(8)
      expect(sb.steps[sb.finalIndex].derivation).toBe('4 + 4 = 8')
      expect(sb.answer).toBe(8)
    }
  })

  test('the derivation line only ever states what the board has already shown', () => {
    for (const n of SIZES) {
      for (const k of KS) {
        const sb = buildPaintedCubeSteps(n, k, 'en')
        // Nothing arithmetic until the peel / gather beat.
        expect(sb.steps[0].derivation).toBeNull()
        expect(sb.steps[1].derivation).toBeNull()
        expect(sb.steps[2].derivation).toBeNull()
        expect(sb.steps[sb.finalIndex].derivation).toBe(`${sb.formula} = ${sb.answer}`)
      }
    }
  })

  test('no beat before the last states the answer', () => {
    for (const n of SIZES) {
      for (const k of KS) {
        for (const lang of ['en', 'id'] as const) {
          const sb = buildPaintedCubeSteps(n, k, lang)
          const finalCaption = sb.steps[sb.finalIndex].caption
          for (let i = 0; i < sb.finalIndex; i++) {
            expect(sb.steps[i].caption).not.toBe(finalCaption)
          }
          // When no other quantity on screen happens to equal the answer, the
          // numeral itself must not appear anywhere before the final beat.
          const alsoOnScreen = [n, sb.m, sb.total, sb.groups, 2, 3, 4]
          if (!alsoOnScreen.includes(sb.answer)) {
            for (let i = 0; i < sb.finalIndex; i++) {
              expect(sb.steps[i].caption).not.toContain(String(sb.answer))
              expect(sb.steps[i].derivation ?? '').not.toContain(String(sb.answer))
            }
          }
        }
      }
    }
  })

  test('every arithmetic claim in a caption is true', () => {
    for (const n of SIZES) {
      for (const k of KS) {
        for (const lang of ['en', 'id'] as const) {
          const sb = buildPaintedCubeSteps(n, k, lang)
          const text = sb.steps
            .map((s) => `${s.caption} ${s.derivation ?? ''}`)
            .join(' ')
            // "6 faces × 2 × 2 = 24" states 6 × 2 × 2; drop the unit nouns so the
            // whole claim is one expression.
            .replace(/\b(faces?|edges?|corners?|cubes?|sisi|rusuk|sudut|kubus)\b/g, '')
          // Check each "a − b = c" / "a × b = c" / "a + b = c" claim that appears.
          const claims = text.match(/\d+(?:\s*[−×+]\s*\d+)+\s*=\s*\d+/g) ?? []
          expect(claims.length).toBeGreaterThan(0)
          for (const claim of claims) {
            const [lhs, rhs] = claim.split('=')
            const parts = lhs.split(/[−×+]/).map((v) => Number(v.trim()))
            const op = lhs.includes('−') ? '−' : lhs.includes('×') ? '×' : '+'
            const value =
              op === '×'
                ? parts.reduce((a, b) => a * b, 1)
                : op === '+'
                  ? parts.reduce((a, b) => a + b, 0)
                  : parts.reduce((a, b) => a - b)
            expect(value).toBe(Number(rhs.trim()))
          }
        }
      }
    }
  })

  test('language switch: id and en captions differ but share the same numbers', () => {
    const en = buildPaintedCubeSteps(4, 1, 'en')
    const id = buildPaintedCubeSteps(4, 1, 'id')
    expect(id.steps[0].caption).toContain('dicat')
    expect(en.steps[0].caption).toContain('paint')
    expect(id.label).toBe('Tengah sisi')
    expect(en.label).toBe('Face centre')
    expect(id.answer).toBe(en.answer)
    expect(id.formula).toBe(en.formula)
    expect(id.steps.length).toBe(en.steps.length)
    expect(id.steps.map((s) => s.kind)).toEqual(en.steps.map((s) => s.kind))
  })

  test('holds: every beat but the last waits, the last holds indefinitely', () => {
    for (const n of SIZES) {
      for (const k of KS) {
        const sb = buildPaintedCubeSteps(n, k, 'id')
        expect(sb.steps[sb.finalIndex].hold).toBe(0)
        expect(sb.steps.slice(0, sb.finalIndex).every((s) => s.hold > 1000)).toBe(true)
        // The whole play-through stays under 15 seconds.
        const runtime = sb.steps.reduce((s, step) => s + step.hold, 0)
        expect(runtime).toBeLessThan(15000)
      }
    }
  })

  test('junk params fall back to a valid 3×3×3 storyboard instead of NaN', () => {
    const sb = buildPaintedCubeSteps(undefined, 'x', 'id')
    expect(sb.n).toBe(3)
    expect(sb.k).toBe(1)
    expect(sb.answer).toBe(6)
    expect(JSON.stringify(sb)).not.toContain('NaN')
    expect(JSON.stringify(sb)).not.toContain('undefined')
  })

  test('out-of-range params are clamped, never crashing the storyboard', () => {
    const low = buildPaintedCubeSteps(1, -4, 'en')
    expect(low.n).toBe(3)
    expect(low.k).toBe(0)
    expect(low.answer).toBe(1)
    const high = buildPaintedCubeSteps(99, 9, 'en')
    expect(high.n).toBe(8)
    expect(high.k).toBe(3)
    expect(high.answer).toBe(8)
  })

  test('n = 3 reads sensibly: one cube left, not a strip', () => {
    const inside = buildPaintedCubeSteps(3, 0, 'id')
    expect(inside.answer).toBe(1)
    expect(inside.steps[inside.finalIndex].caption).toBe('Tinggal 1 kubus di tengah yang tanpa cat.')
    const edge = buildPaintedCubeSteps(3, 2, 'id')
    expect(edge.answer).toBe(12)
    expect(edge.steps[edge.finalIndex].caption).toBe('12 rusuk × 1 = 12 kubus kena cat 2 sisi.')
    const face = buildPaintedCubeSteps(3, 1, 'en')
    expect(face.steps[face.finalIndex].caption).toBe('6 faces × 1 = 6 cubes have 1 painted side.')
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
