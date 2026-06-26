/**
 * OSN-08-SD-KAB-Q18 — post-answer explainer.
 *
 * Strategy: count the shaded unit squares, then multiply by 5 cm².
 *   Beat 0 — intro: show the grid + shaded polygon; task = count squares.
 *   Beat 1 — count: shaded area = 7.5 unit squares (highlight in blue).
 *   Beat 2 — result: 7.5 × 5 = 37.5 cm² (highlight in green).
 *
 * Reuses ShadedGridFigureOSN08KQ18 from ShadedGridOSN08KQ18Illustration.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ShadedGridFigureOSN08KQ18 } from './ShadedGridOSN08KQ18Illustration'
import { buildShadedGridOSN08KQ18Steps } from './shadedGridOSN08KQ18Steps'

// ── Colour tokens ─────────────────────────────────────────────────────────────

const BLUE      = '#2563EB'
const BLUE_BG   = '#EFF6FF'
const GREEN     = '#16A34A'
const GREEN_BG  = '#DCFCE7'
const GREEN_TEXT = '#14532D'

// ── Main explainer ────────────────────────────────────────────────────────────

export default function ShadedGridOSN08KQ18Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'

  const story = useMemo(() => buildShadedGridOSN08KQ18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.phase === 'result'

  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel = isResult
    ? 'Penjelasan: Daerah yang diarsir = 7,5 kotak satuan × 5 cm² = 37,5 cm².'
    : 'Penjelasan: Hitung kotak satuan yang diarsir pada grid 4×5.'

  return (
    <div
      className="mx-auto w-full max-w-[380px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">

        {/* Grid figure */}
        <ShadedGridFigureOSN08KQ18 fillOverride={beat.fillOverride} />

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
                style={{ background: isResult ? GREEN : BLUE }}
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
