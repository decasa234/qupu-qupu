import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildDigitFrequencyBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  a: z.number().int().min(1).max(60),
  b: z.number().int().min(2).max(120),
  d: z.number().int().min(1).max(9),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'digit-frequency',
  name_en: 'How often a digit appears',
  name_id: 'Seberapa sering sebuah angka muncul',
  grades: [1, 2, 3] as const,
  description_id: 'Hitung berapa kali sebuah angka muncul saat menulis serangkaian bilangan.',
} as const

export function countDigit(a: number, b: number, d: number): number {
  const target = String(d)
  let count = 0
  for (let n = a; n <= b; n++) {
    for (const ch of String(n)) if (ch === target) count++
  }
  return count
}

export function generate(rng: Rng): Params {
  const a = rng.int(1, 20)
  const b = a + rng.int(15, 40)
  const d = rng.int(1, 9)
  return { a, b, d }
}

export function render(params: Params) {
  const { a, b, d } = params
  const ans = countDigit(a, b, d)

  // Build hint steps: group numbers containing digit d by which place(s) carry it,
  // then show the tally and total.
  const onesHits: number[] = []   // digit d is in the ones place
  const tensHits: number[] = []   // digit d is in the tens place
  const bothHits: number[] = []   // digit d is in BOTH places (e.g. 33 for d=3)
  for (let n = a; n <= b; n++) {
    const s = String(n)
    const inOnes = s.length >= 1 && s[s.length - 1] === String(d)
    const inTens = s.length >= 2 && s[s.length - 2] === String(d)
    if (inOnes && inTens) bothHits.push(n)
    else if (inOnes) onesHits.push(n)
    else if (inTens) tensHits.push(n)
  }

  // Compose step 1: list numbers that contain the digit
  const allHitsSorted = [...onesHits, ...tensHits, ...bothHits].sort((x, y) => x - y)
  const hitList = allHitsSorted.join(', ')

  // Compose step 2: break down the count by place
  const onesCount = onesHits.length + bothHits.length
  const tensCount = tensHits.length + bothHits.length
  const bothCount = bothHits.length

  let step2En: string
  let step2Id: string
  if (bothCount > 0) {
    step2En = `Ones place: ${onesCount} time${onesCount !== 1 ? 's' : ''}; tens place: ${tensCount} time${tensCount !== 1 ? 's' : ''}. Note ${bothHits.join(', ')} contribute${bothHits.length === 1 ? 's' : ''} to both.`
    step2Id = `Tempat satuan: ${onesCount} kali; tempat puluhan: ${tensCount} kali. Perhatikan ${bothHits.join(', ')} dihitung di keduanya.`
  } else if (tensCount > 0 && onesCount > 0) {
    step2En = `Ones place contributes ${onesCount} time${onesCount !== 1 ? 's' : ''}; tens place contributes ${tensCount} time${tensCount !== 1 ? 's' : ''}.`
    step2Id = `Tempat satuan menyumbang ${onesCount} kali; tempat puluhan menyumbang ${tensCount} kali.`
  } else if (tensCount === 0) {
    step2En = `All ${onesCount} appearance${onesCount !== 1 ? 's' : ''} are in the ones place.`
    step2Id = `Semua ${onesCount} kemunculan ada di tempat satuan.`
  } else {
    step2En = `All ${tensCount} appearance${tensCount !== 1 ? 's' : ''} are in the tens place.`
    step2Id = `Semua ${tensCount} kemunculan ada di tempat puluhan.`
  }

  // Compose step 3: total.
  // onesCount already includes bothHits, tensCount already includes bothHits,
  // so onesCount + tensCount is the correct total occurrences (= ans).
  const step3En = tensCount > 0 && onesCount > 0
    ? `Total appearances: ${onesCount} + ${tensCount} = ${ans}.`
    : `The digit ${d} appears ${ans} time${ans !== 1 ? 's' : ''} in total.`
  const step3Id = tensCount > 0 && onesCount > 0
    ? `Total kemunculan: ${onesCount} + ${tensCount} = ${ans}.`
    : `Angka ${d} muncul ${ans} kali seluruhnya.`

  return {
    body_en: `Write all whole numbers from ${a} to ${b}. Find: How many times does the digit ${d} appear in total?`,
    body_id: `Tuliskan semua bilangan bulat dari ${a} sampai ${b}. Cari: Berapa kali angka ${d} muncul seluruhnya?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(ans),
    hint_en: `Go through each number from ${a} to ${b} and tally every place (ones and tens) where the digit ${d} shows up.`,
    hint_id: `Periksa setiap bilangan dari ${a} sampai ${b} dan catat setiap posisi (satuan dan puluhan) di mana angka ${d} muncul.`,
    hint_steps_en: [
      `Find all numbers from ${a} to ${b} that contain ${d}: ${hitList}.`,
      step2En,
      step3En,
    ],
    hint_steps_id: [
      `Temukan semua bilangan dari ${a} sampai ${b} yang mengandung ${d}: ${hitList}.`,
      step2Id,
      step3Id,
    ],
    breakdown: buildDigitFrequencyBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
