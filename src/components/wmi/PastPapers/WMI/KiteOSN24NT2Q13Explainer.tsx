// KiteOSN24NT2Q13Explainer — OSN-24-SD-NAS-TEORI2-Q13
//
// Animated step-by-step solution for the kite ABCD question.
// Reuses KiteOSN24NT2Q13Figure from the illustration.
// Beats: intro → equal-short sides → isosceles △ABD → base angles → BD answer.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { KiteOSN24NT2Q13Figure } from './KiteOSN24NT2Q13Illustration'
import { buildKiteOSN24NT2Q13Steps } from './kiteOSN24NT2Q13Steps'

// ── Palette ───────────────────────────────────────────────────────────────────
const BRAND_BLUE      = '#30598A'
const BRAND_BLUE_DARK = '#263B55'
const GREEN           = '#059669'
const GREEN_INK       = '#065F46'
const EQ_INK          = '#B45309'

// ── Component ─────────────────────────────────────────────────────────────────

export default function KiteOSN24NT2Q13Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildKiteOSN24NT2Q13Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Animated solution: kite ABCD, AB = AD = 5 cm; triangle ABD is isosceles with base angles 22.6°; by law of sines BD = 10·cos(22.6°) ≈ 9.23 cm.',
    'Animasi solusi: layang-layang ABCD, AB = AD = 5 cm; segitiga ABD sama kaki dengan sudut alas 22,6°; aturan sinus BD = 10·cos(22,6°) ≈ 9,23 cm.',
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
          style={{ background: BRAND_BLUE }}
        >
          <div
            className="absolute inset-x-0 top-0 h-3 rounded-t-xl"
            style={{ background: BRAND_BLUE_DARK }}
          />
          <span className="relative font-display text-sm font-extrabold" style={{ color: '#FFF2DF' }}>
            {t('Find the length of BD', 'Tentukan panjang BD')}
          </span>
        </div>

        {/* Figure */}
        <KiteOSN24NT2Q13Figure
          highlight={beat.highlight}
          showAnswer={beat.showAnswer}
          lang={lang}
        />

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
