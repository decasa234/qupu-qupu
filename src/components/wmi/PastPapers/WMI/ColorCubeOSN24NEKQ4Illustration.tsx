/**
 * ColorCubeOSN24NEKQ4Illustration — OSN-24-SD-NAS-EKSPERIMEN-Q4
 *
 * "Color each of the 27 unit cubes in a 3×3×3 cube using one of 3 colors
 *  so that no two adjacent unit cubes (sharing a face) have the same color.
 *  How many unit cubes receive the first color (color 1)?"
 * Answer: 9  (each of the 3 residue classes by (i+j+k) mod 3 has exactly 9 cubes).
 *
 * Source OCR: docs/reference/ocr-res/osn/nasional/sd/2024-eksperimen.md  (question 3/OCR)
 * No stem figure in the original paper — the illustration is constructed from the
 * (i+j+k) mod 3 coloring rule that proves the answer.
 *
 * Colors (matching the problem: kuning/yellow = color 1, merah/red = color 2,
 * hijau/green = color 3):
 *   (i+j+k) % 3 === 0  → yellow  — COLOR 1 → 9 cubes  ← the answer
 *   (i+j+k) % 3 === 1  → red     — COLOR 2 → 9 cubes
 *   (i+j+k) % 3 === 2  → green   — COLOR 3 → 9 cubes
 *
 * Reuses IsoCubes from ./primitives/IsoCubes.
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Color palette for 3-class checkerboard coloring
// ---------------------------------------------------------------------------

export const COLOR_YELLOW = '#FDE047'   // warna 1 — color 1 (answer: 9 cubes)
export const COLOR_RED    = '#F87171'   // warna 2 — color 2
export const COLOR_GREEN  = '#34D399'   // warna 3 — color 3

/** Map (i+j+k) mod 3 → hex colour */
export function cubeColor(i: number, j: number, k: number): string {
  const r = (i + j + k) % 3
  if (r === 0) return COLOR_YELLOW
  if (r === 1) return COLOR_RED
  return COLOR_GREEN
}

// ---------------------------------------------------------------------------
// 27 cubes: x=i (right), y=j (depth), z=k (up)
// ---------------------------------------------------------------------------

export const COLOR_CUBE_3X3: IsoCube[] = []
for (let k = 0; k <= 2; k++) {
  for (let j = 0; j <= 2; j++) {
    for (let i = 0; i <= 2; i++) {
      COLOR_CUBE_3X3.push({ x: i, y: j, z: k, color: cubeColor(i, j, k) })
    }
  }
}

// ---------------------------------------------------------------------------
// Component — stem illustration
// ---------------------------------------------------------------------------

export default function ColorCubeOSN24NEKQ4Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Kubus 3×3×3 yang diwarnai dengan tiga warna (kuning, merah, hijau) ' +
        'menggunakan aturan (i+j+k) mod 3. Setiap warna digunakan tepat 9 kali.'
      }
    >
      <IsoCubes
        cubes={COLOR_CUBE_3X3}
        size={22}
        palette={ISO_BLUE_PALETTE}
        viewPadding={8}
        label="3×3×3 cube colored by (i+j+k) mod 3 — each of 3 colors appears 9 times"
      />
    </div>
  )
}
