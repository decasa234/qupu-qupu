import { describe, test, expect } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { mulberry32 } from '../rng.js'
import concept, {
  ASKS,
  CHOICE_LABELS,
  KINDS,
  PICTURE_NAMES,
  derive,
  type Anchor,
  type Kind,
  type Params,
} from './index.js'
import Illustration from '../../../../../src/components/wmi/concepts/ordinal-position-read'

const SEEDS = 340

/**
 * Independent oracle — where an anchor lands, rewritten from the wording of the
 * problem rather than from the generator's `resolveAnchor`:
 *
 *  • "k-th from the LEFT"  = walk k−1 steps right from index 0        → k − 1
 *  • "k-th from the RIGHT" = walk k−1 steps left from index n−1       → n − k
 *  • a neighbour / offset  = walk `step` places away from the landmark
 *
 * The walks below are literal loops, so an off-by-one in the concept cannot be
 * mirrored here by accident.
 */
function walkTo(a: Anchor, n: number): number {
  if (a.type === 'from-left') {
    let i = 0
    for (let step = 1; step < a.k; step++) i += 1
    return i
  }
  if (a.type === 'from-right') {
    let i = n - 1
    for (let step = 1; step < a.k; step++) i -= 1
    return i
  }
  const steps = a.type === 'neighbour-of' ? 1 : a.step
  const dir = (a.type === 'neighbour-of' ? a.side : a.dir) === 'left' ? -1 : 1
  let i = a.marker
  for (let step = 0; step < steps; step++) i += dir
  return i
}

/** The label a child reads off a cell, rebuilt from the published name table. */
function labelOf(cell: string, kind: Kind, lang: 'en' | 'id'): string {
  if (kind === 'number') return cell
  return PICTURE_NAMES[cell as keyof typeof PICTURE_NAMES]?.[lang] ?? cell
}

describe('ordinal-position-read', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(23))).toEqual(concept.generate(mulberry32(23)))
  })

  test('the k-th from the right is index n − k, both ends agreeing', () => {
    // A hand row, walked by hand. 1st from the right is the LAST item.
    const cells = ['5', '2', '8', '1', '9', '4', '7']
    const n = cells.length
    for (let k = 1; k <= n; k++) {
      const i = walkTo({ type: 'from-right', k }, n)
      expect(i).toBe(n - k)
      expect(cells[i]).toBe([...cells].reverse()[k - 1])
      // and the same item, counted from the left, is at place n − k + 1
      expect(walkTo({ type: 'from-left', k: n - k + 1 }, n)).toBe(i)
    }
    expect(walkTo({ type: 'from-right', k: 1 }, n)).toBe(n - 1)
    expect(walkTo({ type: 'from-left', k: 1 }, n)).toBe(0)

    // The concept agrees, end to end: 3rd from the right of this row is 9.
    const p: Params = {
      kind: 'number',
      cells,
      anchors: [{ type: 'from-right', k: 3 }],
      ask: 'read',
      optionShift: 0,
    }
    expect(() => concept.paramsSchema.parse(p)).not.toThrow()
    expect(derive(p).views[0].target).toBe(4)
    expect(concept.render(p).answer).toBe('9')
    // …and the classic slip — counting 3 from the LEFT — is the named trap.
    expect(concept.render(p).breakdown!.trap!.wrong).toBe('8')
  })

  test(`${SEEDS} seeds: params parse, the answer re-derives from the row, render is clean`, () => {
    const seenAsk = new Set<string>()
    const seenKind = new Set<string>()
    const seenAnchor = new Set<string>()

    for (let seed = 1; seed <= SEEDS; seed++) {
      const p: Params = concept.generate(mulberry32(seed))
      const where = `seed ${seed} (${JSON.stringify(p)})`
      expect(() => concept.paramsSchema.parse(p), where).not.toThrow()
      seenAsk.add(p.ask)
      seenKind.add(p.kind)
      for (const a of p.anchors) seenAnchor.add(a.type)

      const n = p.cells.length
      const d = derive(p)
      const r = concept.render(p)
      expect(d.n, where).toBe(n)
      expect(p.anchors.length, where).toBe(p.ask === 'read' ? 1 : 2)
      expect(d.views.length, where).toBe(p.anchors.length)

      // ── every anchor lands where an independent walk says it lands ─────────
      const targets = p.anchors.map((a) => walkTo(a, n))
      p.anchors.forEach((a, i) => {
        expect(targets[i], `${where} anchor ${i}`).toBe(d.views[i].target)
        expect(targets[i], where).toBeGreaterThanOrEqual(0)
        expect(targets[i], where).toBeLessThan(n)
        // The from-right rule, stated twice and checked twice.
        if (a.type === 'from-right') {
          expect(d.views[i].target, where).toBe(n - a.k)
          expect(p.cells[d.views[i].target], where).toBe([...p.cells].reverse()[a.k - 1])
          // the slip a six-year-old makes is counting the same k from the left
          expect(d.views[i].mistake, where).toBe(a.k - 1)
        }
        if (a.type === 'from-left') {
          expect(d.views[i].target, where).toBe(a.k - 1)
          expect(d.views[i].mistake, where).toBe(n - a.k)
        }
        if (a.type === 'neighbour-of' || a.type === 'offset-from-item') {
          // the landmark must be findable: it appears exactly once in the row
          expect(p.cells.filter((c) => c === p.cells[a.marker]).length, where).toBe(1)
          expect(d.views[i].mistake, where).not.toBe(d.views[i].target)
        }
        expect(d.views[i].label_id, where).toBe(labelOf(p.cells[targets[i]], p.kind, 'id'))
        expect(d.views[i].label_en, where).toBe(labelOf(p.cells[targets[i]], p.kind, 'en'))
      })
      if (p.anchors.length === 2) expect(targets[0], where).not.toBe(targets[1])

      // ── the answer, recomputed from the row rather than read back ──────────
      if (p.ask === 'sum' || p.ask === 'difference') {
        expect(p.kind, where).toBe('number')
        expect(r.answer_type, where).toBe('fill_in')
        expect(r.choices_en, where).toBeNull()
        const a = Number(p.cells[targets[0]])
        const b = Number(p.cells[targets[1]])
        const want = p.ask === 'sum' ? a + b : Math.abs(a - b)
        expect(Number.isNaN(want), where).toBe(false)
        expect(r.answer, where).toBe(String(want))
        if (p.ask === 'sum') expect(want, where).toBeLessThanOrEqual(20)
        else expect(want, where).toBeGreaterThan(0)
      } else if (p.ask === 'read' && p.kind === 'number') {
        expect(r.answer_type, where).toBe('fill_in')
        expect(r.answer, where).toBe(p.cells[targets[0]])
      } else {
        // multiple choice: the offered option carrying the answer letter must
        // name exactly what the walk found, in BOTH languages, and nothing else
        // in the list may name the same thing.
        expect(r.answer_type, where).toBe('multiple_choice')
        expect(CHOICE_LABELS as readonly string[], where).toContain(r.answer)
        expect(r.choices_id!.map((c) => c.label), where).toEqual([...CHOICE_LABELS])
        expect(r.choices_en!.map((c) => c.label), where).toEqual([...CHOICE_LABELS])
        const slot = CHOICE_LABELS.indexOf(r.answer as (typeof CHOICE_LABELS)[number])
        for (const lang of ['id', 'en'] as const) {
          const choices = (lang === 'id' ? r.choices_id : r.choices_en)!
          const want =
            p.ask === 'read'
              ? labelOf(p.cells[targets[0]], p.kind, lang)
              : lang === 'id'
                ? `${labelOf(p.cells[targets[0]], p.kind, 'id')} dan ${labelOf(p.cells[targets[1]], p.kind, 'id')}`
                : `${labelOf(p.cells[targets[0]], p.kind, 'en')} and ${labelOf(p.cells[targets[1]], p.kind, 'en')}`
          expect(choices[slot].text, `${where} ${lang}`).toBe(want)
          expect(choices.filter((c) => c.text === want).length, `${where} ${lang}`).toBe(1)
          expect(new Set(choices.map((c) => c.text)).size, `${where} ${lang}`).toBe(4)
          // "Y and X" names the very same two items, so it can never be offered.
          if (p.ask === 'which-option-contains-both') {
            const swapped =
              lang === 'id'
                ? `${labelOf(p.cells[targets[1]], p.kind, 'id')} dan ${labelOf(p.cells[targets[0]], p.kind, 'id')}`
                : `${labelOf(p.cells[targets[1]], p.kind, 'en')} and ${labelOf(p.cells[targets[0]], p.kind, 'en')}`
            expect(choices.every((c) => c.text !== swapped), `${where} ${lang}`).toBe(true)
          }
        }
      }

      // ── nothing may leak an undefined / NaN onto a child's screen ──────────
      const bd = r.breakdown!
      const prose = [
        r.body_en,
        r.body_id,
        r.hint_en ?? '',
        r.hint_id ?? '',
        ...(r.hint_steps_en ?? []),
        ...(r.hint_steps_id ?? []),
        ...(r.choices_en ?? []).map((c) => c.text),
        ...(r.choices_id ?? []).map((c) => c.text),
        ...bd.highlights.flatMap((h) => [h.phrase_en, h.phrase_id, h.note_en, h.note_id]),
        ...bd.quantities.flatMap((q) => [q.label_en, q.label_id, q.value]),
        bd.trap?.why_en ?? '',
        bd.trap?.why_id ?? '',
        bd.strategy.name_en,
        bd.strategy.name_id,
        r.answer,
      ].join(' | ')
      expect(prose, where).not.toMatch(/undefined|NaN|null|\[object/)

      expect((r.hint_steps_en ?? []).length, where).toBe((r.hint_steps_id ?? []).length)
      const lastEn = (r.hint_steps_en ?? []).at(-1) as string
      const lastId = (r.hint_steps_id ?? []).at(-1) as string
      if (r.answer_type === 'fill_in') {
        expect(lastEn, where).toContain(r.answer)
        expect(lastId, where).toContain(r.answer)
      } else {
        const slot = CHOICE_LABELS.indexOf(r.answer as (typeof CHOICE_LABELS)[number])
        expect(lastEn, where).toContain(r.choices_en![slot].text)
        expect(lastId, where).toContain(r.choices_id![slot].text)
      }

      // ── the trap is a real, offered, WRONG answer ──────────────────────────
      expect(bd.answer.value, where).toBe(r.answer)
      expect(bd.answer.form, where).toBe(r.answer_type === 'multiple_choice' ? 'choice' : 'number')
      if (bd.trap) {
        expect(bd.trap.wrong, where).not.toBe(r.answer)
        if (r.answer_type === 'multiple_choice') {
          expect(CHOICE_LABELS as readonly string[], where).toContain(bd.trap.wrong)
        } else {
          expect(bd.trap.wrong, where).toMatch(/^\d+$/)
        }
      }

      // ── breakdown phrases: exact, non-overlapping spans in BOTH languages ──
      const display_en = stripLabels(r.body_en)
      const display_id = stripLabels(r.body_id)
      expect(bd.needsVisual, where).toBe(true)
      expect(bd.highlights.length, where).toBe(2 + d.views.length)
      expect(bd.highlights[0].category, where).toBe('fact')
      expect(bd.highlights.at(-1)!.category, where).toBe('question')
      for (const h of bd.highlights) {
        expect(display_en, `${where} phrase_en=${h.phrase_en}`).toContain(h.phrase_en)
        expect(display_id, `${where} phrase_id=${h.phrase_id}`).toContain(h.phrase_id)
      }
      expectNoOverlap(display_en, bd.highlights.map((h) => h.phrase_en), where)
      expectNoOverlap(display_id, bd.highlights.map((h) => h.phrase_id), where)
      expect(bd.strategy.conceptSlug, where).toBe('ordinal-position-read')
      // the "place found" quantities are 1-based readings of the same indices
      d.views.forEach((v, i) => {
        expect(bd.quantities[1 + i].value, where).toBe(String(targets[i] + 1))
      })

      // ── the figure renders, in both languages, and gives nothing away ──────
      // Concept illustrations receive only `{ params }` (see the frontend
      // registry), so the row is drawn WORDLESS: passing a locale must not
      // change one byte of it.
      const html_en = renderToStaticMarkup(createElement(Illustration, { params: { ...p, lang: 'en' } }))
      const html_id = renderToStaticMarkup(createElement(Illustration, { params: { ...p, lang: 'id' } }))
      expect(html_en, where).toBe(html_id)
      expect(html_en, where).not.toMatch(/undefined|NaN/)
      expect(html_en, where).toContain('<svg')

      const label = html_en.match(/aria-label="([^"]*)"/)?.[1]
      expect(label, where).toBeTruthy()
      // It speaks the row exactly as drawn — every item, in order — and stops.
      const spoken = p.cells.map((c) => labelOf(c, p.kind, 'en')).join(', ')
      const noun = p.kind === 'number' ? 'number cards' : 'objects'
      expect(label, where).toBe(`A row of ${n} ${noun}, from left to right: ${spoken}.`)
      // No place is named, no end is named, no answer is announced.
      expect(label!, where).not.toMatch(/\b\d+(st|nd|rd|th)\b|from the right|place|answer|option/i)
      // The strongest form of "the label does not contain the answer": the
      // figure is answer-BLIND. Strip the anchors, the ask and the option order
      // and it must render identically, so nothing in it can point at the
      // answer. (The answer VALUE is of course among the drawn items — that is
      // the row the child has been asked to walk.)
      const blind = renderToStaticMarkup(
        createElement(Illustration, { params: { kind: p.kind, cells: p.cells } }),
      )
      expect(html_en, where).toBe(blind)
    }

    expect([...seenAsk].sort()).toEqual([...ASKS].sort())
    expect([...seenKind].sort()).toEqual([...KINDS].sort())
    expect([...seenAnchor].sort()).toEqual(
      ['from-left', 'from-right', 'neighbour-of', 'offset-from-item'],
    )
  })

  test('the schema rejects the shapes that would break the concept', () => {
    const ok: Params = {
      kind: 'number',
      cells: ['5', '2', '8', '1', '9', '4', '7'],
      anchors: [{ type: 'from-right', k: 3 }],
      ask: 'read',
      optionShift: 0,
    }
    expect(() => concept.paramsSchema.parse(ok)).not.toThrow()

    // an anchor that walks off the end of the row
    expect(() => concept.paramsSchema.parse({ ...ok, anchors: [{ type: 'from-right', k: 8 }] })).toThrow()
    expect(() => concept.paramsSchema.parse({ ...ok, anchors: [{ type: 'from-left', k: 9 }] })).toThrow()
    expect(() =>
      concept.paramsSchema.parse({ ...ok, anchors: [{ type: 'neighbour-of', marker: 0, side: 'left' }] }),
    ).toThrow()
    // a repeated card would make two places answer to the same landmark
    expect(() => concept.paramsSchema.parse({ ...ok, cells: ['5', '5', '8', '1', '9', '4', '7'] })).toThrow()
    // anchor counts are fixed per ask
    expect(() =>
      concept.paramsSchema.parse({
        ...ok,
        anchors: [{ type: 'from-right', k: 3 }, { type: 'from-left', k: 2 }],
      }),
    ).toThrow()
    expect(() => concept.paramsSchema.parse({ ...ok, ask: 'sum' })).toThrow()
    // the two anchors must land on different items — 3rd from the left and 5th
    // from the right are the same card in a row of 7
    expect(() =>
      concept.paramsSchema.parse({
        ...ok,
        ask: 'sum',
        anchors: [{ type: 'from-left', k: 3 }, { type: 'from-right', k: 5 }],
      }),
    ).toThrow()
    // …and a grade-1 sum may not run past 20
    expect(() =>
      concept.paramsSchema.parse({
        ...ok,
        cells: ['19', '2', '8', '1', '9', '4', '7'],
        ask: 'sum',
        anchors: [{ type: 'from-left', k: 1 }, { type: 'from-right', k: 1 }],
      }),
    ).toThrow()
    expect(() =>
      concept.paramsSchema.parse({
        ...ok,
        ask: 'sum',
        anchors: [{ type: 'from-left', k: 1 }, { type: 'from-right', k: 1 }],
      }),
    ).not.toThrow()

    // a picture row whose landmark is not unique cannot be found by a child
    const pic: Params = {
      kind: 'picture',
      cells: ['apple', 'banana', 'apple', 'cherry', 'star', 'banana'],
      anchors: [{ type: 'neighbour-of', marker: 3, side: 'right' }],
      ask: 'read',
      optionShift: 1,
    }
    expect(() => concept.paramsSchema.parse(pic)).not.toThrow()
    expect(() =>
      concept.paramsSchema.parse({ ...pic, anchors: [{ type: 'neighbour-of', marker: 0, side: 'right' }] }),
    ).toThrow()
    // and a picture row needs at least three different objects
    expect(() =>
      concept.paramsSchema.parse({ ...pic, cells: ['apple', 'banana', 'apple', 'banana', 'apple', 'banana'] }),
    ).toThrow()
  })
})

/** Mirrors src/lib/wmiBreakdown stripSectionLabels for the two labels we emit. */
function stripLabels(text: string): string {
  return text.replace(/\b(Find|Cari):\s*/g, '').replace(/\s{2,}/g, ' ').trim()
}

function expectNoOverlap(text: string, phrases: string[], where: string): void {
  const spans = phrases.map((phrase) => {
    const at = text.indexOf(phrase)
    return { phrase, at, end: at + phrase.length }
  })
  spans.sort((a, b) => a.at - b.at)
  for (let i = 1; i < spans.length; i++) {
    expect(
      spans[i].at >= spans[i - 1].end,
      `${where}: "${spans[i - 1].phrase}" overlaps "${spans[i].phrase}"`,
    ).toBe(true)
  }
}
