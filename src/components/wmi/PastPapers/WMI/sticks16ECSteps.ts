// sticks16ECSteps — IKMC-20-EC-Q16
//
// "Farid has two types of sticks: short (1 cm) and long (3 cm).
// With which combination can he make a square, without breaking or overlapping?"
// Answer: B — 3 short + 3 long (total 12 cm, side 3 cm)
//
// Strategy (from seed):
//   A square has 4 equal sides → total length must be divisible by 4.
//   Check each option. Only B gives 12 cm (÷4 = 3 cm per side).
//   Verify constructibility: 3 sides of one 3 cm long stick each + 1 side of 3×1 cm short sticks.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

// ── Option data ───────────────────────────────────────────────────────────────

export interface StickOption {
  label: string
  /** number of short (1 cm) sticks */
  short: number
  /** number of long (3 cm) sticks */
  long: number
  /** total length in cm */
  total: number
  /** whether divisible by 4 */
  divisible: boolean
  /** whether constructible as a square (side can be assembled from whole sticks) */
  constructible: boolean
  /** total ÷ 4 (may be non-integer — shown as fraction string when not integer) */
  sideStr: string
}

export const OPTIONS: StickOption[] = [
  { label: 'A', short: 5, long: 2, total: 11, divisible: false, constructible: false, sideStr: '2.75' },
  { label: 'B', short: 3, long: 3, total: 12, divisible: true,  constructible: true,  sideStr: '3'    },
  { label: 'C', short: 6, long: 0, total:  6, divisible: false, constructible: false, sideStr: '1.5'  },
  { label: 'D', short: 4, long: 2, total: 10, divisible: false, constructible: false, sideStr: '2.5'  },
  { label: 'E', short: 0, long: 6, total: 18, divisible: false, constructible: false, sideStr: '4.5'  },
]

// ── Beat types ────────────────────────────────────────────────────────────────

export interface Sticks16ECStep {
  /** Index (0-based) of the option currently being checked (-1 = intro, 5 = square, 6 = result) */
  checkIndex: number
  /** Whether to show the assembled square for option B */
  showSquare: boolean
  /** Index highlighted in green (0-based, -1 = none) */
  answerIndex: number
  caption: string
  hold: number
  result: boolean
}

export interface Sticks16ECStoryboard {
  answer: string
  steps: Sticks16ECStep[]
  finalIndex: number
}

// ── Builder ───────────────────────────────────────────────────────────────────

export function buildSticks16ECSteps(lang: Lang): Sticks16ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Sticks16ECStep[] = [
    // Beat 0 — rule intro
    {
      checkIndex: -1,
      showSquare: false,
      answerIndex: -1,
      hold: 2200,
      result: false,
      caption: t(
        'A square has 4 equal sides, so the total stick length must divide evenly by 4.',
        'Persegi memiliki 4 sisi sama, jadi total panjang tongkat harus habis dibagi 4.',
      ),
    },
    // Beat 1 — check A (11 cm)
    {
      checkIndex: 0,
      showSquare: false,
      answerIndex: -1,
      hold: 2000,
      result: false,
      caption: t(
        'A: 5×1 + 2×3 = 11 cm — 11 ÷ 4 = 2.75, not a whole number ✗',
        'A: 5×1 + 2×3 = 11 cm — 11 ÷ 4 = 2,75, bukan bilangan bulat ✗',
      ),
    },
    // Beat 2 — check B (12 cm)
    {
      checkIndex: 1,
      showSquare: false,
      answerIndex: -1,
      hold: 2000,
      result: false,
      caption: t(
        'B: 3×1 + 3×3 = 12 cm — 12 ÷ 4 = 3 cm per side ✓ looks good!',
        'B: 3×1 + 3×3 = 12 cm — 12 ÷ 4 = 3 cm per sisi ✓ terlihat bagus!',
      ),
    },
    // Beat 3 — check C (6 cm)
    {
      checkIndex: 2,
      showSquare: false,
      answerIndex: -1,
      hold: 1800,
      result: false,
      caption: t(
        'C: 6×1 = 6 cm — 6 ÷ 4 = 1.5, not a whole number ✗',
        'C: 6×1 = 6 cm — 6 ÷ 4 = 1,5, bukan bilangan bulat ✗',
      ),
    },
    // Beat 4 — check D (10 cm)
    {
      checkIndex: 3,
      showSquare: false,
      answerIndex: -1,
      hold: 1800,
      result: false,
      caption: t(
        'D: 4×1 + 2×3 = 10 cm — 10 ÷ 4 = 2.5, not a whole number ✗',
        'D: 4×1 + 2×3 = 10 cm — 10 ÷ 4 = 2,5, bukan bilangan bulat ✗',
      ),
    },
    // Beat 5 — check E (18 cm)
    {
      checkIndex: 4,
      showSquare: false,
      answerIndex: -1,
      hold: 1800,
      result: false,
      caption: t(
        'E: 6×3 = 18 cm — 18 ÷ 4 = 4.5, not a whole number ✗',
        'E: 6×3 = 18 cm — 18 ÷ 4 = 4,5, bukan bilangan bulat ✗',
      ),
    },
    // Beat 6 — show assembled square for B
    {
      checkIndex: 1,
      showSquare: true,
      answerIndex: -1,
      hold: 2200,
      result: false,
      caption: t(
        'Only B works! Side = 3 cm. Three sides each use 1 long stick; one side uses 3 short sticks.',
        'Hanya B yang berhasil! Sisi = 3 cm. Tiga sisi masing-masing pakai 1 tongkat panjang; satu sisi pakai 3 tongkat pendek.',
      ),
    },
    // Beat 7 — result
    {
      checkIndex: 1,
      showSquare: true,
      answerIndex: 1,
      hold: 0,
      result: true,
      caption: t(
        '3 short + 3 long = 12 cm ÷ 4 = 3 cm per side — answer B.',
        '3 pendek + 3 panjang = 12 cm ÷ 4 = 3 cm per sisi — jawaban B.',
      ),
    },
  ]

  return { answer: 'B', steps, finalIndex: steps.length - 1 }
}
