// SEAMOX-20-A-Q6 — animated explainer.
//
// Four beats:
//   0. Introduce: show the 12-shape row.
//   1. Bracket: highlight cycle bracket under slots 0-4.
//   2. Compute: show 17 ÷ 5 = 3 r 2 → position 2 caption.
//   3. Reveal: fill the "17th" slot with ○ (green highlight).
//
// Adapted from Pattern4PEExplainer.tsx (IKMC-20-PE-Q4).

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SHAPE_CYCLE,
  SHOWN_COUNT,
  ANSWER_SHAPE,
} from './ShapePatternX20A6Illustration'

// ---------------------------------------------------------------------------
// Beat definitions
// ---------------------------------------------------------------------------

interface Beat {
  showBracket: boolean
  showCompute: boolean
  fillAnswer: boolean
  highlightSlots: number[]
  caption: string
  result: boolean
  hold: number
}

function buildBeats(lang: 'en' | 'id'): { steps: Beat[]; finalIndex: number } {
  const id = lang === 'id'
  const steps: Beat[] = [
    {
      showBracket: false,
      showCompute: false,
      fillAnswer: false,
      highlightSlots: [],
      caption: id
        ? 'Pola berulang setiap 5 bentuk: □ ○ △ ◇ ⬠'
        : 'The pattern repeats every 5 shapes: □ ○ △ ◇ ⬠',
      result: false,
      hold: 2500,
    },
    {
      showBracket: true,
      showCompute: false,
      fillAnswer: false,
      highlightSlots: [0, 1, 2, 3, 4],
      caption: id
        ? 'Satu siklus = 5 bentuk. Posisi ke-n ditentukan oleh sisa bagi n ÷ 5.'
        : 'One cycle = 5 shapes. Position n is determined by the remainder of n ÷ 5.',
      result: false,
      hold: 2800,
    },
    {
      showBracket: true,
      showCompute: true,
      fillAnswer: false,
      highlightSlots: [1],
      caption: id
        ? '17 ÷ 5 = 3 sisa 2  →  posisi ke-2 dalam siklus = ○'
        : '17 ÷ 5 = 3 remainder 2  →  position 2 in the cycle = ○',
      result: false,
      hold: 3000,
    },
    {
      showBracket: true,
      showCompute: true,
      fillAnswer: true,
      highlightSlots: [1],
      caption: id
        ? `Bentuk ke-17 adalah ${ANSWER_SHAPE} (lingkaran).`
        : `The 17th shape is ${ANSWER_SHAPE} (circle).`,
      result: true,
      hold: 3000,
    },
  ]
  return { steps, finalIndex: steps.length - 1 }
}

// ---------------------------------------------------------------------------
// Layout (mirrors ShapePatternX20A6Illustration)
// ---------------------------------------------------------------------------

const BLUE  = '#30598A'
const GREEN = '#10B981'
const INK   = '#1F2937'

const VIEW_W = 460
const VIEW_H = 170

const SLOT_Y    = 52
const SLOT_X0   = 24
const SLOT_STEP = 36
const SLOT_SIZE = 28

const BRACK_TOP = SLOT_Y + 16
const BRACK_BOT = SLOT_Y + 28
const BRACK_X0  = SLOT_X0 - 10
const BRACK_X1  = SLOT_X0 + 4 * SLOT_STEP + 10

// "17th" dashed slot X (same formula as illustration)
const ASK_CX = SLOT_X0 + (SHOWN_COUNT + 2) * SLOT_STEP

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ShapePatternX20A6Explainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'
  const story = useMemo(() => buildBeats(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const aria =
    lang === 'id'
      ? `Penjelasan: 17 ÷ 5 sisa 2; bentuk ke-17 adalah ${ANSWER_SHAPE}.`
      : `Explainer: 17 ÷ 5 remainder 2; the 17th shape is ${ANSWER_SHAPE}.`

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
          {beat.showBracket && (
            <g>
              <path
                d={`M ${BRACK_X0} ${BRACK_TOP} v ${BRACK_BOT - BRACK_TOP} h ${BRACK_X1 - BRACK_X0} v -${BRACK_BOT - BRACK_TOP}`}
                fill="none"
                stroke={BLUE}
                strokeWidth={2}
              />
              <text
                x={(BRACK_X0 + BRACK_X1) / 2}
                y={BRACK_BOT + 11}
                textAnchor="middle"
                fontSize={9}
                fontWeight={800}
                fill={BLUE}
                className="font-display"
              >
                {lang === 'id' ? 'siklus 5' : 'cycle of 5'}
              </text>
            </g>
          )}

          {/* 12 shown shape slots */}
          {Array.from({ length: SHOWN_COUNT }).map((_, i) => {
            const cx = SLOT_X0 + i * SLOT_STEP
            const isH = beat.highlightSlots.includes(i)
            const dimmed = beat.highlightSlots.length > 0 && !isH
            return (
              <g key={i} opacity={dimmed ? 0.4 : 1}>
                {isH && (
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
                <text
                  x={cx}
                  y={SLOT_Y + 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={20}
                  fill={INK}
                >
                  {SHAPE_CYCLE[i % SHAPE_CYCLE.length]}
                </text>
              </g>
            )
          })}

          {/* Ellipsis */}
          <text
            x={SLOT_X0 + SHOWN_COUNT * SLOT_STEP}
            y={SLOT_Y + 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={16}
            fill={INK}
            opacity={beat.highlightSlots.length > 0 ? 0.4 : 1}
          >
            …
          </text>

          {/* "17th" slot — dashed until beat 3 fills it */}
          <g>
            <rect
              x={ASK_CX - SLOT_SIZE / 2}
              y={SLOT_Y - SLOT_SIZE / 2}
              width={SLOT_SIZE}
              height={SLOT_SIZE}
              rx={5}
              fill={beat.fillAnswer ? 'rgba(16,185,129,0.14)' : 'none'}
              stroke={beat.fillAnswer ? GREEN : BLUE}
              strokeWidth={beat.fillAnswer ? 2.2 : 1.8}
              strokeDasharray={beat.fillAnswer ? undefined : '4 3'}
            />
            {beat.fillAnswer ? (
              <text
                x={ASK_CX}
                y={SLOT_Y + 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={20}
                fill={GREEN}
                fontWeight={900}
              >
                {ANSWER_SHAPE}
              </text>
            ) : (
              <text
                x={ASK_CX}
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
            <text
              x={ASK_CX}
              y={SLOT_Y + SLOT_SIZE / 2 + 10}
              textAnchor="middle"
              fontSize={8}
              fill={beat.fillAnswer ? GREEN : BLUE}
              className="font-display"
            >
              17th
            </text>
          </g>

          {/* Computation label */}
          {beat.showCompute && (
            <text
              x={VIEW_W / 2}
              y={VIEW_H - 30}
              textAnchor="middle"
              fontSize={13}
              fontWeight={800}
              fill={beat.fillAnswer ? GREEN : BLUE}
              className="font-display"
            >
              17 ÷ 5 = 3 {lang === 'id' ? 'sisa' : 'r'} 2 → {lang === 'id' ? 'posisi' : 'position'} 2 = {ANSWER_SHAPE}
            </text>
          )}
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
