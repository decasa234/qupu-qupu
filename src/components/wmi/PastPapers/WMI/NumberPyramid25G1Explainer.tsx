import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { NumberPyramid25G1 } from './NumberPyramid25G1Illustration'
import { buildNumberPyramid25G1Steps } from './numberPyramid25G1Steps'

// WMI-25F1A-Q25 — trace the unique all-different walk down the number pyramid,
// one step per beat, growing the "used numbers" set so the rule is shown, not
// asserted. Mirrors the static figure by reusing the NumberPyramid25G1 primitive.

const GREEN = '#10B981'
const LIT_FILL = '#FFE08A' // echoes the primitive's lit wash
const LIT_STROKE = '#F59E0B' // echoes the primitive's lit outline
const INK = '#1F2937'

export default function NumberPyramid25G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildNumberPyramid25G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: walk down the pyramid choosing only new numbers — 5, 1, 4, 3, 2, 7, then 6. The path lands on ${story.answer}.`,
    `Penjelasan: turun di piramida hanya memilih angka baru — 5, 1, 4, 3, 2, 7, lalu 6. Jalur berakhir di ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Reuse the static primitive — same scene, now with the path tinting in. */}
        <NumberPyramid25G1 litPath={beat.litPath} />

        {/* Running "used numbers" — chips appear as each new square is reached. */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span className="font-display text-xs font-bold" style={{ color: INK }}>
            {t('Used:', 'Terpakai:')}
          </span>
          <AnimatePresence initial={false}>
            {beat.used.map((n, i) => (
              <motion.span
                key={`${i}-${n}`}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 520, damping: 26 }}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md font-display text-sm font-black tabular-nums"
                style={{
                  background: LIT_FILL,
                  border: `2px solid ${LIT_STROKE}`,
                  color: INK,
                }}
              >
                {n}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
