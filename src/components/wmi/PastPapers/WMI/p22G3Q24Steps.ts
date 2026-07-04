import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  BAND_UNDER_RIGHT,
  BLOCK_AREA,
  FULL_HEIGHT,
  RIGHT_COL_AREA,
  RIGHT_WIDTH,
  STAR_AREA,
  TOTAL_WIDTH,
} from './P22G3Q24Illustration'

// Storyboard for WMI-22P3A-Q24 — find ★ (the blue base band's area).
//
// Method (the only one the figure supports — the blocks have DIFFERENT heights,
// so no bounding rectangle exists): the right column is the key. The width-7
// block plus the band strip under it stand exactly 13 tall, so that column's
// area is 7 × 13 = 91. The block uses 75, leaving 91 − 75 = 16 for the strip.
// The band spans 8 + 6 + 7 = 21 = 3 × 7 — three such strips → ★ = 3 × 16 = 48
// (answer C).

export interface Q24Step {
  highlightRight: boolean
  rightStripLabel?: string
  bandLabel?: string
  caption: string
  hold: number
  result: boolean
}

export interface Q24Storyboard {
  star: number
  steps: Q24Step[]
  finalIndex: number
}

export function buildP22G3Q24Steps(lang: Lang): Q24Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q24Step[] = [
    {
      highlightRight: false,
      hold: 2000,
      result: false,
      caption: t(
        `Each block has area ${BLOCK_AREA}; the widths on top are 8, 6 and 7. The ★ band runs under all three.`,
        `Tiap balok luasnya ${BLOCK_AREA}; lebar di atasnya 8, 6, dan 7. Pita ★ membentang di bawah ketiganya.`,
      ),
    },
    {
      highlightRight: true,
      hold: 2300,
      result: false,
      caption: t(
        `Look at the right column: the width-${RIGHT_WIDTH} block plus the band under it stand exactly ${FULL_HEIGHT} tall → ${RIGHT_WIDTH} × ${FULL_HEIGHT} = ${RIGHT_COL_AREA}.`,
        `Lihat kolom kanan: balok selebar ${RIGHT_WIDTH} ditambah pita di bawahnya tepat setinggi ${FULL_HEIGHT} → ${RIGHT_WIDTH} × ${FULL_HEIGHT} = ${RIGHT_COL_AREA}.`,
      ),
    },
    {
      highlightRight: true,
      rightStripLabel: `${BAND_UNDER_RIGHT}`,
      hold: 2300,
      result: false,
      caption: t(
        `The block uses ${BLOCK_AREA}, so the band strip under it is ${RIGHT_COL_AREA} − ${BLOCK_AREA} = ${BAND_UNDER_RIGHT}.`,
        `Balok memakai ${BLOCK_AREA}, jadi potongan pita di bawahnya ${RIGHT_COL_AREA} − ${BLOCK_AREA} = ${BAND_UNDER_RIGHT}.`,
      ),
    },
    {
      highlightRight: false,
      bandLabel: `${STAR_AREA}`,
      hold: 0,
      result: true,
      caption: t(
        `The band is 8 + 6 + 7 = ${TOTAL_WIDTH} wide = 3 × ${RIGHT_WIDTH} — three strips of ${BAND_UNDER_RIGHT} → ★ = 3 × ${BAND_UNDER_RIGHT} = ${STAR_AREA} — answer C.`,
        `Pita selebar 8 + 6 + 7 = ${TOTAL_WIDTH} = 3 × ${RIGHT_WIDTH} — tiga potongan ${BAND_UNDER_RIGHT} → ★ = 3 × ${BAND_UNDER_RIGHT} = ${STAR_AREA} — jawaban C.`,
      ),
    },
  ]

  return { star: STAR_AREA, steps, finalIndex: steps.length - 1 }
}
