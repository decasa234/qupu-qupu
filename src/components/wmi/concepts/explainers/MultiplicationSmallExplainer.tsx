import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildArraySteps } from './arraySteps'
import { useBeatControl } from './useBeatControl'

interface MulParams {
  a: number
  b: number
}

const BLUE = '#2f6df0'

export default function MultiplicationSmallExplainer({ params, lang = 'en', step, onStepCount, onStepChange }: ExplainerProps) {
  const p = params as MulParams
  const story = useMemo(() => buildArraySteps(p.a, p.b), [p.a, p.b])
  const index = useBeatControl(story.finalIndex, { step, onStepCount, onStepChange, holds: story.steps.map((s) => s.hold) })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const { a, b } = story

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: susun baris yang sama, lalu hitung semua titiknya.'
      : 'Strategy: build equal rows, then count all the dots.'

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: a }, (_, r) => (
            <div key={r} className="flex gap-1.5">
              {Array.from({ length: b }, (_, c) => (
                <div key={c} className="flex h-7 w-7 items-center justify-center">
                  {r < beat.rows && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 24, delay: c * 0.05 }}
                      className="block h-6 w-6 rounded-full"
                      style={{ background: BLUE }}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-base font-extrabold tabular-nums"
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
