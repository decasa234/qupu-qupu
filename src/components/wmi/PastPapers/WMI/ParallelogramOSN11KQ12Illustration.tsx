// OSN-11-SD-KAB-Q12 — Parallelogram ABCD with AB = 3 cm, AD = 5 cm.
// The altitude from D drops perpendicularly onto AB at B (right-angle mark at B).
// Diagonal AC = 2√13 cm is the unknown shown as a question.
//
// Exported layout constants are reused by ParallelogramOSN11KQ12Explainer.

import React from 'react'

// ── layout constants (exported for the explainer) ────────────────────────────
export const SVG_W = 360
export const SVG_H = 280

// Scale: 40 px per cm → 3-4-5 right triangle in px: AB=120, DB=160, AD=200.
export const A = { x: 60, y: 220 }
export const B = { x: 180, y: 220 }
export const D = { x: 180, y: 60 }
export const C = { x: 300, y: 60 }

export const COLOR = {
  fill: '#EFF6FF',
  stroke: '#2563EB',
  altitude: '#6B7280',
  label: '#1F2937',
  diagonal: '#DC2626',
  triangle: '#FEF3C7',
  triangleStroke: '#D97706',
}

// ── right-angle mark helper ───────────────────────────────────────────────────
export function RightAngleMark({ cx, cy, size = 12, color = '#6B7280' }: {
  cx: number; cy: number; size?: number; color?: string
}) {
  // At point B: legs go left (along BA) and up (along BD).
  return (
    <path
      d={`M ${cx - size},${cy} L ${cx - size},${cy - size} L ${cx},${cy - size}`}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinejoin="miter"
    />
  )
}

// ── default export: illustration ─────────────────────────────────────────────

const ParallelogramOSN11KQ12Illustration: React.FC = () => {
  const pts = `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y}`
  const midAD = { x: (A.x + D.x) / 2, y: (A.y + D.y) / 2 }
  const midAC = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 }

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block' }}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Jajar genjang ABCD dengan AB = 3 cm, AD = 5 cm, garis tinggi DB tegak lurus"
    >
      {/* Parallelogram */}
      <polygon points={pts} fill={COLOR.fill} stroke={COLOR.stroke} strokeWidth={2.5} />

      {/* Diagonal AC — the unknown */}
      <line
        x1={A.x} y1={A.y} x2={C.x} y2={C.y}
        stroke={COLOR.diagonal} strokeWidth={2} strokeDasharray="7,4"
      />

      {/* Altitude DB */}
      <line
        x1={D.x} y1={D.y} x2={B.x} y2={B.y}
        stroke={COLOR.altitude} strokeWidth={1.5} strokeDasharray="5,3"
      />

      {/* Right-angle mark at B */}
      <RightAngleMark cx={B.x} cy={B.y} />

      {/* Vertex labels */}
      <text x={A.x - 20} y={A.y + 6} fontSize={16} fontWeight="bold" fill={COLOR.label}
        fontFamily="ui-sans-serif,system-ui,sans-serif">A</text>
      <text x={B.x + 6} y={B.y + 20} fontSize={16} fontWeight="bold" fill={COLOR.label}
        fontFamily="ui-sans-serif,system-ui,sans-serif">B</text>
      <text x={C.x + 6} y={C.y + 6} fontSize={16} fontWeight="bold" fill={COLOR.label}
        fontFamily="ui-sans-serif,system-ui,sans-serif">C</text>
      <text x={D.x - 22} y={D.y - 8} fontSize={16} fontWeight="bold" fill={COLOR.label}
        fontFamily="ui-sans-serif,system-ui,sans-serif">D</text>

      {/* AB = 3 cm */}
      <text x={(A.x + B.x) / 2} y={A.y + 24} fontSize={13} fill={COLOR.label}
        textAnchor="middle" fontFamily="ui-sans-serif,system-ui,sans-serif">3 cm</text>

      {/* AD = 5 cm (alongside slant; offset left-perpendicular) */}
      <text
        x={midAD.x - 28} y={midAD.y + 4}
        fontSize={13} fill={COLOR.label}
        textAnchor="middle" fontFamily="ui-sans-serif,system-ui,sans-serif"
      >5 cm</text>

      {/* AC = ? label */}
      <text
        x={midAC.x + 8} y={midAC.y - 14}
        fontSize={13} fontWeight="600" fill={COLOR.diagonal}
        textAnchor="middle" fontFamily="ui-sans-serif,system-ui,sans-serif"
      >AC = ?</text>
    </svg>
  )
}

export default ParallelogramOSN11KQ12Illustration
