import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildDigitFrequencySteps } from './digitFrequencySteps'
import { useBeatControl } from './useBeatControl'

const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const MUTED = '#9aa3b2'

export default function DigitFrequencyExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as { a: number; b: number; d: number }

  const story = useMemo(() => buildDigitFrequencySteps(p.a, p.b, p.d, lang), [p.a, p.b, p.d, lang])
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: 1900 })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const showHighlight = beat.phase !== 'range'
  const showTally = beat.phase === 'count' || beat.phase === 'result'
  const digitChar = String(p.d)

  const ariaLabel =
    lang === 'id'
      ? `Cara menghitung berapa kali angka ${p.d} muncul dari ${p.a} sampai ${p.b}.`
      : `How to count how many times digit ${p.d} appears from ${p.a} to ${p.b}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[210px] flex-col items-center justify-center gap-3">
        {/* Number chips grid */}
        <div className="flex flex-wrap justify-center gap-1">
          {story.numbers.map((n) => {
            const chars = String(n).split('')
            return (
              <motion.div
                key={n}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                className="flex items-center rounded-lg border-2 px-1 py-0.5 font-display text-sm font-extrabold"
                style={{ borderColor: PURPLE, background: 'white' }}
              >
                {chars.map((ch, ci) => (
                  <span
                    key={ci}
                    className="rounded px-0.5"
                    style={
                      showHighlight && ch === digitChar
                        ? { background: ORANGE, color: 'white' }
                        : { color: PURPLE }
                    }
                  >
                    {ch}
                  </span>
                ))}
              </motion.div>
            )
          })}
        </div>

        {/* Tally / counter */}
        {showTally && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            className="flex items-center gap-2 font-display font-extrabold"
          >
            <span style={{ color: ORANGE, fontSize: '1.25rem' }}>{p.d}</span>
            <span style={{ color: MUTED, fontSize: '1.25rem' }}>×</span>
            <span
              className="text-3xl"
              style={{ color: beat.phase === 'result' ? GREEN : PURPLE }}
            >
              {story.answer}
            </span>
          </motion.div>
        )}

        {/* Caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
