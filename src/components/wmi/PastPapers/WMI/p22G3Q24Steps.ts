import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  BLOCK_AREA,
  BLOCKS_AREA,
  BOUNDING_AREA,
  FULL_HEIGHT,
  STAR_AREA,
  TOTAL_WIDTH,
} from './P22G3Q24Illustration'

// Storyboard for WMI-22P3A-Q24 — find ★ (the blue base band's area).
//
// Method: the three blocks + the band together fill one big rectangle that is
//   width = 8 + 6 + 7 = 21  and  height = 13  →  area = 273.
// The three blocks are each 75, so 3 × 75 = 225 of that is used by the blocks.
// What is left is the blue ★ band:  273 − 225 = 48 (answer C).

export interface Q24Step {
  showBounding: boolean
  emphasizeBounding: boolean
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
      showBounding: false,
      emphasizeBounding: false,
      hold: 2000,
      result: false,
      caption: t(
        'The three blocks and the blue band together fill one big rectangle.',
        'Ketiga balok dan pita biru bersama-sama mengisi satu persegi panjang besar.',
      ),
    },
    {
      showBounding: true,
      emphasizeBounding: true,
      hold: 2300,
      result: false,
      caption: t(
        `Its width is 8 + 6 + 7 = ${TOTAL_WIDTH} and its height is ${FULL_HEIGHT}, so the big rectangle = ${TOTAL_WIDTH} × ${FULL_HEIGHT} = ${BOUNDING_AREA}.`,
        `Lebarnya 8 + 6 + 7 = ${TOTAL_WIDTH} dan tingginya ${FULL_HEIGHT}, jadi persegi panjang besar = ${TOTAL_WIDTH} × ${FULL_HEIGHT} = ${BOUNDING_AREA}.`,
      ),
    },
    {
      showBounding: true,
      emphasizeBounding: true,
      hold: 2300,
      result: false,
      caption: t(
        `Each of the 3 blocks is ${BLOCK_AREA}, so the blocks take 3 × ${BLOCK_AREA} = ${BLOCKS_AREA}.`,
        `Tiap dari 3 balok bernilai ${BLOCK_AREA}, jadi balok-balok memakai 3 × ${BLOCK_AREA} = ${BLOCKS_AREA}.`,
      ),
    },
    {
      showBounding: true,
      emphasizeBounding: false,
      bandLabel: `${STAR_AREA}`,
      hold: 0,
      result: true,
      caption: t(
        `★ = big rectangle − blocks = ${BOUNDING_AREA} − ${BLOCKS_AREA} = ${STAR_AREA} — answer C.`,
        `★ = persegi panjang besar − balok = ${BOUNDING_AREA} − ${BLOCKS_AREA} = ${STAR_AREA} — jawaban C.`,
      ),
    },
  ]

  return { star: STAR_AREA, steps, finalIndex: steps.length - 1 }
}
