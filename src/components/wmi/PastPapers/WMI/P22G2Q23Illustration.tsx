// Colored-ring (octagon) figure for WMI-22P2A-Q23 (2022 Grade 2 Semifinal, A).
//
// Reconstructed from db/seed/wmi/figures/2022-semifinal-g2-a-q23.jpg:
//
//   A regular octagon divided from its centre into 8 triangular wedges. The
//   wedges are colored, ALTERNATING blue and white around the ring. A red curved
//   arrow on the lower-left shows the reading direction (going around the ring).
//
//   The question asks which straight colour STRIP matches the ring. A strip may
//   be joined end-to-end (so any ROTATION of the ring’s colour order is the same
//   ring) but it may NOT be turned over (so the REVERSED order is a different,
//   wrong strip). Answer A is the strip that is a rotation of the ring’s order.
//
// PROBLEM-ONLY · SSR-safe · deterministic. The figure shows the ring + arrow;
// it never draws the answer strips or marks a choice.

import type { ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Ring data (exported so the explainer unrolls the SAME colour cycle)
// ---------------------------------------------------------------------------

export type RingColor = 'blue' | 'white'

/** The 8 wedge colours, reading CLOCKWISE from the top wedge. */
export const RING_COLORS: RingColor[] = ['white', 'blue', 'white', 'blue', 'white', 'blue', 'white', 'blue']

export const RING_N = RING_COLORS.length // 8

export const FILL: Record<RingColor, string> = {
  blue: '#7FC4E8',
  white: '#FFFFFF',
}
const EDGE = '#1F2937'

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

export const RING_CX = 110
export const RING_CY = 104
export const RING_R = 84

/** Vertex of the octagon for wedge boundary `k` (0..N). Boundary 0 is at the
 *  TOP-LEFT of the top wedge so wedge 0 straddles the top. */
function vertex(k: number): [number, number] {
  // Place boundaries so wedge centres point at 90° (top), 45°, ... clockwise.
  // boundary k sits between wedge k-1 and wedge k.
  const ang = (-90 - 360 / RING_N / 2 + (k * 360) / RING_N) * (Math.PI / 180)
  return [RING_CX + RING_R * Math.cos(ang), RING_CY + RING_R * Math.sin(ang)]
}

/** Centre direction (for placing the start dot / labels) of wedge i, in SVG. */
export function wedgeCentroid(i: number): [number, number] {
  const ang = (-90 + (i * 360) / RING_N) * (Math.PI / 180)
  const rr = RING_R * 0.6
  return [RING_CX + rr * Math.cos(ang), RING_CY + rr * Math.sin(ang)]
}

// ---------------------------------------------------------------------------
// Drawing primitives
// ---------------------------------------------------------------------------

/** One coloured triangular wedge i (centre → two octagon vertices). */
export function Wedge({ i, dim = false, ring = false }: { i: number; dim?: boolean; ring?: boolean }) {
  const [ax, ay] = vertex(i)
  const [bx, by] = vertex(i + 1)
  const color = RING_COLORS[i]
  return (
    <polygon
      points={`${RING_CX},${RING_CY} ${ax},${ay} ${bx},${by}`}
      fill={FILL[color]}
      stroke={ring ? '#F0853A' : EDGE}
      strokeWidth={ring ? 3 : 1.6}
      strokeLinejoin="round"
      opacity={dim ? 0.4 : 1}
    />
  )
}

/** The whole colour ring. `litUpto` (optional) highlights wedges 0..litUpto-1. */
export function ColorRing({ litUpto, dimOthers = false }: { litUpto?: number; dimOthers?: boolean }) {
  const wedges: ReactNode[] = []
  for (let i = 0; i < RING_N; i++) {
    const lit = litUpto !== undefined && i < litUpto
    wedges.push(<Wedge key={i} i={i} ring={lit} dim={dimOthers && litUpto !== undefined && i >= litUpto} />)
  }
  return <g>{wedges}</g>
}

/** The red reading-direction arrow on the lower-left (curving clockwise/down). */
export function ReadingArrow() {
  return (
    <g>
      <path
        d={`M ${RING_CX - 92} ${RING_CY - 6} Q ${RING_CX - 104} ${RING_CY + 60} ${RING_CX - 58} ${RING_CY + 92}`}
        fill="none"
        stroke="#E11D48"
        strokeWidth={3.5}
        strokeLinecap="round"
        markerEnd="url(#p22q23-redtip)"
      />
    </g>
  )
}

export function RingDefs() {
  return (
    <defs>
      <marker id="p22q23-redtip" markerWidth="10" markerHeight="10" refX="7" refY="5" orient="auto">
        <polygon points="0,0 10,5 0,10" fill="#E11D48" />
      </marker>
    </defs>
  )
}

export const VIEW_W = 220
export const VIEW_H = 210

export default function P22G2Q23Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'A regular octagon divided into 8 triangular wedges that alternate blue and white around the ring. A red curved arrow shows the direction to read the colours around the ring.'
      }
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}>
        <RingDefs />
        <ColorRing />
        <ReadingArrow />
      </svg>
    </div>
  )
}
