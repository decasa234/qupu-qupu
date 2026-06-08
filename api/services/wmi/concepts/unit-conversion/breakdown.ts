import type { Breakdown, BreakdownHighlight } from '../types.js'
import { answerValue, type Params } from './index.js'

// Per-mode display strings, mirrored from the UNITS table in index.ts so the
// breakdown phrases stay exact substrings of the rendered body.
const UNIT_LABELS = {
  'm-cm': { factor: 100, bigEn: 'm', smallEn: 'cm', bigId: 'm', smallId: 'cm' },
  'kg-g': { factor: 1000, bigEn: 'kg', smallEn: 'g', bigId: 'kg', smallId: 'g' },
  'dollar-cent': { factor: 100, bigEn: 'dollars', smallEn: 'cents', bigId: 'dolar', smallId: 'sen' },
} as const

// Authored decomposition of a unit-conversion problem: rewrite a combined
// measure (big unit + leftover small unit) as a single count of the smaller
// unit. Each phrase MUST be an exact substring of the DISPLAY body (the rendered
// body after section labels like "Find:"/"Cari:" are stripped).
export function buildUnitConversionBreakdown(params: Params): Breakdown {
  const u = UNIT_LABELS[params.mode]
  const ans = answerValue(params)
  const bigPart = params.big * u.factor

  const highlights: BreakdownHighlight[] = [
    // condition — the conversion rate to lean on
    {
      category: 'condition',
      phrase_en: `1 ${u.bigEn} = ${u.factor} ${u.smallEn}`,
      phrase_id: `1 ${u.bigId} = ${u.factor} ${u.smallId}`,
      note_en: `The rule that links the units: one ${u.bigEn} is ${u.factor} ${u.smallEn}.`,
      note_id: `Aturan yang menghubungkan satuan: satu ${u.bigId} sama dengan ${u.factor} ${u.smallId}.`,
    },
    // fact — the amount you start with, in both units
    {
      category: 'fact',
      phrase_en: `${params.big} ${u.bigEn} and ${params.small} ${u.smallEn}`,
      phrase_id: `${params.big} ${u.bigId} dan ${params.small} ${u.smallId}`,
      note_en: `What you have: ${params.big} ${u.bigEn} plus an extra ${params.small} ${u.smallEn}.`,
      note_id: `Yang kamu punya: ${params.big} ${u.bigId} ditambah sisa ${params.small} ${u.smallId}.`,
    },
    // question — what to find, in the smaller unit
    {
      category: 'question',
      phrase_en: `How many ${u.smallEn}`,
      phrase_id: `Berapa ${u.smallId}`,
      note_en: `Give the answer as one number of ${u.smallEn}.`,
      note_id: `Berikan jawaban sebagai satu angka dalam ${u.smallId}.`,
    },
  ]

  // Trap: treating the two numbers as a plain sum (multiplying the big unit by
  // the factor is the step kids skip), e.g. 5 + 30 = 35 instead of 530.
  const naiveSum = params.big + params.small

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: `Big amount (${u.bigEn})`, label_id: `Jumlah besar (${u.bigId})`, value: String(params.big) },
      { label_en: `Leftover (${u.smallEn})`, label_id: `Sisa (${u.smallId})`, value: String(params.small) },
      { label_en: 'Rate', label_id: 'Nilai tukar', value: `1 ${u.bigEn} = ${u.factor} ${u.smallEn}` },
      { label_en: `Converted (${u.smallEn})`, label_id: `Hasil ubah (${u.smallId})`, value: String(bigPart) },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(ans) },
    ],

    strategy: {
      conceptSlug: 'unit-conversion',
      name_en: 'Multiply by the rate, then add the leftover',
      name_id: 'Kalikan dengan nilai tukar, lalu tambahkan sisa',
    },

    trap: {
      wrong: String(naiveSum),
      why_en: `${params.big} + ${params.small} = ${naiveSum} just adds the numbers; first convert the ${u.bigEn} (${params.big} × ${u.factor} = ${bigPart}).`,
      why_id: `${params.big} + ${params.small} = ${naiveSum} hanya menjumlahkan angkanya; ubah dulu ${u.bigId}-nya (${params.big} × ${u.factor} = ${bigPart}).`,
    },

    answer: {
      form: 'number',
      unit: u.smallEn,
      value: String(ans),
    },

    vocab: [],
  }
}
