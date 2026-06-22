// IKMC-23-EC-Q18 post-answer explainer.
// Drives FoldCut18ECPrimitive through 4 beats:
//   0 — flat square + horizontal fold line (state the plan)
//   1 — rectangle + vertical fold line (after fold 1)
//   2 — quarter square + scissors (after fold 2, corner cut shown)
//   3 — unfolded result: square with diamond hole at centre (answer B)
//
// Adapted from PaperFold10Explainer / FoldSquare14ECExplainer (pool pattern).

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FoldCut18ECPrimitive } from './FoldCut18ECIllustration'
import { buildFoldCut18ECSteps } from './foldCut18ECSteps'

const BLUE  = '#30598A'   // fold/cut accent
const GREEN = '#10B981'   // result reveal accent

export default function FoldCut18ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildFoldCut18ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const accent = beat.result ? GREEN : BLUE

  const ariaLabel = t(
    'Explainer: Rebecca folds a square piece of paper twice (horizontally then vertically) ' +
      'and cuts the top-left corner of the folded paper. When unfolded, the cut creates a ' +
      'diamond-shaped hole at the centre. Answer B.',
    'Penjelasan: Rebecca melipat kertas persegi dua kali (horizontal lalu vertikal) ' +
      'dan memotong sudut kiri atas kertas yang terlipat. Saat dibuka, potongan tersebut ' +
      'menciptakan lubang berbentuk belah ketupat di tengah. Jawaban B.',
  )

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* plan banner */}
        <div className="rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          {t(
            'Fold bottom → up  ·  Fold right → left  ·  Cut corner',
            'Lipat bawah → atas  ·  Lipat kanan → kiri  ·  Gunting sudut',
          )}
        </div>

        {/* animated figure */}
        <motion.div
          key={beat.stage}
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 360, damping: 22 }}
        >
          <FoldCut18ECPrimitive stage={beat.stage} />
        </motion.div>

        {/* result reveal */}
        {beat.result && (
          <motion.div
            key="answer"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
            className="flex items-baseline gap-2 font-display"
          >
            <span className="text-2xl font-black" style={{ color: GREEN }}>
              {t('Diamond hole → Answer B', 'Lubang belah ketupat → Jawaban B')}
            </span>
          </motion.div>
        )}

        {/* caption */}
        <div
          className="min-h-[3.5rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
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
