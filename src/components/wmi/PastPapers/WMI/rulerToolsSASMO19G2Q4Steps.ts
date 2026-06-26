// Storyboard for SASMO-19-G2-Q4
// "Find the difference in length between the saw and the screwdriver."
//
// Figure: ruler 0–12 cm; saw spans 0–10 (= 10 cm); screwdriver spans 7–11 (= 4 cm).
// Trap: using the screwdriver's right endpoint (11) as its length instead of 11 − 7 = 4.
//
// Beats:
//   0 — Intro:        show both tools on the ruler, no measurements yet.
//   1 — Saw:          highlight the saw; brace shows "10 cm".
//   2 — Screwdriver:  highlight screwdriver; brace shows "11 − 7 = 4 cm".
//   3 — Diff:         both highlighted; show "10 − 4 = 6 cm".
//   4 — Result:       green badge "6 cm → A".

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export interface RulerToolsSASMO19G2Q4Step {
  phase: 'intro' | 'saw' | 'screwdriver' | 'diff' | 'result'
  showSawBrace: boolean
  showScrewBrace: boolean
  showDiff: boolean
  highlight: 'none' | 'saw' | 'screwdriver' | 'both'
  caption: string
  hold: number
  result: boolean
}

export interface RulerToolsSASMO19G2Q4Storyboard {
  steps: RulerToolsSASMO19G2Q4Step[]
  finalIndex: number
}

export function buildRulerToolsSASMO19G2Q4Steps(
  lang: Lang,
): RulerToolsSASMO19G2Q4Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RulerToolsSASMO19G2Q4Step[] = [
    {
      phase: 'intro',
      showSawBrace: false,
      showScrewBrace: false,
      showDiff: false,
      highlight: 'none',
      hold: 2200,
      result: false,
      caption: t(
        'A saw and a screwdriver are placed above a ruler. Find the difference in their lengths.',
        'Sebuah gergaji dan sebuah obeng diletakkan di atas penggaris. Temukan selisih panjang keduanya.',
      ),
    },
    {
      phase: 'saw',
      showSawBrace: true,
      showScrewBrace: false,
      showDiff: false,
      highlight: 'saw',
      hold: 2400,
      result: false,
      caption: t(
        'The saw runs from 0 cm to 10 cm on the ruler. Saw length = 10 cm.',
        'Gergaji membentang dari 0 cm hingga 10 cm di penggaris. Panjang gergaji = 10 cm.',
      ),
    },
    {
      phase: 'screwdriver',
      showSawBrace: true,
      showScrewBrace: true,
      showDiff: false,
      highlight: 'screwdriver',
      hold: 2600,
      result: false,
      caption: t(
        'The screwdriver runs from 7 cm to 11 cm. It does NOT start at 0! Length = 11 − 7 = 4 cm.',
        'Obeng membentang dari 7 cm hingga 11 cm. Obeng TIDAK dimulai dari 0! Panjang = 11 − 7 = 4 cm.',
      ),
    },
    {
      phase: 'diff',
      showSawBrace: true,
      showScrewBrace: true,
      showDiff: true,
      highlight: 'both',
      hold: 2400,
      result: false,
      caption: t(
        'Difference = saw − screwdriver = 10 − 4 = 6 cm.',
        'Selisih = gergaji − obeng = 10 − 4 = 6 cm.',
      ),
    },
    {
      phase: 'result',
      showSawBrace: true,
      showScrewBrace: true,
      showDiff: true,
      highlight: 'both',
      hold: 0,
      result: true,
      caption: t(
        'The difference in length between the saw and the screwdriver is 6 cm → Answer A.',
        'Selisih panjang antara gergaji dan obeng adalah 6 cm → Jawaban A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
