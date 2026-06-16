// Storyboard for the WMI-25P2A-Q19 painted-cubes explainer.
//
// The solid (Q19_SOLID) has its painted-face counts derived from the geometry:
//   a = #cubes showing 4 painted faces (2 neighbours) = 6
//   b = #cubes showing 3 painted faces (3 neighbours) = 2
//   c = #cubes showing 2 painted faces (4 neighbours) = 2
// => abc = 622 (answer A).  We light the cubes group by group so the learner sees
// WHY each count is what it is (painted faces = 6 - touching neighbours).

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { Q19_SOLID, Q19_A, Q19_B, Q19_C, Q19_ABC, paintedFaces, type Voxel } from './P25G2Q19Illustration'

// Distinct, gentle tints for the three painted-face groups.
export const TINT_4 = '#FDE68A' // 4 faces — warm yellow
export const TINT_3 = '#A7F3D0' // 3 faces — mint
export const TINT_2 = '#C7B5F0' // 2 faces — violet
const KEY = (v: Voxel) => `${v.x},${v.y},${v.z}`

const SET = new Set(Q19_SOLID.map(KEY))

// Build a tint map that colours every cube whose painted-face count is in `which`.
function tintsFor(which: number[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const v of Q19_SOLID) {
    const p = paintedFaces(v, SET)
    if (!which.includes(p)) continue
    out[KEY(v)] = p === 4 ? TINT_4 : p === 3 ? TINT_3 : TINT_2
  }
  return out
}

export interface Q19Step {
  tints: Record<string, string>
  caption: string
  hold: number
  result: boolean
}

export interface Q19Storyboard {
  answer: string
  steps: Q19Step[]
  finalIndex: number
}

export function buildP25G2Q19Steps(lang: Lang): Q19Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q19Step[] = [
    {
      tints: {},
      hold: 1900,
      result: false,
      caption: t(
        `10 cubes, painted all over. A cube's painted faces = 6 - the faces it hides against neighbours.`,
        `10 kubus, dicat seluruhnya. Sisi tercat tiap kubus = 6 - sisi yang menempel tetangga.`,
      ),
    },
    {
      tints: tintsFor([4]),
      hold: 2300,
      result: false,
      caption: t(
        `Cubes touching just 2 others show 4 red faces: ${Q19_A} of them, so a = ${Q19_A}.`,
        `Kubus yang menyentuh hanya 2 lainnya menunjukkan 4 sisi merah: ada ${Q19_A}, jadi a = ${Q19_A}.`,
      ),
    },
    {
      tints: tintsFor([4, 3]),
      hold: 2300,
      result: false,
      caption: t(
        `Cubes touching 3 others show 3 red faces: ${Q19_B} of them, so b = ${Q19_B}.`,
        `Kubus yang menyentuh 3 lainnya menunjukkan 3 sisi merah: ada ${Q19_B}, jadi b = ${Q19_B}.`,
      ),
    },
    {
      tints: tintsFor([4, 3, 2]),
      hold: 2300,
      result: false,
      caption: t(
        `Cubes wedged against 4 others show only 2 red faces: ${Q19_C} of them, so c = ${Q19_C}.`,
        `Kubus yang terjepit 4 lainnya hanya 2 sisi merah: ada ${Q19_C}, jadi c = ${Q19_C}.`,
      ),
    },
    {
      tints: tintsFor([4, 3, 2]),
      hold: 0,
      result: true,
      caption: t(
        `Reading a, b, c gives ${Q19_A}${Q19_B}${Q19_C} = ${Q19_ABC}. Answer A.`,
        `Membaca a, b, c memberi ${Q19_A}${Q19_B}${Q19_C} = ${Q19_ABC}. Jawaban A.`,
      ),
    },
  ]

  return { answer: Q19_ABC, steps, finalIndex: steps.length - 1 }
}
