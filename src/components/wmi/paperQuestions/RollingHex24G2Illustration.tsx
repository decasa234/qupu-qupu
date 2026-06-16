// RollingHex24G2Illustration.tsx
// WMI-24F2A-Q15: equilateral triangle rolls around a regular hexagon.
// Shows: solid yellow hexagon + solid pink starting triangle (with smiley face)
//        + 5 dashed ghost outlines at positions 1–5 + curved arrows + labels.
// NEVER reveals the answer (which orientations are identical).
// Pure render — no Math.random, no Date, no hooks. SSR-safe.

import React from 'react'

// ── geometry helpers ─────────────────────────────────────────────────────────

/** Points string for a regular n-gon centred at (cx,cy) with first vertex at angle0Deg° */
function polyPts(cx: number, cy: number, r: number, n: number, angle0Deg: number): string {
  return Array.from({ length: n }, (_, i) => {
    const a = ((angle0Deg + (i * 360) / n) * Math.PI) / 180
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`
  }).join(' ')
}

/** Points string for an equilateral triangle with centroid (cx,cy), circumradius r,
 *  and apex pointing at angle apexDeg° (SVG coords, +y down). */
function triPoints(cx: number, cy: number, r: number, apexDeg: number): string {
  return polyPts(cx, cy, r, 3, apexDeg)
}

// ── scene constants ──────────────────────────────────────────────────────────

const HEX_CX = 150
const HEX_CY = 152
const HEX_R = 72   // circumradius of the hexagon; for a regular hex, side = circumradius

// Flat-top hexagon: first vertex at 0° (right), so edges are:
//   e0: v0(right) → v1(lower-right)        lower-right slant
//   e1: v1(lower-right) → v2(lower-left)   bottom horizontal
//   e2: v2(lower-left) → v3(left)          lower-left slant
//   e3: v3(left) → v4(upper-left)          upper-left slant
//   e4: v4(upper-left) → v5(upper-right)   TOP horizontal  ← starting position
//   e5: v5(upper-right) → v0(right)        upper-right slant
//
// Rolling clockwise from the top:
//   start = e4, pos1 = e5, pos2 = e0, pos3 = e1, pos4 = e2, pos5 = e3

const HEX_ANGLE0 = 0  // first vertex angle (flat-top)

// Equilateral triangle with same side as hexagon (side = HEX_R):
//   circumradius = side / sqrt(3)
const TRI_R = HEX_R / Math.sqrt(3)

// Distance from edge midpoint to triangle centroid (= height/3 = side*sqrt(3)/6)
const TRI_CENT_OFFSET = HEX_R * Math.sqrt(3) / 6

// Edge index sequence: [start, pos1, pos2, pos3, pos4, pos5]
const EDGE_SEQ = [4, 5, 0, 1, 2, 3]
const POS_LABELS = ['', '1', '2', '3', '4', '5']

// ── exported primitives (for animator) ────────────────────────────────────────

export interface HexTriSceneData {
  hexCx: number
  hexCy: number
  hexR: number
  triR: number
  triCentOffset: number
  /** ordered [startEdge, pos1Edge, pos2Edge, pos3Edge, pos4Edge, pos5Edge] */
  edgeSeq: number[]
  posLabels: string[]
}

export const HEX_TRI_SCENE: HexTriSceneData = {
  hexCx: HEX_CX,
  hexCy: HEX_CY,
  hexR: HEX_R,
  triR: TRI_R,
  triCentOffset: TRI_CENT_OFFSET,
  edgeSeq: EDGE_SEQ,
  posLabels: POS_LABELS,
}

// Compute hex vertices (flat-top, angle0=0)
function computeHexVerts(): Array<[number, number]> {
  return Array.from({ length: 6 }, (_, i) => {
    const a = ((HEX_ANGLE0 + i * 60) * Math.PI) / 180
    return [HEX_CX + HEX_R * Math.cos(a), HEX_CY + HEX_R * Math.sin(a)] as [number, number]
  })
}

interface EdgeInfo {
  midX: number
  midY: number
  nx: number   // outward unit normal x
  ny: number   // outward unit normal y
  triCx: number  // triangle centroid x
  triCy: number  // triangle centroid y
  apexDeg: number  // triangle apex direction (degrees)
}

function computeEdgeInfo(verts: Array<[number, number]>): EdgeInfo[] {
  return verts.map((v, i) => {
    const next = verts[(i + 1) % 6]
    const midX = (v[0] + next[0]) / 2
    const midY = (v[1] + next[1]) / 2
    const dx = midX - HEX_CX
    const dy = midY - HEX_CY
    const len = Math.sqrt(dx * dx + dy * dy)
    const nx = dx / len
    const ny = dy / len
    const triCx = midX + nx * TRI_CENT_OFFSET
    const triCy = midY + ny * TRI_CENT_OFFSET
    const apexDeg = Math.atan2(ny, nx) * (180 / Math.PI)
    return { midX, midY, nx, ny, triCx, triCy, apexDeg }
  })
}

// ── smiley face helpers ───────────────────────────────────────────────────────

interface SmileyProps {
  cx: number; cy: number; r: number; apexDeg: number
}

function SmileyFace({ cx, cy, r, apexDeg }: SmileyProps) {
  const apexRad = (apexDeg * Math.PI) / 180
  // Unit vectors: toward apex and perpendicular (left of apex = counter-clockwise 90°)
  const ax = Math.cos(apexRad)
  const ay = Math.sin(apexRad)
  const px = -Math.sin(apexRad)   // perpendicular (left)
  const py = Math.cos(apexRad)

  const eyeR = r * 0.09
  const eyeDist = r * 0.22   // horizontal spread of eyes
  const eyeUp = r * 0.12     // shift eyes toward apex
  // Face centre: slightly toward apex from centroid
  const fCx = cx + ax * (r * 0.08)
  const fCy = cy + ay * (r * 0.08)

  const lEx = fCx - px * eyeDist + ax * eyeUp
  const lEy = fCy - py * eyeDist + ay * eyeUp
  const rEx = fCx + px * eyeDist + ax * eyeUp
  const rEy = fCy + py * eyeDist + ay * eyeUp

  // Smile arc: start left, curve toward base (−apex), end right
  const smileW = r * 0.22
  const smileDown = r * 0.15  // how far below face centre
  const smCx = fCx - ax * smileDown
  const smCy = fCy - ay * smileDown
  const smX1 = smCx - px * smileW
  const smY1 = smCy - py * smileW
  const smX2 = smCx + px * smileW
  const smY2 = smCy + py * smileW
  // Control point: further toward base for the curve
  const cpX = smCx - ax * (r * 0.15)
  const cpY = smCy - ay * (r * 0.15)

  return (
    <g>
      <circle cx={lEx} cy={lEy} r={eyeR} fill="#5A3820" />
      <circle cx={rEx} cy={rEy} r={eyeR} fill="#5A3820" />
      <path
        d={`M ${smX1.toFixed(2)},${smY1.toFixed(2)} Q ${cpX.toFixed(2)},${cpY.toFixed(2)} ${smX2.toFixed(2)},${smY2.toFixed(2)}`}
        fill="none"
        stroke="#5A3820"
        strokeWidth={r * 0.07}
        strokeLinecap="round"
      />
    </g>
  )
}

// ── exported sub-components ───────────────────────────────────────────────────

interface HexBodyProps { verts: Array<[number, number]> }
export function HexBody({ verts }: HexBodyProps) {
  const pts = verts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  return (
    <polygon
      points={pts}
      className="fill-qupu-brand-yellow"
      stroke="#C8960A"
      strokeWidth={2.5}
      strokeLinejoin="round"
    />
  )
}

interface TrianglePieceProps {
  edgeInfo: EdgeInfo
  ghost?: boolean
  showFace?: boolean
}
export function TrianglePiece({ edgeInfo, ghost = false, showFace = false }: TrianglePieceProps) {
  const { triCx, triCy, apexDeg } = edgeInfo
  const pts = triPoints(triCx, triCy, TRI_R, apexDeg)
  return (
    <g>
      <polygon
        points={pts}
        fill={ghost ? 'none' : '#F9D8C8'}
        stroke={ghost ? '#9CA3AF' : '#C87B50'}
        strokeWidth={ghost ? 1.5 : 2.5}
        strokeDasharray={ghost ? '5 3' : undefined}
        strokeLinejoin="round"
      />
      {showFace && (
        <SmileyFace cx={triCx} cy={triCy} r={TRI_R} apexDeg={apexDeg} />
      )}
    </g>
  )
}

// ── main illustration ─────────────────────────────────────────────────────────

export default function RollingHex24G2Illustration({ params: _params }: { params: unknown }) {
  // Figure is fully determined by the problem geometry — no numeric params needed.
  void _params

  const hexVerts = computeHexVerts()
  const edgeInfo = computeEdgeInfo(hexVerts)

  const W = 300
  const H = 308

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Segi enam beraturan berwarna kuning dengan segitiga sama sisi merah muda berisi wajah senyum di posisi awal (atas). Posisi 1 sampai 5 ditandai mengelilingi segi enam searah jarum jam dengan garis putus-putus dan tanda panah."
    >
      <svg viewBox={`0 0 ${W} ${H}`} width={Math.min(280, W)} style={{ display: 'block' }}>
        <defs>
          {/* arrowhead markers — one per arrow so orient="auto" works correctly */}
          {EDGE_SEQ.map((_, i) => (
            <marker
              key={`mk-${i}`}
              id={`arh-${i}`}
              markerWidth="8"
              markerHeight="7"
              refX="6"
              refY="3.5"
              orient="auto"
            >
              <path d="M0,0.5 L0,6.5 L7,3.5 Z" fill="#6B7280" />
            </marker>
          ))}
        </defs>

        {/* 1. Hexagon body */}
        <HexBody verts={hexVerts} />

        {/* 2. Ghost triangles at positions 1–5 */}
        {EDGE_SEQ.slice(1).map((eIdx) => (
          <TrianglePiece key={`ghost-${eIdx}`} edgeInfo={edgeInfo[eIdx]} ghost />
        ))}

        {/* 3. Starting triangle (solid + smiley) */}
        <TrianglePiece edgeInfo={edgeInfo[EDGE_SEQ[0]]} showFace />

        {/* 4. Curved arrows between consecutive positions (clockwise) */}
        {EDGE_SEQ.map((eIdx, i) => {
          const nextEIdx = EDGE_SEQ[(i + 1) % EDGE_SEQ.length]
          const { midX: fx, midY: fy } = edgeInfo[eIdx]
          const { midX: tx, midY: ty } = edgeInfo[nextEIdx]
          // Control point: outward from midpoint of the two edge midpoints
          const midX = (fx + tx) / 2
          const midY = (fy + ty) / 2
          const dx = midX - HEX_CX
          const dy = midY - HEX_CY
          const len = Math.sqrt(dx * dx + dy * dy)
          const bulge = 0.55
          const cpX = midX + (dx / len) * len * bulge
          const cpY = midY + (dy / len) * len * bulge
          // Trim endpoints toward control point so arrows don't overlap triangle bodies
          const trim = 0.26
          const startX = fx + (cpX - fx) * trim
          const startY = fy + (cpY - fy) * trim
          const endX = tx + (cpX - tx) * trim
          const endY = ty + (cpY - ty) * trim
          return (
            <path
              key={`arrow-${i}`}
              d={`M ${startX.toFixed(1)},${startY.toFixed(1)} Q ${cpX.toFixed(1)},${cpY.toFixed(1)} ${endX.toFixed(1)},${endY.toFixed(1)}`}
              fill="none"
              stroke="#6B7280"
              strokeWidth={1.8}
              markerEnd={`url(#arh-${i})`}
            />
          )
        })}

        {/* 5. Position labels 1–5 */}
        {EDGE_SEQ.slice(1).map((eIdx, i) => {
          const { triCx, triCy, apexDeg } = edgeInfo[eIdx]
          // Place label beyond the apex of the ghost triangle
          const apexRad = (apexDeg * Math.PI) / 180
          const lx = triCx + Math.cos(apexRad) * (TRI_R + 13)
          const ly = triCy + Math.sin(apexRad) * (TRI_R + 13)
          return (
            <text
              key={`lbl-${eIdx}`}
              x={lx.toFixed(1)}
              y={ly.toFixed(1)}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={15}
              fontWeight={700}
              className="fill-qupu-brand-blue"
            >
              {POS_LABELS[i + 1]}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
