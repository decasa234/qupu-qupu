import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { FACE_ROWS, LAYER_COUNTS, TOTAL_CUBES } from './P23G3Q18Illustration'

// WMI-23P3A-Q18 — count the unit cubes of a one-cube-thick wall by sweeping up
// layer by layer (the method the hint names). Each beat lights one more bottom
// row and adds its cube count to a running total, landing on 49 → choice C.
// Every number derives from LAYER_COUNTS / TOTAL_CUBES, never a literal.

export interface CubeLayerStep {
  /** Lowest N rows lit (counted bottom → top). */
  litLayers: number
  /** Running cube total so far. */
  count: number
  /** True on the closing total beat. */
  result: boolean
  caption: string
  hold: number
}

export interface CubeLayerStoryboard {
  answer: number
  steps: CubeLayerStep[]
  finalIndex: number
}

export function buildP23G3Q18Steps(lang: Lang): CubeLayerStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CubeLayerStep[] = []

  // Beat 0 — state the method.
  steps.push({
    litLayers: 0,
    count: 0,
    result: false,
    hold: 2200,
    caption: t(
      'The wall is just one cube thick. Count it layer by layer, from the bottom up.',
      'Tembok ini hanya setebal satu kubus. Hitung lapis demi lapis, dari bawah ke atas.',
    ),
  })

  // One beat per layer, bottom → top, accumulating the running total.
  let running = 0
  for (let i = 0; i < FACE_ROWS; i++) {
    const n = LAYER_COUNTS[i]
    running += n
    const layerNo = i + 1
    steps.push({
      litLayers: layerNo,
      count: running,
      result: false,
      hold: 1300,
      caption: t(
        `Layer ${layerNo} from the bottom has ${n} cubes → running total ${running}.`,
        `Lapis ke-${layerNo} dari bawah ada ${n} kubus → jumlah berjalan ${running}.`,
      ),
    })
  }

  // Final beat — total → 49 → C.
  steps.push({
    litLayers: FACE_ROWS,
    count: TOTAL_CUBES,
    result: true,
    hold: 0,
    caption: t(
      `All layers add to ${TOTAL_CUBES} cubes — answer C.`,
      `Semua lapis berjumlah ${TOTAL_CUBES} kubus — jawaban C.`,
    ),
  })

  return { answer: TOTAL_CUBES, steps, finalIndex: steps.length - 1 }
}
