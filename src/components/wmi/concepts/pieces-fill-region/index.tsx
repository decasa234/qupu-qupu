import { Fragment } from 'react'
import { Polyomino } from '../../PastPapers/WMI/primitives/Polyomino'

// In-card figure for `pieces-fill-region`.
//
// This is a PICTURE-OPTION question: the A–D choices are shapes, not words. The
// per-code `CHOICE_RENDERERS` registry only fires for past-paper questions (it
// is keyed by `question.code`, which generated concept instances do not have),
// so the option shapes are drawn HERE, by the concept's own illustration —
// exactly the arrangement `same-figure-identify` already uses. The choice
// buttons carry the matching letter plus its square count as text.
//
// The board and every piece are drawn by the shared `Polyomino` primitive; the
// only geometry this file owns is where to park the hole on top of the board.
// Because Polyomino always anchors its viewBox at its own bounding box with the
// same `pad` on every side, laying the hole at ((holeRow − boardRow) × cell,
// (holeCol − boardCol) × cell) lines the two up square-for-square.
//
// Nothing here marks the winner: all four options are drawn identically and the
// aria-label only says what is on the page.

type Cell = [number, number]

interface Params {
  ask: 'single-piece' | 'pair-of-pieces'
  region: Cell[]
  hole: Cell[]
  options: Cell[][][]
}

const INK = '#30598A'
const TILE = '#FFD3B1'
const GAP = '#FFF9F4'
const GAP_INK = '#B9C0CC'
const PIECE = '#E1EFFB'
const LABEL_BG = '#FFF3D4'
const LABEL_INK = '#B07B00'

const BOARD_CELL = 30
const PAD = 4
const LABELS = ['A', 'B', 'C', 'D']

const FALLBACK: Params = {
  ask: 'single-piece',
  region: [
    [0, 0], [0, 1], [0, 2],
    [1, 0], [1, 1], [1, 2],
    [2, 0], [2, 1], [2, 2],
  ],
  hole: [[0, 0], [1, 0], [2, 0], [2, 1]],
  options: [
    [[[0, 0], [0, 1], [1, 1]]],
    [[[0, 0], [0, 1], [0, 2], [0, 3]]],
    [[[0, 0], [0, 1], [1, 0], [2, 0]]],
    [[[0, 0], [0, 1], [1, 1], [2, 1]]],
  ],
}

function readCells(raw: unknown): Cell[] {
  if (!Array.isArray(raw)) return []
  const out: Cell[] = []
  for (const item of raw) {
    if (!Array.isArray(item) || item.length < 2) continue
    const [r, c] = item
    if (typeof r !== 'number' || typeof c !== 'number' || !Number.isFinite(r) || !Number.isFinite(c)) continue
    out.push([Math.round(r), Math.round(c)])
  }
  return out
}

function read(raw: unknown): Params {
  const p = (raw ?? {}) as Partial<Params>
  const region = readCells(p.region)
  const hole = readCells(p.hole)
  const options = Array.isArray(p.options)
    ? p.options
        .map((option) => (Array.isArray(option) ? option.map(readCells).filter((piece) => piece.length > 0) : []))
        .filter((option) => option.length > 0)
    : []
  if (region.length === 0 || hole.length === 0 || options.length === 0) return FALLBACK
  return {
    ask: p.ask === 'pair-of-pieces' ? 'pair-of-pieces' : 'single-piece',
    region,
    hole,
    options,
  }
}

const minOf = (cells: Cell[], axis: 0 | 1): number => Math.min(...cells.map((c) => c[axis]))
const spanOf = (cells: Cell[], axis: 0 | 1): number =>
  Math.max(...cells.map((c) => c[axis])) - minOf(cells, axis) + 1

/** The tiled board with the empty hole cut into it, in one shared grid. */
function Board({ region, hole }: { region: Cell[]; hole: Cell[] }) {
  const width = spanOf(region, 1) * BOARD_CELL + PAD * 2
  const height = spanOf(region, 0) * BOARD_CELL + PAD * 2
  const top = (minOf(hole, 0) - minOf(region, 0)) * BOARD_CELL
  const left = (minOf(hole, 1) - minOf(region, 1)) * BOARD_CELL

  return (
    <div className="relative" style={{ width, height }}>
      <Polyomino cells={region} cellSize={BOARD_CELL} pad={PAD} fill={TILE} stroke={INK} strokeWidth={2.5} />
      {/* The hole sits on top of the tiles it replaces; its own inner grid lines
          stay on so a child can count the squares the stem asks about. */}
      <div className="absolute" style={{ top, left }}>
        <Polyomino cells={hole} cellSize={BOARD_CELL} pad={PAD} fill={GAP} stroke={GAP_INK} strokeWidth={2} />
      </div>
    </div>
  )
}

/** Biggest square size that keeps the widest option inside one grid column. */
function fitPieceCell(options: Cell[][][], widthBudget: number, heightBudget: number, max: number): number {
  const cols = Math.max(1, ...options.map((o) => o.reduce((sum, piece) => sum + spanOf(piece, 1), 0)))
  const rows = Math.max(1, ...options.flatMap((o) => o.map((piece) => spanOf(piece, 0))))
  return Math.max(6, Math.min(max, Math.floor(widthBudget / cols), Math.floor(heightBudget / rows)))
}

export default function PiecesFillRegionIllustration({ params }: { params: unknown }) {
  const p = read(params)
  const pieceCell = fitPieceCell(p.options, 128, 84, 20)
  const counts = p.options.map((option) => option.reduce((sum, piece) => sum + piece.length, 0))

  const label =
    `Papan berisi ${p.region.length} kotak dengan satu lubang kosong berisi ${p.hole.length} kotak, ` +
    `lalu empat pilihan: ` +
    p.options
      .map((option, i) => `${LABELS[i]} ${option.map((piece) => piece.length).join(' + ')} kotak`)
      .join(', ') +
    '.'

  return (
    <div className="my-4 flex flex-col items-center justify-center gap-3" role="img" aria-label={label}>
      <Board region={p.region} hole={p.hole} />

      <div className="grid w-full max-w-[22rem] grid-cols-2 gap-x-3 gap-y-2">
        {p.options.map((option, i) => (
          <div key={LABELS[i] ?? i} className="flex flex-col items-center justify-end gap-1">
            <div className="flex min-h-[3.75rem] items-end justify-center gap-1">
              {option.map((piece, j) => (
                <Fragment key={j}>
                  {j > 0 && (
                    <span className="pb-1 font-display text-sm font-black" style={{ color: GAP_INK }}>
                      +
                    </span>
                  )}
                  <Polyomino
                    cells={piece}
                    cellSize={pieceCell}
                    pad={2}
                    fill={PIECE}
                    stroke={INK}
                    strokeWidth={1.75}
                  />
                </Fragment>
              ))}
            </div>
            <span
              className="rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
              style={{ background: LABEL_BG, borderColor: LABEL_INK, color: LABEL_INK }}
            >
              {LABELS[i] ?? '?'} · {counts[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
