import { describe, test, expect } from 'vitest'
import concept, {
  closedForm,
  figureCells,
  SHAPES,
  solve,
} from '../../../../../api/services/wmi/concepts/growing-figure-nth-term/index.js'
import { mulberry32 } from '../../../../../api/services/wmi/concepts/rng.js'
import {
  buildGrowingFigureNthTermSteps,
  growingCount,
  growingFigureCells,
  layoutPictures,
  pickCellSize,
} from './growingFigureNthTermSteps'

const SEEDS = 320

// The frontend keeps its own copy of the figure so the client bundle does not
// have to import the concept (and zod with it). A copy is only safe while it is
// held against the original — that is what this file is for. A drawing that
// disagrees with the answer is the exact defect this concept exists to make
// impossible, so it must be impossible on BOTH sides of the wire.
describe('growingFigureNthTermSteps', () => {
  test('the frontend figure is cell-for-cell the backend figure', () => {
    for (const shape of SHAPES) {
      const heights = shape === 'bar-rows' ? [2, 3] : [1]
      for (const height of heights) {
        for (let n = 1; n <= 20; n++) {
          const where = `${shape} h=${height} n=${n}`
          expect(growingFigureCells(shape, height, n), where).toEqual(
            figureCells(shape, height, n),
          )
          expect(growingCount(shape, height, n), where).toBe(closedForm(shape, height, n))
        }
      }
    }
  })

  test(`${SEEDS} seeds: the storyboard lands on the concept's own answer`, () => {
    for (const lang of ['en', 'id'] as const) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const p = concept.generate(mulberry32(seed))
        const where = `${lang} seed ${seed} (${JSON.stringify(p)})`
        const s = solve(p)
        const story = buildGrowingFigureNthTermSteps(p, lang)

        expect(story.answer, where).toBe(s.answer)
        expect(story.pictures.length, where).toBe(p.shownCount)
        story.pictures.forEach((cells, i) => {
          expect(cells.length, `${where}: picture ${i + 1}`).toBe(s.shown[i])
        })
        expect(story.steps[story.finalIndex].reveal, where).toBe(s.answer)
        expect(story.steps[story.finalIndex].slot, where).toBe(s.answer)
        // The wrong road the animation draws is the wrong road the concept names.
        expect(story.steps[story.finalIndex].trapNumber, where).toBe(s.trap)
        // The answer never appears before the last beat.
        for (let i = 0; i < story.finalIndex; i++) {
          expect(story.steps[i].reveal, `${where}: beat ${i} leaks the answer`).toBeNull()
          expect(story.steps[i].slot, `${where}: beat ${i} fills the slot`).not.toBe(s.answer)
        }

        const prose = story.steps.map((b) => b.caption).join(' | ')
        expect(prose, where).not.toMatch(/undefined|NaN|\[object|null/)

        // Every picture keeps its place for the whole play-through.
        const cell = pickCellSize(story.pictures, 230, 18, 2)
        const strip = layoutPictures(story.pictures, cell, 18, 2)
        expect(strip.boxes.length, where).toBe(p.shownCount)
        expect(cell, where).toBeGreaterThanOrEqual(6)
        expect(strip.width, where).toBeGreaterThan(0)
        for (let i = 1; i < strip.boxes.length; i++) {
          expect(strip.boxes[i].x, where).toBeGreaterThan(strip.boxes[i - 1].x)
          // Sitting on one baseline is what makes the growth readable.
          expect(strip.boxes[i].y + strip.boxes[i].h, where).toBe(
            strip.boxes[i - 1].y + strip.boxes[i - 1].h,
          )
        }
      }
    }
  })

  test('unreadable params fall back whole rather than in pieces', () => {
    const story = buildGrowingFigureNthTermSteps({ shape: 'not-a-shape' }, 'id')
    expect(story.shape).toBe('staircase')
    expect(story.pictures.map((c) => c.length)).toEqual([1, 3, 6, 10])
    expect(story.answer).toBe('55')
    expect(story.steps.every((b) => b.caption.length > 0)).toBe(true)
  })
})
