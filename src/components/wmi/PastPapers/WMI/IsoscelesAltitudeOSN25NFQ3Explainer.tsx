// IsoscelesAltitudeOSN25NFQ3Explainer — OSN-25-SD-NAS-FINAL-Q3
//
// Animated solution: height from C → Area △ACB → BD via cos B → ratio → 864/25.
// Reuses IsoscelesAltitudeOSN25NFQ3Figure from the illustration.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoscelesAltitudeOSN25NFQ3Figure } from './IsoscelesAltitudeOSN25NFQ3Illustration'
import { buildIsoscelesAltitudeOSN25NFQ3Steps } from './isoscelesAltitudeOSN25NFQ3Steps'

const BRAND_BLUE      = '#30598A'
const BRAND_BLUE_DARK = '#263B55'
const GREEN           = '#10B981'
const GREEN_INK       = '#065F46'
const EQ_INK          = '#B45309'

export default function IsoscelesAltitudeOSN25NFQ3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildIsoscelesAltitudeOSN25NFQ3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Animated solution: height h=8 gives area △ACB=48; BD=36/5 via cos B=3/5; area △ABD = 48×18/25 = 864/25 cm².',
    'Animasi solusi: tinggi h=8 memberi luas △ACB=48; BD=36/5 dari cos B=3/5; luas △ABD = 48×18/25 = 864/25 cm².',
  )

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[340px] flex-col items-center gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: '#FFF9F4', borderColor: '#FFD3B1' }}
      >
        {/* Header */}
        <div
          className="relative flex w-full max-w-[320px] items-center justify-center overflow-hidden rounded-xl px-3 py-2"
          style={{ background: BRAND_BLUE }}
        >
          <div
            className="absolute inset-x-0 top-0 h-3 rounded-t-xl"
            style={{ background: BRAND_BLUE_DARK }}
          />
          <span className="relative font-display text-sm font-extrabold" style={{ color: '#FFF2DF' }}>
            {t('Find the area of △ABD', 'Cari luas △ABD')}
          </span>
        </div>

        {/* Figure */}
        <IsoscelesAltitudeOSN25NFQ3Figure
          highlight={beat.highlight}
          showAnswer={beat.showAnswer}
        />

        {/* Equation line */}
        <div className="flex min-h-[2.25rem] w-full items-center justify-center px-2">
          {beat.equationLine && (
            <motion.div
              key={beat.equationLine}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center font-display text-xs font-black tabular-nums"
              style={{ color: beat.result ? GREEN_INK : EQ_INK }}
            >
              {beat.equationLine}
            </motion.div>
          )}
        </div>

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
