import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PaperFold23G1 } from './PaperFold23G1Illustration'
import { buildPaperFold23G1Steps } from './paperFold23G1Steps'

// WMI-23F1A-Q18 — "Fold the square left->right, then top->bottom; read the four
// numbers top layer to bottom layer." (answer 3124). One fold per beat, driving
// the same PaperFold23G1 primitive the static figure uses (stage 0->1->2->3) so
// the animation reads as that scene coming alive. The final beat reveals the
// exploded stack 3,1,2,4 and the big 3124.

const BLUE = '#30598A' // fold-in-progress accent (echoes fill-qupu-blue)
const GREEN = '#10B981' // result accent (echoes fill-qupu-green)
const INK = '#2B2622' // printed-number ink, matches the primitive

export default function PaperFold23G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildPaperFold23G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const accent = beat.result ? GREEN : BLUE

  const ariaLabel = t(
    `Explainer: fold the square left to right then top to bottom; reading top layer to bottom layer gives ${story.stack.join(', ')} → ${story.answer}.`,
    `Penjelasan: lipat persegi kiri ke kanan lalu atas ke bawah; membaca dari lapisan atas ke bawah menghasilkan ${story.stack.join(', ')} → ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* one-line plan banner, always visible */}
        <div className="rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          {t('Fold 1: left → right · Fold 2: top → bottom', 'Lipat 1: kiri → kanan · Lipat 2: atas → bawah')}
        </div>

        {/* the fold frame for this beat — swap stages in place on the shared viewBox */}
        <motion.div
          key={beat.stage}
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 360, damping: 22 }}
        >
          <PaperFold23G1 stage={beat.stage} />
        </motion.div>

        {/* result reveal: the four numbers top->bottom spelling the answer */}
        {beat.result && (
          <motion.div
            key="answer"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
            className="flex items-baseline gap-1 font-display"
          >
            {story.stack.map((d, i) => (
              <span key={i} className="text-2xl font-black tabular-nums" style={{ color: i === 0 ? GREEN : INK }}>
                {d}
              </span>
            ))}
            <span className="ml-1 text-2xl font-black tabular-nums" style={{ color: GREEN }}>
              = {story.answer}
            </span>
          </motion.div>
        )}

        <div
          className="min-h-[3.25rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: accent, color: accent }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
