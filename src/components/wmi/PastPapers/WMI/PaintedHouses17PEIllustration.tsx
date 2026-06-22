// IKMC-22-PE-Q17 — "The sum of the five numbers in each house is 20.
// Some numbers have been painted over. What number is hidden under the question mark?"
//
// Source figure: docs/reference/ocr-res/ikmc/contest/preecolier/2022.imgs/049.jpg
//
// Figure description:
//   Two houses side by side, each shaped like a pentagon (triangle roof + square body).
//   Each house has 5 numbered circles positioned at the 5 corners/walls:
//     top (chimney), left, bottom-left, bottom-right, right
//   Some circles are painted over (large white discs with no number — grey interior).
//
//   LEFT HOUSE  — 6 (top), 2 (left), 5 (bottom-left), PAINTED (bottom-right), PAINTED (right)
//     visible: 6+2+5 = 13 → painted sum = 7
//   RIGHT HOUSE — 3 (top), PAINTED (left), PAINTED (bottom-left), 1 (bottom-right), ? (right)
//     visible non-?: 3+1 + 7 (painted) = 11 → ? = 20 − 11 = 9  → answer D
//
// This file is the STEM ILLUSTRATION only — does not reveal the answer.
// Choices are text (A=3, B=4, C=7, D=9, E=14) so no Option renderer is needed.
//
// Co-exports:
//   HousePrimitive — draws one house + its 5 circles; reused by the explainer.
//   LAYOUT         — shared geometry constants for the explainer.
//
// Pure SVG, no random, no Date, SSR-safe and deterministic.

// ── colour tokens ─────────────────────────────────────────────────────────────
export const COLOR = {
  HOUSE_BODY: '#D4C5A9',
  HOUSE_STROKE: '#8B7355',
  ROOF: '#C9956B',
  ROOF_STROKE: '#8B6344',
  WINDOW_BG: '#F0E8D8',
  WINDOW_BORDER: '#8B7355',
  CIRCLE_BG: '#FFFFFF',
  CIRCLE_STROKE: '#1F2937',
  PAINTED_BG: '#D1D5DB',   // grey — painted-over circle
  PAINTED_STROKE: '#6B7280',
  QMARK_BG: '#FEF3C7',
  QMARK_STROKE: '#D97706',
  NUM_TEXT: '#1F2937',
  QMARK_TEXT: '#92400E',
} as const

// ── shared layout ─────────────────────────────────────────────────────────────

/** Total SVG width for a single-house panel. */
export const HOUSE_W = 90
/** Total SVG height for a single-house panel. */
export const HOUSE_H = 100

/** The body (rectangle) portion of the house. */
export const BODY = { x: 10, y: 46, w: 70, h: 44 } as const

/** Roof triangle apex. */
export const ROOF_APEX = { x: 45, y: 6 } as const

/** Window (2×2 grid of small squares inside body). */
export const WIN = {
  x: 28, y: 52,
  cellW: 13, cellH: 11,
  gap: 3,
} as const

/** Door (small rect at bottom-center). */
export const DOOR = { x: 36, y: 70, w: 18, h: 20 } as const

/** Radius of number circles. */
export const R = 11

/**
 * 5 circle positions on a house (all in house-local coords, centred on house centre x=45).
 * Positions: top (chimney top), left-wall, bottom-left corner, bottom-right corner, right-wall.
 */
export const CIRCLE_POS = [
  { cx: 45, cy: 6  },   // 0 — top / chimney
  { cx: 6,  cy: 55 },   // 1 — left wall
  { cx: 14, cy: 90 },   // 2 — bottom-left
  { cx: 76, cy: 90 },   // 3 — bottom-right
  { cx: 84, cy: 55 },   // 4 — right wall
] as const

// ── Sub-components ─────────────────────────────────────────────────────────────

/** 2×2 window grid inside the house body. */
function HouseWindow() {
  const cells: JSX.Element[] = []
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      cells.push(
        <rect
          key={`${row}-${col}`}
          x={WIN.x + col * (WIN.cellW + WIN.gap)}
          y={WIN.y + row * (WIN.cellH + WIN.gap)}
          width={WIN.cellW}
          height={WIN.cellH}
          fill={COLOR.WINDOW_BG}
          stroke={COLOR.WINDOW_BORDER}
          strokeWidth={0.8}
        />,
      )
    }
  }
  return <g>{cells}</g>
}

/** Single number/painted/qmark circle. */
function HouseCircle({
  cx,
  cy,
  kind,
  label,
}: {
  cx: number
  cy: number
  kind: 'num' | 'painted' | 'qmark'
  label?: string
}) {
  const isNum = kind === 'num'
  const isPainted = kind === 'painted'
  const isQ = kind === 'qmark'

  const fill = isPainted ? COLOR.PAINTED_BG : isQ ? COLOR.QMARK_BG : COLOR.CIRCLE_BG
  const stroke = isPainted ? COLOR.PAINTED_STROKE : isQ ? COLOR.QMARK_STROKE : COLOR.CIRCLE_STROKE
  const strokeWidth = isQ ? 2 : 1.5

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {isNum && label && (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={800}
          fill={COLOR.NUM_TEXT}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {label}
        </text>
      )}
      {isQ && (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={900}
          fill={COLOR.QMARK_TEXT}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          ?
        </text>
      )}
    </g>
  )
}

/**
 * HousePrimitive — draws a single house with its 5 number circles.
 * `slots` is an array of 5 entries matching CIRCLE_POS order:
 *   { kind: 'num', label: '6' } | { kind: 'painted' } | { kind: 'qmark' }
 * Co-exported for reuse by the explainer.
 */
export type CircleSlot =
  | { kind: 'num'; label: string }
  | { kind: 'painted' }
  | { kind: 'qmark' }

export function HousePrimitive({ slots, highlightBody }: { slots: CircleSlot[]; highlightBody?: string }) {
  const bodyFill = highlightBody ?? COLOR.HOUSE_BODY

  return (
    <g>
      {/* house body */}
      <rect
        x={BODY.x}
        y={BODY.y}
        width={BODY.w}
        height={BODY.h}
        fill={bodyFill}
        stroke={COLOR.HOUSE_STROKE}
        strokeWidth={1.5}
      />
      {/* roof */}
      <polygon
        points={`${BODY.x},${BODY.y} ${BODY.x + BODY.w},${BODY.y} ${ROOF_APEX.x},${ROOF_APEX.y}`}
        fill={COLOR.ROOF}
        stroke={COLOR.ROOF_STROKE}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* window */}
      <HouseWindow />
      {/* door */}
      <rect
        x={DOOR.x}
        y={DOOR.y}
        width={DOOR.w}
        height={DOOR.h}
        fill={COLOR.WINDOW_BG}
        stroke={COLOR.WINDOW_BORDER}
        strokeWidth={0.8}
      />
      {/* number circles */}
      {CIRCLE_POS.map((pos, i) => {
        const slot = slots[i] ?? { kind: 'painted' }
        return (
          <HouseCircle
            key={i}
            cx={pos.cx}
            cy={pos.cy}
            kind={slot.kind}
            label={slot.kind === 'num' ? slot.label : undefined}
          />
        )
      })}
    </g>
  )
}

// ── Slot definitions ─────────────────────────────────────────────────────────

/** Left house: 6(top), 2(left), 5(bottom-left), painted(bottom-right), painted(right). */
// eslint-disable-next-line react-refresh/only-export-components
export const LEFT_HOUSE_SLOTS: CircleSlot[] = [
  { kind: 'num', label: '6' },
  { kind: 'num', label: '2' },
  { kind: 'num', label: '5' },
  { kind: 'painted' },
  { kind: 'painted' },
]

/** Right house: 3(top), painted(left), painted(bottom-left), 1(bottom-right), ?(right). */
// eslint-disable-next-line react-refresh/only-export-components
export const RIGHT_HOUSE_SLOTS: CircleSlot[] = [
  { kind: 'num', label: '3' },
  { kind: 'painted' },
  { kind: 'painted' },
  { kind: 'num', label: '1' },
  { kind: 'qmark' },
]

// ── Total SVG dimensions ─────────────────────────────────────────────────────
export const SVG_W = 200
export const SVG_H = 110

// Offsets: left house centred at x=50, right house centred at x=150
export const LEFT_OFFSET_X = 5
export const RIGHT_OFFSET_X = 105

// ── Default export ────────────────────────────────────────────────────────────

/**
 * PaintedHouses17PEIllustration — stem figure for IKMC-22-PE-Q17.
 *
 * Shows two houses, each with 5 number circles.  Grey circles = painted over.
 * Amber circle with "?" = the hidden number to find.
 * Does NOT reveal the answer (9).
 */
export default function PaintedHouses17PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Two houses, each containing five numbers that sum to 20. ' +
        'Left house shows 6, 2, and 5 — two numbers are painted over. ' +
        'Right house shows 3 and 1 — two numbers are painted over and one circle shows a question mark. ' +
        'Find the number hidden under the question mark.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={SVG_W}
        style={{ display: 'block', maxWidth: '100%' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* left house */}
        <g transform={`translate(${LEFT_OFFSET_X}, 5)`}>
          <HousePrimitive slots={LEFT_HOUSE_SLOTS} />
        </g>

        {/* right house */}
        <g transform={`translate(${RIGHT_OFFSET_X}, 5)`}>
          <HousePrimitive slots={RIGHT_HOUSE_SLOTS} />
        </g>
      </svg>
    </div>
  )
}
