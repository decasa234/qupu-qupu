// IKMC-20-PE-Q4 — post-answer explainer.
//
// Reuses Pattern4PEIllustration's constants (CYCLE, TOY_EMOJI, OPTION_PAIRS,
// ANSWER_LABEL, SHOWN_COUNT) so the animated row uses the exact same toy glyphs.
//
// Five beats:
//   1. Introduce the pattern.
//   2. Show the cycle bracket under the first 5 slots.
//   3. Highlight the last shown toy (slot 10) and reveal the first ? as snail.
//   4. Reveal the second ? as canary.
//   5. Highlight option E (snail + canary) as the correct answer.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CYCLE,
  TOY_EMOJI,
  OPTION_PAIRS,
  ANSWER_LABEL,
  SHOWN_COUNT,
} from './Pattern4PEIllustration'
import { buildPattern4PESteps } from './pattern4PESteps'

const INK = '#1F2937'
const GREEN = '#10B981'
const BLUE = '#30598A'

const VIEW_W = 460
const VIEW_H = 190

// Row of 13 slots
const SLOT_Y = 52
const SLOT_X0 = 26
const SLOT_STEP = 32
const SLOT_SIZE = 26

// Cycle bracket geometry (under slots 0–4)
const BRACKET_Y_TOP = SLOT_Y + 16
const BRACKET_Y_BOT = SLOT_Y + 28
const BRACKET_X0 = SLOT_X0 - 10
const BRACKET_X1 = SLOT_X0 + 4 * SLOT_STEP + 10

// Options row
const OPT_Y = 162
const OPT_LABELS = ['A', 'B', 'C', 'D', 'E'] as const

export default function Pattern4PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildPattern4PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const aria =
    lang === 'id'
      ? `Penjelasan: pola berulang 5 mainan; dua mainan berikutnya adalah ${TOY_EMOJI[OPTION_PAIRS[ANSWER_LABEL][0]]} ${TOY_EMOJI[OPTION_PAIRS[ANSWER_LABEL][1]]}, pilihan (${ANSWER_LABEL}).`
      : `Explainer: 5-toy repeating pattern; next two are ${TOY_EMOJI[OPTION_PAIRS[ANSWER_LABEL][0]]} ${TOY_EMOJI[OPTION_PAIRS[ANSWER_LABEL][1]]}, answer (${ANSWER_LABEL}).`

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* Cycle bracket under slots 0–4 */}
          {beat.showCycleBracket && (
            <g>
              <path
                d={`M ${BRACKET_X0} ${BRACKET_Y_TOP} v ${BRACKET_Y_BOT - BRACKET_Y_TOP} h ${BRACKET_X1 - BRACKET_X0} v -${BRACKET_Y_BOT - BRACKET_Y_TOP}`}
                fill="none"
                stroke={BLUE}
                strokeWidth={2}
              />
              <text
                x={(BRACKET_X0 + BRACKET_X1) / 2}
                y={BRACKET_Y_BOT + 12}
                textAnchor="middle"
                fontSize={10}
                fontWeight={800}
                fill={BLUE}
                className="font-display"
              >
                {lang === 'id' ? 'pola berulang' : 'repeating cycle'}
              </text>
            </g>
          )}

          {/* 13 toy slots */}
          {Array.from({ length: 13 }).map((_, i) => {
            const cx = SLOT_X0 + i * SLOT_STEP
            const isHighlighted = beat.highlightSlots.includes(i)
            const isSlot11 = i === SHOWN_COUNT
            const isSlot12 = i === SHOWN_COUNT + 1

            // Determine what to draw in this slot
            if (isSlot11) {
              const filled = beat.fillSlot11
              return (
                <g key={i}>
                  <rect
                    x={cx - SLOT_SIZE / 2}
                    y={SLOT_Y - SLOT_SIZE / 2}
                    width={SLOT_SIZE}
                    height={SLOT_SIZE}
                    rx={5}
                    fill={filled ? 'rgba(16,185,129,0.14)' : 'none'}
                    stroke={isHighlighted ? GREEN : BLUE}
                    strokeWidth={filled ? 2.2 : 1.8}
                    strokeDasharray={filled ? undefined : '4 3'}
                  />
                  {filled ? (
                    <text x={cx} y={SLOT_Y} textAnchor="middle" dominantBaseline="central" fontSize={20}>
                      {TOY_EMOJI[filled]}
                    </text>
                  ) : (
                    <text
                      x={cx}
                      y={SLOT_Y + 1}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={14}
                      fontWeight={900}
                      fill={BLUE}
                      className="font-display"
                    >
                      ?
                    </text>
                  )}
                </g>
              )
            }

            if (isSlot12) {
              const filled = beat.fillSlot12
              return (
                <g key={i}>
                  <rect
                    x={cx - SLOT_SIZE / 2}
                    y={SLOT_Y - SLOT_SIZE / 2}
                    width={SLOT_SIZE}
                    height={SLOT_SIZE}
                    rx={5}
                    fill={filled ? 'rgba(16,185,129,0.14)' : 'none'}
                    stroke={isHighlighted ? GREEN : BLUE}
                    strokeWidth={filled ? 2.2 : 1.8}
                    strokeDasharray={filled ? undefined : '4 3'}
                  />
                  {filled ? (
                    <text x={cx} y={SLOT_Y} textAnchor="middle" dominantBaseline="central" fontSize={20}>
                      {TOY_EMOJI[filled]}
                    </text>
                  ) : (
                    <text
                      x={cx}
                      y={SLOT_Y + 1}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={14}
                      fontWeight={900}
                      fill={BLUE}
                      className="font-display"
                    >
                      ?
                    </text>
                  )}
                </g>
              )
            }

            // Normal toy slot (0–10)
            return (
              <g key={i} opacity={beat.highlightSlots.length > 0 && !isHighlighted ? 0.45 : 1}>
                {isHighlighted && (
                  <rect
                    x={cx - SLOT_SIZE / 2}
                    y={SLOT_Y - SLOT_SIZE / 2}
                    width={SLOT_SIZE}
                    height={SLOT_SIZE}
                    rx={5}
                    fill="rgba(48,89,138,0.12)"
                    stroke={BLUE}
                    strokeWidth={1.8}
                  />
                )}
                <text x={cx} y={SLOT_Y} textAnchor="middle" dominantBaseline="central" fontSize={20}>
                  {TOY_EMOJI[CYCLE[i % CYCLE.length]]}
                </text>
              </g>
            )
          })}

          {/* Options A–E */}
          {OPT_LABELS.map((label, i) => {
            const pair = OPTION_PAIRS[label]
            const cx = 38 + i * 86
            const isAns = beat.showOption && label === ANSWER_LABEL
            return (
              <g key={label}>
                {isAns && (
                  <rect
                    x={cx - 34}
                    y={OPT_Y - 16}
                    width={72}
                    height={32}
                    rx={8}
                    fill="rgba(16,185,129,0.14)"
                    stroke={GREEN}
                    strokeWidth={2.5}
                  />
                )}
                <text
                  x={cx - 22}
                  y={OPT_Y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={12}
                  fontWeight={900}
                  fill={isAns ? GREEN : INK}
                  className="font-display"
                >
                  {`(${label})`}
                </text>
                <text x={cx - 2} y={OPT_Y} textAnchor="middle" dominantBaseline="central" fontSize={18}>
                  {TOY_EMOJI[pair[0]]}
                </text>
                <text x={cx + 18} y={OPT_Y} textAnchor="middle" dominantBaseline="central" fontSize={18}>
                  {TOY_EMOJI[pair[1]]}
                </text>
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
