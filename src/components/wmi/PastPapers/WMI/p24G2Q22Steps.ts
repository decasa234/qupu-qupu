import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { FRAME1, FRAME2, FRAME3, FRAME4, FRAME5, type Voxel } from './P24G2Q22Illustration'

// Deterministic storyboard for WMI-24P2A-Q22 (cube-growth sequence, answer E).
//
// The structure grows by one cube each frame: 4 -> 5 -> 6 -> [7] -> 8 cubes,
// ending at the full 2x2x2 block. The missing fourth frame must be the in-between
// shape with 7 cubes (one more than frame 3, one fewer than the finished block) —
// the seed answer, E.

export interface Q22Step {
  voxels: Voxel[]
  /** Light the cubes green (used when revealing the answer frame). */
  highlight: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q22Storyboard {
  answer: string
  steps: Q22Step[]
  finalIndex: number
}

export function buildP24G2Q22Steps(lang: Lang, answer: string): Q22Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const c1 = FRAME1.length // 4
  const c3 = FRAME3.length // 6
  const c4 = FRAME4.length // 7
  const c5 = FRAME5.length // 8

  const steps: Q22Step[] = [
    {
      voxels: FRAME1,
      highlight: false,
      hold: 1800,
      result: false,
      caption: t(`Frame 1 starts with ${c1} cubes.`, `Bingkai 1 mulai dengan ${c1} kubus.`),
    },
    {
      voxels: FRAME2,
      highlight: false,
      hold: 1800,
      result: false,
      caption: t('Frame 2 adds one cube — the block keeps growing.', 'Bingkai 2 menambah satu kubus — balok terus bertumbuh.'),
    },
    {
      voxels: FRAME3,
      highlight: false,
      hold: 1900,
      result: false,
      caption: t(`Frame 3 adds one more, now ${c3} cubes.`, `Bingkai 3 menambah satu lagi, sekarang ${c3} kubus.`),
    },
    {
      voxels: FRAME5,
      highlight: false,
      hold: 2000,
      result: false,
      caption: t(
        `The last frame is the full block: ${c5} cubes. So the missing step needs ${c4}.`,
        `Bingkai terakhir balok penuh: ${c5} kubus. Jadi langkah hilang butuh ${c4}.`,
      ),
    },
    {
      voxels: FRAME4,
      highlight: true,
      hold: 0,
      result: true,
      caption: t(
        `Add one cube to frame 3 to get ${c4} cubes — the in-between shape is answer E.`,
        `Tambah satu kubus ke bingkai 3 jadi ${c4} kubus — bentuk antara itu jawaban E.`,
      ),
    },
  ]

  return { answer, steps, finalIndex: steps.length - 1 }
}
