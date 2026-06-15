// P23G1Q10Illustration.tsx
// WMI-23P1A-Q10 (2023 Semifinal Grade 1, Paper A).
//
// Redrawn from db/seed/wmi/figures/2023-semifinal-g1-a-q10.jpg:
//   LEFT  — the two unit pieces: a solid yellow regular hexagon and a solid pink
//           60deg/120deg rhombus (the rhombus = two unit triangles).
//   RIGHT — a larger white outline that is tiled by COPIES of those two pieces.
//
// The static figure shows ONLY the problem: the two unit pieces, an arrow, and
// the empty target outline. It NEVER shows how the outline decomposes — that is
// what the answer options reveal (the seed's answer is option A).
//
// Construction (verified): two flat-top regular hexagons placed as honeycomb
// neighbours (they share exactly one edge, no overlap) plus three rhombi
// extruded onto outer edges. Edge-cancellation over the 5 tiles confirms a
// single simple boundary (every boundary node degree 2, 4 shared interior edges,
// zero overlaps). Total = 2 hexagons + 3 rhombi = 5 pieces.
//
// Pure render — no Math.random, no Date, no hooks, no window/document. SSR-safe.

import React from 'react'

// ── geometry helpers ────────────────────────────────────────────────────────
const S = 46 // unit edge length in pixels
const SQ3 = Math.sqrt(3)

type Pt = [number, number]

/** Flat-top regular hexagon (side S) centred at (cx,cy). Vertices CW in SVG. */
function flatHex(cx: number, cy: number): Pt[] {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i)
    return [cx + S * Math.cos(a), cy + S * Math.sin(a)] as Pt
  })
}

/** Rhombus (two unit triangles) glued onto edge A→B, extruded outward from origin. */
function edgeRhombus(A: Pt, B: Pt): Pt[] {
  const ex = B[0] - A[0]
  const ey = B[1] - A[1]
  const len = Math.hypot(ex, ey)
  let nx = (ey / len) * S
  let ny = (-ex / len) * S
  const mx = (A[0] + B[0]) / 2
  const my = (A[1] + B[1]) / 2
  if (mx * nx + my * ny < 0) {
    nx = -nx
    ny = -ny
  }
  return [A, B, [B[0] + nx, B[1] + ny], [A[0] + nx, A[1] + ny]]
}

function ptsStr(pts: Pt[]): string {
  return pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
}

// ── the target figure (in its own local coords, then offset into the scene) ──
const TARGET_OX = 470
const TARGET_OY = 190

const RAW_H1 = flatHex(0, 0)
const RAW_H2 = flatHex(1.5 * S, (-SQ3 / 2) * S)
const RAW_RL = edgeRhombus(RAW_H1[2], RAW_H1[3]) // upper-left point
const RAW_RB = edgeRhombus(RAW_H1[3], RAW_H1[4]) // lower-left point
const RAW_RR = edgeRhombus(RAW_H2[0], RAW_H2[1]) // right point

const shift = (pts: Pt[], ox: number, oy: number): Pt[] => pts.map(([x, y]) => [x + ox, y + oy] as Pt)

export interface TileSpec {
  kind: 'hex' | 'rhombus'
  verts: Pt[]
}

export const TARGET_TILES: TileSpec[] = [
  { kind: 'hex', verts: shift(RAW_H1, TARGET_OX, TARGET_OY) },
  { kind: 'hex', verts: shift(RAW_H2, TARGET_OX, TARGET_OY) },
  { kind: 'rhombus', verts: shift(RAW_RL, TARGET_OX, TARGET_OY) },
  { kind: 'rhombus', verts: shift(RAW_RB, TARGET_OX, TARGET_OY) },
  { kind: 'rhombus', verts: shift(RAW_RR, TARGET_OX, TARGET_OY) },
]

export const HEX_COUNT = TARGET_TILES.filter((t) => t.kind === 'hex').length // 2
export const RHOMBUS_COUNT = TARGET_TILES.filter((t) => t.kind === 'rhombus').length // 3
export const PIECE_COUNT = TARGET_TILES.length // 5

// Exact silhouette of the union, computed once by edge cancellation: edges shared
// by two tiles are interior and dropped; the survivors form one closed ring.
function keyOf(p: Pt): string {
  return `${p[0].toFixed(2)},${p[1].toFixed(2)}`
}

export function computeOutline(tiles: TileSpec[]): Pt[] {
  const count = new Map<string, number>()
  const ends = new Map<string, [Pt, Pt]>()
  for (const t of tiles) {
    const v = t.verts
    for (let i = 0; i < v.length; i++) {
      const a = v[i]
      const b = v[(i + 1) % v.length]
      const e = [keyOf(a), keyOf(b)].sort().join('|')
      count.set(e, (count.get(e) ?? 0) + 1)
      ends.set(e, [a, b])
    }
  }
  const adj = new Map<string, string[]>()
  const pt = new Map<string, Pt>()
  for (const [e, c] of count) {
    if (c !== 1) continue
    const [a, b] = ends.get(e)!
    for (const [x, y] of [
      [a, b],
      [b, a],
    ] as Array<[Pt, Pt]>) {
      pt.set(keyOf(x), x)
      if (!adj.has(keyOf(x))) adj.set(keyOf(x), [])
      adj.get(keyOf(x))!.push(keyOf(y))
    }
  }
  const startK = adj.keys().next().value as string | undefined
  if (!startK) return []
  const ring: string[] = [startK]
  let prev: string | null = null
  let cur = startK
  let guard = 0
  while (guard++ < 200) {
    const nx = adj.get(cur)!.find((n) => n !== prev)
    if (nx === undefined || nx === startK) break
    ring.push(nx)
    prev = cur
    cur = nx
  }
  return ring.map((k) => pt.get(k)!)
}

export const TARGET_OUTLINE: Pt[] = computeOutline(TARGET_TILES)

// ── unit-piece drawings (left side of the figure) ───────────────────────────
const HEX_FILL = '#F5B800'
const HEX_STROKE = '#C8960A'
const RHO_FILL = '#F4C2C2'
const RHO_STROKE = '#D98E8E'
const OUTLINE_STROKE = '#3A3027'

const UNIT_HEX_CX = 130
const UNIT_HEX_CY = 110
const UNIT_HEX_R = 70

function unitRhombusPts(cx: number, cy: number, half: number): Pt[] {
  // a 60deg/120deg rhombus drawn upright, matching the scan's pink piece
  const w = half * Math.cos(Math.PI / 6)
  const h = half
  return [
    [cx, cy - h],
    [cx + w, cy - h * 0.18],
    [cx, cy + h],
    [cx - w, cy + h * 0.18],
  ]
}

/** Reusable primitive: a single unit yellow hexagon. */
export function UnitHexagon({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const pts: Pt[] = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i)
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as Pt
  })
  return (
    <polygon points={ptsStr(pts)} fill={HEX_FILL} stroke={HEX_STROKE} strokeWidth={2.5} strokeLinejoin="round" />
  )
}

/** Reusable primitive: a single unit pink rhombus. */
export function UnitRhombus({ cx, cy, half }: { cx: number; cy: number; half: number }) {
  return (
    <polygon
      points={ptsStr(unitRhombusPts(cx, cy, half))}
      fill={RHO_FILL}
      stroke={RHO_STROKE}
      strokeWidth={2.5}
      strokeLinejoin="round"
    />
  )
}

// ── shared scene primitive ──────────────────────────────────────────────────
export interface Q10SceneProps {
  /** When true, draw the decomposition tiles filling the outline. */
  showTiling?: boolean
  /** When true, draw a 1..N count badge on each revealed tile. */
  showCounts?: boolean
  /** How many tiles to reveal (0..5). Reading order: 2 hexes then 3 rhombi. */
  revealed?: number
}

export const Q10_VIEW_W = 760
export const Q10_VIEW_H = 360

export function Q10Scene({ showTiling = false, showCounts = false, revealed = 0 }: Q10SceneProps) {
  return (
    <svg
      viewBox={`0 0 ${Q10_VIEW_W} ${Q10_VIEW_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 600 }}
      aria-hidden="true"
    >
      <defs>
        <marker id="q10arh" markerWidth="9" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0.5 L0,7.5 L8,4 Z" fill="#2BA3E0" />
        </marker>
      </defs>

      {/* LEFT: the two unit pieces */}
      <UnitHexagon cx={UNIT_HEX_CX} cy={UNIT_HEX_CY} r={UNIT_HEX_R} />
      <UnitRhombus cx={UNIT_HEX_CX} cy={258} half={52} />

      {/* arrow pointing to the target */}
      <line
        x1={250}
        y1={185}
        x2={350}
        y2={185}
        stroke="#2BA3E0"
        strokeWidth={9}
        strokeLinecap="round"
        markerEnd="url(#q10arh)"
      />

      {/* RIGHT: target outline (white silhouette when empty) */}
      <polygon
        points={ptsStr(TARGET_OUTLINE)}
        fill={showTiling ? 'none' : '#FFFFFF'}
        stroke={OUTLINE_STROKE}
        strokeWidth={3.5}
        strokeLinejoin="round"
      />

      {/* decomposition tiles inside the outline */}
      {showTiling &&
        TARGET_TILES.map((t, i) =>
          i >= revealed ? null : (
            <polygon
              key={`tile-${i}`}
              points={ptsStr(t.verts)}
              fill={t.kind === 'hex' ? HEX_FILL : RHO_FILL}
              stroke={t.kind === 'hex' ? HEX_STROKE : RHO_STROKE}
              strokeWidth={2.2}
              strokeLinejoin="round"
              opacity={0.96}
            />
          ),
        )}

      {/* re-trace the boundary on top so tile seams never cover it */}
      {showTiling && (
        <polygon
          points={ptsStr(TARGET_OUTLINE)}
          fill="none"
          stroke={OUTLINE_STROKE}
          strokeWidth={3.5}
          strokeLinejoin="round"
        />
      )}

      {/* per-piece count badges */}
      {showCounts &&
        TARGET_TILES.map((t, i) => {
          if (i >= revealed) return null
          const cx = t.verts.reduce((s, p) => s + p[0], 0) / t.verts.length
          const cy = t.verts.reduce((s, p) => s + p[1], 0) / t.verts.length
          return (
            <g key={`badge-${i}`}>
              <circle cx={cx} cy={cy} r={12} fill="#FFFFFF" stroke="#30598A" strokeWidth={2} />
              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={900} fill="#30598A">
                {i + 1}
              </text>
            </g>
          )
        })}
    </svg>
  )
}

export default function P23G1Q10Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Di kiri: satu segi enam kuning dan satu belah ketupat merah muda sebagai kepingan satuan. Tanda panah menunjuk ke kanan, ke sebuah bangun bertakik berwarna putih yang harus disusun dari salinan kedua kepingan tersebut."
    >
      <Q10Scene />
    </div>
  )
}
