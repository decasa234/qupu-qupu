import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildExpressionSteps, type ExprParams } from './expressionSteps'

export default function ArithmeticExpressionEvalExplainer({ params, lang = 'en' }: ExplainerProps) {
  const p = params as ExprParams
  const story = useMemo(() => buildExpressionSteps(p, lang), [p, lang])
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
  const lastIdx = story.lines.length - 1

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: kerjakan perkalian dulu, lalu hitung dari kiri ke kanan.'
      : 'Strategy: do the multiplications first, then work left to right.'

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex min-h-[120px] flex-col items-center justify-center gap-1.5">
          {story.lines.slice(0, step.linesShown).map((line, i) => {
            const isResult = i === lastIdx
            const isCurrent = i === step.linesShown - 1
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: isCurrent ? 1 : 0.45, y: 0 }}
                transition={{ duration: 0.3 }}
                className="font-display text-lg font-extrabold tabular-nums"
                style={{ color: isResult ? '#065F46' : '#30598A' }}
              >
                {line}
              </motion.div>
            )
          })}
        </div>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            step.result
              ? { background: '#D1FAE5', borderColor: '#10B981', color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {step.caption}
        </div>
      </div>
    </div>
  )
}
