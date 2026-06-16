// Arrow-path-on-number-grid figure for WMI-19P2A-Q3 (2019 Semifinal Grade 2).
//
// Source figure (db/seed/wmi/figures/2019-semifinal-g2-a-q3.jpg):
//   a "63" box, then the arrow strip   → → ↓ ↓ → ↓ ↓ ← ← ↑   then a "?" box.
//
// The numbers 61..120 fill a 10-wide grid (row 1: 61-70, row 2: 71-80, …).
//   ↑ = -10 (up a row)   ↓ = +10 (down a row)
//   ← = -1  (left)       → = +1  (right)
// Start at 63, follow the arrows, land on the answer (94, choice C).
//
// The static QUESTION figure shows ONLY the given strip (start box + arrows +
// "?" box). It NEVER draws the grid path or the landing number — that is the
// explainer's job, post-answer, via the co-exported NumberGrid primitive.
//
// Pure render, SSR-safe, deterministic — no random / dates / window / state.

import type { ReactNode } from 'react'

const INK = '#1F2937'
const BLUE = '#2C9CDB'
const BLUE_DK = '#1F7FB8'
const GREEN = '#10B981'
const FAINT = '#CBD7DF'

// ---------------------------------------------------------------------------
// The move sequence, read left-to-right exactly as drawn on the paper.
// 'R' = →  'D' = ↓  'L' = ←  'U' = ↑
export type Move = 'R' | 'D' | 'L' | 'U'
export const Q3_MOVES: Move[] = ['R', 'R', 'D', 'D', 'R', 'D', 'D', 'L', 'L', 'U']

// Grid facts.
export const GRID_FIRST = 61 // top-left value
export const GRID_COLS = 10
export const START_VALUE = 63

// Step a value by one move on the 61.. grid (10 per row).
function stepValue(v: number, m: Move): number {
  if (m === 'R') return v + 1
  if (m === 'L') return v - 1
  if (m === 'D') return v + GRID_COLS
  return v - GRID_COLS // 'U'
}

/** Full visited-value path, including the start. Last element is the answer. */
export const Q3_PATH: number[] = Q3_MOVES.reduce<number[]>(
  (acc, m) => [...acc, stepValue(acc[acc.length - 1], m)],
  [START_VALUE],
)
export const Q3_ANSWER = Q3_PATH[Q3_PATH.length - 1] // 94

// ===========================================================================
// Reusable primitive 1: a single arrow glyph centred at (cx, cy).
function ArrowGlyph({ cx, cy, dir, size = 13 }: { cx: number; cy: number; dir: Move; size?: number }) {
  // unit vector for the direction
  const u = dir === 'R' ? [1, 0] : dir === 'L' ? [-1, 0] : dir === 'D' ? [0, 1] : [0, -1]
  const tipX = cx + u[0] * size
  const tipY = cy + u[1] * size
  const tailX = cx - u[0] * size
  const tailY = cy - u[1] * size
  // perpendicular for the head wings
  const px = -u[1]
  const py = u[0]
  const h = 6 // head length back from tip
  const w = 5 // head half-width
  const baseX = tipX - u[0] * h
  const baseY = tipY - u[1] * h
  return (
    <g>
      <line x1={tailX} y1={tailY} x2={baseX} y2={baseY} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <polygon
        points={`${tipX},${tipY} ${baseX + px * w},${baseY + py * w} ${baseX - px * w},${baseY - py * w}`}
        fill={INK}
      />
    </g>
  )
}

// Reusable primitive 2: the arrow strip (start box → arrows → target box).
export const STRIP_VIEW_W = 392
export const STRIP_VIEW_H = 64

export function ArrowStrip({ revealTarget = false }: { revealTarget?: boolean }) {
  const midY = STRIP_VIEW_H / 2
  const boxW = 52
  const boxH = 38
  // start box on the left
  const startX = 8
  // arrows in the middle
  const arrowStartX = startX + boxW + 18
  const arrowGap = 24
  const arrowsW = (Q3_MOVES.length - 1) * arrowGap
  // target box on the right
  const targetX = arrowStartX + arrowsW + 18
  return (
    <svg
      viewBox={`0 0 ${STRIP_VIEW_W} ${STRIP_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 392, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* start box: 63 */}
      <rect x={startX} y={midY - boxH / 2} width={boxW} height={boxH} rx={5} fill="#FFFFFF" stroke={INK} strokeWidth={2.5} />
      <text x={startX + boxW / 2} y={midY} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={900} fill={INK}>
        {START_VALUE}
      </text>

      {/* arrow run */}
      {Q3_MOVES.map((m, i) => (
        <ArrowGlyph key={`a${i}`} cx={arrowStartX + i * arrowGap} cy={midY} dir={m} />
      ))}

      {/* target box: "?" or, post-answer, the landing value */}
      <rect
        x={targetX}
        y={midY - boxH / 2}
        width={boxW}
        height={boxH}
        rx={5}
        fill={revealTarget ? '#D1FAE5' : '#FFFFFF'}
        stroke={revealTarget ? GREEN : INK}
        strokeWidth={2.5}
      />
      <text
        x={targetX + boxW / 2}
        y={midY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={20}
        fontWeight={900}
        fill={revealTarget ? '#065F46' : INK}
      >
        {revealTarget ? Q3_ANSWER : '?'}
      </text>
    </svg>
  )
}

// ===========================================================================
// Reusable primitive 3: the 61..120 number grid with an optional traced path.
// `pathLen` = how many cells of Q3_PATH to mark as visited (0 = none).
// Used ONLY by the explainer to show the walk; the question figure never calls it.
export const GRID_ROWS = 6
const CELL = 30
const GRID_PAD = 6
export const GRID_VIEW_W = GRID_COLS * CELL + GRID_PAD * 2
export const GRID_VIEW_H = GRID_ROWS * CELL + GRID_PAD * 2

function valueToRC(v: number): [number, number] {
  const idx = v - GRID_FIRST
  return [Math.floor(idx / GRID_COLS), idx % GRID_COLS]
}

export interface NumberGridProps {
  /** Cells of Q3_PATH (incl. start) to mark visited; the last one is the landing cell. */
  pathLen?: number
}

export function NumberGrid({ pathLen = 0 }: NumberGridProps) {
  const visited = Q3_PATH.slice(0, Math.max(0, pathLen))
  const visitedSet = new Set(visited)
  const landing = pathLen >= Q3_PATH.length ? Q3_ANSWER : null

  const cells: ReactNode[] = []
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const v = GRID_FIRST + r * GRID_COLS + c
      const x = GRID_PAD + c * CELL
      const y = GRID_PAD + r * CELL
      const isStart = v === START_VALUE
      const isLanding = v === landing
      const isVisited = visitedSet.has(v)
      const fill = isLanding ? '#D1FAE5' : isStart ? '#FEF3C7' : isVisited ? '#E1EFFB' : '#FFFFFF'
      cells.push(
        <g key={`cell-${v}`}>
          <rect
            x={x}
            y={y}
            width={CELL}
            height={CELL}
            fill={fill}
            stroke={isLanding ? GREEN : FAINT}
            strokeWidth={isLanding ? 2.5 : 1}
          />
          <text
            x={x + CELL / 2}
            y={y + CELL / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fontWeight={isStart || isLanding ? 900 : 600}
            fill={isLanding ? '#065F46' : INK}
          >
            {v}
          </text>
        </g>,
      )
    }
  }

  // path polyline through visited cell centres
  const pts = visited
    .map((v) => {
      const [r, c] = valueToRC(v)
      const cx = GRID_PAD + c * CELL + CELL / 2
      const cy = GRID_PAD + r * CELL + CELL / 2
      return `${cx},${cy}`
    })
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${GRID_VIEW_W} ${GRID_VIEW_H}`}
      width="100%"
      style={{ maxWidth: GRID_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {cells}
      {visited.length > 1 && (
        <polyline points={pts} fill="none" stroke={BLUE_DK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
      )}
      {visited.length > 0 &&
        visited.map((v, i) => {
          const [r, c] = valueToRC(v)
          const cx = GRID_PAD + c * CELL + CELL / 2
          const cy = GRID_PAD + r * CELL + CELL / 2
          const last = i === visited.length - 1
          return <circle key={`dot${i}`} cx={cx} cy={cy} r={last && landing ? 5 : 3} fill={last && landing ? GREEN : BLUE} />
        })}
    </svg>
  )
}

const ARIA =
  'Kotak bertuliskan 63, lalu deretan panah kanan, kanan, bawah, bawah, kanan, bawah, bawah, kiri, kiri, atas, lalu kotak bertanda tanya. ' +
  'Pada kisi 10 angka per baris: panah atas mengurangi 10, bawah menambah 10, kiri mengurangi 1, kanan menambah 1. ' +
  'Mulai dari 63, ikuti panah, mendarat di angka berapa?'

/**
 * Question figure — only the given arrow strip (start box, arrows, "?" box).
 * No grid, no path, no landing number.
 */
export default function P19G2Q3Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <ArrowStrip />
    </div>
  )
}
