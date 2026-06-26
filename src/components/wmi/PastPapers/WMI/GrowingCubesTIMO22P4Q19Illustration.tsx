/**
 * GrowingCubesTIMO22P4Q19Illustration — TIMO-22-P4H-Q19
 *
 * "According to the pattern shown below, how many cubes are there in the 10th group?"
 * Source: TIMO 2022 Heat Primary 4, Q19.  Answer: 29.
 *
 * The figure shows 3 growing L-shaped isometric cube groups.
 * Each group n is an L-shape with:
 *   - horizontal arm: 2n cubes at z=0 (x = 0..2n-1, y=0)
 *   - vertical arm:   (n-1) extra cubes stacked at x=0 (z = 1..n-1)
 * Total: 2n + (n-1) = 3n - 1  →  G(1)=2, G(2)=5, G(3)=8, G(10)=29
 *
 * Primitive: IsoCubes (./primitives/IsoCubes) — IMPORT-FIRST, no re-derived geometry.
 * Stem illustration only — does NOT reveal the formula or G(10).
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel data — exported so the explainer can reuse and highlight new cubes
// ---------------------------------------------------------------------------

/** Group 1: 2 cubes — horizontal row of 2. */
export const TIMO22P4Q19_G1: IsoCube[] = [
  { x: 0, y: 0, z: 0 },
  { x: 1, y: 0, z: 0 },
]

/** Group 2: 5 cubes — horizontal arm (4) + 1 stacked. */
export const TIMO22P4Q19_G2: IsoCube[] = [
  { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, { x: 3, y: 0, z: 0 },
  { x: 0, y: 0, z: 1 },
]

/** Group 3: 8 cubes — horizontal arm (6) + 2 stacked. */
export const TIMO22P4Q19_G3: IsoCube[] = [
  { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 },
  { x: 3, y: 0, z: 0 }, { x: 4, y: 0, z: 0 }, { x: 5, y: 0, z: 0 },
  { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 2 },
]

const GROUPS: { cubes: IsoCube[]; label: string }[] = [
  { cubes: TIMO22P4Q19_G1, label: 'Kelompok 1' },
  { cubes: TIMO22P4Q19_G2, label: 'Kelompok 2' },
  { cubes: TIMO22P4Q19_G3, label: 'Kelompok 3' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GrowingCubesTIMO22P4Q19Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Tiga kelompok kubus isometrik berbentuk L yang bertumbuh: ' +
        'kelompok 1 berisi 2 kubus, kelompok 2 berisi 5 kubus, kelompok 3 berisi 8 kubus. ' +
        'Setiap kelompok menambahkan 3 kubus dari kelompok sebelumnya.'
      }
    >
      <div className="flex flex-row items-end justify-around gap-3 py-1">
        {GROUPS.map(({ cubes, label }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <IsoCubes
              cubes={cubes}
              size={20}
              palette={ISO_BLUE_PALETTE}
              viewPadding={6}
            />
            <span className="text-center font-display text-xs font-bold text-slate-600">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
