import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PaperFold10Primitive } from './PaperFold10Illustration'
import { buildPaperFold10Steps } from './paperFold10Steps'

// IKMC-19-PE-Q10 — "Patricia folds a sheet of paper twice and then cuts it;
// how many pieces does she end up with?"  Answer: B = 3.
//
// Post-answer explainer. Animates beat-by-beat using the PaperFold10Primitive
// imported from the illustration file (reusing the same colour tokens and stage
// definitions), driven by the useBeatControl hook — same pattern as
// PaperFold23G1Explainer (pool precedent).

const BLUE = '#30598A' // fold/cut accent
const GREEN = '#10B981' // result reveal accent

export default function PaperFold10Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildPaperFold10Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const accent = beat.result ? GREEN : BLUE

  const ariaLabel = t(
    'Explainer: Patricia folds the paper twice then cuts the top-right corner. Unfolding gives 3 pieces because the cut crosses a fold edge.',
    'Penjelasan: Patricia melipat kertas dua kali lalu menggunting sudut kanan atas. Membuka lipatan menghasilkan 3 potongan karena potongan melewati tepi lipatan.',
  )

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* one-line plan banner */}
        <div className="rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          {t(
            'Fold left → right · Fold top → bottom · Cut corner',
            'Lipat kiri → kanan · Lipat atas → bawah · Gunting sudut',
          )}
        </div>

        {/* fold/cut frame for this beat */}
        <motion.div
          key={beat.stage}
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 360, damping: 22 }}
        >
          <PaperFold10Primitive stage={beat.stage} />
        </motion.div>

        {/* answer reveal */}
        {beat.result && (
          <motion.div
            key="answer"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
            className="flex items-baseline gap-2 font-display"
          >
            <span className="text-3xl font-black tabular-nums" style={{ color: GREEN }}>
              {story.answer}
            </span>
            <span className="text-base font-bold" style={{ color: GREEN }}>
              {t('pieces', 'potongan')}
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
