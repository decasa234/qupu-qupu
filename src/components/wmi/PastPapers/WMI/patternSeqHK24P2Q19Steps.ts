// Animation steps for HKIMO-24-P2H-Q19 — "What is the figure in the blank?"
//
// Pattern: ▲ ▲ ▲ ● ■ (repeats), 16 shapes, blank at index 13.
// 13 % 5 = 3 → CYCLE[3] = 'C' → answer: ● (filled circle).

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type PatternPhase = 'intro' | 'cycle' | 'locate' | 'result'

export interface PatternStep {
  phase: PatternPhase
  /** 0-based shape indices to highlight. */
  highlightIndices: number[]
  revealAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface PatternStoryboard {
  steps: PatternStep[]
  finalIndex: number
}

function t(lang: Lang, en: string, id: string): string {
  return lang === 'id' ? id : en
}

export function buildPatternSeqHK24P2Q19Steps(lang: Lang): PatternStoryboard {
  const steps: PatternStep[] = []

  // Beat 0 — intro
  steps.push({
    phase: 'intro',
    highlightIndices: [],
    revealAnswer: false,
    hold: 1600,
    result: false,
    caption: t(
      lang,
      'Look at the pattern — triangles (▲), circles (●), and dotted boxes (■). Find the rule!',
      'Perhatikan polanya — segitiga (▲), lingkaran (●), dan kotak titik-titik (■). Temukan aturannya!',
    ),
  })

  // Beat 1 — highlight first repeating unit (indices 0–4)
  steps.push({
    phase: 'cycle',
    highlightIndices: [0, 1, 2, 3, 4],
    revealAnswer: false,
    hold: 2200,
    result: false,
    caption: t(
      lang,
      'The repeating unit is 5 shapes: ▲ ▲ ▲ ● ■ — then it starts again.',
      'Unit yang berulang adalah 5 bentuk: ▲ ▲ ▲ ● ■ — lalu mulai lagi.',
    ),
  })

  // Beat 2 — confirm second unit (indices 5–9)
  steps.push({
    phase: 'cycle',
    highlightIndices: [5, 6, 7, 8, 9],
    revealAnswer: false,
    hold: 2000,
    result: false,
    caption: t(
      lang,
      'Same pattern again: ▲ ▲ ▲ ● ■ — the cycle repeats perfectly.',
      'Pola yang sama lagi: ▲ ▲ ▲ ● ■ — siklus berulang dengan sempurna.',
    ),
  })

  // Beat 3 — locate blank in 3rd group (indices 10–13)
  steps.push({
    phase: 'locate',
    highlightIndices: [10, 11, 12, 13],
    revealAnswer: false,
    hold: 2200,
    result: false,
    caption: t(
      lang,
      'In the 3rd group: ▲ ▲ ▲ □ — the blank is at position 4, which is ● in the cycle.',
      'Di kelompok ke-3: ▲ ▲ ▲ □ — tempat kosong ada di posisi ke-4, yaitu ● dalam siklusnya.',
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
      'The missing shape is ● (a filled circle). Answer: ●.',
      'Bentuk yang hilang adalah ● (lingkaran penuh). Jawaban: ●.',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
