import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildCompareSteps, type CompareParams } from './compareSteps'

const GREEN = '#065F46'
const MUTED = '#9aa3b2'

export default function WhichExpressionEqualsExplainer({ params, lang = 'en' }: ExplainerProps) {
  const p = params as CompareParams
  const story = useMemo(() => buildCompareSteps(p, lang), [p, lang])
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduce) {
      setIndex(story.finalIndex)
      return
    }
    let cancelled = false
    let timer = 0
    const run = (next: number) => {
      setIndex(next)
      const hold = story.steps[next]?.hold ?? 0
      if (hold > 0 && next < story.finalIndex) {
        timer = window.setTimeout(() => {
          if (!cancelled) run(next + 1)
        }, hold)
      }
    }
    timer = window.setTimeout(() => run(0), 300)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [story, reduce])

  const step = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: hitung tiap pilihan, lalu cari yang sama dengan target.'
      : 'Strategy: work out each option, then find the one that equals the target.'

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col gap-2">
        <div className="text-center font-display text-base font-extrabold text-qupu-brand-blue">
          Target: <span className="tabular-nums">{story.target}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {story.rows.map((r, i) => {
            const evaluated = i < step.evaluated
            const spotlight = step.spotlight && r.match
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
            step.result
              ? { background: '#D1FAE5', borderColor: '#10B981', color: GREEN }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {step.caption}
        </div>
      </div>
    </div>
  )
}
