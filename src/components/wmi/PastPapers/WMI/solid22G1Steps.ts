/**
 * solid22G1Steps — WMI-22F1A-Q7 (Grade 1) storyboard builder.
 *
 * Problem: four 3D cube solids A, B, C, D. A, B, C are the SAME solid shown in
 * different rotations; D is a different shape, so D is the odd one out
 * (answer D).
 *
 * Method the animation must SHOW (Grade-1 concrete):
 *   1. Look at all four solids together.
 *   2. A: count its cubes — that is our "model" shape.
 *   3. B: same number of cubes, just turned — same solid.
 *   4. C: same number of cubes, just turned again — same solid.
 *   5. D: count its cubes — it does NOT match (different cube count / shape that
 *      cannot be turned to match A, B, C), so D stands out.
 *   6. Result: A, B, C are the same shape turned different ways, D is the
 *      different one → answer D.
 *
 * Pure & deterministic — no Math.random, no Date. Cube counts are DERIVED from
 * SOLID_SETS so the captions can never drift from the illustrator's layout.
 */

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { SOLID_SETS } from './Solid22G1Option'

export type SolidLabel = 'A' | 'B' | 'C' | 'D'

export type SolidPhase = 'all' | 'a' | 'b' | 'c' | 'd' | 'result'

export interface SolidStep {
  phase: SolidPhase
  /** Which solid the beat zooms in on; null while all four are shown. */
  focus: SolidLabel | null
  /** Labels confirmed to be the same solid so far (matched glow). */
  matched: SolidLabel[]
  /** The odd-one-out label is flagged once it has been examined. */
  flaggedOdd: SolidLabel | null
  /** Show the cube-count tag on the focused solid. */
  showCount: boolean
  caption: string
  hold: number
  result: boolean
}

export interface SolidStoryboard {
  answer: SolidLabel
  /** Cube count shared by the matching solids (A, B, C). */
  matchCount: number
  /** Cube count of the odd one out (D). */
  oddCount: number
  /** True when the odd one out differs by cube COUNT (vs. by shape only). */
  oddByCount: boolean
  /** Localized "cubes" word for the count tags. */
  cubesLabel: string
  steps: SolidStep[]
  finalIndex: number
}

const ANSWER: SolidLabel = 'D'

export function buildSolid22G1Steps(lang: Lang): SolidStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Cube counts are read straight from the illustrator's layout, so they always
  // agree with what the figure draws.
  const countOf = (label: SolidLabel) => SOLID_SETS[label]?.length ?? 0
  const matchCount = countOf('A')
  const oddCount = countOf('D')
  const oddByCount = oddCount !== matchCount

  const cubesLabel = t('cubes', 'kubus')

  // Describe HOW D differs, in Grade-1 words, depending on what the layout shows.
  const dDiffEn = oddByCount
    ? `D has ${oddCount} cubes — not ${matchCount} like the others.`
    : `D has ${oddCount} cubes too, but they are stacked in a shape you can't turn to match A, B and C.`
  const dDiffId = oddByCount
    ? `D punya ${oddCount} kubus — bukan ${matchCount} seperti yang lain.`
    : `D juga punya ${oddCount} kubus, tapi susunannya bentuk yang tidak bisa diputar agar sama dengan A, B, dan C.`

  const steps: SolidStep[] = [
    {
      phase: 'all',
      focus: null,
      matched: [],
      flaggedOdd: null,
      showCount: false,
      hold: 2400,
      result: false,
      caption: t(
        'Three of these block shapes are the SAME — just turned a different way. One is different. Let\'s find it!',
        'Tiga dari bentuk balok ini SAMA — hanya diputar dengan cara berbeda. Satu berbeda. Ayo kita cari!',
      ),
    },
    {
      phase: 'a',
      focus: 'A',
      matched: ['A'],
      flaggedOdd: null,
      showCount: true,
      hold: 2400,
      result: false,
      caption: t(
        `Start with A. Count its cubes: ${matchCount}. This is our model shape.`,
        `Mulai dari A. Hitung kubusnya: ${matchCount}. Ini bentuk contoh kita.`,
      ),
    },
    {
      phase: 'b',
      focus: 'B',
      matched: ['A', 'B'],
      flaggedOdd: null,
      showCount: true,
      hold: 2400,
      result: false,
      caption: t(
        `B has ${matchCount} cubes in the same shape — just TURNED. Same solid as A.`,
        `B punya ${matchCount} kubus dengan bentuk sama — hanya DIPUTAR. Balok yang sama dengan A.`,
      ),
    },
    {
      phase: 'c',
      focus: 'C',
      matched: ['A', 'B', 'C'],
      flaggedOdd: null,
      showCount: true,
      hold: 2400,
      result: false,
      caption: t(
        `C has ${matchCount} cubes in the same shape, turned again. Same solid as A and B!`,
        `C punya ${matchCount} kubus dengan bentuk sama, diputar lagi. Balok yang sama dengan A dan B!`,
      ),
    },
    {
      phase: 'd',
      focus: 'D',
      matched: ['A', 'B', 'C'],
      flaggedOdd: 'D',
      showCount: true,
      hold: 2600,
      result: false,
      caption: t(`Now D. ${dDiffEn} No turn can make it match.`, `Sekarang D. ${dDiffId} Tidak ada putaran yang membuatnya cocok.`),
    },
    {
      phase: 'result',
      focus: 'D',
      matched: ['A', 'B', 'C'],
      flaggedOdd: 'D',
      showCount: true,
      hold: 0,
      result: true,
      caption: t(
        'A, B, C are the same shape turned different ways. D is the different one → answer D.',
        'A, B, C bentuk yang sama diputar berbeda. D yang berbeda → jawaban D.',
      ),
    },
  ]

  return {
    answer: ANSWER,
    matchCount,
    oddCount,
    oddByCount,
    cubesLabel,
    steps,
    finalIndex: steps.length - 1,
  }
}
