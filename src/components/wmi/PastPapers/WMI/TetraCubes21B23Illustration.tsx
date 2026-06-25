/**
 * TetraCubes21B23Illustration — SEAMO-21-B-Q23
 *
 * "There are 1, 4 and 10 cubes in Figures 1, 2 and 3, respectively.
 * How many cubes are there altogether in Figures 1 to 5?"
 * Answer: 70 (free-response, fill_in).
 *
 * Source images:
 *   docs/reference/ocr-res/seamo/contest/paper-b/2021.imgs/009.jpg  — Fig 1 (1 cube)
 *   docs/reference/ocr-res/seamo/contest/paper-b/2021.imgs/010.jpg  — Fig 2 (4 cubes)
 *   docs/reference/ocr-res/seamo/contest/paper-b/2021.imgs/011.jpg  — Fig 3 (10 cubes)
 *
 * Each figure is a tetrahedral number T(n) = n(n+1)(n+2)/6.
 * They are isometric cube pyramids where each new layer is a triangular layer:
 *   Fig n: z=k layer has (n-k)(n-k+1)/2 cubes arranged in a right-triangle grid.
 *
 * Tetrahedral voxel sets:
 *   Fig 1: T(1)=1  → z=0: 1 cube
 *   Fig 2: T(2)=4  → z=0: 3 cubes (triangle), z=1: 1 cube
 *   Fig 3: T(3)=10 → z=0: 6 cubes, z=1: 3 cubes, z=2: 1 cube
 *
 * The stem shows figures 1-3 side-by-side; figures 4-5 are NOT shown
 * (the question asks the student to extend the pattern).
 *
 * Classification: stem illustration (the question body has figures; there are
 * no picture-choice options — this is a fill_in question).
 *
 * Reuses IsoCubes from ./primitives/IsoCubes — painter-sorted, SSR-safe.
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Tetrahedral voxel helpers
// ---------------------------------------------------------------------------

/**
 * Build the voxel set for tetrahedral figure n (T(n) = n(n+1)(n+2)/6 cubes).
 * Layer z has a right-triangle grid with side (n-z): cells (x,y) where x+y < n-z.
 */
export function tetrahedralCubes(n: number): IsoCube[] {
  const cubes: IsoCube[] = []
  for (let z = 0; z < n; z++) {
    const side = n - z
    for (let x = 0; x < side; x++) {
      for (let y = 0; y < side - x; y++) {
        cubes.push({ x, y, z })
      }
    }
  }
  return cubes
}

/** Voxel sets for figures 1–3 (exported for explainer to reuse). */
export const FIG1_CUBES: IsoCube[] = tetrahedralCubes(1)   // 1 cube
export const FIG2_CUBES: IsoCube[] = tetrahedralCubes(2)   // 4 cubes
export const FIG3_CUBES: IsoCube[] = tetrahedralCubes(3)   // 10 cubes

/** Tetrahedral number T(n) = n(n+1)(n+2)/6 */
export function T(n: number): number {
  return (n * (n + 1) * (n + 2)) / 6
}

// ---------------------------------------------------------------------------
// Component — stem illustration (shows Figures 1, 2, 3 only)
// Does NOT reveal Figures 4 and 5 — the student must extend the pattern.
// ---------------------------------------------------------------------------

const FIGURES = [
  { label: 'Fig 1', cubes: FIG1_CUBES, count: 1 },
  { label: 'Fig 2', cubes: FIG2_CUBES, count: 4 },
  { label: 'Fig 3', cubes: FIG3_CUBES, count: 10 },
]

export default function TetraCubes21B23Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label={
        'Three isometric cube figures showing tetrahedral numbers. ' +
        'Figure 1 has 1 cube. Figure 2 has 4 cubes (triangular base of 3 plus 1 on top). ' +
        'Figure 3 has 10 cubes (6 on bottom, 3 in middle, 1 on top). ' +
        'Find the total for Figures 1 through 5.'
      }
    >
      <div className="flex flex-wrap items-end justify-center gap-6">
        {FIGURES.map(({ label, cubes, count }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <IsoCubes
              cubes={cubes}
              size={28}
              palette={ISO_BLUE_PALETTE}
              viewPadding={10}
              label={`${label}: ${count} cube${count !== 1 ? 's' : ''}`}
            />
            <span
              className="font-display text-xs font-bold text-gray-600"
              aria-hidden="true"
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
