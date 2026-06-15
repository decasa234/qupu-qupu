import type { Lang } from '../concepts/explainers/makeTenSteps'
import { A_FOUR, B_THREE, C_TWO, ABC, paintedFaces, Q19_CUBES, type Cube } from './P25G3Q19Illustration'

export type CubePhase = 'show' | 'four' | 'three' | 'two' | 'result'

export interface CubeStep {
  phase: CubePhase
  /** Highlight colour per cube key "x,y,z". */
  highlights: Record<string, string>
  /** Face-count badge per cube key "x,y,z". */
  badges: Record<string, number>
  caption: string
  hold: number
  result: boolean
}

export interface CubeStoryboard {
  a: number
  b: number
  c: number
  abc: string
  steps: CubeStep[]
  finalIndex: number
}

const keyOf = (c: Cube) => `${c[0]},${c[1]},${c[2]}`

// Colours for the three groups (4 / 3 / 2 painted faces).
const COL_FOUR = '#FCA5A5' // red-ish — the 4-face cubes (a)
const COL_THREE = '#FCD34D' // amber — the 3-face cubes (b)
const COL_TWO = '#86EFAC' // green — the 2-face cubes (c)

export function buildP25G3Q19Steps(lang: Lang): CubeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const faces = paintedFaces(Q19_CUBES)
  const cubesWith = (n: number): Cube[] => Q19_CUBES.filter((c) => faces.get(keyOf(c)) === n)

  const four = cubesWith(4)
  const three = cubesWith(3)
  const two = cubesWith(2)

  // Cumulative highlight + badge maps for each phase.
  const mark = (groups: Array<{ cubes: Cube[]; colour: string; faceCount: number }>) => {
    const highlights: Record<string, string> = {}
    const badges: Record<string, number> = {}
    for (const g of groups) {
      for (const cube of g.cubes) {
        highlights[keyOf(cube)] = g.colour
        badges[keyOf(cube)] = g.faceCount
      }
    }
    return { highlights, badges }
  }

  const fourGroup = { cubes: four, colour: COL_FOUR, faceCount: 4 }
  const threeGroup = { cubes: three, colour: COL_THREE, faceCount: 3 }
  const twoGroup = { cubes: two, colour: COL_TWO, faceCount: 2 }

  const steps: CubeStep[] = [
    {
      phase: 'show',
      highlights: {},
      badges: {},
      hold: 1800,
      result: false,
      caption: t(
        'Whole surface is painted. Each cube hides a face wherever it touches a neighbour.',
        'Seluruh permukaan dicat. Tiap kubus menyembunyikan satu sisi di tempat ia menempel kubus lain.',
      ),
    },
    {
      phase: 'four',
      ...mark([fourGroup]),
      hold: 2200,
      result: false,
      caption: t(
        `Cubes touching only 2 neighbours show 4 red faces. Count them: a = ${A_FOUR}.`,
        `Kubus yang menempel hanya 2 kubus lain menampakkan 4 sisi merah. Hitung: a = ${A_FOUR}.`,
      ),
    },
    {
      phase: 'three',
      ...mark([fourGroup, threeGroup]),
      hold: 2200,
      result: false,
      caption: t(
        `Cubes with 3 neighbours show 3 red faces (the two junction cubes): b = ${B_THREE}.`,
        `Kubus dengan 3 tetangga menampakkan 3 sisi merah (dua kubus sambungan): b = ${B_THREE}.`,
      ),
    },
    {
      phase: 'two',
      ...mark([fourGroup, threeGroup, twoGroup]),
      hold: 2200,
      result: false,
      caption: t(
        `Cubes with 4 neighbours show only 2 red faces: c = ${C_TWO}.`,
        `Kubus dengan 4 tetangga hanya menampakkan 2 sisi merah: c = ${C_TWO}.`,
      ),
    },
    {
      phase: 'result',
      ...mark([fourGroup, threeGroup, twoGroup]),
      hold: 0,
      result: true,
      caption: t(
        `a b c = ${A_FOUR} ${B_THREE} ${C_TWO} → ${ABC}. Answer A.`,
        `a b c = ${A_FOUR} ${B_THREE} ${C_TWO} → ${ABC}. Jawaban A.`,
      ),
    },
  ]

  return {
    a: A_FOUR,
    b: B_THREE,
    c: C_TWO,
    abc: ABC,
    steps,
    finalIndex: steps.length - 1,
  }
}
