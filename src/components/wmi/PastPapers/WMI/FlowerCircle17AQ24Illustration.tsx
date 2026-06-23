// SEAMO-17-A-Q24 — "What is the missing number?"
//
// Three "flower" diagrams, each with a large orange centre circle surrounded
// by four small teal satellite circles at the NW, NE, SW, SE corners.
//
// Rule discovered from examples 1 & 2:
//   centre = (top-left × bottom-right) + (top-right × bottom-left)
//   i.e. the product of the two NW/SE circles PLUS the product of the two NE/SW circles.
//
// Diagram 1: 2×4 + 5×3 = 8 + 15 = 23 ✓
// Diagram 2: 6×5 + 5×4 = 30 + 20 = 50 ✓
// Diagram 3: 7×8 + ?×3 = 68  →  ? = (68 − 56) ÷ 3 = 4
//
// Props:
//   revealAnswer  – replace "?" with "4" in diagram 3 (animator beat)
//   highlightDiagram – 1 | 2 | 3 – draw a coloured ring around that flower

// ── palette ──────────────────────────────────────────────────────────────────
const ORANGE      = '#f0853a'
const ORANGE_FILL = '#FDE3CF'
const TEAL        = '#2B8A7E'
const TEAL_FILL   = '#B2F0E8'
const ANSWER_COL  = '#16A34A' // green for the revealed answer
const HIGHLIGHT   = '#7C3AED' // violet ring when a whole diagram is highlighted
const WHITE       = '#FFFFFF'
const INK         = '#1F2937'

// ── layout constants ─────────────────────────────────────────────────────────
const R_BIG  = 38   // radius of the big centre circle
const R_SMALL = 16  // radius of the satellite circles
const GAP    = 6    // gap between edge of big circle and centre of satellite
const OFFSET = R_BIG + R_SMALL + GAP  // distance from diagram centre to satellite centre

// Each flower is drawn centred at its own cx/cy.
// We lay out two flowers on row 1 side-by-side, then one centred on row 2.
const CELL    = (OFFSET + R_SMALL + 6) * 2  // bounding box for one flower
const PAD     = 14
const COL_GAP = 16

// Row 1: diagram 1 at left, diagram 2 at right
// Row 2: diagram 3 centred
const D1_CX = PAD + CELL / 2
const D1_CY = PAD + CELL / 2
const D2_CX = D1_CX + CELL + COL_GAP
const D2_CY = D1_CY
const D3_CX = (D1_CX + D2_CX) / 2   // centred between the two column centres
const D3_CY = D1_CY + CELL + COL_GAP

const VIEW_W = D2_CX + CELL / 2 + PAD
const VIEW_H = D3_CY + CELL / 2 + PAD

// ── satellite positions (relative to diagram centre) ─────────────────────────
// Positions: NW (top-left), NE (top-right), SW (bottom-left), SE (bottom-right)
const SATS = [
  { dx: -OFFSET, dy: -OFFSET, label: 'NW' },
  { dx:  OFFSET, dy: -OFFSET, label: 'NE' },
  { dx: -OFFSET, dy:  OFFSET, label: 'SW' },
  { dx:  OFFSET, dy:  OFFSET, label: 'SE' },
] as const

// Data for each diagram: centre value and [NW, NE, SW, SE] satellite values.
interface DiagramData {
  centre: number
  sat: [number | '?', number | '?', number | '?', number | '?']
}

const DIAGRAMS: DiagramData[] = [
  { centre: 23, sat: [2, 5, 3, 4] },
  { centre: 50, sat: [6, 5, 4, 5] },
  { centre: 68, sat: [7, '?', 3, 8] },
]

const ANSWER = 4

// ── sub-components ────────────────────────────────────────────────────────────

interface FlowerProps {
  cx: number
  cy: number
  data: DiagramData
  revealAnswer?: boolean
  highlighted?: boolean
}

function Flower({ cx, cy, data, revealAnswer = false, highlighted = false }: FlowerProps) {
  return (
    <g>
      {/* optional highlight ring behind everything */}
      {highlighted && (
        <circle
          cx={cx}
          cy={cy}
          r={OFFSET + R_SMALL + 8}
          fill="none"
          stroke={HIGHLIGHT}
          strokeWidth={3.5}
          strokeDasharray="6 3"
          opacity={0.7}
        />
      )}

      {/* satellite circles */}
      {SATS.map((s, i) => {
        const sx = cx + s.dx
        const sy = cy + s.dy
        const raw = data.sat[i]
        const isUnknown = raw === '?'
        const displayVal = isUnknown && revealAnswer ? ANSWER : raw
        const showAnswer = isUnknown && revealAnswer
        return (
          <g key={s.label}>
            <circle
              cx={sx}
              cy={sy}
              r={R_SMALL}
              fill={showAnswer ? '#D1FAE5' : TEAL_FILL}
              stroke={showAnswer ? ANSWER_COL : TEAL}
              strokeWidth={showAnswer ? 2.5 : 2}
            />
            <text
              x={sx}
              y={sy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={14}
              fontWeight={700}
              fill={showAnswer ? ANSWER_COL : (isUnknown ? ORANGE : TEAL)}
              className="font-display"
            >
              {displayVal}
            </text>
          </g>
        )
      })}

      {/* big centre circle */}
      <circle
        cx={cx}
        cy={cy}
        r={R_BIG}
        fill={ORANGE_FILL}
        stroke={ORANGE}
        strokeWidth={2.5}
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={22}
        fontWeight={800}
        fill={ORANGE}
        className="font-display"
      >
        {data.centre}
      </text>
    </g>
  )
}

// ── exported primitive ────────────────────────────────────────────────────────

export interface FlowerCircle17AQ24Props {
  /**
   * Replace "?" with "4" in diagram 3.
   * Use this as the animator reveal beat.
   */
  revealAnswer?: boolean
  /**
   * Draw a coloured dashed ring around diagram 1, 2, or 3.
   * 0 = no highlight (default).
   */
  highlightDiagram?: 0 | 1 | 2 | 3
}

export function FlowerCircle17AQ24({
  revealAnswer = false,
  highlightDiagram = 0,
}: FlowerCircle17AQ24Props = {}) {
  const centres = [
    { cx: D1_CX, cy: D1_CY },
    { cx: D2_CX, cy: D2_CY },
    { cx: D3_CX, cy: D3_CY },
  ] as const

  return (
    <svg
      viewBox={`0 0 ${VIEW_W.toFixed(1)} ${VIEW_H.toFixed(1)}`}
      width="100%"
      style={{ maxWidth: Math.round(VIEW_W), display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {DIAGRAMS.map((data, i) => (
        <Flower
          key={i}
          cx={centres[i].cx}
          cy={centres[i].cy}
          data={data}
          revealAnswer={revealAnswer}
          highlighted={highlightDiagram === i + 1}
        />
      ))}
    </svg>
  )
}

// ── default illustration (static, no answer revealed) ────────────────────────

export default function FlowerCircle17AQ24Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Tiga diagram bunga: lingkaran besar oranye di tengah dikelilingi empat lingkaran kecil hijau di sudut-sudutnya. Aturan: pusat = (kiri-atas × kanan-bawah) + (kanan-atas × kiri-bawah). Diagram 1: 23 = 2×4 + 5×3. Diagram 2: 50 = 6×5 + 5×4. Diagram 3: 68 = 7×8 + ?×3; cari nilai ?."
    >
      <FlowerCircle17AQ24 />
    </div>
  )
}

// ── VISUALS entry (registry-compatible object for SEAMO-17-A-Q24) ─────────────

export const VISUALS = {
  'SEAMO-17-A-Q24': {
    illustration: () =>
      import('./FlowerCircle17AQ24Illustration').then((m) => ({ default: m.default })),
  },
}
