import type { Lang } from '../concepts/explainers/makeTenSteps'
import { TOTAL_CUBES, cubesInLevel } from './P19G2Q5Illustration'

// Storyboard for WMI-19P2A-Q5 — count the cube pile layer by layer.
//
// litLevel highlights horizontal layers cumulatively (1 = bottom layer lit).
// Layer counts come straight from the height-map:
//   bottom (z=0): 12, middle (z=1): 8, top (z=2): 1  →  12 + 8 + 1 = 21.
// The trap (19) is "visible cubes only" — counting layers forces you to include
// the hidden support cubes underneath.

const L0 = cubesInLevel(0) // 12
const L1 = cubesInLevel(1) // 8
const L2 = cubesInLevel(2) // 1

export interface Q5Step {
  /** Layers highlighted so far (0 = none, 1 = bottom, 2 = +middle, 3 = +top). */
  litLevel: number
  caption: string
  hold: number
  result: boolean
}

export interface Q5Storyboard {
  total: number
  steps: Q5Step[]
  finalIndex: number
}

export function buildP19G2Q5Steps(lang: Lang): Q5Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q5Step[] = [
    {
      litLevel: 0,
      hold: 1700,
      result: false,
      caption: t(
        'Count by horizontal layers, bottom to top — and include the hidden support cubes.',
        'Hitung per lapis mendatar, dari bawah ke atas — termasuk kubus penopang yang tersembunyi.',
      ),
    },
    {
      litLevel: 1,
      hold: 2000,
      result: false,
      caption: t(
        `Bottom layer fills the whole footprint: ${L0} cubes.`,
        `Lapis bawah menutupi seluruh alas: ${L0} kubus.`,
      ),
    },
    {
      litLevel: 2,
      hold: 2000,
      result: false,
      caption: t(
        `Middle layer sits only where a cube is stacked: ${L1} cubes. Now ${L0} + ${L1} = ${L0 + L1}.`,
        `Lapis tengah hanya di tempat ada tumpukan: ${L1} kubus. Sekarang ${L0} + ${L1} = ${L0 + L1}.`,
      ),
    },
    {
      litLevel: 3,
      hold: 0,
      result: true,
      caption: t(
        `Top layer is the single tall column: ${L2} cube. ${L0} + ${L1} + ${L2} = ${TOTAL_CUBES} cubes — answer C.`,
        `Lapis atas hanya satu kolom tertinggi: ${L2} kubus. ${L0} + ${L1} + ${L2} = ${TOTAL_CUBES} kubus — jawaban C.`,
      ),
    },
  ]

  return { total: TOTAL_CUBES, steps, finalIndex: steps.length - 1 }
}
