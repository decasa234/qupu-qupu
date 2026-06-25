// HKIMO-24-P2H-Q19 — animated explainer for the shape pattern question.
//
// Animation flow (5 beats):
//   0. Show the pattern with the blank.
//   1. Highlight first unit (indices 0–4): ▲ ▲ ▲ ● ■.
//   2. Confirm second unit (indices 5–9): same pattern.
//   3. Locate blank in 3rd group (indices 10–13): position 4 → ●.
//   4. Reveal answer: blank fills with ●.
//
// Re-uses ShapeGlyph / PATTERN_SEQ / shapeCx from PatternSeqHK24P2Q19Illustration.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  PATTERN_SEQ,
  shapeCx,
  ShapeGlyph,
  SVG_W,
  DOTS_ID,
} from './PatternSeqHK24P2Q19Illustration'
import { buildPatternSeqHK24P2Q19Steps } from './patternSeqHK24P2Q19Steps'

// ---------------------------------------------------------------------------
// Layout constants (must match illustration)
// ---------------------------------------------------------------------------
const CY      = 26
const SVG_H   = 52
const N       = PATTERN_SEQ.length  // 16
const PAD_X   = 20
const SPACING = 32

// ---------------------------------------------------------------------------
// Colours
// ---------------------------------------------------------------------------
const HIGHLIGHT_FILL   = '#FEF3C7'  // amber tint
const HIGHLIGHT_STROKE = '#F59E0B'  // amber ring
const FILL_BLACK       = '#1F2937'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PatternSeqHK24P2Q19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildPatternSeqHK24P2Q19Steps(lang), [lang])
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
            ? 'Penjelasan pola urutan bentuk'
            : 'Shape pattern sequence explainer'
        }
      >
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <defs>
            <pattern
              id={DOTS_ID}
              x="0"
              y="0"
              width="4"
              height="4"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1" fill={FILL_BLACK} />
            </pattern>
          </defs>

          {PATTERN_SEQ.map((kind, i) => {
            const cx = shapeCx(i)
            const isHL = highlightSet.has(i)
            const isBlank = kind === 'BLANK'

            if (isBlank) {
              if (beat.revealAnswer) {
                return (
                  <ShapeGlyph
                    key={i}
                    kind="BLANK"
                    cx={cx}
                    cy={CY}
                    reveal={true}
                  />
                )
              }
              // Blank with optional amber highlight
              return (
                <g key={i}>
                  <rect
                    x={cx - 12}
                    y={CY - 11}
                    width={24}
                    height={22}
                    rx={2}
                    fill={isHL ? HIGHLIGHT_FILL : 'white'}
                    stroke={isHL ? HIGHLIGHT_STROKE : '#9CA3AF'}
                    strokeWidth={isHL ? 2.5 : 2}
                    strokeDasharray={isHL ? 'none' : '4 3'}
                  />
                  {isHL && (
                    <text
                      x={cx}
                      y={CY + 5}
                      textAnchor="middle"
                      fontSize={13}
                      fill={HIGHLIGHT_STROKE}
                      fontWeight="bold"
                    >
                      ?
                    </text>
                  )}
                </g>
              )
            }

            // Normal shape — dim when in 'cycle' phase and not highlighted
            return (
              <g key={i} opacity={beat.phase === 'cycle' && !isHL ? 0.3 : 1}>
                {isHL && (
                  <rect
                    x={cx - 14}
                    y={CY - 13}
                    width={28}
                    height={26}
                    rx={4}
                    fill={HIGHLIGHT_FILL}
                    stroke={HIGHLIGHT_STROKE}
                    strokeWidth={2}
                  />
                )}
                <ShapeGlyph kind={kind} cx={cx} cy={CY} />
              </g>
            )
          })}

          {/* Trailing ellipsis */}
          <text
            x={PAD_X + N * SPACING + 16 + 4}
            y={CY + 5}
            fontSize={16}
            fill={FILL_BLACK}
            fontWeight="bold"
          >
            …
          </text>
        </svg>
      </div>

      {/* Caption */}
      <p className="text-center text-sm font-medium text-gray-700 px-2">
        {beat.caption}
      </p>
    </div>
  )
}
