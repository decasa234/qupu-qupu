import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildCryptarithmeticBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  addend1: z.number().int().min(10).max(99),
  addend2: z.number().int().min(10).max(99),
  askDigit: z.number().int().min(0).max(9),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'cryptarithmetic-addition',
  name_en: 'Letter addition puzzle',
  name_id: 'Teka-teki penjumlahan huruf',
  grades: [3] as const,
  description_id:
    'Setiap huruf mewakili satu angka berbeda; gunakan penjumlahan untuk menemukannya.',
} as const

// Derive the digit->letter mapping deterministically: read the decimal strings
// of addend1, then addend2, then the sum, left-to-right, and assign letters
// 'A','B','C',... to digits in first-appearance order.
export interface Mapping {
  sum: number
  digitToLetter: Record<string, string>
  // distinct digits in first-appearance order
  distinctDigits: number[]
  // the letters, aligned to distinctDigits
  letters: string[]
  wordA: string
  wordB: string
  wordS: string
}

export function buildMapping(addend1: number, addend2: number): Mapping {
  const sum = addend1 + addend2
  const scan = String(addend1) + String(addend2) + String(sum)
  const digitToLetter: Record<string, string> = {}
  const distinctDigits: number[] = []
  const letters: string[] = []
  for (const ch of scan) {
    if (!(ch in digitToLetter)) {
      const letter = String.fromCharCode(65 + distinctDigits.length)
      digitToLetter[ch] = letter
      distinctDigits.push(Number(ch))
      letters.push(letter)
    }
  }
  const wordOf = (n: number) =>
    String(n)
      .split('')
      .map((c) => digitToLetter[c])
      .join('')
  return {
    sum,
    digitToLetter,
    distinctDigits,
    letters,
    wordA: wordOf(addend1),
    wordB: wordOf(addend2),
    wordS: wordOf(sum),
  }
}

// Generate every injective letter->digit assignment that satisfies the puzzle:
// leading letters map to a non-zero digit and value(wordA)+value(wordB)===value(wordS).
// Returns each solution as a { letter: digit } record. The original digits are
// always one solution, so the array is non-empty for a valid puzzle.
export function solutions(p: Params): Array<Record<string, number>> {
  const m = buildMapping(p.addend1, p.addend2)
  const letters = m.letters
  const k = letters.length
  const leading = new Set([m.wordA[0], m.wordB[0], m.wordS[0]])
  const found: Array<Record<string, number>> = []
  const used = new Array(10).fill(false)
  const assign: Record<string, number> = {}

  const value = (word: string) =>
    word.split('').reduce((acc, ch) => acc * 10 + assign[ch], 0)

  const recurse = (idx: number) => {
    if (idx === k) {
      if (value(m.wordA) + value(m.wordB) === value(m.wordS)) {
        found.push({ ...assign })
      }
      return
    }
    const letter = letters[idx]
    const isLeading = leading.has(letter)
    for (let d = 0; d <= 9; d++) {
      if (used[d]) continue
      if (isLeading && d === 0) continue
      used[d] = true
      assign[letter] = d
      recurse(idx + 1)
      used[d] = false
    }
    delete assign[letter]
  }
  recurse(0)
  return found
}

// A hardcoded puzzle with a proven-unique solution (11 + 89 = 100), used only if
// the generation loop somehow never finds a fresh unique puzzle.
const FALLBACK: Params = { addend1: 11, addend2: 89, askDigit: 8 }

export function generate(rng: Rng): Params {
  for (let tries = 0; tries < 2000; tries++) {
    const a = rng.int(10, 99)
    const b = rng.int(10, 99)
    const m = buildMapping(a, b)
    const distinct = m.distinctDigits.length
    // Keep 3-4 distinct letters: small enough that the uniqueness search is
    // fast and the puzzle stays kid-appropriate for grade 3.
    if (distinct < 3 || distinct > 4) continue
    const candidate: Params = { addend1: a, addend2: b, askDigit: m.distinctDigits[0] }
    if (solutions(candidate).length !== 1) continue
    const askDigit = rng.pick(m.distinctDigits)
    return { addend1: a, addend2: b, askDigit }
  }
  return FALLBACK
}

export function render(params: Params) {
  const m = buildMapping(params.addend1, params.addend2)
  const askLetter = m.digitToLetter[String(params.askDigit)]
  const answer = String(params.askDigit)

  const hint_steps_en = [
    `Look at the units column: the last letters add up (with a possible carry) to the last letter of ${m.wordS}.`,
    `A leading letter can't be 0, so use that plus the carries to pin down what ${askLetter} must be.`,
  ]
  const hint_steps_id = [
    `Lihat kolom satuan: huruf-huruf terakhir dijumlahkan (mungkin dengan simpanan) menjadi huruf terakhir dari ${m.wordS}.`,
    `Huruf terdepan tidak boleh 0, jadi gunakan itu dan simpanan untuk memastikan nilai ${askLetter}.`,
  ]

  return {
    body_en: `Each letter stands for a different digit, and no number starts with 0:\n\n  ${m.wordA} + ${m.wordB} = ${m.wordS}\n\nFind: What digit does the letter ${askLetter} stand for?`,
    body_id: `Setiap huruf mewakili satu angka yang berbeda, dan tidak ada bilangan yang diawali 0:\n\n  ${m.wordA} + ${m.wordB} = ${m.wordS}\n\nCari: Angka berapa yang diwakili oleh huruf ${askLetter}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer,
    hint_en: `Solve column by column from the units, tracking carries; remember no leading letter is 0.`,
    hint_id: `Selesaikan kolom demi kolom mulai dari satuan sambil melacak simpanan; ingat huruf terdepan tidak boleh 0.`,
    hint_steps_en,
    hint_steps_id,
    breakdown: buildCryptarithmeticBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
