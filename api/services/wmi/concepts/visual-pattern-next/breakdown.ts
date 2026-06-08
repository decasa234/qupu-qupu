import type { Breakdown, BreakdownHighlight } from '../types.js'
import { answer, type Params } from './index.js'

const ICON: Record<string, string> = { circle: '○', triangle: '△', square: '□', star: '☆' }
const LABELS = ['A', 'B', 'C', 'D'] as const
const OPTS = ['circle', 'triangle', 'square', 'star'] as const

// Authored decomposition of a visual-pattern-next problem: a row of shapes
// repeats a short cycle (e.g. ○ △ ○ △ ○) and ends in "?" — pick the picture that
// comes next. Figure-heavy: the shapes ARE the stem, so the highlights spotlight
// the repeating rule (the cycle), the empty spot "?", and the question words.
//
// Display body (after stripSectionLabels removes "Find:" / "Cari:"; no glossary
// markup to resolve), e.g. cycle ○ △, shown 5:
//   EN: "○ △ ○ △ ○ ?\nWhich picture comes next?"
//   ID: "○ △ ○ △ ○ ?\nGambar apa berikutnya?"
// Each highlight phrase MUST be an exact substring of that display body.
export function buildVisualPatternNextBreakdown(params: Params): Breakdown {
  // The repeating rule: the cycle icons in order, joined by spaces — this exact
  // run is always the start of the row (shown >= cycle length), so it is a
  // substring of the body in both languages.
  const cycleIcons = params.cycle.map((s) => ICON[s]).join(' ')
  const ansSlug = answer(params)
  const label = LABELS[OPTS.indexOf(ansSlug as (typeof OPTS)[number])]

  const highlights: BreakdownHighlight[] = [
    // condition — the repeating rule the kid must spot
    {
      category: 'condition',
      phrase_en: cycleIcons,
      phrase_id: cycleIcons,
      note_en: `These ${params.cycle.length} pictures repeat over and over.`,
      note_id: `${params.cycle.length} gambar ini berulang terus-menerus.`,
    },
    // fact — the empty spot to fill
    {
      category: 'fact',
      phrase_en: '?',
      phrase_id: '?',
      note_en: 'The "?" is the empty spot you must fill.',
      note_id: 'Tanda "?" adalah tempat kosong yang harus kamu isi.',
    },
    // question — which picture comes next
    {
      category: 'question',
      phrase_en: 'Which picture comes next',
      phrase_id: 'Gambar apa berikutnya',
      note_en: 'Keep the cycle going to find the next picture.',
      note_id: 'Lanjutkan polanya untuk menemukan gambar berikutnya.',
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Cycle', label_id: 'Pola', value: cycleIcons },
      { label_en: 'Pictures shown', label_id: 'Gambar tampil', value: String(params.shown) },
      { label_en: 'Answer', label_id: 'Jawaban', value: label },
    ],

    strategy: {
      conceptSlug: 'visual-pattern-next',
      name_en: 'find the repeat',
      name_id: 'temukan pola berulang',
    },

    trap: null,

    answer: {
      form: 'choice',
      unit: null,
      value: String(label),
    },

    vocab: [],
  }
}
