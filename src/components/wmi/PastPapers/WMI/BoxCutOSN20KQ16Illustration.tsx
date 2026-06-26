/**
 * BoxCutOSN20KQ16Illustration — OSN-20-SD-KAB-Q16
 *
 * Balok ABCD.EFGH: AB=25, BC=20, CG=12.
 * IJ ∥ BC (I on AB, J on DC); KL ∥ EH (L on EF, K on HG).
 * IB : EL = 1 : 3, LI = 15 cm → IB = 4 cm, EL = 12 cm.
 * Volume IBCJ.LFGK = ½(IB + LF) × CG × BC = ½(4+13)×12×20 = 2040 cm³.
 *
 * Source: docs/reference/ocr-res/osn/kabupaten/sd/2020.imgs/014.jpg
 * No matching primitive — custom oblique-projection SVG.
 */

import React from 'react'

// ─── Oblique projection: 5 px/cm, depth 3 px/cm right + 2 px/cm up ──────────
const S = 5, DX = 3, DY = -2, OX = 70, OY = 180

function proj(xCm: number, yCm: number, zCm: number) {
  return {
    x: OX + xCm * S + yCm * DX,
    y: OY - zCm * S + yCm * DY,
  }
}

// ─── Box vertices (AB=25, BC=20, CG=12) ──────────────────────────────────────
// A front-left-bottom, B front-right-bottom, C back-right-bottom, D back-left-bottom
// E above A, F above B, G above C, H above D
const A = proj(0,  0,  0), B = proj(25, 0,  0), C = proj(25, 20, 0), D = proj(0,  20, 0)
const E = proj(0,  0, 12), F = proj(25, 0, 12), G = proj(25, 20,12), H = proj(0,  20,12)

// ─── Cut points (derived: t=4 from (4t−25)²+144=225 with IB:EL=1:3) ─────────
const I = proj(21, 0,  0)   // I on AB: AI=21, IB=4
const J = proj(21, 20, 0)   // J on DC: directly behind I (IJ ∥ BC)
const L = proj(12, 0, 12)   // L on EF: EL=12, LF=13
const K = proj(12, 20,12)   // K on HG: directly behind L (KL ∥ EH)

function pts(...vs: Array<{ x: number; y: number }>) {
  return vs.map(v => `${v.x},${v.y}`).join(' ')
}

// ─── Shared scene (also used by explainer) ────────────────────────────────────
interface BoxCutSceneProps {
  showSolid?: boolean
  highlightFaces?: boolean
  showDims?: boolean
}

export function BoxCutScene({
  showSolid = true,
  highlightFaces = false,
  showDims = false,
}: BoxCutSceneProps) {
  const top   = highlightFaces ? '#FDE68A' : '#BFDBFE'
  const right = highlightFaces ? '#FCD34D' : '#93C5FD'
  const front = highlightFaces ? '#F59E0B' : '#60A5FA'
  const slant = highlightFaces ? '#D97706' : '#3B82F6'

  return (
    <svg
      viewBox="55 68 215 130"
      width="100%"
      style={{ display: 'block', maxWidth: 360, margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── IBCJ.LFGK solid faces (under wireframe) ───────────────────────── */}
      {showSolid && (
        <g>
          <polygon points={pts(L, F, G, K)} fill={top}         opacity={0.75} />
          <polygon points={pts(B, C, G, F)} fill={right}       opacity={0.75} />
          <polygon points={pts(I, B, F, L)} fill={front}       opacity={0.80} />
          <polygon points={pts(I, J, K, L)} fill={slant}       opacity={0.50} />
        </g>
      )}

      {/* ── Box wireframe — visible (solid) edges ─────────────────────────── */}
      {([
        [A, I], [I, B], [B, C],       // bottom front + right depth
        [A, E], [B, F], [C, G],       // verticals
        [E, L], [L, F], [F, G],       // top front + right depth
        [H, E], [H, K], [K, G],       // top-left depth + top-back
        [I, J],                       // bottom cut (IJ on visible floor)
      ] as const).map(([p1, p2], i) => (
        <line key={i}
          x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke="#1F2937" strokeWidth={1.5} strokeLinecap="round"
        />
      ))}

      {/* ── Hidden edges (dashed) ─────────────────────────────────────────── */}
      {([
        [A, D], [D, C], [D, H],   // three standard hidden box edges
      ] as const).map(([p1, p2], i) => (
        <line key={i}
          x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke="#94A3B8" strokeWidth={1.2} strokeDasharray="4,3" strokeLinecap="round"
        />
      ))}

      {/* ── Cut plane edges ───────────────────────────────────────────────── */}
      {/* Visible cut: I–L (front slant) and L–K (top) */}
      {([
        [I, L], [L, K],
      ] as const).map(([p1, p2], i) => (
        <line key={i}
          x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke="#1D4ED8" strokeWidth={2} strokeLinecap="round"
        />
      ))}
      {/* Hidden cut: J–K (back slant, behind box) */}
      <line
        x1={J.x} y1={J.y} x2={K.x} y2={K.y}
        stroke="#1D4ED8" strokeWidth={1.5} strokeDasharray="4,3" strokeLinecap="round"
      />

      {/* ── Dimension labels ──────────────────────────────────────────────── */}
      {showDims && (
        <g fontFamily="sans-serif" fontSize={8} fill="#374151">
          {/* AB = 25 along bottom front */}
          <text x={(A.x + B.x) / 2} y={A.y + 12} textAnchor="middle">25 cm</text>
          {/* BC = 20 depth right side */}
          <text x={(B.x + C.x) / 2 + 4} y={(B.y + C.y) / 2 + 3}>20 cm</text>
          {/* CG = 12 height right-back vertical */}
          <text x={C.x + 4} y={(C.y + G.y) / 2}>12 cm</text>
          {/* IB = 4 */}
          <text x={(I.x + B.x) / 2} y={I.y + 11} textAnchor="middle"
            fill="#1D4ED8" fontWeight="bold">4</text>
          {/* EL = 12 */}
          <text x={(E.x + L.x) / 2} y={E.y - 4} textAnchor="middle"
            fill="#1D4ED8" fontWeight="bold">12</text>
          {/* LI = 15 slant */}
          <text x={(L.x + I.x) / 2 - 10} y={(L.y + I.y) / 2}
            fill="#1D4ED8" fontWeight="bold">15</text>
        </g>
      )}

      {/* ── Point labels ──────────────────────────────────────────────────── */}
      <g fontFamily="sans-serif" fontWeight="bold" fontSize={9.5}>
        <text x={A.x - 8}  y={A.y + 4}  fill="#1F2937">A</text>
        <text x={B.x + 3}  y={B.y + 4}  fill="#1F2937">B</text>
        <text x={C.x + 3}  y={C.y + 4}  fill="#1F2937">C</text>
        <text x={D.x - 10} y={D.y + 4}  fill="#94A3B8">D</text>
        <text x={E.x - 9}  y={E.y + 4}  fill="#1F2937">E</text>
        <text x={F.x + 3}  y={F.y + 4}  fill="#1F2937">F</text>
        <text x={G.x + 3}  y={G.y}       fill="#1F2937">G</text>
        <text x={H.x - 9}  y={H.y}       fill="#1F2937">H</text>
        <text x={I.x - 1}  y={I.y + 12} fill="#1D4ED8">I</text>
        <text x={J.x + 3}  y={J.y + 9}  fill="#1D4ED8">J</text>
        <text x={K.x - 1}  y={K.y - 4}  fill="#1D4ED8">K</text>
        <text x={L.x - 10} y={L.y - 2}  fill="#1D4ED8">L</text>
      </g>

      {/* ── Cut-point dots ────────────────────────────────────────────────── */}
      {[I, J, L, K].map((v, i) => (
        <circle key={i} cx={v.x} cy={v.y} r={2.5} fill="#1D4ED8" />
      ))}
    </svg>
  )
}

// ─── Default export: stem illustration ───────────────────────────────────────
export default function BoxCutOSN20KQ16Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Balok ABCD.EFGH dengan AB=25 cm, BC=20 cm, CG=12 cm. ' +
        'Titik I pada AB (IB=4 cm), L pada EF (EL=12 cm), J dan K di rusuk belakang. ' +
        'Padatan IBCJ.LFGK yang diarsir biru adalah benda yang volumenya dicari.'
      }
    >
      <BoxCutScene showSolid showDims />
    </div>
  )
}
