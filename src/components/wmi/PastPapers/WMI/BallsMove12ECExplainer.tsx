// IKMC-21-EC-Q12 — Explainer: 5-ball collision simulation.
//
// Walks through 4 collisions beat-by-beat, showing the live ball state via the
// BallRow primitive from BallsMove12ECIllustration. An equation badge flashes on
// each collision beat; a caption box narrates what happened. The final beat is
// green and names the answer (C: one ball left, value 49).
//
// Adapted from BallSort24G1Explainer (beat-by-beat board + caption chip) and
// BallScales8ECExplainer (equation badge + result green styling).

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BallRow, NODE_W, NODE_H } from './BallsMove12ECIllustration'
import { buildBallsMove12ECSteps } from './ballsMove12ECSteps'

const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const ORANGE = '#F97316'
const ORANGE_BG = '#FFF7ED'

// SVG dimensions for the BallRow — match the illustration's geometry.
const STEM_PAD_X = 8
const STEM_GAP = 12

function rowWidth(n: number): number {
  return STEM_PAD_X * 2 + n * NODE_W + (n - 1) * STEM_GAP
}
const STEM_H = NODE_H + 16

export default function BallsMove12ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBallsMove12ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const hasEquation = !!beat.equation

  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const eqStyle = { background: ORANGE_BG, borderColor: ORANGE, color: ORANGE }

  // SVG dimensions depend on the number of balls this beat shows.
  const n = beat.balls.length
  const vw = rowWidth(n)

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: 5 bola bergerak; 4 tabrakan terjadi. Hasil akhir: 1 bola ke kiri bernilai 49. Jawaban C.`
      : `Explainer: 5 balls move; 4 collisions occur. Final survivor: 1 ball moving left, value 49. Answer C.`

  return (
    <div className="mx-auto w-full max-w-[520px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Equation badge — visible only on collision beats */}
        <div className="h-9 flex items-center justify-center">
          {hasEquation && (
            <motion.div
              key={`eq-${index}`}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 340, damping: 20 }}
              className="rounded-full border-2 px-5 py-1 text-sm font-extrabold tabular-nums"
              style={eqStyle}
            >
              {beat.equation}
            </motion.div>
          )}
        </div>

        {/* Ball row — scales to fit the current number of balls */}
        <motion.div
          key={`row-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full flex justify-center"
        >
          <svg
            viewBox={`0 0 ${vw} ${STEM_H}`}
            width="100%"
            style={{ maxWidth: Math.max(vw, STEM_PAD_X * 2 + NODE_W), display: 'block' }}
            aria-hidden="true"
          >
            <BallRow
              balls={beat.balls}
              dimSet={beat.dimSet}
              highlightSet={beat.highlightSet}
            />
          </svg>
        </motion.div>

        {/* Caption box */}
        <motion.div
          key={`cap-${index}`}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="min-h-[44px] w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
