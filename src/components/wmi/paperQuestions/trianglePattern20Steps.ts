import type { Lang } from '../concepts/explainers/makeTenSteps'
import {
  ANSWER_TRIANGLES,
  GROUP_COUNT,
  TRIANGLES_PER_GROUP,
  type PatternMathPhase,
} from './TrianglePattern20Illustration'

export type TrianglePatternPhase = 'show' | 'unit' | 'perGroup' | 'groups' | 'multiply' | 'result'

export interface TrianglePatternStep {
  phase: TrianglePatternPhase
  /** Which visible 5-tile group (0 or 1) is boxed, or null. */
  groupHighlight: number | null
  /** Box both visible full groups. */
  boxAllGroups: boolean
  /** Ring the 3 triangles inside the boxed group. */
  highlightTriangles: boolean
  showMath: PatternMathPhase
  caption: string
  hold: number
  result: boolean
}

export interface TrianglePatternStoryboard {
  groupCount: number
  trianglesPerGroup: number
  answer: number
  steps: TrianglePatternStep[]
  finalIndex: number
}

export function buildTrianglePattern20Steps(lang: Lang): TrianglePatternStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TrianglePatternStep[] = [
    {
      phase: 'show',
      groupHighlight: null,
      boxAllGroups: false,
      highlightTriangles: false,
      showMath: 'none',
      hold: 1700,
      result: false,
      caption: t(
        'The shapes repeat. Let us find the group that repeats.',
        'Bentuknya berulang. Ayo cari kelompok yang berulang.',
      ),
    },
    {
      phase: 'unit',
      groupHighlight: 0,
      boxAllGroups: false,
      highlightTriangles: false,
      showMath: 'unit',
      hold: 2000,
      result: false,
      caption: t(
        'The repeating group is triangle, circle, triangle, triangle, circle — 5 shapes.',
        'Kelompok berulangnya: segitiga, lingkaran, segitiga, segitiga, lingkaran — 5 bentuk.',
      ),
    },
    {
      phase: 'perGroup',
      groupHighlight: 0,
      boxAllGroups: false,
      highlightTriangles: true,
      showMath: 'unit',
      hold: 1900,
      result: false,
      caption: t(
        `Each group of 5 has ${TRIANGLES_PER_GROUP} triangles — not half!`,
        `Setiap kelompok 5 berisi ${TRIANGLES_PER_GROUP} segitiga — bukan setengahnya!`,
      ),
    },
    {
      phase: 'groups',
      groupHighlight: null,
      boxAllGroups: true,
      highlightTriangles: false,
      showMath: 'groups',
      hold: 2000,
      result: false,
      caption: t(
        `40 shapes ÷ 5 per group = ${GROUP_COUNT} groups.`,
        `40 bentuk ÷ 5 per kelompok = ${GROUP_COUNT} kelompok.`,
      ),
    },
    {
      phase: 'multiply',
      groupHighlight: 0,
      boxAllGroups: false,
      highlightTriangles: true,
      showMath: 'multiply',
      hold: 1900,
      result: false,
      caption: t(
        `${GROUP_COUNT} groups, each with ${TRIANGLES_PER_GROUP} triangles. Multiply!`,
        `${GROUP_COUNT} kelompok, masing-masing ${TRIANGLES_PER_GROUP} segitiga. Kalikan!`,
      ),
    },
    {
      phase: 'result',
      groupHighlight: null,
      boxAllGroups: false,
      highlightTriangles: false,
      showMath: 'answer',
      hold: 0,
      result: true,
      caption: t(
        `${GROUP_COUNT} × ${TRIANGLES_PER_GROUP} = ${ANSWER_TRIANGLES} triangles — answer C.`,
        `${GROUP_COUNT} × ${TRIANGLES_PER_GROUP} = ${ANSWER_TRIANGLES} segitiga — jawaban C.`,
      ),
    },
  ]

  return {
    groupCount: GROUP_COUNT,
    trianglesPerGroup: TRIANGLES_PER_GROUP,
    answer: ANSWER_TRIANGLES,
    steps,
    finalIndex: steps.length - 1,
  }
}
