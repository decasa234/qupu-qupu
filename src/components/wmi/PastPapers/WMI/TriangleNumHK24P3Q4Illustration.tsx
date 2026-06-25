// TriangleNumHK24P3Q4Illustration — HKIMO-24-P3H-Q4
//
// "According to the pattern shown below, what is the missing number?"
// Three triangles in a row; each has a number at the top apex and two numbers
// at the bottom-left and bottom-right corners.
//   T1: top=60, left=7, right=9  → rule: top = left × right − 3
//   T2: top=29, left=8, right=4  → confirms rule
//   T3: top=?,  left=5, right=9  → answer = 42 (NOT shown here — stem only)
//
// Pure SVG — no hooks, no framer-motion — SSR-safe.
// Co-exports TriangleNumHK24P3Q4Figure for the explainer.

export interface TriangleData {
  top: string
  left: string
  right: string
  highlight?: boolean
  revealTop?: boolean   // when true, top shows the answer value (explainer only)
  topOverride?: string  // override top label (e.g. to show "42" in explainer)
}

interface FigureProps {
  triangles: TriangleData[]
  width?: number
  height?: number
}

const CX = [65, 195, 325]   // x-centres for each triangle
const APEX_Y = 30           // apex y
const BASE_Y = 150          // base y
const HALF_BASE = 55        // half-width of base

function TriangleShape({
  cx,
  highlight,
}: {
  cx: number
  highlight?: boolean
}) {
  const ax = cx
  const ay = APEX_Y
  const bl_x = cx - HALF_BASE
  const bl_y = BASE_Y
  const br_x = cx + HALF_BASE
  const br_y = BASE_Y
  const pts = `${ax},${ay} ${bl_x},${bl_y} ${br_x},${br_y}`
  return (
    <polygon
      points={pts}
      fill={highlight ? '#FFF3E0' : 'white'}
      stroke={highlight ? '#F59E0B' : '#1E293B'}
      strokeWidth={highlight ? 3 : 2.5}
    />
  )
}

function TriangleLabels({
  cx,
  data,
}: {
  cx: number
  data: TriangleData
}) {
  const topLabel = data.topOverride ?? data.top
  return (
    <g fontFamily="sans-serif" fontWeight="700" textAnchor="middle">
      {/* top apex */}
      <text
        x={cx}
        y={APEX_Y - 12}
        fontSize={22}
        fill={data.topOverride ? '#10B981' : '#1E293B'}
      >
        {topLabel}
      </text>
      {/* bottom-left */}
      <text x={cx - HALF_BASE - 14} y={BASE_Y + 18} fontSize={22} fill="#1E293B">
        {data.left}
      </text>
      {/* bottom-right */}
      <text x={cx + HALF_BASE + 14} y={BASE_Y + 18} fontSize={22} fill="#1E293B">
        {data.right}
      </text>
    </g>
  )
}

export function TriangleNumHK24P3Q4Figure({ triangles, width = 390, height = 185 }: FigureProps) {
  return (
    <svg
      viewBox={`0 0 390 185`}
      width={width}
      height={height}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      {triangles.map((t, i) => (
        <g key={i}>
          <TriangleShape cx={CX[i]} highlight={t.highlight} />
          <TriangleLabels cx={CX[i]} data={t} />
        </g>
      ))}
    </svg>
  )
}

// ── Stem illustration (default export) ────────────────────────────────────────
// Shows the problem: T1 and T2 are complete; T3 has "?" at the top.

const STEM_TRIANGLES: TriangleData[] = [
  { top: '60', left: '7', right: '9' },
  { top: '29', left: '8', right: '4' },
  { top: '?',  left: '5', right: '9' },
]

export default function TriangleNumHK24P3Q4Illustration() {
  return (
    <div className="flex justify-center py-2">
      <TriangleNumHK24P3Q4Figure triangles={STEM_TRIANGLES} />
    </div>
  )
}
