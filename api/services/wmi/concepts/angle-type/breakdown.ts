import type { Breakdown, BreakdownHighlight } from '../types.js'
import { categoryIndex, type Params } from './index.js'

const CAT_EN = ['acute', 'right', 'obtuse'] as const
const LABELS = ['A', 'B', 'C'] as const

// Authored decomposition of an angle-type problem: classify the angle in the
// figure as acute (< 90°), right (= 90°), or obtuse (> 90°). This is
// figure-heavy — the drawn angle carries the data, the degree value is NOT
// written in the stem — so we highlight only the words the kid actually sees.
// Display body (after stripSectionLabels strips "Find:"/"Cari:" and resolves
// [[angle-type|type]] → "type" / [[angle-type|jenis]] → "jenis"):
//   EN: "What type of angle is shown in the figure?"
//   ID: "Apa jenis sudut yang ditunjukkan pada gambar?"
// Each highlight phrase MUST be an exact substring of that display body. The
// classification rule (< / = / > 90°) is NOT in the stem, so it appears in the
// strategy/notes rather than as a condition highlight.
export function buildAngleTypeBreakdown(params: Params): Breakdown {
  const cat = categoryIndex(params.degrees)
  const catEN = CAT_EN[cat]
  const answerLabel = LABELS[cat]

  const ruleEN =
    cat === 0
      ? 'An angle smaller than 90° is acute.'
      : cat === 1
        ? 'An angle of exactly 90° is a right angle.'
        : 'An angle larger than 90° is obtuse.'
  const ruleID =
    cat === 0
      ? 'Sudut yang lebih kecil dari 90° disebut lancip.'
      : cat === 1
        ? 'Sudut yang tepat 90° disebut siku-siku.'
        : 'Sudut yang lebih besar dari 90° disebut tumpul.'

  const highlights: BreakdownHighlight[] = [
    // question — what to decide
    {
      category: 'question',
      phrase_en: 'What type of angle',
      phrase_id: 'Apa jenis sudut',
      note_en: `Acute, right, or obtuse? ${ruleEN}`,
      note_id: `Lancip, siku-siku, atau tumpul? ${ruleID}`,
    },
    // fact — the figure holds the angle you must read
    {
      category: 'fact',
      phrase_en: 'shown in the figure',
      phrase_id: 'ditunjukkan pada gambar',
      note_en: 'The angle in the picture is the one to classify.',
      note_id: 'Sudut pada gambar itulah yang harus dikenali.',
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      { label_en: 'Angle in figure', label_id: 'Sudut pada gambar', value: `${params.degrees}°` },
      { label_en: 'Compare to', label_id: 'Bandingkan dengan', value: '90°' },
      { label_en: 'Type', label_id: 'Jenis', value: catEN },
      { label_en: 'Answer (choice)', label_id: 'Jawaban (pilihan)', value: answerLabel },
    ],

    strategy: {
      conceptSlug: 'angle-type',
      name_en: 'compare to 90°',
      name_id: 'bandingkan dengan 90°',
    },

    // No single stable tempting wrong answer: with three close categories the
    // common slip is just an eyeball miss, and which wrong type tempts depends on
    // the drawn degrees, so there is no one fixed trap value.
    trap: null,

    answer: {
      form: 'choice',
      unit: null,
      value: answerLabel,
    },

    vocab: [],
  }
}
