// TriangleDEFGOSN24NT1Q19Explainer — OSN-24-SD-NAS-TEORI1-Q19
//
// Animated beat-by-beat solution: subtract 3 corner triangles (BDE, CEF, AGD)
// from ABC to isolate DEFG.  Final answer: 5 cm².

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TriangleDEFGFigure } from './TriangleDEFGOSN24NT1Q19Illustration'
import { buildTriangleDEFGSteps } from './triangleDEFGOSN24NT1Q19Steps'

const BRAND_BLUE      = '#2E4E84'
const BRAND_BLUE_DARK = '#1E3A5F'
const GREEN           = '#10B981'
const GREEN_INK       = '#065F46'
const EQ_INK          = '#B45309'

export default function TriangleDEFGOSN24NT1Q19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildTriangleDEFGSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Animated solution: subtract triangles BDE (3 cm²), CEF (2 cm²), AGD (2 cm²) from ABC (12 cm²) to get DEFG = 5 cm².',
    'Animasi solusi: kurangi segitiga BDE (3 cm²), CEF (2 cm²), AGD (2 cm²) dari ABC (12 cm²) sehingga luas DEFG = 5 cm².',
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
            {t('Find area of quadrilateral DEFG', 'Cari luas segiempat DEFG')}
          </span>
        </div>

        {/* Figure */}
        <TriangleDEFGFigure highlight={beat.highlight} showAreaLabel />

        {/* Equation */}
        <div className="flex min-h-[1.8rem] w-full items-center justify-center">
          {beat.equationLine && (
            <motion.div
              key={beat.equationLine}
              initial={{ opacity: 0, y: 4 }}
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
