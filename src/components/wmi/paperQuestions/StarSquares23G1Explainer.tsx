import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { StarSquares23G1 } from './StarSquares23G1Illustration'
import { buildStarSquaresSteps } from './starSquares23G1Steps'

// WMI-23F1A-Q19 — "How many squares contain exactly one ★?" (answer 18).
// One qualifying square is outlined per beat (orange, mirroring the static
// figure) while every already-counted square stays washed faint behind it.
// A running counter ticks 1→18 grouped by size (6 + 8 + 4). The colour of the
// counter follows the size being tallied so the three groups read apart.

const ORANGE = '#f0853a' // matches the primitive's highlight stroke
const GREEN = '#10B981'

// Accent per square size (echoes fill-qupu tokens), used for the running total.
const SIZE_ACCENT: Record<number, string> = {
  1: '#f0853a', // orange — fill-qupu-orange
  2: '#2f6df0', // blue — fill-qupu-blue
  3: '#7c3aed', // violet — fill-qupu-purple
}

export default function StarSquares23G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildStarSquaresSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const accent = beat.size != null ? (SIZE_ACCENT[beat.size] ?? ORANGE) : ORANGE
  const counterColor = beat.result ? GREEN : accent

  const ariaLabel = t(
    `Explainer: counting squares that hold exactly one star, size by size — 6 + 8 + 4 = ${story.total}.`,
    `Penjelasan: menghitung persegi yang memuat tepat satu bintang, per ukuran — 6 + 8 + 4 = ${story.total}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* one-line legend: the qualifying rule, always visible */}
        <div className="rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          {t('Qualifies = EXACTLY one ★ inside', 'Memenuhi = TEPAT satu ★ di dalam')}
        </div>

        <StarSquares23G1 highlightSquare={beat.highlight} countedSquares={beat.counted} />

        {beat.running > 0 && (
          <motion.div
            key={beat.running}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: counterColor }}
          >
            {beat.running}
          </motion.div>
        )}

        <div
          className="min-h-[2.75rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.highlight
                ? { background: '#FFFFFF', borderColor: accent, color: accent }
                : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
