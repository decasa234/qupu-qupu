/**
 * PlankBundleOSN20KQ1Illustration — OSN-20-SD-KAB-Q1
 *
 * 9 balok kayu (penampang 20cm × 10cm, panjang 150cm) disusun 3×3, diikat 2 kawat.
 * Source: docs/reference/ocr-res/osn/kabupaten/sd/2020.imgs/001.jpg
 *
 * Primitive check: IsoCubes/GridBoard do not cover a lumber-bundle with wire bindings.
 * Fresh oblique SVG; shared PlankBundleScene imported by the explainer.
 *
 * Quantities (from breakdown):
 *   Bundle width  = 3×20 = 60 cm
 *   Bundle height = 3×10 = 30 cm
 *   Perimeter     = 2×(60+30) = 180 cm
 *   Per band      = 180+5 = 185 cm
 *   2 bands → total = 370 cm
 */

import React from 'react'

// ─── Oblique-projection constants ──────────────────────────────────────────────
// Cross-section (right/near face): 60 cm × 30 cm at 1.5 px/cm → 90 × 45 px
// Length direction (upper-left oblique): 150 cm → (−145, −52) px
const FX = 185, FY = 42
const FW = 90,  FH = 45
const DX = -145, DY = -52
const PW = FW / 3  // 30 px per plank width (20 cm)
const PH = FH / 3  // 15 px per plank height (10 cm)

// Near cross-section corners
const D  = { x: FX,      y: FY      }  // top-left
const C  = { x: FX + FW, y: FY      }  // top-right
const B  = { x: FX + FW, y: FY + FH }  // bottom-right
const A  = { x: FX,      y: FY + FH }  // bottom-left

// Far-end corners (near + oblique offset)
const D2 = { x: D.x + DX, y: D.y + DY }  // (40, -10)
const C2 = { x: C.x + DX, y: C.y + DY }  // (130, -10)
const B2 = { x: B.x + DX, y: B.y + DY }  // (130,  35)
const A2 = { x: A.x + DX, y: A.y + DY }  // (40,   35)

/** Linear interpolation between two SVG points at fraction t (0=near, 1=far). */
function lerp(p: {x:number;y:number}, q: {x:number;y:number}, t: number) {
  return { x: p.x + t * (q.x - p.x), y: p.y + t * (q.y - p.y) }
}

function pstr(pts: {x:number;y:number}[]): string {
  return pts.map(p => `${p.x},${p.y}`).join(' ')
}

// Wire band positions: 1/3 and 2/3 along the 150 cm length
const BANDS = [1/3, 2/3]

// ─── Shared scene (imported by explainer) ──────────────────────────────────────
export interface PlankBundleSceneProps {
  /** Highlight the near cross-section face (amber) */
  highlightSection?: boolean
  /** Emphasise the two wire bands */
  highlightBands?: boolean
}

export function PlankBundleScene({
  highlightSection = false,
  highlightBands   = false,
}: PlankBundleSceneProps) {
  const csColor  = highlightSection ? '#FCD34D' : '#F1F5F9'
  const csBorder = highlightSection ? '#B45309' : '#475569'
  const wireClr  = highlightBands   ? '#1D4ED8' : '#3B82F6'
  const wireW    = highlightBands   ? 3.5 : 2.5

  return (
    <svg
      viewBox="22 -30 268 148"
      width="100%"
      style={{ display: 'block', maxWidth: 360, margin: '0 auto' }}
      aria-hidden="true"
    >
      <defs>
        <marker id="osn20kq1-a" markerWidth={5} markerHeight={5}
          refX={4} refY={2.5} orient="auto">
          <polygon points="0,0 5,2.5 0,5" fill="#334155" />
        </marker>
        <marker id="osn20kq1-b" markerWidth={5} markerHeight={5}
          refX={1} refY={2.5} orient="auto-start-reverse">
          <polygon points="0,0 5,2.5 0,5" fill="#334155" />
        </marker>
      </defs>

      {/* ── Top face (parallelogram D-C-C2-D2) ── */}
      <polygon
        points={pstr([D, C, C2, D2])}
        fill="#DDE6F0"
        stroke="#475569"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      {/* Plank column lines projected onto top */}
      {[1, 2].map(i => {
        const near = { x: D.x + i * PW, y: D.y }
        const far  = { x: D2.x + i * PW, y: D2.y }
        return (
          <line key={`tv${i}`}
            x1={near.x} y1={near.y} x2={far.x} y2={far.y}
            stroke="#94A3B8" strokeWidth={0.9}
          />
        )
      })}

      {/* ── Left face (parallelogram A-D-D2-A2) ── */}
      <polygon
        points={pstr([A, D, D2, A2])}
        fill="#C9D8E8"
        stroke="#475569"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      {/* Plank row lines projected onto left face */}
      {[1, 2].map(i => (
        <line key={`lh${i}`}
          x1={A.x}  y1={A.y  - i * PH}
          x2={A2.x} y2={A2.y - i * PH}
          stroke="#94A3B8" strokeWidth={0.9}
        />
      ))}

      {/* ── Near cross-section (right end) ── */}
      <rect
        x={FX} y={FY} width={FW} height={FH}
        fill={csColor}
        stroke={csBorder}
        strokeWidth={1.8}
      />
      {[1, 2].map(i => (
        <line key={`cv${i}`}
          x1={FX + i * PW} y1={FY}
          x2={FX + i * PW} y2={FY + FH}
          stroke={csBorder} strokeWidth={1.2}
        />
      ))}
      {[1, 2].map(i => (
        <line key={`ch${i}`}
          x1={FX}      y1={FY + i * PH}
          x2={FX + FW} y2={FY + i * PH}
          stroke={csBorder} strokeWidth={1.2}
        />
      ))}

      {/* ── Wire bands ── */}
      {BANDS.map((t, idx) => {
        const wA = lerp(A, A2, t)
        const wD = lerp(D, D2, t)
        const wC = lerp(C, C2, t)
        const wB = lerp(B, B2, t)
        return (
          <g key={`w${idx}`}>
            {/* top segment (across width on top face) */}
            <line x1={wD.x} y1={wD.y} x2={wC.x} y2={wC.y}
              stroke={wireClr} strokeWidth={wireW} strokeLinecap="round" />
            {/* left-face segment (down height on left face) */}
            <line x1={wA.x} y1={wA.y} x2={wD.x} y2={wD.y}
              stroke={wireClr} strokeWidth={wireW} strokeLinecap="round" />
            {/* right-side segment on the cross-section side */}
            <line x1={wC.x} y1={wC.y} x2={wB.x} y2={wB.y}
              stroke={wireClr} strokeWidth={wireW} strokeLinecap="round" />
          </g>
        )
      })}

      {/* ── "150 cm" dimension arrow along top-left edge ── */}
      <line
        x1={D2.x + 3} y1={D2.y - 10}
        x2={D.x  - 3} y2={D.y  - 10}
        stroke="#334155" strokeWidth={1.3}
        markerStart="url(#osn20kq1-b)"
        markerEnd="url(#osn20kq1-a)"
      />
      <text
        x={(D.x + D2.x) / 2}
        y={(D.y + D2.y) / 2 - 16}
        textAnchor="middle"
        fontSize={11}
        fontWeight="700"
        fill="#1E293B"
        fontFamily="system-ui,sans-serif"
      >150 cm</text>

      {/* ── Width labels "20" (per column) on cross-section bottom ── */}
      {[0, 1, 2].map(i => (
        <text key={`wl${i}`}
          x={FX + i * PW + PW / 2}
          y={FY + FH + 13}
          textAnchor="middle"
          fontSize={9}
          fontWeight="600"
          fill="#475569"
          fontFamily="system-ui,sans-serif"
        >20</text>
      ))}

      {/* ── Height labels "10" (per row) on cross-section left ── */}
      {[0, 1, 2].map(i => (
        <text key={`hl${i}`}
          x={FX - 5}
          y={FY + i * PH + PH / 2 + 4}
          textAnchor="end"
          fontSize={9}
          fontWeight="600"
          fill="#475569"
          fontFamily="system-ui,sans-serif"
        >10</text>
      ))}

      {/* ── "Kawat pengikat" label ── */}
      <text
        x={112}
        y={104}
        textAnchor="middle"
        fontSize={9}
        fontWeight="600"
        fill="#1D4ED8"
        fontFamily="system-ui,sans-serif"
      >kawat pengikat</text>
    </svg>
  )
}

// ─── Default export: stem illustration ─────────────────────────────────────────
export default function PlankBundleOSN20KQ1Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        '9 balok kayu disusun 3×3 (lebar 60 cm, tinggi 30 cm, panjang 150 cm) ' +
        'diikat dengan 2 kawat pengikat.'
      }
    >
      <PlankBundleScene />
    </div>
  )
}
