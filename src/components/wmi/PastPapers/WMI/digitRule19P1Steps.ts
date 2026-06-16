import type { Lang } from '../../concepts/explainers/makeTenSteps'

export interface DigitRuleArrangement {
  text: string
  /** Valid = a 2-digit number with no leading zero. */
  valid: boolean
}

// All 6 ordered pairs of two DIFFERENT digits from {5, 2, 0}.
// Leading-zero pairs (05, 02) break the rule, leaving 4 valid numbers.
export const ARRANGEMENTS: DigitRuleArrangement[] = [
  { text: '52', valid: true },
  { text: '50', valid: true },
  { text: '25', valid: true },
  { text: '20', valid: true },
  { text: '05', valid: false },
  { text: '02', valid: false },
]

export const VALID_COUNT = ARRANGEMENTS.filter((a) => a.valid).length // 4

export interface DigitRuleStep {
  /** How many examples in the rule strip carry their tick/cross mark. */
  showMarks: boolean
  /** How many of the 6 arrangements are revealed (0..6). */
  revealed: number
  /** When true, the two leading-zero arrangements are struck through. */
  crossOut: boolean
  caption: string
  hold: number
  result: boolean
}

export interface DigitRuleStoryboard {
  arrangements: DigitRuleArrangement[]
  validCount: number
  steps: DigitRuleStep[]
  finalIndex: number
}

export function buildDigitRule19P1Steps(lang: Lang): DigitRuleStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DigitRuleStep[] = [
    {
      showMarks: true,
      revealed: 0,
      crossOut: false,
      hold: 1900,
      result: false,
      caption: t(
        'The rule: a value is a 2-digit number — no leading zero (07 is rejected).',
        'Aturannya: nilai adalah bilangan 2 angka — tanpa nol di depan (07 ditolak).',
      ),
    },
    {
      showMarks: true,
      revealed: 6,
      crossOut: false,
      hold: 2100,
      result: false,
      caption: t(
        'From 5, 2, 0 there are 3 × 2 = 6 ways to place two different digits.',
        'Dari 5, 2, 0 ada 3 × 2 = 6 cara menaruh dua angka berbeda.',
      ),
    },
    {
      showMarks: true,
      revealed: 6,
      crossOut: true,
      hold: 2000,
      result: false,
      caption: t(
        '05 and 02 start with 0, so they break the rule — cross them out.',
        '05 dan 02 diawali 0, jadi melanggar aturan — coret keduanya.',
      ),
    },
    {
      showMarks: true,
      revealed: 6,
      crossOut: true,
      hold: 0,
      result: true,
      caption: t(
        `That leaves 52, 50, 25, 20 — ${VALID_COUNT} valid numbers. Answer A.`,
        `Tersisa 52, 50, 25, 20 — ${VALID_COUNT} bilangan sah. Jawaban A.`,
      ),
    },
  ]

  return {
    arrangements: ARRANGEMENTS,
    validCount: VALID_COUNT,
    steps,
    finalIndex: steps.length - 1,
  }
}
