import { Polyomino } from '../../PastPapers/WMI/primitives/Polyomino'
import {
  readTileFillParams,
  type TileFillCell,
  type TileFillView,
} from '../explainers/tileFillCountSteps'

// In-card figure for `tile-fill-count`: the tile on the left, the shape it has
// to cover on the right. Every square is drawn by the shared `Polyomino`
// primitive straight from the params cell list, so the picture and the answer
// are counting the same squares — there is no second copy of the geometry to
// drift.
//
// The two-layer trick: `Polyomino` normalises its viewBox to its OWN cells, so
// a second Polyomino laid over the first is nudged by the difference between
// the two cell lists' top-left corners. Same cellSize and pad on both, so the
// overlay lands exactly on the base squares it is meant to recolour.
//
// Pure render from params: no hooks, no randomness, no dates — SSR-safe.

const INK = '#30598A' // qupu-brand-blue
const INK_SOFT = '#E1EFFB'
const PEACH = '#FFD3B1'
const MUTED = '#B9C0CC'
const CREAM = '#FFF9F4'

const CELL = 30
const PAD = 5

function topLeft(cells: TileFillCell[]): { r: number; c: number } {
  if (cells.length === 0) return { r: 0, c: 0 }
  return {
    r: Math.min(...cells.map(([r]) => r)),
    c: Math.min(...cells.map(([, c]) => c)),
  }
}

/** The tile itself: one grid square, or the lower-left half of one. */
function TileSwatch({ tile }: { tile: TileFillView['tile'] }) {
  if (tile === 'unit-square') {
    return (
      <Polyomino cells={[[0, 0]]} cellSize={CELL} pad={PAD} fill={INK_SOFT} stroke={INK} strokeWidth={2.5} />
    )
  }
  const a = PAD
  const b = PAD + CELL
  return (
    <svg
      viewBox={`0 0 ${CELL + PAD * 2} ${CELL + PAD * 2}`}
      width={CELL + PAD * 2}
      height={CELL + PAD * 2}
      role="presentation"
      style={{ display: 'block' }}
    >
      {/* the grid square the tile is half of, drawn faintly for reference */}
      <rect
        x={a}
        y={a}
        width={CELL}
        height={CELL}
        fill="none"
        stroke={MUTED}
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <polygon
        points={`${a},${a} ${b},${b} ${a},${b}`}
        fill={INK_SOFT}
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** `base` squares, with `overlay` squares repainted on top of them. */
function CoveredShape({
  base,
  overlay,
  baseFill,
  baseStroke,
  overlayFill,
}: {
  base: TileFillCell[]
  overlay: TileFillCell[]
  baseFill: string
  baseStroke: string
  overlayFill: string
}) {
  const b = topLeft(base)
  const o = topLeft(overlay)

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Polyomino
        cells={base}
        cellSize={CELL}
        pad={PAD}
        fill={baseFill}
        stroke={baseStroke}
        strokeWidth={2}
      />
      {overlay.length > 0 && (
        <div
          style={{
            position: 'absolute',
            left: (o.c - b.c) * CELL,
            top: (o.r - b.r) * CELL,
          }}
        >
          <Polyomino
            cells={overlay}
            cellSize={CELL}
            pad={PAD}
            fill={overlayFill}
            stroke={INK}
            strokeWidth={2}
          />
        </div>
      )}
    </div>
  )
}

/**
 * Speaks the drawn evidence and nothing else: how many rows the shape has, how
 * wide each one is, and which squares are already coloured. Never a total, and
 * never the number of tiles — those are the question.
 */
function aria(view: TileFillView): string {
  const rows = view.targetRows
  const shapeRows = [...new Map(view.cells.map(([r]) => [r, r])).keys()].sort((x, y) => x - y)
  const widths = shapeRows.map((r) => {
    const wide = view.cells.filter(([rr]) => rr === r).length
    return `baris ${r + 1} ada ${wide} kotak`
  })
  const tile =
    view.tile === 'half-square-triangle'
      ? 'Satu keping segitiga, setengah dari satu kotak, digambar di sebelah kiri.'
      : 'Satu keping berbentuk satu kotak digambar di sebelah kiri.'

  const shape = `Bentuk di kertas kotak-kotak: ${widths.join(', ')}.`

  if (view.ask === 'how-many-more') {
    const perRow = rows.map(({ row, cells }) => `baris ${row + 1} ada ${cells.length}`)
    return `${tile} ${shape} Kotak berwarna sudah tertutup; kotak putih belum: ${perRow.join(', ')}.`
  }
  if (view.ask === 'fewest-to-complete') {
    const perRow = view.targetRows.map(({ row, cells }) => `baris ${row + 1} ada ${cells.length}`)
    return `${tile} ${shape} Bentuk itu digambar di dalam persegi ${view.boxSide} kali ${view.boxSide}, dan kotak yang masih kosong di dalam persegi itu: ${perRow.join(', ')}.`
  }
  return `${tile} ${shape}`
}

export default function TileFillCountIllustration({ params }: { params: unknown }) {
  const view = readTileFillParams(params)

  // how-many-more: white = still to do, peach = already covered.
  // fewest-to-complete: cream box = the holes to plug, blue = the shape itself.
  // total: the whole shape in one colour, nothing to distinguish.
  const baseFill = view.ask === 'how-many-more' ? '#FFFFFF' : view.ask === 'fewest-to-complete' ? CREAM : INK_SOFT
  const baseStroke = view.ask === 'fewest-to-complete' ? MUTED : INK
  const overlayFill = view.ask === 'how-many-more' ? PEACH : INK_SOFT

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={aria(view)}>
      <div className="flex items-center gap-4 sm:gap-6">
        <TileSwatch tile={view.tile} />
        <div aria-hidden="true" className="h-16 w-px shrink-0" style={{ background: MUTED }} />
        <CoveredShape
          base={view.base}
          overlay={view.overlay}
          baseFill={baseFill}
          baseStroke={baseStroke}
          overlayFill={overlayFill}
        />
      </div>
    </div>
  )
}
