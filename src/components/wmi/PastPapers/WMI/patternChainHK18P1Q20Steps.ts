// Animation steps for HKIMO-18-P1H-Q20 — horizontal bead chain pattern.
//
// Strategy:
//   0. Show the full chain (intro).
//   1. Highlight the repeating unit ○○●● (indices 0–3).
//   2. Point to the blank slot — show it is the 10th bead (index 9).
//   3. 10th bead: index 9, 9 % 4 = 1 → 2nd bead in cycle = ○.
//   4. Fill the blank with ○ (result).

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type ChainPhase = 'intro' | 'unit' | 'locate' | 'reason' | 'result'

export interface ChainStep {
  phase: ChainPhase
  /** Indices of beads to highlight with a glow ring. */
  highlightIndices: number[]
  /** Dim all non-highlighted beads. */
  dimNonHighlighted: boolean
  /** Whether to render the blank slot as filled (with ○). */
  fillBlank: boolean
  caption: string
  hold: number
  result: boolean
}

export interface ChainStoryboard {
  steps: ChainStep[]
  finalIndex: number
}

function t(lang: Lang, en: string, id: string): string {
  return lang === 'id' ? id : en
}

/** Indices of the first 4-bead repeating unit. */
const UNIT_INDICES = [0, 1, 2, 3]
const BLANK_INDEX = 9

export function buildPatternChainHK18P1Q20Steps(lang: Lang): ChainStoryboard {
  const steps: ChainStep[] = []

  // Beat 0 — intro: show full chain
  steps.push({
    phase: 'intro',
    highlightIndices: [],
    dimNonHighlighted: false,
    fillBlank: false,
    hold: 1600,
    result: false,
    caption: t(
      lang,
      'Look at the bead chain — the shapes follow a repeating pattern.',
      'Perhatikan rantai manik ini — bentuk-bentuknya mengikuti pola berulang.',
    ),
  })

  // Beat 1 — highlight the repeating unit
  steps.push({
    phase: 'unit',
    highlightIndices: UNIT_INDICES,
    dimNonHighlighted: true,
    fillBlank: false,
    hold: 2200,
    result: false,
    caption: t(
      lang,
      'The repeating unit is: ○ ○ ● ● — open, open, filled, filled.',
      'Unit berulangnya: ○ ○ ● ● — terbuka, terbuka, terisi, terisi.',
    ),
  })

  // Beat 2 — locate the blank slot
  steps.push({
    phase: 'locate',
    highlightIndices: [BLANK_INDEX],
    dimNonHighlighted: false,
    fillBlank: false,
    hold: 2000,
    result: false,
    caption: t(
      lang,
      'The blank is the 10th bead (count from the left).',
      'Kotak kosong adalah manik ke-10 (dihitung dari kiri).',
    ),
  })

  // Beat 3 — reason about the cycle position
  steps.push({
    phase: 'reason',
    highlightIndices: [1, BLANK_INDEX],
    dimNonHighlighted: true,
    fillBlank: false,
    hold: 2200,
    result: false,
    caption: t(
      lang,
      '10 ÷ 4 = 2 remainder 2 → 2nd position in the unit = ○.',
      '10 ÷ 4 = 2 sisa 2 → posisi ke-2 dalam unit = ○.',
    ),
  })

  // Beat 4 — fill blank and crown the answer
  steps.push({
    phase: 'result',
    highlightIndices: [BLANK_INDEX],
    dimNonHighlighted: false,
    fillBlank: true,
    hold: 0,
    result: true,
    caption: t(
      lang,
      'The blank is filled with ○ → answer: ○.',
      'Kotak kosong diisi ○ → jawaban: ○.',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
