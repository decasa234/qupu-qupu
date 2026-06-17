import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'
import { FIND_SUM_PRODUCTS, COUNT_PAIRS_PRODUCTS } from './constants.js'

// Authored decomposition of a combination-product-sum problem. Three modes:
//   'find-larger'  — given sum+product of two small numbers, find the larger.
//   'find-sum'     — given product of two 2-digit numbers, find their sum.
//   'count-pairs'  — count all unordered pairs (a<b) with a×b = N.
export function buildCombinationProductSumBreakdown(params: Params): Breakdown {
  if (params.mode === 'find-larger') {
    const sum = params.x + params.y
    const product = params.x * params.y
    const larger = params.y
    const smaller = params.x

    const highlights: BreakdownHighlight[] = [
      {
        category: 'fact',
        phrase_en: `sum of ${sum}`,
        phrase_id: `jumlah ${sum}`,
        note_en: `Added together the two numbers make ${sum}.`,
        note_id: `Bila dijumlahkan, kedua bilangan menjadi ${sum}.`,
      },
      {
        category: 'fact',
        phrase_en: `product of ${product}`,
        phrase_id: `hasil kali ${product}`,
        note_en: `Multiplied together they make ${product}.`,
        note_id: `Bila dikalikan, hasilnya ${product}.`,
      },
      {
        category: 'condition',
        phrase_en: 'Two whole numbers',
        phrase_id: 'Dua bilangan bulat',
        note_en: `One pair must hit both: it sums to ${sum} and multiplies to ${product}.`,
        note_id: `Satu pasangan harus memenuhi keduanya: berjumlah ${sum} dan hasil kalinya ${product}.`,
      },
      {
        category: 'question',
        phrase_en: 'the larger of the two numbers',
        phrase_id: 'lebih besar',
        note_en: `Once you find the pair, answer with the bigger one (${larger}).`,
        note_id: `Setelah pasangannya ketemu, jawab dengan yang lebih besar (${larger}).`,
      },
    ]

    return {
      needsVisual: false,
      highlights,
      quantities: [
        { label_en: 'Sum', label_id: 'Jumlah', value: String(sum) },
        { label_en: 'Product', label_id: 'Hasil kali', value: String(product) },
        { label_en: 'Pair', label_id: 'Pasangan', value: `${smaller}, ${larger}` },
        { label_en: 'Answer', label_id: 'Jawaban', value: String(larger) },
      ],
      strategy: {
        conceptSlug: 'combination-product-sum',
        name_en: 'List sum pairs, check product',
        name_id: 'Daftar pasangan berjumlah, cek hasil kali',
      },
      trap: null,
      answer: {
        form: 'number',
        unit: null,
        value: String(larger),
      },
      vocab: [],
    }
  }

  if (params.mode === 'find-sum') {
    const entry = FIND_SUM_PRODUCTS[params.idx]
    const { a, b, product, sum } = entry

    const highlights: BreakdownHighlight[] = [
      {
        category: 'fact',
        phrase_en: `product of ${product}`,
        phrase_id: `hasil kali ${product}`,
        note_en: `The two 2-digit numbers multiply to ${product}.`,
        note_id: `Dua bilangan dua angka itu dikalikan menghasilkan ${product}.`,
      },
      {
        category: 'condition',
        phrase_en: 'Two 2-digit numbers',
        phrase_id: 'Dua bilangan dua angka',
        note_en: `Both numbers are between 10 and 99.`,
        note_id: `Kedua bilangan ada di antara 10 dan 99.`,
      },
      {
        category: 'question',
        phrase_en: 'the sum of the two numbers',
        phrase_id: 'jumlah kedua bilangan',
        note_en: `Find the pair first, then add them: ${a} + ${b} = ${sum}.`,
        note_id: `Temukan pasangannya dulu, lalu jumlahkan: ${a} + ${b} = ${sum}.`,
      },
    ]

    return {
      needsVisual: false,
      highlights,
      quantities: [
        { label_en: 'Product', label_id: 'Hasil kali', value: String(product) },
        { label_en: 'Pair', label_id: 'Pasangan', value: `${a}, ${b}` },
        { label_en: 'Sum (answer)', label_id: 'Jumlah (jawaban)', value: String(sum) },
      ],
      strategy: {
        conceptSlug: 'combination-product-sum',
        name_en: 'Enumerate 2-digit factor pairs',
        name_id: 'Cari pasangan faktor dua angka secara sistematis',
      },
      trap: {
        wrong: String(product),
        why_en: `${product} is the product, not the sum of the two numbers.`,
        why_id: `${product} adalah hasil kalinya, bukan jumlah kedua bilangan.`,
      },
      answer: {
        form: 'number',
        unit: null,
        value: String(sum),
      },
      vocab: [],
    }
  }

  // count-pairs mode
  const entry = COUNT_PAIRS_PRODUCTS[params.idx]
  const { n, count } = entry

  const highlights: BreakdownHighlight[] = [
    {
      category: 'fact',
      phrase_en: `a × b = ${n}`,
      phrase_id: `a × b = ${n}`,
      note_en: `The product of the pair must equal exactly ${n}.`,
      note_id: `Hasil kali pasangan harus sama dengan ${n}.`,
    },
    {
      category: 'condition',
      phrase_en: 'a < b',
      phrase_id: 'a < b',
      note_en: `We count unordered pairs — each pair is listed once with the smaller number first.`,
      note_id: `Kita menghitung pasangan tidak berurutan — setiap pasangan ditulis sekali dengan bilangan lebih kecil di depan.`,
    },
    {
      category: 'question',
      phrase_en: 'How many pairs',
      phrase_id: 'Berapa banyak pasangan',
      note_en: `Count every divisor of ${n} that is less than √${n}; each gives one valid pair.`,
      note_id: `Hitung setiap pembagi ${n} yang kurang dari √${n}; masing-masing membentuk satu pasangan.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,
    quantities: [
      { label_en: 'N', label_id: 'N', value: String(n) },
      { label_en: '√N (approx)', label_id: '√N (kira-kira)', value: Math.sqrt(n).toFixed(1) },
      { label_en: 'Pair count', label_id: 'Jumlah pasangan', value: String(count) },
    ],
    strategy: {
      conceptSlug: 'combination-product-sum',
      name_en: 'Enumerate divisors up to √N',
      name_id: 'Cari pembagi hingga √N secara sistematis',
    },
    trap: {
      wrong: String(n),
      why_en: `${n} is the product we're factoring, not the count of pairs.`,
      why_id: `${n} adalah hasil kali yang difaktorkan, bukan jumlah pasangannya.`,
    },
    answer: {
      form: 'number',
      unit: null,
      value: String(count),
    },
    vocab: [],
  }
}
