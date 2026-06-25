/**
 * SEAMO-21-A-Q15 — animated explainer for the shape-code question.
 *
 * Beats (see shapeCode21A15Steps.ts):
 *   0 — intro: show all panels
 *   1 — highlight Square+Diamond (41): Square=4 tens, Diamond=1 ones
 *   2 — highlight Circle+Triangle (23): Circle=2, Triangle=3
 *   3 — highlight Diamond+Triangle (13): Diamond=1, Triangle=3
 *   4 — highlight Circle+Square (?): apply rule
 *   5 — reveal: ? = 24, answer D
 *
 * Reuses ShapeCode21A15SVG from the illustration file.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ShapeCode21A15SVG } from './ShapeCode21A15Illustration'
import { buildShapeCode21A15Steps } from './shapeCode21A15Steps'

// ── colour tokens ──────────────────────────────────────────────────────────────
const BLUE     = '#30598A'
const BLUE_BG  = '#E1EFFB'
const GREEN    = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_T  = '#065F46'

// ── Explainer ──────────────────────────────────────────────────────────────────

export default function ShapeCode21A15Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildShapeCode21A15Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const captionStyle = beat.result
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_T }
    : { background: BLUE_BG,  borderColor: BLUE,  color: BLUE   }

  const ariaLabel = lang === 'id'
    ? 'Penjelasan: Setiap bentuk = digit rahasia. Lingkaran (2) luar + Kotak (4) dalam → 24, jawaban D.'
    : 'Explainer: Each shape encodes a digit. Circle (2) outer + Square (4) inner → 24, answer D.'

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Shape-code panels */}
        <div style={{ width: '100%' }}>
          <ShapeCode21A15SVG
            highlightPanel={beat.highlightPanel}
            revealAnswer={beat.revealAnswer}
          />
        </div>

        {/* Equation chip */}
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
                style={{ background: beat.result ? GREEN : BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
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
