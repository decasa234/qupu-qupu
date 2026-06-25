// SEAMOX-23-A-Q15 — "Find the number of shortest paths from A to B."
//
// OCR: docs/reference/ocr-res/seamo-x/contest/paper-a/2023.md Q15
// Crop: 2023.imgs/008.jpg
//
// FIGURE: Staircase grid with A at bottom-left and B at top-right.
// 4 rows of cells (widths 4, 3, 2, 1 from bottom to top).
// Valid cells: C >= R  (cell col >= cell row, 0-indexed from bottom-left).
// Nodes span x=0..4, y=0..4 in math coords (y=0 = bottom, y=4 = top).
// A = node (0,0) = bottom-left corner.
// B = node (4,4) = top-right corner.
//
// ANSWER: 42 (Pascal fill on the staircase).
//
// PROBLEM-ONLY: never shows path counts or the answer.
// Pure SVG, SSR-safe, no hooks, no framer-motion.

import React from 'react'

// ── Shared layout constants (re-exported for the explainer) ──────────────────

/** Cell size in SVG units. */
export const CELL = 40

/** Padding around the grid. */
export const PAD = 32

/** Number of cell rows (and cols) in the staircase. */
export const STEPS = 4

/**
 * Math node (col, row) → SVG pixel (x, y).
 * row=0 is at the BOTTOM visually; row=STEPS is at the TOP.
 */
export function nodeXY(col: number, row: number): [number, number] {
  return [PAD + col * CELL, PAD + (STEPS - row) * CELL]
}

/** A node in math coords (bottom-left). */
export const NODE_A = [0, 0] as [number, number]

/** B node in math coords (top-right). */
export const NODE_B = [STEPS, STEPS] as [number, number]

/** Returns true if cell (C, R) is inside the staircase (col >= row). */
export function cellValid(C: number, R: number): boolean {
  return C >= R && C < STEPS && R < STEPS && R >= 0 && C >= 0
}

// ── SVG dimensions ────────────────────────────────────────────────────────────

export const SVG_W = PAD * 2 + STEPS * CELL   // 64 + 160 = 224
export const SVG_H = PAD * 2 + STEPS * CELL

// ── Grid renderer ─────────────────────────────────────────────────────────────

function StaircaseCells() {
  const cells: React.ReactNode[] = []

  for (let R = 0; R < STEPS; R++) {
    for (let C = 0; C < STEPS; C++) {
      if (!cellValid(C, R)) continue
      // Cell (C,R): in SVG its top-left corner is at node (C, R+1).
      const [x, y] = nodeXY(C, R + 1)
      cells.push(
        <rect
          key={`cell-${C}-${R}`}
          x={x}
          y={y}
          width={CELL}
          height={CELL}
          fill="white"
          stroke="#374151"
          strokeWidth={1.5}
        />,
      )
    }
  }

  return <g>{cells}</g>
}

// ── Endpoint labels ───────────────────────────────────────────────────────────

function EndpointLabels() {
  const [ax, ay] = nodeXY(...NODE_A)
  const [bx, by] = nodeXY(...NODE_B)
  const INK = '#111827'

  return (
    <g fontFamily="sans-serif" fontWeight={700} fontSize={15} fill={INK}>
      {/* A — below-left of bottom-left corner */}
      <text x={ax - 4} y={ay + 18} textAnchor="end" dominantBaseline="central">
        A
      </text>
      {/* B — above-right of top-right corner */}
      <text x={bx + 4} y={by - 12} textAnchor="start" dominantBaseline="central">
        B
      </text>
      <circle cx={ax} cy={ay} r={4} fill={INK} />
      <circle cx={bx} cy={by} r={4} fill={INK} />
    </g>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * StaircasePathX23A15Illustration
 *
 * Static, problem-only figure for SEAMOX-23-A-Q15.
 * Shows a 4-step staircase grid with A at bottom-left and B at top-right.
 * Never reveals path counts or the answer (42).
 */
export default function StaircasePathX23A15Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Grid berbentuk tangga dengan A di pojok kiri bawah dan B di pojok kanan atas. ' +
        'Empat baris sel dari bawah ke atas: lebar 4, 3, 2, 1.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(260, SVG_W)}
        style={{ display: 'block' }}
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#F9FAFB" />
        <StaircaseCells />
        <EndpointLabels />
      </svg>
    </div>
  )
}
