import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import { answerLabel, equationTotals, optionValues, type Params } from './index.js'

// Authored decomposition of a solve-symbol-equations problem. The two equations
// are DRAWN by the illustration; the stem restates them in words (no ★ / ●
// glyphs), and the highlights spotlight the three things a child must separate:
//
//   condition — every star shares ONE value (that is why the first total can be
//               shared out evenly at all);
//   fact      — the two equations themselves;
//   question  — the circle, not the star.
//
// Display body (after stripSectionLabels drops "Find:" / "Cari:" and the blank
// lines collapse), for s=4, c=5, n=3:
//   EN: "Every star is worth the same, and every circle is worth the same.
//        3 stars add up to 12. One star and one circle add up to 9. What is the
//        value of one circle?"
//   ID: "Setiap bintang bernilai sama, dan setiap lingkaran bernilai sama.
//        3 bintang berjumlah 12. Satu bintang dan satu lingkaran berjumlah 9.
//        Berapa nilai satu lingkaran?"
// Every phrase below is assembled from the same pieces as the body, so each is
// an exact substring of the rendered text in its language.
export function buildSymbolBreakdown(params: Params): Breakdown {
  const { s, c, n } = params
  const { total1, total2 } = equationTotals(params)
  const label = answerLabel(params)

  const highlights: BreakdownHighlight[] = [
    {
      category: 'condition',
      phrase_en: 'Every star is worth the same',
      phrase_id: 'Setiap bintang bernilai sama',
      note_en: `All the stars share one value, so ${total1} can be shared out evenly between the ${n} of them.`,
      note_id: `Semua bintang nilainya satu angka yang sama, jadi ${total1} bisa dibagi rata ke ${n} bintang.`,
    },
    {
      category: 'fact',
      phrase_en: `${n} stars add up to ${total1}`,
      phrase_id: `${n} bintang berjumlah ${total1}`,
      note_en: 'This equation has only stars in it — start here, because it can be solved on its own.',
      note_id: 'Persamaan ini isinya bintang saja — mulai dari sini, karena bisa diselesaikan sendiri.',
    },
    {
      category: 'fact',
      phrase_en: `One star and one circle add up to ${total2}`,
      phrase_id: `Satu bintang dan satu lingkaran berjumlah ${total2}`,
      note_en: `Once you know the star, take it out of ${total2} and the circle is what is left.`,
      note_id: `Setelah nilai bintang ketemu, keluarkan dari ${total2} — sisanya nilai lingkaran.`,
    },
    {
      category: 'question',
      phrase_en: 'value of one circle',
      phrase_id: 'nilai satu lingkaran',
      note_en: 'The circle is the one being asked for, not the star.',
      note_id: 'Yang ditanya lingkaran, bukan bintang.',
    },
  ]

  const quantities: BreakdownQuantity[] = [
    { label_en: 'Stars in the first equation', label_id: 'Bintang di persamaan pertama', value: String(n) },
    { label_en: 'First equation total', label_id: 'Total persamaan pertama', value: String(total1) },
    { label_en: 'One star', label_id: 'Satu bintang', value: String(s) },
    { label_en: 'Second equation total', label_id: 'Total persamaan kedua', value: String(total2) },
    { label_en: 'One circle', label_id: 'Satu lingkaran', value: String(c) },
    { label_en: 'Options', label_id: 'Pilihan', value: optionValues(params).join(', ') },
    { label_en: 'Answer', label_id: 'Jawaban', value: label },
  ]

  return {
    needsVisual: true,
    highlights,
    quantities,

    strategy: {
      conceptSlug: 'solve-symbol-equations',
      name_en: 'Pin one symbol, then carry it across',
      name_id: 'Kunci satu lambang, lalu bawa ke persamaan kedua',
    },

    // The real temptation on this question type: the first equation is the easy
    // one, so its answer feels like THE answer.
    trap: {
      wrong: String(s),
      why_en: `${total1} ÷ ${n} = ${s} is what a STAR is worth, not a circle — stopping there answers the wrong symbol.`,
      why_id: `${total1} ÷ ${n} = ${s} itu nilai BINTANG, bukan lingkaran — berhenti di situ berarti menjawab lambang yang salah.`,
    },

    answer: {
      form: 'choice',
      unit: null,
      value: label,
    },

    vocab: [],
  }
}
