import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  ELEPHANT_EDGE_COUNTS,
  LONG_ARC_RECT,
  SHORT_ARC_RECT,
} from './Elephant25G3Illustration'

// WMI-25F3A-Q25 (2025 G3 Final, Q25 — "elephant area"). The outline is built
// from 7 straight segments, 6 congruent LONG arcs (each a half-disc inside a
// 1×3 rectangle) and 4 congruent SHORT arcs (each inside a 1×2 rectangle).
//
// METHOD (from the breakdown): the area is found by counting whole unit squares
// inside the outline, then ADJUSTING for the curved edges. Every arc that bulges
// OUTWARD adds exactly as much area as a matching arc that bulges INWARD removes,
// so the curves pair up and cancel — leaving a clean whole-square count of 59.
// We walk that one beat at a time, showing the cancellations, and land on 59.

export type ElephantPhase =
  | 'goal'
  | 'unit'
  | 'pieces'
  | 'squares'
  | 'shortArcs'
  | 'longArcs'
  | 'result'

export interface ElephantStep {
  phase: ElephantPhase
  caption: string
  /** Running area shown in the meter (null = not shown yet). */
  running: number | null
  /** Highlight the SHORT-arc pairing this beat. */
  showShort: boolean
  /** Highlight the LONG-arc pairing this beat. */
  showLong: boolean
  /** Highlight the inner whole-square fill this beat. */
  showSquares: boolean
  hold: number
  result: boolean
}

export interface ElephantStoryboard {
  answer: number
  /** Whole unit squares counted inside the outline. */
  squareCount: number
  steps: ElephantStep[]
  finalIndex: number
}

export function buildElephant25G3Steps(lang: Lang): ElephantStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const ANSWER = 59
  const SQUARES = 59
  const { segments, longArcs, shortArcs } = ELEPHANT_EDGE_COUNTS

  const steps: ElephantStep[] = [
    {
      phase: 'goal',
      caption: t(
        'Goal: find the area of the shaded elephant, in cm².',
        'Tujuan: cari luas gajah yang diarsir, dalam cm².',
      ),
      running: null,
      showShort: false,
      showLong: false,
      showSquares: false,
      hold: 2400,
      result: false,
    },
    {
      phase: 'unit',
      caption: t(
        'Every little grid square is 1 cm by 1 cm, so each one is 1 cm².',
        'Setiap petak kecil berukuran 1 cm × 1 cm, jadi tiap petak = 1 cm².',
      ),
      running: null,
      showShort: false,
      showLong: false,
      showSquares: false,
      hold: 2400,
      result: false,
    },
    {
      phase: 'pieces',
      caption: t(
        `The edge is built from ${segments} straight segments, ${longArcs} long arcs (each fills a ${LONG_ARC_RECT} box) and ${shortArcs} short arcs (each fills a ${SHORT_ARC_RECT} box).`,
        `Tepinya tersusun dari ${segments} ruas lurus, ${longArcs} busur panjang (tiap busur mengisi kotak ${LONG_ARC_RECT}) dan ${shortArcs} busur pendek (tiap busur mengisi kotak ${SHORT_ARC_RECT}).`,
      ),
      running: null,
      showShort: false,
      showLong: false,
      showSquares: false,
      hold: 2900,
      result: false,
    },
    {
      phase: 'squares',
      caption: t(
        `First count the whole grid squares sitting inside the outline: ${SQUARES} of them.`,
        `Pertama hitung petak-petak penuh di dalam bingkai: ada ${SQUARES} petak.`,
      ),
      running: SQUARES,
      showShort: false,
      showLong: false,
      showSquares: true,
      hold: 3000,
      result: false,
    },
    {
      phase: 'shortArcs',
      caption: t(
        `Now the curved edges. The ${shortArcs} short arcs split evenly: 2 bulge OUT (adding area) and 2 bulge IN (removing the same area) → they cancel, change 0.`,
        `Sekarang tepi melengkungnya. ${shortArcs} busur pendek terbagi rata: 2 menjorok KE LUAR (menambah luas) dan 2 menjorok KE DALAM (mengurangi luas yang sama) → saling meniadakan, perubahan 0.`,
      ),
      running: SQUARES,
      showShort: true,
      showLong: false,
      showSquares: true,
      hold: 3200,
      result: false,
    },
    {
      phase: 'longArcs',
      caption: t(
        `The ${longArcs} long arcs do the same: each OUT bulge that adds a half-disc is matched by an IN bulge that scoops the same half-disc away → they cancel too, change 0.`,
        `${longArcs} busur panjang juga begitu: tiap tonjolan KE LUAR yang menambah setengah-cakram dipasangkan dengan tonjolan KE DALAM yang menggerus setengah-cakram sama → saling meniadakan juga, perubahan 0.`,
      ),
      running: SQUARES,
      showShort: true,
      showLong: true,
      showSquares: true,
      hold: 3200,
      result: false,
    },
    {
      phase: 'result',
      caption: t(
        `All the curves cancel, so the area is just the ${SQUARES} whole squares: ${ANSWER} cm².`,
        `Semua lengkungan saling meniadakan, jadi luasnya tinggal ${SQUARES} petak penuh: ${ANSWER} cm².`,
      ),
      running: ANSWER,
      showShort: true,
      showLong: true,
      showSquares: true,
      hold: 0,
      result: true,
    },
  ]

  return {
    answer: ANSWER,
    squareCount: SQUARES,
    steps,
    finalIndex: steps.length - 1,
  }
}
