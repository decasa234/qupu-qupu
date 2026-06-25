// SEAMOX-23-A-Q15 — animated Pascal fill for the staircase shortest-path problem.
//
// Reuses the grid geometry constants from StaircasePathX23A15Illustration.
// Shows a Pascal-triangle fill propagating bottom-to-top through the staircase,
// beat by beat, landing on 42 at node B.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CELL,
  PAD,
  STEPS,
  SVG_W,
  SVG_H,
  nodeXY,
  NODE_A,
  NODE_B,
  cellValid,
} from './StaircasePathX23A15Illustration'
import { COUNTS, buildStaircasePathX23A15Steps } from './staircasePathX23A15Steps'

// ── Colour tokens ─────────────────────────────────────────────────────────────
const INK     = '#111827'
const BLUE    = '#30598A'
const AMBER   = '#D97706'
const GREEN   = '#059669'
const CELL_BG = '#EFF6FF'   // blue-50 — filled nodes
const CELL_HI = '#D1FAE5'   // emerald-100 — final answer node

// ── Dimensions ────────────────────────────────────────────────────────────────
const FIG_W = Math.min(280, SVG_W)

// ── Static staircase cells (no numbers) ──────────────────────────────────────
function StaircaseBase() {
  const cells: React.ReactNode[] = []
  for (let R = 0; R < STEPS; R++) {
    for (let C = 0; C < STEPS; C++) {
      if (!cellValid(C, R)) continue
      const [x, y] = nodeXY(C, R + 1)
      cells.push(
        <rect
          key={`base-${C}-${R}`}
          x={x} y={y}
          width={CELL} height={CELL}
          fill="white"
          stroke="#D1D5DB"
          strokeWidth={1.2}
        />,
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

  for (let y = 0; y <= STEPS; y++) {
    if (y > revealUpToRow) continue
    for (let x = 0; x <= STEPS; x++) {
      const count = COUNTS[y]?.[x]
      if (count === null || count === undefined) continue

      const [nx, ny] = nodeXY(x, y)
      const isB = x === NODE_B[0] && y === NODE_B[1]
      const isEdge = (y === 0)
      const isBoundary = (x === y - 1 + 1)  // step-corner nodes (0,1),(1,2),(2,3),(3,4)

      const fill =
        isB && highlightB ? CELL_HI
        : isEdge          ? '#FEF3C7'
        : CELL_BG

      const textColor =
        isB && highlightB ? GREEN
        : isEdge          ? AMBER
        : BLUE

      const fontSize = count >= 100 ? 9 : count >= 10 ? 10 : 12

      labels.push(
        <g key={`label-${x}-${y}`}>
          <circle
            cx={nx} cy={ny}
            r={CELL * 0.36}
            fill={fill}
            stroke={isB && highlightB ? GREEN : BLUE}
            strokeWidth={isB && highlightB ? 2 : 1}
          />
          <text
            x={nx} y={ny}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={fontSize}
            fontWeight={700}
            fill={textColor}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {count}
          </text>
        </g>,
      )
    }
  }

  return <g>{labels}</g>
}

// ── Endpoint labels ───────────────────────────────────────────────────────────
function EndpointLabels({ highlightB }: { highlightB: boolean }) {
  const [ax, ay] = nodeXY(...NODE_A)
  const [bx, by] = nodeXY(...NODE_B)
  const bColor = highlightB ? GREEN : INK

  return (
    <g fontFamily="sans-serif" fontWeight={700} fontSize={14} fill={INK}>
      <text x={ax - 4} y={ay + 18} textAnchor="end" dominantBaseline="central">A</text>
      <text x={bx + 4} y={by - 12} textAnchor="start" dominantBaseline="central" fill={bColor}>B</text>
    </g>
  )
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function StaircasePathX23A15Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildStaircasePathX23A15Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: isi Pascal pada grid tangga dari A ke B. Setiap simpul = jalur dari kiri + bawah. Simpul B mendapat 42 jalur terpendek.'
      : 'Explainer: Pascal fill on the staircase grid from A to B. Each node = paths from left + below. Node B gets 42 shortest paths.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={FIG_W}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#F9FAFB" />
          <StaircaseBase />

          <AnimatePresence>
            {beat.revealUpToRow >= 0 && (
              <motion.g
                key={`counts-${beat.revealUpToRow}-${beat.highlightB}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <CountLabels
                  revealUpToRow={beat.revealUpToRow}
                  highlightB={beat.highlightB}
                />
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
