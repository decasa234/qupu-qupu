// PentRoll24G3Illustration.tsx
// WMI-24F3A-Q15: regular pentagon card rolls around a regular hexagon.
// Shows: solid yellow hexagon + solid pink starting pentagon (with smiley face)
//        + 4 dashed ghost outlines at positions 1–4 + curved arrows + labels.
// The figure NEVER reveals the answer (which orientation at position 3).
// Pure render — no Math.random, no Date, no hooks. SSR-safe.

import React from 'react'

// ── geometry helpers ─────────────────────────────────────────────────────────

/** Vertices for a regular n-gon centred at (cx,cy), circumradius r,
 *  first vertex at angle0Deg° (SVG convention: +y down). */
function polyVerts(cx: number, cy: number, r: number, n: number, angle0Deg: number): Array<[number, number]> {
  return Array.from({ length: n }, (_, i) => {
    const a = ((angle0Deg + (i * 360) / n) * Math.PI) / 180
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number]
  })
}

function vertsToPoints(verts: Array<[number, number]>): string {
  return verts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
}

// ── scene constants ──────────────────────────────────────────────────────────

const HEX_CX = 150
const HEX_CY = 150
// Flat-top hexagon (first vertex at 0° = right).
// Vertices at 0°,60°,120°,180°,240°,300°.
// Edge midpoint angles: 30°(upper-right), 90°(right), 150°(lower-right),
//                       210°(lower-left), 270°(left), 330°(upper-left).
// From the image: start (solid pentagon) is at upper-right, then
//   pos1→right, pos2→lower-right, pos3→lower-left, pos4→left (clockwise roll).
// Edge sequence: start=0(mid 30°), pos1=1(mid 90°), pos2=2(mid 150°),
//                pos3=3(mid 210°), pos4=4(mid 270°).
//
// Size constraint: total radial reach ≈ HEX_R*(cos30°+pent_apothem_ratio+pent_R_ratio)+label
// With HEX_R=55: reach ≈ 55*2.405+14 ≈ 146, fits in 300px viewBox centred at 150.

const HEX_R = 55   // circumradius; for flat-top hex, side = HEX_R

// Pentagon with same side as hexagon (side = HEX_R).
// Pentagon circumradius Rp = s / (2 * sin(π/5))
// Pentagon apothem (inradius) ap = s / (2 * tan(π/5)) = Rp * cos(π/5)
const PENT_SIDE = HEX_R
const PENT_R = PENT_SIDE / (2 * Math.sin(Math.PI / 5))      // circumradius ≈ 61.2
const PENT_APOTHEM = PENT_SIDE / (2 * Math.tan(Math.PI / 5)) // inradius ≈ 49.5

// When the pentagon rests on an edge of the hexagon, its centroid sits
// at (hexagon edge midpoint) + PENT_APOTHEM in the outward normal direction.

// Edge sequence: start=0, pos1=1, pos2=2, pos3=3, pos4=4
const EDGE_SEQ = [0, 1, 2, 3, 4]
const POS_LABELS = ['', '1', '2', '3', '4']  // index 0 = start (no label)

// ── exported primitives (for animator / explainer) ────────────────────────────

export interface HexPentSceneData {
  hexCx: number
  hexCy: number
  hexR: number
  pentR: number
  pentApothem: number
  pentSide: number
  /** ordered [startEdge, pos1Edge, pos2Edge, pos3Edge, pos4Edge] */
  edgeSeq: number[]
  posLabels: string[]
}

export const HEX_PENT_SCENE: HexPentSceneData = {
  hexCx: HEX_CX,
  hexCy: HEX_CY,
  hexR: HEX_R,
  pentR: PENT_R,
  pentApothem: PENT_APOTHEM,
  pentSide: PENT_SIDE,
  edgeSeq: EDGE_SEQ,
  posLabels: POS_LABELS,
}

// Computed values for consumers
export const PENT_R_VAL = PENT_R
export const PENT_APOTHEM_VAL = PENT_APOTHEM

// ── hex + edge geometry ───────────────────────────────────────────────────────

function computeHexVerts(): Array<[number, number]> {
  return polyVerts(HEX_CX, HEX_CY, HEX_R, 6, 0)
}

export interface PentEdgeInfo {
  edgeIdx: number
  midX: number
  midY: number
  /** outward unit normal from hexagon centre */
  nx: number
  ny: number
  /** pentagon centroid */
  pentCx: number
  pentCy: number
  /** angle0Deg for the pentagon polygon: the bottom-edge vertex pointing "toward midpoint" */
  pent0Deg: number
  /** cumulative roll rotation from start (degrees), used by animator */
  rollDeg: number
}

function computePentEdgeInfos(hexVerts: Array<[number, number]>): PentEdgeInfo[] {
  // Pentagon rests on hex edge i with:
  //   centroid = edgeMidpoint + outwardNormal * PENT_APOTHEM
  //   apex (vertex 0 = pent0Deg) points in the outward normal direction at start,
  //   then rotates 72° CW per roll (exterior angle of a regular pentagon).
  //   In SVG (+y down) CW rotation increments angles, so:
  //     pent0Deg = normalDeg + seqPos*72°
  return EDGE_SEQ.map((eIdx, seqPos) => {
    const v0 = hexVerts[eIdx]
    const v1 = hexVerts[(eIdx + 1) % 6]
    const midX = (v0[0] + v1[0]) / 2
    const midY = (v0[1] + v1[1]) / 2
    // outward normal
    const dx = midX - HEX_CX
    const dy = midY - HEX_CY
    const len = Math.sqrt(dx * dx + dy * dy)
    const nx = dx / len
    const ny = dy / len
    // Pentagon centroid
    const pentCx = midX + nx * PENT_APOTHEM
    const pentCy = midY + ny * PENT_APOTHEM
    // Pentagon angle0: apex direction = outward normal + accumulated CW rotation
    const normalDeg = Math.atan2(ny, nx) * (180 / Math.PI)
    // Start: apex at normalDeg (0 rolls). Each roll adds 72° CW.
    const rollDeg = seqPos * 72
    const pent0Deg = normalDeg + rollDeg
    return { edgeIdx: eIdx, midX, midY, nx, ny, pentCx, pentCy, pent0Deg, rollDeg }
  })
}

// ── smiley face ───────────────────────────────────────────────────────────────

interface SmileyProps {
  cx: number
  cy: number
  r: number
  apexDeg: number  // apex (pointing outward) direction in degrees
}

function SmileyFace({ cx, cy, r, apexDeg }: SmileyProps) {
  // "Up" direction = toward apex
  const apexRad = (apexDeg * Math.PI) / 180
  const ax = Math.cos(apexRad)  // toward apex
  const ay = Math.sin(apexRad)
  // perpendicular (90° CCW from apex = "left")
  const px = -ay
  const py = ax

  const eyeR = r * 0.085
  const eyeDist = r * 0.20
  const eyeUp = r * 0.10
  // Face centre: slightly toward apex
  const fCx = cx + ax * (r * 0.06)
  const fCy = cy + ay * (r * 0.06)

  const lEx = fCx - px * eyeDist + ax * eyeUp
  const lEy = fCy - py * eyeDist + ay * eyeUp
  const rEx = fCx + px * eyeDist + ax * eyeUp
  const rEy = fCy + py * eyeDist + ay * eyeUp

  // Smile arc
  const smileW = r * 0.20
  const smileDown = r * 0.12
  const smCx = fCx - ax * smileDown
  const smCy = fCy - ay * smileDown
  const smX1 = smCx - px * smileW
  const smY1 = smCy - py * smileW
  const smX2 = smCx + px * smileW
  const smY2 = smCy + py * smileW
  const cpX = smCx - ax * (r * 0.14)
  const cpY = smCy - ay * (r * 0.14)

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
  const pts = vertsToPoints(verts)
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

interface PentagonPieceProps {
  info: PentEdgeInfo
  ghost?: boolean
  showFace?: boolean
}
export function PentagonPiece({ info, ghost = false, showFace = false }: PentagonPieceProps) {
  const { pentCx, pentCy, pent0Deg } = info
  const verts = polyVerts(pentCx, pentCy, PENT_R, 5, pent0Deg)
  const pts = vertsToPoints(verts)
  return (
    <g>
      <polygon
        points={pts}
        fill={ghost ? 'none' : '#F9D0C8'}
        stroke={ghost ? '#9CA3AF' : '#C87B50'}
        strokeWidth={ghost ? 1.5 : 2.5}
        strokeDasharray={ghost ? '5 3' : undefined}
        strokeLinejoin="round"
      />
      {showFace && (
        <SmileyFace cx={pentCx} cy={pentCy} r={PENT_R} apexDeg={pent0Deg} />
      )}
    </g>
  )
}

// ── main illustration ─────────────────────────────────────────────────────────

export default function PentRoll24G3Illustration() {
  const hexVerts = computeHexVerts()
  const pentInfos = computePentEdgeInfos(hexVerts)

  const W = 300
  const H = 300

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Segi enam beraturan berwarna kuning dengan kartu segi lima beraturan merah muda berisi wajah senyum di posisi awal (kanan atas). Posisi 1 sampai 4 ditandai mengelilingi segi enam searah jarum jam dengan garis putus-putus dan tanda panah lengkung."
    >
      <svg viewBox={`0 0 ${W} ${H}`} width={Math.min(280, W)} style={{ display: 'block' }}>
        <defs>
          {EDGE_SEQ.map((_, i) => (
            <marker
              key={`mk-${i}`}
              id={`pra-${i}`}
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

        {/* 2. Ghost pentagons at positions 1–4 */}
        {pentInfos.slice(1).map((info) => (
          <PentagonPiece key={`ghost-${info.edgeIdx}`} info={info} ghost />
        ))}

        {/* 3. Starting pentagon (solid + smiley face) */}
        <PentagonPiece info={pentInfos[0]} showFace />

        {/* 4. Curved arrows between consecutive positions */}
        {EDGE_SEQ.map((eIdx, i) => {
          const nextInfo = pentInfos[(i + 1) % pentInfos.length]
          const currInfo = pentInfos[i]
          const { midX: fx, midY: fy } = currInfo
          const { midX: tx, midY: ty } = nextInfo
          // Control point: outward from the midpoint between the two edge midpoints
          const midX = (fx + tx) / 2
          const midY = (fy + ty) / 2
          const dx = midX - HEX_CX
          const dy = midY - HEX_CY
          const len = Math.sqrt(dx * dx + dy * dy)
          const bulge = 0.60
          const cpX = midX + (dx / len) * len * bulge
          const cpY = midY + (dy / len) * len * bulge
          const trim = 0.28
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
              markerEnd={`url(#pra-${i})`}
            />
          )
        })}

        {/* 5. Position labels 1–4 */}
        {pentInfos.slice(1).map((info, i) => {
          // Place label beyond the apex of the ghost pentagon
          const apexRad = (info.pent0Deg * Math.PI) / 180
          const lx = info.pentCx + Math.cos(apexRad) * (PENT_R + 14)
          const ly = info.pentCy + Math.sin(apexRad) * (PENT_R + 14)
          return (
            <text
              key={`lbl-${info.edgeIdx}`}
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
