import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildSubstituteSteps } from './substituteSteps'

interface CustomOpParams {
  formula: string
  c: number
  d: number
}

const ORANGE = '#F97316'
const GREEN = '#065F46'

function Line({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="font-display text-lg font-extrabold tabular-nums text-slate-700"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function CustomOperationExplainer({ params, correctAnswer, lang = 'en' }: ExplainerProps) {
  const p = params as CustomOpParams
  const story = useMemo(
    () => buildSubstituteSteps(p.formula, p.c, p.d, correctAnswer, lang),
    [p.formula, p.c, p.d, correctAnswer, lang],
  )
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)

  // Auto-advance, holding each beat for its own duration.
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
  const { def, c, d, sub, answer } = story

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: masukkan bilanganmu ke aturan, persis seperti contoh.'
      : 'Strategy: put your numbers into the rule, just like the example.'

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex min-h-[132px] flex-col items-center justify-center gap-2 text-center">
          <Line show={step.showRule}>
            <span className="text-qupu-brand-blue">{def}</span>
          </Line>
          <Line show={step.showSub}>
            <span>
              {c} ◎ {d} = <span style={{ color: ORANGE }}>{sub}</span>
            </span>
          </Line>
          <Line show={step.showResult}>
            <span>
              = <span style={{ color: GREEN }}>{answer}</span>
            </span>
          </Line>
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
