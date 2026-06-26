// TiledSquareSASMO19G4Q17Explainer — SASMO-19-G4-Q17
//
// Animated step-by-step solution for "Find the perimeter of the big square".
// Reuses TiledSquareSASMO19G4Q17Figure from the illustration.
// Beat-driven via useBeatControl (4 beats).

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TiledSquareSASMO19G4Q17Figure } from './TiledSquareSASMO19G4Q17Illustration'
import { buildTiledSquareSASMO19G4Q17Steps } from './tiledSquareSASMO19G4Q17Steps'

// ── Palette ───────────────────────────────────────────────────────────────────
const BRAND_BLUE      = '#30598A'
const BRAND_BLUE_DARK = '#263B55'
const GREEN           = '#10B981'
const GREEN_INK       = '#065F46'
const EQ_INK          = '#B45309'

// ── Component ─────────────────────────────────────────────────────────────────
export default function TiledSquareSASMO19G4Q17Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildTiledSquareSASMO19G4Q17Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Animated solution: small square side = 8 cm; big square side = 2 + 8 + 2 = 12 cm; perimeter = 4 × 12 = 48 cm.',
    'Animasi solusi: sisi persegi kecil = 8 cm; sisi persegi besar = 2 + 8 + 2 = 12 cm; keliling = 4 × 12 = 48 cm.',
  )

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[360px] flex-col items-center gap-3 rounded-2xl border-2 px-4 py-4"
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
            {t('Find the perimeter of the big square', 'Temukan keliling persegi besar')}
          </span>
        </div>

        {/* Figure */}
        <TiledSquareSASMO19G4Q17Figure
          highlight={beat.highlight}
          showAnswer={beat.showAnswer}
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
