// SEAMOX-23-A-Q3 — post-answer animated explainer.
// Reuses shape geometry from NotchRectX23A3Illustration.
//
// Animation beats:
//   0. problem    — plain notched rectangle, given labels shown
//   1. horizontal — H-edges glow blue; "10 + 3 + 4 + 3 = 20 cm"
//   2. vertical   — V-edges glow orange; "8 + 3 + 3 + 8 = 22 cm"
//   3. result     — full outline turns green; "20 + 22 = 42 cm"

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
  WL,
  NW,
  ND,
  notchRectVertices,
  notchRectSegs,
} from './NotchRectX23A3Illustration'
import { buildNotchRectX23A3Steps } from './notchRectX23A3Steps'

const BLUE   = COLOR.H_EDGE
const ORANGE = COLOR.V_EDGE
const GREEN  = COLOR.RESULT

// ── Edge overlay ───────────────────────────────────────────────────────────────

interface EdgeOverlayProps {
  ox: number
  oy: number
  showH: boolean
  showV: boolean
  resultMode: boolean
}

function EdgeOverlay({ ox, oy, showH, showV, resultMode }: EdgeOverlayProps) {
  const segs = notchRectSegs(ox, oy)
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
            transition={{ duration: 0.35, delay: i * 0.06 }}
          />
        )
      })}
    </g>
  )
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function NotchRectX23A3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildNotchRectX23A3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const isHoriz  = beat.phase === 'horizontal'
  const isVert   = beat.phase === 'vertical'

  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : isHoriz
    ? { background: '#EFF6FF', borderColor: BLUE,  color: '#1E40AF' }
    : isVert
    ? { background: '#FEF3C7', borderColor: ORANGE, color: '#92400E' }
    : { background: '#F5F0EB', borderColor: '#8B7355', color: '#5B4636' }

  const shapeFill   = isResult ? '#DCFCE7' : COLOR.SHAPE_FILL
  const shapeStroke = isResult ? GREEN : COLOR.SHAPE_STROKE

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: sisi horizontal berjumlah 20 cm, sisi vertikal 22 cm, keliling = 42 cm.'
      : 'Explainer: horizontal edges total 20 cm, vertical edges 22 cm, perimeter = 42 cm.'

  const pts = notchRectVertices(EX_OX, EX_OY)
  const pointsAttr = pts.map(([x, y]) => `${x},${y}`).join(' ')

  // Label positions for dimension callouts
  const notchRightX   = EX_OX + WL + NW
  const notchMidY     = EX_OY + ND / 2
  const rightMidY     = EX_OY + H / 2

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

          {/* shape polygon */}
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

          {/* "10 cm" below the bottom */}
          <text
            x={EX_OX + W / 2} y={EX_OY + H + 16}
            textAnchor="middle" fontSize={11} fontWeight={700}
            fill={COLOR.LABEL}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >10 cm</text>

          {/* "8 cm" to the right */}
          <text
            x={EX_OX + W + 12} y={rightMidY}
            textAnchor="start" fontSize={11} fontWeight={700}
            fill={COLOR.LABEL}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            dominantBaseline="central"
          >8 cm</text>

          {/* "3 cm" notch inner-right */}
          <text
            x={notchRightX + 8} y={notchMidY}
            textAnchor="start" fontSize={10} fontWeight={700}
            fill={COLOR.DIM}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            dominantBaseline="central"
          >3 cm</text>

          {/* "4 cm" notch bottom */}
          <text
            x={EX_OX + WL + NW / 2} y={EX_OY + ND + 13}
            textAnchor="middle" fontSize={10} fontWeight={700}
            fill={COLOR.DIM}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >4 cm</text>
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
