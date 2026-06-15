import type { Lang } from '../concepts/explainers/makeTenSteps'
import {
  ANSWER,
  BOARD1,
  BOARD2,
  BOARD3,
  V1,
  V2,
  V3,
  type Cell,
} from './NumberBoard19P1Illustration'

export type BoardPhase = 'show' | 'read1' | 'read2' | 'read3' | 'result'

export interface BoardStep {
  phase: BoardPhase
  /** Which problem board's black cell is being read (1..3), or 0 = none. */
  readBoard: 0 | 1 | 2 | 3
  /** The value-grid cell to ring while reading, if any. */
  litCell?: Cell
  /** Labels to print under boards 1/2/3 once their value is known. */
  labels: [number | undefined, number | undefined, number | undefined]
  /** Running value of the expression revealed so far (as text). */
  running: string
  caption: string
  hold: number
  result: boolean
}

export interface BoardStoryboard {
  v1: number
  v2: number
  v3: number
  answer: number
  steps: BoardStep[]
  finalIndex: number
}

/**
 * Beat storyboard for WMI-19P1A-Q9. Read each black cell's value off the value
 * board one beat at a time, then do the arithmetic, landing on 4 + 6 - 2 = 8.
 * Values come from the illustration's data so the storyboard cannot drift.
 */
export function buildNumberBoard19P1Steps(lang: Lang): BoardStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BoardStep[] = [
    {
      phase: 'show',
      readBoard: 0,
      labels: [undefined, undefined, undefined],
      running: '',
      hold: 1700,
      result: false,
      caption: t(
        'Each black cell stands for the number printed in that spot on the value board.',
        'Setiap sel hitam mewakili angka yang tercetak di posisi itu pada papan nilai.',
      ),
    },
    {
      phase: 'read1',
      readBoard: 1,
      litCell: BOARD1,
      labels: [V1, undefined, undefined],
      running: `${V1}`,
      hold: 1900,
      result: false,
      caption: t(
        `Board 1: black cell is top-left → ${V1}.`,
        `Papan 1: sel hitam di kiri-atas → ${V1}.`,
      ),
    },
    {
      phase: 'read2',
      readBoard: 2,
      litCell: BOARD2,
      labels: [V1, V2, undefined],
      running: `${V1} + ${V2} = ${V1 + V2}`,
      hold: 1900,
      result: false,
      caption: t(
        `Board 2: black cell is bottom row, 2nd column → ${V2}. So ${V1} + ${V2} = ${V1 + V2}.`,
        `Papan 2: sel hitam di baris bawah, kolom ke-2 → ${V2}. Jadi ${V1} + ${V2} = ${V1 + V2}.`,
      ),
    },
    {
      phase: 'read3',
      readBoard: 3,
      litCell: BOARD3,
      labels: [V1, V2, V3],
      running: `${V1} + ${V2} − ${V3}`,
      hold: 1900,
      result: false,
      caption: t(
        `Board 3 is subtracted: bottom row, 3rd column → ${V3}.`,
        `Papan 3 dikurangkan: baris bawah, kolom ke-3 → ${V3}.`,
      ),
    },
    {
      phase: 'result',
      readBoard: 0,
      labels: [V1, V2, V3],
      running: `${V1} + ${V2} − ${V3} = ${ANSWER}`,
      hold: 0,
      result: true,
      caption: t(
        `${V1} + ${V2} − ${V3} = ${ANSWER} — answer C.`,
        `${V1} + ${V2} − ${V3} = ${ANSWER} — jawaban C.`,
      ),
    },
  ]

  return { v1: V1, v2: V2, v3: V3, answer: ANSWER, steps, finalIndex: steps.length - 1 }
}

// re-export so the explainer can map a board index to its black cell.
export const PROBLEM_BOARDS: [Cell, Cell, Cell] = [BOARD1, BOARD2, BOARD3]
