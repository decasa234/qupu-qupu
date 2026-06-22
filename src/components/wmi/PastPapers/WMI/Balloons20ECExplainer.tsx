import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  BalloonShape,
  BALLOON_VALUES,
  BALLOON_CX,
  BALLOON_CY,
  B_RY,
  SVG_W,
  SVG_H,
} from './Balloons20ECIllustration'
import { buildBalloons20ECSteps } from './balloons20ECSteps'

// IKMC-21-EC-Q20 — post-answer animation.
// Reuses BalloonShape from the illustration so the animation reads as the
// static scene coming alive.
//
// Animation beats:
//   0. intro   — show all 5 balloons; state the scoring constraint.
//   1. combo1  — highlight 3 + 9 + 18 = 30.
//   2. combo2  — highlight 3 + 13 + 14 = 30.
//   3. compare — only balloon "3" highlighted; others dimmed.
//   4. result  — answer A, green callout.

const GREEN = '#10B981'
const BLUE = '#30598A'

export default function Balloons20ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildBalloons20ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: temukan semua subset {3,9,13,14,18} yang berjumlah 30 — hanya {3,9,18} dan {3,13,14} yang berhasil. Balon 3 ada di keduanya → pasti kena → jawaban A.'
      : 'Explainer: find all subsets of {3,9,13,14,18} summing to 30 — only {3,9,18} and {3,13,14} work. Balloon 3 is in both → definitely hit → answer A.'

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

          {/* ceiling rail */}
          <line x1={8} y1={18} x2={SVG_W - 8} y2={18} stroke="#D1D5DB" strokeWidth={3} strokeLinecap="round" />

          {/* strings from rail to balloon top */}
          {BALLOON_CX.map((cx, i) => (
            <line
              key={i}
              x1={cx}
              y1={18}
              x2={cx}
              y2={BALLOON_CY - B_RY}
              stroke="#9CA3AF"
              strokeWidth={1}
              opacity={beat.dimmed[i] ? 0.3 : 1}
            />
          ))}

          {/* balloons — beat-driven highlight & dim */}
          {BALLOON_VALUES.map((val, i) => {
            const isHighlighted = beat.highlighted[i]
            const isDimmed = beat.dimmed[i]
            const fill = isHighlighted ? '#1D4ED8' : '#4A90D9'
            const opacity = isDimmed ? 0.25 : 1

            return (
              <AnimatePresence key={i}>
                {isHighlighted ? (
                  <motion.g
                    key={`balloon-hi-${i}-${beat.phase}`}
                    initial={{ scale: 0.88, opacity: 0.6 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.88, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                    style={{ transformOrigin: `${BALLOON_CX[i]}px ${BALLOON_CY}px` }}
                  >
                    <BalloonShape
                      cx={BALLOON_CX[i]}
                      cy={BALLOON_CY}
                      value={val}
                      fill={fill}
                      highlight
                      highlightColor={beat.highlightColor}
                    />
                  </motion.g>
                ) : (
                  <BalloonShape
                    key={`balloon-${i}`}
                    cx={BALLOON_CX[i]}
                    cy={BALLOON_CY}
                    value={val}
                    fill="#4A90D9"
                    opacity={opacity}
                  />
                )}
              </AnimatePresence>
            )
          })}

          {/* "Total = 30" label at bottom */}
          <text
            x={SVG_W / 2}
            y={SVG_H - 10}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13}
            fontWeight={800}
            fill="#374151"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            Total = 30
          </text>
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
