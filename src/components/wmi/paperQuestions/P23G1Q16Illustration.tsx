// P23G1Q16Illustration.tsx
// WMI-23P1A-Q16 (2023 Semifinal Grade 1, Paper A).
//
// Redrawn from db/seed/wmi/figures/2023-semifinal-g1-a-q16.jpg:
//   A long green arrow (left -> right) over a row of six up-pointing pentagons.
//   Each pentagon holds one red dot, and the dot's position rotates by one vertex
//   from each pentagon to the next. The 5th pentagon is marked with "?".
//
// Rotation rule (verified, single cycle of 5 vertices): index the pentagon's
// vertices CLOCKWISE from the top — 0=top, 1=upper-right, 2=lower-right,
// 3=lower-left, 4=upper-left. The dot steps ONE vertex counter-clockwise per
// pentagon (index - 1, mod 5):
//   P1 v3 (lower-left)  ->  P2 v2 (lower-right)  ->  P3 v1 (upper-right)
//   ->  P4 v0 (top)     ->  P5 v4 (upper-left) = the "?"   ->  P6 v3 (lower-left)
// So the "?" pentagon's dot sits at the UPPER-LEFT vertex — the option figure
// showing that is the seed's answer (D).
//
// The static figure shows ONLY the problem: the arrow, the five given dots, and
// the "?" pentagon (no dot revealed). Pure render — no Math.random / Date /
// hooks / window. SSR-safe.

import React from 'react'

// ── geometry ──────────────────────────────────────────────────────────────────
type Pt = [number, number]

/** Up-pointing regular pentagon vertices (CW from top), centred at (cx,cy). */
export function pentVerts(cx: number, cy: number, r: number): Pt[] {
  return Array.from({ length: 5 }, (_, i) => {
    const a = (Math.PI / 180) * (-90 + i * 72)
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as Pt
  })
}

/** Dot centre for vertex `idx`, pulled inward toward the centre so it sits inside. */
export function dotCentre(cx: number, cy: number, r: number, idx: number): Pt {
  const v = pentVerts(cx, cy, r)[idx]
  const inward = 0.42 // fraction of the way from the vertex toward the centre
  return [v[0] + (cx - v[0]) * inward, v[1] + (cy - v[1]) * inward]
}

// vertex index: 0=top, 1=upper-right, 2=lower-right, 3=lower-left, 4=upper-left
export const SEQUENCE: number[] = [3, 2, 1, 0, 4, 3] // P1..P6; P5 (index 4) is the "?"
export const QUESTION_INDEX = 4 // 0-based pentagon that carries the "?"
export const ANSWER_VERTEX = SEQUENCE[QUESTION_INDEX] // 4 = upper-left

const PENT_FILL = '#FFFFFF'
const PENT_STROKE = '#3A3027'
const DOT_RED = '#E23B2E'

// ── one pentagon (reusable primitive) ─────────────────────────────────────────
export interface PentagonDotProps {
  cx: number
  cy: number
  r: number
  /** vertex index 0..4 for the dot, or null to draw no dot. */
  dot: number | null
  /** draw a "?" instead of a dot. */
  question?: boolean
  /** highlight the dot (explainer focus). */
  highlight?: boolean
}

export function PentagonDot({ cx, cy, r, dot, question = false, highlight = false }: PentagonDotProps) {
  const pts = pentVerts(cx, cy, r)
    .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ')
  return (
    <g>
      <polygon points={pts} fill={PENT_FILL} stroke={PENT_STROKE} strokeWidth={2.5} strokeLinejoin="round" />
      {question && (
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={r * 0.7} fontWeight={900} fill={PENT_STROKE}>
          ?
        </text>
      )}
      {!question && dot !== null && (() => {
        const [dx, dy] = dotCentre(cx, cy, r, dot)
        return (
          <g>
            {highlight && <circle cx={dx} cy={dy} r={r * 0.3} fill="#FCE8B3" />}
            <circle cx={dx} cy={dy} r={r * 0.18} fill={DOT_RED} />
          </g>
        )
      })()}
    </g>
  )
}

// ── scene ─────────────────────────────────────────────────────────────────────
export const Q16_VIEW_W = 720
export const Q16_VIEW_H = 230

const PENT_R = 46
const FIRST_CX = 70
const GAP = 128
const ROW_CY = 150

export interface Q16SceneProps {
  /** when true, reveal the dot in the "?" pentagon (explainer only). */
  solveQuestion?: boolean
  /** highlight the dot on the pentagon at this 0-based index (explainer focus). */
  focusIndex?: number | null
}

export function Q16Scene({ solveQuestion = false, focusIndex = null }: Q16SceneProps) {
  return (
    <svg
      viewBox={`0 0 ${Q16_VIEW_W} ${Q16_VIEW_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 600 }}
      aria-hidden="true"
    >
      <defs>
        <marker id="q16arh" markerWidth="6" markerHeight="7" refX="3" refY="3.5" orient="auto">
          <path d="M0,0 L0,7 L6,3.5 Z" fill="#A4C61A" />
        </marker>
      </defs>

      {/* green direction arrow */}
      <line
        x1={48}
        y1={42}
        x2={Q16_VIEW_W - 70}
        y2={42}
        stroke="#A4C61A"
        strokeWidth={18}
        strokeLinecap="butt"
        markerEnd="url(#q16arh)"
      />

      {/* row of pentagons */}
      {SEQUENCE.map((vtx, i) => {
        const cx = FIRST_CX + i * GAP
        const isQuestion = i === QUESTION_INDEX
        const showDot = isQuestion ? solveQuestion : true
        return (
          <PentagonDot
            key={i}
            cx={cx}
            cy={ROW_CY}
            r={PENT_R}
            dot={vtx}
            question={isQuestion && !solveQuestion}
            highlight={focusIndex === i && showDot}
          />
        )
      })}
    </svg>
  )
}

export default function P23G1Q16Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Tanda panah hijau dari kiri ke kanan di atas enam segi lima. Setiap segi lima berisi satu titik merah yang berputar satu sudut tiap langkah. Segi lima ke-5 ditandai dengan tanda tanya."
    >
      <Q16Scene />
    </div>
  )
}
