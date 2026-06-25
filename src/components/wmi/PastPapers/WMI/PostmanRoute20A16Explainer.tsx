/**
 * SEAMO-20-A-Q16 — animated explainer for the postman-route question.
 *
 * Strategy: multiply — count paths start→A (=3) × paths A→house (=4) = 12.
 *
 * Beats:
 *   0 — intro:        show full grid with postman, house, and point A.
 *   1 — count_to_A:   highlight the start→A sub-grid; show 3 paths.
 *   2 — count_from_A: highlight the A→house sub-grid; show 4 paths.
 *   3 — multiply:     show 3 × 4.
 *   4 — result:       3 × 4 = 12, answer D.
 *
 * Reuses the grid geometry from PostmanRoute20A16Illustration.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CW, CH, COLS, ROWS, NCOLS, NROWS,
  SVG_W, SVG_H,
  nodeXY,
  NODE_START, NODE_HOUSE, NODE_A,
  CELL_FILL, GRID_STROKE, ARROW_COLOR,
} from './PostmanRoute20A16Illustration'
import { buildPostmanRoute20A16Steps } from './postmanRoute20A16Steps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'
const GREEN     = '#059669'
const GREEN_BG  = '#D1FAE5'
const GREEN_TXT = '#065F46'
const AMBER     = '#D97706'
const AMBER_BG  = '#FEF3C7'

// ── Path-count labels (Pascal's triangle on the 5×4 lattice) ─────────────────
//
// paths[svgRow][svgCol] = # paths from start (col=0, row=3 SVG) to this node.
// svgRow 0 = top, svgRow 3 = bottom (start row).
// Start = (col=0, svgRow=3). House = (col=4, svgRow=0). A = (col=1, svgRow=1).
//
// Recurrence (right/up only):
//   paths(c, r) = paths(c-1, r) + paths(c, r+1)
//   Base: paths(0, r) = 1 for all r (only one way: go straight up)
//         paths(c, 3) = 1 for all c (only one way: go straight right)
//
// Computed table (svgRow 3 = bottom = start row):
//   svgRow 3: 1 1 1 1 1
//   svgRow 2: 1 2 3 4 5
//   svgRow 1: 1 3 6 10 15
//   svgRow 0: 1 4 10 20 35  ← house at col=4 would be 35, but A is at (1,1)=3
//
// For this explainer we only label nodes in the relevant sub-grids per beat.

const PATHS_FROM_START: number[][] = [
  [1, 4, 10, 20, 35],   // svgRow 0 (top)
  [1, 3, 6,  10, 15],   // svgRow 1 — A = (col=1, row=1) → 3
  [1, 2, 3,  4,  5 ],   // svgRow 2
  [1, 1, 1,  1,  1 ],   // svgRow 3 (bottom = start row)
]

// Paths FROM A (col=1, row=1) to each node (col, row) where col>=1, row<=1
const PATHS_FROM_A: number[][] = [
  // Only for col 1..4, row 0..1 (right/up from A)
  // paths_A(c, r) = paths_from_start(c, r) - not directly; we compute from A:
  // paths_A(1,1)=1, paths_A(c, 1) = c-1+1 ... actually use Pascal:
  // Moving from A=(col=1,row=1) right c more and up r more: C(c+r, r)
  // col=1 (0 right from A): C(0+r,r) no... let me redo:
  // From A=(1,1) to node (c,r): delta_col = c-1, delta_row = 1-r (up moves in SVG = row decreases)
  // paths = C(delta_col + delta_row, delta_col)
  // For row=1: delta_row=0, paths = 1 for all c>=1
  // For row=0: delta_row=1, paths = delta_col+1 = c-1+1 = c
  // So:
  //   (1,1)=1 (2,1)=1 (3,1)=1 (4,1)=1
  //   (1,0)=1 (2,0)=2 (3,0)=3 (4,0)=4  ← house at (4,0) = 4 ✓
] // just document above; actual labels rendered inline

// ── Defs ─────────────────────────────────────────────────────────────────────

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <marker
        id={id}
        viewBox="0 0 8 8"
        refX="8" refY="4"
        markerWidth="5" markerHeight="5"
        orient="auto-start-reverse"
      >
        <path d="M0,0 L8,4 L0,8 Z" fill={ARROW_COLOR} />
      </marker>
    </defs>
  )
}

// ── Grid background ───────────────────────────────────────────────────────────

function GridBg({
  highlightLeft,
  highlightRight,
}: {
  highlightLeft: boolean
  highlightRight: boolean
}) {
  const [ac, ar] = NODE_A  // col=1, row=1 in SVG
  const items: React.ReactNode[] = []

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const [x, y] = nodeXY(c, r)
      // left sub-grid: cells from start to A region (c < ac, r >= ar) and (c=0..0, r=1..2)
      // right sub-grid: cells from A region to house
      const isLeftSide  = c < ac || r > ar  // start→A region (below/left of A)
      const isRightSide = c >= ac && r <= ar  // A→house region (above/right of A)
      let fill = CELL_FILL
      if (highlightLeft && isLeftSide && !isRightSide)  fill = '#BFDBFE'  // blue-200
      if (highlightRight && isRightSide && !isLeftSide) fill = '#FEF3C7'  // amber-100

      items.push(
        <rect
          key={`cell-${r}-${c}`}
          x={x} y={y}
          width={CW} height={CH}
          fill={fill}
          stroke={GRID_STROKE}
          strokeWidth={1.5}
        />,
      )
    }
  }
  return <g>{items}</g>
}

// ── Arrow overlays ────────────────────────────────────────────────────────────

function Arrows({ markerId }: { markerId: string }) {
  const items: React.ReactNode[] = []
  // horizontal right arrows
  for (let r = 0; r <= ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const [x1, y] = nodeXY(c, r)
      const [x2] = nodeXY(c + 1, r)
      const mx = (x1 + x2) / 2
      items.push(
        <line
          key={`h-${r}-${c}`}
          x1={mx - 6} y1={y}
          x2={mx + 6} y2={y}
          stroke={ARROW_COLOR} strokeWidth={2}
          markerEnd={`url(#${markerId})`}
        />,
      )
    }
  }
  // vertical up arrows
  for (let c = 0; c <= COLS; c++) {
    for (let r = 1; r <= ROWS; r++) {
      const [x, y1] = nodeXY(c, r)
      const [, y2] = nodeXY(c, r - 1)
      const my = (y1 + y2) / 2
      items.push(
        <line
          key={`v-${c}-${r}`}
          x1={x} y1={my + 6}
          x2={x} y2={my - 6}
          stroke={ARROW_COLOR} strokeWidth={2}
          markerEnd={`url(#${markerId})`}
        />,
      )
    }
  }
  return <g>{items}</g>
}

// ── Node-count labels ─────────────────────────────────────────────────────────

type NodeSet = 'none' | 'to_A' | 'from_A' | 'all'

function NodeLabels({ show }: { show: NodeSet }) {
  const labels: React.ReactNode[] = []

  if (show === 'none') return null

  const [ac, ar] = NODE_A

  for (let r = 0; r <= ROWS; r++) {
    for (let c = 0; c <= COLS; c++) {
      const count = PATHS_FROM_START[r][c]
      const isA = c === ac && r === ar
      const isStart = c === NODE_START[0] && r === NODE_START[1]
      const isHouse = c === NODE_HOUSE[0] && r === NODE_HOUSE[1]

      // 'to_A' mode: show nodes in the start→A sub-lattice (col 0..ac, row ar..ROWS)
      const inToA   = c <= ac && r >= ar
      // 'from_A' mode: show nodes in the A→house sub-lattice (col ac..COLS, row 0..ar)
      const inFromA = c >= ac && r <= ar

      const shouldShow =
        show === 'all' ||
        (show === 'to_A'   && inToA)   ||
        (show === 'from_A' && inFromA)

      if (!shouldShow) continue

      const [nx, ny] = nodeXY(c, r)

      // for from_A: label with local path count from A
      let displayCount = count
      if (show === 'from_A' && inFromA) {
        const dc = c - ac  // delta col from A
        const dr = ar - r  // delta row (up) from A
        displayCount = binomial(dc + dr, dc)
      }

      const color = isHouse && show === 'from_A' ? GREEN
                  : isA ? AMBER
                  : BLUE

      const fillColor = isHouse && show === 'from_A' ? GREEN
                      : isA ? AMBER
                      : '#E0EEFF'

      const textColor = (isHouse && show === 'from_A') || isA ? 'white' : color

      labels.push(
        <g key={`n-${r}-${c}`}>
          <circle
            cx={nx} cy={ny}
            r={isA || isStart || isHouse ? 13 : 11}
            fill={fillColor}
            stroke={color}
            strokeWidth={isA || isHouse ? 2.5 : 1.5}
          />
          <text
            x={nx} y={ny}
            textAnchor="middle" dominantBaseline="central"
            fontSize={displayCount >= 10 ? 9 : 11}
            fontWeight={800}
            fontFamily="system-ui, sans-serif"
            fill={textColor}
          >
            {displayCount}
          </text>
        </g>,
      )
    }
  }

  return <g>{labels}</g>
}

function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  if (k === 0 || k === n) return 1
  let result = 1
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1)
  }
  return Math.round(result)
}

// ── Point A label ─────────────────────────────────────────────────────────────

function PointA({ highlight }: { highlight: boolean }) {
  const [ax, ay] = nodeXY(...NODE_A)
  return (
    <g>
      <circle
        cx={ax} cy={ay}
        r={13}
        fill={highlight ? AMBER : '#DBEAFE'}
        stroke={highlight ? AMBER : ARROW_COLOR}
        strokeWidth={2}
      />
      <text
        x={ax} y={ay}
        textAnchor="middle" dominantBaseline="central"
        fontSize={12} fontWeight={800}
        fontFamily="system-ui, sans-serif"
        fill={highlight ? 'white' : '#1E3A5F'}
      >
        A
      </text>
    </g>
  )
}

// ── Corner labels: start S and house H ────────────────────────────────────────

function CornerLabels({ showResult }: { showResult: boolean }) {
  const [sx, sy] = nodeXY(...NODE_START)
  const [hx, hy] = nodeXY(...NODE_HOUSE)
  const INK = '#1E3A5F'

  return (
    <g fontFamily="system-ui, sans-serif" fontWeight={800} fontSize={11} fill={INK}>
      {/* start dot */}
      <circle cx={sx} cy={sy} r={6} fill={BLUE} />
      {/* house dot */}
      <circle cx={hx} cy={hy} r={6} fill={showResult ? GREEN : BLUE} />
    </g>
  )
}

// ── Main explainer ─────────────────────────────────────────────────────────────

export default function PostmanRoute20A16Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildPostmanRoute20A16Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const captionStyle = beat.result
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TXT }
    : beat.phase === 'count_from_A'
      ? { background: AMBER_BG, borderColor: AMBER, color: '#92400E' }
      : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const nodeShow: NodeSet =
    beat.phase === 'count_to_A'   ? 'to_A'   :
    beat.phase === 'count_from_A' ? 'from_A' :
    beat.phase === 'result'       ? 'all'    :
    'none'

  const ariaLabel = lang === 'id'
    ? '3 jalur dari awal ke Titik A, 4 jalur dari A ke rumah. Total = 3 × 4 = 12 cara, jawaban D.'
    : '3 paths from start to Point A, 4 paths from A to house. Total = 3 × 4 = 12 ways, answer D.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* strategy pill */}
        <div
          className="rounded-lg px-3 py-1 text-center font-display text-xs font-bold"
          style={{ background: BLUE_BG, color: BLUE }}
        >
          {lang === 'id'
            ? 'Kalikan: jalur ke A × jalur dari A'
            : 'Multiply: paths to A × paths from A'}
        </div>

        {/* grid scene */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(360, SVG_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <Defs id="exarr" />
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          <GridBg
            highlightLeft={beat.phase === 'count_to_A'}
            highlightRight={beat.phase === 'count_from_A'}
          />
          <Arrows markerId="exarr" />
          <CornerLabels showResult={beat.result} />
          <NodeLabels show={nodeShow} />
          <PointA highlight={beat.phase === 'count_to_A' || beat.phase === 'count_from_A'} />
        </svg>

        {/* equation chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: beat.result ? GREEN : beat.phase === 'count_from_A' ? AMBER : BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* answer badge */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence initial={false}>
            {beat.result && (
              <motion.span
                key="answer-badge"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-5 py-1 font-display text-sm font-black text-white"
                style={{ background: GREEN }}
              >
                {lang === 'id' ? '12 cara → D' : '12 ways → D'}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
