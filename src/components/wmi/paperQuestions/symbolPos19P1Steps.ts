import type { Lang } from '../concepts/explainers/makeTenSteps'
import { ANSWER, BOXED_GLYPH, BOXED_POSITION } from './SymbolPos19P1Illustration'

export type SymbolPosPhase = 'show' | 'rule' | 'find' | 'result'

export interface SymbolPosStep {
  phase: SymbolPosPhase
  /** Show the 1..9 position numbers under the rows. */
  showPositions: boolean
  /** Column (0-indexed) to spotlight; null = none. */
  spotlightCol: number | null
  /** Draw the link from the boxed glyph to its row position. */
  matchBoxed: boolean
  caption: string
  hold: number
  result: boolean
}

export interface SymbolPosStoryboard {
  glyph: string
  position: number
  answer: number
  steps: SymbolPosStep[]
  finalIndex: number
}

export function buildSymbolPos19P1Steps(lang: Lang): SymbolPosStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SymbolPosStep[] = [
    {
      phase: 'show',
      showPositions: false,
      spotlightCol: null,
      matchBoxed: false,
      hold: 1700,
      result: false,
      caption: t(
        'Each symbol is numbered by where it sits in the row.',
        'Tiap simbol diberi nomor sesuai letaknya di baris.',
      ),
    },
    {
      phase: 'rule',
      showPositions: true,
      spotlightCol: null,
      matchBoxed: false,
      hold: 2100,
      result: false,
      caption: t(
        'So the rule is: a symbol stands for its position — 1st = 1, 2nd = 2, 3rd = 3, …',
        'Jadi aturannya: simbol bernilai letaknya — ke-1 = 1, ke-2 = 2, ke-3 = 3, …',
      ),
    },
    {
      phase: 'find',
      showPositions: true,
      spotlightCol: BOXED_POSITION - 1,
      matchBoxed: true,
      hold: 2100,
      result: false,
      caption: t(
        `The boxed symbol ${BOXED_GLYPH} matches the one in position ${BOXED_POSITION}.`,
        `Simbol di kotak ${BOXED_GLYPH} sama dengan yang di posisi ${BOXED_POSITION}.`,
      ),
    },
    {
      phase: 'result',
      showPositions: true,
      spotlightCol: BOXED_POSITION - 1,
      matchBoxed: true,
      hold: 0,
      result: true,
      caption: t(
        `Position ${BOXED_POSITION} → it stands for ${ANSWER} — answer D.`,
        `Posisi ${BOXED_POSITION} → bernilai ${ANSWER} — jawaban D.`,
      ),
    },
  ]

  return {
    glyph: BOXED_GLYPH,
    position: BOXED_POSITION,
    answer: ANSWER,
    steps,
    finalIndex: steps.length - 1,
  }
}
