// Seamo18B7Fig — SEAMO 2018 Paper B Q7
// "The numbers 1, 2, 3, …, 9 is to be filled in each circle, such that
//  the sum of numbers along each line is S. Find S."
//
// Source figure (2018.imgs/004.jpg): a 4-arm star (X shape) with 9 circles.
//   – Center node: pre-labeled "5"
//   – 4 inner nodes: one per diagonal arm (NW, NE, SW, SE), unlabeled
//   – 4 outer tip nodes: one at each arm tip, unlabeled
//   – 4 diagonal lines each cross the full star: e.g. NW-tip→NW-inner→center→SE-inner→SE-tip
//
// Math reasoning (for reference, not rendered here):
//   The 4 complete diagonal lines each contain 5 circles.
//   Each non-center node appears in exactly 2 lines; the center appears in 4 lines.
//   4S = 4×(center) + 2×(sum of 4 inner nodes) + 2×(sum of 4 outer nodes)
//      = 4×5 + 2×(1+2+3+4+6+7+8+9) = 20 + 2×40 = 100 → S = 25. Answer A.
//
// Classification: STEM (figure in question stem; answer choices are numbers)
//
// Pure SVG, SSR-safe — no React hooks, no framer-motion, no window/document.

import { NodeGraph } from './primitives/NodeGraph'

// ── Layout constants ──────────────────────────────────────────────────────────

const W = 280
const H = 280
const CX = W / 2   // 140
const CY = H / 2   // 140

// Distance from center to inner node (px)
const INNER_D = 62
// Distance from center to outer tip node (px)
const OUTER_D = 124

// Node radius (slightly smaller than default to keep the star compact)
const R = 22

// ── Node positions ────────────────────────────────────────────────────────────
//
//  Diagonal arms at 45°/135°/225°/315°:
//    NW arm: (-cos45, -sin45) direction = (-1/√2, -1/√2)
//    NE arm: (+cos45, -sin45) direction = (+1/√2, -1/√2)
//    SE arm: (+cos45, +sin45) direction = (+1/√2, +1/√2)
//    SW arm: (-cos45, +sin45) direction = (-1/√2, +1/√2)
//
//  Using exact ½√2 ≈ 0.7071

const D = 0.7071   // cos(45°) = sin(45°)

function arm(dir: [number, number], dist: number): [number, number] {
  return [CX + dir[0] * dist, CY + dir[1] * dist]
}

const DIR_NW: [number, number] = [-D, -D]
const DIR_NE: [number, number] = [+D, -D]
const DIR_SE: [number, number] = [+D, +D]
const DIR_SW: [number, number] = [-D, +D]

const [NW_IN_X,  NW_IN_Y]  = arm(DIR_NW, INNER_D)
const [NE_IN_X,  NE_IN_Y]  = arm(DIR_NE, INNER_D)
const [SE_IN_X,  SE_IN_Y]  = arm(DIR_SE, INNER_D)
const [SW_IN_X,  SW_IN_Y]  = arm(DIR_SW, INNER_D)

const [NW_OUT_X, NW_OUT_Y] = arm(DIR_NW, OUTER_D)
const [NE_OUT_X, NE_OUT_Y] = arm(DIR_NE, OUTER_D)
const [SE_OUT_X, SE_OUT_Y] = arm(DIR_SE, OUTER_D)
const [SW_OUT_X, SW_OUT_Y] = arm(DIR_SW, OUTER_D)

// ── Node definitions ──────────────────────────────────────────────────────────

const CENTER_FILL = '#FEF3C7'   // warm amber — pre-filled center
const BLANK_FILL  = '#F5F0E8'   // off-white — unlabeled circles

export const NODES_18B7 = [
  // Center (pre-filled with 5)
  { id: 'C',     x: CX,        y: CY,        fill: CENTER_FILL, label: '5' },
  // Inner nodes (unlabeled)
  { id: 'NW_IN', x: NW_IN_X,  y: NW_IN_Y,   fill: BLANK_FILL },
  { id: 'NE_IN', x: NE_IN_X,  y: NE_IN_Y,   fill: BLANK_FILL },
  { id: 'SE_IN', x: SE_IN_X,  y: SE_IN_Y,   fill: BLANK_FILL },
  { id: 'SW_IN', x: SW_IN_X,  y: SW_IN_Y,   fill: BLANK_FILL },
  // Outer tip nodes (unlabeled)
  { id: 'NW_OUT', x: NW_OUT_X, y: NW_OUT_Y, fill: BLANK_FILL },
  { id: 'NE_OUT', x: NE_OUT_X, y: NE_OUT_Y, fill: BLANK_FILL },
  { id: 'SE_OUT', x: SE_OUT_X, y: SE_OUT_Y, fill: BLANK_FILL },
  { id: 'SW_OUT', x: SW_OUT_X, y: SW_OUT_Y, fill: BLANK_FILL },
]

// ── Edge definitions ──────────────────────────────────────────────────────────
//
//  Edges follow the 4 diagonal arms:
//    NW arm: NW_OUT — NW_IN — C
//    NE arm: NE_OUT — NE_IN — C
//    SE arm: SE_OUT — SE_IN — C
//    SW arm: SW_OUT — SW_IN — C
//
//  We do NOT draw edges between inner nodes of different arms; the star
//  shape is simply 4 spoke-pairs emanating from the center.

export const EDGES_18B7 = [
  { a: 'NW_OUT', b: 'NW_IN' },
  { a: 'NW_IN',  b: 'C'     },
  { a: 'NE_OUT', b: 'NE_IN' },
  { a: 'NE_IN',  b: 'C'     },
  { a: 'SE_OUT', b: 'SE_IN' },
  { a: 'SE_IN',  b: 'C'     },
  { a: 'SW_OUT', b: 'SW_IN' },
  { a: 'SW_IN',  b: 'C'     },
]

// ── Reusable figure component ─────────────────────────────────────────────────

export interface Seamo18B7FigureProps {
  /**
   * Optional label overrides — maps node id → display text.
   * Pass { NW_IN: '3', NE_IN: '7', … } to show solution values in the explainer.
   */
  labels?: Partial<Record<string, string>>
  /**
   * Optional fill overrides — maps node id → CSS colour.
   */
  fills?: Partial<Record<string, string>>
}

export function Seamo18B7Figure({
  labels,
  fills,
}: Seamo18B7FigureProps = {}) {
  const nodes = NODES_18B7.map((n) => ({
    ...n,
    label: labels?.[n.id] ?? n.label,
    fill:  fills?.[n.id]  ?? n.fill,
  }))

  return (
    <NodeGraph
      nodes={nodes}
      edges={EDGES_18B7}
      nodeR={R}
      width={W}
      height={H}
    />
  )
}

// ── Default export — static illustration ──────────────────────────────────────

export default function Seamo18B7Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'A 4-arm star of 9 circles arranged diagonally. ' +
        'The center circle is labeled 5. ' +
        'Each arm has one inner circle and one outer tip circle, all unlabeled. ' +
        'Numbers 1 to 9 are placed so that the sum along each diagonal line equals S.'
      }
    >
      <Seamo18B7Figure />
    </div>
  )
}

// ── Registry entry (paste into registry.ts — do NOT edit here) ───────────────
//
//   'SEAMO-18-B-Q7': {
//     type: 'stem',
//     illustration: () => import('./Seamo18B7Fig'),
//   },
