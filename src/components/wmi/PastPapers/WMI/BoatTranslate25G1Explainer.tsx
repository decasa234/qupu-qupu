import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BoatTranslate25G1 } from './BoatTranslate25G1Illustration'
import { buildBoatTranslate25G1Steps } from './boatTranslate25G1Steps'

// WMI-25F1A-Q7 — post-answer animation for "slide the boat".
// We reuse the built primitive (BoatTranslate25G1) so the animation reads as the
// static figure coming alive: litBoats + showSlide reveal the slide, and a small
// verdict chip + running count make the try-and-eliminate walk visible.

const GREEN = '#10B981' // matches → fill-qupu-brand-orange in the figure, GREEN for the verdict UI
const RED = '#DC2626'
const BLUE = '#30598A'

export default function BoatTranslate25G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBoatTranslate25G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: menggeser tak bisa memutar atau mengubah ukuran, jadi hanya salinan persis A yang cocok — jawabannya ${story.answer}.`
      : `Explainer: a slide can’t rotate or resize, so only exact copies of A match — the answer is ${story.answer}.`

  // Verdict chip text under the figure.
  const verdict =
    beat.phase === 'reject'
      ? lang === 'id'
        ? 'Tidak cocok'
        : 'No match'
      : beat.running > 0
        ? lang === 'id'
          ? `Cocok: ${beat.running}`
          : `Matches: ${beat.running}`
        : null

  const chipColor = beat.phase === 'reject' ? RED : GREEN

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-full">
          <BoatTranslate25G1 litBoats={beat.litBoats} showSlide={beat.showSlide} />
        </div>

        {verdict && (
          <motion.div
            key={`${beat.phase}-${beat.running}`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-display text-sm font-black tabular-nums"
            style={{ borderColor: chipColor, color: chipColor, background: '#FFFFFF' }}
          >
            <span aria-hidden="true">{beat.phase === 'reject' ? '✕' : '✓'}</span>
            {verdict}
          </motion.div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.phase === 'reject'
                ? { background: '#FEE2E2', borderColor: RED, color: '#991B1B' }
                : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
