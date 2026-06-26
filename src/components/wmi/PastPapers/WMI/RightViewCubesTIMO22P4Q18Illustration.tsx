/**
 * RightViewCubesTIMO22P4Q18Illustration — TIMO-22-P4H-Q18
 *
 * "Paling sedikit berapa banyak persegi yang terlihat jika melihat gambar
 *  di bawah ini dari sisi kanan?" → 9
 *
 * 3D voxel layout (x=right, y=back/depth, z=up):
 *
 *   Left section — 3-high at y=0 and y=1 (appears as tall left group in iso):
 *     y=0: x=0 (h=3), x=1,2,3 (h=1 floor)
 *     y=1: x=0 (h=3), x=1,2,3 (h=1 floor)
 *   Right section:
 *     y=2: x=3 (h=2 tower)
 *     y=3: x=3 (h=1 floor)
 *
 *   RIGHT-SIDE VIEW silhouette (project onto y–z plane, 9 squares):
 *     y=0 → z=0,1,2 (height 3) → 3 squares
 *     y=1 → z=0,1,2 (height 3) → 3 squares
 *     y=2 → z=0,1   (height 2) → 2 squares
 *     y=3 → z=0     (height 1) → 1 square
 *     Total = 9 ✓
 *
 * Source: docs/reference/ocr-res/timo/bundle/primary-4/2020-2022.imgs/076.jpg
 * Primitive: IsoCubes from ./primitives/IsoCubes (IMPORT-FIRST).
 * SSR-safe — no hooks, no framer-motion, no window/document.
 */

import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Cube voxels
// ---------------------------------------------------------------------------

export const TIMO22P4Q18_CUBES: IsoCube[] = [
  // Left wall y=0 — 3-high column + floor row
  { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 2 },
  { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, { x: 3, y: 0, z: 0 },
  // Left wall y=1 — 3-high column + floor row
  { x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 1 }, { x: 0, y: 1, z: 2 },
  { x: 1, y: 1, z: 0 }, { x: 2, y: 1, z: 0 }, { x: 3, y: 1, z: 0 },
  // Right section y=2 — 2-high tower
  { x: 3, y: 2, z: 0 }, { x: 3, y: 2, z: 1 },
  // Right trailing floor y=3
  { x: 3, y: 3, z: 0 },
]

// ---------------------------------------------------------------------------
// Component — stem illustration (shows only the problem, never the answer)
// ---------------------------------------------------------------------------

export default function RightViewCubesTIMO22P4Q18Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label={
        'Susunan kubus 3D: dua kolom tinggi 3 di kiri (depan dan belakang), ' +
        'deretan lantai di tengah, menara tinggi 2 di kanan. ' +
        'Hitung persegi yang terlihat dari sisi kanan.'
      }
    >
      <div className="flex justify-center">
        <IsoCubes
          cubes={TIMO22P4Q18_CUBES}
          size={24}
          palette={ISO_BLUE_PALETTE}
          viewPadding={10}
        />
      </div>
    </div>
  )
}
