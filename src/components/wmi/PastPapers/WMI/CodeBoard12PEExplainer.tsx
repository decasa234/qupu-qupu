// IKMC-21-PE-Q12 — post-answer animation.
// Reuses the CodeBoard12PEGrid and CodeSequenceRow primitives from the illustration
// so the animation reads as the static scene coming alive.
//
// Animation beats:
//   0. intro     — static grid, explain the code format.
//   1. decode1   — highlight B3, show M; equation B3 → col B, row 3 → M.
//   2. decode2   — B3 locked green, highlight B2, show A.
//   3. decode3   — B3 B2 green, highlight C4, show T.
//   4. decode4   — B3 B2 C4 green, highlight D2, show H.
//   5. result    — all four cells green; MATH → answer E.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CodeBoard12PEGrid,
  CodeSequenceRow,
  SVG_W,
  SVG_H,
} from './CodeBoard12PEIllustration'
import { buildCodeBoard12PESteps } from './codeBoard12PESteps'

// ── colour tokens ──────────────────────────────────────────────────────────────
const GREEN = '#10B981'
const BLUE = '#2563EB'

// ── Main explainer component ───────────────────────────────────────────────────

export default function CodeBoard12PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildCodeBoard12PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: '#1E3A6E' }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: B3=M, B2=A, C4=T, D2=H. Gabungkan: MATH. Jawaban E.'
      : 'Explainer: B3=M, B2=A, C4=T, D2=H. Combined: MATH. Answer E.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(320, SVG_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* white background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* grid — beat-driven highlights */}
          <CodeBoard12PEGrid
            highlightedCells={beat.highlightCell ? [beat.highlightCell] : []}
            resultCells={beat.resultCells}
          />

          {/* code chip row — beat-driven active/done state */}
          <CodeSequenceRow
            activeIndex={beat.activeCodeIndex}
            doneIndices={beat.doneCodeIndices}
          />
        </svg>

        {/* equation row */}
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
                style={{ background: isResult ? GREEN : BLUE }}
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
