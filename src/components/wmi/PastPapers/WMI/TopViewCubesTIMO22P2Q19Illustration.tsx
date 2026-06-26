/**
 * TopViewCubesTIMO22P2Q19Illustration — TIMO-22-P2H-Q19
 *
 * "At least how many squares can be seen if viewing the figure below from top?"
 * Answer: 9.
 *
 * 3D staircase layout (x=right, y=back/depth, z=up):
 *   Front row  (y=0, height 1): x=0,1,2,3
 *   Mid row    (y=1, height 2): x=1,2,3
 *   Back row   (y=2, height 3): x=2,3
 *
 * Top-down footprint (staircase shape, 4+3+2 = 9 unit squares):
 *   col:  0 1 2 3
 *   y=2:  . . X X   (back — tallest)
 *   y=1:  . X X X
 *   y=0:  X X X X   (front — shortest)
 *
 * Source: docs/reference/ocr-res/timo/bundle/primary-2/2020-2022.imgs/061.jpg
 * Reuses IsoCubes from ./primitives/IsoCubes.
 * SSR-safe — no hooks, no Math.random, no window/document.
 */

import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Cube voxels — staircase, 3 rows of depth, heights 1→2→3 front-to-back
// ---------------------------------------------------------------------------

export const TIMO22P2Q19_CUBES: IsoCube[] = [
  // Front row (y=0, height 1): x=0,1,2,3
  { x: 0, y: 0, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 2, y: 0, z: 0 },
  { x: 3, y: 0, z: 0 },
  // Mid row (y=1, height 2): x=1,2,3
  { x: 1, y: 1, z: 0 }, { x: 1, y: 1, z: 1 },
  { x: 2, y: 1, z: 0 }, { x: 2, y: 1, z: 1 },
  { x: 3, y: 1, z: 0 }, { x: 3, y: 1, z: 1 },
  // Back row (y=2, height 3): x=2,3
  { x: 2, y: 2, z: 0 }, { x: 2, y: 2, z: 1 }, { x: 2, y: 2, z: 2 },
  { x: 3, y: 2, z: 0 }, { x: 3, y: 2, z: 1 }, { x: 3, y: 2, z: 2 },
]

// ---------------------------------------------------------------------------
// Component — stem illustration (problem only, never shows the answer)
// ---------------------------------------------------------------------------

export default function TopViewCubesTIMO22P2Q19Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label={
        'Susunan kubus 3D: baris depan 4 kubus (tinggi 1), baris tengah 3 kubus (tinggi 2), ' +
        'baris belakang 2 kubus (tinggi 3). Hitung persegi yang terlihat dari atas.'
      }
    >
      <div className="flex justify-center">
        <IsoCubes
          cubes={TIMO22P2Q19_CUBES}
          size={24}
          palette={ISO_BLUE_PALETTE}
          viewPadding={10}
        />
      </div>
    </div>
  )
}
