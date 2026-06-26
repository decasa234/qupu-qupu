// SIMOC-23-G1-Q9 — animated explainer for counting squares.
//
// Animation beats (7 total):
//   0  intro     — show the figure, prompt to count all sizes.
//   1  corners   — highlight the 4 corner squares in amber.
//   2  cells1x1  — green tint all 16 inner cells (1×1 count).
//   3  cells2x2  — amber overlay for the 9 possible 2×2 squares.
//   4  cells3x3  — blue overlay for the 4 possible 3×3 squares.
//   5  cells4x4  — purple outline for the single 4×4 square.
//   6  result    — green banner: 4+16+9+4+1 = 34 → A.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { GridBoard } from './primitives/GridBoard'
import {
  CELL,
  CORNER_SZ,
  GAP,
  PAD,
  GRID_X,
  GRID_Y,
  GRID_W,
  GRID_H,
  SVG_W,
  SVG_H,
  CORNERS,
  STROKE,
  FILL,
} from './CountSquaresSIMOC23G1Q9Illustration'
import { buildCountSquaresSIMOC23G1Q9Steps } from './countSquaresSIMOC23G1Q9Steps'

const GREEN  = '#10B981'
const AMBER  = '#D97706'
const BLUE   = '#3B82F6'
const PURPLE = '#8B5CF6'
const INK    = '#1F2937'

// ── 2×2 overlay positions (9 total) ─────────────────────────────────────────
// Each is {r, c} top-left in grid-cell coords; span = 2 cells.
const POS2: { r: number; c: number }[] = []
for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) POS2.push({ r, c })

// ── 3×3 overlay positions (4 total) ─────────────────────────────────────────
const POS3: { r: number; c: number }[] = []
for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) POS3.push({ r, c })

// ── Main explainer ────────────────────────────────────────────────────────────

export default function CountSquaresSIMOC23G1Q9Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildCountSquaresSIMOC23G1Q9Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE,  color: INK }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: 4 persegi sudut + 16 (1×1) + 9 (2×2) + 4 (3×3) + 1 (4×4) = 34 — jawaban A.'
      : 'Explainer: 4 corner squares + 16 (1×1) + 9 (2×2) + 4 (3×3) + 1 (4×4) = 34 — answer A.'

  const showCorners = ['corners', 'result'].includes(beat.phase)
  const show1x1    = ['cells1x1', 'result'].includes(beat.phase)
  const show2x2    = ['cells2x2', 'result'].includes(beat.phase)
  const show3x3    = ['cells3x3', 'result'].includes(beat.phase)
  const show4x4    = ['cells4x4', 'result'].includes(beat.phase)

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(300, SVG_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={FILL} />

          {/* corner squares base */}
          {CORNERS.map((pos, i) => (
            <rect
              key={`corner-base-${i}`}
              x={pos.x}
              y={pos.y}
              width={CORNER_SZ}
              height={CORNER_SZ}
              fill={FILL}
              stroke={STROKE}
              strokeWidth={2}
            />
          ))}

          {/* corner highlight overlay */}
          <AnimatePresence>
            {showCorners && (
              <motion.g
                key="corner-highlight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                {CORNERS.map((pos, i) => (
                  <rect
                    key={`corner-hl-${i}`}
                    x={pos.x + 2}
                    y={pos.y + 2}
                    width={CORNER_SZ - 4}
                    height={CORNER_SZ - 4}
                    fill={isResult ? '#D1FAE5' : '#FEF3C7'}
                    stroke={isResult ? GREEN : AMBER}
                    strokeWidth={2.5}
                    rx={3}
                  />
                ))}
              </motion.g>
            )}
          </AnimatePresence>

          {/* centre 4×4 grid (base) */}
          <g transform={`translate(${GRID_X}, ${GRID_Y})`}>
            <GridBoard
              rows={4}
              cols={4}
              cellSize={CELL}
              gridStroke={STROKE}
              fill={
                show1x1 && !isResult
                  ? () => '#D1FAE5'   // green tint all cells
                  : undefined
              }
            />
          </g>

          {/* 1×1 beat: green border on every cell */}
          <AnimatePresence>
            {show1x1 && !show2x2 && !show3x3 && !show4x4 && (
              <motion.g
                key="cells-1x1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                transform={`translate(${GRID_X}, ${GRID_Y})`}
              >
                {Array.from({ length: 4 }, (_, r) =>
                  Array.from({ length: 4 }, (__, c) => (
                    <rect
                      key={`1x1-${r}-${c}`}
                      x={c * CELL + 2}
                      y={r * CELL + 2}
                      width={CELL - 4}
                      height={CELL - 4}
                      fill="none"
                      stroke={GREEN}
                      strokeWidth={2}
                      rx={2}
                    />
                  )),
                )}
              </motion.g>
            )}
          </AnimatePresence>

          {/* 2×2 overlays (9 semi-transparent rectangles) */}
          <AnimatePresence>
            {show2x2 && (
              <motion.g
                key="cells-2x2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                transform={`translate(${GRID_X}, ${GRID_Y})`}
              >
                {POS2.map(({ r, c }, i) => (
                  <rect
                    key={`2x2-${i}`}
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

          {/* 3×3 overlays (4 rectangles) */}
          <AnimatePresence>
            {show3x3 && (
              <motion.g
                key="cells-3x3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                transform={`translate(${GRID_X}, ${GRID_Y})`}
              >
                {POS3.map(({ r, c }, i) => (
                  <rect
                    key={`3x3-${i}`}
                    x={c * CELL + 4}
                    y={r * CELL + 4}
                    width={3 * CELL - 8}
                    height={3 * CELL - 8}
                    fill={isResult ? '#DBEAFE20' : '#DBEAFE50'}
                    stroke={isResult ? GREEN : BLUE}
                    strokeWidth={2}
                    strokeDasharray="5 3"
                    rx={2}
                  />
                ))}
              </motion.g>
            )}
          </AnimatePresence>

          {/* 4×4 overlay (1 rectangle = entire grid) */}
          <AnimatePresence>
            {show4x4 && (
              <motion.g
                key="cells-4x4"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                style={{ transformOrigin: `${GRID_X + GRID_W / 2}px ${GRID_Y + GRID_H / 2}px` }}
              >
                <rect
                  x={GRID_X + 5}
                  y={GRID_Y + 5}
                  width={GRID_W - 10}
                  height={GRID_H - 10}
                  fill={isResult ? '#EDE9FE30' : '#EDE9FE60'}
                  stroke={isResult ? GREEN : PURPLE}
                  strokeWidth={3}
                  rx={4}
                />
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
