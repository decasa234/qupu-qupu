import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { NumberStrip23G1 } from './NumberStrip23G1Illustration'
import { buildNumberStrip23Steps, type Mark } from './numberStrip23G1Steps'

// Post-answer explainer for WMI-23F1A-Q3 (2023 G1 final). It lights the strip's
// A (2nd-smallest), B (9th from left), C (middle) cells one at a time — keeping
// earlier marks — then compares the three and subtracts smallest from largest.
// Mirrors NumberStrip23G1Illustration's colour tokens so the scene reads as the
// same figure coming alive. Pure render of params + lang; SSR-safe.

// Echo the qupu tokens used by the static figure.
const BLUE = '#30598A' // A → fill-qupu-brand-blue
const ORANGE = '#f0853a' // B → fill-qupu-brand-orange
const GREEN = '#5B8C5A' // C
const WIN = '#10B981'
const INK = '#1F2937'

const MARK_COLOR: Record<Mark, string> = { A: BLUE, B: ORANGE, C: GREEN }
const MARK_BG: Record<Mark, string> = { A: '#E1EFFB', B: '#FDEBDD', C: '#E5F0E4' }

export default function NumberStrip23G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildNumberStrip23Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const accent = beat.result ? WIN : beat.focus ? MARK_COLOR[beat.focus] : BLUE

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: A terkecil ke-2 (${story.values.a}), B ke-9 dari kiri (${story.values.b}), C di tengah (${story.values.c}); terbesar dikurangi terkecil = ${story.answer}.`
      : `Explainer: A is 2nd-smallest (${story.values.a}), B is 9th from left (${story.values.b}), C is the middle (${story.values.c}); largest minus smallest = ${story.answer}.`

  // Which value pills to show, and how to flag each on the result.
  const showValues = beat.values != null
  const pills: Array<{ label: Mark; value: number }> = beat.values
    ? [
        { label: 'A', value: beat.values.a },
        { label: 'B', value: beat.values.b },
        { label: 'C', value: beat.values.c },
      ]
    : []

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <NumberStrip23G1 marks={beat.marks} />

        {showValues && (
          <div className="flex items-center justify-center gap-2">
            {pills.map(({ label, value }) => {
              const isMax = beat.largest != null && value === beat.largest
              const isMin = beat.smallest != null && value === beat.smallest
              const color = MARK_COLOR[label]
              return (
                <motion.div
                  key={label}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 22 }}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="rounded-lg border-2 px-3 py-1 font-display text-base font-black tabular-nums"
                    style={{ background: MARK_BG[label], borderColor: color, color: INK }}
                  >
                    <span style={{ color }}>{label}</span> {value}
                  </div>
                  {beat.result && (isMax || isMin) && (
                    <motion.span
                      initial={{ opacity: 0, y: -3 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-display text-[11px] font-extrabold"
                      style={{ color: isMax ? WIN : '#B45309' }}
                    >
                      {isMax
                        ? lang === 'id'
                          ? 'terbesar'
                          : 'largest'
                        : lang === 'id'
                          ? 'terkecil'
                          : 'smallest'}
                    </motion.span>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}

        {beat.result && beat.diff != null && (
          <motion.div
            key="answer"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: WIN }}
          >
            {beat.largest} − {beat.smallest} = {beat.diff}
          </motion.div>
        )}

        <motion.div
          key={index}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: WIN, color: '#065F46' }
              : { background: '#FFFFFF', borderColor: accent, color: accent }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
