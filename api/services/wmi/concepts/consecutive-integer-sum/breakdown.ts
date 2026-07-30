import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import { answerLabel, middleValue, optionValues, sumOf, type Params } from './index.js'

// Authored decomposition of a consecutive-integer-sum problem: n consecutive
// whole numbers add up to a given sum; pick the smallest (or the largest) of
// them from four options. The learner-facing part is a set of color-coded,
// clickable highlights over the problem text — each phrase MUST be a substring
// of the rendered body in that language.
//
// Display body (after stripSectionLabels drops "Find:" / "Cari:"):
//   EN: "The sum of 5 consecutive whole numbers is 50. What is the smallest of
//        these numbers?"
//   ID: "Jumlah 5 bilangan bulat berurutan adalah 50. Berapakah bilangan
//        terkecil di antara bilangan-bilangan ini?"
export function buildConsecutiveSumBreakdown(params: Params): Breakdown {
  const { n, ask } = params
  const sum = sumOf(params)
  const middle = middleValue(params)
  const label = answerLabel(params)
  const isOdd = n % 2 === 1
  const askedEn = ask === 'smallest' ? 'smallest' : 'largest'
  const askedId = ask === 'smallest' ? 'terkecil' : 'terbesar'

  const highlights: BreakdownHighlight[] = [
    {
      category: 'fact',
      phrase_en: String(sum),
      phrase_id: String(sum),
      note_en: `The total of all ${n} numbers added together is ${sum}.`,
      note_id: `Total dari semua ${n} bilangan yang dijumlahkan adalah ${sum}.`,
    },
    {
      category: 'condition',
      phrase_en: `${n} consecutive`,
      phrase_id: `${n} bilangan bulat berurutan`,
      note_en: `The numbers must be ${n} in a row, each one more than the last — so they balance around their middle.`,
      note_id: `Bilangan-bilangan itu harus ${n} berurutan, masing-masing satu lebih besar dari sebelumnya — jadi setimbang di sekitar bilangan tengahnya.`,
    },
    {
      category: 'question',
      phrase_en: askedEn,
      phrase_id: askedId,
      note_en:
        ask === 'smallest'
          ? 'Find the first (smallest) number in the run — not the middle, and not the last one.'
          : 'Find the last (largest) number in the run — not the middle, and not the first one.',
      note_id:
        ask === 'smallest'
          ? 'Cari bilangan pertama (terkecil) dalam deret — bukan bilangan tengahnya, bukan pula yang terakhir.'
          : 'Cari bilangan terakhir (terbesar) dalam deret — bukan bilangan tengahnya, bukan pula yang pertama.',
    },
  ]

  const quantities: BreakdownQuantity[] = [
    { label_en: 'Count', label_id: 'Banyak bilangan', value: String(n) },
    { label_en: 'Sum', label_id: 'Jumlah', value: String(sum) },
    {
      label_en: isOdd ? 'Middle' : 'Two middles',
      label_id: isOdd ? 'Bilangan tengah' : 'Dua bilangan tengah',
      value: isOdd ? String(middle) : `${middle}, ${middle + 1}`,
    },
    { label_en: 'Options', label_id: 'Pilihan', value: optionValues(params).join(', ') },
    { label_en: 'Answer', label_id: 'Jawaban', value: label },
  ]

  // The trap: dividing the sum by the count lands on the MIDDLE of the run, not
  // on either end. For an even-length run the division is not even whole — the
  // rounded-down value is still just a middle number.
  const wholePart = Math.floor(sum / n)
  const trapWhyEn = isOdd
    ? `${sum} ÷ ${n} = ${middle} is the middle number, not the ${askedEn}.`
    : `${sum} ÷ ${n} = ${wholePart}.5, and ${wholePart} is only a middle number, not the ${askedEn}.`
  const trapWhyId = isOdd
    ? `${sum} ÷ ${n} = ${middle} adalah bilangan tengah, bukan yang ${askedId}.`
    : `${sum} ÷ ${n} = ${wholePart},5, dan ${wholePart} itu cuma bilangan tengah, bukan yang ${askedId}.`

  return {
    needsVisual: false,
    highlights,
    quantities,

    strategy: {
      conceptSlug: 'consecutive-integer-sum',
      name_en: 'Balance on the middle, then step out',
      name_id: 'Setimbang di tengah, lalu melangkah keluar',
    },

    trap: {
      wrong: String(middle),
      why_en: trapWhyEn,
      why_id: trapWhyId,
    },

    answer: {
      form: 'choice',
      unit: null,
      value: label,
    },

    vocab: [],
  }
}
