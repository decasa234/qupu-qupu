// Number-triangle pattern for WMI-21P3A-Q11 (2021 Semifinal Grade 3, Paper A).
//
// Redrawn from db/seed/wmi/figures/2021-semifinal-g3-a-q11.jpg: a triangle with
// a number circle at each vertex (top, lower-left, lower-right) and a number in
// a small triangle at the centre. The paper shows three of them:
//   T1: top 5, LL 6, LR 8, centre 3
//   T2: top 11, LL 7, LR 10, centre 8
//   T3: top 7, LL 9, LR 14, centre ?
// Rule: centre = top + lower-left − lower-right.
//   T1: 5 + 6 − 8 = 3 ✓   T2: 11 + 7 − 10 = 8 ✓   T3: 7 + 9 − 14 = 2 (answer A)
//
// The static figure shows the third centre as "?" — it never reveals 2.
import type { CSSProperties } from 'react'

export interface TriData {
  top: number
  ll: number
  lr: number
  /** Centre value, or null for the unknown "?". */
  center: number | null
}

export const TRIS: TriData[] = [
  { top: 5, ll: 6, lr: 8, center: 3 },
  { top: 11, ll: 7, lr: 10, center: 8 },
  { top: 7, ll: 9, lr: 14, center: null },
]

/** The verified rule, exported so the explainer can never drift from it. */
export function triRule(top: number, ll: number, lr: number): number {
  return top + ll - lr
}

export const Q11_ANSWER = triRule(7, 9, 14) // 2

const STROKE = '#1F2937'
const WHITE = '#FFFFFF'
const YELLOW = '#F7CE46'
const VERTEX_R = 22

// One triangle panel is drawn in its own 170-wide column.
const PANEL_W = 170
const PANEL_H = 190
export const Q11_VIEW_W = PANEL_W * 3
export const Q11_VIEW_H = PANEL_H

// Vertex positions inside a panel (local coords).
const TOP: [number, number] = [PANEL_W / 2, 44]
const LL: [number, number] = [44, 150]
const LR: [number, number] = [PANEL_W - 44, 150]
// Centroid for the centre triangle/label.
const CEN: [number, number] = [(TOP[0] + LL[0] + LR[0]) / 3, (TOP[1] + LL[1] + LR[1]) / 3]

function NumberCircle({ x, y, value, highlight }: { x: number; y: number; value: number; highlight?: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r={VERTEX_R} fill={WHITE} stroke={highlight ? '#2f6df0' : STROKE} strokeWidth={highlight ? 3.5 : 2.5} />
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={800} fill={STROKE}>
        {value}
      </text>
    </g>
  )
}

export interface Q11PanelProps {
  tri: TriData
  /** Override the centre label (e.g. reveal the computed value). Falls back to tri.center or "?". */
  centerOverride?: number | null
  /** Highlight the centre triangle (e.g. when it is being solved). */
  highlightCenter?: boolean
  /** Highlight the three vertices (e.g. when reading the inputs). */
  highlightVertices?: boolean
}

/** A single number-triangle, positioned at x-offset `dx`. */
export function Q11Panel({ dx, tri, centerOverride, highlightCenter, highlightVertices }: Q11PanelProps & { dx: number }) {
  const centerVal = centerOverride !== undefined ? centerOverride : tri.center
  // small centre triangle (a scaled-down copy around the centroid)
  const k = 0.42
  const ct: [number, number] = [CEN[0] + (TOP[0] - CEN[0]) * k, CEN[1] + (TOP[1] - CEN[1]) * k]
  const cl: [number, number] = [CEN[0] + (LL[0] - CEN[0]) * k, CEN[1] + (LL[1] - CEN[1]) * k]
  const cr: [number, number] = [CEN[0] + (LR[0] - CEN[0]) * k, CEN[1] + (LR[1] - CEN[1]) * k]
  return (
    <g transform={`translate(${dx} 0)`}>
      {/* outer triangle edges */}
      <polygon points={`${TOP} ${LL} ${LR}`} fill="none" stroke={STROKE} strokeWidth={2.5} />
      {/* centre triangle */}
      <polygon
        points={`${ct} ${cl} ${cr}`}
        fill={YELLOW}
        stroke={highlightCenter ? '#2f6df0' : STROKE}
        strokeWidth={highlightCenter ? 3.5 : 2.5}
      />
      <text x={CEN[0]} y={CEN[1]} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={900} fill={STROKE}>
        {centerVal == null ? '?' : centerVal}
      </text>
      {/* vertex circles drawn last so they sit on top of the edges */}
      <NumberCircle x={TOP[0]} y={TOP[1]} value={tri.top} highlight={highlightVertices} />
      <NumberCircle x={LL[0]} y={LL[1]} value={tri.ll} highlight={highlightVertices} />
      <NumberCircle x={LR[0]} y={LR[1]} value={tri.lr} highlight={highlightVertices} />
    </g>
  )
}

export interface Q11DiagramProps {
  /** Per-panel centre overrides (index 0..2). undefined = use the panel's own value. */
  centerOverrides?: Array<number | null | undefined>
  /** Index of the panel to highlight the centre of. -1 = none. */
  solveIdx?: number
  /** Index of the panel to highlight the vertices of. -1 = none. */
  readIdx?: number
}

export function Q11Diagram({ centerOverrides = [], solveIdx = -1, readIdx = -1 }: Q11DiagramProps) {
  return (
    <svg
      viewBox={`0 0 ${Q11_VIEW_W} ${Q11_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 510, display: 'block', margin: '0 auto' } as CSSProperties}
      aria-hidden="true"
    >
      {TRIS.map((tri, i) => (
        <Q11Panel
          key={i}
          dx={i * PANEL_W}
          tri={tri}
          centerOverride={centerOverrides[i]}
          highlightCenter={i === solveIdx}
          highlightVertices={i === readIdx}
        />
      ))}
    </svg>
  )
}

export default function P21G3Q11Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Three number-triangles. First: 5 top, 6 lower-left, 8 lower-right, 3 centre. Second: 11, 7, 10, centre 8. Third: 7, 9, 14, centre unknown."
    >
      <Q11Diagram />
    </div>
  )
}
