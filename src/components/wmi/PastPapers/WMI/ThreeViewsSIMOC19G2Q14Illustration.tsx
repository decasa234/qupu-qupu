/**
 * ThreeViewsSIMOC19G2Q14Illustration — SIMOC-19-G2-Q14
 *
 * "A figure made up of unit cubes appears from the different views.
 *  What is the minimum number of cubes which could be used to build this figure?"
 * Answer: D (9)
 *
 * Source crops:
 *   019.jpg — Left side view (3 wide × 3 tall; L-shape, right column height 3)
 *   020.jpg — Top view    (4 wide × 3 deep; 7-cell L footprint)
 *   021.jpg — Front view  (4 wide × 3 tall; L-shape, right column height 3)
 *
 * The stem shows the THREE 2D orthographic view grids as given in the problem.
 * IsoCubes (the 3D reconstruction) is used in the Explainer, not here.
 *
 * Pure SVG, SSR-safe.
 */

import React from 'react'

// ── Grid drawing constants ─────────────────────────────────────────────────────
const CELL = 26
const FILL_CUBE  = '#334155'   // solid slate — represents a cube face
const FILL_EMPTY = '#F8FAFC'   // very light background — empty space
const STROKE     = '#64748B'   // grid lines
const SW         = 1.2
const LBL_GAP    = 6           // gap between grid bottom and label
const LBL_H      = 18          // label height

// ── Single orthographic view ───────────────────────────────────────────────────
function OrthoView({
  rows,
  cols,
  filled,
  label,
}: {
  rows: number
  cols: number
  filled: (r: number, c: number) => boolean
  label: string
}) {
  const w = cols * CELL
  const h = rows * CELL
  const totalH = h + LBL_GAP + LBL_H

  return (
    <svg
      width={w}
      height={totalH}
      viewBox={`0 0 ${w} ${totalH}`}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* cell fill rects */}
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (__, c) => (
          <rect
            key={`cell-${r}-${c}`}
            x={c * CELL}
            y={r * CELL}
            width={CELL}
            height={CELL}
            fill={filled(r, c) ? FILL_CUBE : FILL_EMPTY}
          />
        )),
      )}
      {/* grid lines */}
      {Array.from({ length: rows + 1 }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i * CELL} x2={w} y2={i * CELL} stroke={STROKE} strokeWidth={SW} />
      ))}
      {Array.from({ length: cols + 1 }, (_, i) => (
        <line key={`v${i}`} x1={i * CELL} y1={0} x2={i * CELL} y2={h} stroke={STROKE} strokeWidth={SW} />
      ))}
      {/* view label */}
      <text
        x={w / 2}
        y={h + LBL_GAP + LBL_H / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={10}
        fontWeight={700}
        fill="#475569"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </svg>
  )
}

// ── View silhouettes ───────────────────────────────────────────────────────────
//
// Coordinate system (per IsoCubes convention):
//   x = left→right   y = front→back (depth)   z = bottom→top
//
// Front view (021): 4 cols (x=0..3) × 3 rows (z=2 top → z=0 bottom)
//   Filled: entire bottom row (r=2) + right column (c=3) at r=0,1
function frontFilled(r: number, c: number): boolean {
  return r === 2 || (c === 3 && r <= 1)
}

// Left side view (019): 3 cols (y=0 front → y=2 back) × 3 rows (z=2 → z=0)
//   Filled: entire bottom row (r=2) + right column (c=2) at r=0,1
function sideFilled(r: number, c: number): boolean {
  return r === 2 || (c === 2 && r <= 1)
}

// Top view (020): 4 cols (x=0..3) × 3 rows (y=2 back at r=0 → y=0 front at r=2)
//   Filled footprint: (y=0) all x; (y=1) x=0 and x=3; (y=2) x=3 only
//   → 7 occupied cells
function topFilled(r: number, c: number): boolean {
  if (r === 2) return true                       // y=0 front row: all x
  if (r === 1 && (c === 0 || c === 3)) return true  // y=1: left and right posts
  if (r === 0 && c === 3) return true            // y=2 back row: x=3 only
  return false
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ThreeViewsSIMOC19G2Q14Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label={
        'Tiga tampak ortogonal bangun kubus satuan: tampak samping kiri (3×3), ' +
        'tampak atas (4×3), dan tampak depan (4×3). ' +
        'Tentukan jumlah minimum kubus satuan yang diperlukan.'
      }
    >
      <div className="flex flex-wrap items-end justify-center gap-6">
        <OrthoView rows={3} cols={3} filled={sideFilled} label="Tampak Samping" />
        <OrthoView rows={3} cols={4} filled={topFilled}  label="Tampak Atas"    />
        <OrthoView rows={3} cols={4} filled={frontFilled} label="Tampak Depan"  />
      </div>
    </div>
  )
}
