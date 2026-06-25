// Animation steps for HKIMO-25-P2H-Q10 — AB + AB = 1A2 (A=9, B=6).
//
// Solving strategy:
//   1. Intro    — show the full setup.
//   2. Units    — column U: B+B ends in 2 → 2B=12 → B=6, carry 1.
//   3. Tens     — column T: A+A+1 ends in A → 2A+1≡A(mod10) → A=9, carry 1.
//   4. Hundreds — column H: carry=1 matches the leading "1". ✓
//   5. Result   — A+B = 9+6 = 15.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type AddPhase = 'intro' | 'units' | 'tens' | 'hundreds' | 'result'

/** Which column(s) to highlight, or null for all / none. */
export interface AddStep {
  phase: AddPhase
  highlightCol: 'units' | 'tens' | 'hundreds' | null
  /** carry dot to draw above result row, per column (null = none). */
  carryTens: boolean
  carryHundreds: boolean
  caption: string
  hold: number
  result: boolean
}

function t(lang: Lang, en: string, id: string): string {
  return lang === 'id' ? id : en
}

export function buildColumnAddHK25P2Q10Steps(lang: Lang): { steps: AddStep[]; finalIndex: number } {
  const steps: AddStep[] = [
    {
      phase: 'intro',
      highlightCol: null,
      carryTens: false,
      carryHundreds: false,
      caption: t(
        lang,
        'A and B are different 1-digit numbers. Solve each column from right to left.',
        'A dan B adalah angka 1 digit yang berbeda. Selesaikan setiap kolom dari kanan ke kiri.',
      ),
      hold: 2200,
      result: false,
    },
    {
      phase: 'units',
      highlightCol: 'units',
      carryTens: false,
      carryHundreds: false,
      caption: t(
        lang,
        'Units column: B + B = __2. So 2B ends in 2. Since B is a digit, 2B = 12 → B = 6, carry 1.',
        'Kolom satuan: B + B = __2. Jadi 2B berakhiran 2. Karena B adalah digit, 2B = 12 → B = 6, simpan 1.',
      ),
      hold: 2800,
      result: false,
    },
    {
      phase: 'tens',
      highlightCol: 'tens',
      carryTens: true,
      carryHundreds: false,
      caption: t(
        lang,
        'Tens column: A + A + 1 (carry) = _A. So 2A + 1 ends in A → A + 1 ≡ 0 (mod 10) → A = 9, carry 1.',
        'Kolom puluhan: A + A + 1 (simpanan) = _A. Jadi 2A + 1 berakhiran A → A + 1 ≡ 0 (mod 10) → A = 9, simpan 1.',
      ),
      hold: 2800,
      result: false,
    },
    {
      phase: 'hundreds',
      highlightCol: 'hundreds',
      carryTens: true,
      carryHundreds: true,
      caption: t(
        lang,
        'Hundreds column: carry = 1, which matches the "1" in 1A2. ✓',
        'Kolom ratusan: simpanan = 1, sesuai dengan "1" pada 1A2. ✓',
      ),
      hold: 2200,
      result: false,
    },
    {
      phase: 'result',
      highlightCol: null,
      carryTens: false,
      carryHundreds: false,
      caption: t(lang, 'A = 9, B = 6  →  A + B = 9 + 6 = 15 ✓', 'A = 9, B = 6  →  A + B = 9 + 6 = 15 ✓'),
      hold: 2500,
      result: true,
    },
  ]
  return { steps, finalIndex: steps.length - 1 }
}
