import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildTakeAwaySteps } from './takeAwaySteps'

interface SubParams {
  a: number
  b: number
}

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const EMPTY_BORDER = '#E6DCC6'

export default function SingleDigitSubtractionExplainer({ params, lang = 'en' }: ExplainerProps) {
  const p = params as SubParams
  const story = useMemo(() => buildTakeAwaySteps(p.a, p.b, lang), [p.a, p.b, lang])
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)

  // Auto-advance through the beats, holding each for its own duration.
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
  const { a, left } = story

  // Slots 0..a-1 hold chips. The first `left` are kept (solid blue); the last
  // `b` (= a - left) are the ones taken away — highlighted when marked, then
  // lifted out one after another (staggered exit) when gone.
  const cells = Array.from({ length: 10 }, (_, i) => {
    const isKeep = i < left
    const isRemove = i >= left && i < a
    const removeOrder = i - left
    return (
      <div
        key={i}
        className="flex h-9 w-9 items-center justify-center rounded-md border-2 bg-white"
        style={{ borderColor: EMPTY_BORDER }}
      >
        {isKeep && <span className="block h-6 w-6 rounded-full" style={{ background: BLUE }} />}
        <AnimatePresence>
          {isRemove && !step.gone && (
            <motion.span
              key="chip"
              initial={false}
              animate={{ scale: 1, opacity: 1 }}
              exit={{
                opacity: 0,
                y: -24,
                scale: 0.5,
                transition: { delay: removeOrder * 0.12, duration: 0.4 },
              }}
              className={
                step.marked
                  ? 'block h-6 w-6 rounded-full ring-2 ring-qupu-brand-orange'
                  : 'block h-6 w-6 rounded-full'
              }
              style={{ background: step.marked ? ORANGE : BLUE }}
            />
          )}
        </AnimatePresence>
      </div>
    )
  })

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: ambil sebagian dari keseluruhan, lalu lihat sisanya.'
      : 'Strategy: take part away from the whole, then see what is left.'

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="grid grid-cols-5 gap-1.5">{cells}</div>
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
