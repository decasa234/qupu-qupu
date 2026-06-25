// HexagonAnglesHK23P1SFQ17Explainer — HKIMO-23-P1SF-Q17
//
// Animated step-by-step: number each of the 6 vertices to show there are 6 interior angles.
// Reuses HexagonAnglesHK23P1SFQ17Figure; beat-driven via useBeatControl.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { HexagonAnglesHK23P1SFQ17Figure } from './HexagonAnglesHK23P1SFQ17Illustration'
import { buildHexagonAnglesHK23P1SFQ17Steps } from './hexagonAnglesHK23P1SFQ17Steps'

const BRAND_BLUE      = '#30598A'
const BRAND_BLUE_DARK = '#263B55'
const GREEN           = '#10B981'
const GREEN_INK       = '#065F46'
const EQ_INK          = '#B45309'

export default function HexagonAnglesHK23P1SFQ17Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildHexagonAnglesHK23P1SFQ17Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Animated solution: label the 6 vertices of the concave hexagon — each vertex has one interior angle — total 6 interior angles.',
    'Animasi solusi: beri nomor 6 titik sudut segi enam cekung — setiap titik sudut memiliki satu sudut dalam — total 6 sudut dalam.',
  )

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[340px] flex-col items-center gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: '#FFF9F4', borderColor: '#FFD3B1' }}
      >
        {/* Header */}
        <div
          className="relative flex w-full max-w-[310px] items-center justify-center overflow-hidden rounded-xl px-3 py-2"
          style={{ background: BRAND_BLUE }}
        >
          <div
            className="absolute inset-x-0 top-0 h-3 rounded-t-xl"
            style={{ background: BRAND_BLUE_DARK }}
          />
          <span className="relative font-display text-sm font-extrabold" style={{ color: '#FFF2DF' }}>
            {t('Count the interior angles', 'Hitung sudut dalam')}
          </span>
        </div>

        {/* Figure */}
        <HexagonAnglesHK23P1SFQ17Figure highlight={beat.highlight} />

        {/* Count line */}
        <div className="flex min-h-[2rem] w-full items-center justify-center">
          {beat.countLine && (
            <motion.div
              key={beat.countLine}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="font-display text-sm font-black tabular-nums"
              style={{ color: beat.result ? GREEN_INK : EQ_INK }}
            >
              {beat.countLine}
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
