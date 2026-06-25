// SEAMO-X 2022 Paper B Q11
// Find area of △DEF, where D, E, F are formed by three cevians in △ABC
// that divide each opposite side in ratio 2:1 (rotating). Inner triangle
// has area = (1/7) × △ABC by Routh's theorem.
// Shows only the PROBLEM — does not reveal the answer (3 cm²).
//
// Exported constants let the explainer reuse the same coordinate frame.

export const SVG_W = 300
export const SVG_H = 260

// Outer triangle vertices
export const A = { x: 150, y: 28 } as const
export const B = { x: 18,  y: 240 } as const
export const C = { x: 282, y: 240 } as const

// Feet of cevians (each at 2/3 from the "next" vertex around the triangle,
// giving Routh ratio 2:1 which yields inner-triangle area = 1/7 of outer)
export const P1 = { x: 194, y: 240 } as const  // foot on BC, cevian from A
export const P2 = { x: 194, y: 99  } as const  // foot on CA, cevian from B
export const P3 = { x: 62,  y: 169 } as const  // foot on AB, cevian from C

// Inner triangle DEF — pairwise intersections of the three cevians
export const D = { x: 169, y: 119 } as const   // A-cevian ∩ B-cevian  (upper)
export const E = { x: 93,  y: 179 } as const   // B-cevian ∩ C-cevian  (left)
export const F = { x: 188, y: 210 } as const   // A-cevian ∩ C-cevian  (lower-right)

export const COLOR = {
  OUTER:        '#1F2937',
  CEVIAN:       '#9CA3AF',
  CEVIAN_HI:    '#F59E0B',
  INNER_FILL:   '#D1D5DB',
  INNER_FILL_HI:'#6EE7B7',
  INNER_STROKE: '#4B5563',
  LABEL:        '#1F2937',
  BLUE:         '#30598A',
} as const

/** Outer triangle ABC outline (reusable in explainer). */
export function OuterTriangle() {
  return (
    <polygon
      points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
      fill="none"
      stroke={COLOR.OUTER}
      strokeWidth={2}
    />
  )
}

/** Three cevians (A→P1, B→P2, C→P3). */
export function Cevians({ color = COLOR.CEVIAN }: { color?: string }) {
  return (
    <g stroke={color} strokeWidth={1} fill="none">
      <line x1={A.x} y1={A.y} x2={P1.x} y2={P1.y} />
      <line x1={B.x} y1={B.y} x2={P2.x} y2={P2.y} />
      <line x1={C.x} y1={C.y} x2={P3.x} y2={P3.y} />
    </g>
  )
}

/** Inner triangle DEF with configurable fill. */
export function InnerTriangleDEF({ fill = COLOR.INNER_FILL }: { fill?: string }) {
  return (
    <polygon
      points={`${D.x},${D.y} ${E.x},${E.y} ${F.x},${F.y}`}
      fill={fill}
      stroke={COLOR.INNER_STROKE}
      strokeWidth={1.5}
    />
  )
}

/** Vertex labels for A, B, C. */
export function OuterLabels() {
  return (
    <g fontSize={13} fontWeight={800} fill={COLOR.LABEL}
       fontFamily="ui-sans-serif,system-ui,sans-serif">
      <text x={A.x} y={A.y - 8} textAnchor="middle">A</text>
      <text x={B.x - 6} y={B.y + 13} textAnchor="end">B</text>
      <text x={C.x + 6} y={C.y + 13} textAnchor="start">C</text>
    </g>
  )
}

/** Labels D, E, F for the inner triangle vertices. */
export function InnerLabels() {
  return (
    <g fontSize={12} fontWeight={700} fill={COLOR.INNER_STROKE}
       fontFamily="ui-sans-serif,system-ui,sans-serif">
      <text x={D.x + 7} y={D.y - 5} textAnchor="start" dominantBaseline="auto">D</text>
      <text x={E.x - 7} y={E.y - 5} textAnchor="end"   dominantBaseline="auto">E</text>
      <text x={F.x + 7} y={F.y + 4} textAnchor="start" dominantBaseline="central">F</text>
    </g>
  )
}

/** Default export — static problem figure for SEAMO-X 2022 Paper B Q11. */
export default function CevianX22B11Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Segitiga ABC dengan tiga cevian membentuk segitiga dalam DEF yang diarsir. ' +
        'Luas △ABC = 21 cm². Temukan luas △DEF.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={SVG_W}
        style={{ display: 'block' }}
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />
        <Cevians />
        <InnerTriangleDEF />
        <OuterTriangle />
        <OuterLabels />
        <InnerLabels />
      </svg>
    </div>
  )
}
