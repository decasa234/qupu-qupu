import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TwoCirclesTangentFigure } from './TwoCirclesTangentOSN24NT1Q18Illustration'
import { buildTwoCirclesTangentOSN24NT1Q18Steps } from './twoCirclesTangentOSN24NT1Q18Steps'

// OSN-24-SD-NAS-TEORI1-Q18 — animated explainer.
//
// Beat plan (6 beats):
//   0  intro       — two circles, A B T labelled
//   1  AT = BT = 5 — dimension labels appear
//   2  circle A    — dashed radii highlighted, "3-4-5 triangle" tangent = 3
//   3  circle B    — dashed radii highlighted, "3-4-5 triangle" tangent = 4
//   4  rectangle   — hatched quad highlighted, width×height shown
//   5  answer      — 5 × 4.8 = 24 cm²

const GREEN = '#059669'
const BLUE  = '#1E3A5F'

export default function TwoCirclesTangentOSN24NT1Q18Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'id'
  const story = useMemo(() => buildTwoCirclesTangentOSN24NT1Q18Steps(lang), [lang])
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
      ? 'Penjelasan: T titik tengah AB=10 sehingga AT=BT=5; singgung dari T ke lingkaran A=3 dan ke B=4 (segitiga 3-4-5); empat titik singgung membentuk persegi panjang 5×4,8 cm; luas=24 cm².'
      : 'Explainer: T midpoint of AB=10 so AT=BT=5; tangent from T to circle A=3 and to B=4 (3-4-5 triangles); 4 tangent points form a 5×4.8 rectangle; area=24 cm².'

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* animated figure */}
        <TwoCirclesTangentFigure
          showHatch={beat.showHatch}
          showRadii={beat.showRadii}
          showRightAngles={beat.showRightAngles}
          showTangentLines={beat.showTangentLines}
          highlightRect={beat.highlightRect}
          showDimensions={beat.showDimensions}
          showPointLabels={beat.showPointLabels}
          highlightRadiiA={beat.highlightRadiiA}
          highlightRadiiB={beat.highlightRadiiB}
          highlightShaded={beat.highlightShaded}
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
