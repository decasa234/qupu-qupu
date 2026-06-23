// SEAMO-17-A-Q8 — "At least how many cubes are there in the figure below?"
// Answer: A (9 cubes).
//
// The figure shows a 3-step staircase of yellow cubes in isometric projection.
// Reconstructed as:
//
//   z=0 (bottom layer, 6 cubes) — 3-wide × 2-deep base:
//     (0,0,0) (1,0,0) (2,0,0)   front row
//     (0,1,0) (1,1,0) (2,1,0)   back row
//
//   z=1 (second layer, 2 cubes) — front 2 of the left side:
//     (0,0,1) (1,0,1)
//
//   z=2 (top layer, 1 cube) — leftmost pillar top:
//     (0,0,2)
//
//   Total minimum = 6 + 2 + 1 = 9 cubes  ✓
//
// "At least" means: no floating cubes, each cube in the upper layers is directly
// supported; hidden positions not visible from the front are assumed empty.
//
// Reuses the IsoCubes primitive from ./primitives/IsoCubes — paint-order sorted,
// SSR-safe pure SVG.

import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube, IsoPalette } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Palette — warm gold matching the original competition paper
// ---------------------------------------------------------------------------

const GOLD_PALETTE: IsoPalette = {
  top:         '#F5C842',
  left:        '#C8941A',
  right:       '#A07010',
  ink:         '#1F2937',
  strokeWidth: 1.3,
}

// ---------------------------------------------------------------------------
// Voxel set — 9 cubes minimum staircase
// ---------------------------------------------------------------------------

export const SEAMO17A8_CUBES: IsoCube[] = [
  // z=0 base layer (6 cubes — 3 wide × 2 deep)
  { x: 0, y: 0, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 2, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 1, y: 1, z: 0 },
  { x: 2, y: 1, z: 0 },
  // z=1 second layer (2 cubes — front-left pair)
  { x: 0, y: 0, z: 1 },
  { x: 1, y: 0, z: 1 },
  // z=2 top (1 cube — leftmost column top)
  { x: 0, y: 0, z: 2 },
]

export const SEAMO17A8_MIN_COUNT = 9

// ---------------------------------------------------------------------------
// Default export — stem illustration
// ---------------------------------------------------------------------------

export default function StairCubes17A8Figure() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'A 3-step staircase made of yellow cubes in isometric view. ' +
        'The bottom layer has 6 cubes arranged in a 3-wide by 2-deep grid. ' +
        'The second layer has 2 cubes on the left-front side. ' +
        'The top layer has 1 cube on the far-left column. ' +
        'The minimum total is 9 cubes.'
      }
    >
      <IsoCubes
        cubes={SEAMO17A8_CUBES}
        size={28}
        palette={GOLD_PALETTE}
        viewPadding={10}
        label="Staircase of cubes — at least 9 cubes"
      />
    </div>
  )
}
