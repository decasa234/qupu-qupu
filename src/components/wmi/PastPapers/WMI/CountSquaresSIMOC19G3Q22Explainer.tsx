// Post-answer explainer for SIMOC-19-G3-Q22.
// "Berapa banyak persegi yang terdapat pada gambar di bawah ini?"
// Answer: 27.
//
// Animation strategy:
//   Beat 0 – bare figure, no highlights
//   Beat 1 – amber overlay on all 17 unit cells (1×1 = 17)
//   Beat 2 – green outlines on all 8 two-by-two squares (2×2 = 8)
//   Beat 3 – blue outlines on both three-by-three squares (3×3 = 2)
//   Beat 4 – total = 27 revealed

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  FIGURE_CELLS,
  TWO_X_TWO_UL,
  THREE_X_THREE_UL,
} from './CountSquaresSIMOC19G3Q22Illustration'
import { buildCountSquaresSIMOC19G3Q22Steps } from './countSquaresSIMOC19G3Q22Steps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const AMBER       = '#F59E0B'
const GREEN       = '#10B981'
const BLUE        = '#3B82F6'
const RESULT_GREEN = '#065F46'

// ── geometry ──────────────────────────────────────────────────────────────────
const CS  = 44        // cell size in px
const PAD = 6         // padding
const VBW = 5 * CS + PAD * 2  // 232
const VBH = VBW                // 232

/** Pixel x-coord of a column left edge. */
const px = (c: number) => PAD + c * CS
/** Pixel y-coord of a row top edge. */
const py = (r: number) => PAD + r * CS

// ── component ─────────────────────────────────────────────────────────────────

export default function CountSquaresSIMOC19G3Q22Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCountSquaresSIMOC19G3Q22Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: hitung semua persegi berdasarkan ukuran. 1×1=17, 2×2=8, 3×3=2. Total=27.'
      : 'Explainer: count all squares by size. 1×1=17, 2×2=8, 3×3=2. Total=27.'

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Figure SVG with highlight overlays */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2">
          <svg
            viewBox={`0 0 ${VBW} ${VBH}`}
            width={VBW}
            height={VBH}
            role="presentation"
            style={{ display: 'block' }}
          >
            {/* Layer 1: base white fill for each figure cell */}
            {FIGURE_CELLS.map(([r, c], i) => (
              <rect
                key={`base-${i}`}
                x={px(c)}
                y={py(r)}
                width={CS}
                height={CS}
                fill="#FFFFFF"
              />
            ))}

            {/* Layer 2a: 1×1 amber overlay */}
            {beat.show1x1 && (
              <motion.g
                key="hl-1x1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {FIGURE_CELLS.map(([r, c], i) => (
                  <rect
                    key={`a1-${i}`}
                    x={px(c) + 3}
                    y={py(r) + 3}
                    width={CS - 6}
                    height={CS - 6}
                    fill={AMBER}
                    fillOpacity={0.45}
                    rx={2}
                  />
                ))}
              </motion.g>
            )}

            {/* Layer 2b: 2×2 green outlines */}
            {beat.show2x2 && (
              <motion.g
                key="hl-2x2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {TWO_X_TWO_UL.map(([r, c], i) => (
                  <rect
                    key={`a2-${i}`}
                    x={px(c) + 2}
                    y={py(r) + 2}
                    width={CS * 2 - 4}
                    height={CS * 2 - 4}
                    fill={GREEN}
                    fillOpacity={0.18}
                    stroke={GREEN}
                    strokeWidth={3}
                    rx={3}
                  />
                ))}
              </motion.g>
            )}

            {/* Layer 2c: 3×3 blue outlines */}
            {beat.show3x3 && (
              <motion.g
                key="hl-3x3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {THREE_X_THREE_UL.map(([r, c], i) => (
                  <rect
                    key={`a3-${i}`}
                    x={px(c) + 2}
                    y={py(r) + 2}
                    width={CS * 3 - 4}
                    height={CS * 3 - 4}
                    fill={BLUE}
                    fillOpacity={0.15}
                    stroke={BLUE}
                    strokeWidth={4}
                    rx={4}
                  />
                ))}
              </motion.g>
            )}

            {/* Layer 3: grid lines on top (always visible) */}
            {FIGURE_CELLS.map(([r, c], i) => (
              <rect
                key={`grid-${i}`}
                x={px(c)}
                y={py(r)}
                width={CS}
                height={CS}
                fill="none"
                stroke="#374151"
                strokeWidth={2}
              />
            ))}
          </svg>
        </div>

        {/* Running size count */}
        {beat.sizeCount > 0 && (
          <motion.div
            key={`count-${beat.sizeCount}-${beat.phase}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-3xl font-black tabular-nums"
            style={{ color: beat.result ? RESULT_GREEN : '#30598A' }}
          >
            {beat.sizeCount}
          </motion.div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: RESULT_GREEN }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
