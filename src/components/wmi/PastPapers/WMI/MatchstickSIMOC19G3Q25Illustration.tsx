// SIMOC-19-G3-Q25 — matchstick "869" illustration.
//
// Tom made number 869 using 19 matchsticks (7+6+6).
// Goal: move exactly 3 matchsticks to form the greatest possible 4-digit number.
// Answer: 9951 (6+6+5+2 = 19 sticks).
//
// This illustration shows ONLY the starting state: "869" in 7-segment matchstick
// style.  It does NOT show the answer or the moves.
//
// Reuses MatchstickDigit + DIGIT_W + DIGIT_H from ./Matchstick20Illustration.
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

import { MatchstickDigit, DIGIT_W, DIGIT_H } from './Matchstick20Illustration'

const SCALE = 1.6
const GAP = 18 // px between digits
const PAD_X = 20
const PAD_Y = 16

// Total sticks in 869: 8=7, 6=6, 9=6 → 19
const DIGITS = ['8', '6', '9'] as const
const STICK_COUNTS: Record<string, number> = { '8': 7, '6': 6, '9': 6 }

const DW = DIGIT_W * SCALE
const DH = DIGIT_H * SCALE
const TOTAL_W = PAD_X * 2 + DIGITS.length * DW + (DIGITS.length - 1) * GAP
const TOTAL_H = PAD_Y * 2 + DH + 28

export default function MatchstickSIMOC19G3Q25Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Angka 869 dibuat dari 19 batang korek api dalam tampilan tujuh-segmen. 8 memerlukan 7 batang, 6 memerlukan 6 batang, 9 memerlukan 6 batang."
    >
      <svg
        viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`}
        width="100%"
        style={{ maxWidth: 260, display: 'block' }}
        aria-hidden="true"
      >
        {DIGITS.map((d, i) => {
          const x = PAD_X + i * (DW + GAP)
          const y = PAD_Y
          return (
            <g key={d + i}>
              <MatchstickDigit digit={d} x={x} y={y} scale={SCALE} />
              {/* stick-count label below each digit */}
              <text
                x={x + DW / 2}
                y={y + DH + 18}
                textAnchor="middle"
                fontSize={13}
                fontWeight={700}
                fill="#6B7280"
              >
                {STICK_COUNTS[d]}
              </text>
            </g>
          )
        })}

        {/* Total label centred at bottom */}
        <text
          x={TOTAL_W / 2}
          y={TOTAL_H - 2}
          textAnchor="middle"
          fontSize={11}
          fontWeight={600}
          fill="#9CA3AF"
        >
          total: 19 batang
        </text>
      </svg>
    </div>
  )
}
