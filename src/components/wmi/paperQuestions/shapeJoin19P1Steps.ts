// Deterministic storyboard for WMI-19P1A-Q13 (ShapeJoin19P1Explainer).
//
// The rule joins the second shape onto the FOOT of the first, keeping the same
// orientation (Y + triangle → triangle hanging under the Y's stem). Applying
// the same join to T + square stacks the square under the T's stem — choice D.

import type { Lang } from '../concepts/explainers/makeTenSteps'

export type ShapeJoinPhase = 'rule' | 'operands' | 'join' | 'options' | 'result'

export interface ShapeJoinStep {
  phase: ShapeJoinPhase
  /** Show the example rule (Y + triangle → combined). */
  showRule: boolean
  /** Show the T and square operands side by side. */
  showOperands: boolean
  /** Show the assembled T+square result glyph. */
  showAssembled: boolean
  /** Show the four answer-option chips. */
  showOptions: boolean
  /** Highlight the winning option (D) — only on the result beat. */
  highlightWinner: boolean
  result: boolean
  hold: number
  caption: string
}

export interface ShapeJoinStoryboard {
  steps: ShapeJoinStep[]
  finalIndex: number
  /** Winning option label. */
  answer: 'A' | 'B' | 'C' | 'D'
}

export function buildShapeJoin19P1Steps(lang: Lang): ShapeJoinStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ShapeJoinStep[] = [
    {
      phase: 'rule',
      showRule: true,
      showOperands: false,
      showAssembled: false,
      showOptions: false,
      highlightWinner: false,
      result: false,
      hold: 2200,
      caption: t(
        'The rule: join the second shape onto the foot of the first — same way up.',
        'Aturannya: gabungkan bentuk kedua ke kaki bentuk pertama — arah sama.',
      ),
    },
    {
      phase: 'operands',
      showRule: false,
      showOperands: true,
      showAssembled: false,
      showOptions: false,
      highlightWinner: false,
      result: false,
      hold: 2000,
      caption: t('Now do it for T + square.', 'Sekarang lakukan untuk T + persegi.'),
    },
    {
      phase: 'join',
      showRule: false,
      showOperands: false,
      showAssembled: true,
      showOptions: false,
      highlightWinner: false,
      result: false,
      hold: 2200,
      caption: t(
        'Hang the square under the T’s stem, just like the triangle under the Y.',
        'Gantungkan persegi di bawah batang T, sama seperti segitiga di bawah Y.',
      ),
    },
    {
      phase: 'options',
      showRule: false,
      showOperands: false,
      showAssembled: true,
      showOptions: true,
      highlightWinner: false,
      result: false,
      hold: 2000,
      caption: t('Which choice matches the assembled shape?', 'Pilihan mana yang cocok dengan bentuk gabungan?'),
    },
    {
      phase: 'result',
      showRule: false,
      showOperands: false,
      showAssembled: true,
      showOptions: true,
      highlightWinner: true,
      result: true,
      hold: 0,
      caption: t('T over a square — that is figure D.', 'T di atas persegi — itu gambar D.'),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: 'D' }
}
