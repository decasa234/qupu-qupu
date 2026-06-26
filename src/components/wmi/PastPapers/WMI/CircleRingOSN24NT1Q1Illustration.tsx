// OSN 2024 SD Nasional Teori1 Q1 — ring-of-circles constraint puzzle.
// Source: docs/reference/ocr-res/osn/nasional/sd/2024-teori1.imgs/003.jpg
// 9 circles in a ring. Anchors: 1 (top), 5 (lower-right), 4 (left).
// Adjacent sums must not be divisible by 3, 5, or 7. Find x.
// Unique ring CW from top: 1–3–8–5–6(x)–2–9–4–7.
// Primitive: NodeGraph from ./primitives/NodeGraph.

import { NodeGraph } from './primitives/NodeGraph'

// ── Geometry: regular 9-gon, cx=150 cy=150 r=108 ─────────────────────────────
// angle_k = -90 + k*40 degrees (CW from top in SVG space)

function nodePos(k: number) {
  const rad = ((-90 + k * 40) * Math.PI) / 180
  return {
    x: Math.round(150 + 108 * Math.cos(rad)),
    y: Math.round(150 + 108 * Math.sin(rad)),
  }
}

// Ring order CW from top (index → true value, role)
const RING_DEF = [
  { id: 'n0', value: 1, anchor: true,  xNode: false }, // top
  { id: 'n1', value: 3, anchor: false, xNode: false }, // upper-right
  { id: 'n2', value: 8, anchor: false, xNode: false }, // right
  { id: 'n3', value: 5, anchor: true,  xNode: false }, // lower-right
  { id: 'n4', value: 6, anchor: false, xNode: true  }, // bottom (x)
  { id: 'n5', value: 2, anchor: false, xNode: false }, // lower-left
  { id: 'n6', value: 9, anchor: false, xNode: false }, // left-lower
  { id: 'n7', value: 4, anchor: true,  xNode: false }, // left
  { id: 'n8', value: 7, anchor: false, xNode: false }, // upper-left
]

// Ring edges (consecutive pairs, wrapping)
const RING_EDGES = RING_DEF.map((_, i) => ({
  a: RING_DEF[i].id,
  b: RING_DEF[(i + 1) % 9].id,
}))

// ── Colour palette ────────────────────────────────────────────────────────────
const ANCHOR_FILL = '#BFDBFE' // blue-200  – fixed anchors
const X_FILL      = '#FDE68A' // yellow-200 – unknown x
const BLANK_FILL  = '#F1F5F9' // slate-100  – empty unknown nodes
const FOCUS_FILL  = '#93C5FD' // blue-300   – explainer focus highlight
const REVEAL_FILL = '#86EFAC' // green-300  – revealed/placed values
const ANSWER_FILL = '#4ADE80' // green-400  – x when solved

// ── Shared figure (also used by the explainer) ────────────────────────────────

export interface CircleRingFigureProps {
  /** Node ids (n0–n8) to draw in the focus colour. */
  highlight?: string[]
  /** Node ids (n0–n8) to reveal their true value in green. */
  reveal?: string[]
  /** When true, the x-node shows '6' instead of 'x'. */
  xSolved?: boolean
}

/** Shared SVG figure — stem view by default (no highlight/reveal). */
export function CircleRingFigure({
  highlight = [],
  reveal = [],
  xSolved = false,
}: CircleRingFigureProps) {
  const nodes = RING_DEF.map(({ id, value, anchor, xNode }, k) => {
    const isFocus   = highlight.includes(id)
    const isRevealed = reveal.includes(id)

    // Label
    let label: string
    if (anchor)                         label = String(value)
    else if (xNode && (xSolved || isRevealed)) label = '6'
    else if (xNode)                     label = 'x'
    else if (isRevealed)                label = String(value)
    else                                label = ''

    // Fill
    let fill: string
    if (xNode && (xSolved || (isRevealed && !isFocus))) fill = ANSWER_FILL
    else if (isRevealed && !isFocus)    fill = REVEAL_FILL
    else if (isFocus)                   fill = FOCUS_FILL
    else if (anchor)                    fill = ANCHOR_FILL
    else if (xNode)                     fill = X_FILL
    else                                fill = BLANK_FILL

    const pos = nodePos(k)
    return { id, x: pos.x, y: pos.y, fill, label }
  })

  return (
    <NodeGraph
      nodes={nodes}
      edges={RING_EDGES}
      nodeR={22}
      width={300}
      height={300}
    />
  )
}

// ── Default export: stem illustration (problem state only) ────────────────────

export default function CircleRingOSN24NT1Q1Illustration() {
  return <CircleRingFigure />
}
