import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { HEIGHTS } from './P22G2Q17Illustration'

export type Q17Phase = 'show' | 'fill' | 'result'

export interface Q17Step {
  phase: Q17Phase
  /** Show the 3D structure (false) or the height table (true). */
  showTable: boolean
  /** Base cell to spotlight on the structure, "row,col" or null. */
  spotlight: string | null
  /** The 3×3 table state so far (null = blank cell). */
  table: Array<Array<number | null>>
  /** Cell just filled on the table, "row,col" or null. */
  activeCell: string | null
  caption: string
  hold: number
  result: boolean
}

export interface Q17Storyboard {
  answer: string
  steps: Q17Step[]
  finalIndex: number
}

const blankTable = (): Array<Array<number | null>> => [
  [null, null, null],
  [null, null, null],
  [null, null, null],
]

function cloneFill(prev: Array<Array<number | null>>, r: number, c: number, v: number) {
  const next = prev.map((row) => row.slice())
  next[r][c] = v
  return next
}

export function buildP22G2Q17Steps(lang: Lang): Q17Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q17Step[] = [
    {
      phase: 'show',
      showTable: false,
      spotlight: null,
      table: blankTable(),
      activeCell: null,
      hold: 1800,
      result: false,
      caption: t(
        'For each base square, count the cubes stacked straight up on it.',
        'Untuk tiap kotak alas, hitung kubus yang ditumpuk lurus ke atas.',
      ),
    },
  ]

  // Walk the base in reading order, filling the table one cell at a time and
  // spotlighting the matching column on the structure.
  let table = blankTable()
  const order: Array<[number, number]> = []
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) order.push([r, c])

  for (const [r, c] of order) {
    const h = HEIGHTS[r][c]
    table = cloneFill(table, r, c, h)
    const cellName = `${r},${c}`
    const caption =
      h === 0
        ? t(`Row ${r + 1}, column ${c + 1}: empty — height 0.`, `Baris ${r + 1}, kolom ${c + 1}: kosong — tinggi 0.`)
        : t(`Row ${r + 1}, column ${c + 1}: ${h} cube${h > 1 ? 's' : ''} high.`, `Baris ${r + 1}, kolom ${c + 1}: tinggi ${h} kubus.`)
    steps.push({
      phase: 'fill',
      showTable: false,
      spotlight: cellName,
      table: table.map((row) => row.slice()),
      activeCell: cellName,
      hold: 1300,
      result: false,
      caption,
    })
  }

  const fullTable = HEIGHTS.map((row) => row.slice())
  steps.push({
    phase: 'result',
    showTable: true,
    spotlight: null,
    table: fullTable,
    activeCell: null,
    hold: 0,
    result: true,
    caption: t(
      'Heights are [2,2,1] [2,1,1] [0,1,2] — answer B.',
      'Tingginya [2,2,1] [2,1,1] [0,1,2] — jawaban B.',
    ),
  })

  return { answer: 'B', steps, finalIndex: steps.length - 1 }
}
