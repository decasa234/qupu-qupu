// SEAMOX-22-A-Q3 — post-answer animated explainer.
// Reuses staircase geometry from StaircasePerimX22A3Illustration.
//
// Animation beats:
//   0. problem    — plain staircase, dimensions labelled (10 m, 8 m)
//   1. horizontal — all horizontal edges glow blue; "10 + 10 = 20 m"
//   2. vertical   — all vertical edges glow orange; "8 + 8 = 16 m"
//   3. result     — full outline turns green; "20 + 16 = 36 m"

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  COLOR,
  EX_SVG_W,
  EX_SVG_H,
  EX_OX,
  EX_OY,
  W,
  H,
  staircaseSegs,
} from './StaircasePerimX22A3Illustration'
import { buildStaircasePerimX22A3Steps } from './staircasePerimX22A3Steps'

const BLUE   = COLOR.H_EDGE
const ORANGE = COLOR.V_EDGE
const GREEN  = COLOR.RESULT

// ── Staircase edge overlay ─────────────────────────────────────────────────────

interface EdgeOverlayProps {
  ox: number
  oy: number
  showH: boolean
  showV: boolean
  resultMode: boolean
}

function EdgeOverlay({ ox, oy, showH, showV, resultMode }: EdgeOverlayProps) {
  const segs = staircaseSegs(ox, oy)
  return (
    <g>
      {segs.map((seg, i) => {
        const isH = seg.kind === 'H'
        let stroke = 'none'
        if (resultMode) stroke = GREEN
        else if (isH && showH) stroke = BLUE
        else if (!isH && showV) stroke = ORANGE
        if (stroke === 'none') return null
        return (
          <motion.line
            key={i}
            x1={seg.x1} y1={seg.y1}
            x2={seg.x2} y2={seg.y2}
            stroke={stroke}
            strokeWidth={4}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          />
        )
      })}
    </g>
  )
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function StaircasePerimX22A3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildStaircasePerimX22A3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult   = beat.result
  const isHoriz    = beat.phase === 'horizontal'
  const isVert     = beat.phase === 'vertical'

  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : isHoriz
    ? { background: '#EFF6FF', borderColor: BLUE, color: '#1E40AF' }
    : isVert
    ? { background: '#FEF3C7', borderColor: ORANGE, color: '#92400E' }
    : { background: '#F5F0EB', borderColor: '#8B7355', color: '#5B4636' }

  // Staircase fill colour changes on result
  const shapeFill   = isResult ? '#DCFCE7' : COLOR.SHAPE_FILL
  const shapeStroke = isResult ? GREEN : COLOR.SHAPE_STROKE

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: segmen horizontal berjumlah 20 m, vertikal 16 m, keliling = 36 m.'
      : 'Explainer: horizontal segments total 20 m, vertical 16 m, perimeter = 36 m.'

  // Build polygon points for the staircase (copied from staircaseVertices)
  const pts: [number, number][] = [
    [EX_OX,           EX_OY],
    [EX_OX + W,       EX_OY],
    [EX_OX + W,       EX_OY - H],
    [EX_OX + W - 35,  EX_OY - H],
    [EX_OX + W - 35,  EX_OY - H + 28],
    [EX_OX + W - 70,  EX_OY - H + 28],
    [EX_OX + W - 70,  EX_OY - H + 56],
    [EX_OX + W - 105, EX_OY - H + 56],
    [EX_OX + W - 105, EX_OY - H + 84],
    [EX_OX,           EX_OY - H + 84],
  ]
  const pointsAttr = pts.map(([x, y]) => `${x},${y}`).join(' ')

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${EX_SVG_W} ${EX_SVG_H}`}
          width="100%"
          style={{ display: 'block', maxWidth: EX_SVG_W }}
          aria-hidden="true"
        >
          {/* white background */}
          <rect x={0} y={0} width={EX_SVG_W} height={EX_SVG_H} fill="white" />

          {/* staircase base polygon */}
          <polygon
            points={pointsAttr}
            fill={shapeFill}
            stroke={shapeStroke}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />

          {/* animated edge highlights */}
          <AnimatePresence>
            <EdgeOverlay
              key={beat.phase}
              ox={EX_OX}
              oy={EX_OY}
              showH={isHoriz}
              showV={isVert}
              resultMode={isResult}
            />
          </AnimatePresence>

          {/* dimension labels (always visible) */}
          {/* "10 m" below */}
          <text
            x={EX_OX + W / 2} y={EX_OY + 18}
            textAnchor="middle" fontSize={12} fontWeight={700}
            fill={COLOR.LABEL}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >10 m</text>

          {/* "8 m" on the right */}
          <text
            x={EX_OX + W + 14} y={EX_OY - H / 2}
            textAnchor="start" fontSize={12} fontWeight={700}
            fill={COLOR.LABEL}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            dominantBaseline="central"
          >8 m</text>
        </svg>

        {/* equation pill */}
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
                style={{ background: isResult ? GREEN : isHoriz ? BLUE : ORANGE }}
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
