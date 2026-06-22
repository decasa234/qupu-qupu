// IKMC-19-EC-Q4 — "Olaf has an open book..." Answer: D = motorcycle + van + tractor.
//
// Post-answer explainer. Animates beat-by-beat using OpenBook4ECPrimitive,
// driven by useBeatControl — same pattern as PaperFold10Explainer.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { OpenBook4ECPrimitive } from './OpenBook4ECIllustration'
import { buildOpenBook4ECSteps } from './openBook4ECSteps'

const BLUE  = '#1565C0'
const GREEN = '#10B981'

export default function OpenBook4ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildOpenBook4ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const accent = beat.result ? GREEN : BLUE

  const ariaLabel = t(
    'Explainer: closing the book mirrors the cover left-to-right; the holes now align with the motorcycle, van, and tractor — answer D.',
    'Penjelasan: menutup buku mencerminkan sampul kiri-ke-kanan; lubang sekarang sejajar dengan motor, van, dan traktor — jawaban D.',
  )

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* one-line plan banner */}
        <div className="rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          {t(
            'Close the book → cover flips left↔right over the right page',
            'Tutup buku → sampul terbalik kiri↔kanan di atas halaman kanan',
          )}
        </div>

        {/* stage frame for this beat */}
        <motion.div
          key={beat.stage}
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 360, damping: 22 }}
        >
          <OpenBook4ECPrimitive stage={beat.stage} />
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
              D
            </span>
            <span className="text-base font-bold" style={{ color: GREEN }}>
              {t('motorcycle · van · tractor', 'motor · van · traktor')}
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
