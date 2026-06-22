// Storyboard for IKMC-21-EC-Q9.
//
// Nisa picks 2 cards and swaps them. Which set CANNOT be grouped by one swap?
// We test sets B–E (each fixable with one swap), then show set A (impossible).
//
// Each beat carries:
//   - optionLabel: which option (A–E) we're examining
//   - fruits: the card sequence for that option
//   - highlight: which two positions to highlight (swap candidates)
//   - swapped: result after swap (null on intro / result beats)
//   - caption: bilingual string for this beat
//   - result: true only on the final "A is impossible" beat
//   - hold: display duration in ms

import type { FruitKey } from './CardSets9ECIllustration'
import { CARD_SETS } from './CardSets9ECIllustration'

export type Lang = 'en' | 'id'

export interface CardSetsStep {
  optionLabel: string
  fruits: FruitKey[]
  /** Two positions being highlighted / swapped (0-indexed). */
  highlight: number[]
  /** After-swap sequence (null for intro or "no swap works" beats). */
  swapped: FruitKey[] | null
  caption: string
  result: boolean
  hold: number
}

export interface CardSetsStoryboard {
  steps: CardSetsStep[]
  finalIndex: number
}

function swap(arr: FruitKey[], i: number, j: number): FruitKey[] {
  const r = [...arr]
  ;[r[i], r[j]] = [r[j], r[i]]
  return r
}

export function buildCardSets9ECSteps(lang: Lang): CardSetsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: CardSetsStep[] = []

  // 0) Intro: what does one swap mean?
  steps.push({
    optionLabel: 'A',
    fruits: CARD_SETS['A'],
    highlight: [],
    swapped: null,
    caption: t(
      'One swap moves exactly 2 cards. Same-fruit cards must all be adjacent after.',
      'Satu pertukaran hanya memindahkan 2 kartu. Kartu buah yang sama harus berdekatan setelahnya.',
    ),
    result: false,
    hold: 2400,
  })

  // 1) Option B: [grapes, apple, apple, grapes, cherry]
  //    swap 0↔4: [cherry, apple, apple, grapes, grapes] ✓
  steps.push({
    optionLabel: 'B',
    fruits: CARD_SETS['B'],
    highlight: [0, 4],
    swapped: null,
    caption: t(
      'Set B: swap grapes at position 1 with cherry at position 5…',
      'Set B: tukar anggur di posisi 1 dengan ceri di posisi 5…',
    ),
    result: false,
    hold: 2200,
  })
  steps.push({
    optionLabel: 'B',
    fruits: CARD_SETS['B'],
    highlight: [0, 4],
    swapped: swap(CARD_SETS['B'], 0, 4),
    caption: t(
      'Set B fixed! Cherry · Apple Apple · Grapes Grapes — all grouped. One swap works.',
      'Set B berhasil! Ceri · Apel Apel · Anggur Anggur — semua berkelompok. Satu pertukaran cukup.',
    ),
    result: false,
    hold: 2000,
  })

  // 2) Option C: [apple, grapes, grapes, cherry, apple]
  //    swap 0↔3: [cherry, grapes, grapes, apple, apple] ✓
  steps.push({
    optionLabel: 'C',
    fruits: CARD_SETS['C'],
    highlight: [0, 3],
    swapped: null,
    caption: t(
      'Set C: swap apple at position 1 with cherry at position 4…',
      'Set C: tukar apel di posisi 1 dengan ceri di posisi 4…',
    ),
    result: false,
    hold: 2200,
  })
  steps.push({
    optionLabel: 'C',
    fruits: CARD_SETS['C'],
    highlight: [0, 3],
    swapped: swap(CARD_SETS['C'], 0, 3),
    caption: t(
      'Set C fixed! Cherry · Grapes Grapes · Apple Apple — one swap works.',
      'Set C berhasil! Ceri · Anggur Anggur · Apel Apel — satu pertukaran cukup.',
    ),
    result: false,
    hold: 2000,
  })

  // 3) Option D: [apple, cherry, grapes, grapes, apple]
  //    swap 1↔4: [apple, apple, grapes, grapes, cherry] ✓
  steps.push({
    optionLabel: 'D',
    fruits: CARD_SETS['D'],
    highlight: [1, 4],
    swapped: null,
    caption: t(
      'Set D: swap cherry at position 2 with apple at position 5…',
      'Set D: tukar ceri di posisi 2 dengan apel di posisi 5…',
    ),
    result: false,
    hold: 2200,
  })
  steps.push({
    optionLabel: 'D',
    fruits: CARD_SETS['D'],
    highlight: [1, 4],
    swapped: swap(CARD_SETS['D'], 1, 4),
    caption: t(
      'Set D fixed! Apple Apple · Grapes Grapes · Cherry — one swap works.',
      'Set D berhasil! Apel Apel · Anggur Anggur · Ceri — satu pertukaran cukup.',
    ),
    result: false,
    hold: 2000,
  })

  // 4) Option E: [grapes, apple, cherry, grapes, apple]
  //    swap 0↔4: [apple, apple, cherry, grapes, grapes] ✓
  steps.push({
    optionLabel: 'E',
    fruits: CARD_SETS['E'],
    highlight: [0, 4],
    swapped: null,
    caption: t(
      'Set E: swap grapes at position 1 with apple at position 5…',
      'Set E: tukar anggur di posisi 1 dengan apel di posisi 5…',
    ),
    result: false,
    hold: 2200,
  })
  steps.push({
    optionLabel: 'E',
    fruits: CARD_SETS['E'],
    highlight: [0, 4],
    swapped: swap(CARD_SETS['E'], 0, 4),
    caption: t(
      'Set E fixed! Apple Apple · Cherry · Grapes Grapes — one swap works.',
      'Set E berhasil! Apel Apel · Ceri · Anggur Anggur — satu pertukaran cukup.',
    ),
    result: false,
    hold: 2000,
  })

  // 5) Option A: show A, try swap 1↔3: [apple, apple, grapes, cherry, grapes]
  //    AA at 0,1 ✓ but GG at 2,4 NOT adjacent — fails.
  steps.push({
    optionLabel: 'A',
    fruits: CARD_SETS['A'],
    highlight: [1, 3],
    swapped: null,
    caption: t(
      'Set A: apples are at positions 1 and 4 — try swapping cherry and apple…',
      'Set A: apel ada di posisi 1 dan 4 — coba tukar ceri dan apel…',
    ),
    result: false,
    hold: 2400,
  })
  steps.push({
    optionLabel: 'A',
    fruits: CARD_SETS['A'],
    highlight: [1, 3],
    swapped: swap(CARD_SETS['A'], 1, 3),
    caption: t(
      'Still broken: grapes at positions 3 and 5 are not next to each other. No single swap fixes Set A!',
      'Masih salah: anggur di posisi 3 dan 5 tidak berdekatan. Tidak ada satu pertukaran yang memperbaiki Set A!',
    ),
    result: false,
    hold: 2400,
  })

  // 6) Final answer
  steps.push({
    optionLabel: 'A',
    fruits: CARD_SETS['A'],
    highlight: [],
    swapped: null,
    caption: t(
      'Set A is impossible to fix with one swap — the answer is A.',
      'Set A tidak mungkin diperbaiki dengan satu pertukaran — jawabannya adalah A.',
    ),
    result: true,
    hold: 0,
  })

  return { steps, finalIndex: steps.length - 1 }
}
