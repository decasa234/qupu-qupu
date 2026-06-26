/**
 * RightViewTIMO22P3Q19Illustration — TIMO-22-P3H-Q19
 *
 * "We place some identical cubes on top of each other. At least how many
 * square(s) can be seen if observing the figure below from the right-hand side?"
 * Answer: 8
 *
 * Source image: docs/reference/ocr-res/timo/bundle/primary-3/2020-2022.imgs/091.jpg
 *
 * Cube layout (x=right, y=depth/back, z=up):
 *
 *   y=0 (front row): flat spread, height 1
 *     (1,0,0), (2,0,0), (3,0,0), (4,0,0)
 *
 *   y=1 (second row): height up to 2
 *     (0,1,0), (1,1,0), (2,1,0), (2,1,1), (3,1,0)
 *
 *   y=2 (third row): 3-tall tower at x=1 + adjacent 2-tall and 1-tall
 *     (1,2,0), (1,2,1), (1,2,2)   ← 3-high tower
 *     (2,2,0), (2,2,1)             ← 2-high
 *     (3,2,0)                      ← 1-high
 *
 *   y=3 (back): isolated 2-tall column
 *     (0,3,0), (0,3,1)
 *
 * Right-side projection (collapse x, max_z+1 per y-row):
 *   y=0 → max_z=0 → 1 visible square
 *   y=1 → max_z=1 → 2 visible squares
 *   y=2 → max_z=2 → 3 visible squares
 *   y=3 → max_z=1 → 2 visible squares
 *   Minimum total = 1+2+3+2 = 8 ✓
 *
 * Uses IsoCubes primitive (SSR-safe, no hooks, no framer-motion).
 * Stem shows: 3D isometric arrangement + right-side silhouette grid.
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel set — exported so the explainer can reuse and colour-highlight groups
// ---------------------------------------------------------------------------

export const TIMO22P3Q19_CUBES: IsoCube[] = [
  // y=0 (front row): 4 cubes, height 1 → 1 visible from right
  { x: 1, y: 0, z: 0 },
  { x: 2, y: 0, z: 0 },
  { x: 3, y: 0, z: 0 },
  { x: 4, y: 0, z: 0 },
  // y=1 (second row): max height 2 → 2 visible from right
  { x: 0, y: 1, z: 0 },
  { x: 1, y: 1, z: 0 },
  { x: 2, y: 1, z: 0 },
  { x: 2, y: 1, z: 1 }, // 2-tall at x=2
  { x: 3, y: 1, z: 0 },
  // y=2 (third row): 3-tall tower → 3 visible from right
  { x: 1, y: 2, z: 0 },
  { x: 1, y: 2, z: 1 },
  { x: 1, y: 2, z: 2 }, // tower top
  { x: 2, y: 2, z: 0 },
  { x: 2, y: 2, z: 1 },
  { x: 3, y: 2, z: 0 },
  // y=3 (back): 2-tall column → 2 visible from right
  { x: 0, y: 3, z: 0 },
  { x: 0, y: 3, z: 1 },
]

// ---------------------------------------------------------------------------
// Right-side silhouette grid (right-view projection displayed as 2D grid)
//
// Grid layout: columns = depth (y=0..3, front→back)
//              rows    = height (z=2..0, top→bottom)
// A cell is filled when at least one cube exists at that (y, z) position.
// ---------------------------------------------------------------------------

const CELL = 20
const GRID_COLS = 4 // y = 0,1,2,3
const GRID_ROWS = 3 // z = 2,1,0 (displayed top→bottom)

/** Filled cells in the right-side silhouette: [row, col] pairs. */
const FILLED: [number, number][] = [
  // col 0 (y=0): z=0 only → row 2
  [2, 0],
  // col 1 (y=1): z=0,1 → rows 1,2
  [1, 1],
  [2, 1],
  // col 2 (y=2): z=0,1,2 → rows 0,1,2
  [0, 2],
  [1, 2],
  [2, 2],
  // col 3 (y=3): z=0,1 → rows 1,2
  [1, 3],
  [2, 3],
]

const GRID_W = GRID_COLS * CELL
const GRID_H = GRID_ROWS * CELL

function SilhouetteGrid() {
  return (
    <svg
      width={GRID_W + 2}
      height={GRID_H + 2}
      viewBox={`-1 -1 ${GRID_W + 2} ${GRID_H + 2}`}
      aria-hidden="true"
    >
      {/* Grid cells */}
      {Array.from({ length: GRID_ROWS }, (_, row) =>
        Array.from({ length: GRID_COLS }, (_, col) => {
          const filled = FILLED.some(([r, c]) => r === row && c === col)
          return (
            <rect
              key={`${row}-${col}`}
              x={col * CELL}
              y={row * CELL}
              width={CELL}
              height={CELL}
              fill={filled ? '#3B82F6' : '#F1F5F9'}
              stroke="#94A3B8"
              strokeWidth={1}
            />
          )
        }),
      )}
      {/* Count label inside bottom-right corner */}
      <text
        x={GRID_W + 1}
        y={GRID_H - 4}
        textAnchor="end"
        fontSize={9}
        fill="#1E40AF"
        fontWeight="bold"
      >
        = 8
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Component — stem illustration (shows the problem, not the answer)
// ---------------------------------------------------------------------------

export default function RightViewTIMO22P3Q19Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Susunan kubus satuan dalam 3D. Pertanyaan: berapa minimum kotak satuan ' +
        'yang terlihat jika dilihat dari sisi kanan?'
      }
    >
      <div className="flex flex-col items-center gap-3">
        {/* 3D isometric view */}
        <IsoCubes
          cubes={TIMO22P3Q19_CUBES}
          size={22}
          palette={ISO_BLUE_PALETTE}
          viewPadding={10}
        />
        {/* Right-side projection grid */}
        <div className="flex flex-col items-center gap-1">
          <span className="font-display text-xs font-bold text-gray-500">
            Tampak dari kanan
          </span>
          <SilhouetteGrid />
        </div>
      </div>
    </div>
  )
}
