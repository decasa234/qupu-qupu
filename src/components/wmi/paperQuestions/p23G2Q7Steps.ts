import type { Lang } from '../concepts/explainers/makeTenSteps'
import { RIBBON_A, RIBBON_B } from './P23G2Q7Illustration'

export type RibbonPhase = 'show' | 'measureA' | 'measureB' | 'subtract' | 'result'

export interface RibbonStep {
  phase: RibbonPhase
  measureA: boolean
  measureB: boolean
  caption: string
  hold: number
  result: boolean
}

export interface RibbonStoryboard {
  lenAmm: number
  lenBmm: number
  diffMm: number
  answer: string
  steps: RibbonStep[]
  finalIndex: number
}

export function buildP23G2Q7Steps(lang: Lang): RibbonStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const lenAmm = Math.round((RIBBON_A.to - RIBBON_A.from) * 10) // 33
  const lenBmm = Math.round((RIBBON_B.to - RIBBON_B.from) * 10) // 38
  const diffMm = Math.abs(lenBmm - lenAmm) // 5

  const steps: RibbonStep[] = [
    {
      phase: 'show',
      measureA: false,
      measureB: false,
      hold: 1700,
      result: false,
      caption: t(
        'Read where each ribbon starts and ends on the ruler. 1 cm = 10 mm.',
        'Baca di mana tiap pita mulai dan berakhir pada penggaris. 1 cm = 10 mm.',
      ),
    },
    {
      phase: 'measureA',
      measureA: true,
      measureB: false,
      hold: 2100,
      result: false,
      caption: t(
        `Ribbon A: ${RIBBON_A.from} cm to ${RIBBON_A.to} cm = ${(RIBBON_A.to - RIBBON_A.from).toFixed(1)} cm = ${lenAmm} mm.`,
        `Pita A: ${RIBBON_A.from} cm sampai ${RIBBON_A.to} cm = ${(RIBBON_A.to - RIBBON_A.from).toFixed(1)} cm = ${lenAmm} mm.`,
      ),
    },
    {
      phase: 'measureB',
      measureA: true,
      measureB: true,
      hold: 2100,
      result: false,
      caption: t(
        `Ribbon B: ${RIBBON_B.from} cm to ${RIBBON_B.to} cm = ${(RIBBON_B.to - RIBBON_B.from).toFixed(1)} cm = ${lenBmm} mm.`,
        `Pita B: ${RIBBON_B.from} cm sampai ${RIBBON_B.to} cm = ${(RIBBON_B.to - RIBBON_B.from).toFixed(1)} cm = ${lenBmm} mm.`,
      ),
    },
    {
      phase: 'subtract',
      measureA: true,
      measureB: true,
      hold: 1900,
      result: false,
      caption: t(
        `Difference = ${lenBmm} mm − ${lenAmm} mm.`,
        `Selisih = ${lenBmm} mm − ${lenAmm} mm.`,
      ),
    },
    {
      phase: 'result',
      measureA: true,
      measureB: true,
      hold: 0,
      result: true,
      caption: t(
        `${lenBmm} − ${lenAmm} = ${diffMm} mm — answer C.`,
        `${lenBmm} − ${lenAmm} = ${diffMm} mm — jawaban C.`,
      ),
    },
  ]

  return {
    lenAmm,
    lenBmm,
    diffMm,
    answer: 'C',
    steps,
    finalIndex: steps.length - 1,
  }
}
