// ParaTrianglesSIMOC22G1Q8Illustration — SIMOC-22-G1-Q8
//
// Figure: a parallelogram divided by two full diagonals + a horizontal midline
// through the intersection point → 12 distinct triangles total.
// Answer: B (12). Primary language: Indonesian.
//
// Copy-adapted from TrianglesX22A7Illustration (same count-triangles beat
// structure; figure changed from equilateral grid to parallelogram+cross+midline).
// SSR-safe: no hooks, no framer-motion.

const STROKE   = '#1E3A5F'
const FILL_BG  = '#EFF6FF'
const HI_FILL  = 'rgba(16,185,129,0.28)'
const HI_STROKE = '#10B981'

// ── Parallelogram ABCD (true parallelogram: A+C = B+D) ───────────────────────
const SVG_W = 360
const SVG_H = 220

// Outer vertices
const AX = 60,  AY = 20   // top-left
const BX = 260, BY = 20   // top-right
const CX = 300, CY = 180  // bottom-right
const DX = 100, DY = 180  // bottom-left

// Derived: midpoints and centre
const EX = (AX + DX) / 2, EY = (AY + DY) / 2   // 80, 100 — mid-left
const FX = (BX + CX) / 2, FY = (BY + CY) / 2   // 280, 100 — mid-right
const OX = (AX + CX) / 2, OY = (AY + CY) / 2   // 180, 100 — centre

// ── Triangle descriptors ──────────────────────────────────────────────────────

type Tri = { pts: string; key: string }

function tri(key: string, ...coords: [number, number][]): Tri {
  return { key, pts: coords.map(([x, y]) => `${x},${y}`).join(' ') }
}

// Group 0 — 6 basic (small) triangles
const BASIC: Tri[] = [
  tri('ABO', [AX, AY], [BX, BY], [OX, OY]),
  tri('AEO', [AX, AY], [EX, EY], [OX, OY]),
  tri('BFO', [BX, BY], [FX, FY], [OX, OY]),
  tri('DEO', [DX, DY], [EX, EY], [OX, OY]),
  tri('DCO', [DX, DY], [CX, CY], [OX, OY]),
  tri('CFO', [CX, CY], [FX, FY], [OX, OY]),
]

// Group 1 — 2 medium triangles (each = 2 basic ones)
const MEDIUM: Tri[] = [
  tri('ADO', [AX, AY], [DX, DY], [OX, OY]),   // left side + centre
  tri('BCO', [BX, BY], [CX, CY], [OX, OY]),   // right side + centre
]

// Group 2 — 4 large triangles (each = 3 basic ones)
const LARGE: Tri[] = [
  tri('ABD', [AX, AY], [BX, BY], [DX, DY]),
  tri('ABC', [AX, AY], [BX, BY], [CX, CY]),
  tri('ACD', [AX, AY], [CX, CY], [DX, DY]),
  tri('BCD', [BX, BY], [CX, CY], [DX, DY]),
]

export const PARA_TRI_GROUPS: { label: string; tris: Tri[] }[] = [
  { label: 'basic',  tris: BASIC  },
  { label: 'medium', tris: MEDIUM },
  { label: 'large',  tris: LARGE  },
]

export const PARA_TRI_TOTAL = 12

// ── Shared SVG figure ─────────────────────────────────────────────────────────

export interface ParaTrianglesFigureProps {
  /** Index into PARA_TRI_GROUPS to highlight; null = none. */
  highlightGroup?: number | null
}

export function ParaTrianglesSIMOC22G1Q8Figure({
  highlightGroup = null,
}: ParaTrianglesFigureProps) {
  const hiTris =
    highlightGroup != null ? (PARA_TRI_GROUPS[highlightGroup]?.tris ?? []) : []

  const outer = `${AX},${AY} ${BX},${BY} ${CX},${CY} ${DX},${DY}`

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* background */}
      <polygon points={outer} fill={FILL_BG} stroke="none" />

      {/* highlight fills */}
      {hiTris.map((t) => (
        <polygon key={`hf-${t.key}`} points={t.pts} fill={HI_FILL} />
      ))}

      {/* interior lines: diagonal AC, diagonal BD, midline EF */}
      <line x1={AX} y1={AY} x2={CX} y2={CY} stroke={STROKE} strokeWidth={1.8} />
      <line x1={BX} y1={BY} x2={DX} y2={DY} stroke={STROKE} strokeWidth={1.8} />
      <line x1={EX} y1={EY} x2={FX} y2={FY} stroke={STROKE} strokeWidth={1.8} />

      {/* outer border */}
      <polygon
        points={outer}
        fill="none"
        stroke={STROKE}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* highlight outlines */}
      {hiTris.map((t) => (
        <polygon
          key={`hb-${t.key}`}
          points={t.pts}
          fill="none"
          stroke={HI_STROKE}
          strokeWidth={3}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}

// ── Default export: stem illustration ────────────────────────────────────────

export default function ParaTrianglesSIMOC22G1Q8Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Jajaran genjang yang dibagi oleh dua diagonal dan satu garis tengah horizontal, membentuk 12 segitiga berbeda."
    >
      <ParaTrianglesSIMOC22G1Q8Figure />
    </div>
  )
}
