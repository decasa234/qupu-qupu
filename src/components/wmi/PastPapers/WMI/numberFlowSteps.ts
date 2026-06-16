import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  NF_APPLE,
  NF_INNER_LEFT,
  NF_INNER_RIGHT,
  NF_OUTER_LEFT,
  NF_OUTER_RIGHT,
  NF_TOP_LEFT,
  NF_TOP_RIGHT,
  type NfBox,
} from './NumberFlowIllustration'

export type NumberFlowPhase = 'show' | 'solve' | 'gather' | 'result'

export interface NumberFlowStep {
  phase: NumberFlowPhase
  /** Which middle boxes are lit (computed) on this beat. */
  lit: NfBox[]
  /** Light the apple + show its value. */
  litApple: boolean
  /** Show the apple's numeric value instead of the apple glyph. */
  showAppleValue: boolean
  /** Running value to surface above the figure (null = none). */
  running: number | null
  caption: string
  hold: number
  result: boolean
}

export interface NumberFlowStoryboard {
  apple: number
  steps: NumberFlowStep[]
  finalIndex: number
}

export function buildNumberFlowSteps(lang: Lang): NumberFlowStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: NumberFlowStep[] = [
    {
      phase: 'show',
      lit: [],
      litApple: false,
      showAppleValue: false,
      running: null,
      caption: t(
        `${NF_TOP_LEFT} and ${NF_TOP_RIGHT} each split into two boxes. What number reaches the apple?`,
        `${NF_TOP_LEFT} dan ${NF_TOP_RIGHT} masing-masing terbagi ke dua kotak. Bilangan berapa yang sampai ke apel?`,
      ),
      hold: 1900,
      result: false,
    },
    {
      phase: 'solve',
      lit: [0],
      litApple: false,
      showAppleValue: false,
      running: NF_OUTER_LEFT,
      caption: t(
        `The two boxes under ${NF_TOP_LEFT} add to ${NF_TOP_LEFT}. One is ${NF_INNER_LEFT}, so the blank is ${NF_TOP_LEFT} − ${NF_INNER_LEFT} = ${NF_OUTER_LEFT}.`,
        `Kedua kotak di bawah ${NF_TOP_LEFT} berjumlah ${NF_TOP_LEFT}. Satu kotak ${NF_INNER_LEFT}, jadi kotak kosong = ${NF_TOP_LEFT} − ${NF_INNER_LEFT} = ${NF_OUTER_LEFT}.`,
      ),
      hold: 2600,
      result: false,
    },
    {
      phase: 'solve',
      lit: [0, 3],
      litApple: false,
      showAppleValue: false,
      running: NF_OUTER_RIGHT,
      caption: t(
        `The two boxes under ${NF_TOP_RIGHT} add to ${NF_TOP_RIGHT}. One is ${NF_INNER_RIGHT}, so the blank is ${NF_TOP_RIGHT} − ${NF_INNER_RIGHT} = ${NF_OUTER_RIGHT}.`,
        `Kedua kotak di bawah ${NF_TOP_RIGHT} berjumlah ${NF_TOP_RIGHT}. Satu kotak ${NF_INNER_RIGHT}, jadi kotak kosong = ${NF_TOP_RIGHT} − ${NF_INNER_RIGHT} = ${NF_OUTER_RIGHT}.`,
      ),
      hold: 2600,
      result: false,
    },
    {
      phase: 'gather',
      lit: [0, 3],
      litApple: true,
      showAppleValue: false,
      running: NF_APPLE,
      caption: t(
        `Only the two outer boxes flow into the apple: ${NF_OUTER_LEFT} + ${NF_OUTER_RIGHT}.`,
        `Hanya dua kotak terluar yang mengalir ke apel: ${NF_OUTER_LEFT} + ${NF_OUTER_RIGHT}.`,
      ),
      hold: 2200,
      result: false,
    },
    {
      phase: 'result',
      lit: [0, 3],
      litApple: true,
      showAppleValue: true,
      running: NF_APPLE,
      caption: t(
        `${NF_OUTER_LEFT} + ${NF_OUTER_RIGHT} = ${NF_APPLE}.`,
        `${NF_OUTER_LEFT} + ${NF_OUTER_RIGHT} = ${NF_APPLE}.`,
      ),
      hold: 0,
      result: true,
    },
  ]

  return { apple: NF_APPLE, steps, finalIndex: steps.length - 1 }
}
