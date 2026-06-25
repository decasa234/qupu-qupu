// HKIMO-20-P2H-Q20 — "By observing the pattern, how many edges does the 6th figure have?"
//
// PROBLEM ONLY: shows the first three figures of the polygon-ear sequence.
// Each figure is a pentagon with triangular "ears" added to successive edges:
//   Figure 1: pentagon + 1 ear  → 6 edges
//   Figure 2: pentagon + 2 ears → 7 edges
//   Figure 3: pentagon + 3 ears → 8 edges
// Formula: figure n has n + 5 edges.  Figure 6 → 11. (answer: 11)
//
// Does NOT reveal the 6th figure or the answer.
// Pure SVG — no hooks, no Date, SSR-safe.

// ── layout ────────────────────────────────────────────────────────────────────
export const SVG_W = 560
export const SVG_H = 168

// Panel width; panels placed at x-offsets DX[0..2]
const PANEL_W = 180
export const DX: readonly [number, number, number] = [0, 190, 380]

// ── colour tokens ─────────────────────────────────────────────────────────────
const INK = '#1F2937'
const BLUE = '#30598A'
const FILL = '#EFF6FF'
const STROKE = '#1F2937'
const SEP = '#D1D5DB'

// ── Pentagon base vertices (panel-local coords) ───────────────────────────────
// Five sides: bottom, lower-right, upper-right, upper-left, left.
// These form the underlying 5-edge base.
type Pt = readonly [number, number]
const P1: Pt = [25, 130]   // bottom-left
const P2: Pt = [145, 130]  // bottom-right
const P3: Pt = [165, 85]   // right
const P4: Pt = [85, 35]    // top
const P5: Pt = [5, 85]     // left

// ── Triangle apex points (outward, perpendicular bisector of each edge) ────────
// Computed: midpoint + outward-normal unit × 25
// APX4: edge P4→P5 (upper-left), pushes upper-left
export const APX4: Pt = [32, 39]
// APX3: edge P3→P4 (upper-right), pushes upper-right
export const APX3: Pt = [138, 39]
// APX2: edge P2→P3 (lower-right), pushes right
export const APX2: Pt = [173, 116]

// ── Boundary polygon paths ─────────────────────────────────────────────────────
function pts2path(pts: readonly Pt[]): string {
  return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ') + ' Z'
}

// 6 edges: replace E4 (P4→P5) with two triangle sides via APX4
export const PATH1 = pts2path([P1, P2, P3, P4, APX4, P5])

// 7 edges: replace E3 (P3→P4) and E4 (P4→P5)
export const PATH2 = pts2path([P1, P2, P3, APX3, P4, APX4, P5])

// 8 edges: replace E2 (P2→P3), E3 (P3→P4), E4 (P4→P5)
export const PATH3 = pts2path([P1, P2, APX2, P3, APX3, P4, APX4, P5])

// ── Static illustration ────────────────────────────────────────────────────────

interface PanelProps {
  path: string
  figNum: number
  edgeCount: number
  highlight?: boolean
}

function Panel({ path, figNum, edgeCount, highlight = false }: PanelProps) {
  const fill = highlight ? '#DBEAFE' : FILL
  const strokeColor = highlight ? BLUE : STROKE
  const strokeW = highlight ? 2.5 : 2
  return (
    <>
      <path d={path} fill={fill} stroke={strokeColor} strokeWidth={strokeW} strokeLinejoin="round" />
      {/* Figure number centred inside polygon */}
      <text
        x={85}
        y={100}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="sans-serif"
        fontSize="22"
        fontWeight="800"
        fill={highlight ? BLUE : INK}
        opacity="0.18"
      >
        {figNum}
      </text>
      {/* Figure number label below */}
      <text
        x={PANEL_W / 2}
        y={147}
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize="12"
        fontWeight="700"
        fill={BLUE}
      >
        {figNum}
      </text>
      {/* Edge count */}
      <text
        x={PANEL_W / 2}
        y={161}
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize="11"
        fill={INK}
      >
        {edgeCount} {edgeCount === 6 ? 'sisi / edges' : edgeCount === 7 ? 'sisi / edges' : 'sisi / edges'}
      </text>
    </>
  )
}

const FIGURES = [
  { path: PATH1, figNum: 1, edgeCount: 6 },
  { path: PATH2, figNum: 2, edgeCount: 7 },
  { path: PATH3, figNum: 3, edgeCount: 8 },
] as const

export default function PolyEarSeqHK20P2Q20Illustration({
  highlightPanel,
}: {
  highlightPanel?: 1 | 2 | 3 | null
} = {}) {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Tiga bangun pertama dari pola: Bangun 1 punya 6 sisi, Bangun 2 punya 7 sisi, Bangun 3 punya 8 sisi / First three figures of the pattern: Figure 1 has 6 edges, Figure 2 has 7 edges, Figure 3 has 8 edges"
    >
      {FIGURES.map(({ path, figNum, edgeCount }, i) => (
        <g key={figNum} transform={`translate(${DX[i]}, 0)`}>
          <Panel
            path={path}
            figNum={figNum}
            edgeCount={edgeCount}
            highlight={highlightPanel === figNum}
          />
        </g>
      ))}
      <line x1={185} y1={5} x2={185} y2={140} stroke={SEP} strokeWidth={1} />
      <line x1={375} y1={5} x2={375} y2={140} stroke={SEP} strokeWidth={1} />
    </svg>
  )
}
