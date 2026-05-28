import { parseWmiMarkup } from './wmiMarkup'

export type BreakdownCategory = 'number' | 'question-word' | 'glossary' | 'plain'

export interface BreakdownToken {
  text: string
  category: BreakdownCategory
  slug?: string
}

export interface BreakdownClause {
  tokens: BreakdownToken[]
}

const NUMBER_WORDS_EN = new Set([
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen', 'twenty',
])
const QUESTION_WORDS_EN = new Set(['how', 'many', 'which', 'what'])

const NUMBER_WORDS_ID = new Set([
  'nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan',
  'sembilan', 'sepuluh',
])
const QUESTION_WORDS_ID = new Set(['berapa', 'mana', 'apa', 'yang'])

// Matches either a word (letters/digits, Unicode-aware) or a single punctuation
// mark. Punctuation marks act as clause boundaries and are not emitted as tokens.
const TOKEN_RE = /[\p{L}\p{N}]+|[.,?!;:]/gu
const PUNCT_RE = /^[.,?!;:]$/

function classify(word: string, lang: 'en' | 'id'): BreakdownCategory {
  if (/^\d+$/.test(word)) return 'number'
  const lower = word.toLowerCase()
  if (lang === 'en') {
    if (NUMBER_WORDS_EN.has(lower)) return 'number'
    if (QUESTION_WORDS_EN.has(lower)) return 'question-word'
  } else {
    if (NUMBER_WORDS_ID.has(lower)) return 'number'
    if (QUESTION_WORDS_ID.has(lower)) return 'question-word'
  }
  return 'plain'
}

export function breakdownQuestion(text: string, lang: 'en' | 'id'): BreakdownClause[] {
  const clauses: BreakdownClause[] = []
  let current: BreakdownToken[] = []

  const flush = () => {
    if (current.length > 0) {
      clauses.push({ tokens: current })
      current = []
    }
  }

  for (const segment of parseWmiMarkup(text)) {
    if (segment.type === 'term') {
      current.push({ text: segment.text, category: 'glossary', slug: segment.slug })
      continue
    }
    for (const match of segment.text.matchAll(TOKEN_RE)) {
      const raw = match[0]
      if (PUNCT_RE.test(raw)) {
        flush()
        continue
      }
      current.push({ text: raw, category: classify(raw, lang) })
    }
  }

  flush()
  return clauses
}
