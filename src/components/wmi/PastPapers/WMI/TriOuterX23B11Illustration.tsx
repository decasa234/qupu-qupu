// SEAMO-X 2023 Paper B Q11
// Inner △ABC has area 10 cm². Each side of △ABC is extended by its own length
// to form outer △DEF:
//   AB extended past B to D  (AB = BD → B = midpoint of AD)
//   CA extended past A to F  (CA = AF → A = midpoint of FC)
//   BC extended past C to E  (BC = CE → C = midpoint of BE)
// Shows only the PROBLEM — does not reveal the answer (70 cm²).
//
// Exported sub-components let the explainer reuse the same coordinate frame.

export const SVG_W = 300
export const SVG_H = 260

// Outer triangle vertices
export const D = { x: 20,  y: 240 } as const   // bottom-left
export const E = { x: 280, y: 240 } as const   // bottom-right
export const F = { x: 150, y: 20  } as const   // top

// Inner triangle vertices derived from the midpoint conditions:
//   A = (D + 4F + 2E) / 7  (A = midpoint of FC)
//   B = (4D + 2F + E) / 7  (B = midpoint of DA)
//   C = (2D + F + 4E) / 7  (C = midpoint of BE)
export const A = { x: 169, y: 114 } as const
export const B = { x: 94,  y: 177 } as const
export const C = { x: 187, y: 209 } as const

// Centroid of inner triangle ABC (for labels/badges)
export const ABC_CX = Math.round((A.x + B.x + C.x) / 3)   // 150
export const ABC_CY = Math.round((A.y + B.y + C.y) / 3)   // 167

export const COLOR = {
  OUTER:         '#1F2937',
  EXT_LINE:      '#9CA3AF',
  EXT_HI:        '#F59E0B',
  INNER_FILL:    '#D1D5DB',
  INNER_FILL_HI: '#6EE7B7',
  INNER_STROKE:  '#4B5563',
  REGION_HI:     '#BFDBFE',
  LABEL_OUTER:   '#1F2937',
  LABEL_INNER:   '#374151',
  BLUE:          '#30598A',
} as const

/** Outer triangle DEF outline. */
export function OuterTriangle() {
  return (
    <polygon
      points={`${D.x},${D.y} ${E.x},${E.y} ${F.x},${F.y}`}
      fill="none"
      stroke={COLOR.OUTER}
      strokeWidth={2}
    />
  )
}

/** Three extension segments:
 *  D→A (through B as midpoint), F→C (through A as midpoint), E→B (through C as midpoint). */
export function ExtensionLines({ color = COLOR.EXT_LINE }: { color?: string }) {
  return (
    <g stroke={color} strokeWidth={1.2} fill="none">
      <line x1={D.x} y1={D.y} x2={A.x} y2={A.y} />
      <line x1={F.x} y1={F.y} x2={C.x} y2={C.y} />
      <line x1={E.x} y1={E.y} x2={B.x} y2={B.y} />
    </g>
  )
}

/** Inner triangle ABC fill + stroke. */
export function InnerTriangleABC({ fill = COLOR.INNER_FILL }: { fill?: string }) {
  return (
    <polygon
      points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
      fill={fill}
      stroke={COLOR.INNER_STROKE}
      strokeWidth={1.5}
    />
  )
}

/** One of the three outer regions highlighted:
 *  'daf' = △DAF (left),  'fce' = △FCE (right),  'dbe' = △DBE (bottom). */
export function OuterRegion({ region, opacity = 0.65 }: { region: 'daf' | 'fce' | 'dbe'; opacity?: number }) {
  const pts =
    region === 'daf' ? `${D.x},${D.y} ${A.x},${A.y} ${F.x},${F.y}` :
    region === 'fce' ? `${F.x},${F.y} ${C.x},${C.y} ${E.x},${E.y}` :
                       `${D.x},${D.y} ${B.x},${B.y} ${E.x},${E.y}`
  return (
    <polygon
      points={pts}
      fill={COLOR.REGION_HI}
      stroke="none"
      opacity={opacity}
    />
  )
}

/** Outer vertex labels D, E, F. */
export function OuterLabels() {
  return (
    <g fontSize={13} fontWeight={800} fill={COLOR.LABEL_OUTER}
       fontFamily="ui-sans-serif,system-ui,sans-serif">
      <text x={D.x - 8} y={D.y + 14} textAnchor="end">D</text>
      <text x={E.x + 8} y={E.y + 14} textAnchor="start">E</text>
      <text x={F.x}     y={F.y - 8}  textAnchor="middle">F</text>
    </g>
  )
}

/** Inner vertex labels A, B, C. */
export function InnerLabels() {
  return (
    <g fontSize={12} fontWeight={700} fill={COLOR.LABEL_INNER}
       fontFamily="ui-sans-serif,system-ui,sans-serif">
      <text x={A.x + 8} y={A.y - 3} textAnchor="start">A</text>
      <text x={B.x - 8} y={B.y - 3} textAnchor="end">B</text>
      <text x={C.x + 8} y={C.y + 4} textAnchor="start">C</text>
    </g>
  )
}

/** Default export — static problem figure for SEAMO-X 2023 Paper B Q11. */
export default function TriOuterX23B11Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Triangle DEF with inner triangle ABC. ' +
        'AB equals BD, FA equals AC, BC equals CE. ' +
        'Area of triangle ABC is 10 cm squared. Find area of triangle DEF.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={SVG_W}
        style={{ display: 'block' }}
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />
        {/* extension lines first so inner triangle renders on top */}
        <ExtensionLines />
        <InnerTriangleABC />
        <OuterTriangle />
        <OuterLabels />
        <InnerLabels />
        {/* given area label inside △ABC */}
        <text
          x={ABC_CX} y={ABC_CY}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={9}
          fontWeight={700}
          fill={COLOR.LABEL_INNER}
          fontFamily="ui-sans-serif,system-ui,sans-serif"
        >
          10 cm²
        </text>
      </svg>
    </div>
  )
}
