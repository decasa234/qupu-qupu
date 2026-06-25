// HKIMO-20-P2H-Q19 post-answer explainer: counting interior angles.
//
// Beat plan (14 beats):
//   0. intro      — plain polygon; explain vertex = interior angle
//   1-12. count   — highlight vertices one by one; running counter badge
//   13. result    — all 12 green; "12 corners → 12 interior angles"
//
// Reuses PinwheelPolygon from PolygonHK20P2Q19Illustration.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PinwheelPolygon } from './PolygonHK20P2Q19Illustration'
import { buildPolygonHK20P2Q19Steps } from './polygonHK20P2Q19Steps'

const BLUE = '#2563EB'
const BLUE_BG = '#EFF6FF'
const GREEN = '#059669'
const GREEN_BG = '#D1FAE5'
const GREEN_TEXT = '#065F46'

export default function PolygonHK20P2Q19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildPolygonHK20P2Q19Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: hitung setiap pojok segibanyak — ada 12 pojok, jadi ada 12 sudut dalam. Jawaban: 12.'
      : 'Explainer: count every corner of the polygon — 12 corners means 12 interior angles. Answer: 12.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* polygon with progressive vertex highlights */}
        <PinwheelPolygon countedUpTo={beat.countedUpTo} />

        {/* running counter badge */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.badge !== '' && (
              <motion.span
                key={beat.badge}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : BLUE }}
              >
                {beat.badge}
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
