// HKIMO-20-P1H-Q16 — "Figure 1 has 7 cubes. How many cubes in Figure 2?"
//
// Shows both figures side-by-side (problem only — does NOT reveal the answer 21).
// Figure 1: 7-cube L-staircase (3 front + 2 back + 2 elevated at back).
// Figure 2: same L-staircase stretched ×3 in x → 9 front + 6 back + 6 upper = 21 cubes.
//
// Uses the IsoCubes primitive (ISO_BLUE_PALETTE, SSR-safe, no framer-motion).

import { IsoCubes } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ── cube definitions (exported so the explainer can reuse them) ────────────────

/**
 * Figure 1: 7 cubes — an L-staircase.
 *   Ground (z=0): front row y=0 (x=0,1,2) + back row y=1 (x=0,1)  → 5 cubes
 *   Upper (z=1):  back row y=1 (x=0,1)                              → 2 cubes
 */
export const FIG1_CUBES: IsoCube[] = [
  { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 },
  { x: 0, y: 1, z: 1 }, { x: 1, y: 1, z: 1 },
]

/**
 * Figure 2: 21 cubes — same shape, ×3 in the x-axis.
 *   Ground front (z=0, y=0): x = 0..8  → 9 cubes
 *   Ground back  (z=0, y=1): x = 0..5  → 6 cubes
 *   Upper back   (z=1, y=1): x = 0..5  → 6 cubes
 */
export const FIG2_CUBES: IsoCube[] = [
  ...Array.from({ length: 9 }, (_, i) => ({ x: i, y: 0, z: 0 } as IsoCube)),
  ...Array.from({ length: 6 }, (_, i) => ({ x: i, y: 1, z: 0 } as IsoCube)),
  ...Array.from({ length: 6 }, (_, i) => ({ x: i, y: 1, z: 1 } as IsoCube)),
]

// ── component ──────────────────────────────────────────────────────────────────

interface Props {
  lang?: 'en' | 'id'
}

export default function CubeScaleHK20P1Q16Illustration({ lang = 'en' }: Props) {
  const id = lang === 'id'
  return (
    <div
      style={{
        display: 'flex',
        gap: 28,
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '8px 4px',
      }}
    >
      {/* Figure 1 */}
      <div style={{ textAlign: 'center' }}>
        <IsoCubes
          cubes={FIG1_CUBES}
          size={22}
          cellGap={1}
          label={id ? 'Bangun 1 — 7 kubus' : 'Figure 1 — 7 cubes'}
        />
        <div style={{ fontSize: 12, marginTop: 6, color: '#374151', fontWeight: 600 }}>
          {id ? 'Bangun 1' : 'Figure 1'}
        </div>
      </div>

      {/* Figure 2 */}
      <div style={{ textAlign: 'center' }}>
        <IsoCubes
          cubes={FIG2_CUBES}
          size={13}
          cellGap={1}
          label={id ? 'Bangun 2 — jumlah kubus?' : 'Figure 2 — how many cubes?'}
        />
        <div style={{ fontSize: 12, marginTop: 6, color: '#374151', fontWeight: 600 }}>
          {id ? 'Bangun 2' : 'Figure 2'}
        </div>
      </div>
    </div>
  )
}
