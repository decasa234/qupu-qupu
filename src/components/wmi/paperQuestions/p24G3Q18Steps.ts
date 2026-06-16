import type { Lang } from '../concepts/explainers/makeTenSteps'
import { BLOCK_A_CUBES, BLOCK_B_CUBES, SOLID_CUBES } from './P24G3Q18Illustration'

export type Q18Phase = 'count' | 'rule' | 'check' | 'flagC' | 'result'

export type OptionLabel = 'A' | 'B' | 'C' | 'D' | 'E'

export interface Q18Step {
  phase: Q18Phase
  /** Options confirmed splittable into the two blocks so far. */
  matched: OptionLabel[]
  /** The option flagged impossible (or null). */
  flagged: OptionLabel | null
  /** Show the "= 8 cubes" total badge on the two blocks. */
  showTotal: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q18Storyboard {
  blockA: number
  blockB: number
  total: number
  answer: OptionLabel
  steps: Q18Step[]
  finalIndex: number
}

export function buildP24G3Q18Steps(lang: Lang): Q18Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q18Step[] = [
    {
      phase: 'count',
      matched: [],
      flagged: null,
      showTotal: true,
      hold: 2000,
      result: false,
      caption: t(
        `Count cubes: ${BLOCK_A_CUBES} + ${BLOCK_B_CUBES} = ${SOLID_CUBES}. Every answer must use exactly ${SOLID_CUBES} cubes.`,
        `Hitung kubus: ${BLOCK_A_CUBES} + ${BLOCK_B_CUBES} = ${SOLID_CUBES}. Tiap jawaban harus pakai tepat ${SOLID_CUBES} kubus.`,
      ),
    },
    {
      phase: 'rule',
      matched: [],
      flagged: null,
      showTotal: true,
      hold: 1900,
      result: false,
      caption: t(
        'A valid solid can be cut back into these two blocks - no extra, no missing cube.',
        'Bangun yang sah bisa dipotong jadi dua balok ini - tanpa lebih atau kurang.',
      ),
    },
    {
      phase: 'check',
      matched: ['A', 'B', 'D', 'E'],
      flagged: null,
      showTotal: true,
      hold: 2200,
      result: false,
      caption: t(
        'A, B, D and E each split cleanly into the two blocks.',
        'A, B, D dan E masing-masing terbelah rapi menjadi dua balok.',
      ),
    },
    {
      phase: 'flagC',
      matched: ['A', 'B', 'D', 'E'],
      flagged: 'C',
      showTotal: true,
      hold: 2200,
      result: false,
      caption: t(
        "C cannot be cut into those two blocks - its cubes don't fit the two shapes.",
        'C tidak bisa dipotong jadi dua balok itu - kubusnya tidak cocok dengan dua bentuk.',
      ),
    },
    {
      phase: 'result',
      matched: ['A', 'B', 'D', 'E'],
      flagged: 'C',
      showTotal: true,
      hold: 0,
      result: true,
      caption: t(
        'So the solid that cannot be formed is C.',
        'Jadi bangun yang tidak dapat dibentuk adalah C.',
      ),
    },
  ]

  return {
    blockA: BLOCK_A_CUBES,
    blockB: BLOCK_B_CUBES,
    total: SOLID_CUBES,
    answer: 'C',
    steps,
    finalIndex: steps.length - 1,
  }
}
