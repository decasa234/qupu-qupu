// HKIMO-19-P1H-Q20 — animated explainer for the chain bead pattern question.
//
// Animation flow (5 beats):
//   0. Show the chain with the blank.
//   1. Highlight first repeating unit (indices 0–5): ○○○●●●.
//   2. Confirm second unit (indices 6–11): same pattern.
//   3. Locate the blank in the next trio (indices 12–14): position 14 → ○.
//   4. Reveal the answer: blank fills with ○.
//
// Re-uses ChainBead / CHAIN_BEADS / beadCx from ChainPattern19HK1Q20Illustration.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CHAIN_BEADS,
  ChainBead,
  beadCx,
  DASHED_COLOR,
  BLANK_ANSWER,
} from './ChainPattern19HK1Q20Illustration'
import { buildChainPattern19HK1Q20Steps } from './chainPattern19HK1Q20Steps'

// ---------------------------------------------------------------------------
// Layout constants (must match illustration)
// ---------------------------------------------------------------------------
const BEAD_R  = 10
const PAD_X   = 14
const PAD_Y   = 16
const N       = CHAIN_BEADS.length   // 17
const SVG_W   = PAD_X * 2 + (N - 1) * 28 + BEAD_R * 2
const SVG_H   = PAD_Y * 2 + BEAD_R * 2
const CY      = SVG_H / 2

// ---------------------------------------------------------------------------
// Colours
// ---------------------------------------------------------------------------
const HIGHLIGHT_COLOR = '#F59E0B'   // amber ring
const ANSWER_COLOR    = '#10B981'   // green reveal

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ChainPattern19HK1Q20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildChainPattern19HK1Q20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const highlightSet = new Set(beat.highlightIndices)

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-full overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
        role="img"
        aria-label={
          lang === 'id'
            ? 'Penjelasan pola rantai manik-manik'
            : 'Chain bead pattern explainer'
        }
      >
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* Connecting line */}
          <line
            x1={PAD_X + BEAD_R}
            y1={CY}
            x2={PAD_X + BEAD_R + (N - 1) * 28}
            y2={CY}
            stroke={DASHED_COLOR}
            strokeWidth={2}
          />

          {/* Beads */}
          {CHAIN_BEADS.map((kind, i) => {
            const cx = beadCx(i)
            const isHL = highlightSet.has(i)
            const isBlank = kind === 'BLANK'

            if (isBlank) {
              if (beat.revealAnswer) {
                return (
                  <g key={i}>
                    <rect
                      x={cx - BEAD_R - 3}
                      y={CY - BEAD_R - 3}
                      width={(BEAD_R + 3) * 2}
                      height={(BEAD_R + 3) * 2}
                      rx={4}
                      fill="#D1FAE5"
                      stroke={ANSWER_COLOR}
                      strokeWidth={2.5}
                    />
                    <ChainBead kind={BLANK_ANSWER} cx={cx} cy={CY} r={BEAD_R} />
                  </g>
                )
              }
              return (
                <g key={i}>
                  <rect
                    x={cx - BEAD_R - 2}
                    y={CY - BEAD_R - 2}
                    width={(BEAD_R + 2) * 2}
                    height={(BEAD_R + 2) * 2}
                    rx={3}
                    fill={isHL ? '#FEF3C7' : 'none'}
                    stroke={isHL ? HIGHLIGHT_COLOR : DASHED_COLOR}
                    strokeWidth={isHL ? 2.5 : 2}
                    strokeDasharray={isHL ? 'none' : '4 3'}
                  />
                  {isHL && (
                    <text
                      x={cx}
                      y={CY + 5}
                      textAnchor="middle"
                      fontSize={12}
                      fill={HIGHLIGHT_COLOR}
                      fontWeight="bold"
                    >
                      ?
                    </text>
                  )}
                </g>
              )
            }

            // Normal bead
            return (
              <g key={i}>
                {isHL && (
                  <circle
                    cx={cx}
                    cy={CY}
                    r={BEAD_R + 4}
                    fill="none"
                    stroke={HIGHLIGHT_COLOR}
                    strokeWidth={2.5}
                  />
                )}
                <ChainBead
                  kind={kind}
                  cx={cx}
                  cy={CY}
                  r={BEAD_R}
                  opacity={beat.phase === 'cycle' && !isHL ? 0.35 : 1}
                />
              </g>
            )
          })}
        </svg>
      </div>

      {/* Caption */}
      <p className="text-center text-sm font-medium text-gray-700 px-2">
        {beat.caption}
      </p>
    </div>
  )
}
