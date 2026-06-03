import { parseWmiMarkup } from './wmiMarkup'

export type BreakdownCategory = 'number' | 'question-word' | 'operator' | 'glossary' | 'plain'

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

// Matches a word (letters/digits, Unicode-aware), a math operator, or a single
// punctuation mark. Punctuation marks act as clause boundaries and are not
// emitted as tokens; operators ARE emitted so equations stay intact.
const TOKEN_RE = /[\p{L}\p{N}]+|[+\-−×÷*/=]|[.,?!;]/gu
const PUNCT_RE = /^[.,?!;]$/
const OPERATOR_RE = /^[+\-−×÷*/=]$/

function classify(word: string, lang: 'en' | 'id'): BreakdownCategory {
  if (OPERATOR_RE.test(word)) return 'operator'
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

export type SectionKind =
  | 'start'
  | 'mystery'
  | 'add'
  | 'take-away'
  | 'give'
  | 'compare'
  | 'clue'
  | 'share'
  | 'now'
  | 'find'
  | 'extra'
  | 'example'
  | 'plain'

export interface BreakdownSection {
  kind: SectionKind
  label?: string
  clauses: BreakdownClause[]
}

// Maps a leading label word (before a ':') to a section kind, both languages.
const SECTION_LABELS: Record<string, SectionKind> = {
  start: 'start',
  mulai: 'start',
  mystery: 'mystery',
  misteri: 'mystery',
  add: 'add',
  tambah: 'add',
  takeaway: 'take-away',
  ambil: 'take-away',
  kurang: 'take-away',
  give: 'give',
  beri: 'give',
  memberi: 'give',
  compare: 'compare',
  bandingkan: 'compare',
  banding: 'compare',
  clue: 'clue',
  petunjuk: 'clue',
  share: 'share',
  bagi: 'share',
  membagi: 'share',
  now: 'now',
  sekarang: 'now',
  find: 'find',
  cari: 'find',
  extra: 'extra',
  tambahan: 'extra',
  example: 'example',
  contoh: 'example',
}

function toSection(kind: SectionKind, label: string | undefined, body: string, lang: 'en' | 'id'): BreakdownSection | null {
  const clauses = breakdownQuestion(body, lang)
  if (clauses.length === 0) return null
  return { kind, label, clauses }
}

// Splits a question into color-codeable sections. Prefers explicit "Label:"
// markers (story/example/condition/question in en+id). When none are present it
// falls back to sentence grouping: sentences ending in '?' become the question,
// everything before becomes story.
export function segmentSections(text: string, lang: 'en' | 'id'): BreakdownSection[] {
  const hasLabels = Array.from(text.matchAll(/([\p{L}]+)\s*:/gu)).some(
    (m) => SECTION_LABELS[m[1].toLowerCase()],
  )

  if (hasLabels) {
    const sections: BreakdownSection[] = []
    // Split on every "Word:" marker, keeping the label word as the captured group.
    const parts = text.split(/([\p{L}]+)\s*:/u)
    // parts[0] is any text before the first label (preamble, no label).
    if (parts[0].trim()) {
      const s = toSection('start', undefined, parts[0], lang)
      if (s) sections.push(s)
    }
    for (let i = 1; i < parts.length; i += 2) {
      const labelWord = parts[i]
      const body = parts[i + 1] ?? ''
      const kind = SECTION_LABELS[labelWord.toLowerCase()] ?? 'plain'
      const s = toSection(kind, labelWord, body, lang)
      if (s) sections.push(s)
    }
    return sections
  }

  // Fallback: split into sentences, group question sentences vs the rest.
  const sentences = text.match(/[^.!?]+[.!?]?/g)?.map((s) => s.trim()).filter(Boolean) ?? []
  if (sentences.length <= 1) {
    const s = toSection('find', undefined, text, lang)
    return s ? [s] : []
  }
  const startText = sentences.filter((s) => !s.endsWith('?')).join(' ')
  const findText = sentences.filter((s) => s.endsWith('?')).join(' ')
  const sections: BreakdownSection[] = []
  const start = startText ? toSection('start', undefined, startText, lang) : null
  if (start) sections.push(start)
  const find = findText ? toSection('find', undefined, findText, lang) : null
  if (find) sections.push(find)
  // Edge case: no '?' anywhere — treat the whole thing as one question block.
  if (sections.length === 0) {
    const s = toSection('find', undefined, text, lang)
    return s ? [s] : []
  }
  return sections
}

// Removes known "Label:" section markers so the plain (non-breakdown) question
// reads naturally. Only strips recognized labels; unknown "Word:" is left intact.
export function stripSectionLabels(text: string): string {
  return text
    .replace(/([\p{L}]+)\s*:\s*/gu, (match, word: string) =>
      SECTION_LABELS[word.toLowerCase()] ? '' : match,
    )
    .replace(/\s{2,}/g, ' ')
    .trim()
}
