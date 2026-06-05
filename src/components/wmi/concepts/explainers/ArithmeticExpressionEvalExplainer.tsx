import { useEffect, useMemo, useState } from 'react'
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion'
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

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: kelompokkan dan kerjakan satu bagian dulu (perkalian sebelum tambah/kurang).'
      : 'Strategy: group and resolve one chunk at a time (products before +/−).'

  const groupStyle = step.result
    ? { background: '#D1FAE5', color: '#065F46', boxShadow: 'inset 0 0 0 2px #10B981' }
    : { background: '#FFE1C2', color: '#9A3412', boxShadow: 'inset 0 0 0 2px #F97316' }

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-4">
        <LayoutGroup>
          <div className="flex min-h-[64px] flex-wrap items-center justify-center gap-1 font-display text-xl font-black tabular-nums">
            {step.tokens.map((tk, i) => (
              <motion.span
                key={i}
                layout
                className={tk.active ? 'rounded-lg px-2 py-1' : 'px-0.5'}
                style={tk.active ? groupStyle : { color: '#30598A' }}
              >
                {tk.text}
              </motion.span>
            ))}
          </div>
        </LayoutGroup>

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
