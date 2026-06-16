/**
 * WMI-19P1A-Q6 — storyboard for the "how many MORE small triangles fill the
 * empty space?" explainer (2019 Grade 1 Semifinal, Paper A, answer B = 7).
 *
 * Method shown beat-by-beat:
 *   1. Intro: the white middle is still empty; we fill it one small triangle at
 *      a time and keep a running count.
 *   2. Beats 1..7: drop in EMPTY_TILES[i] (the i-th fill triangle), with the
 *      active ring on it, and bump the counter to i+1.
 *   3. Result: the gap is full — it took 7 triangles → answer B.
 *
 * Deterministic & SSR-safe: a pure function of `lang` only. No random, no Date.
 * The tile order is read straight from EMPTY_TILES so the count can never drift
 * from the illustration's geometry.
 */

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { EMPTY_TILES, type Tile } from './TriangleFill19P1Illustration'

export interface TriangleFillStep {
  /** Empty tiles revealed (filled) so far on this beat. */
  filled: Tile[]
  /** The tile placed THIS beat (ringed), or null on intro / result beats. */
  active: Tile | null
  /** Running count of triangles placed so far. */
  count: number
  caption: string
  hold: number
  result: boolean
}

export interface TriangleFillStoryboard {
  answer: number // 7
  steps: TriangleFillStep[]
  finalIndex: number
}

export function buildTriangleFill19P1Steps(lang: Lang): TriangleFillStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const total = EMPTY_TILES.length // 7

  const steps: TriangleFillStep[] = []

  // Intro beat — show the empty figure, name the plan.
  steps.push({
    filled: [],
    active: null,
    count: 0,
    hold: 1700,
    result: false,
    caption: t(
      'The white middle is empty. Fill it with the small triangle, one at a time, and count.',
      'Bagian tengah putih masih kosong. Isi dengan segitiga kecil, satu per satu, sambil dihitung.',
    ),
  })

  // One beat per fill triangle.
  EMPTY_TILES.forEach((tile, i) => {
    const n = i + 1
    steps.push({
      filled: EMPTY_TILES.slice(0, n),
      active: tile,
      count: n,
      hold: n === total ? 1900 : 1300,
      result: false,
      caption: t(`Triangle ${n}.`, `Segitiga ke-${n}.`),
    })
  })

  // Result beat — gap full, land on the answer.
  steps.push({
    filled: EMPTY_TILES.slice(),
    active: null,
    count: total,
    hold: 0,
    result: true,
    caption: t(
      `The gap is full — it took ${total} small triangles. Answer B.`,
      `Bagian kosong sudah penuh — perlu ${total} segitiga kecil. Jawaban B.`,
    ),
  })

  return {
    answer: total,
    steps,
    finalIndex: steps.length - 1,
  }
}
