// HKIMO-18-P1H-Q19 — animated explainer.
// Adapted from Pattern4PEExplainer.tsx (IKMC-20-PE-Q4).
//
// Five beats:
//   1. Highlight the first cycle (positions 1-5).
//   2. Show cycle bracket labelled "×5".
//   3. Show mod arithmetic: 14 ÷ 5 = 2 remainder 4.
//   4. Highlight the 4th item (index 3) in the cycle = □.
//   5. Fill the blank with □ (green).

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CYCLE,
  BLANK_IDX,
  TOTAL_SHOWN,
  type Shape,
} from './ShapeSeqHK18P1Q19Illustration'
import { buildShapeSeqHK18P1Q19Steps } from './shapeSeqHK18P1Q19Steps'

const INK = '#1F2937'
const BLUE = '#30598A'
const GREEN = '#10B981'
const AMBER = '#D97706'

const STEP = 27
const SY = 52
const X0 = 20
const VIEW_W = 430
const VIEW_H = 140

const BRACK_Y1 = SY + 13
const BRACK_Y2 = SY + 23
const BRACK_X0 = X0 - 12
const BRACK_X1 = X0 + 4 * STEP + 12

function ShapeGlyph({ shape, cx, cy, size = 10, color = INK, strokeW = 2 }: {
  shape: Shape; cx: number; cy: number; size?: number; color?: string; strokeW?: number
}) {
  if (shape === 'circle') {
    return <circle cx={cx} cy={cy} r={size} fill="none" stroke={color} strokeWidth={strokeW} />
  }
  if (shape === 'square') {
    return (
      <rect
        x={cx - size}
        y={cy - size}
        width={size * 2}
        height={size * 2}
        fill="none"
        stroke={color}
        strokeWidth={strokeW}
      />
    )
  }
  return (
    <polygon
      points={`${cx},${cy - size - 2} ${cx - size - 1},${cy + size} ${cx + size + 1},${cy + size}`}
      fill="none"
      stroke={color}
      strokeWidth={strokeW}
    />
  )
}

export default function ShapeSeqHK18P1Q19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildShapeSeqHK18P1Q19Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const aria =
    lang === 'id'
      ? 'Penjelasan: siklus 5 bentuk; posisi 14 → sisa 4 → persegi (□).'
      : 'Explainer: 5-shape cycle; position 14 → remainder 4 → square (□).'

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* Cycle bracket */}
          {beat.showCycleBracket && (
            <g>
              <path
                d={`M ${BRACK_X0} ${BRACK_Y1} v ${BRACK_Y2 - BRACK_Y1} h ${BRACK_X1 - BRACK_X0} v -${BRACK_Y2 - BRACK_Y1}`}
                fill="none"
                stroke={BLUE}
                strokeWidth={2}
              />
              <text
                x={(BRACK_X0 + BRACK_X1) / 2}
                y={BRACK_Y2 + 11}
                textAnchor="middle"
                fontSize={9}
                fontWeight={700}
                fill={BLUE}
              >
                {lang === 'id' ? 'siklus ×5' : 'cycle ×5'}
              </text>
            </g>
          )}

          {/* 15 slots */}
          {Array.from({ length: TOTAL_SHOWN }).map((_, i) => {
            const cx = X0 + i * STEP
            const shape = CYCLE[i % CYCLE.length]
            const isBlank = i === BLANK_IDX
            const isHigh = beat.highlightCycleSlots.includes(i % 5)
            const color = isHigh ? BLUE : INK
            const strokeW = isHigh ? 2.8 : 2

            return (
              <g key={i}>
                <text x={cx} y={SY + 27} textAnchor="middle" fontSize={7} fill="#9CA3AF">
                  {i + 1}
                </text>
                {isBlank ? (
                  beat.fillBlank ? (
                    <>
                      <rect
                        x={cx - 11}
                        y={SY - 11}
                        width={22}
                        height={22}
                        rx={4}
                        fill="rgba(16,185,129,0.12)"
                        stroke={GREEN}
                        strokeWidth={2.4}
                      />
                      <ShapeGlyph shape="square" cx={cx} cy={SY} size={8} color={GREEN} strokeW={2.4} />
                    </>
                  ) : (
                    <>
                      <rect
                        x={cx - 11}
                        y={SY - 11}
                        width={22}
                        height={22}
                        rx={4}
                        fill="none"
                        stroke={AMBER}
                        strokeWidth={2}
                        strokeDasharray="4 3"
                      />
                      <text
                        x={cx}
                        y={SY + 1}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={13}
                        fontWeight={900}
                        fill={AMBER}
                      >
                        ?
                      </text>
                    </>
                  )
                ) : (
                  isHigh ? (
                    <>
                      <rect
                        x={cx - 13}
                        y={SY - 14}
                        width={26}
                        height={26}
                        rx={5}
                        fill="rgba(48,89,138,0.10)"
                        stroke={BLUE}
                        strokeWidth={1.4}
                      />
                      <ShapeGlyph shape={shape} cx={cx} cy={SY} color={color} strokeW={strokeW} />
                    </>
                  ) : (
                    <ShapeGlyph shape={shape} cx={cx} cy={SY} color={color} strokeW={strokeW} />
                  )
                )}
              </g>
            )
          })}

          {/* Ellipsis */}
          <text
            x={X0 + TOTAL_SHOWN * STEP - 4}
            y={SY + 2}
            fontSize={13}
            fontWeight={700}
            fill={INK}
            dominantBaseline="central"
          >
            …
          </text>

          {/* Mod-arithmetic label */}
          {beat.showModLabel && (
            <text
              x={VIEW_W / 2}
              y={108}
              textAnchor="middle"
              fontSize={14}
              fontWeight={800}
              fill={BLUE}
            >
              14 ÷ 5 = 2 {lang === 'id' ? 'sisa' : 'remainder'} 4 → □
            </text>
          )}
        </svg>

        {/* Caption */}
        <p className="text-center text-sm font-semibold text-gray-700">{beat.caption}</p>
      </div>
    </div>
  )
}
