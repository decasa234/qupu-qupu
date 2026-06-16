// Storyboard for WMI-25F1A-Q25 (2025 Grade 1 Final) — the all-different walk
// down a 7-row number pyramid.
//
// Pure builder: (lang) => beats. Each beat extends the lit path by one cell and
// grows the "used numbers" set, so the animation *shows* the rule (only step to a
// neighbour whose number is new) one move at a time. The walk is the unique
// all-different route 5 -> 1 -> 4 -> 3 -> 2 -> 7 -> 6, landing on 6.
//
// SSR-safe / deterministic: no Math.random, no Date — a fixed walk over fixed data.

import { ALL_DIFFERENT_PATH, BOTTOM_ANSWER, PYRAMID } from './NumberPyramid25G1Illustration'

export type Lang = 'en' | 'id'

export interface PyramidStep {
  caption: string
  /** Cells lit so far this beat, as [row, col] (a prefix of ALL_DIFFERENT_PATH). */
  litPath: number[][]
  /** The distinct numbers used so far (the value in each lit cell). */
  used: number[]
  /** The number just landed on this beat (for the running badge); null on intro. */
  current: number | null
  /** 'left' = lower-left neighbour (same col), 'right' = lower-right (col + 1). */
  dir: 'left' | 'right' | null
  /** True only on the final winning beat. */
  result: boolean
  /** How long to hold this beat on screen, in ms (the winner ends with 0). */
  hold: number
}

export interface PyramidStoryboard {
  answer: number
  steps: PyramidStep[]
  finalIndex: number
}

/** Value sitting in cell [row, col] of the pyramid. */
function valueAt(cell: number[]): number {
  return PYRAMID[cell[0]][cell[1]]
}

export function buildNumberPyramid25G1Steps(lang: Lang): PyramidStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const path = ALL_DIFFERENT_PATH
  const values = path.map(valueAt) // [5, 1, 4, 3, 2, 7, 6]

  const steps: PyramidStep[] = []

  // Beat 0 — state the goal, sitting on the top square.
  steps.push({
    caption: t(
      `Start at the top: ${values[0]}. Walk down — every square must be a NEW number.`,
      `Mulai dari puncak: ${values[0]}. Turun ke bawah — tiap kotak harus angka BARU.`,
    ),
    litPath: [path[0]],
    used: [values[0]],
    current: values[0],
    dir: null,
    result: false,
    hold: 2300,
  })

  // One beat per step DOWN. Each beat shows the chosen direction and the fresh
  // number, and confirms it is not already in the used set.
  for (let i = 1; i < path.length; i++) {
    const prevCol = path[i - 1][1]
    const dir: 'left' | 'right' = path[i][1] === prevCol ? 'left' : 'right'
    const v = values[i]
    const dirWord = t(
      dir === 'left' ? 'lower-left' : 'lower-right',
      dir === 'left' ? 'kiri-bawah' : 'kanan-bawah',
    )
    const usedSoFar = values.slice(0, i) // numbers before this step
    const isLast = i === path.length - 1

    const caption = isLast
      ? t(
          `Step ${dirWord} to ${v}. All 7 are different — the path ends on ${v}!`,
          `Langkah ${dirWord} ke ${v}. Ke-7 angka berbeda semua — jalur berakhir di ${v}!`,
        )
      : t(
          `Step ${dirWord} to ${v}. Not in {${usedSoFar.join(', ')}} — keep going.`,
          `Langkah ${dirWord} ke ${v}. Belum ada di {${usedSoFar.join(', ')}} — lanjut.`,
        )

    steps.push({
      caption,
      litPath: path.slice(0, i + 1),
      used: values.slice(0, i + 1),
      current: v,
      dir,
      result: isLast,
      // The winning landing beat is the last beat with hold 0; the mid-walk beats
      // linger so each "is this number new?" check reads.
      hold: isLast ? 0 : 2100,
    })
  }

  return {
    answer: BOTTOM_ANSWER,
    steps,
    finalIndex: steps.length - 1,
  }
}
