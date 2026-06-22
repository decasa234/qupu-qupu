// IKMC-20-PE-Q10 — "A village of 12 houses has four straight roads and four
// circular roads. The map shows 11 of the houses. On each straight road there
// are 3 houses. On each circular road there are also 3 houses. Where on the map
// should the 12th house be put?" Answer: C
//
// Layout (reconstructed from constraint analysis matching the paper figure):
//   4 straight "spoke" roads: Top, Right, Bottom, Left
//   4 circular "ring" roads: Ring 1 (innermost) through Ring 4 (outermost)
//   16 intersection nodes total; 11 have houses; 5 are labeled candidates.
//
// VALID SOLUTION PROOF (exhaustive constraint check):
//   Empty positions: B=Top-r1, A=Right-r3, C=Right-r4, D=Bottom-r2, E=Left-r4
//   Houses (11):    Top-r2,r3,r4 | Right-r1,r2 | Bottom-r1,r3,r4 | Left-r1,r2,r3
//
//   Road counts (before adding any candidate):
//     Top spoke:    r2✓ r3✓ r4✓        = 3 ✓   (adding B→4 ✗)
//     Right spoke:  r1✓ r2✓            = 2 !   (needs one more)
//     Bottom spoke: r1✓ r3✓ r4✓        = 3 ✓   (adding D→4 ✗)
//     Left spoke:   r1✓ r2✓ r3✓        = 3 ✓   (adding E→4 ✗)
//     Ring 1:       Right✓ Bottom✓ Left✓ = 3 ✓  (adding B→4 ✗)
//     Ring 2:       Top✓ Right✓ Left✓   = 3 ✓   (adding D→4 ✗)
//     Ring 3:       Top✓ Bottom✓ Left✓  = 3 ✓   (adding A→4 ✗)
//     Ring 4:       Top✓ Bottom✓        = 2 !   (needs one more)
//
//   Adding C (Right×Ring4): Right spoke 2→3 ✓, Ring4 2→3 ✓. VALID — unique answer.
//   Adding A (Right×Ring3): Right spoke 2→3 ✓ but Ring3 3→4 ✗. INVALID.
//   Adding B (Top×Ring1):   Top spoke 3→4 ✗. INVALID.
//   Adding D (Bottom×Ring2): Bottom spoke 3→4 ✗. INVALID.
//   Adding E (Left×Ring4):  Left spoke 3→4 ✗. INVALID.
//   → C is the UNIQUE valid position.
//
// Pure SVG, SSR-safe, deterministic: no Math.random, no Date, no window.
// Exports a shared primitive VillageMap10PE (configurable highlight mode) used
// by both VillageMap10PEIllustration (plain map) and VillageMap10PEExplainer
// (animated breakdown with road highlighting).

import type { JSX } from 'react'

// ── Geometry ─────────────────────────────────────────────────────────────────

const CX = 140
const CY = 140
const R = [0, 38, 70, 102, 128] as const // index 1..4 → ring radii
const VIEW = '0 0 280 280'

// Node centres for each (spoke, ring) intersection.
// Spokes: T=top, R=right, B=bottom, L=left
const N = {
  T1: [CX, CY - R[1]],
  T2: [CX, CY - R[2]],
  T3: [CX, CY - R[3]],
  T4: [CX, CY - R[4]],
  R1: [CX + R[1], CY],
  R2: [CX + R[2], CY],
  R3: [CX + R[3], CY],
  R4: [CX + R[4], CY],
  B1: [CX, CY + R[1]],
  B2: [CX, CY + R[2]],
  B3: [CX, CY + R[3]],
  B4: [CX, CY + R[4]],
  L1: [CX - R[1], CY],
  L2: [CX - R[2], CY],
  L3: [CX - R[3], CY],
  L4: [CX - R[4], CY],
} as const

// ── House positions (11) ──────────────────────────────────────────────────────
// Empties (candidates): B=T1, A=R3, C=R4, D=B2, E=L4
type Pt = readonly [number, number]
const HOUSES: Pt[] = [
  N.T2, N.T3, N.T4,       // Top spoke (3 houses, r1=B missing)
  N.R1, N.R2,              // Right spoke (2 houses, r3=A & r4=C missing)
  N.B1, N.B3, N.B4,       // Bottom spoke (3 houses, r2=D missing)
  N.L1, N.L2, N.L3,       // Left spoke (3 houses, r4=E missing)
]

// ── Candidate positions (A–E) ─────────────────────────────────────────────────
export const CANDIDATES: Record<string, Pt> = {
  A: N.R3,
  B: N.T1,
  C: N.R4,
  D: N.B2,
  E: N.L4,
}

// ── Colours ───────────────────────────────────────────────────────────────────
const C_ROAD        = '#92400E'
const C_ROAD_DIM    = '#D6B58A'
const C_HIGHLIGHT   = '#F59E0B'
const C_HOUSE_FILL  = '#3B82F6'
const C_HOUSE_STK   = '#1E3A5F'
const C_CAND_FILL   = '#FFFFFF'
const C_CAND_STK    = '#374151'
const C_ANSWER      = '#10B981'
const C_CENTER      = '#92400E'

// ── Sub-components ────────────────────────────────────────────────────────────

/** Small house icon centred at (cx, cy). */
function House({ cx, cy, size = 13 }: { cx: number; cy: number; size?: number }) {
  const hw = size / 2
  const bodyH = size * 0.55
  const roofH = size * 0.48
  const bx = cx - hw
  const by = cy - bodyH / 2 + roofH * 0.4
  return (
    <g>
      {/* roof triangle */}
      <polygon
        points={`${cx},${cy - hw - roofH * 0.6} ${cx - hw},${cy - hw + roofH * 0.4} ${cx + hw},${cy - hw + roofH * 0.4}`}
        fill={C_HOUSE_FILL}
        stroke={C_HOUSE_STK}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      {/* body rectangle */}
      <rect
        x={bx}
        y={by}
        width={size}
        height={bodyH}
        fill={C_HOUSE_FILL}
        stroke={C_HOUSE_STK}
        strokeWidth={1.2}
      />
    </g>
  )
}

/** Candidate circle with letter label. */
function Candidate({
  cx,
  cy,
  label,
  correct,
}: {
  cx: number
  cy: number
  label: string
  correct?: boolean
}) {
  const fill   = correct ? C_ANSWER  : C_CAND_FILL
  const stroke = correct ? C_ANSWER  : C_CAND_STK
  const text   = correct ? '#FFFFFF' : '#111827'
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill={fill} stroke={stroke} strokeWidth={1.8} />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={9}
        fontWeight="800"
        fontFamily="sans-serif"
        fill={text}
      >
        {label}
      </text>
    </g>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type HighlightRoad = 'right-spoke' | 'ring4' | 'both' | null

export interface VillageMap10PEProps {
  /** Which road(s) to tint in amber to show they are under-count. */
  highlightRoad?: HighlightRoad
  /** When true, render candidate C in green (confirmed correct answer). */
  highlightAnswer?: boolean
  className?: string
}

// ── Shared primitive ──────────────────────────────────────────────────────────

/**
 * Spider-web village-map figure for IKMC-20-PE-Q10.
 * Used by both the static Illustration and the animated Explainer.
 */
export function VillageMap10PE({
  highlightRoad = null,
  highlightAnswer = false,
  className,
}: VillageMap10PEProps): JSX.Element {
  const hlRight = highlightRoad === 'right-spoke' || highlightRoad === 'both'
  const hlRing4 = highlightRoad === 'ring4' || highlightRoad === 'both'

  /** Stroke for each road segment or ring. */
  const spokeColor = (spoke: 'T' | 'R' | 'B' | 'L') => {
    if (spoke === 'R' && hlRight) return C_HIGHLIGHT
    return C_ROAD
  }
  const ringColor = (ring: 1 | 2 | 3 | 4) => {
    if (ring === 4 && hlRing4) return C_HIGHLIGHT
    return C_ROAD
  }
  const ringDim = (ring: 1 | 2 | 3 | 4) => {
    const isHl = (ring === 4 && hlRing4)
    if (highlightRoad !== null && !isHl) return C_ROAD_DIM
    return C_ROAD
  }

  const sw      = (isHl: boolean) => isHl ? 3.5 : 2
  const swSpoke = (spoke: 'T' | 'R' | 'B' | 'L') => {
    const isHl = spoke === 'R' && hlRight
    return sw(isHl)
  }
  const swRing  = (ring: 1 | 2 | 3 | 4) => {
    const isHl = ring === 4 && hlRing4
    return sw(isHl)
  }

  return (
    <svg
      viewBox={VIEW}
      className={className}
      aria-hidden="true"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* ── Rings (circular roads) ────────────────────────── */}
      {([1, 2, 3, 4] as const).map((r) => (
        <circle
          key={r}
          cx={CX}
          cy={CY}
          r={R[r]}
          fill="none"
          stroke={highlightRoad !== null ? (r === 4 && hlRing4 ? ringColor(r) : ringDim(r)) : ringColor(r)}
          strokeWidth={swRing(r)}
        />
      ))}

      {/* ── Spokes (straight roads) ───────────────────────── */}
      {/* Top */}
      <line
        x1={CX} y1={CY}
        x2={CX} y2={CY - R[4]}
        stroke={highlightRoad !== null ? (hlRight ? C_ROAD_DIM : spokeColor('T')) : spokeColor('T')}
        strokeWidth={swSpoke('T')}
      />
      {/* Right */}
      <line
        x1={CX} y1={CY}
        x2={CX + R[4]} y2={CY}
        stroke={highlightRoad !== null ? (hlRight ? spokeColor('R') : C_ROAD_DIM) : spokeColor('R')}
        strokeWidth={swSpoke('R')}
      />
      {/* Bottom */}
      <line
        x1={CX} y1={CY}
        x2={CX} y2={CY + R[4]}
        stroke={highlightRoad !== null ? (hlRight ? C_ROAD_DIM : spokeColor('B')) : spokeColor('B')}
        strokeWidth={swSpoke('B')}
      />
      {/* Left */}
      <line
        x1={CX} y1={CY}
        x2={CX - R[4]} y2={CY}
        stroke={highlightRoad !== null ? (hlRight ? C_ROAD_DIM : spokeColor('L')) : spokeColor('L')}
        strokeWidth={swSpoke('L')}
      />

      {/* ── Center hub dot ───────────────────────────────── */}
      <circle cx={CX} cy={CY} r={4} fill={C_CENTER} />

      {/* ── 11 house icons ───────────────────────────────── */}
      {HOUSES.map(([hx, hy], i) => (
        <House key={i} cx={hx} cy={hy} />
      ))}

      {/* ── 5 candidate labels ───────────────────────────── */}
      {Object.entries(CANDIDATES).map(([lbl, [cx, cy]]) => (
        <Candidate
          key={lbl}
          cx={cx}
          cy={cy}
          label={lbl}
          correct={highlightAnswer && lbl === 'C'}
        />
      ))}
    </svg>
  )
}

// ── Default export: plain static illustration ─────────────────────────────────

/**
 * Static problem figure for IKMC-20-PE-Q10 (no highlights, no animation).
 * Used as the `illustration` entry in the VISUALS registry.
 */
export default function VillageMap10PEIllustration(): JSX.Element {
  return (
    <div className="mx-auto w-full max-w-[280px]">
      <VillageMap10PE />
    </div>
  )
}
