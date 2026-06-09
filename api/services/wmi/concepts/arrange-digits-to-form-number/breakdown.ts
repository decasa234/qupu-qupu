import type { Breakdown, BreakdownHighlight } from '../types.js'
import { numbers, type Params } from './index.js'

// Authored decomposition of an arrange-digits-to-form-number problem: from the
// given digits build every 2-digit number with no repeated digit, sort them, and
// read off the number at the asked rank (the Nth smallest). The learner-facing
// part is a set of color-coded, clickable highlights over the problem text. Each
// phrase MUST be an exact substring of the DISPLAY body (after stripSectionLabels
// removes "Find:" / "Cari:"). Built parametrically from `params`.
export function buildArrangeDigitsToFormNumberBreakdown(params: Params): Breakdown {
  const list = numbers(params)
  const ans = list[params.rank - 1]
  const digits = params.digits.join(', ')
  // Ordinal matches render(): 2nd / 3rd / 4th / 5th ...
  const ord = `${params.rank}${params.rank === 2 ? 'nd' : params.rank === 3 ? 'rd' : 'th'}`

  const highlights: BreakdownHighlight[] = [
    // fact — the digits you are given to work with
    {
      category: 'fact',
      phrase_en: digits,
      phrase_id: digits,
      note_en: `These are the only digits you may use: ${digits}.`,
      note_id: `Hanya angka ini yang boleh dipakai: ${digits}.`,
    },
    // condition — the rules: 2-digit numbers, no repeats
    {
      category: 'condition',
      phrase_en: '2-digit numbers',
      phrase_id: 'bilangan 2 angka',
      note_en: 'Each number you build must have exactly two digits.',
      note_id: 'Setiap bilangan yang dibuat harus terdiri dari dua angka.',
    },
    {
      category: 'condition',
      phrase_en: 'without repeating a digit',
      phrase_id: 'tanpa mengulang angka',
      note_en: 'The two digits in each number must be different.',
      note_id: 'Dua angka dalam setiap bilangan harus berbeda.',
    },
    // question — the rank to read off after sorting
    {
      category: 'question',
      phrase_en: `${ord} smallest`,
      phrase_id: `terkecil ke-${params.rank}`,
      note_en: `Sort all the numbers, then count to position ${params.rank} from the smallest.`,
      note_id: `Urutkan semua bilangan, lalu hitung sampai urutan ke-${params.rank} dari yang terkecil.`,
    },
  ]

  return {
    // No illustration registered for this slug in the frontend ILLUSTRATIONS
    // registry (src/components/wmi/concepts/registry.ts), so no in-card visual.
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Digits', label_id: 'Angka', value: digits },
      { label_en: 'Rank', label_id: 'Urutan', value: String(params.rank) },
      { label_en: 'Sorted list', label_id: 'Daftar urut', value: list.join(', ') },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(ans) },
    ],

    strategy: {
      conceptSlug: 'arrange-digits-to-form-number',
      name_en: 'biggest digits first',
      name_id: 'angka terbesar dulu',
    },

    // Tempting wrong answer: stopping at the rank-th number without sorting, or
    // reading the rank-th LARGEST instead of smallest. The largest is a common
    // slip for "make the biggest number" thinking.
    trap:
      list.length >= params.rank
        ? {
            wrong: String(list[list.length - params.rank]),
            why_en: `${list[list.length - params.rank]} is the ${ord} LARGEST, but we want the ${ord} smallest.`,
            why_id: `${list[list.length - params.rank]} adalah terbesar ke-${params.rank}, padahal kita mencari terkecil ke-${params.rank}.`,
          }
        : null,

    answer: {
      form: 'number',
      unit: null,
      value: String(ans),
    },

    vocab: [],
  }
}
