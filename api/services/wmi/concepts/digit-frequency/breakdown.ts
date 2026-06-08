import type { Breakdown, BreakdownHighlight } from '../types.js'
import { countDigit, type Params } from './index.js'

// Authored decomposition of a digit-frequency problem: write every whole number
// in a range, then count how many times one digit appears across all of them.
// The learner-facing part is a set of color-coded, clickable highlights over the
// problem text. Each phrase MUST be a substring of the DISPLAY body (the body
// after section labels like "Find:" / "Cari:" are stripped) in that language.
export function buildDigitFrequencyBreakdown(params: Params): Breakdown {
  const { a, b, d } = params
  const answer = countDigit(a, b, d)

  const highlights: BreakdownHighlight[] = [
    // facts — the start and end of the range you must write out
    {
      category: 'fact',
      phrase_en: `from ${a} to ${b}`,
      phrase_id: `dari ${a} sampai ${b}`,
      note_en: `Write every number starting at ${a} and ending at ${b}.`,
      note_id: `Tulis setiap bilangan mulai dari ${a} sampai ${b}.`,
    },
    // condition — which single digit we are hunting for
    {
      category: 'condition',
      phrase_en: `the digit ${d}`,
      phrase_id: `angka ${d}`,
      note_en: `Look only for the digit ${d} in each number.`,
      note_id: `Cari hanya angka ${d} di setiap bilangan.`,
    },
    // question — what to count, and that it is the grand total
    {
      category: 'question',
      phrase_en: 'How many times',
      phrase_id: 'Berapa kali',
      note_en: `Count every spot the digit ${d} shows up.`,
      note_id: `Hitung setiap tempat angka ${d} muncul.`,
    },
    {
      category: 'question',
      phrase_en: 'in total',
      phrase_id: 'seluruhnya',
      note_en: 'Add up every appearance, even two in one number.',
      note_id: 'Jumlahkan semua kemunculan, walau dua kali dalam satu bilangan.',
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Range', label_id: 'Rentang', value: `${a}-${b}` },
      { label_en: 'Digit', label_id: 'Angka', value: String(d) },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(answer) },
    ],

    strategy: {
      conceptSlug: 'digit-frequency',
      name_en: 'Tally each place',
      name_id: 'Catat tiap tempat',
    },

    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(answer),
    },

    vocab: [],
  }
}
