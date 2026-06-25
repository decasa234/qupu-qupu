// Animation steps for HKIMO-19-P1H-Q20 — "What is the figure in the blank?"
//
// Strategy:
//   1. Show the chain — notice it has open (○) and filled (●) beads.
//   2. Spot the repeating unit: ○ ○ ○ ● ● ●  (3 white, 3 black).
//   3. Count along: position 14 is the 2nd in the 3rd white trio → ○.
//   4. Reveal the blank = ○.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { CHAIN_CYCLE } from './ChainPattern19HK1Q20Illustration'

export type ChainPhase = 'intro' | 'cycle' | 'locate' | 'result'

export interface ChainStep {
  phase: ChainPhase
  /** 0-based bead indices to highlight with a ring, or empty. */
  highlightIndices: number[]
  /** Whether to render the blank with the answer revealed. */
  revealAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function t(lang: Lang, en: string, id: string): string {
  return lang === 'id' ? id : en
}

function cycleDesc(lang: Lang): string {
  const names = CHAIN_CYCLE.map((k) =>
    k === 'W'
      ? t(lang, 'open ○', 'lingkaran kosong ○')
      : t(lang, 'filled ●', 'lingkaran penuh ●'),
  )
  return names.join(', ')
}

// ---------------------------------------------------------------------------
// Step builder
// ---------------------------------------------------------------------------

export interface ChainStoryboard {
  steps: ChainStep[]
  finalIndex: number
}

export function buildChainPattern19HK1Q20Steps(lang: Lang): ChainStoryboard {
  const steps: ChainStep[] = []

  // Beat 0 — intro
  steps.push({
    phase: 'intro',
    highlightIndices: [],
    revealAnswer: false,
    hold: 1600,
    result: false,
    caption: t(
      lang,
      'Look at the chain — it has open circles (○) and filled circles (●). Find the rule!',
      'Perhatikan rantai ini — ada lingkaran kosong (○) dan lingkaran penuh (●). Temukan polanya!',
    ),
  })

  // Beat 1 — highlight first cycle (indices 0–5)
  steps.push({
    phase: 'cycle',
    highlightIndices: [0, 1, 2, 3, 4, 5],
    revealAnswer: false,
    hold: 2200,
    result: false,
    caption: t(
      lang,
      `The repeating unit (6 beads): ${cycleDesc(lang)} — then it starts again.`,
      `Unit yang berulang (6 manik): ${cycleDesc(lang)} — lalu mulai lagi.`,
    ),
  })

  // Beat 2 — confirm second cycle (indices 6–11)
  steps.push({
    phase: 'cycle',
    highlightIndices: [6, 7, 8, 9, 10, 11],
    revealAnswer: false,
    hold: 2000,
    result: false,
    caption: t(
      lang,
      'Same pattern again: ○ ○ ○ ● ● ● — the cycle repeats perfectly.',
      'Pola yang sama lagi: ○ ○ ○ ● ● ● — siklus berulang dengan sempurna.',
    ),
  })

  // Beat 3 — locate the blank
  steps.push({
    phase: 'locate',
    highlightIndices: [12, 13, 14],
    revealAnswer: false,
    hold: 2000,
    result: false,
    caption: t(
      lang,
      'The blank is in a new white trio (○ ○ □ ○ …). Position 14 falls on the 2nd bead of that trio → it must be ○.',
      'Tempat kosong ada di grup putih baru (○ ○ □ ○ …). Posisi ke-14 adalah manik ke-2 dalam grup itu → harus ○.',
    ),
  })

  // Beat 4 — reveal answer
  steps.push({
    phase: 'result',
    highlightIndices: [13],
    revealAnswer: true,
    hold: 0,
    result: true,
    caption: t(
      lang,
      'The missing shape is ○ (an open circle). Answer: ○.',
      'Bentuk yang hilang adalah ○ (lingkaran kosong). Jawaban: ○.',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
