import type { Lang } from '../concepts/explainers/makeTenSteps'
import { COLS, DEPTH, HEIGHTS, SILHOUETTE } from './P19G2Q12Illustration'

// WMI-19P2A-Q12 — looking from the arrow flattens the 3-D stack into a 2-D outline.
// The option figures (flat outlines) are not viewable; the official answer is A.
//
// The explainer builds the side silhouette one across-column at a time: for each
// column it takes the TALLEST stack (depth collapses), drawing that many squares,
// and lands on the staircase outline (heights 3, 2, 1) → Figure A.

// Visible height of each across-column = max over depth.
export const COL_HEIGHTS: number[] = Array.from({ length: COLS }, (_, x) =>
  Math.max(...Array.from({ length: DEPTH }, (_, y) => HEIGHTS[`${x},${y}`] ?? 0)),
)

export interface Q12Step {
  /** Number of across-columns of the flat outline revealed so far. */
  builtCols: number
  /** Still show the isometric solid + arrow (intro) vs. the flat outline (build). */
  showSolid: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q12Storyboard {
  answer: string
  colHeights: number[]
  silhouette: boolean[][]
  steps: Q12Step[]
  finalIndex: number
}

export function buildP19G2Q12Steps(answer: string, lang: Lang): Q12Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const letter = (answer || 'A').trim().toUpperCase() || 'A'

  const steps: Q12Step[] = [
    {
      builtCols: 0,
      showSolid: true,
      hold: 2600,
      result: false,
      caption: t(
        'Looking from the arrow flattens the stack into a 2-D outline — depth disappears.',
        'Memandang dari panah memipihkan tumpukan menjadi siluet 2 dimensi — kedalaman hilang.',
      ),
    },
    {
      builtCols: 0,
      showSolid: false,
      hold: 2200,
      result: false,
      caption: t(
        'For each up-and-down column, draw a square wherever there is at least one cube.',
        'Untuk tiap kolom atas-bawah, gambar satu persegi jika ada minimal satu kubus.',
      ),
    },
  ]

  COL_HEIGHTS.forEach((h, i) => {
    steps.push({
      builtCols: i + 1,
      showSolid: false,
      hold: 2000,
      result: false,
      caption: t(
        `Column ${i + 1}: tallest stack here is ${h} cube${h === 1 ? '' : 's'} — so ${h} square${h === 1 ? '' : 's'} high. Cubes hidden behind don't add any.`,
        `Kolom ${i + 1}: tumpukan tertinggi di sini ${h} kubus — jadi setinggi ${h} persegi. Kubus yang tersembunyi di belakang tidak menambah.`,
      ),
    })
  })

  steps.push({
    builtCols: COLS,
    showSolid: false,
    hold: 0,
    result: true,
    caption: t(
      `The flat outline is a ${COL_HEIGHTS.join('-')} staircase — that matches Figure ${letter}.`,
      `Siluet datarnya tangga ${COL_HEIGHTS.join('-')} — itu cocok dengan Gambar ${letter}.`,
    ),
  })

  return { answer: letter, colHeights: COL_HEIGHTS, silhouette: SILHOUETTE, steps, finalIndex: steps.length - 1 }
}
