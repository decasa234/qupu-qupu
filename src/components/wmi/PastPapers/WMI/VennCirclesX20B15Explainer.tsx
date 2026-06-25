/**
 * SEAMOX-20-B-Q15 — animated explainer for the 3-circle Venn sum question.
 *
 * Beats:
 *   0 — intro: show full Venn diagram.
 *   1 — highlight top circle, show equation A + 4 + D + 1 = 15.
 *   2 — highlight bottom-left, show B + 4 + D + 6 = 15.
 *   3 — highlight bottom-right, show C + 1 + D + 6 = 15.
 *   4 — reveal solved values (D=3, A=7, B=2, C=5).
 *   5 — result: A = 7.
 *
 * Reuses VennCirclesX20B15SVG from the illustration file.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { VennCirclesX20B15SVG } from './VennCirclesX20B15Illustration'
import { buildVennCirclesX20B15Steps } from './vennCirclesX20B15Steps'

// ── Colour tokens ──────────────────────────────────────────────────────────────

const BLUE     = '#30598A'
const BLUE_BG  = '#E1EFFB'
const GREEN    = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_TXT = '#065F46'

// ── Main explainer ─────────────────────────────────────────────────────────────

export default function VennCirclesX20B15Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildVennCirclesX20B15Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const captionStyle = beat.result
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TXT }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Setiap lingkaran berjumlah 15. Dari persamaan ketiga lingkaran: A+D=10, B+D=5, C+D=8. Dengan D=3 dari {2,3,5,7}: A=7, B=2, C=5. Jawaban: A = 7.'
      : 'Explainer: Each circle sums to 15. The three circle equations give A+D=10, B+D=5, C+D=8. Setting D=3 from {2,3,5,7} gives A=7, B=2, C=5. Answer: A = 7.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Venn diagram */}
        <div className="flex justify-center">
          <VennCirclesX20B15SVG
            highlightCircle={beat.highlightCircle}
            solved={beat.solved}
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
