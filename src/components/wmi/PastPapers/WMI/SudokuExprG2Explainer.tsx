import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Sudoku23Figure, SUDOKU23_GIVENS, SUDOKU23_MARKS } from './puzzles20G2Illustrations'

// WMI-20F2A-Q23 — a 4×4 Latin-square ("sudoku") with expression givens.
// The strategy is a FORCED CHAIN ("naked single"): every step fills the ONE cell
// whose row + column already show three distinct digits, so the 4th is forced.
// We run that solver in-component so the order is deterministic and the final
// answer (✕ + ✚) FALLS OUT of the fill — nothing is hardcoded.
//
// Givens read from their printed expressions:
//   (0,0) 2×2=4, (0,1) 1×1=1, (1,1) 1+1=2, (2,2) 9−8=1, (3,3) 10−6=4.
// Verified solution (SUDOKU23_SOLUTION):
//   4 1 3 2 / 3 2 4 1 / 2 4 1 3 / 1 3 2 4
// Marks: ✕ at (2,3)=3, ✚ at (3,0)=1 → 3 + 1 = 4.

const GREEN = '#10B981'

type Grid = Array<Array<number | null>>

function rowDigits(g: Grid, r: number): Set<number> {
  const s = new Set<number>()
  for (let c = 0; c < 4; c++) if (g[r][c] != null) s.add(g[r][c] as number)
  return s
}
function colDigits(g: Grid, c: number): Set<number> {
  const s = new Set<number>()
  for (let r = 0; r < 4; r++) if (g[r][c] != null) s.add(g[r][c] as number)
  return s
}

/** A naked single: the first empty cell whose row ∪ column already holds exactly
 *  three distinct digits — so the fourth digit is forced. */
function findForced(
  g: Grid,
): { r: number; c: number; value: number; rowSeen: number[]; colSeen: number[] } | null {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (g[r][c] != null) continue
      const row = [...rowDigits(g, r)].sort((a, b) => a - b)
      const col = [...colDigits(g, c)].sort((a, b) => a - b)
      const seen = new Set<number>([...row, ...col])
      if (seen.size === 3) {
        const value = [1, 2, 3, 4].find((d) => !seen.has(d)) as number
        return { r, c, value, rowSeen: row, colSeen: col }
      }
    }
  }
  return null
}

interface Beat {
  solved: Record<string, number>
  activeKeys: string[]
  hold: number
  result: boolean
  caption: string
}

const markAt = (r: number, c: number) => SUDOKU23_MARKS.find((m) => m.r === r && m.c === c)

export default function SudokuExprG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const { steps, answer } = useMemo(() => {
    // Seed the grid from the printed expression givens.
    const grid: Grid = [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]
    for (const g of SUDOKU23_GIVENS) grid[g.r][g.c] = g.value

    const acc: Record<string, number> = {}
    for (const g of SUDOKU23_GIVENS) acc[`${g.r}-${g.c}`] = g.value

    const out: Beat[] = []

    // Beat 1 — read the five expressions to their values.
    const exprList = SUDOKU23_GIVENS.map((g) => `${g.expr}=${g.value}`).join(', ')
    out.push({
      solved: { ...acc },
      activeKeys: SUDOKU23_GIVENS.map((g) => `${g.r}-${g.c}`),
      hold: 3200,
      result: false,
      caption: t(
        `First read each little sum: ${exprList}. Now fill 1–4 so no row or column repeats.`,
        `Baca dulu tiap hitungan kecil: ${exprList}. Sekarang isi 1–4 agar tak ada baris atau kolom yang berulang.`,
      ),
    })

    // Forced chain — one deduction per beat.
    let force = findForced(grid)
    let guard = 0
    while (force && guard < 32) {
      guard++
      grid[force.r][force.c] = force.value
      const key = `${force.r}-${force.c}`
      acc[key] = force.value

      const seenList = [...new Set([...force.rowSeen, ...force.colSeen])].sort((a, b) => a - b)
      const seenStr = seenList.join(', ')
      const mk = markAt(force.r, force.c)
      const where = t(`row ${force.r + 1}, column ${force.c + 1}`, `baris ${force.r + 1}, kolom ${force.c + 1}`)

      let caption: string
      if (mk) {
        const symbol = mk.mark === '✕' ? t('cross ✕', 'silang ✕') : t('plus ✚', 'tambah ✚')
        caption = t(
          `${where} already sees ${seenStr} → only ${force.value} is left. That is the ${symbol} square: ${symbol} = ${force.value}.`,
          `${where} sudah melihat ${seenStr} → tinggal ${force.value} yang tersisa. Itu kotak ${symbol}: ${symbol} = ${force.value}.`,
        )
      } else {
        caption = t(
          `${where} already sees ${seenStr} → the only number left is ${force.value}.`,
          `${where} sudah melihat ${seenStr} → satu-satunya angka tersisa adalah ${force.value}.`,
        )
      }

      out.push({
        solved: { ...acc },
        activeKeys: [key],
        // mark cells linger a touch longer so the highlight reads.
        hold: mk ? 2600 : 2000,
        result: false,
        caption,
      })

      force = findForced(grid)
    }

    // Final beat — the answer FALLS OUT of the forced fills (never hardcoded).
    const crossCell = SUDOKU23_MARKS.find((m) => m.mark === '✕') as (typeof SUDOKU23_MARKS)[number]
    const plusCell = SUDOKU23_MARKS.find((m) => m.mark === '✚') as (typeof SUDOKU23_MARKS)[number]
    const crossVal = grid[crossCell.r][crossCell.c] as number
    const plusVal = grid[plusCell.r][plusCell.c] as number
    const sum = crossVal + plusVal

    out.push({
      solved: { ...acc },
      activeKeys: [`${crossCell.r}-${crossCell.c}`, `${plusCell.r}-${plusCell.c}`],
      hold: 0,
      result: true,
      caption: t(
        `The marked squares: ✕ = ${crossVal}, ✚ = ${plusVal} → ${crossVal} + ${plusVal} = ${sum}.`,
        `Kotak bertanda: ✕ = ${crossVal}, ✚ = ${plusVal} → ${crossVal} + ${plusVal} = ${sum}.`,
      ),
    })

    return { steps: out, answer: sum }
  }, [lang])

  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const aria = t(
    `Explainer: each empty square is forced because its row and column already show three numbers; the marked squares read ${answer}.`,
    `Penjelasan: tiap kotak kosong terpaksa terisi karena baris dan kolomnya sudah memuat tiga angka; kotak bertanda terbaca ${answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <Sudoku23Figure solved={beat.solved} activeKeys={beat.activeKeys} />
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
