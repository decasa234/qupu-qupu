// Deterministic storyboard for WMI-19P1A-Q12 (TilePath19P1Explainer).
//
// We walk the white border from A (bottom-left corner) to B (top-right
// corner), one square side per beat, keeping a running step count:
// up 2, right 2, up 2, right 3 → 9 steps, answer D.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { TP_ROUTE, TP_STEPS } from './TilePath19P1Illustration'

export interface TilePathStep {
  /** How many lattice corners of TP_ROUTE are revealed (1 = just A). */
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

  // Beat 0 — the plan: one step per square side along the border.
  steps.push({
    revealed: 1,
    count: 0,
    result: false,
    hold: 2000,
    caption: t(
      'Start at A. Walk along the white border — every square side you walk is one step.',
      'Mulai dari A. Jalan menyusuri tepi putih — setiap sisi persegi yang dilalui adalah satu langkah.',
    ),
  })

  // One beat per square side walked.
  const moves = TP_ROUTE.length - 1 // = 9
  for (let i = 1; i <= moves; i++) {
    const last = i === moves
    steps.push({
      revealed: i + 1,
      count: i,
      result: false,
      hold: last ? 1500 : 1000,
      caption: t(
        last
          ? `Step ${i} reaches B — the walk took ${TP_STEPS} steps.`
          : `Step ${i}: walk one more square side along the border.`,
        last
          ? `Langkah ${i} sampai di B — perjalanannya ${TP_STEPS} langkah.`
          : `Langkah ${i}: jalan satu sisi persegi lagi menyusuri tepi.`,
      ),
    })
  }

  // Final answer beat.
  steps.push({
    revealed: TP_ROUTE.length,
    count: TP_STEPS,
    result: true,
    hold: 0,
    caption: t(
      `A to B along the white border = ${TP_STEPS} steps — answer D.`,
      `A ke B menyusuri tepi putih = ${TP_STEPS} langkah — jawaban D.`,
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: TP_STEPS }
}
