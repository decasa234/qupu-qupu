// TIMO-22-P3H-Q20 — animated explainer for counting rectangles.
//
// Beats:
//   0  intro  — show the figure, explain the "2H + 2V" strategy
//   1  top    — amber overlay on col-0 column (rows 0-1); 2 rects
//   2  mid    — green overlay on full row 1; 10 rects
//   3  bot    — blue overlay on cols 1-3 rows 1-2; 12 rects
//   4  result — sum banner: 2+10+12=24

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CELL, PAD, SW, SH, STROKE, FILL, CELLS,
} from './CountRectsTIMO22P3Q20Illustration'
import { buildCountRectsTIMO22P3Q20Steps } from './countRectsTIMO22P3Q20Steps'

const GREEN = '#10B981'
const AMBER = '#D97706'
const BLUE  = '#3B82F6'
const INK   = '#1F2937'

export default function CountRectsTIMO22P3Q20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildCountRectsTIMO22P3Q20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: INK }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: 2 + 10 + 12 = 24 persegi panjang.'
      : 'Explainer: 2 + 10 + 12 = 24 rectangles total.'

  // Overlay regions: x, y, w, h in SVG units (relative to PAD origin)
  const showTop = ['top', 'result'].includes(beat.phase)
  const showMid = ['mid', 'result'].includes(beat.phase)
  const showBot = ['bot', 'result'].includes(beat.phase)

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SW} ${SH}`}
          width={Math.min(240, SW)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SW} height={SH} fill={FILL} />

          {/* base grid cells */}
          {CELLS.map(([col, row]) => (
            <rect
              key={`${col}-${row}`}
              x={PAD + col * CELL}
              y={PAD + row * CELL}
              width={CELL}
              height={CELL}
              fill={FILL}
              stroke={STROKE}
              strokeWidth={1.5}
            />
          ))}

          {/* top overlay — col 0, rows 0–1 (2 rects possible) */}
          <AnimatePresence>
            {showTop && (
              <motion.rect
                key="overlay-top"
                x={PAD + 0 * CELL + 3}
                y={PAD + 0 * CELL + 3}
                width={1 * CELL - 6}
                height={2 * CELL - 6}
                fill={isResult ? '#D1FAE530' : '#FEF3C750'}
                stroke={isResult ? GREEN : AMBER}
                strokeWidth={2}
                rx={2}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>

          {/* mid overlay — row 1, cols 0–3 (10 rects possible) */}
          <AnimatePresence>
            {showMid && (
              <motion.rect
                key="overlay-mid"
                x={PAD + 0 * CELL + 3}
                y={PAD + 1 * CELL + 3}
                width={4 * CELL - 6}
                height={1 * CELL - 6}
                fill={isResult ? '#D1FAE530' : '#D1FAE550'}
                stroke={GREEN}
                strokeWidth={2}
                rx={2}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>

          {/* bot overlay — cols 1–3, rows 1–2 (12 rects possible) */}
          <AnimatePresence>
            {showBot && (
              <motion.rect
                key="overlay-bot"
                x={PAD + 1 * CELL + 3}
                y={PAD + 1 * CELL + 3}
                width={3 * CELL - 6}
                height={2 * CELL - 6}
                fill={isResult ? '#D1FAE530' : '#DBEAFE50'}
                stroke={isResult ? GREEN : BLUE}
                strokeWidth={2}
                rx={2}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>
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
