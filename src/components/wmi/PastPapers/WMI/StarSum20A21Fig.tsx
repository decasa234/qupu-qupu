// StarSum20A21Fig — SEAMO 2020 Paper A Q21
// "Fill the circles with numbers 1 to 7 so that the sum of numbers along
//  each line is 12. You may only use each number once."
//
// Source figure (2020.imgs/022.jpg): a 3-arm star with 7 circles.
//   – Center node  (unlabeled, to be filled)
//   – 3 inner nodes: one per arm
//   – 3 outer tip nodes: one at each arm tip
//   – 3 arms: UP, lower-LEFT (210°), lower-RIGHT (330°)
//   – Each arm is a line of 3 nodes: tip → inner → center
//
// Solution (for explainer reference, NOT rendered here):
//   Sum 1..7 = 28. Center appears in all 3 lines.
//   3 × 12 = 36 = 28 + 2 × center  →  center = 4.
//   Pair opposite arm tips to sum to 8: (1,7), (2,6), (3,5).
//   One valid placement: center=4; UP arm=(7,1); LL arm=(6,2); LR arm=(5,3).
//
// Classification: STEM (figure in question stem; answer is a fill-in value = 4)
//
// Pure SVG, SSR-safe — no React hooks, no framer-motion, no window/document.

import { NodeGraph, type NodeDef } from './primitives/NodeGraph'

// ── Layout constants ──────────────────────────────────────────────────────────

const W = 280
const H = 280
const CX = W / 2   // 140
const CY = H / 2   // 140

// Distance from center to inner node (px)
const INNER_D = 60
// Distance from center to outer tip node (px)
const OUTER_D = 118

// Node radius
const R = 22

// ── Arm directions (unit vectors) ─────────────────────────────────────────────
//
//  3 arms at 90° (UP), 210° (lower-left), 330° (lower-right).
//  Standard trig: angle from +X axis, clockwise in SVG coords (+Y down).
//    UP      = 270° in standard = (cos270°, sin270°) = (0, -1)
//    LL (210°) = (cos210°, sin210°) = (-√3/2, +1/2)
//    LR (330°) = (cos330°, sin330°) = (+√3/2, +1/2)
//
//  In SVG: +Y is DOWN, so we negate the Y component vs. math convention.
//    UP  vector: (0,  -1)
//    LL  vector: (-√3/2, +1/2)   <- already correct in SVG (+Y = down)
//    LR  vector: (+√3/2, +1/2)

const SQ3_2 = Math.sqrt(3) / 2   // ≈ 0.8660

const DIR_UP: [number, number] = [0,        -1     ]
const DIR_LL: [number, number] = [-SQ3_2,   +0.5   ]
const DIR_LR: [number, number] = [+SQ3_2,   +0.5   ]

function arm(dir: [number, number], dist: number): [number, number] {
  return [
    Math.round((CX + dir[0] * dist) * 10) / 10,
    Math.round((CY + dir[1] * dist) * 10) / 10,
  ]
}

const [UP_IN_X,  UP_IN_Y]  = arm(DIR_UP, INNER_D)
const [LL_IN_X,  LL_IN_Y]  = arm(DIR_LL, INNER_D)
const [LR_IN_X,  LR_IN_Y]  = arm(DIR_LR, INNER_D)

const [UP_OUT_X, UP_OUT_Y] = arm(DIR_UP, OUTER_D)
const [LL_OUT_X, LL_OUT_Y] = arm(DIR_LL, OUTER_D)
const [LR_OUT_X, LR_OUT_Y] = arm(DIR_LR, OUTER_D)

// ── Node definitions ──────────────────────────────────────────────────────────

const BLANK_FILL = '#F5F0E8'   // off-white — empty circles (problem stem)

export const NODES_20A21: NodeDef[] = [
  // Center (unlabeled — student fills this)
  { id: 'C',      x: CX,        y: CY,        fill: BLANK_FILL },
  // Inner nodes (one per arm, unlabeled)
  { id: 'UP_IN',  x: UP_IN_X,  y: UP_IN_Y,   fill: BLANK_FILL },
  { id: 'LL_IN',  x: LL_IN_X,  y: LL_IN_Y,   fill: BLANK_FILL },
  { id: 'LR_IN',  x: LR_IN_X,  y: LR_IN_Y,   fill: BLANK_FILL },
  // Outer tip nodes (unlabeled)
  { id: 'UP_OUT', x: UP_OUT_X, y: UP_OUT_Y,  fill: BLANK_FILL },
  { id: 'LL_OUT', x: LL_OUT_X, y: LL_OUT_Y,  fill: BLANK_FILL },
  { id: 'LR_OUT', x: LR_OUT_X, y: LR_OUT_Y,  fill: BLANK_FILL },
]

// ── Edge definitions ──────────────────────────────────────────────────────────
//
//  3 arms: tip → inner → center.
//  Edges are individual segments so NodeGraph renders each line segment.

export const EDGES_20A21 = [
  { a: 'UP_OUT', b: 'UP_IN' },
  { a: 'UP_IN',  b: 'C'     },
  { a: 'LL_OUT', b: 'LL_IN' },
  { a: 'LL_IN',  b: 'C'     },
  { a: 'LR_OUT', b: 'LR_IN' },
  { a: 'LR_IN',  b: 'C'     },
]

// ── Reusable figure component ─────────────────────────────────────────────────

export interface StarSum20A21FigureProps {
  /**
   * Optional label overrides — maps node id → display text.
   * e.g. { C: '4', UP_IN: '1', UP_OUT: '7', … } to show solution in explainer.
   */
  labels?: Partial<Record<string, string>>
  /**
   * Optional fill overrides — maps node id → CSS colour.
   */
  fills?: Partial<Record<string, string>>
}

export function StarSum20A21Figure({
  labels,
  fills,
}: StarSum20A21FigureProps = {}) {
  const nodes = NODES_20A21.map((n) => ({
    ...n,
    label: labels?.[n.id] ?? n.label,
    fill:  fills?.[n.id]  ?? n.fill,
  }))

  return (
    <NodeGraph
      nodes={nodes}
      edges={EDGES_20A21}
      nodeR={R}
      width={W}
      height={H}
    />
  )
}

// ── Default export — static illustration ──────────────────────────────────────

export default function StarSum20A21Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'A 3-arm star of 7 circles. ' +
        'One center circle connects to 3 inner circles, each of which connects to an outer tip circle. ' +
        'The three arms point upward, lower-left, and lower-right. ' +
        'All 7 circles are empty — fill them with numbers 1 to 7 so each line of three sums to 12.'
      }
    >
      <StarSum20A21Figure />
    </div>
  )
}

// ── Registry entry (paste into registry.ts — do NOT embed here) ──────────────
//
//   VISUALS['SEAMO-20-A-Q21'] = {
//     illustration: lazy(() =>
//       import('./StarSum20A21Fig').then((m) => ({ default: m.default }))
//     ),
//   }
