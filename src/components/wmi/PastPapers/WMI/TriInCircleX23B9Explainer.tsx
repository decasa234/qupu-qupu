import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TriInCirclePrimitive } from './TriInCircleX23B9Illustration'
import { buildTriInCircleX23B9Steps } from './triInCircleX23B9Steps'

// SEAMOX-23-B-Q9 — post-answer explainer.
//
// Beat plan (5 beats):
//   0. intro      — bare figure, no labels
//   1. small side — highlight small triangle; label 'a', show R = a/√3
//   2. big side   — highlight big triangle; show A/(2√3) = R
//   3. ratio side — both highlighted; label '2a', conclude A = 2a
//   4. result     — both; area ratio 1:4 → m+n = 5

const GREEN = '#059669'
const BLUE = '#1D4ED8'

export default function TriInCircleX23B9Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildTriInCircleX23B9Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const accentColor = isResult ? GREEN : BLUE
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#064E3B' }
    : { background: '#EFF6FF', borderColor: BLUE, color: '#1E3A8A' }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: sisi segitiga kecil = a, jari-jari R = a/√3; inradius segitiga besar = R sehingga sisi besar A = 2a; rasio luas = 1 : 4, m + n = 5.'
      : 'Explainer: small triangle side a gives circumradius R = a/√3; the big triangle inradius equals R so its side A = 2a; area ratio 1 to 4 gives m plus n equals 5.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Animated figure */}
        <TriInCirclePrimitive
          showLabels={beat.showLabels}
          highlightSmall={beat.highlightSmall}
          highlightBig={beat.highlightBig}
        />

        {/* Equation badge */}
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
                style={{ background: accentColor }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
        <div
          className="min-h-[3.5rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
