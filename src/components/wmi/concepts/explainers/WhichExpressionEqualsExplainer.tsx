import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildCompareSteps, type CompareParams } from './compareSteps'
import { useBeatControl } from './useBeatControl'

const GREEN = '#065F46'
const MUTED = '#9aa3b2'

export default function WhichExpressionEqualsExplainer({ params, lang = 'en', step, playing, onStepCount, onStepChange, onPlayEnd }: ExplainerProps) {
  const p = params as CompareParams
  const story = useMemo(() => buildCompareSteps(p, lang), [p, lang])
  const index = useBeatControl(story.finalIndex, { step, playing, onStepCount, onStepChange, onPlayEnd, holds: story.steps.map((s) => s.hold) })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: hitung tiap pilihan, lalu cari yang sama dengan target.'
      : 'Strategy: work out each option, then find the one that equals the target.'

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col gap-2">
        <div className="text-center font-display text-base font-extrabold text-qupu-brand-blue">
          Target: <span className="tabular-nums">{story.target}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {story.rows.map((r, i) => {
            const evaluated = i < beat.evaluated
            const spotlight = beat.spotlight && r.match
            return (
              <div
                key={r.label}
                className="flex items-center justify-between gap-3 rounded-lg border-2 bg-white px-3 py-1.5"
                style={{ borderColor: spotlight ? '#10B981' : '#E6DCC6' }}
              >
                <span className="font-display font-extrabold tabular-nums text-slate-700">
                  {r.label}) {r.text}
                </span>
                {evaluated && (
                  <motion.span
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className="font-display font-extrabold tabular-nums"
                    style={{ color: r.match ? GREEN : MUTED }}
                  >
                    = {r.value} {r.match ? '✓' : '✗'}
                  </motion.span>
                )}
              </div>
            )
          })}
        </div>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: '#10B981', color: GREEN }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
