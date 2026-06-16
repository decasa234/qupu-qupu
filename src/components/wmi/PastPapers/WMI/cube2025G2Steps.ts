// Storyboard for WMI-25F2A-Q17 (2025 Grade-2 Final) — post-answer explainer.
// The year 2025 is built from unit cubes, each digit one cube thick, then painted.
// We teach WHY the answer is 60: front + back are always painted (2 faces); a
// straight-run cube adds exactly 2 side faces (-> 4, counts); an END/corner cube
// adds 3 side faces (-> 5, does NOT count). So total cubes minus the free ends.
//
// Everything is derived from the digit grids exported by the illustration — the
// 66 total, the 6 ends and the 60 answer all fall out of TOTAL_CUBES / END_CUBES.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import {
  YEAR_2025,
  endCubes,
  TOTAL_CUBES,
  END_CUBES,
  FOUR_FACE_CUBES,
  type DigitGrid,
} from './Cube2025G2Illustration'

/** A single cube cell, addressed by digit / row / col so the SVG can match it. */
export interface CubeCell {
  digit: number
  row: number
  col: number
}

export type CubePhase =
  | 'goal' // state the goal: count cubes with exactly 4 painted faces
  | 'thick' // every cube is one thick -> front + back always painted (2)
  | 'straight' // a straight-run cube shows 2 more sides -> 4 (counts)
  | 'end' // an end/corner cube shows 3 more sides -> 5 (does NOT count)
  | 'mark' // highlight the 6 end cubes, digit by digit
  | 'subtract' // 66 - 6
  | 'result' // land on 60

export interface CubeStep {
  phase: CubePhase
  /** End cubes revealed so far (cumulative) — drawn with a reject marker. */
  marked: CubeCell[]
  /** Running count of free-end cubes found so far. */
  endCount: number
  caption: string
  hold: number
  result: boolean
}

export interface CubeStoryboard {
  total: number
  ends: number
  answer: number
  /** Every free-end cube, in reading order (for the final highlight). */
  allEnds: CubeCell[]
  steps: CubeStep[]
  finalIndex: number
}

/** Flatten the per-digit end-cube cells into addressable {digit,row,col}. */
function collectEnds(): CubeCell[] {
  const out: CubeCell[] = []
  YEAR_2025.forEach((grid: DigitGrid, digit) => {
    for (const [row, col] of endCubes(grid)) out.push({ digit, row, col })
  })
  return out
}

export function buildCube2025G2Steps(lang: Lang): CubeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const total = TOTAL_CUBES // 66
  const ends = END_CUBES // 6
  const answer = FOUR_FACE_CUBES // 60
  const allEnds = collectEnds()

  // Reveal the end cubes one digit at a time so the "6 ends" reads as we count.
  // Digits with at least one free end, in reading order.
  const endsByDigit: CubeCell[][] = YEAR_2025.map((_, d) => allEnds.filter((e) => e.digit === d)).filter(
    (g) => g.length > 0,
  )

  const steps: CubeStep[] = []

  steps.push({
    phase: 'goal',
    marked: [],
    endCount: 0,
    hold: 2600,
    result: false,
    caption: t(
      `All ${total} cubes are painted. Which ones get EXACTLY 4 faces painted?`,
      `Semua ${total} kubus dicat. Kubus mana yang dicat TEPAT 4 sisi?`,
    ),
  })

  steps.push({
    phase: 'thick',
    marked: [],
    endCount: 0,
    hold: 2600,
    result: false,
    caption: t(
      'Each cube is just 1 thick — so its front and back are ALWAYS painted. That is 2 faces already.',
      'Tiap kubus tebalnya cuma 1 — jadi depan dan belakang SELALU dicat. Itu sudah 2 sisi.',
    ),
  })

  steps.push({
    phase: 'straight',
    marked: [],
    endCount: 0,
    hold: 2600,
    result: false,
    caption: t(
      'A cube in a straight stretch shows 2 more sides. 2 + 2 = 4 faces. This one COUNTS.',
      'Kubus di bagian lurus menampakkan 2 sisi lagi. 2 + 2 = 4 sisi. Yang ini DIHITUNG.',
    ),
  })

  steps.push({
    phase: 'end',
    marked: [],
    endCount: 0,
    hold: 2100,
    result: false,
    caption: t(
      'But a cube at an END or corner shows 3 more sides. 2 + 3 = 5 faces — too many, it does NOT count.',
      'Tapi kubus di UJUNG atau sudut menampakkan 3 sisi lagi. 2 + 3 = 5 sisi — terlalu banyak, TIDAK dihitung.',
    ),
  })

  // Walk the eliminations: reveal each digit's free ends, growing the running count.
  let running: CubeCell[] = []
  let count = 0
  for (const group of endsByDigit) {
    running = [...running, ...group]
    count += group.length
    const found = group.length
    steps.push({
      phase: 'mark',
      marked: running,
      endCount: count,
      hold: 2000,
      result: false,
      caption: t(
        `Cross off the free ends: ${found} more here — ${count} of ${ends} end cubes found.`,
        `Coret ujung-ujungnya: ${found} lagi di sini — ${count} dari ${ends} kubus ujung ketemu.`,
      ),
    })
  }

  steps.push({
    phase: 'subtract',
    marked: allEnds,
    endCount: ends,
    hold: 2600,
    result: false,
    caption: t(
      `${ends} end cubes have 5 painted faces, so they don't count. ${total} − ${ends} = ${answer}.`,
      `${ends} kubus ujung punya 5 sisi dicat, jadi tak dihitung. ${total} − ${ends} = ${answer}.`,
    ),
  })

  steps.push({
    phase: 'result',
    marked: allEnds,
    endCount: ends,
    hold: 0,
    result: true,
    caption: t(
      `So ${answer} cubes have exactly 4 painted faces.`,
      `Jadi ${answer} kubus dicat tepat 4 sisinya.`,
    ),
  })

  return { total, ends, answer, allEnds, steps, finalIndex: steps.length - 1 }
}
