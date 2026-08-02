import { describe, test, expect } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { mulberry32 } from '../rng.js'
import concept, {
  ASKS,
  CHOICE_LABELS,
  MAX_HEIGHT,
  VIEWS,
  columnHeights,
  distractorFlats,
  flatKey,
  isReadable,
  projectVoxels,
  solidVoxels,
  solve,
  viewFrame,
  type Flat,
  type Params,
  type View,
} from './index.js'
import Illustration, {
  coerceViewsParams,
  flatKey as flatKeyUi,
  optionFlats as optionFlatsUi,
  projectVoxels as projectVoxelsUi,
  solidVoxels as solidVoxelsUi,
  viewFrame as viewFrameUi,
} from '../../../../../src/components/wmi/concepts/views-of-solid/index.js'
import Explainer from '../../../../../src/components/wmi/concepts/explainers/ViewsOfSolidExplainer.js'
import { buildViewsOfSolidSteps } from '../../../../../src/components/wmi/concepts/explainers/viewsOfSolidSteps.js'

const SEEDS = 320

// ---------------------------------------------------------------------------
// Independent oracles — written from the WORDING of the problem, by a different
// route than the concept takes. The concept scatters voxels and stamps them into
// a frame; the oracle below reasons about columns ("what you see is the tallest
// stack lined up behind that spot"), so an axis flip or an off-by-one in the
// generator cannot be mirrored here by accident.
// ---------------------------------------------------------------------------

const at = (p: Params, x: number, y: number): number => p.heights[y * p.width + x]
const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i)

/** The picture you see standing in front of / to the right of the pile. */
function oracleSilhouette(p: Params, view: 'front' | 'side'): string {
  const cols =
    view === 'front'
      ? range(p.width).map((x) => Math.max(...range(p.depth).map((y) => at(p, x, y))))
      : range(p.depth).map((y) => Math.max(...range(p.width).map((x) => at(p, x, y))))
  const rows = Math.max(1, Math.max(...p.heights))
  const grid = range(rows).map(() => range(cols.length).map(() => '.'))
  cols.forEach((h, c) => {
    for (let z = 0; z < h; z++) grid[rows - 1 - z][c] = '#'
  })
  return grid.map((r) => r.join('')).join('/')
}

/** The picture you see looking straight down; the front row is the bottom row. */
function oracleTop(p: Params): string {
  const grid = range(p.depth).map(() => range(p.width).map(() => '.'))
  for (let y = 0; y < p.depth; y++) {
    for (let x = 0; x < p.width; x++) if (at(p, x, y) > 0) grid[p.depth - 1 - y][x] = '#'
  }
  return grid.map((r) => r.join('')).join('/')
}

function oracleView(p: Params, view: View): string {
  return view === 'top' ? oracleTop(p) : oracleSilhouette(p, view)
}

/** Same shape as the oracle strings, so the two can be compared directly. */
function asString(flat: Flat): string {
  const out: string[] = []
  for (let r = 0; r < flat.rows; r++) {
    let line = ''
    for (let c = 0; c < flat.cols; c++) line += flat.cells[r * flat.cols + c] ? '#' : '.'
    out.push(line)
  }
  return out.join('/')
}

/**
 * Occlusion, from the drawing's own geometry: in this isometric projection the
 * cube one step nearer the viewer, (x+1, y−1, z+1), lands on exactly the same
 * hexagon. Every stack top and every empty floor square must be free of that
 * cover, or the child is asked to read a stack they cannot see.
 */
function everythingVisible(p: Params): boolean {
  const filled = new Set<string>()
  for (let y = 0; y < p.depth; y++) {
    for (let x = 0; x < p.width; x++) {
      for (let z = 0; z < at(p, x, y); z++) filled.add(`${x},${y},${z}`)
    }
  }
  const coveredAt = (x: number, y: number, z: number) => filled.has(`${x + 1},${y - 1},${z + 1}`)
  for (let y = 0; y < p.depth; y++) {
    for (let x = 0; x < p.width; x++) {
      const h = at(p, x, y)
      if (coveredAt(x, y, Math.max(0, h - 1))) return false
    }
  }
  return true
}

/** Mirrors src/lib/wmiBreakdown stripSectionLabels for the two labels we emit. */
function stripLabels(text: string): string {
  return text.replace(/\b(Find|Cari):\s*/g, '').replace(/\s{2,}/g, ' ').trim()
}

function expectNoOverlap(text: string, phrases: string[], where: string): void {
  const spans = phrases.map((phrase) => {
    const start = text.indexOf(phrase)
    return { phrase, start, end: start + phrase.length }
  })
  spans.sort((a, b) => a.start - b.start)
  for (let i = 1; i < spans.length; i++) {
    expect(
      spans[i].start >= spans[i - 1].end,
      `${where}: "${spans[i - 1].phrase}" overlaps "${spans[i].phrase}"`,
    ).toBe(true)
  }
}

describe('views-of-solid', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(11))).toEqual(concept.generate(mulberry32(11)))
  })

  test('hand-checked pile: the three views of one solid', () => {
    // front row 2, 1, 3 · back row 1, 3, 1 — the generator's fallback pile.
    const p: Params = {
      width: 3,
      depth: 2,
      heights: [2, 1, 3, 1, 3, 1],
      ask: 'which-view',
      view: 'front',
      layer: 2,
      answerSlot: 1,
    }
    // Front: columns are max(2,1), max(1,3), max(3,1) = 2, 3, 3.
    expect(oracleView(p, 'front')).toBe('.##/###/###')
    expect(asString(solve(p).truth)).toBe(oracleView(p, 'front'))
    // Right side: rows are max(2,1,3) = 3 (front) and max(1,3,1) = 3 (back).
    expect(oracleView({ ...p, view: 'side' }, 'side')).toBe('##/##/##')
    // Top: every one of the 6 floor squares carries a stack.
    expect(oracleView({ ...p, view: 'top' }, 'top')).toBe('###/###')
    // 11 cubes; layer 2 is held by the three stacks that are 2 or taller.
    const s = solve(p)
    expect(s.total).toBe(11)
    expect(s.layerCount).toBe(3)
    expect(s.exactLayerCount).toBe(1)
    expect(everythingVisible(p)).toBe(true)
    expect(concept.paramsSchema.safeParse(p).success).toBe(true)
  })

  test(`${SEEDS} seeds: views are re-projections, options are unique, prose is clean`, () => {
    const seenAsk = new Set<string>()
    const seenView = new Set<string>()

    for (let seed = 1; seed <= SEEDS; seed++) {
      const p = concept.generate(mulberry32(seed))
      const where = `seed ${seed} (${JSON.stringify(p)})`
      expect(() => concept.paramsSchema.parse(p), where).not.toThrow()
      seenAsk.add(p.ask)
      if (p.ask === 'which-view') seenView.add(p.view)

      const s = solve(p)

      // ── the pile itself ────────────────────────────────────────────────────
      expect(p.heights.length, where).toBe(p.width * p.depth)
      expect(s.total, where).toBeGreaterThanOrEqual(5)
      expect(s.total, where).toBeLessThanOrEqual(12)
      expect(s.cubes.length, where).toBe(s.total) // hidden cubes counted too
      expect(Math.max(...p.heights), where).toBeLessThanOrEqual(MAX_HEIGHT)
      expect(s.maxHeight, where).toBe(Math.max(...p.heights))
      expect(s.rowTotals.reduce((a, b) => a + b, 0), where).toBe(s.total)
      expect(s.stacks.length, where).toBe(p.heights.filter((h) => h > 0).length)
      // every stack top and every gap is drawable
      expect(isReadable(p), where).toBe(true)
      expect(everythingVisible(p), where).toBe(true)

      // ── the view really is a re-projection of the voxels ───────────────────
      for (const view of VIEWS) {
        const frame = viewFrame(p, view)
        const flat = projectVoxels(solidVoxels(p), view, frame)
        expect(asString(flat), `${where} view=${view}`).toBe(oracleView(p, view))
        // and the frontend mirror lands on the very same picture
        const uiFlat = projectVoxelsUi(solidVoxelsUi(p), view, viewFrameUi(p, view))
        expect(flatKeyUi(uiFlat), `${where} view=${view} mirror`).toBe(flatKey(flat))
      }
      expect(asString(s.truth), where).toBe(oracleView(p, p.view))

      // ── layer counting ────────────────────────────────────────────────────
      const reaching = p.heights.filter((h) => h >= p.layer).length
      expect(s.layerCount, where).toBe(reaching)
      expect(s.layerStacks.every((st) => st.height >= p.layer), where).toBe(true)
      expect(s.cubes.filter((c) => c.z === p.layer - 1).length, where).toBe(reaching)

      const r = concept.render(p)
      expect(r.answer, where).toBe(s.answer)

      // ── the four pictures ─────────────────────────────────────────────────
      if (p.ask === 'which-view') {
        expect(r.answer_type, where).toBe('multiple_choice')
        expect(r.choices_en?.map((c) => c.label), where).toEqual([...CHOICE_LABELS])
        expect(s.options.length, where).toBe(4)
        const truthKey = flatKey(s.truth)
        const keys = s.options.map(flatKey)
        // exactly one option is the true view …
        expect(keys.filter((k) => k === truthKey).length, where).toBe(1)
        expect(keys[p.answerSlot], where).toBe(truthKey)
        expect(r.answer, where).toBe(CHOICE_LABELS[p.answerSlot])
        // … the other three are genuinely different pictures, and different
        // from one another, on the same grid
        expect(new Set(keys).size, where).toBe(4)
        for (const option of s.options) {
          expect(option.rows, where).toBe(s.truth.rows)
          expect(option.cols, where).toBe(s.truth.cols)
        }
        // every wrong picture is the view of a pile one cube away from the real
        // one — never a hand-drawn shape
        const frame = viewFrame(p, p.view)
        const family = new Set(distractorFlats(p, p.view, frame, s.truth).map(flatKey))
        for (let i = 0; i < 4; i++) {
          if (i === p.answerSlot) continue
          expect(family.has(keys[i]), `${where} option ${CHOICE_LABELS[i]}`).toBe(true)
        }
        // the frontend builds the same four, in the same order
        const uiOptions = optionFlatsUi(p, p.view, p.answerSlot)
        expect(uiOptions, where).not.toBeNull()
        expect(uiOptions!.map(flatKeyUi), where).toEqual(keys)
      } else {
        expect(r.answer_type, where).toBe('fill_in')
        expect(r.choices_en, where).toBeNull()
        expect(r.answer, where).toBe(p.ask === 'cubes-per-layer' ? String(reaching) : String(s.total))
      }

      // ── prose ─────────────────────────────────────────────────────────────
      const bd = r.breakdown!
      const prose = [
        r.body_en,
        r.body_id,
        r.hint_en ?? '',
        r.hint_id ?? '',
        ...(r.hint_steps_en ?? []),
        ...(r.hint_steps_id ?? []),
        ...bd.highlights.flatMap((h) => [h.phrase_en, h.phrase_id, h.note_en, h.note_id]),
        ...bd.quantities.flatMap((q) => [q.label_en, q.label_id, q.value]),
        bd.strategy.name_en,
        bd.strategy.name_id,
        bd.trap?.why_en ?? '',
        bd.trap?.why_id ?? '',
      ].join(' | ')
      expect(prose, where).not.toMatch(/undefined|NaN|\[object|Infinity/)

      expect((r.hint_steps_en ?? []).length, where).toBe((r.hint_steps_id ?? []).length)
      expect((r.hint_steps_en ?? []).length, where).toBeGreaterThanOrEqual(3)
      expect((r.hint_steps_en ?? []).at(-1), where).toContain(s.answer)
      expect((r.hint_steps_id ?? []).at(-1), where).toContain(s.answer)

      // ── breakdown ─────────────────────────────────────────────────────────
      expect(bd.needsVisual, where).toBe(true)
      expect(bd.answer.value, where).toBe(s.answer)
      expect(bd.answer.form, where).toBe(p.ask === 'which-view' ? 'choice' : 'number')
      expect(bd.highlights.length, where).toBeGreaterThanOrEqual(3)
      const display_en = stripLabels(r.body_en)
      const display_id = stripLabels(r.body_id)
      for (const h of bd.highlights) {
        expect(display_en, `${where} phrase_en=${h.phrase_en}`).toContain(h.phrase_en)
        expect(display_id, `${where} phrase_id=${h.phrase_id}`).toContain(h.phrase_id)
      }
      expectNoOverlap(display_en, bd.highlights.map((h) => h.phrase_en), where)
      expectNoOverlap(display_id, bd.highlights.map((h) => h.phrase_id), where)
      if (bd.trap) expect(bd.trap.wrong, where).not.toBe(s.answer)

      // ── the figure draws, in both languages, and gives nothing away ────────
      const html = renderToStaticMarkup(createElement(Illustration, { params: p }))
      expect(html, where).toContain('<svg')
      expect(html, where).not.toMatch(/undefined|NaN/)
      const label = html.match(/aria-label="([^"]*)"/)?.[1]
      expect(label, where).toBeTruthy()
      // The drawing really holds the pile: three faces per cube, including the
      // ones buried inside it, plus one front-marker triangle under each top
      // view. A silently empty or doubled figure fails here.
      const polygons = html.match(/<polygon/g)?.length ?? 0
      const rects = html.match(/<rect/g)?.length ?? 0
      const texts = html.match(/<text/g)?.length ?? 0
      if (p.ask === 'count-blocks') {
        expect(polygons, where).toBe(1) // the front marker only
        expect(rects, where).toBe(p.width * p.depth)
        expect(texts, where).toBe(p.width * p.depth) // one stack height per square
      } else if (p.ask === 'cubes-per-layer') {
        expect(polygons, where).toBe(3 * s.total)
        expect(rects, where).toBe(0)
      } else {
        const grid = s.truth.rows * s.truth.cols
        expect(polygons, where).toBe(3 * s.total + (p.view === 'top' ? 4 : 0))
        expect(rects, where).toBe(4 * grid) // four option grids, same frame
      }
      // Concept illustrations get only `{ params }`; a locale must not change one
      // byte of the drawing.
      expect(
        renderToStaticMarkup(createElement(Illustration, { params: { ...p, lang: 'id' } })),
        where,
      ).toBe(html)
      // The label speaks the pile, never the answer: moving the right picture to
      // another slot (or asking about another layer) leaves it untouched.
      const moved = renderToStaticMarkup(
        createElement(Illustration, {
          params: { ...p, answerSlot: (p.answerSlot + 1) % 4, layer: (p.layer % MAX_HEIGHT) + 1 },
        }),
      )
      expect(moved.match(/aria-label="([^"]*)"/)?.[1], where).toBe(label)
      if (p.ask !== 'which-view') expect(moved, where).toBe(html)

      // ── the storyboard lands where the generator lands ────────────────────
      for (const lang of ['en', 'id'] as const) {
        const story = buildViewsOfSolidSteps(p, lang)
        expect(story.answer, `${where} ${lang}`).toBe(s.answer)
        expect(story.steps.length, `${where} ${lang}`).toBeGreaterThanOrEqual(3)
        expect(story.steps.at(-1)!.reveal, `${where} ${lang}`).toBe(s.answer)
        expect(flatKeyUi(story.truth), `${where} ${lang}`).toBe(flatKey(s.truth))
        const captions = story.steps.map((b) => b.caption).join(' | ')
        expect(captions, `${where} ${lang}`).not.toMatch(/undefined|NaN|\[object|Infinity/)
      }
    }

    expect([...seenAsk].sort()).toEqual([...ASKS].sort())
    expect([...seenView].sort()).toEqual([...VIEWS].sort())
  })

  test('the explainer renders every beat in both languages', () => {
    for (const seed of [3, 17, 42, 88, 129, 204]) {
      const p = concept.generate(mulberry32(seed))
      for (const lang of ['en', 'id'] as const) {
        const story = buildViewsOfSolidSteps(p, lang)
        for (let step = 0; step < story.steps.length; step++) {
          const html = renderToStaticMarkup(
            createElement(Explainer, { params: p, correctAnswer: solve(p).answer, lang, step }),
          )
          expect(html, `seed ${seed} ${lang} step ${step}`).toContain('<svg')
          expect(html, `seed ${seed} ${lang} step ${step}`).not.toMatch(/undefined|NaN/)
        }
      }
    }
  })

  test('the frontend falls back rather than drawing two right answers', () => {
    // Junk params must still coerce to a pile that can carry its own question.
    const junk = coerceViewsParams({ width: 99, heights: 'nope', ask: 'which-view' })
    expect(optionFlatsUi(junk, junk.view, junk.answerSlot)).not.toBeNull()
    const keys = optionFlatsUi(junk, junk.view, junk.answerSlot)!.map(flatKeyUi)
    expect(new Set(keys).size).toBe(4)
    // A flat 2×2 slab has no three different front views, so it is refused.
    const slab = coerceViewsParams({
      width: 2,
      depth: 2,
      heights: [1, 1, 1, 1],
      ask: 'which-view',
      view: 'front',
      layer: 1,
      answerSlot: 0,
    })
    expect(optionFlatsUi(slab, slab.view, slab.answerSlot)).not.toBeNull()
  })

  test('the schema rejects the shapes that would break the concept', () => {
    const ok: Params = {
      width: 3,
      depth: 2,
      heights: [2, 1, 3, 1, 3, 1],
      ask: 'which-view',
      view: 'front',
      layer: 2,
      answerSlot: 1,
    }
    expect(() => concept.paramsSchema.parse(ok)).not.toThrow()
    // heights must cover exactly the floor
    expect(() => concept.paramsSchema.parse({ ...ok, heights: [2, 1, 3, 1, 3] })).toThrow()
    // too few / too many cubes
    expect(() => concept.paramsSchema.parse({ ...ok, heights: [1, 1, 1, 1, 0, 0] })).toThrow()
    expect(() => concept.paramsSchema.parse({ ...ok, heights: [3, 3, 3, 3, 3, 3] })).toThrow()
    // a stack hidden behind the one in front of it (h[back][x] beaten by h[front][x+1])
    expect(() =>
      concept.paramsSchema.parse({ ...ok, heights: [0, 3, 2, 1, 1, 1], layer: 1 }),
    ).toThrow()
    // a layer that does not exist
    expect(() => concept.paramsSchema.parse({ ...ok, layer: 3, heights: [2, 1, 2, 1, 2, 1] })).toThrow()
  })

  test('a flat view throws away what hides behind it', () => {
    // Two piles that differ only in a cube hidden from the front give the SAME
    // front view — which is exactly why such a perturbation is never offered as
    // a wrong picture.
    const base: Params = {
      width: 2,
      depth: 2,
      heights: [1, 3, 3, 3],
      ask: 'which-view',
      view: 'front',
      layer: 1,
      answerSlot: 0,
    }
    const hiddenGone: Params = { ...base, heights: [0, 3, 3, 3] }
    const frame = viewFrame(base, 'front')
    const a = projectVoxels(solidVoxels(base), 'front', frame)
    const b = projectVoxels(solidVoxels(hiddenGone), 'front', frame)
    expect(flatKey(a)).toBe(flatKey(b))
    expect(columnHeights(a)).toEqual([3, 3])
    expect(distractorFlats(base, 'front', frame, a).map(flatKey)).not.toContain(flatKey(b))
  })
})
