// Square-minus-rectangle area figure for WMI-23P3A-Q9.
//
// Recovered from db/seed/wmi/figures/2023-semifinal-g3-a-q9.jpg:
// a 9 m × 9 m green square with a 6 m × 5 m white rectangle cut out of the
// middle. The shaded (green) region is what remains.
//   square    = 9 × 9 = 81 m²
//   rectangle = 6 × 5 = 30 m²
//   shaded    = 81 − 30 = 51 m²  (answer C)
export const SQUARE_SIDE = 9
export const RECT_W = 6
export const RECT_H = 5
export const SQUARE_AREA = SQUARE_SIDE * SQUARE_SIDE // 81
export const RECT_AREA = RECT_W * RECT_H // 30
export const SHADED_AREA = SQUARE_AREA - RECT_AREA // 51

const SHADE = '#D9E16A' // lime green fill (matches the scan)
const SHADE_BRIGHT = '#C2D131' // emphasised lime for the explainer
const EDGE = '#1F2937'
const LABEL = '#1F2937'
const CUT_FILL = '#FFFFFF'

// Geometry: 30 px per metre, with generous headroom for the outer labels.
const PX = 30
const PAD = 56 // room for "9 m" / "5 m" / "6 m" text around the square
const SQ = SQUARE_SIDE * PX // 270
const RW = RECT_W * PX // 180
const RH = RECT_H * PX // 150

export const Q9_VIEW_W = SQ + PAD * 2
export const Q9_VIEW_H = SQ + PAD * 2

const SQ_X = PAD
const SQ_Y = PAD
// centre the cut rectangle inside the square
const RECT_X = SQ_X + (SQ - RW) / 2
const RECT_Y = SQ_Y + (SQ - RH) / 2

export interface SquareCutDiagramProps {
  /** Brighten the shaded ring (square minus cut) — used when the answer lands. */
  highlightShaded?: boolean
  /** Outline the full square in blue (the "whole square = 81" beat). */
  emphasizeSquare?: boolean
  /** Outline the cut-out rectangle in red (the "rectangle = 30" beat). */
  emphasizeRect?: boolean
  /** Caption tag shown centred in the white cut-out (e.g. "30 m²"). */
  rectTag?: string
}

/** The square-with-a-rectangular-hole figure. The shaded region is the green ring. */
export function SquareCutDiagram({
  highlightShaded = false,
  emphasizeSquare = false,
  emphasizeRect = false,
  rectTag,
}: SquareCutDiagramProps) {
  // Even-odd fill rule paints the square but leaves the inner rectangle hollow,
  // so the green ring is exactly the shaded region.
  const ringPath =
    `M ${SQ_X} ${SQ_Y} h ${SQ} v ${SQ} h ${-SQ} Z ` +
    `M ${RECT_X} ${RECT_Y} h ${RW} v ${RH} h ${-RW} Z`

  return (
    <svg
      viewBox={`0 0 ${Q9_VIEW_W} ${Q9_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* shaded ring (square minus the cut rectangle) */}
      <path d={ringPath} fillRule="evenodd" fill={highlightShaded ? SHADE_BRIGHT : SHADE} />

      {/* white cut-out rectangle on top */}
      <rect x={RECT_X} y={RECT_Y} width={RW} height={RH} fill={CUT_FILL} />

      {/* square outline */}
      <rect
        x={SQ_X}
        y={SQ_Y}
        width={SQ}
        height={SQ}
        fill="none"
        stroke={emphasizeSquare ? '#2f6df0' : EDGE}
        strokeWidth={emphasizeSquare ? 5 : 3}
      />
      {/* cut-out outline */}
      <rect
        x={RECT_X}
        y={RECT_Y}
        width={RW}
        height={RH}
        fill="none"
        stroke={emphasizeRect ? '#E11D48' : EDGE}
        strokeWidth={emphasizeRect ? 5 : 3}
      />

      {/* dimension labels (outside / on the edges, matching the scan) */}
      {/* top edge of cut-out: 6 m */}
      <text
        x={RECT_X + RW / 2}
        y={RECT_Y - 12}
        textAnchor="middle"
        fontSize={22}
        fontStyle="italic"
        fontWeight={700}
        fill={LABEL}
      >
        6 m
      </text>
      {/* left edge of cut-out: 5 m */}
      <text
        x={RECT_X - 14}
        y={RECT_Y + RH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={22}
        fontStyle="italic"
        fontWeight={700}
        fill={LABEL}
      >
        5 m
      </text>
      {/* right side of square: 9 m */}
      <text
        x={SQ_X + SQ + 26}
        y={SQ_Y + SQ / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={22}
        fontStyle="italic"
        fontWeight={700}
        fill={LABEL}
      >
        9 m
      </text>
      {/* bottom side of square: 9 m */}
      <text
        x={SQ_X + SQ / 2}
        y={SQ_Y + SQ + 32}
        textAnchor="middle"
        fontSize={22}
        fontStyle="italic"
        fontWeight={700}
        fill={LABEL}
      >
        9 m
      </text>

      {/* optional tag centred in the cut-out */}
      {rectTag && (
        <text
          x={RECT_X + RW / 2}
          y={RECT_Y + RH / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={24}
          fontWeight={900}
          fill="#E11D48"
        >
          {rectTag}
        </text>
      )}
    </svg>
  )
}

export default function P23G3Q9Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A 9 m by 9 m green square with a 6 m by 5 m rectangle cut out of its centre. The shaded region is the green part that remains."
    >
      <SquareCutDiagram />
    </div>
  )
}
