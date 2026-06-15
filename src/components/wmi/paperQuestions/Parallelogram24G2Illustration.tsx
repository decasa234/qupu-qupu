// Parallelogram → rectangle slide figure for WMI-24F2A-Q2.
// Shows a parallelogram with a shaded left triangle and labelled base segments.
// Never reveals the answer (slide distance); that is the animator's job.

const INK = '#1F2937'

function Frame({ aria, children }: { aria: string; children: React.ReactNode }) {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={aria}
    >
      {children}
    </div>
  )
}

// ── exported data constant — explainer / animator binds to this ──────────────

/** Dimensions of the WMI-24F2A-Q2 parallelogram figure (in cm). */
export const PARALLELOGRAM24_DATA = {
  /** Horizontal base of the shaded cut triangle (overhang on the left). */
  triangleBase: 4,
  /** Length of the flat section of the bottom edge. */
  flatBase: 9,
  /** Total base width = triangleBase + flatBase. */
  totalBase: 13,
} as const

// ── primitive SVG component ──────────────────────────────────────────────────

/**
 * Draws the parallelogram + shaded triangle geometry.
 *
 * @param highlightSlide  When true (animator use), draws a dashed right-hand
 *                        gap arrow showing where the triangle needs to go.
 *                        Default false (problem card shows only the setup).
 */
export function ParallelogramFigure({
  highlightSlide = false,
}: {
  highlightSlide?: boolean
}) {
  // ── layout constants ──
  const VW = 320
  const VH = 180

  // Parallelogram corners (flat-top, slanted left side).
  // The bottom edge runs from x=L to x=L+total, the top edge is shifted right
  // by `tri` (the triangle base) so the left side is slanted.
  const PAD_L = 24   // left padding
  const PAD_R = 24   // right padding
  const PAD_T = 28   // top padding
  const PAD_B = 52   // bottom padding (room for dimension labels)

  const tri = PARALLELOGRAM24_DATA.triangleBase  // 4 cm
  const total = PARALLELOGRAM24_DATA.totalBase   // 13 cm

  // Scale: map 13 cm to available pixel width.
  const availW = VW - PAD_L - PAD_R
  const scale = availW / total   // px per cm
  const availH = VH - PAD_T - PAD_B

  // Parallelogram vertices (bottom-left origin).
  // Bottom edge: from (PAD_L, top+availH) to (PAD_L + total*scale, top+availH)
  // Top edge: shifted right by tri*scale.
  const bY = PAD_T + availH   // y of bottom edge
  const tY = PAD_T            // y of top edge

  const bL = PAD_L                       // bottom-left  x
  const bR = PAD_L + total * scale       // bottom-right x
  const tL = PAD_L + tri * scale         // top-left     x  (triangle apex)
  const tR = PAD_L + total * scale       // top-right    x  (same right edge)

  // Triangle apex is at the top of the left slant.
  // Vertices of the full parallelogram: bL,bY → bR,bY → tR,tY → tL,tY.
  const paraPoints = `${bL},${bY} ${bR},${bY} ${tR},${tY} ${tL},${tY}`

  // Shaded triangle = left slice: bL,bY → tL,tY → tL,bY (right-angle at tL,bY).
  const triPoints = `${bL},${bY} ${tL},${tY} ${tL},${bY}`

  // Label positions.
  const labelY = bY + 22    // below the bottom edge

  // "4 cm" label: centred under the triangle's horizontal span.
  const label4X = (bL + tL) / 2
  // "9 cm" label: centred under the flat section.
  const label9X = (tL + bR) / 2

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: 340, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Full parallelogram body (white fill, dark outline) */}
      <polygon
        points={paraPoints}
        fill="white"
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Shaded cut triangle (blue, same as the scan) */}
      <polygon
        points={triPoints}
        fill="#BFD7EA"
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Vertical dashed cut line (the boundary between triangle and rectangle body) */}
      <line
        x1={tL}
        y1={bY}
        x2={tL}
        y2={tY}
        stroke={INK}
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />

      {/* ── Dimension tick marks ── */}
      {/* Left tick (under bL) */}
      <line x1={bL} y1={bY + 4} x2={bL} y2={bY + 11} stroke={INK} strokeWidth={1.5} />
      {/* Middle tick (under tL) */}
      <line x1={tL} y1={bY + 4} x2={tL} y2={bY + 11} stroke={INK} strokeWidth={1.5} />
      {/* Right tick (under bR) */}
      <line x1={bR} y1={bY + 4} x2={bR} y2={bY + 11} stroke={INK} strokeWidth={1.5} />

      {/* Horizontal dimension lines */}
      {/* 4 cm span */}
      <line x1={bL + 2} y1={bY + 7} x2={tL - 2} y2={bY + 7} stroke={INK} strokeWidth={1.2} />
      {/* 9 cm span */}
      <line x1={tL + 2} y1={bY + 7} x2={bR - 2} y2={bY + 7} stroke={INK} strokeWidth={1.2} />

      {/* "4 cm" label */}
      <text
        x={label4X}
        y={labelY + 8}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight={700}
        fill={INK}
      >
        4 cm
      </text>

      {/* "9 cm" label */}
      <text
        x={label9X}
        y={labelY + 8}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight={700}
        fill={INK}
      >
        9 cm
      </text>

      {/* Optional: slide indicator arrow (animator only) */}
      {highlightSlide && (
        <g>
          {/* Arrow from triangle position rightward */}
          <defs>
            <marker id="arrowR" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#E67E22" />
            </marker>
          </defs>
          <line
            x1={bL + 6}
            y1={tY - 12}
            x2={bR - 6}
            y2={tY - 12}
            stroke="#E67E22"
            strokeWidth={2}
            markerEnd="url(#arrowR)"
            strokeDasharray="5 3"
          />
          <text
            x={(bL + bR) / 2}
            y={tY - 20}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13}
            fontWeight={700}
            fill="#E67E22"
          >
            13 cm
          </text>
        </g>
      )}
    </svg>
  )
}

// ── default export: the problem card illustration ────────────────────────────

/**
 * In-card illustration for WMI-24F2A-Q2.
 *
 * Shows the parallelogram with the shaded left-triangle and the two base
 * dimension labels. Never reveals the slide distance (answer = 13 cm).
 */
export default function Parallelogram24G2Illustration() {
  return (
    <Frame aria="Jajargenjang dengan segitiga kiri yang diarsir biru. Alas kiri (segitiga) 4 cm, bagian datar 9 cm. Geser segitiga ke kanan agar menjadi persegi panjang.">
      <ParallelogramFigure />
    </Frame>
  )
}
