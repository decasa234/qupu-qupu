// Storyboard for SIMOC-19-G2-Q13 post-answer explainer.
// "What is x in the figure below?" — 3×3 shape matrix.
// Pattern: each row strips outer layers. Bottom row (circles):
//   complex circle → circle+X → X alone.  Answer: X alone.
//
// Teaching beats:
//   intro        — show full grid; prompt to find the pattern
//   row_pattern  — highlight bottom row; show stripping left→right
//   col_pattern  — highlight right column; show stripping top→bottom
//   answer       — highlight [2,2]; reveal x = X alone

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type ShapeMatrixPhase =
  | 'intro'
  | 'row_pattern'
  | 'col_pattern'
  | 'answer'

export interface ShapeMatrixStep {
  phase: ShapeMatrixPhase
  caption: string
  highlights: Array<[number, number]>  // [row, col]
  result: boolean
  hold: number
}

export interface ShapeMatrixStoryboard {
  steps: ShapeMatrixStep[]
  finalIndex: number
}

export function buildShapeMatrixSIMOC19G2Q13Steps(lang: Lang): ShapeMatrixStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: ShapeMatrixStep[] = []

  steps.push({
    phase: 'intro',
    hold: 2000,
    highlights: [],
    result: false,
    caption: t(
      'Each row and column follows a pattern — shapes get simpler as layers are stripped away.',
      'Setiap baris dan kolom mengikuti pola — bentuk semakin sederhana saat lapisan dilepas.',
    ),
  })

  steps.push({
    phase: 'row_pattern',
    hold: 2500,
    highlights: [[2, 0], [2, 1]],
    result: false,
    caption: t(
      'Bottom row (circles): left = circle + petals + X, middle = circle + X — each step strips one outer layer.',
      'Baris bawah (lingkaran): kiri = lingkaran + pola + ×, tengah = lingkaran + × — setiap langkah melepas satu lapisan luar.',
    ),
  })

  steps.push({
    phase: 'col_pattern',
    hold: 2500,
    highlights: [[0, 2], [1, 2]],
    result: false,
    caption: t(
      'Right column: top = complex hexagon, middle = square + X + circle — layers are stripped moving down.',
      'Kolom kanan: atas = segi enam kompleks, tengah = persegi + × + lingkaran — lapisan dilepas ke bawah.',
    ),
  })

  steps.push({
    phase: 'answer',
    hold: 0,
    highlights: [[2, 2]],
    result: true,
    caption: t(
      'x = X alone — both the row and column pattern strip all outer shapes, leaving only the ×.',
      'x = × saja — pola baris maupun kolom melepas semua bentuk luar, menyisakan hanya ×.',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
