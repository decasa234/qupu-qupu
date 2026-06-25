// AngleNestedX24B7Explainer — SEAMOX-24-B-Q7
//
// Animated step-by-step solution for "find the value of x".
// Reuses AngleNestedX24B7Figure from the illustration; beat-driven via
// useBeatControl; 5 beats: intro → inner-triangle → outer-corners → sum → result.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { AngleNestedX24B7Figure } from './AngleNestedX24B7Illustration'
import { buildAngleNestedX24B7Steps } from './angleNestedX24B7Steps'

// ── Palette ───────────────────────────────────────────────────────────────────
const BRAND_BLUE      = '#30598A'
const BRAND_BLUE_DARK = '#263B55'
const GREEN           = '#10B981'
const GREEN_INK       = '#065F46'
const EQ_INK          = '#B45309'  // amber for equation lines

// ── Component ─────────────────────────────────────────────────────────────────

export default function AngleNestedX24B7Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildAngleNestedX24B7Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Animated solution: inner triangle BPC gives α + β = 51°; outer triangle angle sum gives x + 47° + 51° = 180°, so x = 82°.',
    'Animasi solusi: segitiga dalam BPC memberi α + β = 51°; jumlah sudut segitiga luar memberi x + 47° + 51° = 180°, jadi x = 82°.',
  )

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[320px] flex-col items-center gap-3 rounded-2xl border-2 px-4 py-4"
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
            {t('Find the value of x°', 'Temukan nilai x°')}
          </span>
        </div>

        {/* Figure */}
        <AngleNestedX24B7Figure highlight={beat.highlight} showAnswer={beat.showAnswer} />

        {/* Equation line */}
        <div className="flex min-h-[2rem] w-full items-center justify-center">
          {beat.equationLine && (
            <motion.div
              key={beat.equationLine}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="font-display text-sm font-black tabular-nums"
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
