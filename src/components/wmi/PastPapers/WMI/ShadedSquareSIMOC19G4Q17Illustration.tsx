/**
 * ShadedSquareSIMOC19G4Q17Illustration — SIMOC-19-G4-Q17
 *
 * "ABCD adalah persegi dengan panjang sisi 12 cm. Titik L adalah sembarang titik
 * pada sisi AB. Titik H dan I membagi sisi AD menjadi tiga bagian sama. Titik J
 * dan K juga membagi sisi BC menjadi tiga bagian sama. Terakhir, titik G, F, dan
 * E membagi sisi DC menjadi empat bagian sama. Tentukan total luas daerah yang
 * diarsir." → Jawaban: 60 cm².
 *
 * Source: docs/reference/ocr-res/simoc/contest/g4/2019.imgs/011.jpg
 *
 * No primitive matches (custom labeled square with fan-triangles). Fresh SVG.
 *
 * Coordinate system:
 *   SCALE = 25 px/cm, PAD = 40 px on all sides.
 *   svg_x = PAD + x_cm × SCALE
 *   svg_y = PAD + (12 − y_cm) × SCALE   ← y-flip (SVG y increases down)
 *
 * Shaded regions (constant-area proof):
 *   1. Quad  L-H-D-G: area = 2·Lx + 18
 *   2. Tri   L-F-E:   area = 18  (constant)
 *   3. Tri   L-J-K:   area = 24 − 2·Lx
 *   Total = 60 cm² for every Lx ∈ [0, 12].
 */

import React from 'react'

// ── coordinate helpers ────────────────────────────────────────────────────────

export const SCALE = 25
export const PAD   = 40
export const VB    = 12 * SCALE + PAD * 2  // 380

function p(xcm: number, ycm: number): [number, number] {
  return [PAD + xcm * SCALE, PAD + (12 - ycm) * SCALE]
}

/** Named points (svg px). */
export const PT = {
  A: p(0,  0),    // (40, 340) bottom-left corner
  B: p(12, 0),    // (340, 340) bottom-right corner
  C: p(12, 12),   // (340, 40) top-right corner
  D: p(0,  12),   // (40, 40) top-left corner
  H: p(0,  8),    // (40, 140) — 8 cm from A on AD (closer to D, 4 cm from D)
  I: p(0,  4),    // (40, 240) — 4 cm from A on AD
  G: p(3,  12),   // (115, 40) — 3 cm from D on DC
  F: p(6,  12),   // (190, 40) — 6 cm from D on DC
  E: p(9,  12),   // (265, 40) — 9 cm from D on DC
  J: p(12, 8),    // (340, 140) — 8 cm from B on BC (closer to C)
  K: p(12, 4),    // (340, 240) — 4 cm from B on BC
  L: p(6,  0),    // (190, 340) — representative midpoint of AB
}

// ── polygon helpers ───────────────────────────────────────────────────────────

function pp(...pts: [number, number][]): string {
  return pts.map(([x, y]) => `${x},${y}`).join(' ')
}

/** Shaded region polygon-point strings (exported for Explainer reuse). */
export const REGION1 = pp(PT.L, PT.H, PT.D, PT.G)  // quad L-H-D-G
export const REGION2 = pp(PT.L, PT.F, PT.E)          // triangle L-F-E
export const REGION3 = pp(PT.L, PT.J, PT.K)          // triangle L-J-K

/** Fan-line endpoints from L (all division points that L connects to). */
export const FAN_TARGETS: [number, number][] = [
  PT.H, PT.G, PT.F, PT.E, PT.J, PT.K,
]

// ── illustration component ───────────────────────────────────────────────────

const SHADE_FILL = '#94A3B8'
const INK        = '#1E293B'
const FONT       = 'system-ui, sans-serif'

export default function ShadedSquareSIMOC19G4Q17Illustration() {
  const { A, B, C, D, H, I, G, F, E, J, K, L } = PT

  // Division-point dots (corners are implicit from the square border)
  const dots: [number, number][] = [H, I, G, F, E, J, K, L]

  type Anchor = 'start' | 'middle' | 'end'
  const labels: Array<{ t: string; x: number; y: number; a: Anchor }> = [
    { t: 'D', x: D[0] - 6,  y: D[1] - 5,  a: 'end'    },
    { t: 'G', x: G[0],      y: G[1] - 9,  a: 'middle' },
    { t: 'F', x: F[0],      y: F[1] - 9,  a: 'middle' },
    { t: 'E', x: E[0],      y: E[1] - 9,  a: 'middle' },
    { t: 'C', x: C[0] + 6,  y: C[1] - 5,  a: 'start'  },
    { t: 'H', x: H[0] - 8,  y: H[1] + 5,  a: 'end'    },
    { t: 'I', x: I[0] - 8,  y: I[1] + 5,  a: 'end'    },
    { t: 'J', x: J[0] + 8,  y: J[1] + 5,  a: 'start'  },
    { t: 'K', x: K[0] + 8,  y: K[1] + 5,  a: 'start'  },
    { t: 'A', x: A[0] - 6,  y: A[1] + 13, a: 'end'    },
    { t: 'L', x: L[0],      y: L[1] + 14, a: 'middle' },
    { t: 'B', x: B[0] + 6,  y: B[1] + 13, a: 'start'  },
  ]

  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Persegi ABCD sisi 12 cm dengan daerah diarsir: L-H-D-G, L-F-E, dan L-J-K."
    >
      <svg
        viewBox={`0 0 ${VB} ${VB}`}
        width={VB}
        height={VB}
        style={{ display: 'block', maxWidth: '100%' }}
      >
        {/* Layer 1: shaded regions */}
        <polygon points={REGION1} fill={SHADE_FILL} fillOpacity={0.6} />
        <polygon points={REGION2} fill={SHADE_FILL} fillOpacity={0.6} />
        <polygon points={REGION3} fill={SHADE_FILL} fillOpacity={0.6} />

        {/* Layer 2: square border */}
        <rect
          x={D[0]} y={D[1]}
          width={12 * SCALE} height={12 * SCALE}
          fill="none"
          stroke={INK}
          strokeWidth={2}
        />

        {/* Layer 3: fan lines from L to each division point */}
        {FAN_TARGETS.map(([tx, ty], i) => (
          <line
            key={i}
            x1={L[0]} y1={L[1]}
            x2={tx}   y2={ty}
            stroke={INK} strokeWidth={1} strokeOpacity={0.55}
          />
        ))}

        {/* Layer 4: dots at division points and L */}
        {dots.map(([dx, dy], i) => (
          <circle key={i} cx={dx} cy={dy} r={3.5} fill={INK} />
        ))}

        {/* Layer 5: point labels */}
        {labels.map(({ t, x, y, a }, i) => (
          <text
            key={i}
            x={x} y={y}
            fontSize={12}
            fontWeight="700"
            fontFamily={FONT}
            fill={INK}
            textAnchor={a}
          >
            {t}
          </text>
        ))}
      </svg>
    </div>
  )
}
