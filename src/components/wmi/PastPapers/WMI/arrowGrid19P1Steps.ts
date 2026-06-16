import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { ANSWER, ARROW, MOVES, START, pathValues } from './ArrowGrid19P1Illustration'

export type ArrowGridPhase = 'show' | 'move' | 'result'

export interface ArrowGridStep {
  phase: ArrowGridPhase
  movesDone: number
  showStart: boolean
  showCurrent: boolean
  showLanding: boolean
  spotlightMove: number | null
  caption: string
  hold: number
  result: boolean
}

export interface ArrowGridStoryboard {
  start: number
  answer: number
  steps: ArrowGridStep[]
  finalIndex: number
}

const DELTA_TEXT: Record<'up' | 'down' | 'left' | 'right', string> = {
  up: '−10',
  down: '+10',
  left: '−1',
  right: '+1',
}

const DELTA_WORD_EN: Record<'up' | 'down' | 'left' | 'right', string> = {
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right',
}
const DELTA_WORD_ID: Record<'up' | 'down' | 'left' | 'right', string> = {
  up: 'atas',
  down: 'bawah',
  left: 'kiri',
  right: 'kanan',
}

export function buildArrowGrid19P1Steps(lang: Lang): ArrowGridStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const path = pathValues()

  const steps: ArrowGridStep[] = [
    {
      phase: 'show',
      movesDone: 0,
      showStart: true,
      showCurrent: false,
      showLanding: false,
      spotlightMove: null,
      hold: 1700,
      result: false,
      caption: t(
        `Start on ${START}. Each arrow is one step: → +1, ← −1, ↑ −10, ↓ +10.`,
        `Mulai di ${START}. Tiap panah satu langkah: → +1, ← −1, ↑ −10, ↓ +10.`,
      ),
    },
  ]

  // One beat per move: spotlight the arrow, slide to the new cell, show the sum.
  for (let i = 0; i < MOVES.length; i++) {
    const m = MOVES[i]
    const from = path[i]
    const to = path[i + 1]
    steps.push({
      phase: 'move',
      movesDone: i + 1,
      showStart: true,
      showCurrent: true,
      showLanding: false,
      spotlightMove: i,
      hold: 1300,
      result: false,
      caption: t(
        `${ARROW[m]} ${DELTA_WORD_EN[m]} ${DELTA_TEXT[m]}: ${from} ${DELTA_TEXT[m]} = ${to}.`,
        `${ARROW[m]} ${DELTA_WORD_ID[m]} ${DELTA_TEXT[m]}: ${from} ${DELTA_TEXT[m]} = ${to}.`,
      ),
    })
  }

  steps.push({
    phase: 'result',
    movesDone: MOVES.length,
    showStart: true,
    showCurrent: false,
    showLanding: true,
    spotlightMove: null,
    hold: 0,
    result: true,
    caption: t(
      `It lands on ${ANSWER} — answer B.`,
      `Berhenti di ${ANSWER} — jawaban B.`,
    ),
  })

  return {
    start: START,
    answer: ANSWER,
    steps,
    finalIndex: steps.length - 1,
  }
}
