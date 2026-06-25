// SEAMOX-22-A-Q15 — "Fill 1–7 into each circle so each line of 3 sums to 12.
// What is the number in the middle circle?"
//
// OCR: docs/reference/ocr-res/seamo-x/contest/paper-a/2022.md Q15
// Crop: docs/reference/ocr-res/seamo-x/contest/paper-a/2022.imgs/013.jpg
//
// FIGURE: 7 empty circles arranged as a 3-arm star.
//   Top arm (vertical): TOP → UPPER → CENTER
//   Left arm (diagonal): CENTER → LEFT-INNER → LEFT-OUTER
//   Right arm (diagonal): CENTER → RIGHT-INNER → RIGHT-OUTER
//
// STEM shows empty circles only — never reveals the answer.
// Explainer fills in the numbers beat-by-beat.
//
// Reuses NodeGraph primitive from ./primitives/NodeGraph.
// Pure SVG, SSR-safe, no hooks, no framer-motion.

import React from 'react'
import { NodeGraph } from './primitives/NodeGraph'
import type { NodeDef, EdgeDef } from './primitives/NodeGraph'

// ── Layout constants (exported so Explainer can reuse) ────────────────────────

export const SVG_W  = 248
export const SVG_H  = 256
export const NODE_R = 24

/** Node positions — pixel coords within [0..SVG_W] × [0..SVG_H] */
export const NODE_POS = {
  top:   { x: 124, y: 20  },
  upper: { x: 124, y: 84  },
  center:{ x: 124, y: 148 },
  li:    { x: 70,  y: 192 },  // left-inner
  lo:    { x: 16,  y: 236 },  // left-outer
  ri:    { x: 178, y: 192 },  // right-inner
  ro:    { x: 232, y: 236 },  // right-outer
} as const

/** The 6 edges (2 per arm). */
export const EDGES: EdgeDef[] = [
  { a: 'top',    b: 'upper'  },
  { a: 'upper',  b: 'center' },
  { a: 'center', b: 'li'     },
  { a: 'li',     b: 'lo'     },
  { a: 'center', b: 'ri'     },
  { a: 'ri',     b: 'ro'     },
]

/**
 * Builds the NodeDef array from an optional label map.
 * When `labels` is omitted every circle is empty (STEM mode).
 * The Explainer passes { top:7, upper:1, center:4, li:2, lo:6, ri:3, ro:5 }
 * (or any valid assignment) to reveal the solution.
 */
export function buildNodes(
  labels?: Partial<Record<keyof typeof NODE_POS, number>>,
  fills?: Partial<Record<keyof typeof NODE_POS, string>>,
): NodeDef[] {
  return (Object.keys(NODE_POS) as (keyof typeof NODE_POS)[]).map((id) => ({
    id,
    x:     NODE_POS[id].x,
    y:     NODE_POS[id].y,
    label: labels?.[id] != null ? String(labels[id]) : undefined,
    fill:  fills?.[id] ?? '#FFFFFF',
  }))
}

// ── Default export: Stem illustration ─────────────────────────────────────────

/**
 * StarCirclesX22A15Illustration
 *
 * Shows the 3-arm star with 7 empty circles, reproducing SEAMO-X 2022 Paper-A
 * Q15 (013.jpg). Does NOT show any numbers — the student fills them in.
 */
export default function StarCirclesX22A15Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Three-arm star diagram with 7 empty circles. Each arm has 3 circles; fill 1–7 so every arm sums to 12."
    >
      <NodeGraph
        nodes={buildNodes()}
        edges={EDGES}
        nodeR={NODE_R}
        width={SVG_W}
        height={SVG_H}
      />
    </div>
  )
}
