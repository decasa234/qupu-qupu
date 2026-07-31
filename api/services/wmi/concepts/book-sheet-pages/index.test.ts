import { describe, expect, test } from 'vitest'
import { stripSectionLabels } from '../../../../../src/lib/wmiBreakdown'
import { deTex, parseWmiMarkup } from '../../../../../src/lib/wmiMarkup'
import { mulberry32 } from '../rng.js'
import concept, {
  ASKS,
  derive,
  generate,
  ordinalEn,
  pagesOnSheet,
  perSheetOf,
  sheetOfPage,
  type Params,
} from './index.js'

// The breakdown highlighter finds each phrase by substring on the DISPLAYED
// body — exactly the pipeline WmiAuthoredBreakdown runs: strip "Cari:"/"Find:",
// resolve [[glossary]] markup, collapse whitespace. A phrase that is not found
// silently renders as plain text with no colour and no note, so every seed is
// checked against the real functions rather than against body_id/body_en raw.
function display(text: string): string {
  return parseWmiMarkup(stripSectionLabels(text))
    .map((seg) => seg.text)
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

const SEEDS = 400

const generated: Params[] = []
for (let seed = 1; seed <= SEEDS; seed++) generated.push(generate(mulberry32(seed)))

/**
 * The answer recomputed from the sheet/page relation alone, with no reference
 * to derive() or render(). Sheet k of a two-sided booklet holds pages 2k − 1
 * and 2k; a one-sided sheet k holds only page k.
 */
function independentAnswer(p: Params): string {
  const per = p.sided === 'two' ? 2 : 1
  // Lay the pages out sheet by sheet, straight from the rule.
  const layout: Array<{ sheet: number; front: number; back: number | null }> = []
  for (let k = 1; k <= 30; k++) {
    layout.push(per === 2 ? { sheet: k, front: 2 * k - 1, back: 2 * k } : { sheet: k, front: k, back: null })
  }
  const row = layout[p.sheets - 1]

  switch (p.ask) {
    case 'pages-from-sheets':
      // Highest page number printed once `sheets` sheets are used.
      return String(row.back ?? row.front)
    case 'sheets-from-pages': {
      // How many sheets are consumed by that same page count.
      const pages = row.back ?? row.front
      const used = layout.find((r) => (r.back ?? r.front) >= pages)!
      return String(used.sheet)
    }
    case 'which-page-shares-the-sheet': {
      const home = layout.find((r) => r.front === p.page || r.back === p.page)!
      return String(home.front === p.page ? home.back : home.front)
    }
    default:
      return String(p.side === 'back' ? row.back : row.front)
  }
}

describe('book-sheet-pages — generate', () => {
  test('deterministic for a given seed', () => {
    expect(generate(mulberry32(77))).toEqual(generate(mulberry32(77)))
  })

  test(`${SEEDS} seeds: every ask is reachable and every params object parses`, () => {
    const seen = new Set<string>()
    for (const p of generated) {
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      seen.add(p.ask)
    }
    expect(seen).toEqual(new Set(ASKS))
  })

  test('one-sided and two-sided copying both occur, and only on the counting asks', () => {
    const counting = generated.filter(
      (p) => p.ask === 'pages-from-sheets' || p.ask === 'sheets-from-pages',
    )
    expect(counting.some((p) => p.sided === 'one')).toBe(true)
    expect(counting.some((p) => p.sided === 'two')).toBe(true)
    for (const p of generated) {
      if (p.ask === 'which-page-shares-the-sheet' || p.ask === 'page-on-the-back') {
        expect(p.sided).toBe('two')
      }
    }
  })

  test('`page` is always a page that really sits on `sheets`', () => {
    for (const p of generated) {
      const per = perSheetOf(p.sided)
      expect(pagesOnSheet(p.sheets, per)).toContain(p.page)
      expect(sheetOfPage(p.page, per)).toBe(p.sheets)
    }
  })

  test('the named page/sheet never falls inside the stem’s worked example', () => {
    for (const p of generated) {
      if (p.ask === 'which-page-shares-the-sheet') expect(p.page).toBeGreaterThanOrEqual(5)
      if (p.ask === 'page-on-the-back') expect(p.sheets).toBeGreaterThanOrEqual(4)
    }
  })

  test('ordinalEn covers the English suffix traps', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23].map(ordinalEn)).toEqual([
      '1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '23rd',
    ])
  })
})

describe('book-sheet-pages — render', () => {
  test(`${SEEDS} seeds: nothing renders as undefined / NaN`, () => {
    for (const p of generated) {
      const r = concept.render(p)
      const blobs = [
        r.body_id,
        r.body_en,
        r.answer,
        r.hint_id ?? '',
        r.hint_en ?? '',
        ...(r.hint_steps_id ?? []),
        ...(r.hint_steps_en ?? []),
        JSON.stringify(r.breakdown),
      ]
      for (const s of blobs) {
        expect(s).toBeTruthy()
        expect(s).not.toMatch(/undefined|NaN|\[object Object\]/)
      }
      expect(r.hint_steps_id).toHaveLength(3)
      expect(r.hint_steps_en).toHaveLength(3)
      expect(r.answer_type).toBe('fill_in')
      expect(r.choices_id).toBeNull()
      expect(r.choices_en).toBeNull()
      // Kids type this: a bare positive whole number.
      expect(r.answer).toMatch(/^[1-9]\d*$/)
    }
  })

  test('the answer always matches an independent recomputation from the sheet/page relation', () => {
    for (const p of generated) {
      const expected = independentAnswer(p)
      expect(
        concept.render(p).answer,
        `ask=${p.ask} sided=${p.sided} sheets=${p.sheets} page=${p.page} side=${p.side}`,
      ).toBe(expected)
      expect(derive(p).answer).toBe(expected)
    }
  })

  test('the 2k−1 / 2k pairing holds for every two-sided seed', () => {
    for (const p of generated.filter((q) => q.sided === 'two')) {
      const d = derive(p)
      expect(d.frontPage).toBe(2 * p.sheets - 1)
      expect(d.backPage).toBe(2 * p.sheets)
      expect(d.frontPage % 2).toBe(1)
      expect(d.backPage % 2).toBe(0)
      // The partner of a page is always the other face of its own sheet.
      expect(Math.abs(d.partnerPage - d.givenPage)).toBe(1)
      expect(sheetOfPage(d.partnerPage, 2)).toBe(sheetOfPage(d.givenPage, 2))
    }
  })

  test('both odd and even page numbers are exercised, as given and as answer', () => {
    const shares = generated.filter((p) => p.ask === 'which-page-shares-the-sheet')
    expect(shares.length).toBeGreaterThan(10)
    expect(shares.some((p) => p.page % 2 === 1)).toBe(true)
    expect(shares.some((p) => p.page % 2 === 0)).toBe(true)
    // ...and the answers therefore land on both parities too.
    const shareAnswers = shares.map((p) => Number(concept.render(p).answer))
    expect(shareAnswers.some((n) => n % 2 === 1)).toBe(true)
    expect(shareAnswers.some((n) => n % 2 === 0)).toBe(true)

    // page-on-the-back asks for the odd front as often as the even back, so a
    // child never learns "the answer is always even".
    const faces = generated.filter((p) => p.ask === 'page-on-the-back')
    expect(faces.some((p) => p.side === 'front')).toBe(true)
    expect(faces.some((p) => p.side === 'back')).toBe(true)
    const faceAnswers = faces.map((p) => Number(concept.render(p).answer))
    expect(faceAnswers.some((n) => n % 2 === 1)).toBe(true)
    expect(faceAnswers.some((n) => n % 2 === 0)).toBe(true)

    // Across every seed, both parities appear as the typed answer.
    const all = generated.map((p) => Number(concept.render(p).answer))
    expect(all.some((n) => n % 2 === 1)).toBe(true)
    expect(all.some((n) => n % 2 === 0)).toBe(true)
  })

  test('one-sided copying never doubles and two-sided always does', () => {
    for (const p of generated.filter((q) => q.ask === 'pages-from-sheets')) {
      const r = concept.render(p)
      expect(r.answer).toBe(String(p.sided === 'two' ? 2 * p.sheets : p.sheets))
    }
    for (const p of generated.filter((q) => q.ask === 'sheets-from-pages')) {
      const pages = derive(p).totalPages
      expect(concept.render(p).answer).toBe(String(p.sided === 'two' ? pages / 2 : pages))
    }
  })

  test('every hint_steps chain names the sheet rule before it computes', () => {
    for (const p of generated) {
      const r = concept.render(p)
      const firstId = (r.hint_steps_id ?? [])[0]
      const firstEn = (r.hint_steps_en ?? [])[0]
      // Step 1 must state how many pages a sheet carries — the fact every
      // later step leans on. Never a bare assertion of the answer.
      expect(firstId).toMatch(/lembar/i)
      expect(firstId).toMatch(
        p.sided === 'two' ? /2 halaman|2 nomor halaman/ : /1 halaman|1 nomor halaman/,
      )
      expect(firstEn).toMatch(/piece of paper|sheet/i)
      expect(firstEn).toMatch(p.sided === 'two' ? /2 pages|2 page numbers/ : /1 page/)
      // The last step lands on the answer.
      expect((r.hint_steps_id ?? [])[2]).toContain(r.answer)
      expect((r.hint_steps_en ?? [])[2]).toContain(r.answer)
    }
  })
})

describe('book-sheet-pages — breakdown', () => {
  test('every phrase is an exact substring of the displayed body, in both languages', () => {
    for (const p of generated) {
      const r = concept.render(p)
      const bodyId = display(r.body_id)
      const bodyEn = display(r.body_en)
      const bd = r.breakdown
      expect(bd).toBeTruthy()
      for (const h of bd!.highlights) {
        const phraseId = deTex(h.phrase_id)
        const phraseEn = deTex(h.phrase_en)
        expect(phraseId.length).toBeGreaterThan(0)
        expect(phraseEn.length).toBeGreaterThan(0)
        expect(
          bodyId.includes(phraseId),
          `ask=${p.ask} sided=${p.sided}\nphrase_id: ${phraseId}\nbody_id:   ${bodyId}`,
        ).toBe(true)
        expect(
          bodyEn.includes(phraseEn),
          `ask=${p.ask} sided=${p.sided}\nphrase_en: ${phraseEn}\nbody_en:   ${bodyEn}`,
        ).toBe(true)
        expect(h.note_id).not.toMatch(/undefined|NaN/)
        expect(h.note_en).not.toMatch(/undefined|NaN/)
      }
    }
  })

  test('no phrase lights up twice — each one occurs exactly once in the body', () => {
    const count = (haystack: string, needle: string) => haystack.split(needle).length - 1
    for (const p of generated) {
      const r = concept.render(p)
      const bodyId = display(r.body_id)
      const bodyEn = display(r.body_en)
      for (const h of r.breakdown!.highlights) {
        expect(count(bodyId, deTex(h.phrase_id)), `ask=${p.ask} phrase_id=${h.phrase_id}`).toBe(1)
        expect(count(bodyEn, deTex(h.phrase_en)), `ask=${p.ask} phrase_en=${h.phrase_en}`).toBe(1)
      }
    }
  })

  test('the question is always spotlighted and the answer agrees with render()', () => {
    for (const p of generated) {
      const r = concept.render(p)
      const bd = r.breakdown!
      expect(bd.highlights.some((h) => h.category === 'question')).toBe(true)
      expect(bd.highlights.some((h) => h.category === 'condition')).toBe(true)
      expect(bd.answer.value).toBe(r.answer)
      expect(bd.answer.form).toBe('number')
      expect(bd.strategy.conceptSlug).toBe('book-sheet-pages')
      expect(bd.quantities.length).toBeGreaterThanOrEqual(4)
      for (const q of bd.quantities) expect(q.value).not.toMatch(/undefined|NaN/)
    }
  })

  test('a trap, when offered, is a real wrong answer', () => {
    let trapped = 0
    for (const p of generated) {
      const r = concept.render(p)
      const trap = r.breakdown?.trap
      if (!trap) continue
      trapped += 1
      expect(trap.wrong).not.toBe(r.answer)
      expect(trap.wrong).toMatch(/^[1-9]\d*$/)
      expect(trap.why_id).not.toMatch(/undefined|NaN/)
      expect(trap.why_en).not.toMatch(/undefined|NaN/)
    }
    expect(trapped).toBeGreaterThan(SEEDS / 2)
  })
})

describe('book-sheet-pages — worked stems', () => {
  // Stored wmi_concept_instances rows carry these exact params. If any of these
  // strings move, live rows re-render differently from the day they were made.
  const COPY_TWO_SIDED: Params = {
    ask: 'pages-from-sheets',
    name: 'Lisa',
    sided: 'two',
    sheets: 5,
    page: 10,
    side: 'back',
    book_en: 'storybook',
    book_id: 'buku cerita',
  }
  const SHARE_EVEN: Params = {
    ask: 'which-page-shares-the-sheet',
    name: 'Rani',
    sided: 'two',
    sheets: 4,
    page: 8,
    side: 'front',
    book_en: 'storybook',
    book_id: 'buku cerita',
  }
  const FACE_FRONT: Params = {
    ask: 'page-on-the-back',
    name: 'Dimas',
    sided: 'two',
    sheets: 6,
    page: 12,
    side: 'front',
    book_en: 'notebook',
    book_id: 'buku tulis',
  }

  test('the real WMI paper wording is preserved: 5 two-sided sheets → 10 pages', () => {
    const r = concept.render(COPY_TWO_SIDED)
    expect(r.body_en).toBe(
      'Lisa uses a photocopier to copy 5 two-sided pieces of paper. Each piece of paper has 2 pages: an odd page on the front and the next even page on the back.\n\nFind: How many pages are there in total?',
    )
    expect(r.body_id).toBe(
      'Lisa memakai mesin fotokopi untuk menyalin 5 lembar kertas bolak-balik. Setiap lembar kertas memuat 2 halaman: halaman ganjil di depan dan halaman genap sesudahnya di belakang.\n\nCari: Ada berapa halaman seluruhnya?',
    )
    expect(r.answer).toBe('10')
    expect(r.breakdown!.trap!.wrong).toBe('5')
  })

  test('an even page steps BACKWARD to its front partner', () => {
    const r = concept.render(SHARE_EVEN)
    expect(r.answer).toBe('7')
    expect(r.breakdown!.trap!.wrong).toBe('9')
    expect(r.hint_steps_id![1]).toContain('genap')
    expect(r.hint_steps_en![2]).toContain('8 − 1 = 7')
  })

  test('an odd page steps FORWARD to its back partner', () => {
    const r = concept.render({ ...SHARE_EVEN, sheets: 4, page: 7 })
    expect(r.answer).toBe('8')
    expect(r.breakdown!.trap!.wrong).toBe('6')
    expect(r.hint_steps_en![2]).toContain('7 + 1 = 8')
  })

  test('the front of sheet 6 is the odd page 11, not the even page 12', () => {
    const r = concept.render(FACE_FRONT)
    expect(r.answer).toBe('11')
    expect(r.breakdown!.trap!.wrong).toBe('12')
    expect(r.body_en).toContain('Which page number is on the front of the 6th piece of paper?')
    expect(r.body_id).toContain('Halaman berapa yang ada di sisi depan lembar ke-6?')
    expect(concept.render({ ...FACE_FRONT, side: 'back' }).answer).toBe('12')
  })
})
