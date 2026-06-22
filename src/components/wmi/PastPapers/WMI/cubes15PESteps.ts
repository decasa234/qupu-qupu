import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { TOTAL_CUBES15, SHARED_FACES15, GLUE_JOINTS15 } from './Cubes15PEIllustration'

export type Cubes15PEPhase = 'show' | 'count-horizontal' | 'count-vertical' | 'result'

export interface Cubes15PEStep {
  phase: Cubes15PEPhase
  /** Indices into GLUE_JOINTS15 to highlight (green) in the figure. */
  highlightJoints: number[]
  /** Dim non-highlighted cubes when highlighting. */
  dimOthers: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Cubes15PEStoryboard {
  steps: Cubes15PEStep[]
  finalIndex: number
}

// Horizontal joints: indices 0-7 (the 8 z=0 chain connections)
const HORIZ_JOINTS = Array.from({ length: 8 }, (_, i) => i)
// Vertical joints: indices 8-10 (the 3 z=0→z=1 connections)
const VERT_JOINTS = [8, 9, 10]
// All joints
const ALL_JOINTS = Array.from({ length: GLUE_JOINTS15.length }, (_, i) => i)

/**
 * Beat storyboard for IKMC-23-PE-Q15.
 *
 * Strategy: Count shared faces row-by-row (horizontal) then vertical (stacked).
 *
 *   Beat 1 (show)              — plain 12-cube figure, state the problem.
 *   Beat 2 (count-horizontal)  — highlight the 8 horizontal glue joints (z=0 chain).
 *   Beat 3 (count-vertical)    — highlight the 3 vertical glue joints (pillars).
 *   Beat 4 (result)            — show all 11 joints + confirm answer D.
 *
 * All numbers come from exported constants in Cubes15PEIllustration so there is no drift.
 */
export function buildCubes15PESteps(lang: Lang): Cubes15PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Cubes15PEStep[] = [
    {
      phase: 'show',
      highlightJoints: [],
      dimOthers: false,
      hold: 1800,
      result: false,
      caption: t(
        `There are ${TOTAL_CUBES15} cubes. Two touching cubes need 1 drop of glue where they share a face.`,
        `Ada ${TOTAL_CUBES15} kubus. Dua kubus yang bersentuhan membutuhkan 1 tetes lem di permukaan yang berbagi.`,
      ),
    },
    {
      phase: 'count-horizontal',
      highlightJoints: HORIZ_JOINTS,
      dimOthers: false,
      hold: 2400,
      result: false,
      caption: t(
        `Count the side-by-side joints at the bottom layer: there are 8 touching pairs along the U-shaped path.`,
        `Hitung sambungan berdampingan di lapisan bawah: ada 8 pasang kubus yang bersentuhan di sepanjang jalur berbentuk U.`,
      ),
    },
    {
      phase: 'count-vertical',
      highlightJoints: VERT_JOINTS,
      dimOthers: false,
      hold: 2400,
      result: false,
      caption: t(
        `Now count the vertical joints — each top-layer cube sits on a bottom cube: that adds 3 more glue drops.`,
        `Sekarang hitung sambungan vertikal — setiap kubus lapisan atas duduk di atas kubus bawah: itu menambah 3 tetes lem lagi.`,
      ),
    },
    {
      phase: 'result',
      highlightJoints: ALL_JOINTS,
      dimOthers: false,
      hold: 0,
      result: true,
      caption: t(
        `Total glue drops = 8 horizontal + 3 vertical = ${SHARED_FACES15} drops — answer D.`,
        `Total tetes lem = 8 horizontal + 3 vertikal = ${SHARED_FACES15} tetes — jawaban D.`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
