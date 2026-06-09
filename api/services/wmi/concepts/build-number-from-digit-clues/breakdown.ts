import type { Breakdown, BreakdownHighlight } from '../types.js'
import { targetNumber, type Params } from './index.js'

// Authored decomposition of a build-number-from-digit-clues problem: the clues
// fix each digit by place value, you build the two-digit number, then count k
// up or down to find the answer. The learner-facing part is a set of
// color-coded, clickable highlights over the problem text — each phrase MUST be
// a substring of the rendered (display) body in that language.
export function buildBuildNumberFromDigitCluesBreakdown(params: Params): Breakdown {
  const built = 10 * params.tens + params.units
  const ans = targetNumber(params)
  const word = params.dir === 'more' ? 'more than' : 'less than'
  const wordId = params.dir === 'more' ? 'lebih dari' : 'kurang dari'
  const dirEn = params.dir === 'more' ? 'up' : 'down'
  const dirId = params.dir === 'more' ? 'naik' : 'turun'
  const sign = params.dir === 'more' ? '+' : '−'

  const highlights: BreakdownHighlight[] = [
    {
      category: 'condition',
      phrase_en: `${params.tens} in the tens place`,
      phrase_id: `${params.tens} pada tempat puluhan`,
      note_en: `The tens digit is ${params.tens}, so it is worth ${params.tens * 10}.`,
      note_id: `Angka puluhannya ${params.tens}, jadi nilainya ${params.tens * 10}.`,
    },
    {
      category: 'condition',
      phrase_en: `${params.units} in the ones place`,
      phrase_id: `${params.units} pada tempat satuan`,
      note_en: `The ones digit is ${params.units}, so the number is ${built}.`,
      note_id: `Angka satuannya ${params.units}, jadi bilangannya ${built}.`,
    },
    {
      category: 'condition',
      phrase_en: `${params.k} ${word} it`,
      phrase_id: `${params.k} ${wordId} bilangan itu`,
      note_en: `Count ${params.k} ${dirEn} from ${built}.`,
      note_id: `Hitung ${params.k} ${dirId} dari ${built}.`,
    },
    {
      category: 'question',
      phrase_en: 'Which number is',
      phrase_id: 'Bilangan manakah yang',
      note_en: 'Find the number the clues point to.',
      note_id: 'Cari bilangan yang ditunjuk petunjuk itu.',
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Tens digit', label_id: 'Angka puluhan', value: String(params.tens) },
      { label_en: 'Ones digit', label_id: 'Angka satuan', value: String(params.units) },
      { label_en: 'Built number', label_id: 'Bilangan terbentuk', value: String(built) },
      { label_en: 'Step', label_id: 'Langkah', value: `${sign}${params.k}` },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(ans) },
    ],

    strategy: {
      conceptSlug: 'build-number-from-digit-clues',
      name_en: 'place each digit',
      name_id: 'tempatkan tiap angka',
    },

    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(ans),
    },

    vocab: [],
  }
}
