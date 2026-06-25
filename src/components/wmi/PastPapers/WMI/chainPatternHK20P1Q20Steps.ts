// Animation steps for HKIMO-20-P1H-Q20 — "What is the figure in the blank?"
//
// Strategy:
//   1. Show the wavy chain with the blank.
//   2. Spot the 3-bead repeating unit: large-open ○, large-filled ●, small ○.
//   3. Confirm the 2nd unit repeats identically.
//   4. Locate the blank: 3rd bead of the 3rd group → small circle.
//   5. Reveal: blank = small open circle.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type ChainPhase20 = 'intro' | 'cycle' | 'locate' | 'result'

export interface ChainStep20 {
  phase: ChainPhase20
  /** 0-based bead indices to highlight with amber ring. */
  highlightIndices: number[]
  revealAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface ChainStoryboard20 {
  steps: ChainStep20[]
  finalIndex: number
}

function t(lang: Lang, en: string, id: string): string {
  return lang === 'id' ? id : en
}

export function buildChainPatternHK20P1Q20Steps(lang: Lang): ChainStoryboard20 {
  const steps: ChainStep20[] = []

  // Beat 0 — intro
  steps.push({
    phase: 'intro',
    highlightIndices: [],
    revealAnswer: false,
    hold: 1600,
    result: false,
    caption: t(
      lang,
      'Look at the chain — it has large open circles ○, large filled circles ●, and small open circles. Find the rule!',
      'Perhatikan rantai ini — ada lingkaran besar kosong ○, lingkaran besar hitam ●, dan lingkaran kecil. Temukan polanya!',
    ),
  })

  // Beat 1 — highlight first 3-bead unit (indices 0–2)
  steps.push({
    phase: 'cycle',
    highlightIndices: [0, 1, 2],
    revealAnswer: false,
    hold: 2200,
    result: false,
    caption: t(
      lang,
      'The repeating unit has 3 beads: large-open ○, large-filled ●, small ○ — then it starts over.',
      'Unit yang berulang terdiri dari 3 manik: besar-kosong ○, besar-hitam ●, kecil ○ — lalu mulai lagi.',
    ),
  })

  // Beat 2 — second unit (indices 3–5)
  steps.push({
    phase: 'cycle',
    highlightIndices: [3, 4, 5],
    revealAnswer: false,
    hold: 2000,
    result: false,
    caption: t(
      lang,
      'Same 3-bead pattern again: ○ ● small — the cycle repeats perfectly.',
      'Pola 3 manik yang sama: ○ ● kecil — siklus berulang dengan sempurna.',
    ),
  })

  // Beat 3 — locate blank (indices 6–8; blank at 8)
  steps.push({
    phase: 'locate',
    highlightIndices: [6, 7, 8],
    revealAnswer: false,
    hold: 2000,
    result: false,
    caption: t(
      lang,
      'The blank is the 3rd bead of the 3rd group (○ ● □). The 3rd bead of every group is always the small circle.',
      'Kotak kosong adalah manik ke-3 dari kelompok ke-3 (○ ● □). Manik ke-3 di setiap kelompok selalu lingkaran kecil.',
    ),
  })

  // Beat 4 — reveal answer
  steps.push({
    phase: 'result',
    highlightIndices: [8],
    revealAnswer: true,
    hold: 0,
    result: true,
    caption: t(
      lang,
      'The missing figure is a small open circle. Answer: small circle.',
      'Gambar yang hilang adalah lingkaran kecil. Jawaban: lingkaran kecil.',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
