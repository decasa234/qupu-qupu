import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { SquareShape, MIN_TILING, MIN_SQUARES } from './P23G3Q25Illustration'
import { buildP23G3Q25Steps } from './p23G3Q25Steps'

// WMI-23P3A-Q25 — post-answer explainer for the square-dissection problem.
// Reuses the SquareShape primitive: lays the minimum 10-square packing one tile
// at a time, showing that even the tightest packing needs 10, so 9 is too few →
// choice A.

const GREEN = '#10B981'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'

export default function P23G3Q25Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildP23G3Q25Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const aria = t(
    `The tightest packing of this figure needs ${MIN_SQUARES} squares, so it cannot be cut into only 9 — the answer is choice A.`,
    `Susunan terketat gambar ini butuh ${MIN_SQUARES} persegi, jadi tidak bisa dipotong jadi hanya 9 — jawabannya pilihan A.`,
  )

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-full" style={{ maxWidth: 340 }}>
          <SquareShape tiles={MIN_TILING} shown={beat.shown} maxWidth={340} />

          {/* running square-count chip */}
          {beat.shown > 0 && (
            <motion.div
              key={`sq-${beat.shown}`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
              className="absolute right-0 top-0 flex items-center gap-1 rounded-xl border-2 px-2.5 py-1 font-display text-base font-extrabold"
              style={{
                background: beat.result ? '#D1FAE5' : BLUE_BG,
                borderColor: beat.result ? GREEN : BLUE,
                color: beat.result ? '#065F46' : BLUE,
              }}
            >
              <span aria-hidden="true">{t('Squares:', 'Persegi:')}</span>
              <span>{beat.shown}</span>
            </motion.div>
          )}
        </div>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
