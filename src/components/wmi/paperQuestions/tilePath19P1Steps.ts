// Deterministic storyboard for WMI-19P1A-Q12 (TilePath19P1Explainer).
//
// We walk the white border from A (bottom-left) to B (top-right), one tile per
// beat, keeping a running step count. The route hugs the border: up the left
// edge, across the top, and around the top-right block down to B — 9 steps,
// answer D.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { TP_ROUTE, TP_STEPS } from './TilePath19P1Illustration'

export interface TilePathStep {
  /** How many lattice nodes of TP_ROUTE are revealed (1 = just A). */
  revealed: number
  /** Running step count (= revealed - 1, clamped at 0). */
  count: number
  /** True only on the final answer beat. */
  result: boolean
  /** Hold duration in ms. */
  hold: number
  caption: string
}

export interface TilePathStoryboard {
  steps: TilePathStep[]
  finalIndex: number
  answer: number
}

export function buildTilePath19P1Steps(lang: Lang): TilePathStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TilePathStep[] = []

  // Beat 0 — the plan: only white tiles count.
  steps.push({
    revealed: 1,
    count: 0,
    result: false,
    hold: 2000,
    caption: t(
      'Start at A. Walk only on the white border tiles — the gray ones are blocked.',
      'Mulai dari A. Jalan hanya di ubin tepi putih — yang abu-abu terhalang.',
    ),
  })

  // One beat per move between neighbouring white tiles.
  const moves = TP_ROUTE.length - 1 // = 9
  for (let i = 1; i <= moves; i++) {
    const count = i
    const last = i === moves
    steps.push({
      revealed: i + 1,
      count,
      result: false,
      hold: last ? 1500 : 1100,
      caption: t(
        last
          ? `Step ${count} reaches B. Count the moves: ${TP_STEPS} steps.`
          : `Step ${count}: move to the next white tile.`,
        last
          ? `Langkah ${count} sampai di B. Hitung langkahnya: ${TP_STEPS} langkah.`
          : `Langkah ${count}: pindah ke ubin putih berikutnya.`,
      ),
    })
  }

  // Final answer beat.
  steps.push({
    revealed: TP_ROUTE.length,
    count: TP_STEPS,
    result: true,
    hold: 0,
    caption: t(`A to B along the white border = ${TP_STEPS} steps — answer D.`, `A ke B menyusuri tepi putih = ${TP_STEPS} langkah — jawaban D.`),
  })

  return { steps, finalIndex: steps.length - 1, answer: TP_STEPS }
}
