import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { P20G3Q11_ANSWER, SHAPES } from './P20G3Q11Illustration'

export type Q11Phase = 'show' | 'count' | 'compare' | 'result'

export interface Q11Step {
  phase: Q11Phase
  active: 'A' | 'B' | 'C' | 'D' | null
  showAreasFor: string[]
  caption: string
  hold: number
  result: boolean
}

export interface Q11Storyboard {
  answer: string
  answerArea: number
  steps: Q11Step[]
  finalIndex: number
}

const AREA = (l: string) => SHAPES.find((s) => s.label === l)!.area

export function buildP20G3Q11Steps(lang: Lang): Q11Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const answerArea = AREA(P20G3Q11_ANSWER)

  const steps: Q11Step[] = [
    {
      phase: 'show',
      active: null,
      showAreasFor: [],
      hold: 1700,
      result: false,
      caption: t(
        'Count each shaded shape in unit squares — pair the half-squares.',
        'Hitung tiap bangun arsiran dalam satuan kotak — pasangkan setengah-kotaknya.',
      ),
    },
    {
      phase: 'count',
      active: 'A',
      showAreasFor: ['A'],
      hold: 1700,
      result: false,
      caption: t(`Shape A covers ${AREA('A')} squares.`, `Bangun A menutup ${AREA('A')} kotak.`),
    },
    {
      phase: 'count',
      active: 'B',
      showAreasFor: ['A', 'B'],
      hold: 1700,
      result: false,
      caption: t(`Shape B covers ${AREA('B')} squares.`, `Bangun B menutup ${AREA('B')} kotak.`),
    },
    {
      phase: 'count',
      active: 'C',
      showAreasFor: ['A', 'B', 'C'],
      hold: 1700,
      result: false,
      caption: t(`Shape C covers ${AREA('C')} squares.`, `Bangun C menutup ${AREA('C')} kotak.`),
    },
    {
      phase: 'count',
      active: 'D',
      showAreasFor: ['A', 'B', 'C', 'D'],
      hold: 1900,
      result: false,
      caption: t(
        `Shape D is 4 diamonds of 2 each = ${AREA('D')} squares.`,
        `Bangun D adalah 4 belah ketupat 2-an = ${AREA('D')} kotak.`,
      ),
    },
    {
      phase: 'compare',
      active: 'D',
      showAreasFor: ['A', 'B', 'C', 'D'],
      hold: 2000,
      result: false,
      caption: t(
        `${AREA('A')}, ${AREA('B')}, ${AREA('C')}, ${AREA('D')} — D is the biggest.`,
        `${AREA('A')}, ${AREA('B')}, ${AREA('C')}, ${AREA('D')} — D paling besar.`,
      ),
    },
    {
      phase: 'result',
      active: 'D',
      showAreasFor: ['D'],
      hold: 0,
      result: true,
      caption: t(
        `Largest shaded area = ${answerArea} → option ${P20G3Q11_ANSWER}.`,
        `Daerah arsiran terbesar = ${answerArea} → pilihan ${P20G3Q11_ANSWER}.`,
      ),
    },
  ]

  return { answer: P20G3Q11_ANSWER, answerArea, steps, finalIndex: steps.length - 1 }
}
