// Storyboard for SEAMO-16-A-Q21 — maximum slices from 3 straight cuts.
// Rule: each new cut adds (previous-cuts-crossed + 1) new pieces.
//   Cut 0 (start): 1 piece.
//   Cut 1 crosses 0 previous lines: +1 → 2 pieces.
//   Cut 2 crosses 1 line at 1 interior point: +2 → 4 pieces.
//   Cut 3 crosses 2 lines at 2 distinct interior points: +3 → 7 pieces.
// Formula: pieces(n) = 1 + n(n+1)/2.
// Trap: if all cuts meet at ONE point → only 6 pieces (not max).
//
// Pure (lang) → steps; no state.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type CakeSlicesPhase =
  | 'intro'
  | 'cut1'   // first cut → 2 pieces
  | 'cut2'   // second cut crosses first → 4 pieces
  | 'cut3'   // third cut crosses both → 7 pieces
  | 'trap'   // show 6-piece mistake (cuts through one point)
  | 'rule'   // derive the +n rule
  | 'result'

export interface CakeSlicesStep {
  phase: CakeSlicesPhase
  /** How many cuts to render (0–3). */
  cutsShown: number
  /** Which cut to highlight (0-indexed), or -1. */
  focusCut: number
  /** Current running piece count for this beat. */
  pieces: number
  /** Show the trap badge (6 pieces). */
  showTrap: boolean
  /** Show the formula. */
  showFormula: boolean
  caption: string
  hold: number
  reject: boolean
  result: boolean
}

// Running piece counts after each cut.
export const PIECE_COUNTS = [1, 2, 4, 7] as const

export function buildCakeSlices16A21Steps(lang: Lang): CakeSlicesStep[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CakeSlicesStep[] = []

  // Beat 0 — introduce the problem.
  steps.push({
    phase: 'intro',
    cutsShown: 0,
    focusCut: -1,
    pieces: 1,
    showTrap: false,
    showFormula: false,
    hold: 2400,
    reject: false,
    result: false,
    caption: t(
      'We have a whole cake — 1 piece so far. We make 3 straight cuts. How many pieces can we get at most?',
      'Kita punya kue utuh — baru 1 irisan. Kita buat 3 potongan lurus. Berapa irisan maksimum yang bisa kita dapatkan?',
    ),
  })

  // Beat 1 — cut 1: +1 new piece.
  steps.push({
    phase: 'cut1',
    cutsShown: 1,
    focusCut: 0,
    pieces: 2,
    showTrap: false,
    showFormula: false,
    hold: 2200,
    reject: false,
    result: false,
    caption: t(
      'Cut 1 slices straight across. It crosses 0 previous cuts, so it adds 1 new piece. Total: 1 + 1 = 2 pieces.',
      'Potongan ke-1 membelah lurus. Tidak memotong garis sebelumnya, jadi menambah 1 irisan baru. Total: 1 + 1 = 2 irisan.',
    ),
  })

  // Beat 2 — cut 2 crosses cut 1 at 1 point → +2 pieces.
  steps.push({
    phase: 'cut2',
    cutsShown: 2,
    focusCut: 1,
    pieces: 4,
    showTrap: false,
    showFormula: false,
    hold: 2200,
    reject: false,
    result: false,
    caption: t(
      'Cut 2 crosses cut 1 at 1 point, so it adds 2 new pieces. Total: 2 + 2 = 4 pieces.',
      'Potongan ke-2 memotong irisan 1 di 1 titik, sehingga menambah 2 irisan baru. Total: 2 + 2 = 4 irisan.',
    ),
  })

  // Beat 3 — cut 3 crosses both at 2 distinct points → +3 pieces.
  steps.push({
    phase: 'cut3',
    cutsShown: 3,
    focusCut: 2,
    pieces: 7,
    showTrap: false,
    showFormula: false,
    hold: 2200,
    reject: false,
    result: false,
    caption: t(
      'Cut 3 crosses 2 previous cuts at 2 distinct points, so it adds 3 new pieces. Total: 4 + 3 = 7 pieces!',
      'Potongan ke-3 memotong 2 garis sebelumnya di 2 titik berbeda, sehingga menambah 3 irisan baru. Total: 4 + 3 = 7 irisan!',
    ),
  })

  // Beat 4 — trap: all 3 cuts through one point → only 6.
  steps.push({
    phase: 'trap',
    cutsShown: 3,
    focusCut: -1,
    pieces: 6,
    showTrap: true,
    showFormula: false,
    hold: 2200,
    reject: true,
    result: false,
    caption: t(
      'Trap: if all 3 cuts pass through the same point you only get 6 pieces, not 7. Make each cut cross the others at DIFFERENT points.',
      'Jebakan: jika ketiga potongan bertemu di satu titik, kamu hanya mendapat 6 irisan, bukan 7. Pastikan setiap potongan memotong garis lain di titik BERBEDA.',
    ),
  })

  // Beat 5 — the rule.
  steps.push({
    phase: 'rule',
    cutsShown: 3,
    focusCut: -1,
    pieces: 7,
    showTrap: false,
    showFormula: true,
    hold: 2400,
    reject: false,
    result: false,
    caption: t(
      'Rule: each new cut adds (cuts already made + 1) pieces. After n cuts: 1 + 1+2+…+n = 1 + n(n+1)/2.',
      'Aturan: setiap potongan baru menambah (jumlah potongan sebelumnya + 1) irisan. Setelah n potongan: 1 + 1+2+…+n = 1 + n(n+1)/2.',
    ),
  })

  // Beat 6 — result.
  steps.push({
    phase: 'result',
    cutsShown: 3,
    focusCut: -1,
    pieces: 7,
    showTrap: false,
    showFormula: true,
    hold: 0,
    reject: false,
    result: true,
    caption: t(
      '3 cuts → 1 + 3×4/2 = 1 + 6 = 7 pieces. Maximum slices = 7.',
      '3 potongan → 1 + 3×4/2 = 1 + 6 = 7 irisan. Irisan maksimum = 7.',
    ),
  })

  return steps
}
