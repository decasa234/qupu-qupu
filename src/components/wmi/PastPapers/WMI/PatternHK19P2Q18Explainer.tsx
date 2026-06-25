// HKIMO-19-P2H-Q18 — post-answer explainer.
//
// Reuses PatternHK19P2Q18Illustration's constants (CYCLE, BLANK_IDX,
// TOTAL_SHOWN, ShapeGlyph) so the animated row uses the exact same shapes.
//
// Four beats (see patternHK19P2Q18Steps.ts):
//   1. Introduce the sequence.
//   2. Reveal the repeating-unit bracket under slots 0–4.
//   3. Highlight blank slot (position 15) + show 15 ÷ 5 division note.
//   4. Fill the blank with ○ (correct answer).

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CYCLE, BLANK_IDX, TOTAL_SHOWN, ShapeGlyph } from './PatternHK19P2Q18Illustration'
import { buildPatternHK19P2Q18Steps } from './patternHK19P2Q18Steps'

const INK = '#1F2937'
const GREEN = '#10B981'
const BLUE = '#30598A'

const VIEW_W = 480
const VIEW_H = 130
const SLOT_Y = 44
const SLOT_X0 = 18
const SLOT_STEP = 28
const SHAPE_SIZE = 16

const BRK_Y0 = SLOT_Y + 13
const BRK_Y1 = SLOT_Y + 25
const BRK_X0 = SLOT_X0 - 8
const BRK_X1 = SLOT_X0 + 4 * SLOT_STEP + 8

export default function PatternHK19P2Q18Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildPatternHK19P2Q18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const aria =
    lang === 'id'
      ? 'Penjelasan: pola berulang ○ □ □ △ ○ setiap 5 gambar; posisi 15 adalah ○.'
      : 'Explainer: repeating pattern ○ □ □ △ ○ every 5 shapes; position 15 is ○.'

  return (
    <div className="mx-auto w-full max-w-[500px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* Repeating-unit bracket */}
          {beat.showCycleBracket && (
            <g>
              <path
                d={`M ${BRK_X0} ${BRK_Y0} v ${BRK_Y1 - BRK_Y0} h ${BRK_X1 - BRK_X0} v -${BRK_Y1 - BRK_Y0}`}
                fill="none"
                stroke={BLUE}
                strokeWidth={1.8}
              />
              <text
                x={(BRK_X0 + BRK_X1) / 2}
                y={BRK_Y1 + 12}
                textAnchor="middle"
                fontSize={9}
                fontWeight={800}
                fill={BLUE}
                className="font-display"
              >
                {lang === 'id' ? 'unit berulang (5)' : 'repeating unit (5)'}
              </text>
            </g>
          )}

          {/* 16 shape slots */}
          {Array.from({ length: TOTAL_SHOWN }).map((_, i) => {
            const cx = SLOT_X0 + i * SLOT_STEP
            const shape = CYCLE[i % CYCLE.length]
            const isBlank = i === BLANK_IDX
            const isHighlighted = beat.highlightSlots.includes(i)
            const dimmed = beat.highlightSlots.length > 0 && !isHighlighted && !isBlank

            if (isBlank) {
              const filled = beat.fillBlank
              return (
                <g key={i}>
                  <rect
                    x={cx - 10}
                    y={SLOT_Y - 10}
                    width={20}
                    height={20}
                    rx={4}
                    fill={filled ? 'rgba(16,185,129,0.14)' : 'none'}
                    stroke={filled || isHighlighted ? GREEN : BLUE}
                    strokeWidth={filled || isHighlighted ? 2.2 : 1.8}
                    strokeDasharray={filled ? undefined : '4 3'}
                  />
                  {filled ? (
                    <ShapeGlyph
                      shape="circle"
                      cx={cx}
                      cy={SLOT_Y}
                      color={GREEN}
                      size={SHAPE_SIZE}
                      strokeWidth={2.2}
                    />
                  ) : (
                    <text
                      x={cx}
                      y={SLOT_Y + 1}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={13}
                      fontWeight={900}
                      fill={isHighlighted ? GREEN : BLUE}
                      className="font-display"
                    >
                      ?
                    </text>
                  )}
                </g>
              )
            }

            return (
              <g key={i} opacity={dimmed ? 0.4 : 1}>
                {isHighlighted && (
                  <rect
                    x={cx - 10}
                    y={SLOT_Y - 10}
                    width={20}
                    height={20}
                    rx={4}
                    fill="rgba(48,89,138,0.12)"
                    stroke={BLUE}
                    strokeWidth={1.8}
                  />
                )}
                <ShapeGlyph
                  shape={shape}
                  cx={cx}
                  cy={SLOT_Y}
                  color={isHighlighted ? BLUE : INK}
                  size={SHAPE_SIZE}
                />
              </g>
            )
          })}

          {/* "…" after the last slot */}
          <text
            x={SLOT_X0 + TOTAL_SHOWN * SLOT_STEP}
            y={SLOT_Y + 1}
            textAnchor="start"
            dominantBaseline="central"
            fontSize={13}
            fontWeight={700}
            fill={INK}
          >
            …
          </text>

          {/* Division note (beats 3–4) */}
          {beat.showDivision && (
            <text
              x={VIEW_W / 2}
              y={VIEW_H - 16}
              textAnchor="middle"
              fontSize={11}
              fontWeight={800}
              fill={GREEN}
              className="font-display"
            >
              {lang === 'id'
                ? '15 ÷ 5 = 3 sisa 0  →  simbol ke-5 = ○'
                : '15 ÷ 5 = 3 remainder 0  →  5th symbol = ○'}
            </text>
          )}
        </svg>

        {/* Caption */}
        <p className="text-center text-sm font-medium text-slate-700">{beat.caption}</p>
      </div>
    </div>
  )
}
