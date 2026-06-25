// DotPattern21A24Fig — SEAMO 2021 Paper A Q24
// "How many dots are there in the 10th pattern?"
//
// The stem shows 4 triangular dot patterns:
//   Pattern 1 → 1 dot  (T(1) = 1)
//   Pattern 2 → 3 dots (T(2) = 3)
//   Pattern 3 → 6 dots (T(3) = 6)
//   Pattern 4 → 10 dots (T(4) = 10)
//
// Triangular number formula: T(n) = n(n+1)/2.  T(10) = 55.
//
// Classification: STEM (illustration in question stem; fill-in answer = 55)
//
// Pure SVG, SSR-safe — no hooks, no framer-motion, no window/document.

// ── Colour tokens ─────────────────────────────────────────────────────────────

const DOT_FILL   = '#F59E0B'   // amber-400  — matches warm competition style
const DOT_STROKE = '#B45309'   // amber-700
const BG         = '#FFFBF0'   // warm off-white
const LABEL_COL  = '#1F2937'   // gray-900
const QUES_COL   = '#6B7280'   // gray-500  — for the "(4)" label with question mark
const RING_COL   = '#2563EB'   // blue-600  — for explainer highlight

// ── Layout ───────────────────────────────────────────────────────────────────

const R          = 7    // dot radius
const D          = R * 2  // dot diameter
const H_SPACING  = 20   // horizontal gap between dot centres (within a row)
const V_SPACING  = 17   // vertical gap between rows of dots
const PAD        = 14   // outer padding around each pattern cell
const CELL_PAD   = 8    // inner padding inside each pattern cell
const LABEL_H    = 18   // height reserved below dots for "(n)" label
const GAP_BETWEEN = 20  // gap between pattern cells

// Compute bounding box of dots for triangular pattern n.
// Rows (from bottom): row k has k dots, for k = 1..n
// We draw top row first (1 dot), bottom row last (n dots).
function dotPositions(n: number): { cx: number; cy: number }[] {
  const dots: { cx: number; cy: number }[] = []
  // Total rows = n.  Row k (1-indexed from top) has k dots.
  for (let row = 1; row <= n; row++) {
    const dotsInRow = row
    // Centre the row horizontally — maximum row (n) occupies n*D + (n-1)*(H_SPACING-D) = n*H_SPACING - (H_SPACING-D)
    // Actually: row width = dotsInRow * D + (dotsInRow - 1) * (H_SPACING - D) if H_SPACING > D
    // Simpler: place dots at cx = i * H_SPACING for i in [0, dotsInRow-1], then offset to centre
    const maxRowWidth = (n - 1) * H_SPACING
    const thisRowWidth = (dotsInRow - 1) * H_SPACING
    const offsetX = (maxRowWidth - thisRowWidth) / 2
    for (let col = 0; col < dotsInRow; col++) {
      dots.push({
        cx: offsetX + col * H_SPACING,
        cy: (row - 1) * V_SPACING,
      })
    }
  }
  return dots
}

// Cell intrinsic size (without PAD) for pattern n
function cellInner(n: number) {
  const dots = dotPositions(n)
  const maxCx = Math.max(...dots.map((d) => d.cx))
  const maxCy = Math.max(...dots.map((d) => d.cy))
  const w = maxCx + D
  const h = maxCy + D
  return { w, h }
}

// The 4 patterns shown in the stem
const PATTERNS = [1, 2, 3, 4]

// Precompute cell widths so we can lay them out side-by-side
const CELL_SIZES = PATTERNS.map((n) => {
  const { w, h } = cellInner(n)
  return {
    n,
    innerW: w,
    innerH: h,
    totalW: Math.max(w, 32) + CELL_PAD * 2,  // at least 32px wide
  }
})

const MAX_INNER_H = Math.max(...CELL_SIZES.map((c) => c.innerH))

const SVG_W =
  PAD * 2 +
  CELL_SIZES.reduce((sum, c) => sum + c.totalW, 0) +
  GAP_BETWEEN * (PATTERNS.length - 1)

const SVG_H = PAD * 2 + MAX_INNER_H + D + LABEL_H + 4

// ── Pattern cell component ────────────────────────────────────────────────────

function PatternCell({
  n,
  x,
  highlighted,
  showCount,
}: {
  n: number
  x: number
  highlighted?: boolean
  showCount?: boolean
}) {
  const { innerW, innerH, totalW } = CELL_SIZES[n - 1]
  const cellH = SVG_H - PAD * 2
  const dots = dotPositions(n)
  const count = (n * (n + 1)) / 2

  // Centre dots horizontally within cell
  const dotOffsetX = x + CELL_PAD + (Math.max(innerW, 32) - innerW) / 2 + R
  // Vertically align dots to the bottom of the dot area (so all patterns share a common baseline)
  const dotOffsetY = PAD + (MAX_INNER_H - innerH) + R

  return (
    <g>
      {/* Cell background + optional highlight ring */}
      <rect
        x={x}
        y={PAD}
        width={totalW}
        height={cellH}
        rx={6}
        fill={highlighted ? '#EFF6FF' : '#FDF8EE'}
        stroke={highlighted ? RING_COL : '#E5E7EB'}
        strokeWidth={highlighted ? 2 : 1}
      />

      {/* Dots */}
      {dots.map(({ cx, cy }, i) => (
        <circle
          key={`dot-${n}-${i}`}
          cx={dotOffsetX + cx}
          cy={dotOffsetY + cy}
          r={R}
          fill={DOT_FILL}
          stroke={DOT_STROKE}
          strokeWidth={1}
        />
      ))}

      {/* Label: "(n)" or "(n) = count" */}
      <text
        x={x + totalW / 2}
        y={PAD + MAX_INNER_H + D + LABEL_H - 2}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize={12}
        fontWeight={600}
        fill={highlighted ? RING_COL : LABEL_COL}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        ({n}){showCount ? ` = ${count}` : ''}
      </text>
    </g>
  )
}

// ── Figure (reusable by explainer) ───────────────────────────────────────────

export interface DotPattern21A24FigureProps {
  /** 1-indexed pattern to highlight (null = none) */
  highlightPattern?: number | null
  /** If true, show dot counts next to each label */
  showCounts?: boolean
}

export function DotPattern21A24Figure({
  highlightPattern = null,
  showCounts = false,
}: DotPattern21A24FigureProps) {
  // Compute x offsets for each cell
  const xOffsets: number[] = []
  let curX = PAD
  for (const { totalW } of CELL_SIZES) {
    xOffsets.push(curX)
    curX += totalW + GAP_BETWEEN
  }

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <rect width={SVG_W} height={SVG_H} fill={BG} rx={8} />

      {PATTERNS.map((n, idx) => (
        <PatternCell
          key={`pat-${n}`}
          n={n}
          x={xOffsets[idx]}
          highlighted={highlightPattern === n}
          showCount={showCounts}
        />
      ))}
    </svg>
  )
}

// ── Explainer (animated step-through) ────────────────────────────────────────

export function DotPattern21A24Explainer() {
  // SSR-safe: no useState/useEffect — pure static multi-step layout
  // Shows all 4 patterns with counts, plus an extrapolation row for n=10.
  const xOffsets: number[] = []
  let curX = PAD
  for (const { totalW } of CELL_SIZES) {
    xOffsets.push(curX)
    curX += totalW + GAP_BETWEEN
  }

  // Extra row below: formula and answer
  const FORMULA_Y = SVG_H + 16
  const EXPL_H    = SVG_H + 56

  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Four triangular dot patterns: pattern 1 has 1 dot, pattern 2 has 3 dots, ' +
        'pattern 3 has 6 dots, pattern 4 has 10 dots. ' +
        'The triangular number formula gives pattern 10 = 10 × 11 ÷ 2 = 55 dots.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${EXPL_H}`}
        width="100%"
        style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        <rect width={SVG_W} height={EXPL_H} fill={BG} rx={8} />

        {/* 4 patterns with counts shown */}
        {PATTERNS.map((n, idx) => (
          <PatternCell
            key={`pat-${n}`}
            n={n}
            x={xOffsets[idx]}
            showCount
          />
        ))}

        {/* Formula line */}
        <text
          x={SVG_W / 2}
          y={FORMULA_Y}
          textAnchor="middle"
          fontSize={13}
          fontWeight={600}
          fill={LABEL_COL}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          T(n) = n × (n + 1) ÷ 2
        </text>

        {/* Answer line */}
        <text
          x={SVG_W / 2}
          y={FORMULA_Y + 22}
          textAnchor="middle"
          fontSize={14}
          fontWeight={800}
          fill={RING_COL}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          T(10) = 10 × 11 ÷ 2 = 55
        </text>
      </svg>
    </div>
  )
}

// ── Default export — static stem illustration ─────────────────────────────────

export default function DotPattern21A24Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Four triangular dot patterns numbered (1) through (4). ' +
        'Pattern 1 has 1 dot, pattern 2 has 3 dots arranged in a triangle, ' +
        'pattern 3 has 6 dots, and pattern 4 has 10 dots. ' +
        'Find how many dots are in the 10th pattern.'
      }
    >
      <DotPattern21A24Figure />
    </div>
  )
}

// ── Registry entry (paste into registry.ts — do NOT edit here) ───────────────
//
//   'SEAMO-21-A-Q24': {
//     illustration: () => import('./DotPattern21A24Fig'),
//     explainer:    () => import('./DotPattern21A24Fig').then(m => ({ default: m.DotPattern21A24Explainer })),
//   },
