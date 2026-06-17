import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'

function gcd(a: number, b: number): number {
  while (b !== 0) { const t = b; b = a % b; a = t }
  return a
}
function lcm(a: number, b: number): number {
  return (a / gcd(a, b)) * b
}

export function buildDivisibilityMultiplePropertyBreakdown(params: Params): Breakdown {
  if (params.mode === 'pick-multiple') {
    const { d, options } = params
    const labels = ['A', 'B', 'C', 'D'] as const
    const correctIdx = options.findIndex((n) => n % d === 0)
    const correct = options[correctIdx]
    const optionList = options.join(', ')

    const highlights: BreakdownHighlight[] = [
      {
        category: 'fact',
        phrase_en: 'Four numbers',
        phrase_id: 'Empat bilangan',
        note_en: `These are the choices: ${optionList}. One of them is a multiple of ${d}.`,
        note_id: `Inilah pilihannya: ${optionList}. Salah satunya adalah kelipatan ${d}.`,
      },
      {
        category: 'condition',
        phrase_en: `a multiple of ${d}`,
        phrase_id: `kelipatan ${d}`,
        note_en: `A multiple of ${d} can be divided by ${d} with no remainder.`,
        note_id: `Kelipatan ${d} bisa dibagi ${d} tanpa sisa.`,
      },
      {
        category: 'question',
        phrase_en: 'Which number',
        phrase_id: 'Bilangan manakah',
        note_en: `Find the one number that is a multiple of ${d} — it is ${correct}.`,
        note_id: `Cari satu bilangan yang merupakan kelipatan ${d} — yaitu ${correct}.`,
      },
    ]

    return {
      needsVisual: false,
      highlights,
      quantities: [
        { label_en: 'Divisor', label_id: 'Pembagi', value: String(d) },
        { label_en: 'Numbers', label_id: 'Bilangan', value: optionList },
        { label_en: 'Multiple', label_id: 'Kelipatan', value: String(correct) },
        { label_en: 'Answer', label_id: 'Jawaban', value: labels[correctIdx] },
      ],
      strategy: {
        conceptSlug: 'divisibility-multiple-property',
        name_en: 'Test each with the divisibility rule',
        name_id: 'Uji tiap pilihan dengan aturan keterbagian',
      },
      trap: null,
      answer: { form: 'choice', unit: null, value: labels[correctIdx] },
      vocab: [],
    }
  }

  if (params.mode === 'multi-divisor') {
    const { k, m, base, answer } = params
    const l = lcm(k, m)

    const highlights: BreakdownHighlight[] = [
      {
        category: 'fact',
        phrase_en: `greater than ${base}`,
        phrase_id: `lebih besar dari ${base}`,
        note_en: `The answer must be strictly greater than ${base}.`,
        note_id: `Jawabannya harus lebih besar dari ${base}.`,
      },
      {
        category: 'condition',
        phrase_en: `divisible by both ${k} and ${m}`,
        phrase_id: `habis dibagi ${k} maupun ${m}`,
        note_en: `Divisible by both means divisible by LCM(${k}, ${m}) = ${l}.`,
        note_id: `Habis dibagi keduanya berarti habis dibagi KPK(${k}, ${m}) = ${l}.`,
      },
      {
        category: 'question',
        phrase_en: 'smallest number',
        phrase_id: 'Bilangan terkecil',
        note_en: `Find the first multiple of ${l} that exceeds ${base}: that is ${answer}.`,
        note_id: `Cari kelipatan ${l} pertama yang melebihi ${base}: yaitu ${answer}.`,
      },
    ]

    return {
      needsVisual: false,
      highlights,
      quantities: [
        { label_en: 'Divisor 1', label_id: 'Pembagi 1', value: String(k) },
        { label_en: 'Divisor 2', label_id: 'Pembagi 2', value: String(m) },
        { label_en: 'LCM', label_id: 'KPK', value: String(l) },
        { label_en: 'Lower bound', label_id: 'Batas bawah', value: String(base) },
        { label_en: 'Answer', label_id: 'Jawaban', value: String(answer) },
      ],
      strategy: {
        conceptSlug: 'divisibility-multiple-property',
        name_en: 'Find LCM, then list multiples past the lower bound',
        name_id: 'Cari KPK, lalu daftarkan kelipatannya melewati batas bawah',
      },
      trap: {
        wrong: String(answer - l),
        why_en: `${answer - l} is a multiple of ${l} but is NOT greater than ${base} — you need strictly greater.`,
        why_id: `${answer - l} adalah kelipatan ${l} tapi TIDAK lebih besar dari ${base} — harus lebih besar (bukan sama).`,
      },
      answer: { form: 'number', unit: null, value: String(answer) },
      vocab: [],
    }
  }

  // make-divisible
  const { d, n, x } = params
  const target = n + x

  const highlights: BreakdownHighlight[] = [
    {
      category: 'fact',
      phrase_en: String(n),
      phrase_id: String(n),
      note_en: `Starting number: ${n}. It has remainder ${n % d} when divided by ${d}.`,
      note_id: `Bilangan awal: ${n}. Sisanya ${n % d} saat dibagi ${d}.`,
    },
    {
      category: 'condition',
      phrase_en: `divisible by ${d}`,
      phrase_id: `habis dibagi ${d}`,
      note_en: `We need the result (${n} + x) to be divisible by ${d} with no remainder.`,
      note_id: `Kita butuh hasilnya (${n} + x) habis dibagi ${d} tanpa sisa.`,
    },
    {
      category: 'question',
      phrase_en: 'smallest number you must add',
      phrase_id: 'Bilangan terkecil yang harus ditambahkan',
      note_en: `The next multiple of ${d} after ${n} is ${target}, so we add ${x}.`,
      note_id: `Kelipatan ${d} berikutnya setelah ${n} adalah ${target}, jadi kita tambah ${x}.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,
    quantities: [
      { label_en: 'Starting number', label_id: 'Bilangan awal', value: String(n) },
      { label_en: 'Divisor', label_id: 'Pembagi', value: String(d) },
      { label_en: 'Remainder', label_id: 'Sisa', value: String(n % d) },
      { label_en: 'Next multiple', label_id: 'Kelipatan berikutnya', value: String(target) },
      { label_en: 'Answer (x)', label_id: 'Jawaban (x)', value: String(x) },
    ],
    strategy: {
      conceptSlug: 'divisibility-multiple-property',
      name_en: 'Find the next multiple, subtract to get the gap',
      name_id: 'Cari kelipatan berikutnya, kurangi untuk dapat selisihnya',
    },
    trap: {
      wrong: String(n % d),
      why_en: `${n % d} is the remainder, not the answer. You need ${d} − ${n % d} = ${x} to reach the next multiple.`,
      why_id: `${n % d} adalah sisa bagi, bukan jawabannya. Kamu butuh ${d} − ${n % d} = ${x} untuk mencapai kelipatan berikutnya.`,
    },
    answer: { form: 'number', unit: null, value: String(x) },
    vocab: [],
  }
}
