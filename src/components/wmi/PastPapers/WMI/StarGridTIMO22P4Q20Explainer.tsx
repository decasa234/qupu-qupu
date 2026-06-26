// TIMO-22-P4H-Q20 — animated explainer for counting rectangles containing *.
//
// Beats:
//   0  intro      — show grid + *
//   1  top-span   — tint top section (rows 1-2); equation 8
//   2  bot-span   — tint bottom section (rows 3-4); equation 8
//   3  result     — 8 + 8 = 16

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildStarGridTIMO22P4Q20Steps } from './starGridTIMO22P4Q20Steps'
import {
  CELL, PAD,
  V0, V1, V2, V3,
  H0, H1, H2, H3, H4,
  SVG_W, SVG_H,
  STROKE, FILL_BG,
  STAR_X, STAR_Y,
} from './StarGridTIMO22P4Q20Illustration'

const GREEN  = '#10B981'
const AMBER  = '#D97706'
const BLUE   = '#3B82F6'
const INK    = '#1F2937'
const RED    = '#DC2626'

// Top-section cell fills (rows 1–2, cols 2–3)
const TOP_CELLS = [
  { x: V1, y: H0, w: CELL, h: CELL },
  { x: V2, y: H0, w: CELL, h: CELL },
  { x: V1, y: H1, w: CELL, h: CELL },
  { x: V2, y: H1, w: CELL, h: CELL },
]

// Bottom-section cell fills (rows 3–4, cols 1–3)
const BOT_CELLS = [
  { x: V0, y: H2, w: CELL, h: CELL },
  { x: V1, y: H2, w: CELL, h: CELL },
  { x: V2, y: H2, w: CELL, h: CELL },
  { x: V0, y: H3, w: CELL, h: CELL },
  { x: V1, y: H3, w: CELL, h: CELL },
  { x: V2, y: H3, w: CELL, h: CELL },
]

export default function StarGridTIMO22P4Q20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildStarGridTIMO22P4Q20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult  = beat.result
  const showTop   = ['top-span', 'result'].includes(beat.phase)
  const showBot   = ['bot-span', 'result'].includes(beat.phase)

  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: INK }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: persegi panjang yang atasnya di baris 1–2 berjumlah 8, yang atasnya di baris 3 berjumlah 8, total 16.'
      : 'Explainer: rectangles with top in rows 1–2 count 8; top at row 3 count 8; total 16.'

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(240, SVG_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={FILL_BG} />

          {/* ── top-section tint (rows 1–2) ── */}
          <AnimatePresence>
            {showTop && (
              <motion.g
                key="top-tint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {TOP_CELLS.map((c, i) => (
                  <rect
                    key={`top-${i}`}
                    x={c.x}
                    y={c.y}
                    width={c.w}
                    height={c.h}
                    fill={isResult ? '#D1FAE540' : '#DCFCE740'}
                    stroke={isResult ? GREEN : GREEN}
                    strokeWidth={0}
                  />
                ))}
                {/* outline the whole top section */}
                <rect
                  x={V1}
                  y={H0}
                  width={2 * CELL}
                  height={2 * CELL}
                  fill="none"
                  stroke={GREEN}
                  strokeWidth={2}
                  strokeDasharray="4 3"
                />
              </motion.g>
            )}
          </AnimatePresence>

          {/* ── bottom-section tint (rows 3–4) ── */}
          <AnimatePresence>
            {showBot && (
              <motion.g
                key="bot-tint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {BOT_CELLS.map((c, i) => (
                  <rect
                    key={`bot-${i}`}
                    x={c.x}
                    y={c.y}
                    width={c.w}
                    height={c.h}
                    fill={isResult ? '#FEF3C740' : '#FEF3C740'}
                    stroke="none"
                  />
                ))}
                {/* outline the bottom section */}
                <rect
                  x={V0}
                  y={H2}
                  width={3 * CELL}
                  height={2 * CELL}
                  fill="none"
                  stroke={isResult ? AMBER : AMBER}
                  strokeWidth={2}
                  strokeDasharray="4 3"
                />
              </motion.g>
            )}
          </AnimatePresence>

          {/* ── grid lines (drawn on top of tint) ── */}
          {/* horizontal */}
          <line x1={V1} y1={H0} x2={V3} y2={H0} stroke={STROKE} strokeWidth={1.5} />
          <line x1={V1} y1={H1} x2={V3} y2={H1} stroke={STROKE} strokeWidth={1.5} />
          <line x1={V0} y1={H2} x2={V3} y2={H2} stroke={STROKE} strokeWidth={1.5} />
          <line x1={V0} y1={H3} x2={V3} y2={H3} stroke={STROKE} strokeWidth={1.5} />
          <line x1={V0} y1={H4} x2={V3} y2={H4} stroke={STROKE} strokeWidth={1.5} />
          {/* vertical */}
          <line x1={V0} y1={H2} x2={V0} y2={H4} stroke={STROKE} strokeWidth={1.5} />
          <line x1={V1} y1={H0} x2={V1} y2={H4} stroke={STROKE} strokeWidth={1.5} />
          <line x1={V2} y1={H0} x2={V2} y2={H4} stroke={STROKE} strokeWidth={1.5} />
          <line x1={V3} y1={H0} x2={V3} y2={H4} stroke={STROKE} strokeWidth={1.5} />

          {/* ── star ── */}
          <text
            x={STAR_X}
            y={STAR_Y + 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={26}
            fontWeight="bold"
            fill={RED}
          >
            *
          </text>
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
