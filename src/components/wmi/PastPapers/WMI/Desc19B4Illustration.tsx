// SEAMO-19-B-Q4 — Square ABCD with inscribed rectangle EFGH.
//
// Problem: ABCD is a square, EFGH is a rectangle inside it.
//   FB = 2·AF, BG = 2·GC, DH = 2·HC, DE = 2·AE.
//   FB = 4 cm → AF = 2 cm → side = 6 cm.
// Coordinates (A top-left, anticlockwise outer):
//   A=(0,6), B=(6,6), C=(6,0), D=(0,0)  (cm)
//   E=(0,4), F=(2,6), G=(6,2), H=(4,0)
// Area of EFGH by shoelace = 16 cm².  Answer D.
//
// This file exports ONE default component (the static problem illustration).
// No VISUALS embedding — the registry entry is returned as text in the build report.

// ── colour palette ─────────────────────────────────────────────────────────────
const C_SQUARE_FILL   = '#E0F2FE' // light sky  — outer square
const C_SQUARE_STROKE = '#0369A1' // blue-700
const C_RECT_FILL     = '#4B5563' // dark slate — tilted rectangle (matches the figure)
const C_RECT_STROKE   = '#1F2937'
const C_OVERLAP_FILL  = '#0EA5E9' // overlap region hint (teal-ish)
const C_INK           = '#1F2937'

// ── geometry (SVG pixel space) ─────────────────────────────────────────────────
// Scale: 1 cm → 50 px.  Square side = 6 cm → 300 px.
const SCALE = 50

// Outer square corners (A top-left, B top-right, C bottom-right, D bottom-left)
// SVG y-axis points DOWN, so we flip: row = 6 - y_cm
const pad = 40 // padding for labels

function toSvg(xCm: number, yCm: number): [number, number] {
  return [pad + xCm * SCALE, pad + (6 - yCm) * SCALE]
}

const [Ax, Ay] = toSvg(0, 6)
const [Bx, By] = toSvg(6, 6)
const [Cx, Cy] = toSvg(6, 0)
const [Dx, Dy] = toSvg(0, 0)

const [Ex, Ey] = toSvg(0, 4) // on AD
const [Fx, Fy] = toSvg(2, 6) // on AB
const [Gx, Gy] = toSvg(6, 2) // on BC
const [Hx, Hy] = toSvg(4, 0) // on DC

const SVG_W = 2 * pad + 6 * SCALE
const SVG_H = 2 * pad + 6 * SCALE

// ── helper components ──────────────────────────────────────────────────────────

function Label({
  x,
  y,
  text,
  dx = 0,
  dy = 0,
  anchor = 'middle',
}: {
  x: number
  y: number
  text: string
  dx?: number
  dy?: number
  anchor?: 'start' | 'middle' | 'end'
}) {
  return (
    <text
      x={x + dx}
      y={y + dy}
      textAnchor={anchor}
      dominantBaseline="central"
      fontSize={14}
      fontWeight={700}
      fontFamily="serif"
      fill={C_INK}
    >
      {text}
    </text>
  )
}

// ── main figure ────────────────────────────────────────────────────────────────

export function Desc19B4Figure() {
  const squarePts = `${Ax},${Ay} ${Bx},${By} ${Cx},${Cy} ${Dx},${Dy}`
  const rectPts   = `${Ex},${Ey} ${Fx},${Fy} ${Gx},${Gy} ${Hx},${Hy}`

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={Math.min(280, SVG_W)}
      style={{ display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Outer square ABCD (teal/light fill) */}
      <polygon
        points={squarePts}
        fill={C_SQUARE_FILL}
        stroke={C_SQUARE_STROKE}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* Tilted rectangle EFGH (dark fill, semi-transparent so square shows through) */}
      <polygon
        points={rectPts}
        fill={C_RECT_FILL}
        fillOpacity={0.82}
        stroke={C_RECT_STROKE}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />

      {/* ── corner vertex labels ─────────────────────────────────────── */}
      {/* Square corners */}
      <Label x={Ax} y={Ay} text="A" dx={-14} dy={-4} anchor="end" />
      <Label x={Bx} y={By} text="B" dx={14}  dy={-4} anchor="start" />
      <Label x={Cx} y={Cy} text="C" dx={14}  dy={4}  anchor="start" />
      <Label x={Dx} y={Dy} text="D" dx={-14} dy={4}  anchor="end" />

      {/* Rectangle corners */}
      <Label x={Ex} y={Ey} text="E" dx={-14} dy={0}  anchor="end" />
      <Label x={Fx} y={Fy} text="F" dx={0}   dy={-14} anchor="middle" />
      <Label x={Gx} y={Gy} text="G" dx={14}  dy={0}  anchor="start" />
      <Label x={Hx} y={Hy} text="H" dx={0}   dy={14} anchor="middle" />

      {/* ── segment ticks on AB to show AF=2, FB=4 ──────────────────── */}
      {/* F is at x=2 on AB (top edge).  Mark AF and FB. */}
      {/* midpoint of AF (top edge from A to F) */}
      <text
        x={(Ax + Fx) / 2}
        y={Ay - 12}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize={11}
        fill={C_SQUARE_STROKE}
        fontWeight={600}
      >
        2
      </text>
      {/* midpoint of FB */}
      <text
        x={(Fx + Bx) / 2}
        y={By - 12}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize={11}
        fill={C_SQUARE_STROKE}
        fontWeight={600}
      >
        4
      </text>
    </svg>
  )
}

// ── default export (illustration wrapper) ─────────────────────────────────────

export default function Desc19B4Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Persegi ABCD dengan persegi panjang EFGH di dalamnya. ' +
        'E pada sisi AD, F pada sisi AB, G pada sisi BC, H pada sisi DC. ' +
        'FB = 4 cm (2 × AF), BG = 2 × GC, DH = 2 × HC, DE = 2 × AE. ' +
        'Cari luas EFGH.'
      }
    >
      <Desc19B4Figure />
    </div>
  )
}
