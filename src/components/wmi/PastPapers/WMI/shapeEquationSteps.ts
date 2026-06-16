import type { Lang } from '../concepts/explainers/makeTenSteps'
import { ANSWER, CIRCLE_VALUE, STAR_VALUE, TRIANGLE_VALUE } from './ShapeEquationIllustration'

export type ShapePhase = 'show' | 'circle' | 'star' | 'triangle' | 'substitute' | 'result'

export interface ShapeEqStep {
  phase: ShapePhase
  /** Which given equation row to highlight (0..2), or null. */
  highlightRow: number | null
  /** Reveal the asked-row answer (△ + ☆ = 13). */
  revealAnswer: boolean
  /** Solved-shape values to display as a small legend, in reveal order. */
  solved: Array<'circle' | 'triangle' | 'star'>
  caption: string
  hold: number
  result: boolean
}

export interface ShapeEqStoryboard {
  circleValue: number
  triangleValue: number
  starValue: number
  answer: number
  steps: ShapeEqStep[]
  finalIndex: number
}

export function buildShapeEquationSteps(lang: Lang): ShapeEqStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ShapeEqStep[] = [
    {
      phase: 'show',
      highlightRow: null,
      revealAnswer: false,
      solved: [],
      hold: 1700,
      result: false,
      caption: t(
        'Three equations are given. We need triangle + star.',
        'Diberikan tiga persamaan. Kita perlu segitiga + bintang.',
      ),
    },
    {
      phase: 'circle',
      highlightRow: 0,
      revealAnswer: false,
      solved: ['circle'],
      hold: 1900,
      result: false,
      caption: t(
        `Three circles make 18, so each circle = ${CIRCLE_VALUE}.`,
        `Tiga lingkaran berjumlah 18, jadi tiap lingkaran = ${CIRCLE_VALUE}.`,
      ),
    },
    {
      phase: 'star',
      highlightRow: 2,
      revealAnswer: false,
      solved: ['circle', 'star'],
      hold: 1900,
      result: false,
      caption: t(
        `Four stars make 20, so each star = ${STAR_VALUE}.`,
        `Empat bintang berjumlah 20, jadi tiap bintang = ${STAR_VALUE}.`,
      ),
    },
    {
      phase: 'triangle',
      highlightRow: 1,
      revealAnswer: false,
      solved: ['circle', 'star', 'triangle'],
      hold: 2000,
      result: false,
      caption: t(
        `Triangle + circle = 14, and circle = ${CIRCLE_VALUE}, so triangle = ${TRIANGLE_VALUE}.`,
        `Segitiga + lingkaran = 14, dan lingkaran = ${CIRCLE_VALUE}, jadi segitiga = ${TRIANGLE_VALUE}.`,
      ),
    },
    {
      phase: 'substitute',
      highlightRow: null,
      revealAnswer: false,
      solved: ['circle', 'star', 'triangle'],
      hold: 1900,
      result: false,
      caption: t(
        `Now substitute: triangle + star = ${TRIANGLE_VALUE} + ${STAR_VALUE}.`,
        `Sekarang substitusi: segitiga + bintang = ${TRIANGLE_VALUE} + ${STAR_VALUE}.`,
      ),
    },
    {
      phase: 'result',
      highlightRow: null,
      revealAnswer: true,
      solved: ['circle', 'star', 'triangle'],
      hold: 0,
      result: true,
      caption: t(
        `triangle + star = ${TRIANGLE_VALUE} + ${STAR_VALUE} = ${ANSWER}.`,
        `segitiga + bintang = ${TRIANGLE_VALUE} + ${STAR_VALUE} = ${ANSWER}.`,
      ),
    },
  ]

  return {
    circleValue: CIRCLE_VALUE,
    triangleValue: TRIANGLE_VALUE,
    starValue: STAR_VALUE,
    answer: ANSWER,
    steps,
    finalIndex: steps.length - 1,
  }
}
