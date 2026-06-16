import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { DIFFERENCE, LONG_LEN, LONG_PENCIL, SHORT_LEN, SHORT_PENCIL } from './P25G2Q3Illustration'

export type RulerPhase = 'show' | 'long' | 'short' | 'difference' | 'result'

export interface RulerStep {
  phase: RulerPhase
  markLong: boolean
  markShort: boolean
  caption: string
  hold: number
  result: boolean
}

export interface RulerStoryboard {
  longLen: number
  shortLen: number
  difference: number
  answer: string
  steps: RulerStep[]
  finalIndex: number
}

export function buildP25G2Q3Steps(lang: Lang): RulerStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RulerStep[] = [
    {
      phase: 'show',
      markLong: false,
      markShort: false,
      hold: 1700,
      result: false,
      caption: t(
        'A pencil is NOT at 0 — read both ends on the ruler.',
        'Pensil tidak mulai dari 0 — baca kedua ujungnya di penggaris.',
      ),
    },
    {
      phase: 'long',
      markLong: true,
      markShort: false,
      hold: 2100,
      result: false,
      caption: t(
        `Long pencil: from ${LONG_PENCIL.back} to ${LONG_PENCIL.tip}, so ${LONG_PENCIL.tip} − ${LONG_PENCIL.back} = ${LONG_LEN} cm.`,
        `Pensil panjang: dari ${LONG_PENCIL.back} sampai ${LONG_PENCIL.tip}, jadi ${LONG_PENCIL.tip} − ${LONG_PENCIL.back} = ${LONG_LEN} cm.`,
      ),
    },
    {
      phase: 'short',
      markLong: true,
      markShort: true,
      hold: 2100,
      result: false,
      caption: t(
        `Short pencil: from ${SHORT_PENCIL.back} to ${SHORT_PENCIL.tip}, so ${SHORT_PENCIL.tip} − ${SHORT_PENCIL.back} = ${SHORT_LEN} cm.`,
        `Pensil pendek: dari ${SHORT_PENCIL.back} sampai ${SHORT_PENCIL.tip}, jadi ${SHORT_PENCIL.tip} − ${SHORT_PENCIL.back} = ${SHORT_LEN} cm.`,
      ),
    },
    {
      phase: 'difference',
      markLong: true,
      markShort: true,
      hold: 1900,
      result: false,
      caption: t(
        `Difference = longer − shorter = ${LONG_LEN} − ${SHORT_LEN}.`,
        `Selisih = yang panjang − yang pendek = ${LONG_LEN} − ${SHORT_LEN}.`,
      ),
    },
    {
      phase: 'result',
      markLong: true,
      markShort: true,
      hold: 0,
      result: true,
      caption: t(
        `${LONG_LEN} − ${SHORT_LEN} = ${DIFFERENCE} cm — answer B.`,
        `${LONG_LEN} − ${SHORT_LEN} = ${DIFFERENCE} cm — jawaban B.`,
      ),
    },
  ]

  return {
    longLen: LONG_LEN,
    shortLen: SHORT_LEN,
    difference: DIFFERENCE,
    answer: 'B',
    steps,
    finalIndex: steps.length - 1,
  }
}
