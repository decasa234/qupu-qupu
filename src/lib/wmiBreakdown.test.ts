import { describe, test, expect } from 'vitest'
import { breakdownQuestion, segmentSections, stripSectionLabels } from './wmiBreakdown'

describe('breakdownQuestion', () => {
  test('returns no clauses for empty input', () => {
    expect(breakdownQuestion('', 'en')).toEqual([])
  })

  test('a single sentence is one clause', () => {
    const clauses = breakdownQuestion('How many apples do you see?', 'en')
    expect(clauses).toHaveLength(1)
  })

  test('classifies digit tokens as number', () => {
    const clauses = breakdownQuestion('What is 3 plus 4?', 'en')
    const tokens = clauses.flatMap((c) => c.tokens)
    expect(tokens).toContainEqual({ text: '3', category: 'number' })
    expect(tokens).toContainEqual({ text: '4', category: 'number' })
  })

  test('classifies English number-words as number', () => {
    const clauses = breakdownQuestion('Add two and three', 'en')
    const tokens = clauses.flatMap((c) => c.tokens)
    expect(tokens).toContainEqual({ text: 'two', category: 'number' })
    expect(tokens).toContainEqual({ text: 'three', category: 'number' })
  })

  test('classifies English question-words', () => {
    const clauses = breakdownQuestion('How many apples do you see?', 'en')
    const tokens = clauses.flatMap((c) => c.tokens)
    expect(tokens).toContainEqual({ text: 'How', category: 'question-word' })
    expect(tokens).toContainEqual({ text: 'many', category: 'question-word' })
  })

  test('classifies Indonesian question-words', () => {
    const clauses = breakdownQuestion('Ada berapa apel yang kamu lihat?', 'id')
    const tokens = clauses.flatMap((c) => c.tokens)
    expect(tokens).toContainEqual({ text: 'berapa', category: 'question-word' })
    expect(tokens).toContainEqual({ text: 'yang', category: 'question-word' })
  })

  test('classifies Indonesian number-words as number', () => {
    const clauses = breakdownQuestion('Tambah dua dan tiga', 'id')
    const tokens = clauses.flatMap((c) => c.tokens)
    expect(tokens).toContainEqual({ text: 'dua', category: 'number' })
    expect(tokens).toContainEqual({ text: 'tiga', category: 'number' })
  })

  test('preserves glossary spans with slug (no display text)', () => {
    const clauses = breakdownQuestion(
      'What is the [[perimeter]] of a square with side 3?',
      'en',
    )
    const tokens = clauses.flatMap((c) => c.tokens)
    expect(tokens).toContainEqual({ text: 'perimeter', category: 'glossary', slug: 'perimeter' })
    expect(tokens).toContainEqual({ text: '3', category: 'number' })
  })

  test('preserves glossary spans with custom display text (id)', () => {
    const clauses = breakdownQuestion(
      'Berapa [[perimeter|keliling]] dari persegi dengan sisi 3?',
      'id',
    )
    const tokens = clauses.flatMap((c) => c.tokens)
    expect(tokens).toContainEqual({ text: 'keliling', category: 'glossary', slug: 'perimeter' })
  })

  test('splits multiple sentences into multiple clauses', () => {
    const clauses = breakdownQuestion('Count the dots. How many are there?', 'en')
    expect(clauses).toHaveLength(2)
    expect(clauses[0].tokens.map((t) => t.text)).toEqual(['Count', 'the', 'dots'])
  })

  test('splits on commas too', () => {
    const clauses = breakdownQuestion('First add, then subtract', 'en')
    expect(clauses).toHaveLength(2)
  })

  test('plain words fall through to plain category', () => {
    const clauses = breakdownQuestion('apples do you see', 'en')
    const tokens = clauses.flatMap((c) => c.tokens)
    expect(tokens).toContainEqual({ text: 'apples', category: 'plain' })
    expect(tokens).toContainEqual({ text: 'do', category: 'plain' })
  })

  test('keeps unicode minus operator (concept generator format)', () => {
    const clauses = breakdownQuestion('What is 9 − 3?', 'en')
    const tokens = clauses.flatMap((c) => c.tokens)
    expect(tokens).toContainEqual({ text: '−', category: 'operator' })
    expect(tokens).toContainEqual({ text: '9', category: 'number' })
    expect(tokens).toContainEqual({ text: '3', category: 'number' })
  })

  test('keeps ascii hyphen-minus operator', () => {
    const tokens = breakdownQuestion('What is 9 - 3?', 'en').flatMap((c) => c.tokens)
    expect(tokens).toContainEqual({ text: '-', category: 'operator' })
  })

  test('keeps plus and times operators', () => {
    const tokens = breakdownQuestion('Compute 2 + 3 × 4', 'en').flatMap((c) => c.tokens)
    expect(tokens).toContainEqual({ text: '+', category: 'operator' })
    expect(tokens).toContainEqual({ text: '×', category: 'operator' })
  })
})

describe('segmentSections', () => {
  test('empty input yields no sections', () => {
    expect(segmentSections('', 'en')).toEqual([])
  })

  test('a single sentence becomes one find section', () => {
    const sections = segmentSections('What is 9 − 3?', 'en')
    expect(sections).toHaveLength(1)
    expect(sections[0].kind).toBe('find')
  })

  test('splits explicit en labels into kinds', () => {
    const sections = segmentSections(
      'Start: Tom has 9 apples. Find: how many are left?',
      'en',
    )
    expect(sections.map((s) => s.kind)).toEqual(['start', 'find'])
  })

  test('splits explicit id labels into kinds', () => {
    const sections = segmentSections(
      'Mulai: Tom punya 9 apel. Cari: berapa sisanya?',
      'id',
    )
    expect(sections.map((s) => s.kind)).toEqual(['start', 'find'])
  })

  test('preamble before first label becomes a start section', () => {
    const sections = segmentSections('Read carefully. Find: what is 2 + 2?', 'en')
    expect(sections[0].kind).toBe('start')
    expect(sections[sections.length - 1].kind).toBe('find')
  })

  test('fallback groups question sentences vs start', () => {
    const sections = segmentSections('Tom has 9 apples. He eats 3. How many are left?', 'en')
    expect(sections.map((s) => s.kind)).toEqual(['start', 'find'])
    const questionWords = sections[1].clauses.flatMap((c) => c.tokens).map((t) => t.text)
    expect(questionWords).toContain('How')
  })

  test('fallback with no question mark is one find block', () => {
    const sections = segmentSections('Tom has nine apples', 'en')
    expect(sections).toHaveLength(1)
    expect(sections[0].kind).toBe('find')
  })

  test('unknown label falls to plain kind', () => {
    const sections = segmentSections('Note: be careful. Find: what is 1 + 1?', 'en')
    expect(sections.some((s) => s.kind === 'find')).toBe(true)
  })

  test('classifies the expanded label kinds', () => {
    const sections = segmentSections(
      'Start: a. Mystery: b. Add: c. Takeaway: d. Give: e. Compare: f. Clue: g. Share: h. Now: i. Find: j? Extra: k. Example: l.',
      'en',
    )
    expect(sections.map((s) => s.kind)).toEqual([
      'start',
      'mystery',
      'add',
      'take-away',
      'give',
      'compare',
      'clue',
      'share',
      'now',
      'find',
      'extra',
      'example',
    ])
  })

  test('classifies expanded Indonesian label aliases', () => {
    const sections = segmentSections(
      'Mulai: a. Misteri: b. Tambah: c. Kurang: d. Beri: e. Bandingkan: f. Petunjuk: g. Bagi: h. Sekarang: i. Cari: j? Tambahan: k. Contoh: l.',
      'id',
    )
    expect(sections.map((s) => s.kind)).toEqual([
      'start',
      'mystery',
      'add',
      'take-away',
      'give',
      'compare',
      'clue',
      'share',
      'now',
      'find',
      'extra',
      'example',
    ])
  })
})

describe('stripSectionLabels', () => {
  test('removes known en labels', () => {
    const out = stripSectionLabels(
      'Start: Budi has 7 apples. Now: he gives 3 away. Find: how many left?',
    )
    expect(out).toBe('Budi has 7 apples. he gives 3 away. how many left?')
  })

  test('removes known id labels', () => {
    const out = stripSectionLabels('Mulai: Budi punya 7 apel. Cari: berapa sisanya?')
    expect(out).toBe('Budi punya 7 apel. berapa sisanya?')
  })

  test('leaves unknown labels intact', () => {
    expect(stripSectionLabels('Note: be careful')).toBe('Note: be careful')
  })

  test('preserves glossary markup', () => {
    expect(stripSectionLabels('Find: find the [[perimeter]]')).toBe('find the [[perimeter]]')
  })

  test('leaves a label-free question unchanged', () => {
    expect(stripSectionLabels('What is 9 − 3?')).toBe('What is 9 − 3?')
  })
})
