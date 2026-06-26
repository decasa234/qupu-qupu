import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TrapezoidFigure } from './TrapezoidOSN15NQ15Illustration'
import { buildTrapezoidOSN15NQ15Steps } from './trapezoidOSN15NQ15Steps'

// OSN-15-SD-NAS-Q15 — animated explainer for trapezoid area ratio.
//
// Beat plan (6 beats):
//   0  intro        — plain figure; "AB ∥ DC, AB = 3×DC, P on DC"
//   1  assign sides — highlight AB + DC in amber; "DC=1, AB=3"
//   2  height       — dashed height line; "shared height h"
//   3  tri area     — fill triangle ABP; "3h/2"
//   4  trap area    — "2h"
//   5  ratio        — fill triangle + badge; "3:4" (answer)

const GREEN = '#10B981'
const BLUE  = '#1E3A5F'

export default function TrapezoidOSN15NQ15Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildTrapezoidOSN15NQ15Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult     = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE,  color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Trapesium ABCD, AB sejajar DC, AB=3×DC. Luas △ABP = 3h/2, luas trapesium = 2h. Rasio = 3:4.'
      : 'Explainer: Trapezoid ABCD, AB ∥ DC, AB=3×DC. Area △ABP = 3h/2, trapezoid area = 2h. Ratio = 3:4.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* animated figure */}
        <TrapezoidFigure
          fillTriangle={beat.fillTriangle}
          highlightAB={beat.highlightAB}
          highlightDC={beat.highlightDC}
          showHeight={beat.showHeight}
        />

        {/* equation badge */}
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
