/**
 * p22G3Q9Steps — storyboard for WMI-22P3A-Q9 (longest & shortest perimeter)
 *
 * Key insight: every bowed-OUT arc is matched by an equal bowed-IN arc, so the
 * arcs cancel and each shape's perimeter = its straight-edge outline.
 *
 *   P (rect 18×8)      : 2·(18+8) = 52   ← SHORTEST
 *   R (tri 10,26,24)   : 10+26+24 = 60
 *   S (square 16)      : 16·4      = 64   ← LONGEST
 *   Q (pentagon)       : not numerically compared in the paper
 *
 * Longest = S, shortest = P. The answer option that pairs S (longest) with
 * P (shortest) correctly is B.
 *
 * Pure function — no Math.random, no Date. SSR-safe.
 */

import { PERIM } from './P22G3Q9Illustration'

export type Lang = 'en' | 'id'
export type ShapeKey = 'P' | 'Q' | 'R' | 'S'

export type Q9Phase = 'intro' | 'arcs' | 'P' | 'R' | 'S' | 'result'

export interface Q9Step {
  phase: Q9Phase
  /** Which shape to ring/emphasise (null = none). */
  emphasis: ShapeKey | null
  caption: string
  hold: number
  result: boolean
}

export interface Q9Storyboard {
  perim: typeof PERIM
  steps: Q9Step[]
  finalIndex: number
}

export function buildP22G3Q9Steps(lang: Lang): Q9Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q9Step[] = [
    {
      phase: 'intro',
      emphasis: null,
      hold: 1700,
      result: false,
      caption: t(
        'Each side may bow in or out — but does that change the perimeter?',
        'Tiap sisi boleh melengkung ke dalam atau ke luar — apakah itu mengubah keliling?',
      ),
    },
    {
      phase: 'arcs',
      emphasis: null,
      hold: 2100,
      result: false,
      caption: t(
        'Every bulge OUT is matched by a dent IN, so the arcs cancel. Perimeter = the straight outline.',
        'Setiap tonjolan KE LUAR diimbangi lekukan KE DALAM, jadi busurnya saling meniadakan. Keliling = garis lurusnya.',
      ),
    },
    {
      phase: 'P',
      emphasis: 'P',
      hold: 2000,
      result: false,
      caption: t(
        `P is 18 by 8: 2 × (18 + 8) = ${PERIM.P}.`,
        `P berukuran 18 kali 8: 2 × (18 + 8) = ${PERIM.P}.`,
      ),
    },
    {
      phase: 'R',
      emphasis: 'R',
      hold: 2000,
      result: false,
      caption: t(
        `R has sides 10, 26, 24: 10 + 26 + 24 = ${PERIM.R}.`,
        `R bersisi 10, 26, 24: 10 + 26 + 24 = ${PERIM.R}.`,
      ),
    },
    {
      phase: 'S',
      emphasis: 'S',
      hold: 2000,
      result: false,
      caption: t(
        `S is a square of side 16: 16 × 4 = ${PERIM.S}.`,
        `S persegi bersisi 16: 16 × 4 = ${PERIM.S}.`,
      ),
    },
    {
      phase: 'result',
      emphasis: 'S',
      hold: 0,
      result: true,
      caption: t(
        `Biggest is S = ${PERIM.S}, smallest is P = ${PERIM.P}. The option pairing longest S with shortest P is B.`,
        `Terbesar S = ${PERIM.S}, terkecil P = ${PERIM.P}. Opsi yang memasangkan terpanjang S dengan terpendek P adalah B.`,
      ),
    },
  ]

  return { perim: PERIM, steps, finalIndex: steps.length - 1 }
}
