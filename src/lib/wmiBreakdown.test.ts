import { describe, test, expect } from 'vitest'
import { breakdownQuestion } from './wmiBreakdown'

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
})
