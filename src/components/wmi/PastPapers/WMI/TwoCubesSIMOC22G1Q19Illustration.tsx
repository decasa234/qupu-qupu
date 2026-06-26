// TwoCubesSIMOC22G1Q19Illustration.tsx
// SIMOC-22-G1-Q19 — Two cubes joined side-by-side.
// Visible faces: left top=2, left front=3; right top=1, right front=4, right side=5.
// The 7 hidden faces are not shown (answer = 42 − 15 = 27).
// Pure SVG, SSR-safe. No hooks, no framer-motion.
// Copy-adapted from DiceRoll17ECIllustration (oblique projection style).

import React from 'react'

// ── Geometry ──────────────────────────────────────────────────────────────────
// Cabinet/oblique projection: front faces are rectangles, depth recedes upper-right.

const DX = 40   // depth x-offset (right)
const DY = -22  // depth y-offset (up)
const FW = 80   // front-face width per cube
const FH = 74   // front-face height

// Top-left corner of the left cube's front face
const LX = 22
const LY = 80

// Key x-coordinates
const MX = LX + FW       // 102 — interior dividing wall
const RX = LX + FW * 2  // 182 — right edge of front

// Key y-coordinates
const TOP_Y = LY          // 80  — front-face top
const BOT_Y = LY + FH    // 154 — front-face bottom

// Depth-projected coordinates
const DEP_TX = LX + DX   // 62  — top-left after depth
const DEP_MX = MX + DX   // 142 — top-mid after depth
const DEP_RX = RX + DX   // 222 — top-right after depth
const DEP_Y  = LY + DY   // 58  — depth top y
const DEP_BY = BOT_Y + DY // 132 — depth bottom y (for right side)

// Canvas
const VIEW_W = 244
const VIEW_H = 170

// ── Face polygon helpers ──────────────────────────────────────────────────────
type Pt = [number, number]
const pts = (arr: Pt[]) => arr.map(([x, y]) => `${x},${y}`).join(' ')

const POLY_LEFT_TOP    = pts([[LX, TOP_Y], [MX, TOP_Y], [DEP_MX, DEP_Y], [DEP_TX, DEP_Y]])
const POLY_RIGHT_TOP   = pts([[MX, TOP_Y], [RX, TOP_Y], [DEP_RX, DEP_Y], [DEP_MX, DEP_Y]])
const POLY_LEFT_FRONT  = pts([[LX, TOP_Y], [MX, TOP_Y], [MX, BOT_Y],  [LX, BOT_Y]])
const POLY_RIGHT_FRONT = pts([[MX, TOP_Y], [RX, TOP_Y], [RX, BOT_Y],  [MX, BOT_Y]])
const POLY_RIGHT_SIDE  = pts([[RX, TOP_Y], [DEP_RX, DEP_Y], [DEP_RX, DEP_BY], [RX, BOT_Y]])

// ── Label centroids ───────────────────────────────────────────────────────────
const LT_CX  = (LX + MX + DEP_MX + DEP_TX) / 4  // 82
const LT_CY  = (TOP_Y * 2 + DEP_Y * 2)    / 4   // 69
const RT_CX  = (MX + RX + DEP_RX + DEP_MX) / 4  // 162
const RT_CY  = LT_CY                              // 69
const LF_CX  = (LX + MX) / 2                     // 62
const LF_CY  = (TOP_Y + BOT_Y) / 2               // 117
const RF_CX  = (MX + RX) / 2                     // 142
const RF_CY  = LF_CY                              // 117
const RS_CX  = (RX + DEP_RX + DEP_RX + RX) / 4  // 202
const RS_CY  = (TOP_Y + DEP_Y + DEP_BY + BOT_Y) / 4 // 106

// ── Palette ───────────────────────────────────────────────────────────────────
const STROKE       = '#1E3A8A'
const FILL_TOP     = '#EFF6FF'
const FILL_FRONT   = '#FFFFFF'
const FILL_SIDE    = '#DBEAFE'
const NUM_COLOR    = '#1D4ED8'
const DIVIDER_CLR  = '#93C5FD'

// ── SCENE export for explainer ────────────────────────────────────────────────
export const SCENE = {
  VIEW_W, VIEW_H,
  LX, LY, MX, RX, DX, DY, FW, FH,
  TOP_Y, BOT_Y, DEP_TX, DEP_MX, DEP_RX, DEP_Y, DEP_BY,
  LT_CX, LT_CY, RT_CX, RT_CY,
  LF_CX, LF_CY, RF_CX, RF_CY,
  RS_CX, RS_CY,
  POLY_LEFT_TOP, POLY_RIGHT_TOP, POLY_LEFT_FRONT, POLY_RIGHT_FRONT, POLY_RIGHT_SIDE,
  STROKE, FILL_TOP, FILL_FRONT, FILL_SIDE, NUM_COLOR, DIVIDER_CLR,
} as const

// ── TwoCubesFigure (shared between illustration and explainer) ────────────────
interface TwoCubesFigureProps {
  /** Fill override per face index: 0=L-top, 1=R-top, 2=L-front, 3=R-front, 4=R-side */
  highlight?: Set<number>
  highlightColor?: string
}

export function TwoCubesFigure({ highlight, highlightColor = '#FDE68A' }: TwoCubesFigureProps) {
  const faceData: { poly: string; base: string; idx: number }[] = [
    { poly: POLY_LEFT_TOP,    base: FILL_TOP,   idx: 0 },
    { poly: POLY_RIGHT_TOP,   base: FILL_TOP,   idx: 1 },
    { poly: POLY_LEFT_FRONT,  base: FILL_FRONT, idx: 2 },
    { poly: POLY_RIGHT_FRONT, base: FILL_FRONT, idx: 3 },
    { poly: POLY_RIGHT_SIDE,  base: FILL_SIDE,  idx: 4 },
  ]

  const labels: { x: number; y: number; val: string; size: number }[] = [
    { x: LT_CX, y: LT_CY, val: '2', size: 15 },
    { x: RT_CX, y: RT_CY, val: '1', size: 15 },
    { x: LF_CX, y: LF_CY, val: '3', size: 22 },
    { x: RF_CX, y: RF_CY, val: '4', size: 22 },
    { x: RS_CX, y: RS_CY, val: '5', size: 16 },
  ]

  return (
    <>
      {faceData.map(({ poly, base, idx }) => (
        <polygon
          key={idx}
          points={poly}
          fill={highlight?.has(idx) ? highlightColor : base}
          stroke={STROKE}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      ))}

      {/* Interior top dividing line */}
      <line
        x1={MX} y1={TOP_Y} x2={DEP_MX} y2={DEP_Y}
        stroke={DIVIDER_CLR} strokeWidth={1.5} strokeDasharray="4 3"
      />
      {/* Interior front dividing line (shared edge is already the polygon boundary) */}

      {labels.map(({ x, y, val, size }, idx) => (
        <text
          key={idx}
          x={x} y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size}
          fontWeight={800}
          fill={NUM_COLOR}
        >
          {val}
        </text>
      ))}
    </>
  )
}

// ── Default export: stem illustration ────────────────────────────────────────

export default function TwoCubesSIMOC22G1Q19Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Dua kubus digabungkan. Kubus kiri: sisi atas=2, sisi depan=3. ' +
        'Kubus kanan: sisi atas=1, sisi depan=4, sisi kanan=5. ' +
        'Tujuh sisi lainnya tidak terlihat.'
      }
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        style={{ maxWidth: 300, display: 'block' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="white" />
        <TwoCubesFigure />
      </svg>
    </div>
  )
}
