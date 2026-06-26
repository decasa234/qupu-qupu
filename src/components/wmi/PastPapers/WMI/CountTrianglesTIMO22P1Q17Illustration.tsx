// CountTrianglesTIMO22P1Q17Illustration.tsx
//
// TIMO-22-P1H-Q17 — "How many triangle(s) is / are there in the figure below?"
// Source figure: docs/reference/ocr-res/timo/bundle/primary-1/2020-2022.imgs/097.jpg
//
// Three overlapping isosceles triangles on a shared baseline, arranged left-to-right.
// The right leg of the left triangle and the left leg of the centre triangle cross (I1).
// The right leg of the centre triangle and the left leg of the right triangle cross (I2).
//
// Pure SVG, SSR-safe — no hooks, no framer-motion, no window/document.

const VW = 280
const VH = 160

// ─── Vertex coordinates ───────────────────────────────────────────────────────
const BL = { x: 5,   y: 150 } // bottom-left corner
const BR = { x: 275, y: 150 } // bottom-right corner
const LP = { x: 82,  y: 8   } // left peak
const CP = { x: 140, y: 2   } // centre peak (tallest)
const RP = { x: 198, y: 8   } // right peak (mirror of LP)

// Base footing points of each triangle's inner leg
const B1 = { x: 160, y: 150 } // right foot of left triangle
const B2 = { x: 92,  y: 150 } // left  foot of centre triangle
const B3 = { x: 188, y: 150 } // right foot of centre triangle
const B4 = { x: 120, y: 150 } // left  foot of right triangle

// ─── The 7 line segments forming the figure ───────────────────────────────────
const LINES: readonly [number, number, number, number][] = [
  [BL.x, BL.y, LP.x, LP.y],  // BL → LP  (left outer leg)
  [LP.x, LP.y, B1.x, B1.y],  // LP → B1  (right leg of left triangle — crosses B2→CP)
  [B2.x, B2.y, CP.x, CP.y],  // B2 → CP  (left leg of centre triangle)
  [CP.x, CP.y, B3.x, B3.y],  // CP → B3  (right leg of centre triangle — crosses B4→RP)
  [B4.x, B4.y, RP.x, RP.y],  // B4 → RP  (left leg of right triangle)
  [RP.x, RP.y, BR.x, BR.y],  // RP → BR  (right outer leg)
  [BL.x, BL.y, BR.x, BR.y],  // baseline
] as const

// ─── Colours ──────────────────────────────────────────────────────────────────
const STROKE  = '#1A3A6B'
const FILL_BG = '#EBF4FF'

// ─── Default export — static illustration ────────────────────────────────────

export default function CountTrianglesTIMO22P1Q17Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Tiga segitiga yang saling tumpang tindih di atas garis dasar bersama, ' +
        'membentuk berbagai ukuran segitiga yang dapat dihitung.'
      }
    >
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        style={{ maxWidth: VW, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* Background */}
        <rect width={VW} height={VH} fill={FILL_BG} rx={6} />

        {/* Figure lines */}
        {LINES.map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1} y1={y1}
            x2={x2} y2={y2}
            stroke={STROKE}
            strokeWidth={2}
            strokeLinecap="round"
          />
        ))}
      </svg>
    </div>
  )
}
