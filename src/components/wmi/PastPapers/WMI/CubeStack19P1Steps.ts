import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { LAYER_COUNTS, TOTAL_CUBES } from './CubeStack19P1Illustration'

export type CubePhase = 'show' | 'layer' | 'result'

export interface CubeStep {
  phase: CubePhase
  /** Which horizontal layer (z) to glow; undefined = show the whole solid plain. */
  litLayer?: number
  /** Fade out the layers above the lit one (so the layer being counted stands out). */
  dimAbove: boolean
  /** Running cube total revealed so far. */
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface CubeStoryboard {
  layerCounts: number[]
  answer: number
  steps: CubeStep[]
  finalIndex: number
}

/**
 * Beat storyboard for WMI-19P1A-Q4: count the stack one horizontal LAYER at a
 * time, bottom → top, with a running total that lands on 19.
 *
 *   floor (z0) = LAYER_COUNTS[0] = 8        running 8
 *   middle(z1) = LAYER_COUNTS[1] = 7        running 8 + 7 = 15
 *   top   (z2) = LAYER_COUNTS[2] = 4        running 15 + 4 = 19   (answer B)
 *
 * One idea per beat, each with the concrete running count. Layer sizes come from
 * the illustration's data so the storyboard can never drift from the figure.
 */
export function buildCubeStack19P1Steps(lang: Lang): CubeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const [floor, mid, top] = LAYER_COUNTS // [8, 7, 4]
  const runFloor = floor // 8
  const runMid = floor + mid // 15
  const runTop = floor + mid + top // 19

  const ordinal = (en: string, id: string) => t(en, id)

  const steps: CubeStep[] = [
    {
      phase: 'show',
      litLayer: undefined,
      dimAbove: false,
      running: 0,
      hold: 1700,
      result: false,
      caption: t(
        'Hidden cubes hide behind the front ones. Count layer by layer, bottom to top.',
        'Ada kubus tersembunyi di belakang. Hitung lapis demi lapis, dari bawah ke atas.',
      ),
    },
    {
      phase: 'layer',
      litLayer: 0,
      dimAbove: true,
      running: runFloor,
      hold: 2000,
      result: false,
      caption: ordinal(
        `Bottom layer: ${floor} cubes fill the floor. Running total = ${runFloor}.`,
        `Lapisan bawah: ${floor} kubus menutupi lantai. Jumlah sementara = ${runFloor}.`,
      ),
    },
    {
      phase: 'layer',
      litLayer: 1,
      dimAbove: true,
      running: runMid,
      hold: 2000,
      result: false,
      caption: ordinal(
        `Middle layer: ${mid} more cubes. ${runFloor} + ${mid} = ${runMid}.`,
        `Lapisan tengah: ${mid} kubus lagi. ${runFloor} + ${mid} = ${runMid}.`,
      ),
    },
    {
      phase: 'layer',
      litLayer: 2,
      dimAbove: true,
      running: runTop,
      hold: 1900,
      result: false,
      caption: ordinal(
        `Top layer: ${top} cubes poke up. ${runMid} + ${top} = ${runTop}.`,
        `Lapisan atas: ${top} kubus menyembul. ${runMid} + ${top} = ${runTop}.`,
      ),
    },
    {
      phase: 'result',
      litLayer: undefined,
      dimAbove: false,
      running: runTop,
      hold: 0,
      result: true,
      caption: t(
        `${floor} + ${mid} + ${top} = ${TOTAL_CUBES} cubes — answer B.`,
        `${floor} + ${mid} + ${top} = ${TOTAL_CUBES} kubus — jawaban B.`,
      ),
    },
  ]

  return {
    layerCounts: LAYER_COUNTS,
    answer: TOTAL_CUBES,
    steps,
    finalIndex: steps.length - 1,
  }
}
