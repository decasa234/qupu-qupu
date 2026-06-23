// SEAMO-17-B-Q13 — "A, B and C are balls of different weights."
//
// Three balance scales showing balls labelled A, B, C:
//   Fig. 1 (level):    5A on left   = 3B on right         → 5A = 3B
//   Fig. 2 (level):    1A on left   = 2B + 1C on right    → A = 2B + C
//   Fig. 3 (tilted):   6A on left   vs 4B on right (right heavier — left pan up)
//
// Question: what must be added to the right pan of Fig. 3 to balance?
// Answer (key): B → 2C
//
// Adapted from BallScales8ECIllustration (IKMC-21-EC-Q8) — same CELL_W/CELL_H,
// Pan, beam, blue-pivot geometry. Ball colours: A = coral-red, B = steel-blue,
// C = gold (matches scan pallette for three distinct types).
//
// SSR-safe: pure SVG, no hooks, no framer-motion, no randomness, no Date.

import React from 'react'
import { BalanceScale } from './primitives/BalanceScale'

// ── palette ──────────────────────────────────────────────────────────────────
const INK = '#1F2937'
const A_FILL = '#F87171'   // coral-red  (ball A)
const A_STROKE = '#B91C1C'
const B_FILL = '#60A5FA'   // steel-blue (ball B)
const B_STROKE = '#1D4ED8'
const C_FILL = '#FCD34D'   // gold       (ball C)
const C_STROKE = '#B45309'
const LABEL_INK = '#1F2937'

// ── ball radius ───────────────────────────────────────────────────────────────
const R = 16

// ── Ball glyph (pan-relative coords: origin = tray top-centre) ───────────────

interface BallProps {
  label: 'A' | 'B' | 'C'
  cx: number
  /** cy relative to tray top (negative = above tray) */
  cy: number
}

function Ball({ label, cx, cy }: BallProps) {
  const fill = label === 'A' ? A_FILL : label === 'B' ? B_FILL : C_FILL
  const stroke = label === 'A' ? A_STROKE : label === 'B' ? B_STROKE : C_STROKE
  return (
    <g>
      <circle cx={cx} cy={cy} r={R} fill={fill} stroke={stroke} strokeWidth={2} />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={800}
        fill={LABEL_INK}
      >
        {label}
      </text>
    </g>
  )
}

// ── Pan content builders ──────────────────────────────────────────────────────

/**
 * 5 A-balls arranged as a pyramid:
 *   Row 1 (bottom): A A  (2 balls)
 *   Row 2 (mid):    A A  (2 balls)
 *   Row 3 (top):    A    (1 ball, centred)
 * Origin = tray top-centre (y=0 is tray surface; balls above = negative y).
 */
function Balls5A() {
  const sp = R * 2 + 3  // horizontal spacing between ball centres
  const vsp = R * 1.8   // vertical spacing between row centres
  const row1y = -(R + 2)          // bottom row, just above tray
  const row2y = row1y - vsp       // middle row
  const row3y = row2y - vsp       // top row
  return (
    <>
      {/* bottom row */}
      <Ball label="A" cx={-sp / 2} cy={row1y} />
      <Ball label="A" cx={sp / 2}  cy={row1y} />
      {/* middle row */}
      <Ball label="A" cx={-sp / 2} cy={row2y} />
      <Ball label="A" cx={sp / 2}  cy={row2y} />
      {/* top */}
      <Ball label="A" cx={0}        cy={row3y} />
    </>
  )
}

/**
 * 3 B-balls: 2 on bottom, 1 on top centred.
 */
function Balls3B() {
  const sp = R * 2 + 3
  const vsp = R * 1.8
  const row1y = -(R + 2)
  const row2y = row1y - vsp
  return (
    <>
      <Ball label="B" cx={-sp / 2} cy={row1y} />
      <Ball label="B" cx={sp / 2}  cy={row1y} />
      <Ball label="B" cx={0}        cy={row2y} />
    </>
  )
}

/**
 * 1 A ball centred on the pan.
 */
function Ball1A() {
  return <Ball label="A" cx={0} cy={-(R + 2)} />
}

/**
 * 2B + 1C: two B balls side-by-side on the bottom row; C sitting on top-centre.
 */
function Balls2B1C() {
  const sp = R * 2 + 3
  const vsp = R * 1.85
  const row1y = -(R + 2)
  const row2y = row1y - vsp
  return (
    <>
      {/* bottom row: B B */}
      <Ball label="B" cx={-sp / 2} cy={row1y} />
      <Ball label="B" cx={sp / 2}  cy={row1y} />
      {/* top: C */}
      <Ball label="C" cx={0}        cy={row2y} />
    </>
  )
}

/**
 * 6 A-balls: 3 rows of 2.
 */
function Balls6A() {
  const sp = R * 2 + 3
  const vsp = R * 1.8
  const row1y = -(R + 2)
  const row2y = row1y - vsp
  const row3y = row2y - vsp
  return (
    <>
      <Ball label="A" cx={-sp / 2} cy={row1y} />
      <Ball label="A" cx={sp / 2}  cy={row1y} />
      <Ball label="A" cx={-sp / 2} cy={row2y} />
      <Ball label="A" cx={sp / 2}  cy={row2y} />
      <Ball label="A" cx={-sp / 2} cy={row3y} />
      <Ball label="A" cx={sp / 2}  cy={row3y} />
    </>
  )
}

/**
 * 4 B-balls: 2 rows of 2.
 */
function Balls4B() {
  const sp = R * 2 + 3
  const vsp = R * 1.8
  const row1y = -(R + 2)
  const row2y = row1y - vsp
  return (
    <>
      <Ball label="B" cx={-sp / 2} cy={row1y} />
      <Ball label="B" cx={sp / 2}  cy={row1y} />
      <Ball label="B" cx={-sp / 2} cy={row2y} />
      <Ball label="B" cx={sp / 2}  cy={row2y} />
    </>
  )
}

// ── Figure label ──────────────────────────────────────────────────────────────

function FigLabel({ text }: { text: string }) {
  return (
    <p
      style={{
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 700,
        color: INK,
        margin: '2px 0 0',
        fontFamily: 'sans-serif',
      }}
    >
      {text}
    </p>
  )
}

// ── Per-scale wrapper with optional dim/highlight ─────────────────────────────

export interface ScaleDef {
  fig: string
  leftContent: React.ReactNode
  rightContent: React.ReactNode
  /** 1=left lower, -1=right lower, 0=level */
  tilt: -1 | 0 | 1
}

export const SCALES_17B13: ScaleDef[] = [
  {
    fig: 'Fig. 1',
    leftContent: <Balls5A />,
    rightContent: <Balls3B />,
    tilt: 0,
  },
  {
    fig: 'Fig. 2',
    leftContent: <Ball1A />,
    rightContent: <Balls2B1C />,
    tilt: 0,
  },
  {
    fig: 'Fig. 3',
    leftContent: <Balls6A />,
    rightContent: <Balls4B />,
    // 4B > 6A in weight → right side heavier → left pan UP → tilt = -1
    tilt: -1,
  },
]

// ── Shared primitive wrapper ──────────────────────────────────────────────────

export interface BallsScale17B13Props {
  /** 1, 2, or 3 to spotlight that scale; null = all neutral */
  litScale?: 1 | 2 | 3 | null
}

/**
 * Three balance scales for SEAMO-17-B-Q13, arranged in a row.
 * Re-exported so the Explainer can import it and animate.
 */
export function BallsScale17B13({ litScale = null }: BallsScale17B13Props) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 16,
        flexWrap: 'wrap',
        width: '100%',
      }}
    >
      {SCALES_17B13.map((def, i) => {
        const n = (i + 1) as 1 | 2 | 3
        const dim = litScale !== null && litScale !== n
        const highlight = litScale === n
        return (
          <div
            key={n}
            style={{
              flex: '0 0 220px',
              maxWidth: 240,
              opacity: dim ? 0.25 : 1,
              transition: 'opacity 0.25s',
              outline: highlight ? '2.5px dashed #2563EB' : 'none',
              outlineOffset: 4,
              borderRadius: 12,
            }}
          >
            <BalanceScale
              left={def.leftContent}
              right={def.rightContent}
              tilt={def.tilt}
              panW={84}
            />
            <FigLabel text={def.fig} />
          </div>
        )
      })}
    </div>
  )
}

// ── Default export: question stem illustration ────────────────────────────────

export default function BallsScale17B13Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Three balance scales with balls A, B, C. ' +
        'Fig. 1: 5A balanced with 3B. ' +
        'Fig. 2: 1A balanced with 2B and 1C. ' +
        'Fig. 3: 6A on the left, 4B on the right (unbalanced — right side heavier). ' +
        'What must be added to the right pan to balance?'
      }
    >
      <BallsScale17B13 />
    </div>
  )
}
