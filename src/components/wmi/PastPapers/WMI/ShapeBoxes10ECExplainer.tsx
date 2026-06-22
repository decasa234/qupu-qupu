/**
 * IKMC-21-EC-Q10 explainer — "Which shape must Sofie pick from box 4?"
 *
 * Strategy: scan each box, spot that diamond is unique to box 4 → forced pick.
 * Imports the ShapeBoxes10EC primitive from the Illustration file so the scene
 * reads as the same figure the student saw in the question.
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ShapeBoxes10EC } from './ShapeBoxes10ECIllustration'
import { buildShapeBoxes10ECSteps } from './shapeBoxes10ECSteps'

// qupu colour tokens
const BLUE = '#30598A'
const ORANGE = '#f0853a'
const SHELL = '#FFF9F4'
const RIM = '#E4DACB'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'

export default function ShapeBoxes10ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildShapeBoxes10ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    'Strategy: the diamond shape appears only in box 4, so box 4 is forced to pick the diamond — answer E.',
    'Strategi: bentuk belah ketupat hanya ada di kotak 4, sehingga kotak 4 terpaksa memilih belah ketupat — jawaban E.',
  )

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[220px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: RIM }}
      >
        {/* phase label */}
        <div className="flex h-6 items-center">
          <motion.span
            key={`phase-${beat.phase}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="font-display text-xs font-extrabold uppercase tracking-widest"
            style={{ color: beat.result ? GREEN : BLUE }}
          >
            {beat.result
              ? T('Answer found!', 'Jawaban ditemukan!')
              : beat.phase === 'deduction'
                ? T('Key insight', 'Insight kunci')
                : beat.phase === 'goal'
                  ? T('Goal', 'Tujuan')
                  : T(
                      `Checking box ${(beat.litBox ?? 0) + 1}`,
                      `Cek kotak ${(beat.litBox ?? 0) + 1}`,
                    )}
          </motion.span>
        </div>

        {/* the five boxes — bind the primitive */}
        <ShapeBoxes10EC
          litBox={beat.litBox}
          highlightDiamond={beat.highlightDiamond}
        />

        {/* caption */}
        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : beat.phase === 'deduction'
                ? { background: '#FFF2DF', borderColor: ORANGE, color: ORANGE }
                : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>

        {/* final answer badge */}
        {beat.result && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 340, damping: 18 }}
            className="flex items-center gap-2 rounded-2xl border-2 px-5 py-2"
            style={{ background: '#D1FAE5', borderColor: GREEN }}
          >
            <span className="font-display text-2xl font-black" style={{ color: GREEN_INK }}>
              E
            </span>
            <span className="font-display text-sm font-extrabold" style={{ color: GREEN_INK }}>
              {T('diamond', 'belah ketupat')}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  )
}
