// WMI-23F1A-Q18 (2023 Grade 1 Final) — "Fold the square in half left->right, then
// top->bottom. Reading from the top layer down to the bottom layer, what are the
// four numbers in order?"  Answer: 3124 (fill-in).
//
// Storyboard for the post-answer animation. ONE fold per beat so a Grade-1 learner
// can watch the paper close step by step instead of jumping to the stack:
//   beat 0 — flat square, all four numbers in place (stage 0). State the plan.
//   beat 1 — fold LEFT half over to the RIGHT (stage 1). The left column lands
//            UNDER the right column, so 3 sits over 1 and 4 over 2. A tall strip.
//   beat 2 — fold the TOP half DOWN over the bottom (stage 2). The top panel flips
//            under/over; only its topmost number (3) shows on the little square.
//   beat 3 — RESULT: explode the stack top->bottom = 3, 1, 2, 4 => 3124 (stage 3).
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe and
// deterministic. Every number is read from the illustration's own source of truth
// (QUADRANTS / STACK_TOP_TO_BOTTOM), never asserted here.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { QUADRANTS, STACK_TOP_TO_BOTTOM, type PaperFoldStage } from './PaperFold23G1Illustration'

export type PaperFoldPhase = 'plan' | 'fold' | 'result'

export interface PaperFoldStep {
  /** Which fold frame the primitive should render on this beat. */
  stage: PaperFoldStage
  phase: PaperFoldPhase
  caption: string
  hold: number
  /** True only on the final stack-reading beat. */
  result: boolean
}

export interface PaperFoldStoryboard {
  /** The four numbers top->bottom as a single string, e.g. "3124". */
  answer: string
  /** Same four numbers as an array, top layer first. */
  stack: readonly string[]
  steps: PaperFoldStep[]
  finalIndex: number
}

export function buildPaperFold23G1Steps(lang: Lang): PaperFoldStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Read the flat layout from the illustration so captions stay bound to it.
  const TL = QUADRANTS[0][0] // top-left  = 1
  const TR = QUADRANTS[0][1] // top-right = 3
  const BL = QUADRANTS[1][0] // bottom-left = 2
  const BR = QUADRANTS[1][1] // bottom-right = 4

  const stack = STACK_TOP_TO_BOTTOM
  const answer = stack.join('') // "3124"

  const steps: PaperFoldStep[] = [
    {
      stage: 0,
      phase: 'plan',
      hold: 2300,
      result: false,
      caption: t(
        'Two folds: first left to right, then top to bottom. Watch where each number goes.',
        'Dua lipatan: dulu kiri ke kanan, lalu atas ke bawah. Lihat ke mana tiap angka pergi.',
      ),
    },
    {
      stage: 1,
      phase: 'fold',
      hold: 2300,
      result: false,
      caption: t(
        `Fold 1: left half over to the right. The left column tucks UNDER, so ${TR} sits over ${TL}, and ${BR} over ${BL}.`,
        `Lipatan 1: separuh kiri ke kanan. Kolom kiri masuk ke BAWAH, jadi ${TR} di atas ${TL}, dan ${BR} di atas ${BL}.`,
      ),
    },
    {
      stage: 2,
      phase: 'fold',
      hold: 2300,
      result: false,
      caption: t(
        `Fold 2: top half down over the bottom. The top panel flips, so its hidden ${TL} comes to the very top.`,
        `Lipatan 2: separuh atas ke bawah. Panel atas terbalik, jadi ${TL} yang tersembunyi naik ke paling atas.`,
      ),
    },
    {
      stage: 3,
      phase: 'result',
      hold: 0,
      result: true,
      caption: t(
        `Read top to bottom: ${stack.join(', ')} → ${answer}.`,
        `Baca dari atas ke bawah: ${stack.join(', ')} → ${answer}.`,
      ),
    },
  ]

  return { answer, stack, steps, finalIndex: steps.length - 1 }
}
