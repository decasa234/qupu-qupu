/**
 * p22G3Q10Steps — storyboard for WMI-22P3A-Q10 (cube net, min corner sum)
 *
 * Method (verified by a fold simulation):
 *   The strip 5-8-3-9 wraps the four sides, so opposite faces are 5↔3 and 8↔9.
 *   The two caps fold opposite: 3 (top) ↔ 4 (bottom).
 *   Three faces at one vertex are NEVER an opposite pair, so you may pick one
 *   value from each of the three pairs. To minimise, take the smaller of each:
 *     min(5,3)=3, min(8,9)=8, min(3,4)=3  →  3 + 8 + 3 = 14  (answer B).
 *
 * Pure function — no Math.random, no Date. SSR-safe.
 */

import { MIN_CORNER_SUM } from './P22G3Q10Illustration'

export type Lang = 'en' | 'id'

export type Q10Phase = 'intro' | 'sides' | 'caps' | 'pick' | 'result'

export interface Q10Step {
  phase: Q10Phase
  /** "r,c" keys to amber-highlight. */
  highlight: Set<string>
  /** "r,c" keys to dim (the larger, rejected face of a pair). */
  dimmed: Set<string>
  /** Running picked values to display (e.g. [3, 8]). */
  picked: number[]
  caption: string
  hold: number
  result: boolean
}

export interface Q10Storyboard {
  answer: number
  steps: Q10Step[]
  finalIndex: number
}

export function buildP22G3Q10Steps(lang: Lang): Q10Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q10Step[] = [
    {
      phase: 'intro',
      highlight: new Set(),
      dimmed: new Set(),
      picked: [],
      hold: 1800,
      result: false,
      caption: t(
        'Three faces meet at a corner. First find which faces end up OPPOSITE.',
        'Tiga sisi bertemu di satu sudut. Cari dulu sisi mana yang berhadapan.',
      ),
    },
    {
      phase: 'sides',
      highlight: new Set(['1,0', '1,1', '1,2', '1,3']),
      dimmed: new Set(),
      picked: [],
      hold: 2200,
      result: false,
      caption: t(
        'The strip 5·8·3·9 wraps the 4 sides, so opposites are 5↔3 and 8↔9.',
        'Baris 5·8·3·9 membungkus 4 sisi, jadi yang berhadapan: 5↔3 dan 8↔9.',
      ),
    },
    {
      phase: 'caps',
      highlight: new Set(['0,0', '2,0']),
      dimmed: new Set(),
      picked: [],
      hold: 2000,
      result: false,
      caption: t(
        'The top cap 3 folds opposite the bottom cap 4: the pair 3↔4.',
        'Tutup atas 3 terlipat berhadapan dengan tutup bawah 4: pasangan 3↔4.',
      ),
    },
    {
      phase: 'pick',
      // keep the smaller of each pair; dim the larger
      highlight: new Set(['1,2', '1,1', '0,0']), // 3 (of 5↔3), 8 (of 8↔9), 3 (of 3↔4)
      dimmed: new Set(['1,0', '1,3', '2,0']), // 5, 9, 4 rejected
      picked: [3, 8, 3],
      hold: 2200,
      result: false,
      caption: t(
        'A corner never uses both of a pair — so take the SMALLER of each: 3, 8, 3.',
        'Sudut tak pernah pakai keduanya — ambil yang LEBIH KECIL: 3, 8, 3.',
      ),
    },
    {
      phase: 'result',
      highlight: new Set(['1,2', '1,1', '0,0']),
      dimmed: new Set(['1,0', '1,3', '2,0']),
      picked: [3, 8, 3],
      hold: 0,
      result: true,
      caption: t(
        `3 + 8 + 3 = ${MIN_CORNER_SUM}. Smallest corner sum — answer B.`,
        `3 + 8 + 3 = ${MIN_CORNER_SUM}. Jumlah sudut terkecil — jawaban B.`,
      ),
    },
  ]

  return { answer: MIN_CORNER_SUM, steps, finalIndex: steps.length - 1 }
}
