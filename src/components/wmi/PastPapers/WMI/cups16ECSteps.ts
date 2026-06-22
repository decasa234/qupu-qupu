// IKMC-21-EC-Q16 — storyboard for the cup-flip cycle animation.
//
// Question: Nora plays with 3 cups. She takes the left-hand cup, flips it
// over, and puts it to the right. After 10 moves, what do the cups look like?
// Answer: B  [D, D, U]
//
// Cup state notation:
//   U = opening up  (right-side up, normal cup)
//   D = opening down (upside-down, dome/lid shape)
//
// Move rule: take leftmost cup, flip it (U↔D), place on right.
//
// States cycle with period 6:
//   State 0 (initial): [U, U, U]
//   State 1:           [U, U, D]   option C
//   State 2:           [U, D, D]
//   State 3:           [D, D, D]   option E
//   State 4:           [D, D, U]   option B  ← ANSWER
//   State 5:           [D, U, U]   option A
//   State 6 = State 0: [U, U, U]   option D
//
// After 10 moves: 10 = 6 × 1 + 4 → same as state 4 → [D, D, U] → answer B.
//
// Teaching walk (7 beats):
//   0. intro     — show initial state [U,U,U]; note the move rule.
//   1. move1     — apply move 1 → [U,U,D].
//   2. move2     — apply move 2 → [U,D,D].
//   3. move3     — apply move 3 → [D,D,D]; all upside-down.
//   4. move6     — apply moves 4,5,6 → back to [U,U,U]; reveal cycle = 6.
//   5. modulo    — 10 mod 6 = 4; same as after 4 moves.
//   6. result    — show state 4 = [D,D,U] = answer B.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

import type { CupState } from './Cups16ECIllustration'

export type Lang = 'en' | 'id'

export interface Cups16ECBeat {
  /** Current cup state [left, mid, right]. */
  state: CupState
  /** Label shown above the cups, or null. */
  stateLabel: string | null
  /** Index 0/1/2 to highlight (the cup just moved), or null. */
  highlightIndex: number | null
  /** Caption text for this beat. */
  caption: string
  /** Auto-hold duration in ms (0 = final / manual). */
  hold: number
  /** True only on the final result beat. */
  result: boolean
}

export interface Cups16ECStoryboard {
  steps: Cups16ECBeat[]
  finalIndex: number
  answer: string
}

export function buildCups16ECSteps(lang: Lang): Cups16ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const s0: CupState = ['U', 'U', 'U']
  const s1: CupState = ['U', 'U', 'D']
  const s2: CupState = ['U', 'D', 'D']
  const s3: CupState = ['D', 'D', 'D']
  // states 4,5 skipped in the walk — we jump from s3 back to s0 to show cycle
  const s4: CupState = ['D', 'D', 'U']   // the answer state

  const steps: Cups16ECBeat[] = [
    // Beat 0 — initial state
    {
      state: s0,
      stateLabel: t('Start', 'Awal'),
      highlightIndex: null,
      hold: 2400,
      result: false,
      caption: t(
        'Initial state: all 3 cups are upright [U U U]. Each move: take the LEFTMOST cup, flip it, place it on the RIGHT.',
        'Keadaan awal: ketiga cangkir tegak [U U U]. Setiap gerakan: ambil cangkir paling KIRI, balik, letakkan di KANAN.',
      ),
    },

    // Beat 1 — move 1
    {
      state: s1,
      stateLabel: t('After move 1', 'Setelah gerakan 1'),
      highlightIndex: 2,   // the rightmost cup was just placed
      hold: 2200,
      result: false,
      caption: t(
        'Move 1: take the left cup (↑ upright), flip it → (↓ upside-down), place on right. State: [U U D].',
        'Gerakan 1: ambil cangkir kiri (↑ tegak), balik → (↓ terbalik), letakkan di kanan. Keadaan: [U U D].',
      ),
    },

    // Beat 2 — move 2
    {
      state: s2,
      stateLabel: t('After move 2', 'Setelah gerakan 2'),
      highlightIndex: 2,
      hold: 2200,
      result: false,
      caption: t(
        'Move 2: take the left cup (↑ upright), flip → (↓ upside-down), place on right. State: [U D D].',
        'Gerakan 2: ambil cangkir kiri (↑ tegak), balik → (↓ terbalik), letakkan di kanan. Keadaan: [U D D].',
      ),
    },

    // Beat 3 — move 3
    {
      state: s3,
      stateLabel: t('After move 3', 'Setelah gerakan 3'),
      highlightIndex: 2,
      hold: 2400,
      result: false,
      caption: t(
        'Move 3: take the last upright cup, flip → upside-down. All 3 cups are now upside-down [D D D] = option E.',
        'Gerakan 3: ambil cangkir tegak terakhir, balik → terbalik. Ketiga cangkir kini terbalik [D D D] = pilihan E.',
      ),
    },

    // Beat 4 — moves 4,5,6 → back to start; reveal cycle
    {
      state: s0,
      stateLabel: t('After move 6 — cycle!', 'Setelah gerakan 6 — siklus!'),
      highlightIndex: null,
      hold: 2600,
      result: false,
      caption: t(
        'After 3 more moves (4, 5, 6) we return to [U U U]! The cycle length is 6 — the pattern repeats every 6 moves.',
        'Setelah 3 gerakan lagi (4, 5, 6) kita kembali ke [U U U]! Panjang siklus adalah 6 — pola berulang setiap 6 gerakan.',
      ),
    },

    // Beat 5 — modular arithmetic
    {
      state: s0,
      stateLabel: t('10 moves = ?', '10 gerakan = ?'),
      highlightIndex: null,
      hold: 2600,
      result: false,
      caption: t(
        '10 moves: 10 ÷ 6 = 1 remainder 4. So after 10 moves the state is the SAME as after 4 moves.',
        '10 gerakan: 10 ÷ 6 = 1 sisa 4. Jadi setelah 10 gerakan keadaannya SAMA seperti setelah 4 gerakan.',
      ),
    },

    // Beat 6 — result: state after 4 moves
    {
      state: s4,
      stateLabel: t('After 4 moves = After 10 moves', 'Setelah 4 gerakan = Setelah 10 gerakan'),
      highlightIndex: null,
      hold: 0,
      result: true,
      caption: t(
        'State after 4 moves: [D D U] — left and middle upside-down, right upright. This matches figure B → answer B.',
        'Keadaan setelah 4 gerakan: [D D U] — kiri dan tengah terbalik, kanan tegak. Ini cocok dengan gambar B → jawaban B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: 'B' }
}
