// IKMC-23-PE-Q14 post-answer explainer — "How does the sheet look after unfolding?"
// Drives the PunchFold14PEPrimitive through 3 beats:
//   beat 0 — flat sheet + fold crease (plan)
//   beat 1 — folded half with punch holes
//   beat 2 — RESULT: unfolded sheet with 4 mirrored holes — answer B
//
// Adapted from PaperFold10Explainer (same useBeatControl + framer-motion pattern).

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PunchFold14PEPrimitive } from './PunchFold14PEIllustration'
import { buildPunchFold14PESteps } from './punchFold14PESteps'

const BLUE  = '#30598A'   // fold accent
const GREEN = '#10B981'   // result accent

export default function PunchFold14PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildPunchFold14PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const accent = beat.result ? GREEN : BLUE

  const ariaLabel = t(
    'Explainer: fold the paper in half, punch a round hole and a square hole, then unfold — ' +
      'each hole appears twice, mirrored left and right. The unfolded sheet shows 2 round holes at the top and 2 square holes at the bottom. Answer B.',
    'Penjelasan: lipat kertas menjadi dua, buat lubang bulat dan lubang persegi, lalu buka — ' +
      'setiap lubang muncul dua kali, bercermin kiri dan kanan. Kertas yang terbuka memiliki 2 lubang bulat di atas dan 2 lubang persegi di bawah. Jawaban B.',
  )

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* plan banner */}
        <div className="rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          {t(
            'Fold left → right  ·  Punch circle + square  ·  Unfold',
            'Lipat kiri → kanan  ·  Lubangi lingkaran + persegi  ·  Buka',
          )}
        </div>

        {/* figure — swaps stage in place */}
        <motion.div
          key={beat.stage}
          initial={{ scale: 0.93, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 360, damping: 22 }}
        >
          <PunchFold14PEPrimitive stage={beat.stage} />
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
              B
            </span>
            <span className="text-base font-bold" style={{ color: GREEN }}>
              {t('— 2 round + 2 square', '— 2 bulat + 2 persegi')}
            </span>
          </motion.div>
        )}

        {/* caption */}
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
