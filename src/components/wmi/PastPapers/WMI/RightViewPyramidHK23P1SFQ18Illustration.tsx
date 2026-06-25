/**
 * RightViewPyramidHK23P1SFQ18Illustration — HKIMO-23-P1SF-Q18
 *
 * "At least how many square(s) can be seen if observing the figure below
 * from the right?" — Answer: 4.
 *
 * Source image: docs/reference/ocr-res/hkimo/semifinal/primary-1/2023.imgs/007.jpg
 *
 * The figure is a corner-staircase (stepped pyramid) where height at (x,y)
 * = max(0, 4 − max(x,y)):
 *   z=0: full 4×4 base (16 cubes)
 *   z=1: 3×3 at x=0..2, y=0..2 (9 cubes)
 *   z=2: 2×2 at x=0..1, y=0..1 (4 cubes)
 *   z=3: 1×1 at x=0, y=0 (1 cube)
 *   Total: 30 cubes
 *
 * From the RIGHT (+x direction), the outermost face is at x=3.
 * Since height(3,y)=1 for all y=0..3, x=3 only has z=0 cubes.
 * That exposes exactly 4 right-facing squares: (x=3, y=0..3, z=0).
 * Answer = 4.
 *
 * Primitive: IsoCubes from ./primitives/IsoCubes (painter-order, SSR-safe).
 * Stem illustration only (no picture choices).
 */

import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel set — 30-cube stepped pyramid
// ---------------------------------------------------------------------------

export const HK23P1SFQ18_CUBES: IsoCube[] = [
  // z=0 — 4×4 base (16 cubes)
  { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, { x: 3, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 2, y: 1, z: 0 }, { x: 3, y: 1, z: 0 },
  { x: 0, y: 2, z: 0 }, { x: 1, y: 2, z: 0 }, { x: 2, y: 2, z: 0 }, { x: 3, y: 2, z: 0 },
  { x: 0, y: 3, z: 0 }, { x: 1, y: 3, z: 0 }, { x: 2, y: 3, z: 0 }, { x: 3, y: 3, z: 0 },
  // z=1 — 3×3 (9 cubes)
  { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }, { x: 2, y: 0, z: 1 },
  { x: 0, y: 1, z: 1 }, { x: 1, y: 1, z: 1 }, { x: 2, y: 1, z: 1 },
  { x: 0, y: 2, z: 1 }, { x: 1, y: 2, z: 1 }, { x: 2, y: 2, z: 1 },
  // z=2 — 2×2 (4 cubes)
  { x: 0, y: 0, z: 2 }, { x: 1, y: 0, z: 2 },
  { x: 0, y: 1, z: 2 }, { x: 1, y: 1, z: 2 },
  // z=3 — 1×1 (1 cube)
  { x: 0, y: 0, z: 3 },
]

// ---------------------------------------------------------------------------
// Component — stem illustration (shows the problem, NOT the answer)
// ---------------------------------------------------------------------------

export default function RightViewPyramidHK23P1SFQ18Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'A stepped pyramid of unit cubes: 4×4 base, 3×3 second layer, 2×2 third layer, 1×1 top. ' +
        'How many squares are visible when viewed from the right?'
      }
    >
      <div className="flex flex-col items-center gap-2">
        <IsoCubes
          cubes={HK23P1SFQ18_CUBES}
          size={22}
          palette={ISO_BLUE_PALETTE}
          viewPadding={10}
        />
        <span className="font-display text-xs font-bold text-gray-500">
          View from right / Lihat dari kanan →
        </span>
      </div>
    </div>
  )
}
