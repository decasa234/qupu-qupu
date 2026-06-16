import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { BracketGrid } from './BracketGrid22G1Illustration'
import { buildBracketGrid22G1Steps } from './bracketGrid22G1Steps'

// Mirror the illustrator's qupu tokens so the animation reads as the same scene.
const ORANGE = '#F59E0B' // fill-qupu-amber — the active bracket / chip
const GREEN = '#10B981' // fill-qupu-emerald — the winning total

export default function BracketGrid22G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBracketGrid22G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: tiap tanda siku membuka ke satu sel kisi 3×3 dan mengambil angkanya. Contoh ∟ menunjuk kanan-atas yaitu 1. Lalu ¬ → 3, kotak □ di tengah → 4, dan ┌ → 5. Jumlahkan: 3 + 4 + 5 = ${story.answer}.`
      : `Explainer: each corner bracket opens toward one cell of the 3×3 grid and takes its number. The legend ∟ points to the top-right, which is 1. Then ¬ → 3, the square □ at the centre → 4, and ┌ → 5. Add them: 3 + 4 + 5 = ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <BracketGrid bracket={beat.bracket} highlightCell={beat.highlightCell} />

        {/* Running-sum chip strip: each grabbed number lands as an amber chip. */}
        {beat.collected.length > 0 && (
          <div className="flex items-center gap-1.5">
            {beat.collected.map((n, i) => (
              <span key={`chip-${i}-${n}`} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span className="font-display text-lg font-black" style={{ color: ORANGE }}>
                    +
                  </span>
                )}
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg font-display text-base font-black tabular-nums"
                  style={{ background: '#FEF3C7', border: `2px solid ${ORANGE}`, color: '#92400E' }}
                >
                  {n}
                </motion.span>
              </span>
            ))}
            {beat.result && (
              <motion.span
                key="total"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                className="ml-1 flex items-center gap-1.5 font-display text-xl font-black tabular-nums"
                style={{ color: GREEN }}
              >
                = {story.answer}
              </motion.span>
            )}
          </div>
        )}

        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#FEF3C7', borderColor: ORANGE, color: '#92400E' }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
