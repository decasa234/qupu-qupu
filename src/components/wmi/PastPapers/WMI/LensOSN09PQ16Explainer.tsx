// LensOSN09PQ16Explainer — OSN-09-SD-PROV-Q16
//
// Animated step-by-step solution for the lens-area problem.
// Beats: intro → sector₁ → both sectors → subtract square → answer.
// Reuses LensOSN09PQ16Figure from the illustration; driven by useBeatControl.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { LensOSN09PQ16Figure } from './LensOSN09PQ16Illustration'
import { buildLensOSN09PQ16Steps } from './lensOSN09PQ16Steps'

// ── Palette ───────────────────────────────────────────────────────────────────
const BRAND      = '#30598A'
const BRAND_DARK = '#263B55'
const GREEN      = '#10B981'
const GREEN_INK  = '#065F46'
const EQ_INK     = '#B45309'

// ── Component ─────────────────────────────────────────────────────────────────

export default function LensOSN09PQ16Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildLensOSN09PQ16Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Animated solution: each arc is a quarter-circle of radius 7 cm. Two sectors sum to 49π/2 cm². Lens = 49π/2 − 49 = 49(π/2 − 1) cm².',
    'Animasi solusi: setiap busur adalah seperempat lingkaran berjari-jari 7 cm. Dua sektor berjumlah 49π/2 cm². Daun = 49π/2 − 49 = 49(π/2 − 1) cm².',
  )

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[340px] flex-col items-center gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: '#FFF9F4', borderColor: '#FFD3B1' }}
      >
        {/* Header */}
        <div
          className="relative flex w-full max-w-[340px] items-center justify-center overflow-hidden rounded-xl px-3 py-2"
          style={{ background: BRAND }}
        >
          <div
            className="absolute inset-x-0 top-0 h-3 rounded-t-xl"
            style={{ background: BRAND_DARK }}
          />
          <span
            className="relative font-display text-sm font-extrabold"
            style={{ color: '#FFF2DF' }}
          >
            {t('Lens Area (Daun)', 'Luas Daun')}
          </span>
        </div>

        {/* Figure */}
        <LensOSN09PQ16Figure highlight={beat.highlight} showAnswer={beat.showAnswer} />

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
              : { background: '#E1EFFB', borderColor: BRAND, color: BRAND }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
