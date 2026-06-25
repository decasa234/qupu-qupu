import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CircleSquareFigure } from './CircleSquareOSN07KQ14Illustration'
import { buildCircleSquareOSN07KQ14Steps } from './circleSquareOSN07KQ14Steps'

// OSN-07-SD-KAB-Q14 — animated explainer for circle-area from square DEFG.
//
// Beat plan (4 beats):
//   0  intro       — plain figure; F is centre, square area = 4
//   1  side = 2    — highlight side EF; "side = √4 = 2"
//   2  r = √2      — show dashed radius line F→centre; "r = √2"
//   3  area = 2π   — formula badge; "π × (√2)² = 2π"
//
// Imports CircleSquareFigure from the illustration so the animation reads
// as the static figure coming alive.

const GREEN = '#10B981'
const BLUE  = '#1E3A5F'

export default function CircleSquareOSN07KQ14Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildCircleSquareOSN07KQ14Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult    = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE,  color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: persegi DEFG bersisi 2 (dari luas 4); jari-jari lingkaran = √2 (jarak dari F ke pusat persegi); luas lingkaran = π(√2)² = 2π satuan luas.'
      : 'Explainer: square DEFG has side 2 (from area 4); circle radius = √2 (F to square centre); area = π(√2)² = 2π square units.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* animated figure */}
        <CircleSquareFigure
          showRadiusLine={beat.showRadiusLine}
          highlightCircle={beat.highlightCircle}
          highlightSide={beat.highlightSide}
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
