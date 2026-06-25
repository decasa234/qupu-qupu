// RectTrianglesX24B13Illustration — SEAMOX-24-B-Q13
//
// Rectangle ABCD with:
//   E on DC (bottom side): DE:EC = 4:5
//   F on AD (left side): AF:FD = 7:5
// Triangles △BEC (blue, given area 60 cm²) and △AFB (amber, unknown) drawn.
// Lines from B to E and B to F as in the original figure.
//
// Exported: RectTrianglesFigure (named, SSR-safe, used by explainer)
//           default: RectTrianglesX24B13Illustration
//
// Pure SVG — no hooks, no framer-motion — SSR-safe.

const INK = '#1F2937'
const RECT_STROKE = '#374151'
const BEC_FILL = '#BFDBFE'   // light blue — △BEC
const AFB_FILL = '#FDE68A'   // light amber — △AFB
const BEC_INK = '#1D4ED8'
const AFB_INK = '#B45309'

// ── Rectangle geometry (integers for clean ratios) ──────────────────────────
// Width 252 = 9 × 28, Height 180 = 12 × 15 → DE=112, EC=140, AF=105, FD=75
const RX = 55   // rect left edge x
const RY = 30   // rect top edge y
const RW = 252  // rect width
const RH = 180  // rect height

// Vertices
const AX = RX,        AY = RY            // A top-left
const BX = RX + RW,   BY = RY            // B top-right
const CX = RX + RW,   CY = RY + RH      // C bottom-right
const DX = RX,        DY = RY + RH      // D bottom-left

// E on DC: DE:EC = 4:5  →  Ex = DX + (4/9)×RW
const EX = RX + (RW * 4) / 9   // ≈ 167
const EY = RY + RH              // on bottom edge

// F on AD: AF:FD = 7:5  →  Fy = AY + (7/12)×RH
const FX = RX                   // on left edge
const FY = RY + (RH * 7) / 12  // ≈ 135

const SVG_W = 380
const SVG_H = 275

// ── Sub-components ────────────────────────────────────────────────────────────

function VertexLabel({ x, y, label, dx = 0, dy = 0 }: {
  x: number; y: number; label: string; dx?: number; dy?: number
}) {
  return (
    <text
      x={x + dx}
      y={y + dy}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13}
      fontWeight={700}
      fill={INK}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      {label}
    </text>
  )
}

// ── Main exportable figure primitive ─────────────────────────────────────────

/**
 * Core geometry figure — reused by the explainer.
 * @param highlightBEC   fill △BEC in blue (default true)
 * @param highlightAFB   fill △AFB in amber (default true)
 * @param afbArea        when set, show this value cm² in △AFB instead of "?"
 */
export function RectTrianglesFigure({
  highlightBEC = true,
  highlightAFB = true,
  afbArea,
}: {
  highlightBEC?: boolean
  highlightAFB?: boolean
  afbArea?: number
}) {
  const becCentroidX = (BX + EX + CX) / 3
  const becCentroidY = (BY + EY + CY) / 3
  const afbCentroidX = (AX + FX + BX) / 3
  const afbCentroidY = (AY + FY + BY) / 3

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={Math.min(320, SVG_W)}
      style={{ display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── Triangle fills ── */}
      {highlightAFB && (
        <polygon
          points={`${AX},${AY} ${FX},${FY} ${BX},${BY}`}
          fill={AFB_FILL}
          stroke="none"
        />
      )}
      {highlightBEC && (
        <polygon
          points={`${BX},${BY} ${EX},${EY} ${CX},${CY}`}
          fill={BEC_FILL}
          stroke="none"
        />
      )}

      {/* ── Rectangle outline ── */}
      <rect
        x={RX}
        y={RY}
        width={RW}
        height={RH}
        fill="none"
        stroke={RECT_STROKE}
        strokeWidth={2}
      />

      {/* ── Interior lines: B→E and B→F ── */}
      <line x1={BX} y1={BY} x2={EX} y2={EY} stroke={INK} strokeWidth={1.5} />
      <line x1={BX} y1={BY} x2={FX} y2={FY} stroke={INK} strokeWidth={1.5} />

      {/* ── Triangle borders ── */}
      {highlightBEC && (
        <polygon
          points={`${BX},${BY} ${EX},${EY} ${CX},${CY}`}
          fill="none"
          stroke={BEC_INK}
          strokeWidth={1.8}
        />
      )}
      {highlightAFB && (
        <polygon
          points={`${AX},${AY} ${FX},${FY} ${BX},${BY}`}
          fill="none"
          stroke={AFB_INK}
          strokeWidth={1.8}
        />
      )}

      {/* ── Vertex labels ── */}
      <VertexLabel x={AX} y={AY} label="A" dx={-13} dy={-10} />
      <VertexLabel x={BX} y={BY} label="B" dx={13}  dy={-10} />
      <VertexLabel x={CX} y={CY} label="C" dx={13}  dy={12}  />
      <VertexLabel x={DX} y={DY} label="D" dx={-13} dy={12}  />
      <VertexLabel x={EX} y={EY} label="E" dx={0}   dy={17}  />
      <VertexLabel x={FX} y={FY} label="F" dx={-15} dy={0}   />

      {/* ── Ratio marks — bottom side: 4 | E | 5 ── */}
      <line
        x1={EX} y1={EY + 3} x2={EX} y2={EY + 9}
        stroke="#6B7280" strokeWidth={1.5}
      />
      <text
        x={(DX + EX) / 2} y={DY + 28}
        textAnchor="middle" fontSize={11} fill="#6B7280"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >4</text>
      <text
        x={(EX + CX) / 2} y={CY + 28}
        textAnchor="middle" fontSize={11} fill="#6B7280"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >5</text>

      {/* ── Ratio marks — left side: 7 | F | 5 ── */}
      <line
        x1={FX - 3} y1={FY} x2={FX - 9} y2={FY}
        stroke="#6B7280" strokeWidth={1.5}
      />
      <text
        x={AX - 28} y={(AY + FY) / 2}
        textAnchor="middle" dominantBaseline="central" fontSize={11} fill="#6B7280"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >7</text>
      <text
        x={DX - 28} y={(FY + DY) / 2}
        textAnchor="middle" dominantBaseline="central" fontSize={11} fill="#6B7280"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >5</text>

      {/* ── △BEC given area label ── */}
      {highlightBEC && (
        <text
          x={becCentroidX}
          y={becCentroidY}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fontWeight={700}
          fill={BEC_INK}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          60 cm²
        </text>
      )}

      {/* ── △AFB label: "?" or the revealed result ── */}
      {highlightAFB && (
        <text
          x={afbCentroidX}
          y={afbCentroidY}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={afbArea != null ? 12 : 16}
          fontWeight={900}
          fill={AFB_INK}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {afbArea != null ? `${afbArea} cm²` : '?'}
        </text>
      )}
    </svg>
  )
}

// ── Default export: stem illustration ────────────────────────────────────────

export default function RectTrianglesX24B13Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Rectangle ABCD. E on side DC with DE to EC ratio 4 to 5. ' +
        'F on side AD with AF to FD ratio 7 to 5. ' +
        'Triangle BEC (blue, area 60 cm²) and triangle AFB (amber, area unknown) are shown. ' +
        'Lines drawn from B to E and from B to F.'
      }
    >
      <RectTrianglesFigure />
    </div>
  )
}
