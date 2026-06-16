import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { GRID_DIGITS, OPTIMAL_PATH, OPTIMAL_SUM } from './P24G2Q25Illustration'

// Deterministic storyboard for WMI-24P2A-Q25 (robot digit-lattice, answer = A = 24).
//
// The explainer mirrors the static figure (DigitLattice) and walks the verified
// cheapest LEFT/RIGHT/DOWN path one node per beat, carrying a running total, and
// lands on 24 (choice A). The path + sum come from the illustration constants so
// captions can never drift from the drawn trail.

export interface LatticeStep {
  /** How many nodes of OPTIMAL_PATH to reveal (1..path.length). */
  step: number
  caption: string
  hold: number
  result: boolean
}

export interface LatticeStoryboard {
  answer: string
  total: number
  steps: LatticeStep[]
  finalIndex: number
}

export function buildP24G2Q25Steps(lang: Lang): LatticeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const digitAt = (i: number) => GRID_DIGITS[OPTIMAL_PATH[i].r][OPTIMAL_PATH[i].c]
  const runningTo = (i: number) =>
    OPTIMAL_PATH.slice(0, i + 1).reduce((s, n) => s + GRID_DIGITS[n.r][n.c], 0)

  const steps: LatticeStep[] = []

  // Beat 0 — set the rule, robot at the entrance.
  steps.push({
    step: 1,
    hold: 1900,
    result: false,
    caption: t(
      `Enter top-left at ${digitAt(0)}. Move only left, right, or down — aim for small digits.`,
      `Masuk kiri-atas di ${digitAt(0)}. Bergerak hanya kiri, kanan, atau turun — incar angka kecil.`,
    ),
  })

  // Beat 1 — slide right on the top row to the cheap column.
  steps.push({
    step: 2,
    hold: 1800,
    result: false,
    caption: t(
      `Slide right to ${digitAt(1)} — that column is cheap. So far ${runningTo(1)}.`,
      `Geser kanan ke ${digitAt(1)} — kolom itu murah. Sejauh ini ${runningTo(1)}.`,
    ),
  })

  // Beat 2 — drop straight down the cheap column (rows 1..4 at col 1).
  steps.push({
    step: 6,
    hold: 2200,
    result: false,
    caption: t(
      `Drop down that column: ${digitAt(2)}, ${digitAt(3)}, ${digitAt(4)}, ${digitAt(5)}. Now ${runningTo(5)}.`,
      `Turun di kolom itu: ${digitAt(2)}, ${digitAt(3)}, ${digitAt(4)}, ${digitAt(5)}. Kini ${runningTo(5)}.`,
    ),
  })

  // Beat 3 — step right, then down toward the exit corner.
  steps.push({
    step: 8,
    hold: 2000,
    result: false,
    caption: t(
      `Step right to ${digitAt(6)}, then down to ${digitAt(7)}. Running total ${runningTo(7)}.`,
      `Melangkah kanan ke ${digitAt(6)}, lalu turun ke ${digitAt(7)}. Total berjalan ${runningTo(7)}.`,
    ),
  })

  // Beat 4 — final slide right along the bottom row to the exit.
  steps.push({
    step: OPTIMAL_PATH.length,
    hold: 1900,
    result: false,
    caption: t(
      `Along the bottom to the exit: + ${digitAt(8)} + ${digitAt(9)} = ${OPTIMAL_SUM}.`,
      `Sepanjang dasar menuju keluar: + ${digitAt(8)} + ${digitAt(9)} = ${OPTIMAL_SUM}.`,
    ),
  })

  // Beat 5 — result.
  steps.push({
    step: OPTIMAL_PATH.length,
    hold: 0,
    result: true,
    caption: t(
      `Smallest possible total = ${OPTIMAL_SUM} — answer A. (No legal path reaches 23.)`,
      `Total terkecil yang mungkin = ${OPTIMAL_SUM} — jawaban A. (Tak ada jalur sah mencapai 23.)`,
    ),
  })

  return {
    answer: 'A',
    total: OPTIMAL_SUM,
    steps,
    finalIndex: steps.length - 1,
  }
}
