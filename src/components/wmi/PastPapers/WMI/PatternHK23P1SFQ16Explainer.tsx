// HKIMO-23-P1SF-Q16 — post-answer explainer.
//
// Reuses PatternHK23P1SFQ16Illustration's constants (CYCLE, ShapeGlyph, etc.)
// Adapted from Pattern4PEExplainer (IKMC-20-PE-Q4).
//
// 4 beats:
//   1. Observe the repeating structure.
//   2. Bracket and label the 6-item cycle.
//   3. Position 7 = cycle position 1 = square!
//   4. Reveal the answer.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CYCLE,
  QUESTION_POS,
  TOTAL_SLOTS,
  ShapeGlyph,
  SZ, R,
  BLUE,
  VIEW_W,
  SLOT_Y,
  SLOT_X0,
  SLOT_STEP,
} from './PatternHK23P1SFQ16Illustration'
import { buildPatternHK23P1SFQ16Steps } from './patternHK23P1SFQ16Steps'

const INK   = '#1F2937'
const GREEN = '#10B981'
const AMBER = '#D97706'

const VIEW_H = 130

export default function PatternHK23P1SFQ16Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildPatternHK23P1SFQ16Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const aria =
    lang === 'id'
      ? 'Penjelasan: pola 6 bentuk berulang; posisi ke-7 adalah persegi.'
      : 'Explainer: 6-shape repeating cycle; position 7 is a square.'

  const answerShape = CYCLE[(QUESTION_POS - 1) % CYCLE.length]

  // Cycle bracket
  const bx0 = SLOT_X0 - 12
  const bx1 = SLOT_X0 + 5 * SLOT_STEP + 12
  const bTop = SLOT_Y + SZ / 2 + 5
  const bBot = bTop + 10

  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={aria}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* Shape slots */}
        {Array.from({ length: TOTAL_SLOTS }).map((_, i) => {
          const pos = i + 1
          const cx = SLOT_X0 + i * SLOT_STEP
          const isQ = pos === QUESTION_POS
          const isHighlighted = beat.highlightPos.includes(pos)

          // Highlight ring
          if (isHighlighted) {
            const rr = Math.max(SZ / 2, R) + 3
            // Use amber for cycle positions, green for answer position
            const ringColor = beat.revealAnswer && isQ ? GREEN : AMBER
          }

          if (isQ) {
            if (beat.revealAnswer) {
              // Show the answer shape in green
              return (
                <g key={i}>
                  <circle
                    cx={cx} cy={SLOT_Y}
                    r={Math.max(SZ / 2, R) + 4}
                    fill={GREEN} fillOpacity={0.18} stroke={GREEN} strokeWidth={1.5}
                  />
                  <ShapeGlyph kind={answerShape} cx={cx} cy={SLOT_Y} fill={GREEN} />
                </g>
              )
            }
            return (
              <g key={i}>
                {isHighlighted && (
                  <circle
                    cx={cx} cy={SLOT_Y}
                    r={Math.max(SZ / 2, R) + 4}
                    fill={AMBER} fillOpacity={0.18} stroke={AMBER} strokeWidth={1.5}
                  />
                )}
                <rect
                  x={cx - SZ / 2} y={SLOT_Y - SZ / 2}
                  width={SZ} height={SZ} rx={3}
                  fill="none" stroke={BLUE} strokeWidth={1.8} strokeDasharray="4 3"
                />
                <text
                  x={cx} y={SLOT_Y + 1}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={13} fontWeight={900} fill={BLUE}
                >
                  ?
                </text>
              </g>
            )
          }

          const kind = CYCLE[(pos - 1) % CYCLE.length]
          const highlightColor = isHighlighted
            ? (beat.revealAnswer ? GREEN : AMBER)
            : undefined

          return (
            <g key={i}>
              {isHighlighted && (
                <circle
                  cx={cx} cy={SLOT_Y}
                  r={Math.max(SZ / 2, R) + 4}
                  fill={highlightColor} fillOpacity={0.18}
                  stroke={highlightColor} strokeWidth={1.5}
                />
              )}
              <ShapeGlyph kind={kind} cx={cx} cy={SLOT_Y} fill={isHighlighted ? highlightColor : undefined} />
            </g>
          )
        })}

        {/* Cycle bracket */}
        {beat.showBracket && (
          <g>
            <path
              d={`M ${bx0} ${bTop} v ${bBot - bTop} h ${bx1 - bx0} v -${bBot - bTop}`}
              fill="none" stroke={BLUE} strokeWidth={1.6}
            />
            <text
              x={(bx0 + bx1) / 2} y={bBot + 11}
              textAnchor="middle" fontSize={9} fontWeight={700} fill={BLUE}
            >
              {lang === 'id' ? '1 siklus (6 bentuk)' : '1 cycle (6 shapes)'}
            </text>
          </g>
        )}

        {/* Caption */}
        <text
          x={VIEW_W / 2} y={VIEW_H - 6}
          textAnchor="middle" fontSize={10} fontWeight={700}
          fill={beat.result ? GREEN : INK}
        >
          {beat.caption}
        </text>
      </svg>
    </div>
  )
}
