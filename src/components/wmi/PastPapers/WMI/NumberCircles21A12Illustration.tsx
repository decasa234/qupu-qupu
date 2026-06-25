// SEAMO-21-A-Q12 — "Susan adds up 8 of the following numbers. Given that the
// result is 400, which number did she leave out?"
//
// OCR: docs/reference/ocr-res/seamo/contest/paper-a/2021.md Q12
// Crop: docs/reference/ocr-res/seamo/contest/paper-a/2021.imgs/018.jpg
//
// FIGURE: 9 numbers scattered in circles across the page:
//   37, 29, 64, 75, 51, 78, 49, 16, 30
//
// SHOWN: all 9 numbers in their approximate original positions.
// NOT shown: which number is left out (the answer 29 / choice E).
//
// Reuses NodeGraph primitive — nodes only, no edges.
//
// Pure SVG, SSR-safe, no hooks, no framer-motion.

import React from 'react'
import { NodeGraph } from './primitives/NodeGraph'
import type { NodeDef } from './primitives/NodeGraph'

// ── Layout constants (exported so explainer can reuse) ────────────────────────

export const SVG_W = 300
export const SVG_H = 200
export const NODE_R = 22

// Node id → displayed number (exported so steps/explainer can reference by id)
export const NUMBERS: { id: string; value: number; x: number; y: number }[] = [
  { id: 'n37', value: 37, x:  70, y:  38 },
  { id: 'n29', value: 29, x: 155, y:  60 },
  { id: 'n64', value: 64, x: 238, y:  38 },
  { id: 'n75', value: 75, x:  34, y: 100 },
  { id: 'n51', value: 51, x: 108, y: 108 },
  { id: 'n78', value: 78, x: 262, y: 100 },
  { id: 'n49', value: 49, x:  60, y: 168 },
  { id: 'n16', value: 16, x: 155, y: 160 },
  { id: 'n30', value: 30, x: 230, y: 162 },
]

// ── Default export: Stem illustration ─────────────────────────────────────────

/**
 * NumberCircles21A12Illustration
 *
 * Renders all 9 numbers in plain white circles — faithfully reproducing the
 * SEAMO 2021 Paper A Q12 figure (018.jpg). Does NOT reveal the answer (29).
 */
export default function NumberCircles21A12Illustration() {
  const nodes: NodeDef[] = NUMBERS.map((n) => ({
    id:    n.id,
    x:     n.x,
    y:     n.y,
    label: String(n.value),
    fill:  '#FFFFFF',
  }))

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Nine numbers in circles: 37, 29, 64, 75, 51, 78, 49, 16, 30. Susan adds 8 of them; the total is 400."
    >
      <NodeGraph
        nodes={nodes}
        edges={[]}
        nodeR={NODE_R}
        width={SVG_W}
        height={SVG_H}
      />
    </div>
  )
}
