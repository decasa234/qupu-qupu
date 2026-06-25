/**
 * TopViewHK25P2Q17Illustration — HKIMO-25-P2H-Q17
 *
 * "At least how many square(s) can be seen if viewing the figure below from the top?"
 * Answer: 9 — a 3×3 grid footprint.
 *
 * Source: docs/reference/ocr-res/hkimo/heat/primary-2/2025.imgs/004.jpg
 * The figure shows two iso-cube clusters:
 *   Left staircase (x=0): column of stacked cubes, height 2/3/4 from front to back.
 *   Bridge (x=1): single-cube connectors at each y.
 *   Right cluster (x=2): 1/2/2-tall stacks at y=0/1/2.
 *   Combined footprint: all 9 positions of a 3×3 grid.
 *
 * Primitive: IsoCubes from ./primitives/IsoCubes — painter-sorted, SSR-safe.
 * Classification: stem illustration (figure in the question body).
 */

import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel set — 3×3 top-view footprint
// Exported so the explainer can import and annotate it.
// ---------------------------------------------------------------------------

export const HK25P2Q17_CUBES: IsoCube[] = [
  // Left staircase column (x=0): height increases toward back
  { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 },                             // y=0: 2 tall
  { x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 1 }, { x: 0, y: 1, z: 2 },       // y=1: 3 tall
  { x: 0, y: 2, z: 0 }, { x: 0, y: 2, z: 1 }, { x: 0, y: 2, z: 2 }, { x: 0, y: 2, z: 3 }, // y=2: 4 tall

  // Bridge column (x=1): single cubes connecting left staircase to right cluster
  { x: 1, y: 0, z: 0 },
  { x: 1, y: 1, z: 0 },
  { x: 1, y: 2, z: 0 },

  // Right cluster (x=2): varying heights
  { x: 2, y: 0, z: 0 },                                                     // y=0: 1 tall
  { x: 2, y: 1, z: 0 }, { x: 2, y: 1, z: 1 },                             // y=1: 2 tall
  { x: 2, y: 2, z: 0 }, { x: 2, y: 2, z: 1 },                             // y=2: 2 tall
]

// All 9 (x,y) positions of a 3×3 grid are occupied → 9 top-view squares
export const HK25P2Q17_TOP_POSITIONS: [number, number][] = [
  [0, 0], [1, 0], [2, 0],
  [0, 1], [1, 1], [2, 1],
  [0, 2], [1, 2], [2, 2],
]
export const HK25P2Q17_ANSWER = 9

// ---------------------------------------------------------------------------
// Component — stem illustration (does NOT reveal the answer)
// ---------------------------------------------------------------------------

export default function TopViewHK25P2Q17Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'An isometric figure of cube stacks arranged in two groups: a left staircase ' +
        'column (2 to 4 cubes tall) and a right cluster (1 to 2 cubes tall). ' +
        'How many squares are visible when viewed from directly above?'
      }
    >
      <IsoCubes
        cubes={HK25P2Q17_CUBES}
        size={26}
        palette={ISO_BLUE_PALETTE}
        viewPadding={10}
        label="Isometric cube figure — count top squares visible from above"
      />
    </div>
  )
}
