// HKIMO-24-P2H-Q20 — "How many interior angle(s) is / are there in the polygon below?"
//
// Beat-driven explainer: reveals vertex-dot labels in three waves (0→4→8→12),
// with an equation line and caption on each beat. Landing on answer = 12.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PolygonAnglesHK24P2Q20Figure } from './PolygonAnglesHK24P2Q20Illustration'
import { buildPolygonAnglesHK24P2Q20Steps } from './polygonAnglesHK24P2Q20Steps'

const BRAND_BLUE      = '#30598A'
const BRAND_BLUE_DARK = '#263B55'
const GREEN           = '#10B981'
const GREEN_INK       = '#065F46'
const EQ_INK          = '#B45309'

export default function PolygonAnglesHK24P2Q20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildPolygonAnglesHK24P2Q20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Animated solution: trace all 12 corners of the polygon — 12 interior angles in total.',
    'Animasi solusi: telusuri semua 12 sudut poligon — total 12 sudut dalam.',
  )

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[320px] flex-col items-center gap-3 rounded-2xl border-2 px-4 py-4"
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
          <span
            className="relative font-display text-sm font-extrabold"
            style={{ color: '#FFF2DF' }}
          >
            {t('Count interior angles', 'Hitung sudut dalam')}
          </span>
        </div>

        {/* Figure */}
        <PolygonAnglesHK24P2Q20Figure highlightCount={beat.highlightCount} />

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
