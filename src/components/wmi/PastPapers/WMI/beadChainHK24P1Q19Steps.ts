// Animation steps for HKIMO-24-P1H-Q19 — horizontal bead chain ●●○○ pattern.
//
// Strategy:
//   0. Show the full chain (intro).
//   1. Highlight the repeating unit ●● ○○ (indices 0–3).
//   2. Point to the blank slot — show it is the 10th bead (index 9).
//   3. 10th bead: 10 ÷ 4 = 2 remainder 2 → 2nd position in ●●○○ = ●.
//   4. Fill the blank with ● (result).

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type ChainPhase = 'intro' | 'unit' | 'locate' | 'reason' | 'result'

export interface ChainStep {
  phase: ChainPhase
  highlightIndices: number[]
  dimNonHighlighted: boolean
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

const UNIT_INDICES = [0, 1, 2, 3]
const BLANK_INDEX  = 9

export function buildBeadChainHK24P1Q19Steps(lang: Lang): ChainStoryboard {
  const steps: ChainStep[] = []

  // Beat 0 — intro
  steps.push({
    phase: 'intro',
    highlightIndices: [],
    dimNonHighlighted: false,
    fillBlank: false,
    hold: 1600,
    result: false,
    caption: t(
      lang,
      'Look at the bead chain — the beads follow a repeating pattern.',
      'Perhatikan rantai manik ini — manik-manik mengikuti pola berulang.',
    ),
  })

  // Beat 1 — highlight repeating unit
  steps.push({
    phase: 'unit',
    highlightIndices: UNIT_INDICES,
    dimNonHighlighted: true,
    fillBlank: false,
    hold: 2200,
    result: false,
    caption: t(
      lang,
      'The repeating unit is: ● ● ○ ○ — big black, big black, small white, small white.',
      'Unit berulangnya: ● ● ○ ○ — hitam besar, hitam besar, putih kecil, putih kecil.',
    ),
  })

  // Beat 2 — locate blank
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

  // Beat 3 — reason
  steps.push({
    phase: 'reason',
    highlightIndices: [1, BLANK_INDEX],
    dimNonHighlighted: true,
    fillBlank: false,
    hold: 2200,
    result: false,
    caption: t(
      lang,
      '10 ÷ 4 = 2 remainder 2 → 2nd position in ●●○○ = ● (big black).',
      '10 ÷ 4 = 2 sisa 2 → posisi ke-2 dalam ●●○○ = ● (hitam besar).',
    ),
  })

  // Beat 4 — result
  steps.push({
    phase: 'result',
    highlightIndices: [BLANK_INDEX],
    dimNonHighlighted: false,
    fillBlank: true,
    hold: 0,
    result: true,
    caption: t(
      lang,
      'The blank is filled with ● → answer: large black bead (●).',
      'Kotak kosong diisi ● → jawaban: manik hitam besar (●).',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
