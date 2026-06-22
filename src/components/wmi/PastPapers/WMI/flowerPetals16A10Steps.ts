// Animation steps for SEAMO-16-A-Q10 — flower-petal graph-colouring.
//
// Strategy:
//   0. Intro  — show the uncoloured flower; count 5 petals.
//   1. Try 2  — attempt 2-colour alternation around the ring; reach the conflict.
//   2. Conflict — petal 5 (index 4) needs to differ from both petal 4 AND petal 1; impossible with 2 colours.
//   3. Try 3  — apply 3-colour assignment: 1→R, 2→G, 3→R, 4→G, 5→B.  No clash.
//   4. Result — minimum = 3 colours.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type PetalPhase = 'intro' | 'try2' | 'conflict' | 'try3' | 'result'

// Colours used in the 3-colour solution
export const COLOR_R = '#EF4444'   // red
export const COLOR_G = '#34D399'   // green
export const COLOR_B = '#60A5FA'   // blue
export const COLOR_NONE = '#FFFFFF' // uncoloured

/** Which fill each petal (0-indexed) gets in the 3-colour assignment. */
export const THREE_COLOR_MAP: string[] = [COLOR_R, COLOR_G, COLOR_R, COLOR_G, COLOR_B]

/** 2-colour alternation attempt fill (not valid for odd cycle). */
export const TWO_COLOR_MAP: string[] = [COLOR_R, COLOR_G, COLOR_R, COLOR_G, COLOR_R]

export interface PetalStep {
  phase: PetalPhase
  /** Fill for each of the 5 petals (index 0–4). */
  petalFills: string[]
  /** Petal indices to flash red as "conflict". */
  conflictPetals: number[]
  caption: string
  hold: number
  result: boolean
}

export interface PetalStoryboard {
  steps: PetalStep[]
  finalIndex: number
}

function t(lang: Lang, en: string, id: string): string {
  return lang === 'id' ? id : en
}

export function buildFlowerPetals16A10Steps(lang: Lang): PetalStoryboard {
  const steps: PetalStep[] = []

  // Beat 0 — intro
  steps.push({
    phase: 'intro',
    petalFills: Array(5).fill(COLOR_NONE),
    conflictPetals: [],
    hold: 1600,
    result: false,
    caption: t(
      lang,
      'The flower has 5 petals arranged in a ring. No two neighbours can share a colour.',
      'Bunga ini memiliki 5 kelopak dalam lingkaran. Tidak boleh ada dua kelopak bersebelahan berwarna sama.',
    ),
  })

  // Beat 1 — try 2 colours
  steps.push({
    phase: 'try2',
    petalFills: TWO_COLOR_MAP,
    conflictPetals: [],
    hold: 2000,
    result: false,
    caption: t(
      lang,
      'Try 2 colours — alternate Red / Green around the ring…',
      'Coba 2 warna — ganti Merah / Hijau mengelilingi lingkaran…',
    ),
  })

  // Beat 2 — conflict
  steps.push({
    phase: 'conflict',
    petalFills: TWO_COLOR_MAP,
    conflictPetals: [0, 4],   // petal 5 (index 4) clashes with petal 1 (index 0)
    hold: 2200,
    result: false,
    caption: t(
      lang,
      'Conflict! Petal 5 is Red — but it neighbours Petal 1 which is also Red. ✗ 2 colours fail for an odd ring.',
      'Konflik! Kelopak 5 berwarna Merah — tapi bersebelahan dengan Kelopak 1 yang juga Merah. ✗ 2 warna tidak cukup untuk lingkaran ganjil.',
    ),
  })

  // Beat 3 — try 3 colours
  steps.push({
    phase: 'try3',
    petalFills: THREE_COLOR_MAP,
    conflictPetals: [],
    hold: 2200,
    result: false,
    caption: t(
      lang,
      'Add a 3rd colour (Blue) for Petal 5 — now every neighbouring pair has different colours. ✓',
      'Tambahkan warna ke-3 (Biru) untuk Kelopak 5 — setiap pasangan bersebelahan berbeda warna. ✓',
    ),
  })

  // Beat 4 — result
  steps.push({
    phase: 'result',
    petalFills: THREE_COLOR_MAP,
    conflictPetals: [],
    hold: 0,
    result: true,
    caption: t(
      lang,
      'The minimum is 3 colours. (Odd-cycle rule: odd number of petals always needs ≥ 3 colours.) → Answer B',
      'Minimumnya adalah 3 warna. (Aturan siklus ganjil: jumlah kelopak ganjil selalu butuh ≥ 3 warna.) → Jawaban B',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
