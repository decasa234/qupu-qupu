import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { Q25_ANSWER, Q25_ANSWER_CELLS, Q25_SOLUTION, Q25_SUM } from './P21G3Q25Illustration'

export type Q25Phase = 'show' | 'deduce' | 'answers' | 'result'

export interface Q25Step {
  phase: Q25Phase
  /** "row-col" -> digit revealed so far. */
  solved: Record<string, number>
  activeKeys: string[]
  litKeys: string[]
  markAnswers: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q25Storyboard {
  sum: number
  answer: string
  steps: Q25Step[]
  finalIndex: number
}

const S = Q25_SOLUTION
const v = (r: number, c: number) => S[r][c]

/** Accumulate a solved map up to and including the given cell list. */
function fill(cells: Array<[number, number]>): Record<string, number> {
  const out: Record<string, number> = {}
  for (const [r, c] of cells) out[`${r}-${c}`] = v(r, c)
  return out
}

export function buildP21G3Q25Steps(lang: Lang): Q25Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Progressive, valid fill order tied to the cage logic.
  const afterGiven: Array<[number, number]> = [[1, 0]]
  const after3x: Array<[number, number]> = [...afterGiven, [1, 1], [2, 1]]
  const after24x: Array<[number, number]> = [...after3x, [2, 0], [3, 0], [3, 1]]
  const after8xTop: Array<[number, number]> = [...after24x, [0, 0], [0, 1], [0, 2]]
  const after36x: Array<[number, number]> = [...after8xTop, [0, 3], [1, 2], [1, 3]]
  const allCells: Array<[number, number]> = (() => {
    const out: Array<[number, number]> = []
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) out.push([r, c])
    return out
  })()

  const A = Q25_ANSWER_CELLS[0] // (0,1)=4
  const B = Q25_ANSWER_CELLS[1] // (2,0)=4
  const C = Q25_ANSWER_CELLS[2] // (3,3)=1

  const steps: Q25Step[] = [
    {
      phase: 'show',
      solved: {},
      activeKeys: [],
      litKeys: ['1-0'],
      markAnswers: false,
      hold: 1700,
      result: false,
      caption: t(
        'Start from the only given: the single-cell cage is 2.',
        'Mulai dari satu-satunya angka diketahui: kotak tunggal bernilai 2.',
      ),
    },
    {
      phase: 'deduce',
      solved: fill(after3x),
      activeKeys: ['1-1', '2-1'],
      litKeys: ['1-1', '2-1'],
      markAnswers: false,
      hold: 2100,
      result: false,
      caption: t(
        'The 3× cage holds two cells whose product is 3, so they are 1 and 3.',
        'Bingkai 3× berisi dua sel dengan hasil kali 3, jadi isinya 1 dan 3.',
      ),
    },
    {
      phase: 'deduce',
      solved: fill(after24x),
      activeKeys: ['2-0', '3-0', '3-1'],
      litKeys: ['2-0', '3-0', '3-1'],
      markAnswers: false,
      hold: 2200,
      result: false,
      caption: t(
        'The 24× cage is 4 × 3 × 2 = 24; with column 1 needing 4, this fixes 4, 3, 2.',
        'Bingkai 24× = 4 × 3 × 2 = 24; dengan kolom 1 butuh 4, ini menetapkan 4, 3, 2.',
      ),
    },
    {
      phase: 'deduce',
      solved: fill(after8xTop),
      activeKeys: ['0-0', '0-1', '0-2'],
      litKeys: ['0-0', '0-1', '0-2'],
      markAnswers: false,
      hold: 2200,
      result: false,
      caption: t(
        'Top 8× cage is 1 × 4 × 2 = 8; Latin rules order them as 1, 4, 2.',
        'Bingkai 8× atas = 1 × 4 × 2 = 8; aturan Latin menyusunnya 1, 4, 2.',
      ),
    },
    {
      phase: 'deduce',
      solved: fill(after36x),
      activeKeys: ['0-3', '1-2', '1-3'],
      litKeys: ['0-3', '1-2', '1-3'],
      markAnswers: false,
      hold: 2100,
      result: false,
      caption: t(
        'The 36× cage is 3 × 3 × 4 = 36, and the rest of the grid follows.',
        'Bingkai 36× = 3 × 3 × 4 = 36, dan sisa kotak mengikuti.',
      ),
    },
    {
      phase: 'deduce',
      solved: fill(allCells),
      activeKeys: [],
      litKeys: [],
      markAnswers: false,
      hold: 2000,
      result: false,
      caption: t(
        'Every row and column now has 1, 2, 3, 4 once — the grid is complete.',
        'Setiap baris dan kolom kini memuat 1, 2, 3, 4 sekali — kotak lengkap.',
      ),
    },
    {
      phase: 'answers',
      solved: fill(allCells),
      activeKeys: [],
      litKeys: [],
      markAnswers: true,
      hold: 2100,
      result: false,
      caption: t(
        `Read the marked cells: A = ${A.value}, B = ${B.value}, C = ${C.value}.`,
        `Baca sel bertanda: A = ${A.value}, B = ${B.value}, C = ${C.value}.`,
      ),
    },
    {
      phase: 'result',
      solved: fill(allCells),
      activeKeys: [],
      litKeys: [],
      markAnswers: true,
      hold: 0,
      result: true,
      caption: t(
        `A + B + C = ${A.value} + ${B.value} + ${C.value} = ${Q25_SUM} — answer ${Q25_ANSWER}.`,
        `A + B + C = ${A.value} + ${B.value} + ${C.value} = ${Q25_SUM} — jawaban ${Q25_ANSWER}.`,
      ),
    },
  ]

  return { sum: Q25_SUM, answer: Q25_ANSWER, steps, finalIndex: steps.length - 1 }
}
