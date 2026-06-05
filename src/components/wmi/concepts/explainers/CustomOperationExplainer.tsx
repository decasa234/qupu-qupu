import { useMemo, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildSubstituteSteps } from './substituteSteps'
import { useBeatControl } from './useBeatControl'

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

export default function CustomOperationExplainer({ params, correctAnswer, lang = 'en', step, onStepCount, onStepChange }: ExplainerProps) {
  const p = params as CustomOpParams
  const story = useMemo(
    () => buildSubstituteSteps(p.formula, p.c, p.d, correctAnswer, lang),
    [p.formula, p.c, p.d, correctAnswer, lang],
  )
  const index = useBeatControl(story.finalIndex, { step, onStepCount, onStepChange, holds: story.steps.map((s) => s.hold) })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const { def, c, d, sub, answer } = story

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: masukkan bilanganmu ke aturan, persis seperti contoh.'
      : 'Strategy: put your numbers into the rule, just like the example.'

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex min-h-[132px] flex-col items-center justify-center gap-2 text-center">
          <Line show={beat.showRule}>
            <span className="text-qupu-brand-blue">{def}</span>
          </Line>
          <Line show={beat.showSub}>
            <span>
              {c} ◎ {d} = <span style={{ color: ORANGE }}>{sub}</span>
            </span>
          </Line>
          <Line show={beat.showResult}>
            <span>
              = <span style={{ color: GREEN }}>{answer}</span>
            </span>
          </Line>
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
