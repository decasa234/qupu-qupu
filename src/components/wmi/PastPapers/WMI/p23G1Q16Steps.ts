import type { Lang } from '../concepts/explainers/makeTenSteps'
import { ANSWER_VERTEX, QUESTION_INDEX } from './P23G1Q16Illustration'

export type Q16Phase = 'show' | 'rule' | 'step' | 'fill' | 'result'

export interface Q16Step {
  phase: Q16Phase
  solveQuestion: boolean
  focusIndex: number | null
  caption: string
  hold: number
  result: boolean
}

export interface Q16Storyboard {
  answerVertex: number
  answer: string
  steps: Q16Step[]
  finalIndex: number
}

// vertex index -> human label
const VERTEX_LABEL_EN: Record<number, string> = {
  0: 'top',
  1: 'upper-right',
  2: 'lower-right',
  3: 'lower-left',
  4: 'upper-left',
}
const VERTEX_LABEL_ID: Record<number, string> = {
  0: 'atas',
  1: 'kanan-atas',
  2: 'kanan-bawah',
  3: 'kiri-bawah',
  4: 'kiri-atas',
}

export function buildP23G1Q16Steps(lang: Lang, answer: string): Q16Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const vtxLabel = lang === 'id' ? VERTEX_LABEL_ID[ANSWER_VERTEX] : VERTEX_LABEL_EN[ANSWER_VERTEX]

  const steps: Q16Step[] = [
    {
      phase: 'show',
      solveQuestion: false,
      focusIndex: null,
      hold: 1700,
      result: false,
      caption: t(
        'Watch the red dot: it hops to the next corner from one pentagon to the next.',
        'Perhatikan titik merah: ia melompat ke sudut berikutnya dari satu segi lima ke segi lima berikutnya.',
      ),
    },
    {
      phase: 'rule',
      solveQuestion: false,
      focusIndex: 0,
      hold: 2000,
      result: false,
      caption: t(
        'Each step the dot turns one corner the SAME way (counter-clockwise here).',
        'Tiap langkah titik berputar satu sudut dengan arah yang SAMA (di sini berlawanan arah jarum jam).',
      ),
    },
    {
      phase: 'step',
      solveQuestion: false,
      focusIndex: QUESTION_INDEX - 1, // the pentagon just before the "?"
      hold: 2000,
      result: false,
      caption: t(
        'Take the dot just before the "?" and turn it one more corner.',
        'Ambil titik tepat sebelum tanda "?" lalu putar satu sudut lagi.',
      ),
    },
    {
      phase: 'fill',
      solveQuestion: true,
      focusIndex: QUESTION_INDEX,
      hold: 2000,
      result: false,
      caption: t(
        `That lands the dot at the ${vtxLabel} corner of the "?" pentagon.`,
        `Itu menempatkan titik di sudut ${vtxLabel} pada segi lima "?".`,
      ),
    },
    {
      phase: 'result',
      solveQuestion: true,
      focusIndex: QUESTION_INDEX,
      hold: 0,
      result: true,
      caption: t(
        `The option with the dot at the ${vtxLabel} corner is ${answer}.`,
        `Pilihan dengan titik di sudut ${vtxLabel} adalah ${answer}.`,
      ),
    },
  ]

  return {
    answerVertex: ANSWER_VERTEX,
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
