// TwoCubesSIMOC22G1Q19Explainer.tsx
// SIMOC-22-G1-Q19 — animated beat-by-beat explainer.
// Reuses TwoCubesFigure and SCENE from TwoCubesSIMOC22G1Q19Illustration.
// Pattern follows DiceRoll17ECExplainer (useBeatControl + AnimatePresence).

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SCENE, TwoCubesFigure } from './TwoCubesSIMOC22G1Q19Illustration'
import { buildTwoCubesSIMOC22G1Q19Steps } from './twoCubesSIMOC22G1Q19Steps'

const GREEN = '#10B981'
const BLUE  = '#1D4ED8'

export default function TwoCubesSIMOC22G1Q19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'

  const story = useMemo(() => buildTwoCubesSIMOC22G1Q19Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult   = beat.result
  const hlSet      = new Set(beat.highlight)
  const accentClr  = isResult ? GREEN : BLUE

  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE,  color: BLUE }

  const ariaLabel = lang === 'id'
    ? 'Penjelasan: total semua sisi = 42, sisi terlihat = 15, sisi tersembunyi = 42−15 = 27.'
    : 'Explainer: total of all faces = 42, visible = 15, hidden = 42−15 = 27.'

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Figure */}
        <svg
          viewBox={`0 0 ${SCENE.VIEW_W} ${SCENE.VIEW_H}`}
          width="100%"
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SCENE.VIEW_W} height={SCENE.VIEW_H} fill="white" />
          <TwoCubesFigure highlight={hlSet} highlightColor="#FDE68A" />
        </svg>

        {/* Equation badge */}
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
                style={{ background: accentClr }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
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
