// HKIMO-20-P1H-Q20 — animated explainer for the wavy chain pattern question.
//
// Animation flow (5 beats):
//   0. Show the wavy chain with the blank.
//   1. Highlight first 3-bead unit (0–2): ○ ● small.
//   2. Confirm second unit (3–5): same pattern.
//   3. Locate the blank in the third group (6–8): position 9 → small.
//   4. Reveal: blank fills with a small open circle.
//
// Re-uses ChainBead20 / CHAIN_BEADS / beadCx / beadCy / beadR from
// ChainPatternHK20P1Q20Illustration.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CHAIN_BEADS,
  ChainBead20,
  beadCx,
  beadCy,
  beadR,
  DASHED_COLOR,
  BLANK_ANSWER,
  SVG_W,
} from './ChainPatternHK20P1Q20Illustration'
import { buildChainPatternHK20P1Q20Steps } from './chainPatternHK20P1Q20Steps'

// ---------------------------------------------------------------------------
// Layout constants (must match illustration)
// ---------------------------------------------------------------------------

const BEAD_R_LG = 10
const SVG_H     = 64
const N         = CHAIN_BEADS.length

// ---------------------------------------------------------------------------
// Colours
// ---------------------------------------------------------------------------

const HIGHLIGHT_COLOR = '#F59E0B'
const ANSWER_COLOR    = '#10B981'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ChainPatternHK20P1Q20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildChainPatternHK20P1Q20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const hlSet = new Set(beat.highlightIndices)

  const wavePts = Array.from({ length: N }, (_, i) => `${beadCx(i)},${beadCy(i)}`).join(' ')
  const box = BEAD_R_LG + 2

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-full overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
        role="img"
        aria-label={
          lang === 'id'
            ? 'Penjelasan pola rantai lingkaran bergelombang'
            : 'Wavy chain circle pattern explainer'
        }
      >
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* Wavy connecting rope */}
          <polyline
            points={wavePts}
            fill="none"
            stroke={DASHED_COLOR}
            strokeWidth={2}
            strokeLinejoin="round"
          />

          {/* Beads */}
          {CHAIN_BEADS.map((kind, i) => {
            const cx = beadCx(i)
            const cy = beadCy(i)
            const isHL = hlSet.has(i)

            if (kind === 'BLANK') {
              if (beat.revealAnswer) {
                return (
                  <g key={i}>
                    <rect
                      x={cx - box}
                      y={cy - box}
                      width={box * 2}
                      height={box * 2}
                      rx={3}
                      fill="#D1FAE5"
                      stroke={ANSWER_COLOR}
                      strokeWidth={2.5}
                    />
                    <ChainBead20 kind={BLANK_ANSWER} cx={cx} cy={cy} />
                  </g>
                )
              }
              return (
                <g key={i}>
                  <rect
                    x={cx - box}
                    y={cy - box}
                    width={box * 2}
                    height={box * 2}
                    rx={3}
                    fill={isHL ? '#FEF3C7' : 'none'}
                    stroke={isHL ? HIGHLIGHT_COLOR : DASHED_COLOR}
                    strokeWidth={isHL ? 2.5 : 2}
                    strokeDasharray={isHL ? undefined : '4 3'}
                  />
                  {isHL && (
                    <text
                      x={cx}
                      y={cy + 4}
                      textAnchor="middle"
                      fontSize={11}
                      fill={HIGHLIGHT_COLOR}
                      fontWeight="bold"
                    >
                      ?
                    </text>
                  )}
                </g>
              )
            }

            const r = beadR(kind)
            return (
              <g key={i}>
                {isHL && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r + 4}
                    fill="none"
                    stroke={HIGHLIGHT_COLOR}
                    strokeWidth={2.5}
                  />
                )}
                <ChainBead20
                  kind={kind}
                  cx={cx}
                  cy={cy}
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
