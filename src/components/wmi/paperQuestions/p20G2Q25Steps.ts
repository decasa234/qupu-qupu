import type { Lang } from '../concepts/explainers/makeTenSteps'
import { Q25_SHOWN_PATH } from './P20G2Q25Illustration'

// The 1→10 walk splits at the "3": one family keeps to the LEFT inner column
// (4 ways), the other runs RIGHT along the top edge then down (4 ways). A solver
// confirms 4 + 4 = 8 valid paths in total, so there are 8 − 1 = 7 OTHER ways.
export const Q25_TOTAL_PATHS = 8
export const Q25_LEFT_WAYS = 4
export const Q25_RIGHT_WAYS = 4
export const Q25_OTHER_WAYS = Q25_TOTAL_PATHS - 1 // 7 (answer B)

// Representative path of each family (cells 1..10).
export const Q25_LEFT_PATH: ReadonlyArray<readonly [number, number]> = Q25_SHOWN_PATH
export const Q25_RIGHT_PATH: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 3],
  [2, 3],
  [3, 3],
  [4, 3],
  [4, 2],
  [5, 2],
] as const

// The two cells holding a "3" — the first real fork in the walk.
export const Q25_FORK_CELLS: ReadonlyArray<readonly [number, number]> = [
  [1, 1],
  [0, 2],
] as const

export type Q25Phase = 'show' | 'fork' | 'left' | 'right' | 'result'

export interface Q25Step {
  phase: Q25Phase
  path: ReadonlyArray<readonly [number, number]>
  ringCells: ReadonlyArray<readonly [number, number]>
  caption: string
  hold: number
  result: boolean
}

export interface Q25Storyboard {
  total: number
  other: number
  steps: Q25Step[]
  finalIndex: number
}

export function buildP20G2Q25Steps(lang: Lang): Q25Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q25Step[] = [
    {
      phase: 'show',
      path: Q25_LEFT_PATH,
      ringCells: [],
      hold: 1800,
      result: false,
      caption: t(
        'Each step must move to a neighbour worth one more: 1, 2, 3, …, 10.',
        'Tiap langkah harus ke tetangga yang bernilai satu lebih: 1, 2, 3, …, 10.',
      ),
    },
    {
      phase: 'fork',
      path: [],
      ringCells: Q25_FORK_CELLS,
      hold: 2100,
      result: false,
      caption: t(
        'After 1 → 2, the walk must reach a 3. There are two 3s — that is the only real fork.',
        'Setelah 1 → 2, jalur harus mencapai angka 3. Ada dua angka 3 — itulah satu-satunya percabangan.',
      ),
    },
    {
      phase: 'left',
      path: Q25_LEFT_PATH,
      ringCells: [Q25_FORK_CELLS[0]],
      hold: 2100,
      result: false,
      caption: t(
        `Take the LEFT 3 (inner column): this family has ${Q25_LEFT_WAYS} ways.`,
        `Ambil angka 3 KIRI (kolom dalam): keluarga ini punya ${Q25_LEFT_WAYS} cara.`,
      ),
    },
    {
      phase: 'right',
      path: Q25_RIGHT_PATH,
      ringCells: [Q25_FORK_CELLS[1]],
      hold: 2100,
      result: false,
      caption: t(
        `Take the RIGHT 3 (along the top): this family also has ${Q25_RIGHT_WAYS} ways.`,
        `Ambil angka 3 KANAN (sepanjang atas): keluarga ini juga punya ${Q25_RIGHT_WAYS} cara.`,
      ),
    },
    {
      phase: 'result',
      path: Q25_RIGHT_PATH,
      ringCells: [],
      hold: 0,
      result: true,
      caption: t(
        `${Q25_LEFT_WAYS} + ${Q25_RIGHT_WAYS} = ${Q25_TOTAL_PATHS} ways in all, so ${Q25_OTHER_WAYS} OTHER ways — answer B.`,
        `${Q25_LEFT_WAYS} + ${Q25_RIGHT_WAYS} = ${Q25_TOTAL_PATHS} cara seluruhnya, jadi ${Q25_OTHER_WAYS} cara LAIN — jawaban B.`,
      ),
    },
  ]

  return { total: Q25_TOTAL_PATHS, other: Q25_OTHER_WAYS, steps, finalIndex: steps.length - 1 }
}
