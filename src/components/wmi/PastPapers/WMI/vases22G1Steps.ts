import type { Lang } from '../concepts/explainers/makeTenSteps'

export const VASES_ANSWER = '133948'

/**
 * Seven vases (0-based positions) carry these numbers:
 *   pos0=13  pos1=57  pos2=8  pos3=39  pos4=48  pos5=29  pos6=47
 *
 * Goal: pick THREE vases whose numbers add up to exactly 100, then write the
 * three numbers smallest → largest side by side.
 *
 * Answer: 13 + 39 + 48 = 100 (positions 0, 3, 4). Smallest → largest gives
 * 13, 39, 48 → "133948".
 *
 * The animation searches honestly:
 *   1. Show all seven vases, state the target 100.
 *   2. A too-big try: 57 + 48 = 105 — already over 100, so 57 can't pair with 48.
 *   3. A middle try that works: 48 + 39 = 87, we still need 13 — and there is a 13!
 *   4. Check the trio: 13 + 39 + 48 = 100 ✓.
 *   5. Arrange smallest → largest: 13, 39, 48.
 *   6. Write them together → 133948.
 */
export const VASE_NUMBERS = [13, 57, 8, 39, 48, 29, 47] as const

export interface VasesStep {
  /** 0-based vase positions to ring this beat (passed straight to <VaseRow litIndexes>). */
  litIndexes: number[]
  caption: string
  /** ms to hold this beat before advancing (0 = final/winning beat, lingers). */
  hold: number
  /** True only on the winning beat — flips the caption box + answer chip to green. */
  result: boolean
  /** When set, render the arranged number string under the vases (build-up beats). */
  build?: string
}

export interface VasesStoryboard {
  answer: string
  steps: VasesStep[]
  finalIndex: number
}

export function buildVases22G1Steps(lang: Lang): VasesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: VasesStep[] = [
    {
      litIndexes: [],
      hold: 2600,
      result: false,
      caption: t(
        'Seven vases! We must pick THREE whose numbers add up to exactly 100.',
        'Tujuh vas! Kita harus memilih TIGA yang angkanya berjumlah tepat 100.',
      ),
    },
    {
      // Too-big try: the two biggest in this pair already blow past 100.
      litIndexes: [1, 4],
      hold: 2100,
      result: false,
      caption: t(
        'Try a BIG start: 57 + 48 = 105. That is already past 100! So 57 will not work here.',
        'Coba mulai dari yang BESAR: 57 + 48 = 105. Itu sudah lewat 100! Jadi 57 tidak cocok di sini.',
      ),
    },
    {
      // Middle pair that leaves room for a third vase: 48 + 39 = 87, need 13 more.
      litIndexes: [4, 3],
      hold: 2400,
      result: false,
      caption: t(
        'Try the middle: 48 + 39 = 87. We still need 100 − 87 = 13 more — and there IS a 13!',
        'Coba angka tengah: 48 + 39 = 87. Kita masih perlu 100 − 87 = 13 lagi — dan ADA vas 13!',
      ),
    },
    {
      // Light all three and verify the sum.
      litIndexes: [0, 3, 4],
      hold: 2400,
      result: false,
      caption: t(
        'Check the three: 13 + 39 + 48 = 100. ✓',
        'Periksa ketiganya: 13 + 39 + 48 = 100. ✓',
      ),
    },
    {
      litIndexes: [0, 3, 4],
      hold: 2200,
      result: false,
      build: '13 39 48',
      caption: t(
        'Now line them up smallest → largest: 13, then 39, then 48.',
        'Sekarang urutkan dari terkecil → terbesar: 13, lalu 39, lalu 48.',
      ),
    },
    {
      litIndexes: [0, 3, 4],
      hold: 0,
      result: true,
      build: '133948',
      caption: t(
        `Write them side by side → ${VASES_ANSWER}.`,
        `Tulis berdampingan → ${VASES_ANSWER}.`,
      ),
    },
  ]

  return {
    answer: VASES_ANSWER,
    steps,
    finalIndex: steps.length - 1,
  }
}
