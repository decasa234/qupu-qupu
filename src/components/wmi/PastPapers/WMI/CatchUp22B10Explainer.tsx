// SEAMO-22-B-Q10 — Explainer: car-vs-motorcycle speed catch-up.
//
// Walks through the two equations beat-by-beat:
//   Eq 1: (60 − v) × 5 = d
//   Eq 2: (70 − v) × 3 = d
//   Solve: v = 45 km/h. Answer A.
//
// Reuses the road illustration from CatchUp22B10Illustration.
// Adapted from CarsLane9ECExplainer (badge + caption chip pattern)
// and FlagpoleCastle22Explainer (beat-control + motion kit).

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import CatchUp22B10Illustration from './CatchUp22B10Illustration'
import { buildCatchUp22B10Steps } from './catchUp22B10Steps'

const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE      = '#1D4ED8'
const BLUE_BG   = '#EFF6FF'
const AMBER     = '#D97706'
const AMBER_BG  = '#FFFBEB'
const MATH_BG   = '#F3F4F6'
const MATH_INK  = '#1F2937'

export default function CatchUp22B10Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCatchUp22B10Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result

  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const badgeStyle = { background: AMBER_BG, borderColor: AMBER, color: AMBER }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: dua persamaan menyusul diselesaikan untuk menemukan kecepatan motor 45 km/jam. Jawaban A.'
      : 'Explainer: two catch-up equations solved to find motorcycle speed 45 km/h. Answer A.'

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Step badge */}
        <div className="h-9 flex items-center justify-center">
          {beat.label && (
            <motion.div
              key={`badge-${index}`}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 340, damping: 20 }}
              className="rounded-full border-2 px-5 py-1 text-sm font-extrabold"
              style={badgeStyle}
            >
              {beat.label}
            </motion.div>
          )}
        </div>

        {/* Road illustration — always visible */}
        <div className="w-full flex justify-center">
          <CatchUp22B10Illustration lang={lang} />
        </div>

        {/* Math expression */}
        {beat.math && (
          <motion.div
            key={`math-${index}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="w-full rounded-xl border border-gray-200 px-4 py-2 text-center font-mono text-base font-bold"
            style={{ background: MATH_BG, color: MATH_INK }}
          >
            {beat.math}
          </motion.div>
        )}

        {/* Caption */}
        <motion.div
          key={`cap-${index}`}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="min-h-[48px] w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
