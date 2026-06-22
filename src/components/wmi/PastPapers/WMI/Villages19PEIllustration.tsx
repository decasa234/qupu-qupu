// IKMC-23-PE-Q19 — "The map shows five villages A, B, C, D and E, and the
// distances in kilometres between them. Only two villages are the same distance
// apart no matter which route you choose. Which are these two villages?"
// Answer: A (B and E)
//
// MAP (reconstructed from 2023.imgs/057.jpg):
//   Five villages on a single closed-loop road (no shortcuts):
//     A (bottom-left) — 7 km — B (top-center)
//     B (top-center)  — 2 km — C (center-right)
//     C (center-right) — 6 km — D (bottom-right)
//     D (bottom-right) — 4 km — E (bottom-center)
//     E (bottom-center) — 5 km — A (bottom-left)
//   Total loop = 7 + 2 + 6 + 4 + 5 = 24 km.
//
// KEY INSIGHT: For villages B and E:
//   Route 1 (short way, B→A→E):   7 + 5 = 12 km
//   Route 2 (long way, B→C→D→E):  2 + 6 + 4 = 12 km  ← same! ✓
//   No other pair has equal-distance routes in both directions.
//
// The static illustration shows only the loop map with distances.
// The co-exported Villages19PE primitive accepts:
//   highlightEdges?: string[]   — edges to tint amber (by "A-B" style key)
//   highlightNodes?: string[]   — village nodes to tint
//   answerNodes?: string[]      — nodes rendered green (the correct pair)
// so the Explainer can animate both candidate routes and the answer.
//
// Pure SVG, SSR-safe, deterministic: no Math.random, no Date, no window.

import type { JSX } from 'react'

// ── Village positions in viewBox units (280 × 240) ─────────────────────────
// Layout mirrors the source image: A far-left (mid-height), B top-center,
// C right (mid-height), D bottom-right, E bottom-center.
// The road is a gentle loop hugging an irregular oval (like the source image).

const VB_W = 280
const VB_H = 240

type VillageId = 'A' | 'B' | 'C' | 'D' | 'E'

const VILLAGES: Record<VillageId, { x: number; y: number }> = {
  A: { x: 38,  y: 148 },   // bottom-left
  B: { x: 134, y: 40  },   // top-center
  C: { x: 218, y: 88  },   // center-right
  D: { x: 230, y: 178 },   // bottom-right
  E: { x: 132, y: 194 },   // bottom-center
}

// Edges: [from, to, km, labelOffset]
// labelOffset: perpendicular nudge so the distance label clears the road line.
interface Edge {
  a: VillageId
  b: VillageId
  km: number
  labelDx: number
  labelDy: number
}

export const EDGES: Edge[] = [
  { a: 'A', b: 'B', km: 7, labelDx: -14, labelDy: -10 },
  { a: 'B', b: 'C', km: 2, labelDx:  12, labelDy: -10 },
  { a: 'C', b: 'D', km: 6, labelDx:  18, labelDy:   6 },
  { a: 'D', b: 'E', km: 4, labelDx:   0, labelDy:  18 },
  { a: 'E', b: 'A', km: 5, labelDx:  -2, labelDy:  18 },
]

/** Canonical edge key: sorted "X-Y". */
export function edgeKey(a: string, b: string): string {
  return [a, b].sort().join('-')
}

// ── Palette ───────────────────────────────────────────────────────────────────
const C_ROAD    = '#2563EB'   // blue loop road (matching the source image)
const C_ROAD_W  = 7           // stroke width for the curved road
const C_NODE    = '#1D1D1B'   // village dot fill
const C_NODE_R  = 7           // village dot radius
const C_LABEL   = '#111827'   // village letter label
const C_DIST    = '#374151'   // distance number label
const C_AMBER   = '#D97706'   // highlighted path
const C_GREEN   = '#059669'   // answer highlight
const C_RED     = '#DC2626'   // rejected path

// ── Props ─────────────────────────────────────────────────────────────────────

export interface Villages19PEProps {
  /** Edge keys (e.g. 'A-B') to draw in amber (current route under examination). */
  highlightEdges?: string[]
  /** Edge keys to draw in red (rejected route). */
  rejectEdges?: string[]
  /** Village ids whose dot + label get coloured amber (route endpoints). */
  highlightNodes?: string[]
  /** Village ids shown in green (the correct answer pair). */
  answerNodes?: string[]
  className?: string
}

// ── Curve helper ─────────────────────────────────────────────────────────────
// The source figure shows a wavy single road (not straight lines), so we use
// quadratic bezier curves with gentle outward bulges. Each edge gets a control
// point that bulges slightly away from the figure's interior centroid (≈140, 130).

function curveData(va: { x: number; y: number }, vb: { x: number; y: number }): string {
  const mx = (va.x + vb.x) / 2
  const my = (va.y + vb.y) / 2
  // Centroid of the map
  const cx0 = 130
  const cy0 = 128
  // Vector from centroid to midpoint
  const dx = mx - cx0
  const dy = my - cy0
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  // Push control point ~18 units outward from the interior centroid
  const bulge = 18
  const cpx = mx + (dx / len) * bulge
  const cpy = my + (dy / len) * bulge
  return `M ${va.x} ${va.y} Q ${cpx} ${cpy} ${vb.x} ${vb.y}`
}

// ── Shared primitive ──────────────────────────────────────────────────────────

/**
 * Five-village loop map for IKMC-23-PE-Q19.
 * Used by both the static Illustration and the animated Explainer.
 */
export function Villages19PE({
  highlightEdges = [],
  rejectEdges = [],
  highlightNodes = [],
  answerNodes = [],
  className,
}: Villages19PEProps = {}): JSX.Element {
  const hlSet  = new Set(highlightEdges)
  const rejSet = new Set(rejectEdges)
  const hlNodeSet = new Set(highlightNodes)
  const ansSet = new Set(answerNodes)

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className={className}
      aria-hidden="true"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* ── Road edges ──────────────────────────────────────────────────── */}
      {EDGES.map((edge) => {
        const va = VILLAGES[edge.a]
        const vb = VILLAGES[edge.b]
        const key = edgeKey(edge.a, edge.b)
        const isHl  = hlSet.has(key)
        const isRej = rejSet.has(key)
        const stroke = isHl ? C_AMBER : isRej ? C_RED : C_ROAD
        const strokeW = (isHl || isRej) ? C_ROAD_W + 1 : C_ROAD_W
        const d = curveData(va, vb)

        // Distance label at midpoint + offset
        const mx = (va.x + vb.x) / 2 + edge.labelDx
        const my = (va.y + vb.y) / 2 + edge.labelDy

        return (
          <g key={key}>
            {/* road segment */}
            <path
              d={d}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeW}
              strokeLinecap="round"
            />

            {/* distance label — white halo then coloured text */}
            <text
              x={mx}
              y={my}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={14}
              fontWeight="700"
              fontFamily="sans-serif"
              stroke="white"
              strokeWidth={4}
              paintOrder="stroke"
              fill={isHl ? C_AMBER : isRej ? C_RED : C_DIST}
            >
              {edge.km}
            </text>
          </g>
        )
      })}

      {/* ── Village dots and labels ─────────────────────────────────────── */}
      {(Object.keys(VILLAGES) as VillageId[]).map((id) => {
        const v = VILLAGES[id]
        const isAns = ansSet.has(id)
        const isHlNode = hlNodeSet.has(id)
        const dotFill = isAns ? C_GREEN : isHlNode ? C_AMBER : C_NODE

        // Label placement: push letter away from the dot depending on position
        const labelOffset: Record<VillageId, [number, number]> = {
          A: [-13, 0],
          B: [0, -14],
          C: [14, 0],
          D: [14, 0],
          E: [0, 14],
        }
        const [lox, loy] = labelOffset[id]

        return (
          <g key={id}>
            {/* village dot */}
            <circle
              cx={v.x}
              cy={v.y}
              r={C_NODE_R}
              fill={dotFill}
            />
            {/* village letter */}
            <text
              x={v.x + lox}
              y={v.y + loy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={16}
              fontWeight="800"
              fontFamily="sans-serif"
              fill={isAns ? C_GREEN : isHlNode ? C_AMBER : C_LABEL}
            >
              {id}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Default export: plain static illustration ─────────────────────────────────

/**
 * Static problem figure for IKMC-23-PE-Q19.
 * Shows the five-village loop with distances only — no route highlighted.
 */
export default function Villages19PEIllustration(): JSX.Element {
  return (
    <div
      className="mx-auto w-full max-w-[300px]"
      role="img"
      aria-label={
        'Peta lima desa A, B, C, D, E terhubung dalam satu lingkaran. ' +
        'Jarak: A–B 7 km, B–C 2 km, C–D 6 km, D–E 4 km, E–A 5 km.'
      }
    >
      <Villages19PE />
    </div>
  )
}
