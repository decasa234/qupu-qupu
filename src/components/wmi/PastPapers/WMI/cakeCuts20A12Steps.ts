// Storyboard for SEAMO-20-A-Q12 — maximum pieces from 3 straight cuts.
//
// The problem gives two anchors: 1 cut → 2 pieces, 2 cuts → 4 pieces.
// The explainer shows the THIRD cake being cut step-by-step, reinforcing
// the "+n" rule and rejecting the 6-piece trap (parallel cuts), then
// landing on 7 (answer B).
//
// Rule:  pieces(n) = 1 + n(n+1)/2
//   n=1: 1 + 1 = 2  ✓
//   n=2: 1 + 3 = 4  ✓
//   n=3: 1 + 6 = 7  ← answer
// Trap:  3 cuts all meeting at one point → only 6 pieces.
//
// Pure (lang) → steps; no state.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type CakeCutsPhase =
  | 'intro'   // show the two given anchors
  | 'cut1'    // +1 → 2 pieces
  | 'cut2'    // +2 → 4 pieces
  | 'cut3'    // +3 → 7 pieces
  | 'trap'    // concurrent cuts mistake → 6 pieces
  | 'rule'    // formula reveal
  | 'result'  // final answer

export interface CakeCutsStep {
  phase: CakeCutsPhase
  /** How many cuts visible on the THIRD (question) cake (0–3). */
  cutsShown: number
  /** 0-indexed cut to highlight, -1 = none. */
  focusCut: number
  /** Running piece count on the question cake. */
  pieces: number
  showTrap: boolean
  showFormula: boolean
  caption: string
  hold: number
  reject: boolean
  result: boolean
}

/** Cumulative piece counts: before any cut, after cut 1, 2, 3. */
export const PIECE_COUNTS = [1, 2, 4, 7] as const

export function buildCakeCuts20A12Steps(lang: Lang): CakeCutsStep[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CakeCutsStep[] = []

  // Beat 0 — re-state the given facts and pose the question.
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
      'We know: 1 cut → 2 pieces and 2 cuts → 4 pieces. Now make 3 cuts — aim for the MOST pieces!',
      'Kita tahu: 1 potongan → 2 bagian dan 2 potongan → 4 bagian. Sekarang 3 potongan — cari bagian TERBANYAK!',
    ),
  })

  // Beat 1 — first cut: 0 prior lines crossed → adds 1.
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
      'Cut 1 crosses no previous cuts: adds 1 piece. Total = 1 + 1 = 2 pieces.',
      'Potongan 1 tidak memotong garis lain: tambah 1 bagian. Total = 1 + 1 = 2 bagian.',
    ),
  })

  // Beat 2 — second cut crosses the first at 1 point → adds 2.
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
      'Cut 2 crosses cut 1 at 1 point: adds 2 pieces. Total = 2 + 2 = 4 pieces.',
      'Potongan 2 memotong potongan 1 di 1 titik: tambah 2 bagian. Total = 2 + 2 = 4 bagian.',
    ),
  })

  // Beat 3 — third cut crosses both at 2 distinct points → adds 3.
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
      'Cut 3 crosses BOTH previous cuts at 2 different points: adds 3 pieces. Total = 4 + 3 = 7!',
      'Potongan 3 memotong KEDUA garis di 2 titik berbeda: tambah 3 bagian. Total = 4 + 3 = 7!',
    ),
  })

  // Beat 4 — trap: all 3 lines through one point → only 6 pieces.
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
      'Trap: if all 3 cuts meet at the same point you only get 6 pieces — not the maximum. Tilt the 3rd cut!',
      'Jebakan: jika ketiga potongan bertemu di satu titik, hanya 6 bagian — bukan maksimum. Miringkan potongan ke-3!',
    ),
  })

  // Beat 5 — show the formula.
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
      'Rule: each new cut adds (prior cuts + 1) pieces. After n cuts: 1 + n(n+1)/2.',
      'Aturan: setiap potongan baru menambah (potongan sebelumnya + 1) bagian. Setelah n potongan: 1 + n(n+1)/2.',
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
      'n = 3: 1 + 3×4/2 = 1 + 6 = 7 pieces. Answer: B.',
      'n = 3: 1 + 3×4/2 = 1 + 6 = 7 bagian. Jawaban: B.',
    ),
  })

  return steps
}
