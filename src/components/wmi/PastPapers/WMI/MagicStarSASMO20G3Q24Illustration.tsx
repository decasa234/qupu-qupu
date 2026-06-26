// SASMO 2020 G3 Q24 — 7-circle Y-shaped figure (magic-arrangement).
// Place 2,5,8,11,14,17,20 in 7 circles so every straight line sums equal.
// Illustration shows the EMPTY circles — problem state only (no numbers).
// Primitive: NodeGraph (./primitives/NodeGraph) — 7 nodes, 6 straight edges.
// SSR-safe: no hooks, no framer-motion, no randomness, no Date.

import React from 'react'
import { NodeGraph } from './primitives/NodeGraph'
import type { NodeDef } from './primitives/NodeGraph'

// ── Topology ────────────────────────────────────────────────────────────────
// Y-shape: junction (jn) shared by 3 arms.
// Line 1 (left arm):   tl — ml — jn
// Line 2 (right arm):  tr — mr — jn
// Line 3 (bottom arm): jn — bm — bt

export const W = 240
export const H = 260

export const NODES_BASE: NodeDef[] = [
  { id: 'tl', x: 60,  y: 76  },  // top-left tip
  { id: 'ml', x: 88,  y: 108 },  // top-left mid
  { id: 'tr', x: 180, y: 76  },  // top-right tip
  { id: 'mr', x: 152, y: 108 },  // top-right mid
  { id: 'jn', x: 120, y: 140 },  // junction (shared by all 3 lines)
  { id: 'bm', x: 120, y: 182 },  // bottom mid
  { id: 'bt', x: 120, y: 222 },  // bottom tip
]

export const EDGES = [
  { a: 'tl', b: 'ml' },
  { a: 'ml', b: 'jn' },
  { a: 'tr', b: 'mr' },
  { a: 'mr', b: 'jn' },
  { a: 'jn', b: 'bm' },
  { a: 'bm', b: 'bt' },
]

// ── Shared component (reused by the explainer) ────────────────────────────
export interface MagicStarProps {
  /** IDs of nodes to highlight (amber fill). */
  highlighted?: string[]
  /** Labels to show in circles (id → display string). */
  labels?: Record<string, string>
}

export function MagicStarSASMO20G3Q24({
  highlighted = [],
  labels = {},
}: MagicStarProps) {
  const nodes: NodeDef[] = NODES_BASE.map(n => ({
    ...n,
    fill:  highlighted.includes(n.id) ? '#FEF08A' : undefined,
    label: labels[n.id],
  }))

  return (
    <NodeGraph
      nodes={nodes}
      edges={EDGES}
      nodeR={20}
      width={W}
      height={H}
    />
  )
}

// ── Default export: illustration (empty circles) ──────────────────────────
export default function MagicStarSASMO20G3Q24Illustration() {
  return <MagicStarSASMO20G3Q24 />
}
