import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { GridCount20B20Figure } from './GridCount20B20Illustration'
import { buildGridCount20B20Steps } from './gridCount20B20Steps'

// SEAMO-2020-Paper-B-Q20 — animated explainer: count all squares in 4×4 grid.
// Beats: intro → 1×1 (16) → 2×2 (9) → 3×3 (4) → 4×4 (1) → total (30 = B).

const AMBER  = '#F59E0B'
const INDIGO = '#6366F1'
const BLUE   = '#3B82F6'
const GREEN  = '#10B981'

function accentForSize(size: 1 | 2 | 3 | 4 | null, result: boolean): string {
  if (result) return GREEN
  if (size === 1) return AMBER
  if (size === 2) return INDIGO
  if (size === 3) return BLUE
  if (size === 4) return GREEN
  return '#374151'
}

export default function GridCount20B20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildGridCount20B20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const accent = accentForSize(beat.highlightSize, beat.result)
  const captionStyle = beat.result
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#EFF6FF', borderColor: accent, color: accent }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: 1×1=16, 2×2=9, 3×3=4, 4×4=1; total 16+9+4+1=30 persegi — jawaban B.'
      : 'Explainer: 1×1=16, 2×2=9, 3×3=4, 4×4=1; total 16+9+4+1=30 squares — answer B.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <div className="w-full overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={`beat-${index}`}
              initial={{ opacity: 0.6, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.6, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
              <GridCount20B20Figure highlightSize={beat.highlightSize} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* equation pill */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: accent }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
