import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CELL,
  PAD,
  UPPER_COLS,
  UPPER_ROWS,
  LOWER_COLS,
  LOWER_ROWS,
  nodeXY,
  NODE_A,
  NODE_B,
  isValid,
} from './LShortPath22B19Illustration'
import { COUNTS, buildLShortPath22B19Steps } from './lShortPath22B19Steps'

// SEAMO-22-B-Q19 — post-answer animation.
// Reuses the L-grid geometry constants from the illustration.
// Shows a Pascal's-triangle fill propagating through the L-shaped grid,
// beat by beat, landing on 126 at node B.
//
// Beats: intro → edges → upper → junction → lower → result.

// ── colour tokens ─────────────────────────────────────────────────────────────
const INK      = '#111827'
const BLUE     = '#30598A'
const AMBER    = '#D97706'
const GREEN    = '#059669'
const CELL_BG  = '#EFF6FF'   // blue-50 for filled nodes
const CELL_HI  = '#D1FAE5'   // emerald-100 for final answer node

// ── SVG dimensions ────────────────────────────────────────────────────────────
const TOTAL_ROWS = UPPER_ROWS + LOWER_ROWS   // 5 rows (nodes 0-5)
const TOTAL_COLS = LOWER_COLS                // 5 cols (nodes 0-5)
const SVG_W = PAD * 2 + TOTAL_COLS * CELL
const SVG_H = PAD * 2 + TOTAL_ROWS * CELL
const FIG_W = Math.min(340, SVG_W)

// ── Static L-grid (cells only, no numbers) ────────────────────────────────────
function LGridBase() {
  const cells: React.ReactNode[] = []
  for (let r = 0; r < TOTAL_ROWS; r++) {
    for (let c = 0; c < TOTAL_COLS; c++) {
      const inL = (c < UPPER_COLS && r < UPPER_ROWS) ||
                  (r >= UPPER_ROWS && c < LOWER_COLS)
      if (!inL) continue
      const [x, y] = nodeXY(c, r)
      cells.push(
        <rect
          key={`cell-${r}-${c}`}
          x={x} y={y}
          width={CELL} height={CELL}
          fill="white"
          stroke="#D1D5DB"
          strokeWidth={1.2}
        />
      )
    }
  }
  return <g>{cells}</g>
}

// ── Pascal count labels ────────────────────────────────────────────────────────

interface CountLabelsProps {
  revealUpToRow: number
  highlightB: boolean
}

function CountLabels({ revealUpToRow, highlightB }: CountLabelsProps) {
  const labels: React.ReactNode[] = []
  const totalRows = UPPER_ROWS + LOWER_ROWS

  for (let r = 0; r <= totalRows; r++) {
    for (let c = 0; c <= TOTAL_COLS; c++) {
      if (!isValid(c, r)) continue
      const count = COUNTS[r]?.[c]
      if (count === null || count === undefined) continue

      // Show the count only if we've revealed up to this row
      // For row 0 (top edge) and col 0 (left edge), show from beat "edges" (revealUpToRow >= 0)
      // For the junction row (UPPER_ROWS) cols > UPPER_COLS, show from beat "junction"
      const isJunctionExtra = r === UPPER_ROWS && c > UPPER_COLS
      const showFromRow = isJunctionExtra ? UPPER_ROWS : r

      if (showFromRow > revealUpToRow) continue

      const [nx, ny] = nodeXY(c, r)
      const cx = nx
      const cy = ny
      const isB = c === LOWER_COLS && r === totalRows
      const isEdge = (r === 0 || c === 0)
      const fill = isB && highlightB ? CELL_HI : isEdge ? '#FEF3C7' : CELL_BG
      const textColor = isB && highlightB ? GREEN : isEdge ? AMBER : BLUE
      const fontSize = count >= 100 ? 9 : count >= 10 ? 11 : 13

      labels.push(
        <g key={`label-${r}-${c}`}>
          <circle cx={cx} cy={cy} r={CELL * 0.38} fill={fill} stroke={isB && highlightB ? GREEN : BLUE} strokeWidth={isB && highlightB ? 2 : 1} />
          <text
            x={cx} y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={fontSize}
            fontWeight={700}
            fill={textColor}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {count}
          </text>
        </g>
      )
    }
  }

  return <g>{labels}</g>
}

// ── A / B endpoint labels ─────────────────────────────────────────────────────
function EndpointLabels({ highlightB }: { highlightB: boolean }) {
  const [ax, ay] = nodeXY(...NODE_A)
  const [bx, by] = nodeXY(...NODE_B)
  const bColor = highlightB ? GREEN : INK

  return (
    <g fontFamily="sans-serif" fontWeight={700} fontSize={14} fill={INK}>
      <text x={ax - 16} y={ay} textAnchor="end" dominantBaseline="central">A</text>
      <text x={bx + 7} y={by} textAnchor="start" dominantBaseline="central" fill={bColor}>B</text>
    </g>
  )
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function LShortPath22B19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildLShortPath22B19Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: isi Pascal pada grid L dari A ke B. Setiap simpul = jalur dari kiri + atas. Simpul B mendapat 126 lintasan terpendek — jawaban E.'
      : 'Explainer: Pascal fill on the L-grid from A to B. Each node = paths from left + above. Node B gets 126 shortest paths — answer E.'

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={FIG_W}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#F9FAFB" />
          <LGridBase />

          <AnimatePresence>
            {beat.revealUpToRow >= 0 && (
              <motion.g
                key={`counts-${beat.revealUpToRow}-${beat.highlightB}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <CountLabels revealUpToRow={beat.revealUpToRow} highlightB={beat.highlightB} />
              </motion.g>
            )}
          </AnimatePresence>

          <EndpointLabels highlightB={beat.highlightB} />
        </svg>

        {/* equation row */}
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
                style={{ background: isResult ? GREEN : BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
