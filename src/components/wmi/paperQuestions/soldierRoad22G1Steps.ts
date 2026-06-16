/**
 * Storyboard builder for WMI-22F1A-Q23 — Soldier Road (Grade 1).
 *
 * Four soldiers 1,2,3,4 march LEFT toward ONE deep hole. The hole is so deep it
 * needs TWO soldiers stacked to fill it. The front two (1, then 2) drop in; 3
 * and 4 march over the top and move ahead; then the hole-soldiers climb out to
 * the BACK — the TOP one (2) climbs out before the bottom one (1). The new
 * order front→back is 3, 4, 2, 1 = 3421.
 *
 * The illustrator's `SoldierRoad` primitive takes:
 *   - `onRoad`: soldier labels on the road, LEFT→RIGHT (left = front, nearest hole)
 *   - `inHole`: soldier labels inside the hole, BOTTOM→TOP
 *   - `label`:  optional caption painted over the scene (used on the result beat)
 *
 * Pure function — no Math.random, no Date. SSR-safe and deterministic.
 */

import type { Lang } from '../concepts/explainers/makeTenSteps'

export const SOLDIER_ROAD_G1_ANSWER = '3421'

export type SoldierRoadG1Phase =
  | 'start'
  | 'drop1'
  | 'drop2'
  | 'cross'
  | 'climb2'
  | 'climb1'
  | 'result'

export interface SoldierRoadG1Step {
  phase: SoldierRoadG1Phase
  /** Soldier labels standing on the road, LEFT→RIGHT (left = front, nearest hole). */
  onRoad: number[]
  /** Soldier labels inside the deep hole, BOTTOM→TOP. */
  inHole: number[]
  /** Optional banner label drawn over the scene (the answer on the result beat). */
  label?: string
  /** Show the blue marching-direction arrow (hidden once the hole is full / climbing). */
  showArrow: boolean
  caption: string
  /** Hold duration in ms before auto-advancing (0 = final beat, lingers). */
  hold: number
  /** True on the final answer beat — triggers the green result style. */
  result: boolean
}

export interface SoldierRoadG1Storyboard {
  steps: SoldierRoadG1Step[]
  finalIndex: number
  answer: string
}

export function buildSoldierRoad22G1Steps(lang: Lang): SoldierRoadG1Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SoldierRoadG1Step[] = [
    // ── Beat 0: setup — four soldiers, one DEEP hole ─────────────────────────
    {
      phase: 'start',
      onRoad: [1, 2, 3, 4],
      inHole: [],
      showArrow: true,
      hold: 2600,
      result: false,
      caption: t(
        'Soldiers 1, 2, 3, 4 march to the LEFT toward one hole. The hole is so DEEP it needs TWO soldiers stacked to fill it.',
        'Tentara 1, 2, 3, 4 berbaris ke KIRI menuju satu lubang. Lubangnya begitu DALAM sehingga butuh DUA tentara bertumpuk untuk mengisinya.',
      ),
    },

    // ── Beat 1: front soldier 1 drops in (bottom) ────────────────────────────
    {
      phase: 'drop1',
      onRoad: [2, 3, 4],
      inHole: [1],
      showArrow: true,
      hold: 2200,
      result: false,
      caption: t(
        'The front soldier, 1, steps in first and drops to the BOTTOM of the hole.',
        'Tentara terdepan, 1, masuk lebih dulu dan turun ke DASAR lubang.',
      ),
    },

    // ── Beat 2: soldier 2 drops in on top — hole is full ─────────────────────
    {
      phase: 'drop2',
      onRoad: [3, 4],
      inHole: [1, 2],
      showArrow: true,
      hold: 2400,
      result: false,
      caption: t(
        'Soldier 2 drops in next and stands on TOP of 1. Two soldiers — the hole is now FULL!',
        'Tentara 2 masuk berikutnya dan berdiri di ATAS 1. Dua tentara — lubang sekarang PENUH!',
      ),
    },

    // ── Beat 3: 3 and 4 march over the filled hole and move ahead ────────────
    {
      phase: 'cross',
      onRoad: [3, 4],
      inHole: [1, 2],
      showArrow: false,
      hold: 2200,
      result: false,
      caption: t(
        'Now the hole is level with the road, so soldiers 3 and 4 march right OVER the top and move ahead.',
        'Sekarang lubang sejajar dengan jalan, jadi tentara 3 dan 4 berbaris MELEWATI bagian atas dan terus maju.',
      ),
    },

    // ── Beat 4: TOP soldier 2 climbs out to the back ─────────────────────────
    {
      phase: 'climb2',
      onRoad: [3, 4, 2],
      inHole: [1],
      showArrow: false,
      hold: 2300,
      result: false,
      caption: t(
        'Time to climb out — the TOP soldier goes first. Soldier 2 climbs out and lines up at the BACK.',
        'Saatnya naik keluar — tentara PALING ATAS dulu. Tentara 2 naik dan berbaris di BELAKANG.',
      ),
    },

    // ── Beat 5: soldier 1 climbs out last, to the back ───────────────────────
    {
      phase: 'climb1',
      onRoad: [3, 4, 2, 1],
      inHole: [],
      showArrow: false,
      hold: 2300,
      result: false,
      caption: t(
        'Then soldier 1 climbs out last and lines up behind 2. The hole is empty again.',
        'Lalu tentara 1 naik terakhir dan berbaris di belakang 2. Lubang kosong lagi.',
      ),
    },

    // ── Beat 6: result ───────────────────────────────────────────────────────
    {
      phase: 'result',
      onRoad: [3, 4, 2, 1],
      inHole: [],
      label: SOLDIER_ROAD_G1_ANSWER,
      showArrow: false,
      hold: 0,
      result: true,
      caption: t(
        `Front → back: 3, 4, 2, 1 = ${SOLDIER_ROAD_G1_ANSWER}.`,
        `Depan → belakang: 3, 4, 2, 1 = ${SOLDIER_ROAD_G1_ANSWER}.`,
      ),
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
    answer: SOLDIER_ROAD_G1_ANSWER,
  }
}
