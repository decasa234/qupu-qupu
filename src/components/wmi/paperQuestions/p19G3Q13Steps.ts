// Storyboard for the WMI-19P3A-Q13 explainer (C-shaped perimeter).
//
// Idea per beat:
//   1. The perimeter still goes all the way around, including the notch.
//   2. Walk and add the top + right run: 14 + 6 + 7 = 27.
//   3. Add the notch wall + lower run: 3 + 7 + 4 = 14.
//   4. Add the bottom + left: 14 + 13 = 27.
//   5. Result: 27 + 14 + 27 = 68 cm — answer C.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import {
  Q13_W,
  Q13_H,
  Q13_TOP_RIGHT,
  Q13_NOTCH_DEPTH,
  Q13_NOTCH_WALL,
  Q13_BOT_RIGHT,
  Q13_PERIMETER,
  type Q13EdgeKey,
} from './P19G3Q13Illustration'

export type Q13Phase = 'show' | 'partA' | 'partB' | 'partC' | 'result'

export interface Q13Step {
  phase: Q13Phase
  highlight: Q13EdgeKey[]
  /** Running equation line (or null). */
  equation: string | null
  /** Running subtotal so far. */
  runningSum: number | null
  caption: string
  hold: number
  result: boolean
}

export interface Q13Storyboard {
  perimeter: number
  steps: Q13Step[]
  finalIndex: number
}

export function buildP19G3Q13Steps(lang: Lang): Q13Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const partA = Q13_W + Q13_TOP_RIGHT + Q13_NOTCH_DEPTH // 14 + 6 + 7 = 27
  const partB = Q13_NOTCH_WALL + Q13_NOTCH_DEPTH + Q13_BOT_RIGHT // 3 + 7 + 4 = 14
  const partC = Q13_W + Q13_H // 14 + 13 = 27

  const steps: Q13Step[] = [
    {
      phase: 'show',
      highlight: [],
      equation: null,
      runningSum: null,
      hold: 1800,
      result: false,
      caption: t(
        'The perimeter goes all the way around — including in and out of the notch.',
        'Keliling mengelilingi seluruh tepi — termasuk masuk dan keluar takikan.',
      ),
    },
    {
      phase: 'partA',
      highlight: ['top', 'rightTop', 'notchIn'],
      equation: `${Q13_W} + ${Q13_TOP_RIGHT} + ${Q13_NOTCH_DEPTH} = ${partA}`,
      runningSum: partA,
      hold: 2100,
      result: false,
      caption: t(
        `Top and the upper-right run: ${Q13_W} + ${Q13_TOP_RIGHT} + ${Q13_NOTCH_DEPTH} = ${partA}.`,
        `Sisi atas dan jalur kanan-atas: ${Q13_W} + ${Q13_TOP_RIGHT} + ${Q13_NOTCH_DEPTH} = ${partA}.`,
      ),
    },
    {
      phase: 'partB',
      highlight: ['notchWall', 'notchOut', 'rightBot'],
      equation: `${Q13_NOTCH_WALL} + ${Q13_NOTCH_DEPTH} + ${Q13_BOT_RIGHT} = ${partB}`,
      runningSum: partA + partB,
      hold: 2100,
      result: false,
      caption: t(
        `The notch wall and lower-right run: ${Q13_NOTCH_WALL} + ${Q13_NOTCH_DEPTH} + ${Q13_BOT_RIGHT} = ${partB}.`,
        `Dinding takikan dan jalur kanan-bawah: ${Q13_NOTCH_WALL} + ${Q13_NOTCH_DEPTH} + ${Q13_BOT_RIGHT} = ${partB}.`,
      ),
    },
    {
      phase: 'partC',
      highlight: ['bottom', 'left'],
      equation: `${Q13_W} + ${Q13_H} = ${partC}`,
      runningSum: partA + partB + partC,
      hold: 2100,
      result: false,
      caption: t(
        `Bottom and left side: ${Q13_W} + ${Q13_H} = ${partC}.`,
        `Sisi bawah dan kiri: ${Q13_W} + ${Q13_H} = ${partC}.`,
      ),
    },
    {
      phase: 'result',
      highlight: ['top', 'rightTop', 'notchIn', 'notchWall', 'notchOut', 'rightBot', 'bottom', 'left'],
      equation: `${partA} + ${partB} + ${partC} = ${Q13_PERIMETER}`,
      runningSum: Q13_PERIMETER,
      hold: 0,
      result: true,
      caption: t(
        `${partA} + ${partB} + ${partC} = ${Q13_PERIMETER} cm — answer C.`,
        `${partA} + ${partB} + ${partC} = ${Q13_PERIMETER} cm — jawaban C.`,
      ),
    },
  ]

  return { perimeter: Q13_PERIMETER, steps, finalIndex: steps.length - 1 }
}
