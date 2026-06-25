// HexPaths22A11Illustration — SEAMO 2022 Paper A, Question 11
//
// "How many shortest paths are there from A to B? Follow the direction of the arrows."
//
// The figure is a directed hexagonal lattice formed by 7 hexagons arranged in a
// "flower" / diamond pattern: 1 top hex + 3 middle hexes + 3 bottom hexes (or more
// precisely, a 4-level arrangement 1+2+3+2+1 vertices wide). All arrows point
// downward — from A (top vertex) toward B (bottom vertex) along the shared hex edges.
//
// Vertex labelling (from the image, using hex-grid row/col offsets):
//   Level 0:   V0 (A)
//   Level 1:   V1  V2
//   Level 2:   V3  V4  V5
//   Level 3:   V6  V7
//   Level 4:   V8 (B)
//
// Directed edges (following arrows in the image):
//   V0→V1, V0→V2
//   V1→V3, V1→V4
//   V2→V4, V2→V5
//   V3→V6
//   V4→V6, V4→V7
//   V5→V7
//   V6→V8, V7→V8
//
// Path count verification (DP from A=1):
//   V1=1, V2=1, V3=1, V4=2, V5=1, V6=3, V7=3, B=6 ✓  (answer B = 6)
//
// PROBLEM-ONLY: shows the directed graph, A and B labels, arrows. Never reveals counts.
// Pure SVG render. No hooks, no motion. SSR-safe and deterministic.

import React from 'react'

// ── Layout constants ──────────────────────────────────────────────────────────

const W = 260
const H = 320

// Node pixel positions (centred in the viewBox)
// Hex flower: nodes at 5 levels, spread like a diamond
const X_MID = W / 2          // 130

// Vertical spacing between levels (the hex edges are diagonal so we need both
// horizontal and vertical offsets to match the hex shape)
const DY = 56   // vertical gap between levels
const DX = 56   // horizontal spread half-gap at each branch

// Level y positions
const Y = [20, 20 + DY, 20 + 2 * DY, 20 + 3 * DY, 20 + 4 * DY]
// Y[0]=20, Y[1]=76, Y[2]=132, Y[3]=188, Y[4]=244

export const NODES: Record<string, { x: number; y: number; label?: string }> = {
  A:  { x: X_MID,           y: Y[0], label: 'A' },
  V1: { x: X_MID - DX,      y: Y[1] },
  V2: { x: X_MID + DX,      y: Y[1] },
  V3: { x: X_MID - 2 * DX,  y: Y[2] },
  V4: { x: X_MID,           y: Y[2] },
  V5: { x: X_MID + 2 * DX,  y: Y[2] },
  V6: { x: X_MID - DX,      y: Y[3] },
  V7: { x: X_MID + DX,      y: Y[3] },
  B:  { x: X_MID,           y: Y[4], label: 'B' },
}

// Directed edges: [from, to]
export const EDGES: Array<[string, string]> = [
  ['A',  'V1'], ['A',  'V2'],
  ['V1', 'V3'], ['V1', 'V4'],
  ['V2', 'V4'], ['V2', 'V5'],
  ['V3', 'V6'],
  ['V4', 'V6'], ['V4', 'V7'],
  ['V5', 'V7'],
  ['V6', 'B'],  ['V7', 'B'],
]

// ── Colour palette ────────────────────────────────────────────────────────────

const NODE_R        = 14
const NODE_FILL     = '#FFF2DF'  // qupu-cream
const NODE_STROKE   = '#30598A'  // qupu-brand-blue
const EDGE_STROKE   = '#374151'  // dark grey
const EDGE_W        = 2
const ARROW_SIZE    = 7          // arrowhead half-width
const LABEL_FILL    = '#1F2937'
const LABEL_FONT    = 13

// ── Arrowhead helper ─────────────────────────────────────────────────────────
// Draws a small filled triangle arrowhead pointing from (x1,y1) toward (x2,y2),
// placed at a distance `r` (node radius) from the target node centre so it sits
// on the node boundary rather than inside it.

function arrowhead(
  x1: number, y1: number,
  x2: number, y2: number,
  r: number,
  size: number,
): { line: { x1: number; y1: number; x2: number; y2: number }; tip: string } {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const ux = dx / len
  const uy = dy / len

  // Arrowhead tip: on the circle boundary of the target node
  const tipX = x2 - ux * r
  const tipY = y2 - uy * r

  // Arrowhead base: one `size` step back from the tip
  const baseX = tipX - ux * size * 1.8
  const baseY = tipY - uy * size * 1.8

  // Perpendicular unit vector for the base wings
  const px = -uy
  const py =  ux

  const pts = [
    `${tipX},${tipY}`,
    `${baseX + px * size},${baseY + py * size}`,
    `${baseX - px * size},${baseY - py * size}`,
  ].join(' ')

  // Line ends at the start of the arrowhead base (not at the tip)
  const lineX2 = baseX
  const lineY2 = baseY
  // Line starts at the source node boundary
  const lineX1 = x1 + ux * r
  const lineY1 = y1 + uy * r

  return {
    line: { x1: lineX1, y1: lineY1, x2: lineX2, y2: lineY2 },
    tip: pts,
  }
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * HexPaths22A11Illustration
 *
 * Shows the directed hexagonal lattice from SEAMO 2022 Paper A Q11.
 * A at top, B at bottom. All arrows point downward following the figure.
 * Does NOT show path counts — problem-only display.
 */
export default function HexPaths22A11Illustration({
  lang = 'id',
}: {
  lang?: 'en' | 'id'
}) {
  const ariaLabel =
    lang === 'id'
      ? 'Graf heksagonal berarah dari A (atas) ke B (bawah) dengan 9 simpul. Semua panah mengarah ke bawah. Ada 6 jalur terpendek dari A ke B.'
      : 'Directed hexagonal lattice from A (top) to B (bottom) with 9 nodes. All arrows point downward. There are 6 shortest paths from A to B.'

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={Math.min(260, W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* White background */}
        <rect x={0} y={0} width={W} height={H} fill="#FFFFFF" />

        {/* ── Directed edges (lines + arrowheads) ── */}
        {EDGES.map(([fromId, toId], i) => {
          const from = NODES[fromId]
          const to   = NODES[toId]
          const { line, tip } = arrowhead(
            from.x, from.y,
            to.x,   to.y,
            NODE_R,
            ARROW_SIZE,
          )
          return (
            <g key={`edge-${i}-${fromId}-${toId}`}>
              <line
                x1={line.x1} y1={line.y1}
                x2={line.x2} y2={line.y2}
                stroke={EDGE_STROKE}
                strokeWidth={EDGE_W}
                strokeLinecap="round"
              />
              <polygon
                points={tip}
                fill={EDGE_STROKE}
              />
            </g>
          )
        })}

        {/* ── Node circles ── */}
        {Object.entries(NODES).map(([id, node]) => {
          const isEndpoint = id === 'A' || id === 'B'
          return (
            <circle
              key={`node-${id}`}
              cx={node.x}
              cy={node.y}
              r={NODE_R}
              fill={isEndpoint ? '#DBEAFE' : NODE_FILL}
              stroke={NODE_STROKE}
              strokeWidth={isEndpoint ? 2.5 : 1.8}
            />
          )
        })}

        {/* ── Node labels (only A and B) ── */}
        {Object.entries(NODES).map(([id, node]) => {
          if (!node.label) return null
          return (
            <text
              key={`label-${id}`}
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={LABEL_FONT}
              fontWeight={700}
              fill={LABEL_FILL}
            >
              {node.label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
