// ParallelTriangleOSN07KQ6Explainer — OSN-07-SD-KAB-Q6
//
// Animated step-by-step solution for "∠DCE + ∠DAF = ?"
// Reuses ParallelTriangleOSN07KQ6Figure; beat-driven via useBeatControl;
// 5 beats: intro → equilateral triangle → ∠DAF → ∠DCE → sum result.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ParallelTriangleOSN07KQ6Figure } from './ParallelTriangleOSN07KQ6Illustration'
import { buildParallelTriangleOSN07KQ6Steps } from './parallelTriangleOSN07KQ6Steps'

// ── Palette ───────────────────────────────────────────────────────────────────
const BRAND_BLUE      = '#30598A'
const BRAND_BLUE_DARK = '#263B55'
const GREEN           = '#10B981'
const GREEN_INK       = '#065F46'
const EQ_INK          = '#B45309'

// ── Component ─────────────────────────────────────────────────────────────────

export default function ParallelTriangleOSN07KQ6Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildParallelTriangleOSN07KQ6Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Animated solution: triangle BEF equilateral gives ∠FBE = 60°; ∠DAF = 90° by right angle at A; AB ∥ DC gives ∠DCE = 60°; sum = 150°.',
    'Animasi solusi: segitiga BEF sama sisi memberi ∠FBE = 60°; ∠DAF = 90° dari sudut siku-siku di A; AB ∥ DC memberi ∠DCE = 60°; jumlah = 150°.',
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
            {t('Find ∠DCE + ∠DAF', 'Cari ∠DCE + ∠DAF')}
          </span>
        </div>

        {/* Figure */}
        <ParallelTriangleOSN07KQ6Figure
          highlight={beat.highlight}
          showAnswer={beat.showAnswer}
          width={340}
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
