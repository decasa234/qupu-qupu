// SASMO 2019 G3 Q2 — post-answer explainer.
// Reuses dot layout + geometry from CircleCountPatternSASMO19G3Q2Illustration.
// Five beats: introduce → show counts → highlight pattern → reveal answer → confirm D.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CIRCLE_DOTS,
  ANSWER_DOTS,
  CIRCLE_R,
  STEP,
  X0,
  CY,
} from './CircleCountPatternSASMO19G3Q2Illustration'
import { buildCircleCountPatternSASMO19G3Q2Steps } from './circleCountPatternSASMO19G3Q2Steps'

const INK    = '#1F2937'
const WHITE  = '#FFFFFF'
const STROKE = '#374151'
const BLUE   = '#30598A'
const GREEN  = '#10B981'
const AMBER  = '#F59E0B'

// Counts matching CIRCLE_DOTS (0-indexed)
const BLACK_COUNTS = [1, 9, 1, 3, 8, 1, 3, 6, 2]

// Indices of "peak" circles (most black circles every 3rd, 1-indexed → 0-indexed: 1, 4, 7)
const PEAK_INDICES = [1, 4, 7]

const VIEW_W  = 460
const VIEW_H  = 86   // circles at y=36, count labels at y=66, small margin

export default function CircleCountPatternSASMO19G3Q2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildCircleCountPatternSASMO19G3Q2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const aria =
    lang === 'id'
      ? 'Explainer: pola jumlah lingkaran hitam, jawaban D = 4.'
      : 'Explainer: black-circle count pattern, answer D = 4.'

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {Array.from({ length: 10 }).map((_, i) => {
            const cx = X0 + i * STEP
            const isQuestion = i === 9
            const isPeak = PEAK_INDICES.includes(i)
            const dimmed = beat.highlightPeak && !isPeak && !isQuestion

            return (
              <g key={i} opacity={dimmed ? 0.3 : 1}>
                {/* Highlight ring for peak circles */}
                {beat.highlightPeak && isPeak && (
                  <circle
                    cx={cx}
                    cy={CY}
                    r={CIRCLE_R + 3}
                    fill="none"
                    stroke={AMBER}
                    strokeWidth={2.5}
                  />
                )}

                {/* Outer circle */}
                <circle
                  cx={cx}
                  cy={CY}
                  r={CIRCLE_R}
                  fill={WHITE}
                  stroke={
                    beat.revealAnswer && isQuestion ? GREEN
                    : beat.highlightPeak && isPeak  ? AMBER
                    : STROKE
                  }
                  strokeWidth={beat.revealAnswer && isQuestion ? 2.5 : 2}
                />

                {/* Inner dots */}
                {isQuestion ? (
                  beat.revealAnswer ? (
                    ANSWER_DOTS.map((dot, j) => (
                      <circle
                        key={j}
                        cx={cx + dot.dx}
                        cy={CY + dot.dy}
                        r={dot.r}
                        fill={INK}
                        stroke={STROKE}
                        strokeWidth={1.5}
                      />
                    ))
                  ) : (
                    <text
                      x={cx}
                      y={CY + 1}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={22}
                      fontWeight={900}
                      fill={BLUE}
                      className="font-display"
                    >
                      ?
                    </text>
                  )
                ) : (
                  CIRCLE_DOTS[i].map((dot, j) => (
                    <circle
                      key={j}
                      cx={cx + dot.dx}
                      cy={CY + dot.dy}
                      r={dot.r}
                      fill={dot.filled ? INK : WHITE}
                      stroke={STROKE}
                      strokeWidth={1.5}
                    />
                  ))
                )}

                {/* Count label below each circle */}
                {beat.showCounts && (
                  <text
                    x={cx}
                    y={CY + CIRCLE_R + 12}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={800}
                    fill={
                      isQuestion && beat.revealAnswer ? GREEN
                      : isPeak && beat.highlightPeak  ? AMBER
                      : BLUE
                    }
                    className="font-display"
                  >
                    {isQuestion
                      ? beat.revealAnswer ? '4' : '?'
                      : BLACK_COUNTS[i]}
                  </text>
                )}

                {/* "D = 4" label on the last circle */}
                {beat.showFinalLabel && isQuestion && (
                  <text
                    x={cx}
                    y={CY - CIRCLE_R - 6}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={900}
                    fill={GREEN}
                    className="font-display"
                  >
                    D = 4
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
