// HKIMO-18-P1H-Q20 — animated explainer for the horizontal bead chain.
//
// Animation flow:
//   0. Show full chain (intro).
//   1. Highlight the 4-bead repeating unit ○○●● (indices 0–3).
//   2. Spotlight the blank slot (index 9).
//   3. Highlight blank + its cycle twin (index 1) — reasoning step.
//   4. Fill the blank with ○ and show answer.
//
// Re-uses BeadCircle, CHAIN, CYCLE, BLANK_INDEX, beadCx from the Illustration.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  BeadCircle,
  CHAIN,
  BLANK_INDEX,
  beadCx,
} from './PatternChainHK18P1Q20Illustration'
import { buildPatternChainHK18P1Q20Steps } from './patternChainHK18P1Q20Steps'

// ─── Colours ─────────────────────────────────────────────────────────────────

const GREEN  = '#10B981'
const AMBER  = '#F59E0B'
const C_WIRE = '#6B7280'

// ─── Layout (mirrors Illustration constants) ─────────────────────────────────

const R    = 12
const HOOK = 20
const CY   = 38
const SVG_W = HOOK + R + (CHAIN.length - 1) * (2 * R + 8) + R + HOOK
const SVG_H = 76

// ─── Component ───────────────────────────────────────────────────────────────

export default function PatternChainHK18P1Q20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildPatternChainHK18P1Q20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const x0  = beadCx(0)
  const x13 = beadCx(CHAIN.length - 1)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: pola ○○●● berulang — posisi ke-10 adalah ke-2 dalam unit, jadi jawabannya ○.'
      : 'Explainer: pattern ○○●● repeats — position 10 is 2nd in the unit, so the answer is ○.'

  return (
    <div className="mx-auto w-full max-w-[520px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ maxWidth: SVG_W }}
          aria-hidden="true"
        >
          {/* Wire */}
          <line
            x1={x0 - R}
            y1={CY}
            x2={x13 + R}
            y2={CY}
            stroke={C_WIRE}
            strokeWidth={2}
          />

          {/* Left hook */}
          <path
            d={`M ${x0 - R} ${CY} C ${x0 - R - 12} ${CY} ${x0 - R - 18} ${CY - 14} ${x0 - R - 14} ${CY - 22}`}
            fill="none"
            stroke={C_WIRE}
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Right hook */}
          <path
            d={`M ${x13 + R} ${CY} C ${x13 + R + 12} ${CY} ${x13 + R + 18} ${CY - 14} ${x13 + R + 14} ${CY - 22}`}
            fill="none"
            stroke={C_WIRE}
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Beads */}
          {CHAIN.map((type, i) => {
            const cx = beadCx(i)
            const isHigh    = beat.highlightIndices.includes(i)
            const isFilled  = beat.fillBlank && i === BLANK_INDEX
            const isBlank   = i === BLANK_INDEX && !isFilled
            const dim       = beat.dimNonHighlighted && !isHigh ? 0.22 : 1
            const ringColor = isFilled ? GREEN : AMBER

            if (isBlank) {
              return (
                <g key={i}>
                  {isHigh && (
                    <rect
                      x={cx - R - 6}
                      y={CY - R - 6}
                      width={(R + 6) * 2}
                      height={(R + 6) * 2}
                      rx={8}
                      fill="none"
                      stroke={AMBER}
                      strokeWidth={2}
                      opacity={0.7}
                    />
                  )}
                  <rect
                    x={cx - R - 2}
                    y={CY - R - 2}
                    width={(R + 2) * 2}
                    height={(R + 2) * 2}
                    rx={4}
                    fill={isHigh ? '#FEF3C710' : 'none'}
                    stroke={isHigh ? AMBER : '#374151'}
                    strokeWidth={isHigh ? 2.2 : 1.8}
                    strokeDasharray="4 3"
                  />
                </g>
              )
            }

            const renderType = isFilled ? 'W' : (type as 'W' | 'B')

            return (
              <g key={i} opacity={dim}>
                {isHigh && (
                  <circle
                    cx={cx}
                    cy={CY}
                    r={R + 5}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth={2.2}
                  />
                )}
                <BeadCircle
                  type={renderType}
                  cx={cx}
                  cy={CY}
                  strokeColor={isFilled ? GREEN : '#374151'}
                  strokeWidth={isFilled ? 2.8 : 2}
                />
              </g>
            )
          })}
        </svg>

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN,     color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
