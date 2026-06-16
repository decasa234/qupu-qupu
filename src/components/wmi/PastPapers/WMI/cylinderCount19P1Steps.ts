import type { Lang } from '../concepts/explainers/makeTenSteps'
import { LAYER_COUNTS, TOTAL_CYLINDERS } from './CylinderCount19P1Illustration'

export type CylPhase = 'show' | 'layer' | 'result'

export interface CylStep {
  phase: CylPhase
  /** Which horizontal layer to glow; undefined = show the whole pile plain. */
  litLayer?: number
  /** Fade out the layers above the lit one. */
  dimAbove: boolean
  /** Running cylinder total revealed so far. */
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface CylStoryboard {
  layerCounts: number[]
  answer: number
  steps: CylStep[]
  finalIndex: number
}

/**
 * Beat storyboard for WMI-19P1A-Q10: count the pile one horizontal LAYER at a
 * time, bottom → top, with a running total that lands on 17.
 *
 *   bottom (z0) = 8        running 8
 *   middle (z1) = 6        running 8 + 6 = 14
 *   top    (z2) = 3        running 14 + 3 = 17   (answer C)
 *
 * Layer sizes come from the illustration's data so the storyboard never drifts.
 */
export function buildCylinderCount19P1Steps(lang: Lang): CylStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const [floor, mid, top] = LAYER_COUNTS // [8, 6, 3]
  const runFloor = floor // 8
  const runMid = floor + mid // 14
  const runTop = floor + mid + top // 17

  const steps: CylStep[] = [
    {
      phase: 'show',
      litLayer: undefined,
      dimAbove: false,
      running: 0,
      hold: 1700,
      result: false,
      caption: t(
        'Some cylinders hide behind the front ones — they still count. Count layer by layer, bottom to top.',
        'Beberapa silinder tersembunyi di belakang — tetap dihitung. Hitung lapis demi lapis, dari bawah ke atas.',
      ),
    },
    {
      phase: 'layer',
      litLayer: 0,
      dimAbove: true,
      running: runFloor,
      hold: 2000,
      result: false,
      caption: t(
        `Bottom layer: ${floor} cylinders form the wide base. Running total = ${runFloor}.`,
        `Lapisan bawah: ${floor} silinder membentuk alas lebar. Jumlah sementara = ${runFloor}.`,
      ),
    },
    {
      phase: 'layer',
      litLayer: 1,
      dimAbove: true,
      running: runMid,
      hold: 2000,
      result: false,
      caption: t(
        `Middle layer: ${mid} cylinders nestle in the gaps. ${runFloor} + ${mid} = ${runMid}.`,
        `Lapisan tengah: ${mid} silinder mengisi sela. ${runFloor} + ${mid} = ${runMid}.`,
      ),
    },
    {
      phase: 'layer',
      litLayer: 2,
      dimAbove: true,
      running: runTop,
      hold: 1900,
      result: false,
      caption: t(
        `Top layer: ${top} cylinders poke up on top. ${runMid} + ${top} = ${runTop}.`,
        `Lapisan atas: ${top} silinder menyembul di atas. ${runMid} + ${top} = ${runTop}.`,
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
        `${floor} + ${mid} + ${top} = ${TOTAL_CYLINDERS} cylinders — answer C.`,
        `${floor} + ${mid} + ${top} = ${TOTAL_CYLINDERS} silinder — jawaban C.`,
      ),
    },
  ]

  return {
    layerCounts: LAYER_COUNTS,
    answer: TOTAL_CYLINDERS,
    steps,
    finalIndex: steps.length - 1,
  }
}
