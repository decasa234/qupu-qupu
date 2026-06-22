// IKMC-22-EC-Q14 post-answer explainer — "Which numbers does she also punch?"
// Drives the FoldSquare14EC primitive (same figure as the stem illustration)
// through 4 beats: flat plan → fold 1 (horizontal) → fold 2 (vertical) →
// flat result with all 4 highlighted cells. Adapted from PaperFold23G1Explainer.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FoldSquare14EC, PUNCHED_CELLS } from './FoldSquare14ECIllustration'
import { buildFoldSquare14ECSteps } from './foldSquare14ECSteps'

const BLUE = '#30598A'   // fold-in-progress accent
const GREEN = '#10B981'  // result accent
const INK = '#1A1A1A'    // number ink

export default function FoldSquare14ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildFoldSquare14ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const accent = isResult ? GREEN : BLUE

  const ariaLabel = t(
    `Explainer: fold the 6×6 number grid top-to-bottom then left-to-right, ` +
      `punch the marked hole, unfold — cells ${story.answerStr} are punched through.`,
    `Penjelasan: lipat kotak angka 6×6 atas-ke-bawah lalu kiri-ke-kanan, ` +
      `lubangi titik yang ditandai, buka lipatan — sel ${story.answerStr} ikut terlubangi.`,
  )

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* plan banner */}
        <div className="rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          {t(
            'Fold 1: top → bottom  ·  Fold 2: left → right  ·  Punch hole',
            'Lipat 1: atas → bawah  ·  Lipat 2: kiri → kanan  ·  Lubangi',
          )}
        </div>

        {/* fold frame — swaps stages in place so the figure transitions smoothly */}
        <motion.div
          key={beat.stage}
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 360, damping: 22 }}
        >
          <FoldSquare14EC
            stage={beat.stage}
            highlight={isResult ? PUNCHED_CELLS : undefined}
          />
        </motion.div>

        {/* result reveal: the four punched numbers */}
        {isResult && (
          <motion.div
            key="answer"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
            className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 font-display"
          >
            {story.punched.map((n, i) => (
              <span
                key={i}
                className="text-xl font-black tabular-nums"
                style={{ color: i === 0 ? GREEN : INK }}
              >
                {i > 0 && <span style={{ color: INK, fontWeight: 400 }}>,&nbsp;</span>}
                {n}
              </span>
            ))}
            <span className="ml-1 text-xl font-black" style={{ color: GREEN }}>
              &nbsp;→ B
            </span>
          </motion.div>
        )}

        {/* caption */}
        <div
          className="min-h-[3.5rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
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
