/**
 * IKMC-21-EC-Q5 — "Five boys competed in a shooting challenge. Ricky scored
 * the most points. Which target was Ricky's?"
 *
 * The choices ARE the only figures (no separate stem). This file provides
 * ONLY the option renderer: Targets5ECOption.
 * No default illustration export — it would duplicate the options.
 *
 * Each target has 4 concentric rings scored 10 (bull), 9, 8, 7 (outer),
 * and exactly 3 arrow-hit dots. Ring radii (in SVG units, cx=cy=50):
 *   r10 = 10, r9 = 20, r8 = 30, r7 = 42 (outer edge r = 47)
 *
 * Arrow-hit counts per ring (derived from the source images):
 *   A: 7+7+8  = 22  (2 in ring-7, 1 in ring-8)
 *   B: 7+7+9  = 23  (2 in ring-7, 1 in ring-9)
 *   C: 7+8+8  = 23  (1 in ring-7, 2 in ring-8)
 *   D: 7+8+9  = 24  (1 in ring-7, 1 in ring-8, 1 in ring-9)
 *   E: 8+9+10 = 27  (1 in ring-8, 1 in ring-9, 1 in bull) ← highest = Ricky's
 *
 * Pure SVG, no random, no Date, SSR-safe.
 */

import type { WmiChoice } from '../../../../types/wmi'

// ── colour tokens ─────────────────────────────────────────────────────────────
const RING_7  = '#FFFFFF'   // white outer
const RING_8  = '#E8E8E8'   // very light grey
const RING_9  = '#C9CDD2'   // grey
const RING_10 = '#9CA3AF'   // dark grey bull
const EDGE    = '#3a3a3a'
const DOT     = '#1F2937'   // filled circle = arrow hit

// ── geometry ─────────────────────────────────────────────────────────────────
const CX = 50
const CY = 50
const R10 = 10   // bullseye
const R9  = 20
const R8  = 30
const R7  = 42
const ROUT = 47  // outer ring edge

// label positions for ring numbers inside the SVG (right of bull)
const LABEL_X = CX + 12
const LABEL_7_Y  = CY - 34
const LABEL_8_Y  = CY - 23
const LABEL_9_Y  = CY - 13
const LABEL_10_Y = CY - 4

// ── Arrow-hit positions per option ────────────────────────────────────────────
// Each dot: [cx_offset_from_CX, cy_offset_from_CY]
// Placed to replicate the source image dot positions faithfully.
//
// Option A: 2 dots outer ring (ring-7), 1 in ring-8  → 22 pts
//   dot1: lower-left outer         (-28, +24)
//   dot2: bottom outer             (0,  +32)
//   dot3: right of ring-8         (+22, +16)
//
// Option B: 2 dots outer ring (ring-7), 1 in ring-9  → 23 pts
//   dot1: bottom-left outer        (-24, +28)
//   dot2: bottom outer             (-8,  +32)
//   dot3: ring-9 upper-left       (-14, -14)
//
// Option C: 1 dot outer ring (ring-7), 2 in ring-8   → 23 pts
//   dot1: bottom-left outer        (-30, +22)
//   dot2: upper ring-8             (-20, -20)
//   dot3: right ring-8             (+22, -16)
//
// Option D: 1 in ring-7, 1 in ring-8, 1 in ring-9   → 24 pts
//   dot1: bottom outer             (-10, +34)
//   dot2: left ring-8              (-24, +12)
//   dot3: ring-9 upper             (+10, -14)
//
// Option E: 1 in ring-8, 1 in ring-9, 1 in bull(10) → 27 pts
//   dot1: ring-8 lower-left        (-20, +20)
//   dot2: ring-9 lower             (-10, +14)
//   dot3: bull                     (0,  0)   ← bullseye hit!

interface Dot { dx: number; dy: number }

const OPTION_DOTS: Record<string, Dot[]> = {
  A: [
    { dx: -28, dy: 24  },
    { dx: 0,   dy: 32  },
    { dx: 22,  dy: 16  },
  ],
  B: [
    { dx: -24, dy: 28  },
    { dx: -8,  dy: 32  },
    { dx: -14, dy: -14 },
  ],
  C: [
    { dx: -30, dy: 22  },
    { dx: -20, dy: -20 },
    { dx: 22,  dy: -16 },
  ],
  D: [
    { dx: -10, dy: 34  },
    { dx: -24, dy: 12  },
    { dx: 10,  dy: -14 },
  ],
  E: [
    { dx: -20, dy: 20  },
    { dx: -10, dy: 14  },
    { dx: 0,   dy: 0   },
  ],
}

// ── scores (anti-drift: match breakdown.quantities in the seed) ────────────────
export const TARGET_SCORES: Record<string, number> = {
  A: 22,
  B: 23,
  C: 23,
  D: 24,
  E: 27,
}

// ── TargetSVG primitive ────────────────────────────────────────────────────────
interface TargetSVGProps {
  dots: Dot[]
  /** Optional highlight ring colour (for explainer). */
  highlightRing?: number | null
}

export function TargetSVG({ dots, highlightRing = null }: TargetSVGProps) {
  const hlStroke = '#F59E0B'
  const hlW = 3

  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {/* target rings, outer→inner so inner renders on top */}
      <circle cx={CX} cy={CY} r={ROUT} fill={RING_7}  stroke={EDGE}     strokeWidth={1.5} />
      <circle cx={CX} cy={CY} r={R7}   fill={RING_7}  stroke={highlightRing === 7  ? hlStroke : EDGE} strokeWidth={highlightRing === 7  ? hlW : 1.5} />
      <circle cx={CX} cy={CY} r={R8}   fill={RING_8}  stroke={highlightRing === 8  ? hlStroke : EDGE} strokeWidth={highlightRing === 8  ? hlW : 1.2} />
      <circle cx={CX} cy={CY} r={R9}   fill={RING_9}  stroke={highlightRing === 9  ? hlStroke : EDGE} strokeWidth={highlightRing === 9  ? hlW : 1.2} />
      <circle cx={CX} cy={CY} r={R10}  fill={RING_10} stroke={highlightRing === 10 ? hlStroke : EDGE} strokeWidth={highlightRing === 10 ? hlW : 1.2} />

      {/* ring number labels */}
      <text x={LABEL_X} y={LABEL_10_Y} textAnchor="start" dominantBaseline="central" fontSize={6} fontWeight={700} fill={EDGE}>10</text>
      <text x={LABEL_X} y={LABEL_9_Y}  textAnchor="start" dominantBaseline="central" fontSize={6} fontWeight={600} fill={EDGE}>9</text>
      <text x={LABEL_X} y={LABEL_8_Y}  textAnchor="start" dominantBaseline="central" fontSize={6} fontWeight={600} fill={EDGE}>8</text>
      <text x={LABEL_X} y={LABEL_7_Y}  textAnchor="start" dominantBaseline="central" fontSize={6} fontWeight={600} fill={EDGE}>7</text>

      {/* arrow-hit dots */}
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={CX + d.dx}
          cy={CY + d.dy}
          r={3.2}
          fill={DOT}
          stroke="#fff"
          strokeWidth={1}
        />
      ))}
    </svg>
  )
}

// ── Option renderer (CHOICE_RENDERERS) ────────────────────────────────────────
// Receives the WmiChoice, uses its `label` to pick the right dot set.

export function Targets5ECOption({ choice }: { choice: WmiChoice }) {
  const label = choice.label as 'A' | 'B' | 'C' | 'D' | 'E'
  const dots = OPTION_DOTS[label] ?? OPTION_DOTS['A']
  const score = TARGET_SCORES[label]

  return (
    <div
      style={{ width: 80, margin: '0 auto' }}
      title={`Option ${label}: ${score} pts`}
      aria-label={`Target ${label}, scoring ${score} points`}
    >
      <TargetSVG dots={dots} />
    </div>
  )
}
