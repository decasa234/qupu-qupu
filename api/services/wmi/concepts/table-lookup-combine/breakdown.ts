import type { Breakdown, BreakdownHighlight } from '../types.js'
import { answer as computeAnswer, type Params } from './index.js'

// Authored decomposition of a table-lookup-combine problem: read two values out
// of a small table (apples, oranges), then either add them (sum) or take the
// difference (diff). The learner-facing part is a set of color-coded, clickable
// highlights over the problem text. Each phrase MUST be an exact substring of the
// DISPLAY body (after stripSectionLabels resolves the "Find:"/"Cari:" markers).
export function buildTableLookupCombineBreakdown(params: Params): Breakdown {
  const { apples, oranges, mode } = params
  const ans = computeAnswer(params)
  const op = mode === 'sum' ? '+' : '-'

  // The two table rows the learner must read: "apples = N" / "apel = N".
  const applesRow_en = `apples = ${apples}`
  const orangesRow_en = `oranges = ${oranges}`
  const applesRow_id = `apel = ${apples}`
  const orangesRow_id = `jeruk = ${oranges}`

  // The exact question phrase, per mode, matching the rendered body.
  const ask_en = mode === 'sum'
    ? 'How many apples and oranges are there altogether?'
    : 'How many more apples than oranges are there?'
  const ask_id = mode === 'sum'
    ? 'Berapa jumlah apel dan jeruk?'
    : 'Berapa selisih apel dan jeruk?'

  const highlights: BreakdownHighlight[] = [
    // condition — which two rows of the table to read
    {
      category: 'condition',
      phrase_en: applesRow_en,
      phrase_id: applesRow_id,
      note_en: `Read the apples row: ${apples}.`,
      note_id: `Baca baris apel: ${apples}.`,
    },
    {
      category: 'condition',
      phrase_en: orangesRow_en,
      phrase_id: orangesRow_id,
      note_en: `Read the oranges row: ${oranges}.`,
      note_id: `Baca baris jeruk: ${oranges}.`,
    },
    // question — the combined value the problem asks for
    {
      category: 'question',
      phrase_en: ask_en,
      phrase_id: ask_id,
      note_en: mode === 'sum'
        ? `Add the two numbers: ${apples} + ${oranges} = ${ans}.`
        : `Subtract the smaller from the larger: ${apples} - ${oranges} = ${ans}.`,
      note_id: mode === 'sum'
        ? `Jumlahkan kedua angka: ${apples} + ${oranges} = ${ans}.`
        : `Kurangkan yang kecil dari yang besar: ${apples} - ${oranges} = ${ans}.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Apples', label_id: 'Apel', value: String(apples) },
      { label_en: 'Oranges', label_id: 'Jeruk', value: String(oranges) },
      { label_en: 'Operation', label_id: 'Operasi', value: op },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(ans) },
    ],

    strategy: {
      conceptSlug: 'table-lookup-combine',
      name_en: 'look up then add',
      name_id: 'baca tabel lalu jumlahkan',
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
