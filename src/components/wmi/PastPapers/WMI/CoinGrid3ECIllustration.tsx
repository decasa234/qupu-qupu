// IKMC-22-EC-Q3 — Coin placement logic puzzle.
//
// Rossitza wants to put 2 coins in each row and in each column of a 4×4 grid.
// She has placed 8 coins (5 labelled A–E, 3 plain). One coin is in the wrong
// cell. Which coin must she move to an empty cell? Answer: C.
//
// Reconstructed from docs/reference/ocr-res/ikmc/contest/ecolier/2022.imgs/007.jpg.
//
// Initial placement (row, col), 0-indexed, row 0 = top:
//   (0,0) A   (0,3) plain
//   (1,1) plain   (1,2) plain
//   (2,3) D
//   (3,0) B   (3,1) C   (3,2) E
//
// Violation: row 2 has 1 coin, row 3 has 3 coins.
// Fix: move C from (3,1) to (2,1) → every row and column has exactly 2 coins.
//
// The static illustration shows ONLY the problem (initial placement).
// It never reveals which coin to move or where it should go.
//
// SSR-safe + deterministic: pure render, no Math.random, no Date, no state.

import React from 'react'

// ── Layout constants (shared with explainer) ──────────────────────────────────

export const ROWS = 4
export const COLS = 4
export const CELL = 56          // cell side length in px
export const PAD  = 18          // outer padding

const BOARD_W = COLS * CELL     // 224
const BOARD_H = ROWS * CELL     // 224
export const SVG_W = PAD * 2 + BOARD_W  // 260
export const SVG_H = PAD * 2 + BOARD_H  // 260

// ── Colour tokens ─────────────────────────────────────────────────────────────

export const COLOR = {
  GRID_LINE:    '#1F2937',
  COIN_FILL:    '#BFDBFE',   // light blue (matches source figure)
  COIN_STROKE:  '#3B82F6',   // blue ring
  LABEL:        '#1F2937',
  HIGHLIGHT_OK: '#10B981',   // green (correct destination in explainer)
  HIGHLIGHT_BAD:'#EF4444',   // red (coin that needs to move in explainer)
  ROW_FLASH:    '#FEF3C7',   // amber tint (row count hint in explainer)
} as const

// ── Coin data ─────────────────────────────────────────────────────────────────

/** A coin in the grid. `label` is undefined for plain (unlabelled) coins. */
export interface CoinCell {
  row: number
  col: number
  label?: 'A' | 'B' | 'C' | 'D' | 'E'
}

/**
 * Initial placement from the paper figure (007 image).
 * 8 coins total → 2 per row and 2 per col when C is moved.
 * Currently: row 2 has 1 coin, row 3 has 3 coins.
 */
export const INITIAL_COINS: CoinCell[] = [
  { row: 0, col: 0, label: 'A' },
  { row: 0, col: 3 },
  { row: 1, col: 1 },
  { row: 1, col: 2 },
  { row: 2, col: 3, label: 'D' },
  { row: 3, col: 0, label: 'B' },
  { row: 3, col: 1, label: 'C' },
  { row: 3, col: 2, label: 'E' },
]

/** Coin C's initial position. */
export const COIN_C_INITIAL = { row: 3, col: 1 }

/** Coin C's correct target position (the empty cell it needs to move to). */
export const COIN_C_TARGET  = { row: 2, col: 1 }

// ── Helpers ───────────────────────────────────────────────────────────────────

/** X-centre of column c. */
export const cx = (c: number) => PAD + c * CELL + CELL / 2

/** Y-centre of row r. */
export const cy = (r: number) => PAD + r * CELL + CELL / 2

// ── Sub-components ────────────────────────────────────────────────────────────

/** 4×4 grid lines. */
export function CoinGridLines() {
  const lines: React.ReactNode[] = []
  for (let r = 0; r <= ROWS; r++) {
    const y = PAD + r * CELL
    lines.push(
      <line
        key={`h${r}`}
        x1={PAD} y1={y} x2={PAD + BOARD_W} y2={y}
        stroke={COLOR.GRID_LINE}
        strokeWidth={r === 0 || r === ROWS ? 2.5 : 1.5}
      />
    )
  }
  for (let c = 0; c <= COLS; c++) {
    const x = PAD + c * CELL
    lines.push(
      <line
        key={`v${c}`}
        x1={x} y1={PAD} x2={x} y2={PAD + BOARD_H}
        stroke={COLOR.GRID_LINE}
        strokeWidth={c === 0 || c === COLS ? 2.5 : 1.5}
      />
    )
  }
  return <g>{lines}</g>
}

/** A single coin circle, optionally labelled, with optional highlight ring. */
export function CoinCircle({
  x, y,
  label,
  ring = 'none',
  r = 20,
}: {
  x: number
  y: number
  label?: string
  ring?: 'none' | 'bad' | 'ok'
  r?: number
}) {
  const ringColor = ring === 'bad' ? COLOR.HIGHLIGHT_BAD : COLOR.HIGHLIGHT_OK
  return (
    <g>
      {ring !== 'none' && (
        <circle
          cx={x} cy={y} r={r + 5}
          fill="none"
          stroke={ringColor}
          strokeWidth={3}
        />
      )}
      <circle
        cx={x} cy={y} r={r}
        fill={COLOR.COIN_FILL}
        stroke={COLOR.COIN_STROKE}
        strokeWidth={2}
      />
      {label && (
        <text
          x={x} y={y + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={16}
          fontWeight={800}
          fill={COLOR.LABEL}
          className="font-display"
        >
          {label}
        </text>
      )}
    </g>
  )
}

// ── Primitive (shared with explainer) ─────────────────────────────────────────

export type CoinRing = Record<string, 'bad' | 'ok' | 'none'>

/**
 * CoinGrid3ECFigure — the shared primitive that both the illustration and the
 * explainer use.
 *
 * @param coins       - Array of coins to render (defaults to initial placement).
 * @param rings       - Map of "rowcol" key → ring style, e.g. `{ '31': 'bad' }`.
 * @param emptyTarget - If true, draw a dashed-ring placeholder at COIN_C_TARGET
 *                      to show where C should go.
 */
export function CoinGrid3ECFigure({
  coins = INITIAL_COINS,
  rings = {},
  emptyTarget = false,
}: {
  coins?: CoinCell[]
  rings?: CoinRing
  emptyTarget?: boolean
}) {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* board background */}
      <rect
        x={PAD} y={PAD} width={BOARD_W} height={BOARD_H}
        fill="#FAFAFA" rx={2}
      />

      {/* grid lines */}
      <CoinGridLines />

      {/* empty target placeholder (dashed circle) */}
      {emptyTarget && (
        <circle
          cx={cx(COIN_C_TARGET.col)}
          cy={cy(COIN_C_TARGET.row)}
          r={22}
          fill="none"
          stroke={COLOR.HIGHLIGHT_OK}
          strokeWidth={2.5}
          strokeDasharray="6 4"
        />
      )}

      {/* coins */}
      {coins.map((coin) => {
        const key = `${coin.row}${coin.col}`
        const ring = rings[key] ?? 'none'
        return (
          <CoinCircle
            key={key}
            x={cx(coin.col)}
            y={cy(coin.row)}
            label={coin.label}
            ring={ring}
          />
        )
      })}
    </svg>
  )
}

// ── Default export: stem illustration (static, problem-only) ──────────────────

/**
 * CoinGrid3ECIllustration
 *
 * Static figure for IKMC-22-EC-Q3. Shows the initial coin placement as in the
 * paper (5 labelled A–E + 3 plain coins). Does NOT reveal which coin to move
 * or where it should go.
 */
export default function CoinGrid3ECIllustration({ params }: { params?: unknown }) {
  void params // grid is fully determined by the question

  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Kisi 4×4 dengan 8 koin. ' +
        'Baris atas: koin A di kolom 1, koin biasa di kolom 4. ' +
        'Baris 2: koin biasa di kolom 2 dan 3. ' +
        'Baris 3: koin D di kolom 4. ' +
        'Baris bawah: koin B di kolom 1, koin C di kolom 2, koin E di kolom 3. ' +
        'Rossitza ingin tepat 2 koin di setiap baris dan kolom. Koin mana yang harus dipindahkan?'
      }
    >
      <CoinGrid3ECFigure />
    </div>
  )
}
