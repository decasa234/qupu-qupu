import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { BallKind } from './BalanceTwoScalesG2Illustration'
import { SCALE1, SCALE2, WHITE_BALL_G } from './BalanceTwoScalesG2Illustration'

export type BalanceTwoScalesG2Phase = 'show' | 'common' | 'diff' | 'subtract' | 'divide' | 'result'

export interface BalanceTwoScalesG2Step {
  phase: BalanceTwoScalesG2Phase
  /** Ball kind to highlight on both scales, or null. */
  highlightKind: BallKind | null
  /** Emphasise the gram readings (used while subtracting). */
  emphasizeTotals: boolean
  /** Equation line shown under the scales, or null. */
  equation: string | null
  caption: string
  hold: number
  result: boolean
}

export interface BalanceTwoScalesG2Storyboard {
  steps: BalanceTwoScalesG2Step[]
  finalIndex: number
}

export function buildBalanceTwoScalesG2Steps(lang: Lang): BalanceTwoScalesG2Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const g1 = SCALE1.grams // 180
  const g2 = SCALE2.grams // 120
  const diff = g1 - g2 // 60
  const extraWhite = SCALE1.balls.filter((b) => b === 'white').length - SCALE2.balls.filter((b) => b === 'white').length // 2

  const steps: BalanceTwoScalesG2Step[] = [
    {
      phase: 'show',
      highlightKind: null,
      emphasizeTotals: false,
      equation: null,
      hold: 1600,
      result: false,
      caption: t(
        `Two scales. ${g1} g on the left, ${g2} g on the right. How heavy is one white ball?`,
        `Dua timbangan. ${g1} g di kiri, ${g2} g di kanan. Berapa berat satu bola putih?`,
      ),
    },
    {
      phase: 'common',
      highlightKind: 'black',
      emphasizeTotals: false,
      equation: null,
      hold: 1700,
      result: false,
      caption: t(
        'Both scales carry the SAME 3 black and 2 dotted balls.',
        'Kedua timbangan membawa 3 bola hitam dan 2 bola berbintik yang SAMA.',
      ),
    },
    {
      phase: 'diff',
      highlightKind: 'white',
      emphasizeTotals: false,
      equation: null,
      hold: 1800,
      result: false,
      caption: t(
        `The only difference is the white balls: 3 vs 1, so ${extraWhite} extra white on the left.`,
        `Bedanya hanya bola putih: 3 lawan 1, jadi ${extraWhite} bola putih lebih banyak di kiri.`,
      ),
    },
    {
      phase: 'subtract',
      highlightKind: 'white',
      emphasizeTotals: true,
      equation: `${g1} − ${g2} = ${diff}`,
      hold: 1800,
      result: false,
      caption: t(
        `Subtract: ${g1} − ${g2} = ${diff} g. That ${diff} g is just the ${extraWhite} extra white balls.`,
        `Kurangkan: ${g1} − ${g2} = ${diff} g. ${diff} g itu hanya ${extraWhite} bola putih tambahan.`,
      ),
    },
    {
      phase: 'divide',
      highlightKind: 'white',
      emphasizeTotals: false,
      equation: `${diff} ÷ ${extraWhite} = ${WHITE_BALL_G}`,
      hold: 1800,
      result: false,
      caption: t(
        `${extraWhite} white balls weigh ${diff} g, so one white ball = ${diff} ÷ ${extraWhite}.`,
        `${extraWhite} bola putih beratnya ${diff} g, jadi satu bola putih = ${diff} ÷ ${extraWhite}.`,
      ),
    },
    {
      phase: 'result',
      highlightKind: 'white',
      emphasizeTotals: false,
      equation: `${diff} ÷ ${extraWhite} = ${WHITE_BALL_G}`,
      hold: 0,
      result: true,
      caption: t(
        `One white ball weighs ${WHITE_BALL_G} g.`,
        `Satu bola putih beratnya ${WHITE_BALL_G} g.`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
