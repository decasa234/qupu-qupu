// IKMC-23-PE-Q9 — post-answer animation for the park / line-of-sight problem.
//
// Reuses Park9PE from Park9PEIllustration so the animation reads as the
// static scene coming alive.
//
// Animation beats:
//   0. intro   — plain park map; state the two given facts.
//   1. scan-a  — highlight A, draw lines → 4 visible, ✗.
//   2. scan-b  — highlight B, draw lines → 4 visible, ✗.
//   3. scan-c  — highlight C, draw lines → 4 visible, ✗.
//   4. scan-d  — highlight D, draw lines → T1/T2/T3 hidden → only 2 visible, ✓.
//   5. result  — D confirmed → answer D.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Park9PE, VB_W } from './Park9PEIllustration'
import { buildPark9PESteps } from './park9PESteps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN  = '#10B981'
const BLUE   = '#30598A'

// ── Main explainer ─────────────────────────────────────────────────────────────

export default function Park9PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildPark9PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult  = beat.result
  const isCorrect = beat.correct

  const captionStyle = isResult || isCorrect
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: dari titik D, tiga pohon tersembunyi di balik pohon besar — hanya 2 pohon yang terlihat. Jawaban D.'
      : 'Explainer: from point D, three trees line up behind the large tree — only 2 trees are visible. Answer D.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <div style={{ width: Math.min(320, VB_W) }}>
          <Park9PE
            testPoint={beat.testPoint}
            showLines={beat.showLines}
            hiddenTrees={beat.hiddenTrees}
            correct={beat.correct}
          />
        </div>

        {/* verdict chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: (isResult || isCorrect) ? GREEN : BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
