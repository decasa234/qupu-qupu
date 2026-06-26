// CrownFanSASMO20G3Q18Illustration.tsx
//
// SASMO-20-G3-Q18 — "Berapa banyak segitiga yang terdapat dalam gambar di bawah ini?"
// Answer: 30
//
// Source figure (2020.imgs/015.jpg / 2019-2020.imgs/045.jpg):
// A symmetric crown/fan shape built from 6 fan lines (3 from each base corner)
// going to 3 peaks — left-peak, center-peak (tallest), right-peak — plus a
// horizontal base. The lines cross inside, creating triangular regions that
// total 30 when counted by every size (7+10+6+5+2=30).
//
// Pure SVG, SSR-safe — no hooks, no framer-motion, no window/document.

const VW = 220
const VH = 190

// ─── Vertex coordinates ───────────────────────────────────────────────────────
const BL = { x: 10,  y: 175 } // bottom-left corner
const BR = { x: 210, y: 175 } // bottom-right corner
const LP = { x: 45,  y: 25  } // left peak
const CP = { x: 110, y: 8   } // center peak (tallest)
const RP = { x: 175, y: 25  } // right peak (mirror of LP)

// ─── The 7 line segments forming the crown figure ────────────────────────────
// 3 fan lines from BL, 3 from BR (mirror), plus base
export const CROWN_LINES: readonly [number, number, number, number][] = [
  [BL.x, BL.y, LP.x, LP.y], // BL → LP  (outer left boundary)
  [BL.x, BL.y, CP.x, CP.y], // BL → CP  (left-to-center fan)
  [BL.x, BL.y, RP.x, RP.y], // BL → RP  (long crossing diagonal)
  [BR.x, BR.y, LP.x, LP.y], // BR → LP  (long crossing diagonal, mirror)
  [BR.x, BR.y, CP.x, CP.y], // BR → CP  (right-to-center fan, mirror)
  [BR.x, BR.y, RP.x, RP.y], // BR → RP  (outer right boundary)
  [BL.x, BL.y, BR.x, BR.y], // base
] as const

// ─── Highlight groups ─────────────────────────────────────────────────────────
export type HighlightGroup = 'small' | 'medium' | 'large' | 'xlarge' | null

const GROUP_COLOR: Record<NonNullable<HighlightGroup>, string> = {
  small:  'rgba(16,185,129,0.22)',  // green
  medium: 'rgba(245,158,11,0.22)', // amber
  large:  'rgba(99,102,241,0.22)', // indigo
  xlarge: 'rgba(236,72,153,0.22)', // pink
}

// ─── Colours ──────────────────────────────────────────────────────────────────
const STROKE  = '#1A3A6B'
const FILL_BG = '#EBF4FF'

// ─── Shared figure component (reused by explainer) ───────────────────────────

export interface CrownFanSASMO20G3Q18FigureProps {
  highlightGroup?: HighlightGroup
}

export function CrownFanSASMO20G3Q18Figure({
  highlightGroup = null,
}: CrownFanSASMO20G3Q18FigureProps) {
  const hColor = highlightGroup ? GROUP_COLOR[highlightGroup] : null

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: VW, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Background */}
      <rect width={VW} height={VH} fill={FILL_BG} rx={6} />

      {/* Highlight wash over the crown area */}
      {hColor && (
        <polygon
          points={`${BL.x},${BL.y} ${LP.x},${LP.y} ${CP.x},${CP.y} ${RP.x},${RP.y} ${BR.x},${BR.y}`}
          fill={hColor}
        />
      )}

      {/* Crown lines */}
      {CROWN_LINES.map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1} y1={y1}
          x2={x2} y2={y2}
          stroke={STROKE}
          strokeWidth={2}
          strokeLinecap="round"
        />
      ))}

      {/* Peak dots */}
      {[LP, CP, RP].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={STROKE} />
      ))}
    </svg>
  )
}

// ─── Default export — static illustration ────────────────────────────────────

export default function CrownFanSASMO20G3Q18Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Gambar mahkota/kipas: 6 garis diagonal dari 2 titik dasar menuju 3 puncak, ' +
        'saling bersilangan dan membentuk banyak segitiga. Total ada 30 segitiga.'
      }
    >
      <CrownFanSASMO20G3Q18Figure />
    </div>
  )
}
