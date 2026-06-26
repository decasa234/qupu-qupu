import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { DiagShadedRectFigure } from './DiagShadedRectSASMO20G3Q21Illustration'
import { buildDiagShadedRectSASMO20G3Q21Steps } from './diagShadedRectSASMO20G3Q21Steps'

// SASMO-20-G3-Q21 explainer.
// Strategy: show the 6×4 grid, compute each unit square area, identify the
// shaded triangle as ½ the rectangle, then land on 48 cm².

const GREEN = '#10B981'

export default function DiagShadedRectSASMO20G3Q21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildDiagShadedRectSASMO20G3Q21Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Step-by-step: divide 96 cm² into 24 unit squares (4 cm² each); the shaded triangle is half the rectangle = 12 squares = 48 cm².',
    'Langkah demi langkah: bagi 96 cm² menjadi 24 petak (4 cm² tiap petak); segitiga yang diarsir adalah setengah persegi panjang = 12 petak = 48 cm².',
  )

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Figure with animation on beat change */}
        <motion.div
          key={beat.key}
          initial={{ opacity: 0.7, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="w-full"
        >
          <DiagShadedRectFigure
            highlightShaded={beat.highlightShaded}
            highlightAll={beat.highlightAll}
          />
        </motion.div>

        {/* Area label badge */}
        {beat.areaLabel && (
          <motion.div
            key={`area-${beat.key}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="rounded-lg border-2 px-4 py-1 font-display text-base font-extrabold"
            style={{
              background: beat.result ? '#D1FAE5' : '#ede9fe',
              borderColor: beat.result ? GREEN : '#7c6fb0',
              color: beat.result ? '#065F46' : '#4c1d95',
            }}
          >
            {beat.areaLabel}
          </motion.div>
        )}

        {/* Caption */}
        <motion.div
          key={`cap-${beat.key}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
