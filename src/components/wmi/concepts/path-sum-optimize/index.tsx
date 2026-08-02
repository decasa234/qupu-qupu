import { GridBoard } from '../../PastPapers/WMI/primitives/GridBoard'

// In-card figure for `path-sum-optimize`. The stem states the rule; this picture
// carries the evidence — the number printed in every square, which corner the
// robot starts on, which corner it must finish on, and which steps the rule
// allows.
//
// It must NEVER draw a route, not even a hint of one: choosing the route IS the
// question. The aria-label speaks the grid contents and the two corners, and
// never a total.
//
// Pure SVG, no hooks, no randomness: safe to render on the server and identical
// for the same params every time. Geometry is entirely GridBoard's; this file
// only decides what goes in each square and pins the two corner markers.

const PAD = 20
const LEGEND_H = 34

const GREEN = '#58A700'
const AMBER = '#E0A000'
const BLUE = '#30598A'

type MoveSet = 'right-or-down' | 'left-right-down'

interface Params {
  rows: number
  cols: number
  grid: number[][]
  moves: MoveSet
}

const FALLBACK: Params = {
  rows: 4,
  cols: 4,
  grid: [
    [6, 8, 3, 9],
    [7, 4, 3, 7],
    [9, 9, 7, 9],
    [8, 9, 2, 1],
  ],
  moves: 'right-or-down',
}

const int = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : fallback

/**
 * Params arrive as `unknown` from the DB, so every field is re-derived and
 * clamped. Anything that does not add up falls back whole rather than in
 * pieces — a half-read grid would draw a puzzle nobody set.
 */
function read(raw: unknown): Params {
  const p = (raw ?? {}) as Partial<Params>
  const rows = Math.max(2, Math.min(6, int(p.rows, 0)))
  const cols = Math.max(2, Math.min(6, int(p.cols, 0)))
  if (!Array.isArray(p.grid) || p.grid.length !== rows) return FALLBACK
  const grid = p.grid.map((row) =>
    Array.isArray(row) ? row.map((v) => Math.max(0, Math.min(99, int(v, 0)))) : [],
  )
  if (grid.some((row) => row.length !== cols)) return FALLBACK
  const moves: MoveSet = p.moves === 'left-right-down' ? 'left-right-down' : 'right-or-down'
  return { rows, cols, grid, moves }
}

/** One allowed step, drawn as a short arrow. `dx`/`dy` point the way it goes. */
function Arrow({ x, y, dx, dy }: { x: number; y: number; dx: number; dy: number }) {
  const len = 11
  const x2 = x + dx * len
  const y2 = y + dy * len
  const head = 5
  // Perpendicular offsets give the two back corners of the head.
  const px = -dy
  const py = dx
  const points = [
    `${x2 + dx * head},${y2 + dy * head}`,
    `${x2 + px * head * 0.8},${y2 + py * head * 0.8}`,
    `${x2 - px * head * 0.8},${y2 - py * head * 0.8}`,
  ].join(' ')
  return (
    <g>
      <line
        x1={x - dx * len}
        y1={y - dy * len}
        x2={x2}
        y2={y2}
        stroke={AMBER}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <polygon points={points} fill={AMBER} />
    </g>
  )
}

export default function PathSumOptimizeIllustration({ params }: { params: unknown }) {
  const p = read(params)
  const cellSize = p.cols >= 5 ? 46 : 52
  const finish = { r: p.rows - 1, c: p.cols - 1 }

  const boardW = p.cols * cellSize
  const boardH = p.rows * cellSize
  const width = boardW + PAD * 2
  const height = boardH + PAD * 2 + LEGEND_H

  const arrows: { dx: number; dy: number }[] =
    p.moves === 'left-right-down'
      ? [
          { dx: -1, dy: 0 },
          { dx: 1, dy: 0 },
          { dx: 0, dy: 1 },
        ]
      : [
          { dx: 1, dy: 0 },
          { dx: 0, dy: 1 },
        ]
  const legendY = PAD + boardH + LEGEND_H / 2 + 2
  const legendGap = 46
  const legendX0 = PAD + boardW / 2 - ((arrows.length - 1) * legendGap) / 2

  // The label speaks only what is printed on the page: the numbers, the two
  // corners and the movement rule. Never a route and never a total.
  const rowSpeech = p.grid
    .map((row, r) => `baris ke-${r + 1} berisi ${row.join(', ')}`)
    .join('; ')
  const moveSpeech =
    p.moves === 'left-right-down'
      ? 'Langkah yang boleh: ke kiri, ke kanan, atau ke bawah.'
      : 'Langkah yang boleh: ke kanan atau ke bawah.'
  const ariaLabel =
    `Kisi ${p.rows} kali ${p.cols}: ${rowSpeech}. ` +
    `Robot mulai di kotak kiri atas yang berisi ${p.grid[0][0]} dan harus berhenti di kotak kanan bawah yang berisi ${p.grid[finish.r][finish.c]}. ` +
    moveSpeech

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ariaLabel}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ maxWidth: width * 1.4 }}>
        <g transform={`translate(${PAD},${PAD})`}>
          <GridBoard
            rows={p.rows}
            cols={p.cols}
            cellSize={cellSize}
            label={(r, c) => String(p.grid[r][c])}
            highlight={(r, c) =>
              r === 0 && c === 0 ? 'green' : r === finish.r && c === finish.c ? 'amber' : 'none'
            }
          />
          {/* Start: a solid dot tucked into the corner of the first square. */}
          <circle cx={10} cy={10} r={5} fill={GREEN} />
          {/* Finish: a small flag tucked into the corner of the last square. */}
          <g
            transform={`translate(${finish.c * cellSize + cellSize - 16},${finish.r * cellSize + cellSize - 18})`}
          >
            <line x1={0} y1={0} x2={0} y2={13} stroke={BLUE} strokeWidth={2} strokeLinecap="round" />
            <polygon points="0,0 11,4 0,8" fill={AMBER} />
          </g>
        </g>
        {arrows.map((a, i) => (
          <Arrow key={`${a.dx},${a.dy}`} x={legendX0 + i * legendGap} y={legendY} dx={a.dx} dy={a.dy} />
        ))}
      </svg>
    </div>
  )
}
