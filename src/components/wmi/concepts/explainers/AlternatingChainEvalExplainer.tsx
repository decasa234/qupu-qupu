import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildWalkSteps, type WalkParams } from './walkSteps'
import { useBeatControl } from './useBeatControl'

const TRACK = '#e6dcc6'
const ORANGE = '#F97316'

export default function AlternatingChainEvalExplainer({ params, lang = 'en', step, onStepCount, onStepChange }: ExplainerProps) {
  const p = params as WalkParams
  const story = useMemo(() => buildWalkSteps(p, lang), [p, lang])
  const index = useBeatControl(story.finalIndex, { step, onStepCount, onStepChange, holds: story.steps.map((s) => s.hold) })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  // Keep the marker inside the track (4%..96%).
  const leftPct = 4 + beat.frac * 92

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: jalan di garis bilangan — maju untuk +, mundur untuk −.'
      : 'Strategy: walk a number line — step right for +, left for −.'

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="font-display text-3xl font-black tabular-nums text-qupu-brand-blue">{beat.total}</div>

        <div className="relative h-8 w-full">
          <div
            className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full"
            style={{ background: TRACK }}
          />
          <motion.div
            className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white"
            style={{ background: ORANGE }}
            initial={false}
            animate={{ left: `${leftPct}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          />
        </div>

        <div className="h-5 font-display text-sm font-extrabold" style={{ color: ORANGE }}>
          {beat.hop ?? ''}
        </div>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: '#10B981', color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
