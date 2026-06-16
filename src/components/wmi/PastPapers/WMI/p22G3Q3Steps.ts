// WMI-22P3A-Q3 (2022 Grade 3 Semifinal) — pick the balanced scale.
//
// GIVEN:  1 juice = 5 apples ;  1 bottle = 3 apples.
// The four options are pictures; option A is the one that balances. Working in
// apples, the balanced pairing is  1 juice  ⇔  1 bottle + 2 apples  (5 = 3 + 2).
// Answer A.
//
// METHOD (deduce, don't assert):
//   1. Turn everything into the SAME unit — apples. Juice = 5 apples.
//   2. Bottle = 3 apples.
//   3. So juice (5) is heavier than 1 bottle (3) by exactly 2 apples.
//   4. To balance the juice we need a bottle PLUS 2 apples: 3 + 2 = 5. Show that
//      candidate scale level. That matched picture is option A.
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe &
// deterministic. Each beat names which scale to show (the two facts, or the
// derived candidate) and the apple bookkeeping.

import type { ItemGlyph } from './P22G3Q3Illustration'

export type Lang = 'en' | 'id'

export const ANSWER_CHOICE = 'A'
export const JUICE_APPLES = 5
export const BOTTLE_APPLES = 3

/** Which scene the figure shows this beat. */
export type Scene = 'fact1' | 'fact2' | 'candidate'

export interface BalanceStep {
  scene: Scene
  /** Left / right pan contents for the shown scale. */
  left: ItemGlyph[]
  right: ItemGlyph[]
  /** Apple value badges to print under the pans ([left, right] or null). */
  appleTally: [number, number] | null
  result: boolean
  caption: string
  hold: number
}

export interface BalanceStoryboard {
  choice: string
  steps: BalanceStep[]
  finalIndex: number
}

const A = (n: number): ItemGlyph[] => Array.from({ length: n }, () => 'apple')

export function buildP22G3Q3Steps(lang: Lang): BalanceStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BalanceStep[] = [
    // 1. Juice = 5 apples.
    {
      scene: 'fact1',
      left: ['juice'],
      right: A(5),
      appleTally: [5, 5],
      result: false,
      hold: 2500,
      caption: t(
        'Turn everything into apples. The first scale says 1 juice = 5 apples.',
        'Ubah semuanya jadi apel. Timbangan pertama: 1 jus = 5 apel.',
      ),
    },
    // 2. Bottle = 3 apples.
    {
      scene: 'fact2',
      left: A(3),
      right: ['bottle'],
      appleTally: [3, 3],
      result: false,
      hold: 2500,
      caption: t(
        'The second scale says 1 bottle = 3 apples.',
        'Timbangan kedua: 1 botol = 3 apel.',
      ),
    },
    // 3. Compare juice vs bottle.
    {
      scene: 'candidate',
      left: ['juice'],
      right: ['bottle'],
      appleTally: [5, 3],
      result: false,
      hold: 2600,
      caption: t(
        'Juice is worth 5 apples, a bottle only 3 — the juice is heavier by 2 apples.',
        'Jus bernilai 5 apel, botol hanya 3 — jus lebih berat 2 apel.',
      ),
    },
    // 4. Add 2 apples to the bottle side → balance.
    {
      scene: 'candidate',
      left: ['juice'],
      right: ['bottle', 'apple', 'apple'],
      appleTally: [5, 5],
      result: true,
      hold: 0,
      caption: t(
        `Add 2 apples to the bottle: 3 + 2 = 5. Now both sides are 5 apples — balanced. That's choice ${ANSWER_CHOICE}.`,
        `Tambah 2 apel ke botol: 3 + 2 = 5. Kini kedua sisi 5 apel — seimbang. Itulah pilihan ${ANSWER_CHOICE}.`,
      ),
    },
  ]

  return { choice: ANSWER_CHOICE, steps, finalIndex: steps.length - 1 }
}
