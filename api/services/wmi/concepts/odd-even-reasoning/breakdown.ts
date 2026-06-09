import type { Breakdown, BreakdownHighlight } from '../types.js'
import { type Params } from './index.js'

const LABELS = ['A', 'B', 'C', 'D'] as const

const parity_en = (n: number) => (n % 2 === 1 ? 'odd' : 'even')

// Authored decomposition of an odd-even-reasoning problem: four addition
// expressions are shown and the learner picks the one whose SUM is odd. A sum is
// odd only when one addend is odd and the other is even. The learner-facing part
// is a set of color-coded, clickable highlights over the DISPLAY body (after the
// "Find:"/"Cari:" section label is stripped). The addends live in the choices,
// not the body, so the numbers/parities are carried in the notes + quantities.
// Each phrase MUST be a substring of the rendered display body.
export function buildOddEvenReasoningBreakdown(params: Params): Breakdown {
  const correctIdx = params.options.findIndex((p) => (p.x + p.y) % 2 === 1)
  const answerLabel = LABELS[correctIdx]
  const { x, y } = params.options[correctIdx]
  const optionList = params.options.map((p) => `${p.x} + ${p.y}`).join(', ')

  const highlights: BreakdownHighlight[] = [
    // fact — the four expressions you must inspect
    {
      category: 'fact',
      phrase_en: 'Four addition expressions',
      phrase_id: 'Empat ekspresi penjumlahan',
      note_en: 'There are 4 sums to check — look at the parity of each addend.',
      note_id: 'Ada 4 penjumlahan untuk diperiksa — lihat paritas tiap suku.',
    },
    // condition — the odd/even rule that decides the answer
    {
      category: 'condition',
      phrase_en: 'odd',
      phrase_id: 'ganjil',
      note_en: 'A sum is odd only when one addend is odd and the other is even.',
      note_id: 'Hasil ganjil hanya jika satu suku ganjil dan satu suku genap.',
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: 'Which expression gives an odd answer',
      phrase_id: 'Ekspresi mana yang hasilnya ganjil',
      note_en: `Pick the one with one odd + one even addend — that is ${answerLabel}.`,
      note_id: `Pilih yang punya satu suku ganjil + satu genap — yaitu ${answerLabel}.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Expressions', label_id: 'Ekspresi', value: optionList },
      { label_en: 'Rule', label_id: 'Aturan', value: 'odd + even = odd' },
      {
        label_en: 'Answer',
        label_id: 'Jawaban',
        value: `${answerLabel} (${x} ${parity_en(x)} + ${y} ${parity_en(y)} = odd)`,
      },
    ],

    strategy: {
      conceptSlug: 'odd-even-reasoning',
      name_en: 'Check each addend parity',
      name_id: 'Periksa paritas tiap suku',
    },

    trap: null,

    answer: {
      form: 'choice',
      unit: null,
      value: String(answerLabel),
    },

    vocab: [],
  }
}
