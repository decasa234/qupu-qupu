// RectTrianglesX24B13Explainer — SEAMOX-24-B-Q13
//
// Animated solution: derive rectangle area (hw = 216) from △BEC,
// then compute △AFB = 7hw/24 = 63 cm².
//
// Reuses RectTrianglesFigure from the illustration; adds framer-motion
// overlay for the equation reveal and beat-driven caption.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { RectTrianglesFigure } from './RectTrianglesX24B13Illustration'
import { buildRectTrianglesX24B13Steps } from './rectTrianglesX24B13Steps'

// ── Palette ───────────────────────────────────────────────────────────────────
const BRAND_BLUE = '#30598A'
const BRAND_BLUE_SHADOW = '#263B55'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const EQ_BLUE = '#1D4ED8'
const EQ_AMBER = '#B45309'

// ── Component ─────────────────────────────────────────────────────────────────

export default function RectTrianglesX24B13Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildRectTrianglesX24B13Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Animated solution: △BEC area = 5hw/18 = 60 → hw = 216; △AFB area = 7hw/24 = 7×216÷24 = 63 cm².',
    'Animasi solusi: luas △BEC = 5hw/18 = 60 → hw = 216; luas △AFB = 7hw/24 = 7×216÷24 = 63 cm².',
  )

  const eqColor =
    beat.result ? GREEN_INK
    : beat.phase === 'afb' || beat.phase === 'result' ? EQ_AMBER
    : EQ_BLUE

  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div
        className="flex min-h-[340px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: '#FFF9F4', borderColor: '#FFD3B1' }}
      >
        {/* ── Header banner ── */}
        <div
          className="relative flex w-full max-w-[340px] items-center justify-center overflow-hidden rounded-xl px-3 py-2"
          style={{ background: BRAND_BLUE }}
        >
          <div
            className="absolute inset-x-0 top-0 h-3 rounded-t-xl"
            style={{ background: BRAND_BLUE_SHADOW }}
          />
          <span
            className="relative font-display text-sm font-extrabold"
            style={{ color: '#FFF2DF' }}
          >
            {t('△BEC = 60 cm² → find △AFB', '△BEC = 60 cm² → cari △AFB')}
          </span>
        </div>

        {/* ── Figure ── */}
        <RectTrianglesFigure
          highlightBEC={beat.highlightBEC}
          highlightAFB={beat.highlightAFB}
          afbArea={beat.afbArea ?? undefined}
        />

        {/* ── Equation line ── */}
        <div className="flex min-h-[2rem] w-full items-center justify-center">
          {beat.equationLine && (
            <motion.div
              key={beat.phase + beat.equationLine}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="font-display text-base font-black tabular-nums"
              style={{ color: eqColor }}
            >
              {beat.equationLine}
            </motion.div>
          )}
        </div>

        {/* ── Caption ── */}
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
