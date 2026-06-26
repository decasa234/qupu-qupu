/**
 * IsoCubeStairTIMO22P1Q16Illustration — TIMO-22-P1H-Q16
 *
 * "Ada berapa kubus dalam gambar 2, jika gambar 2 dibentuk dari beberapa
 * bentuk seperti gambar 1?"
 * Answer: 20  (4 copies × 5 cubes each)
 *
 * Figure 1 (unit shape — 5 cubes):
 *   Row of 3 cubes going into the screen (y=0,1,2 at x=0, z=0)
 *   + stack of 2 cubes at the near end (x=0, y=0, z=1,2)
 *
 * Figure 2 (20 cubes):
 *   4 copies of figure 1 placed side by side in x (x=0,1,2,3).
 *   From isometric view this gives a repeating staircase wall.
 *
 * Source: docs/reference/ocr-res/timo/bundle/primary-1/2020-2022.imgs/095.jpg (fig 1)
 *         docs/reference/ocr-res/timo/bundle/primary-1/2020-2022.imgs/096.jpg (fig 2)
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel data (exported for reuse in explainer)
// ---------------------------------------------------------------------------

/** Unit shape from figure 1 — 5 cubes. */
export const TIMO22P1Q16_UNIT: IsoCube[] = [
  { x: 0, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 0, y: 2, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 0, z: 2 },
]

/** Figure 2 — 4 copies of the unit placed side-by-side (x=0..3). */
export const TIMO22P1Q16_FIG2: IsoCube[] = [0, 1, 2, 3].flatMap((x) =>
  TIMO22P1Q16_UNIT.map((c) => ({ ...c, x: c.x + x })),
)

export const TIMO22P1Q16_UNIT_COUNT = 5
export const TIMO22P1Q16_COPY_COUNT = 4
export const TIMO22P1Q16_TOTAL = 20

// ---------------------------------------------------------------------------
// Component — stem illustration (problem only; does NOT reveal the answer)
// ---------------------------------------------------------------------------

export default function IsoCubeStairTIMO22P1Q16Illustration() {
  return (
    <div
      className="my-4 flex flex-wrap items-end justify-center gap-6 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label="Gambar 1: bentuk satuan dari 5 kubus (barisan 3 ke dalam + 2 ditumpuk). Gambar 2: susunan dari beberapa salinan bentuk satuan — hitung jumlah kubusnya."
    >
      <div className="flex flex-col items-center gap-1">
        <span className="font-display text-xs font-bold text-gray-500">Gambar 1</span>
        <IsoCubes
          cubes={TIMO22P1Q16_UNIT}
          size={28}
          palette={ISO_BLUE_PALETTE}
          viewPadding={8}
          label="Bentuk satuan gambar 1"
        />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="font-display text-xs font-bold text-gray-500">Gambar 2</span>
        <IsoCubes
          cubes={TIMO22P1Q16_FIG2}
          size={28}
          palette={ISO_BLUE_PALETTE}
          viewPadding={8}
          label="Gambar 2 tersusun dari salinan gambar 1"
        />
      </div>
    </div>
  )
}
