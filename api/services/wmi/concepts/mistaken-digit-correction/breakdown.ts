import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'

// Authored decomposition of a mistaken-digit-correction problem: someone misread
// one digit of an addend (reading the larger ${wrong} in place of the real
// ${right}), so the sum they wrote is too big. Undo the overshoot to recover the
// correct sum. The learner-facing part is a set of color-coded, clickable
// highlights over the problem text. Each phrase MUST be an exact substring of the
// DISPLAY body (after stripSectionLabels removes the "Find:" / "Cari:" marker).
export function buildMistakenDigitCorrectionBreakdown(params: Params): Breakdown {
  const placeValue = params.place === 'units' ? 1 : 10
  const placeWord_en = params.place // 'units' | 'tens'
  const placeWord_id = params.place === 'units' ? 'satuan' : 'puluhan'
  const delta = (params.wrong - params.right) * placeValue
  const got = params.correct + delta

  const highlights: BreakdownHighlight[] = [
    // fact — the wrong digit that was read
    {
      category: 'fact',
      phrase_en: `as ${params.wrong}`,
      phrase_id: `menjadi ${params.wrong}`,
      note_en: `${params.wrong} is the digit she read by mistake — it is too big.`,
      note_id: `${params.wrong} adalah angka yang terbaca salah — terlalu besar.`,
    },
    // fact — the digit it should have been
    {
      category: 'fact',
      phrase_en: `instead of ${params.right}`,
      phrase_id: `bukan ${params.right}`,
      note_en: `The real digit there is ${params.right}.`,
      note_id: `Angka yang benar di situ adalah ${params.right}.`,
    },
    // fact — the (too big) sum she actually wrote
    {
      category: 'fact',
      phrase_en: `${got}`,
      phrase_id: `${got}`,
      note_en: `${got} is the sum she got — but it came from the wrong digit, so it is too big.`,
      note_id: `${got} adalah hasil yang ia peroleh — tetapi dari angka yang salah, jadi terlalu besar.`,
    },
    // condition — the mistake that made the sum wrong
    {
      category: 'condition',
      phrase_en: `misread the ${placeWord_en} digit`,
      phrase_id: `salah membaca angka ${placeWord_id}`,
      note_en: `Reading the ${placeWord_en} digit wrong adds (${params.wrong} − ${params.right}) × ${placeValue} = ${delta} too much.`,
      note_id: `Salah baca angka ${placeWord_id} menambah (${params.wrong} − ${params.right}) × ${placeValue} = ${delta} berlebih.`,
    },
    // question — the correct sum to find
    {
      category: 'question',
      phrase_en: 'What should the correct sum be?',
      phrase_id: 'Berapakah hasil yang seharusnya?',
      note_en: `Take ${delta} back off the sum: ${got} − ${delta} = ${params.correct}.`,
      note_id: `Kurangi kelebihan ${delta} dari hasil: ${got} − ${delta} = ${params.correct}.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Misread digit', label_id: 'Angka salah baca', value: String(params.wrong) },
      { label_en: 'Real digit', label_id: 'Angka benar', value: String(params.right) },
      {
        label_en: 'Place',
        label_id: 'Nilai tempat',
        value: `${placeWord_en} (×${placeValue})`,
      },
      { label_en: 'Overshoot', label_id: 'Kelebihan', value: String(delta) },
      { label_en: 'Sum she got', label_id: 'Hasil diperoleh', value: String(got) },
      { label_en: 'Correct sum', label_id: 'Hasil benar', value: String(params.correct) },
    ],

    strategy: {
      conceptSlug: 'mistaken-digit-correction',
      name_en: 'Undo the misread overshoot',
      name_id: 'Kembalikan kelebihan salah baca',
    },

    // Tempting wrong answer: leaving the sum as-is, forgetting it is too big.
    trap: {
      wrong: String(got),
      why_en: `${got} is the sum from the wrong digit — it is ${delta} too big and still needs fixing.`,
      why_id: `${got} adalah hasil dari angka yang salah — masih kelebihan ${delta} dan harus diperbaiki.`,
    },

    answer: {
      form: 'number',
      unit: null,
      value: String(params.correct),
    },

    vocab: [],
  }
}
