// Deterministic storyboard for WMI-25P3A-Q18 (2025 Grade 3 Semifinal).
//
// A circle of radius 2 cm rolls once around the inside of a 10 cm × 8 cm
// rectangle. The CENTER always stays one radius (2 cm) away from every wall, so
// it traces a smaller rectangle pulled in by 2 cm on each of the four walls:
//   width  = 10 − 2 − 2 = 6
//   height =  8 − 2 − 2 = 4
// Center path length = 2 × (6 + 4) = 20 cm (answer A).

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  CENTER_PATH_CM,
  INNER_H_CM,
  INNER_W_CM,
  RADIUS_CM,
  RECT_H_CM,
  RECT_W_CM,
} from './P25G3Q18Illustration'

export const Q18_ANSWER_LABEL = 'A'

export interface Q18Step {
  highlightPath: boolean
  showInnerDims: boolean
  showCircle: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q18Storyboard {
  answer: number
  answerLabel: string
  steps: Q18Step[]
  finalIndex: number
}

export function buildP25G3Q18Steps(lang: Lang): Q18Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q18Step[] = [
    {
      highlightPath: false,
      showInnerDims: false,
      showCircle: true,
      hold: 1800,
      result: false,
      caption: t(
        `The circle has radius ${RADIUS_CM} cm and rolls around inside a ${RECT_W_CM} × ${RECT_H_CM} box.`,
        `Lingkaran berjari-jari ${RADIUS_CM} cm menggelinding di dalam kotak ${RECT_W_CM} × ${RECT_H_CM}.`,
      ),
    },
    {
      highlightPath: true,
      showInnerDims: false,
      showCircle: true,
      hold: 2200,
      result: false,
      caption: t(
        `The center can never touch a wall — it stays ${RADIUS_CM} cm inside every wall.`,
        `Pusat tak pernah menyentuh dinding — selalu ${RADIUS_CM} cm di dalam tiap dinding.`,
      ),
    },
    {
      highlightPath: true,
      showInnerDims: false,
      showCircle: false,
      hold: 2200,
      result: false,
      caption: t(
        'So the center traces a smaller rectangle (the dashed path).',
        'Jadi pusat menelusuri persegi panjang lebih kecil (garis putus-putus).',
      ),
    },
    {
      highlightPath: true,
      showInnerDims: true,
      showCircle: false,
      hold: 2400,
      result: false,
      caption: t(
        `Both walls pull it in: width ${RECT_W_CM} − ${RADIUS_CM} − ${RADIUS_CM} = ${INNER_W_CM}, height ${RECT_H_CM} − ${RADIUS_CM} − ${RADIUS_CM} = ${INNER_H_CM}.`,
        `Kedua dinding menariknya masuk: panjang ${RECT_W_CM} − ${RADIUS_CM} − ${RADIUS_CM} = ${INNER_W_CM}, lebar ${RECT_H_CM} − ${RADIUS_CM} − ${RADIUS_CM} = ${INNER_H_CM}.`,
      ),
    },
    {
      highlightPath: true,
      showInnerDims: true,
      showCircle: false,
      hold: 0,
      result: true,
      caption: t(
        `Path = 2 × (${INNER_W_CM} + ${INNER_H_CM}) = ${CENTER_PATH_CM} cm — answer ${Q18_ANSWER_LABEL}.`,
        `Lintasan = 2 × (${INNER_W_CM} + ${INNER_H_CM}) = ${CENTER_PATH_CM} cm — jawaban ${Q18_ANSWER_LABEL}.`,
      ),
    },
  ]

  return {
    answer: CENTER_PATH_CM,
    answerLabel: Q18_ANSWER_LABEL,
    steps,
    finalIndex: steps.length - 1,
  }
}
