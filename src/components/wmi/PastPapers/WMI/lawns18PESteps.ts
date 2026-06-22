import type { Lang } from '../../concepts/explainers/makeTenSteps'

// Storyboard for IKMC-22-PE-Q18 — "Which lawn is the smallest?".
//
// Strategy: count grid squares inside each lawn, then pick the one with
// the fewest. The answer is A (crown shape, ~7.5 sq units vs 9-11 for B–E).
//
// Beat sequence:
//   0 — intro: "Compare the lawns by counting their grid squares."
//   1–5 — per-lawn beats A→E: show the area count, mark pass/fail.
//   6 — result: Lawn A has the fewest squares — answer A.
//
// Area estimates (counted from the source images, each grid unit ≈ 1):
//   A ≈ 7.5 (smallest) ← correct
//   B ≈ 10
//   C ≈ 10
//   D ≈ 9
//   E ≈ 11

export type LawnLabel = 'A' | 'B' | 'C' | 'D' | 'E'

export interface LawnStep {
  /** Which option is on screen (undefined = intro / result). */
  activeLabel?: LawnLabel
  /** All five labels and their "counted" state on this beat. */
  counted: Partial<Record<LawnLabel, number>>
  /** True only on the final winning beat. */
  result: boolean
  caption: string
  hold: number
}

export interface LawnStoryboard {
  answer: LawnLabel
  steps: LawnStep[]
  finalIndex: number
}

// Grid-square area for each lawn (read from the source images).
const AREA: Record<LawnLabel, number> = {
  A: 7,   // crown  — fewest ← correct answer
  B: 10,  // C-shape
  C: 10,  // W-shape
  D: 9,   // wide hexagon
  E: 11,  // double-lobe
}

const ORDER: LawnLabel[] = ['A', 'B', 'C', 'D', 'E']

export function buildLawns18PESteps(lang: Lang): LawnStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const answer: LawnLabel = 'A'

  const steps: LawnStep[] = []

  // Beat 0 — intro.
  steps.push({
    counted: {},
    result: false,
    hold: 2200,
    caption: t(
      'Count the grid squares inside each lawn — the lawn with the fewest is the smallest.',
      'Hitung kotak petak di dalam setiap halaman — halaman dengan kotak paling sedikit adalah yang terkecil.',
    ),
  })

  // Beats 1–5 — one beat per lawn.
  const counted: Partial<Record<LawnLabel, number>> = {}
  for (const label of ORDER) {
    const area = AREA[label]
    counted[label] = area

    const isBest = label === answer
    steps.push({
      activeLabel: label,
      counted: { ...counted },
      result: false,
      hold: isBest ? 2000 : 1800,
      caption: t(
        `Lawn ${label}: about ${area} grid squares${isBest ? ' — the smallest so far!' : '.'}`,
        `Halaman ${label}: sekitar ${area} kotak petak${isBest ? ' — terkecil sejauh ini!' : '.'}`,
      ),
    })
  }

  // Beat 6 — result.
  steps.push({
    activeLabel: answer,
    counted: { ...AREA },
    result: true,
    hold: 0,
    caption: t(
      `Lawn A has the smallest area (about ${AREA.A} grid squares) — the answer is A.`,
      `Halaman A memiliki luas terkecil (sekitar ${AREA.A} kotak petak) — jawabannya A.`,
    ),
  })

  return {
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
