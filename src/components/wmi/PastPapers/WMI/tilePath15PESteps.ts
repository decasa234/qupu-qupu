// Storyboard for IKMC-22-PE-Q15 — tile-path around a square of side 5.
// Strategy: border area = outer² − inner² = 7² − 5² = 49 − 25 = 24 unit cells.
// Each tile covers 2 unit cells (1 tall × 2 wide) → 24 ÷ 2 = 12 tiles (answer C).
//
// Pure (lang) → beats; all arithmetic derives from the exported STAGE_DATA and
// the TARGET_SIDE constant so the explainer arithmetic can never drift.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type TilePathPhase =
  | 'goal'
  | 'outer'     // show the outer square dimension
  | 'area'      // highlight border area = 49 − 25 = 24
  | 'tile'      // show one tile covers 2 unit cells
  | 'divide'    // 24 ÷ 2 = 12
  | 'result'

export interface TilePathStep {
  phase: TilePathPhase
  /** Which stage index (0=side1, 1=side3, 2=side5) is spotlighted, or -1. */
  focusStage: number
  /** Whether to highlight the border (frame region) in the focused stage. */
  highlightBorder: boolean
  /** Whether to show the formula meter. */
  showFormula: boolean
  /** Whether to show the result chip. */
  result: boolean
  caption: string
  hold: number
}

export interface TilePathStoryboard {
  /** Inner square side asked about (5). */
  inner: number
  /** Outer square side (inner + 2 = 7). */
  outer: number
  /** Border area in unit cells (49 − 25 = 24). */
  borderArea: number
  /** Tile footprint in unit cells (2). */
  tileArea: number
  /** Correct tile count (24 ÷ 2 = 12). */
  answer: number
  steps: TilePathStep[]
  finalIndex: number
}

export function buildTilePath15PESteps(lang: Lang): TilePathStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const inner = 5
  const outer = inner + 2                  // 7
  const borderArea = outer ** 2 - inner ** 2  // 49 − 25 = 24
  const tileArea = 2                       // each tile = 1 × 2 cells
  const answer = borderArea / tileArea     // 24 ÷ 2 = 12

  const outerSq = outer ** 2   // 49
  const innerSq = inner ** 2   // 25

  const steps: TilePathStep[] = []

  // Beat 0 — state the goal.
  steps.push({
    phase: 'goal',
    focusStage: -1,
    highlightBorder: false,
    showFormula: false,
    result: false,
    hold: 2600,
    caption: t(
      `Katrin surrounds a ${inner}×${inner} square with 1-unit-wide path tiles. Each tile is 1 unit tall and 2 units wide. How many tiles fit around it?`,
      `Katrin mengelilingi persegi ${inner}×${inner} dengan jalur ubin selebar 1 satuan. Setiap ubin tinggi 1 satuan, lebar 2 satuan. Berapa ubin yang dibutuhkan?`,
    ),
  })

  // Beat 1 — the border is 1 unit wide, so the outer square has side inner + 2.
  steps.push({
    phase: 'outer',
    focusStage: 2,   // spotlight the side-5 figure
    highlightBorder: false,
    showFormula: false,
    result: false,
    hold: 2400,
    caption: t(
      `The path is 1 unit wide on every side, so the outer square has side ${inner} + 2 = ${outer} units.`,
      `Jalur selebar 1 satuan di setiap sisi, sehingga persegi luar berukuran ${inner} + 2 = ${outer} satuan.`,
    ),
  })

  // Beat 2 — border area = outer² − inner².
  steps.push({
    phase: 'area',
    focusStage: 2,
    highlightBorder: true,
    showFormula: true,
    result: false,
    hold: 2800,
    caption: t(
      `Border area = outer² − inner² = ${outer}² − ${inner}² = ${outerSq} − ${innerSq} = ${borderArea} unit cells.`,
      `Luas jalur = luar² − dalam² = ${outer}² − ${inner}² = ${outerSq} − ${innerSq} = ${borderArea} kotak satuan.`,
    ),
  })

  // Beat 3 — each tile covers 2 unit cells.
  steps.push({
    phase: 'tile',
    focusStage: 0,   // side-1 example to show one tile clearly
    highlightBorder: false,
    showFormula: true,
    result: false,
    hold: 2400,
    caption: t(
      `Each tile is 1 × 2 units — it covers exactly 2 unit cells. So we divide: ${borderArea} ÷ 2.`,
      `Setiap ubin berukuran 1 × 2 satuan — menutupi tepat 2 kotak satuan. Jadi: ${borderArea} ÷ 2.`,
    ),
  })

  // Beat 4 — compute the answer.
  steps.push({
    phase: 'divide',
    focusStage: -1,
    highlightBorder: false,
    showFormula: true,
    result: false,
    hold: 2200,
    caption: t(
      `${borderArea} ÷ ${tileArea} = ${answer} tiles around the ${inner}×${inner} square.`,
      `${borderArea} ÷ ${tileArea} = ${answer} ubin mengelilingi persegi ${inner}×${inner}.`,
    ),
  })

  // Beat 5 — result.
  steps.push({
    phase: 'result',
    focusStage: -1,
    highlightBorder: false,
    showFormula: true,
    result: true,
    hold: 0,
    caption: t(
      `Answer C: ${answer} tiles.`,
      `Jawaban C: ${answer} ubin.`,
    ),
  })

  return {
    inner,
    outer,
    borderArea,
    tileArea,
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
