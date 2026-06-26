// TIMO-22-P2H-Q18 — animated explainer for counting squares.
//
// Animation beats (4 total):
//   0  intro     — show the figure, prompt to count all sizes.
//   1  cells1x1  — green tint all 12 unit cells.
//   2  cells2x2  — amber overlay for the 4 two-by-two squares (2 per block).
//   3  result    — green banner: 12 + 4 = 16.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { GridBoard } from './primitives/GridBoard'
import {
  CELL,
  TOP_X, TOP_Y,
  BOT_X, BOT_Y,
  SVG_W, SVG_H,
  STROKE, FILL,
} from './CountSquaresTIMO22P2Q18Illustration'
import { buildCountSquaresTIMO22P2Q18Steps } from './countSquaresTIMO22P2Q18Steps'

const GREEN = '#10B981'
const AMBER = '#D97706'
const BLUE  = '#3B82F6'
const INK   = '#1F2937'

// Two 2×2 overlay positions within a 3×2 block (local row/col, top-left of each 2×2).
const POS2 = [{ r: 0, c: 0 }, { r: 0, c: 1 }]

// 1×1 cell positions within a 3×2 block.
const CELLS_1X1 = Array.from({ length: 2 }, (_, r) =>
  Array.from({ length: 3 }, (__, c) => ({ r, c })),
).flat()

export default function CountSquaresTIMO22P2Q18Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildCountSquaresTIMO22P2Q18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: INK }

  const show1x1 = ['cells1x1', 'result'].includes(beat.phase)
  const show2x2 = ['cells2x2', 'result'].includes(beat.phase)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: 12 persegi 1×1 + 4 persegi 2×2 = 16 persegi.'
      : 'Explainer: 12 unit squares (1×1) + 4 squares (2×2) = 16 squares total.'

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(280, SVG_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={FILL} />

          {/* top-left 3×2 block */}
          <g transform={`translate(${TOP_X}, ${TOP_Y})`}>
            <GridBoard
              rows={2}
              cols={3}
              cellSize={CELL}
              gridStroke={STROKE}
              fill={show1x1 && !show2x2 ? () => '#D1FAE5' : undefined}
            />
          </g>

          {/* bottom-right 3×2 block */}
          <g transform={`translate(${BOT_X}, ${BOT_Y})`}>
            <GridBoard
              rows={2}
              cols={3}
              cellSize={CELL}
              gridStroke={STROKE}
              fill={show1x1 && !show2x2 ? () => '#D1FAE5' : undefined}
            />
          </g>

          {/* 1×1 green rings — top block */}
          <AnimatePresence>
            {show1x1 && !show2x2 && (
              <motion.g
                key="1x1-top"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                transform={`translate(${TOP_X}, ${TOP_Y})`}
              >
                {CELLS_1X1.map(({ r, c }) => (
                  <rect
                    key={`top-1x1-${r}-${c}`}
                    x={c * CELL + 2}
                    y={r * CELL + 2}
                    width={CELL - 4}
                    height={CELL - 4}
                    fill="none"
                    stroke={GREEN}
                    strokeWidth={2}
                    rx={2}
                  />
                ))}
              </motion.g>
            )}
          </AnimatePresence>

          {/* 1×1 green rings — bottom block */}
          <AnimatePresence>
            {show1x1 && !show2x2 && (
              <motion.g
                key="1x1-bot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                transform={`translate(${BOT_X}, ${BOT_Y})`}
              >
                {CELLS_1X1.map(({ r, c }) => (
                  <rect
                    key={`bot-1x1-${r}-${c}`}
                    x={c * CELL + 2}
                    y={r * CELL + 2}
                    width={CELL - 4}
                    height={CELL - 4}
                    fill="none"
                    stroke={GREEN}
                    strokeWidth={2}
                    rx={2}
                  />
                ))}
              </motion.g>
            )}
          </AnimatePresence>

          {/* 2×2 overlays — top block */}
          <AnimatePresence>
            {show2x2 && (
              <motion.g
                key="2x2-top"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                transform={`translate(${TOP_X}, ${TOP_Y})`}
              >
                {POS2.map(({ r, c }, i) => (
                  <rect
                    key={`top-2x2-${i}`}
                    x={c * CELL + 3}
                    y={r * CELL + 3}
                    width={2 * CELL - 6}
                    height={2 * CELL - 6}
                    fill={isResult ? '#D1FAE520' : '#FEF3C740'}
                    stroke={isResult ? GREEN : AMBER}
                    strokeWidth={1.5}
                    rx={2}
                  />
                ))}
              </motion.g>
            )}
          </AnimatePresence>

          {/* 2×2 overlays — bottom block */}
          <AnimatePresence>
            {show2x2 && (
              <motion.g
                key="2x2-bot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                transform={`translate(${BOT_X}, ${BOT_Y})`}
              >
                {POS2.map(({ r, c }, i) => (
                  <rect
                    key={`bot-2x2-${i}`}
                    x={c * CELL + 3}
                    y={r * CELL + 3}
                    width={2 * CELL - 6}
                    height={2 * CELL - 6}
                    fill={isResult ? '#D1FAE520' : '#FEF3C740'}
                    stroke={isResult ? GREEN : AMBER}
                    strokeWidth={1.5}
                    rx={2}
                  />
                ))}
              </motion.g>
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
