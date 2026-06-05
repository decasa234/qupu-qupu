import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildCorrectionSteps, type CorrectionParams } from './correctionSteps'
import { useBeatControl } from './useBeatControl'

export default function MistakenDigitCorrectionExplainer({ params, lang = 'en', step, playing, onStepCount, onStepChange, onPlayEnd }: ExplainerProps) {
  const p = params as CorrectionParams
  const story = useMemo(() => buildCorrectionSteps(p, lang), [p, lang])
  const index = useBeatControl(story.finalIndex, { step, playing, onStepCount, onStepChange, onPlayEnd, holds: story.steps.map((s) => s.hold) })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const lastIdx = story.lines.length - 1

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: cari seberapa besar kelebihannya, lalu kurangi dari hasilnya.'
      : 'Strategy: find how much too big it is, then subtract that from the sum.'

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex min-h-[120px] flex-col items-center justify-center gap-1.5">
          {story.lines.slice(0, beat.linesShown).map((line, i) => {
            const isResult = i === lastIdx
            const isCurrent = i === beat.linesShown - 1
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
