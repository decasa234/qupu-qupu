import type { Lang } from '../concepts/explainers/makeTenSteps'

export const BALANCE_ANSWER = '2 bananas'
export const BALANCE_ANSWER_ID = '2 pisang'

/** A fruit on a tray. '?' is the unknown group we must find. */
export type Fruit = 'banana' | 'strawberry' | '?'

export interface BalanceStep {
  /** Which scale this beat is reasoning about (for a small heading). */
  scale: 1 | 2
  /** Fruits on the left tray, left-to-right. */
  left: Fruit[]
  /** Fruits on the right tray, left-to-right. */
  right: Fruit[]
  /** Tilt of the beam: 0 = balanced. (We always keep scales balanced here.) */
  tilt: number
  /** Short tag drawn above the scale (e.g. the deduced fact). */
  fact: string
  caption: string
  hold: number
  /** The winning beat (answer revealed). */
  result: boolean
}

export interface BalanceStoryboard {
  answer: string
  steps: BalanceStep[]
  finalIndex: number
}

/**
 * WMI-22F1A-Q9 — two balance scales, find the missing group on scale 2.
 *
 * Scale 1: 4 bananas  =  9 strawberries + 1 banana.
 *   Take 1 banana off BOTH sides  →  3 bananas = 9 strawberries.
 *   Share the 9 strawberries among the 3 bananas  →  1 banana = 3 strawberries.
 * Scale 2: ?  =  6 strawberries.
 *   6 strawberries = 3 + 3 = two groups of "1 banana"  →  ? = 2 bananas.
 *
 * We never jump to the answer: we strip the shared banana, derive the
 * one-banana fact, then re-use it to count the 6 strawberries into bananas.
 */
export function buildBalance22G1Steps(lang: Lang): BalanceStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const B = (n: number): Fruit[] => Array.from({ length: n }, () => 'banana')
  const S = (n: number): Fruit[] => Array.from({ length: n }, () => 'strawberry')

  const steps: BalanceStep[] = [
    // 1 — Scale 1 as given: 4 bananas balance 9 strawberries + 1 banana.
    {
      scale: 1,
      left: B(4),
      right: [...S(9), 'banana'],
      tilt: 0,
      fact: t('Scale 1', 'Timbangan 1'),
      hold: 2600,
      result: false,
      caption: t(
        'Scale 1 balances: 4 bananas weigh the same as 9 strawberries and 1 banana.',
        'Timbangan 1 seimbang: 4 pisang sama beratnya dengan 9 stroberi dan 1 pisang.',
      ),
    },
    // 2 — Take 1 banana off BOTH sides; it still balances.
    {
      scale: 1,
      left: B(3),
      right: S(9),
      tilt: 0,
      fact: t('take 1 banana off each side', 'ambil 1 pisang dari tiap sisi'),
      hold: 2400,
      result: false,
      caption: t(
        'Take 1 banana off BOTH sides — it still balances. Now 3 bananas weigh the same as 9 strawberries.',
        'Ambil 1 pisang dari KEDUA sisi — tetap seimbang. Sekarang 3 pisang sama beratnya dengan 9 stroberi.',
      ),
    },
    // 3 — Share the 9 strawberries among the 3 bananas → 1 banana = 3 strawberries.
    {
      scale: 1,
      left: B(1),
      right: S(3),
      tilt: 0,
      fact: t('1 banana = 3 strawberries', '1 pisang = 3 stroberi'),
      hold: 2600,
      result: false,
      caption: t(
        'Share the 9 strawberries fairly among the 3 bananas: 9 ÷ 3 = 3. So 1 banana = 3 strawberries.',
        'Bagi rata 9 stroberi ke 3 pisang: 9 ÷ 3 = 3. Jadi 1 pisang = 3 stroberi.',
      ),
    },
    // 4 — Scale 2 as given: ? balances 6 strawberries.
    {
      scale: 2,
      left: ['?'],
      right: S(6),
      tilt: 0,
      fact: t('Scale 2', 'Timbangan 2'),
      hold: 2400,
      result: false,
      caption: t(
        'Scale 2: the missing group balances 6 strawberries. How many bananas is that?',
        'Timbangan 2: kelompok yang hilang seimbang dengan 6 stroberi. Itu berapa pisang?',
      ),
    },
    // 5 — 6 strawberries = 3 + 3 = two groups of "1 banana".
    {
      scale: 2,
      left: B(2),
      right: S(6),
      tilt: 0,
      fact: t('6 = 3 + 3', '6 = 3 + 3'),
      hold: 2200,
      result: false,
      caption: t(
        'Each banana is worth 3 strawberries, and 6 = 3 + 3 — that is two groups of 3. So 6 strawberries = 2 bananas.',
        'Tiap pisang bernilai 3 stroberi, dan 6 = 3 + 3 — itu dua kelompok 3. Jadi 6 stroberi = 2 pisang.',
      ),
    },
    // 6 — Result: the missing group is 2 bananas.
    {
      scale: 2,
      left: B(2),
      right: S(6),
      tilt: 0,
      fact: t('? = 2 bananas', '? = 2 pisang'),
      hold: 0,
      result: true,
      caption: t(
        'The missing group is 2 bananas. Answer: 2 bananas (B).',
        'Kelompok yang hilang adalah 2 pisang. Jawaban: 2 pisang (B).',
      ),
    },
  ]

  return {
    answer: t(BALANCE_ANSWER, BALANCE_ANSWER_ID),
    steps,
    finalIndex: steps.length - 1,
  }
}
