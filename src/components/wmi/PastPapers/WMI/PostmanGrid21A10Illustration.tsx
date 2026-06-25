// PostmanGrid21A10Illustration — SEAMO-21-A-Q10
//
// Postman Pat grid: deliveries from Point A (bottom-left) to Point B (top-right).
// Movements only → (right) and ↑ (up).
// Grid: 4 cells wide × 3 cells tall → 5 × 4 lattice nodes.
//
// Pascal path-count at each node (counting from A=bottom-left):
//
//   row 0 (top):     1   4  10  20  35   ← B (answer = 35)
//   row 1:           1   3   6  10  15
//   row 2:           1   2   3   4   5
//   row 3 (bottom):  1   1   1   1   1   ← A
//                   c0  c1  c2  c3  c4
//
// The illustration shows the empty grid with A/B labels and arrow cues (→ ↑).
// No Pascal numbers are revealed — those appear in the explainer.
//
// Pure SVG render — no hooks, no framer-motion, SSR-safe.

import React from 'react'

// ── geometry ────────────────────────────────────────────────────────────────
const CELL_W   = 54   // cell width  (px)
const CELL_H   = 46   // cell height (px)
const GRID_COLS = 4   // cells wide
const GRID_ROWS = 3   // cells tall
const PAD_L    = 50   // left padding (room for postman + A label)
const PAD_T    = 30   // top padding  (room for B label + house)
const PAD_R    = 60   // right padding (room for house / B label)
const PAD_B    = 55   // bottom padding (room for arrows + A label)

// Total SVG dimensions
const SVG_W = PAD_L + GRID_COLS * CELL_W + PAD_R
const SVG_H = PAD_T + GRID_ROWS * CELL_H + PAD_B

// Node pixel position: col 0..GRID_COLS, row 0..GRID_ROWS
// row 0 = top of SVG grid, row GRID_ROWS = bottom
function nodeX(col: number): number {
  return PAD_L + col * CELL_W
}
function nodeY(row: number): number {
  return PAD_T + row * CELL_H
}

// A = bottom-left node, B = top-right node
const AX = nodeX(0)
const AY = nodeY(GRID_ROWS)
const BX = nodeX(GRID_COLS)
const BY = nodeY(0)

// ── colours ──────────────────────────────────────────────────────────────────
const INK         = '#1F2937'   // dark text
const GRID_STROKE = '#6B7280'   // grid lines
const GRID_FILL   = '#F9FAFB'   // cell background
const ACCENT      = '#2563EB'   // blue for A/B dots and arrows
const HOUSE_FILL  = '#FBBF24'   // house accent
const HAT_FILL    = '#1D4ED8'   // postman hat
const COAT_FILL   = '#2563EB'   // postman coat

// ── small postman glyph (SVG group, centred at cx,cy) ───────────────────────
function Postman({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx},${cy})`} aria-hidden="true">
      {/* body */}
      <rect x={-10} y={-6} width={20} height={22} rx={4} fill={COAT_FILL} />
      {/* head */}
      <circle cx={0} cy={-14} r={9} fill="#FDE68A" stroke="#D97706" strokeWidth={1} />
      {/* hat */}
      <rect x={-9} y={-24} width={18} height={7} rx={2} fill={HAT_FILL} />
      <rect x={-11} y={-19} width={22} height={3} rx={1} fill={HAT_FILL} />
      {/* parcel */}
      <rect x={8} y={2} width={12} height={10} rx={2} fill="#FEF3C7" stroke="#D97706" strokeWidth={1} />
      <line x1={14} y1={2} x2={14} y2={12} stroke="#D97706" strokeWidth={1} />
      <line x1={8} y1={7} x2={20} y2={7} stroke="#D97706" strokeWidth={1} />
    </g>
  )
}

// ── small house glyph (SVG group, centred at cx,cy) ─────────────────────────
function House({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx},${cy})`} aria-hidden="true">
      {/* roof */}
      <polygon points="0,-20 20,0 -20,0" fill="#EF4444" />
      {/* walls */}
      <rect x={-16} y={0} width={32} height={20} fill={HOUSE_FILL} />
      {/* door */}
      <rect x={-5} y={8} width={10} height={12} rx={2} fill="#92400E" />
      {/* windows */}
      <rect x={-14} y={2} width={8} height={8} rx={1} fill="#BAE6FD" />
      <rect x={6}  y={2} width={8} height={8} rx={1} fill="#BAE6FD" />
    </g>
  )
}

// ── main component ───────────────────────────────────────────────────────────
export default function PostmanGrid21A10Illustration() {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      aria-label="Postman Pat delivering from Point A (bottom-left) to Point B (top-right) on a 4-by-3 grid, moving only right or up."
      role="img"
    >
      {/* ── grid cell fills ── */}
      <rect
        x={nodeX(0)}
        y={nodeY(0)}
        width={GRID_COLS * CELL_W}
        height={GRID_ROWS * CELL_H}
        fill={GRID_FILL}
        stroke="none"
      />

      {/* ── grid lines ── */}
      {/* horizontal */}
      {Array.from({ length: GRID_ROWS + 1 }, (_, r) => (
        <line
          key={`h-${r}`}
          x1={nodeX(0)}
          y1={nodeY(r)}
          x2={nodeX(GRID_COLS)}
          y2={nodeY(r)}
          stroke={GRID_STROKE}
          strokeWidth={1.5}
        />
      ))}
      {/* vertical */}
      {Array.from({ length: GRID_COLS + 1 }, (_, c) => (
        <line
          key={`v-${c}`}
          x1={nodeX(c)}
          y1={nodeY(0)}
          x2={nodeX(c)}
          y2={nodeY(GRID_ROWS)}
          stroke={GRID_STROKE}
          strokeWidth={1.5}
        />
      ))}

      {/* ── A dot & label (bottom-left) ── */}
      <circle cx={AX} cy={AY} r={5} fill={ACCENT} />
      <text
        x={AX}
        y={AY + 16}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={15}
        fontWeight={800}
        fill={ACCENT}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        A
      </text>

      {/* ── arrow cues below grid (→ and ↑) ── */}
      {/* right arrow */}
      <g transform={`translate(${AX + 6}, ${AY + 30})`}>
        <line x1={0} y1={0} x2={22} y2={0} stroke={INK} strokeWidth={2} />
        <polygon points="22,-4 30,0 22,4" fill={INK} />
      </g>
      {/* up arrow */}
      <g transform={`translate(${AX - 26}, ${AY + 20})`}>
        <line x1={0} y1={0} x2={0} y2={-22} stroke={INK} strokeWidth={2} />
        <polygon points="-4,-22 0,-30 4,-22" fill={INK} />
      </g>

      {/* ── B dot & label (top-right) ── */}
      <circle cx={BX} cy={BY} r={5} fill={ACCENT} />
      <text
        x={BX + 14}
        y={BY - 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={15}
        fontWeight={800}
        fill={ACCENT}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        B
      </text>

      {/* ── postman glyph (left of grid, near A) ── */}
      <Postman cx={AX - 32} cy={AY - 18} />

      {/* ── house glyph (right of grid, near B) ── */}
      <House cx={BX + 36} cy={BY + 4} />
    </svg>
  )
}
