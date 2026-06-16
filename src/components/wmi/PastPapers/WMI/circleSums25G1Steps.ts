import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { SHADED_ANSWER } from './CircleSums25G1Illustration'

// Storyboard for WMI-25F1A-Q21 (2025 G1 final).
//
// Ten circles in a ring, joined into FIVE diametrically-opposite pairs (one
// shape mark per pair). Fill 1..10 so every opposite pair adds to the SAME sum.
// Three givens (7, 9, 1) are placed; the SHADED circle sits opposite the "1".
// Find the sum of every value that could go in the shaded circle. Answer: 10.
//
// THE METHOD, one idea per beat (deduce, never assert the answer up front):
//   beat 1 (pair-sum) — 1 + 2 + ... + 10 = 55. Those ten numbers split into the
//     5 opposite pairs, every pair sharing one sum, so each pair = 55 / 5 = 11.
//   beat 2 (locate)   — the shaded circle is the partner of the "1", and an
//     opposite pair must sum to 11, so shaded + 1 = 11.
//   beat 3 (result)   — shaded = 11 - 1 = 10. That is the ONLY value it can be,
//     so the sum of all possible values is 10 (reveal it in the circle).
//
// Pure builder — deterministic, SSR-safe. Everything derives from SHADED_ANSWER
// (= 11 - 1) so the figure and the logic can never drift apart.

export type CircleSumsPhase = 'pair-sum' | 'locate' | 'result'

export interface CircleSumsStep {
  phase: CircleSumsPhase
  /** Reveal 10 inside the shaded circle on the final beat. */
  revealShaded: boolean
  /** The forced pair sum (11) once it has been deduced; null on beat 1's open. */
  pairSum: number | null
  caption: string
  hold: number
  /** Final answer beat. */
  result: boolean
}

export interface CircleSumsStoryboard {
  /** 1 + 2 + ... + 10. */
  total: number
  /** Number of opposite pairs. */
  pairs: number
  /** Forced sum of every opposite pair (55 / 5). */
  pairSum: number
  /** The given that sits opposite the shaded circle. */
  given: number
  /** The only value the shaded circle can hold (= answer = sum of possibilities). */
  answer: number
  steps: CircleSumsStep[]
  finalIndex: number
}

export function buildCircleSums25G1Steps(lang: Lang): CircleSumsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const total = 55 // 1 + 2 + ... + 10
  const pairs = 5
  const pairSum = total / pairs // 11
  const given = 1 // the number sitting opposite the shaded circle
  const answer = SHADED_ANSWER // 11 - 1 = 10

  const steps: CircleSumsStep[] = [
    {
      phase: 'pair-sum',
      revealShaded: false,
      pairSum,
      result: false,
      hold: 2400,
      caption: t(
        `1 + 2 + … + 10 = ${total}. Five opposite pairs share one sum, so each pair = ${total} ÷ ${pairs} = ${pairSum}.`,
        `1 + 2 + … + 10 = ${total}. Lima pasangan berseberangan berjumlah sama, jadi tiap pasangan = ${total} ÷ ${pairs} = ${pairSum}.`,
      ),
    },
    {
      phase: 'locate',
      revealShaded: false,
      pairSum,
      result: false,
      hold: 2400,
      caption: t(
        `The shaded circle is opposite the ${given}. Its pair must add to ${pairSum}, so shaded + ${given} = ${pairSum}.`,
        `Lingkaran diarsir berseberangan dengan ${given}. Pasangannya harus berjumlah ${pairSum}, jadi diarsir + ${given} = ${pairSum}.`,
      ),
    },
    {
      phase: 'result',
      revealShaded: true,
      pairSum,
      result: true,
      hold: 0,
      caption: t(
        `So shaded = ${pairSum} − ${given} = ${answer}. It is the only value it can be — the sum of possibilities is ${answer}.`,
        `Jadi diarsir = ${pairSum} − ${given} = ${answer}. Itu satu-satunya nilai yang mungkin — jumlah kemungkinannya ${answer}.`,
      ),
    },
  ]

  return { total, pairs, pairSum, given, answer, steps, finalIndex: steps.length - 1 }
}
