/**
 * CubeMinSAOSN25KQ23Illustration — OSN-25-SD-KAB-Q23
 *
 * "Sepuluh kubus … disusun sehingga sisinya bersisian …
 *  Luas permukaan minimal … adalah … cm²."   Answer: C (30 cm²)
 *
 * The OCR stem contains two instructional figures:
 *   011.jpg — "Contoh dua kubus yang bersisian" (face-to-face)
 *   012.jpg — "Contoh dua kubus yang tidak bersisian" (edge-only / separated)
 *
 * This component reproduces those two side-by-side panels using IsoCubes.
 * The illustration shows only the PROBLEM concept (what "bersisian" means),
 * never the optimal 30-cm² arrangement (that is revealed in the explainer).
 *
 * Primitive reused: IsoCubes from ./primitives/IsoCubes
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE, ISO_GREY_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel sets — exported so the explainer can reuse them
// ---------------------------------------------------------------------------

/** Two unit cubes sharing a full face (bersisian). */
export const ADJACENT_PAIR: IsoCube[] = [
  { x: 0, y: 0, z: 0 },
  { x: 1, y: 0, z: 0 },
]

/** Two unit cubes touching only at a corner — NOT bersisian. */
export const NON_ADJACENT_PAIR: IsoCube[] = [
  { x: 0, y: 0, z: 0 },
  { x: 1, y: 1, z: 0 },
]

/** Compact arrangement: 2×2×2 block + 2-cube row on one top edge (SA = 30). */
export const COMPACT_10: IsoCube[] = [
  // 2×2×2 base block (z=0 and z=1)
  { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 },
  { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 },
  { x: 0, y: 1, z: 1 }, { x: 1, y: 1, z: 1 },
  // 2-cube row on top of the front face (3 extra contacts → −6 faces)
  { x: 0, y: 0, z: 2 }, { x: 1, y: 0, z: 2 },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CubeMinSAOSN25KQ23Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label={
        'Dua panel: kiri menunjukkan dua kubus yang sisinya bersisian (face-to-face); ' +
        'kanan menunjukkan dua kubus yang tidak bersisian (hanya menyentuh sudut). ' +
        'Sisi yang bersama tersembunyi sehingga tidak dihitung dalam luas permukaan.'
      }
    >
      <div className="flex items-end justify-center gap-8">
        {/* Panel 1 — bersisian */}
        <div className="flex flex-col items-center gap-1">
          <IsoCubes
            cubes={ADJACENT_PAIR}
            size={26}
            palette={ISO_BLUE_PALETTE}
            viewPadding={8}
          />
          <span className="text-center text-xs font-bold text-blue-700">
            Bersisian
          </span>
          <span className="text-center text-[10px] text-slate-500">
            (1 sisi tersembunyi)
          </span>
        </div>

        {/* Divider */}
        <div className="mb-6 h-px w-6 bg-slate-300" />

        {/* Panel 2 — tidak bersisian */}
        <div className="flex flex-col items-center gap-1">
          <IsoCubes
            cubes={NON_ADJACENT_PAIR}
            size={26}
            palette={ISO_GREY_PALETTE}
            viewPadding={8}
          />
          <span className="text-center text-xs font-bold text-slate-500">
            Tidak bersisian
          </span>
          <span className="text-center text-[10px] text-slate-400">
            (semua sisi terbuka)
          </span>
        </div>
      </div>
    </div>
  )
}
