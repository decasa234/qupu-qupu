// In-card figure for WMI-25P3A-Q18 (2025 Grade 3 Semifinal).
//
// Source: db/seed/wmi/figures/2025-semifinal-g3-a-q18.jpg — a 10 cm × 8 cm
// rectangle. A circle of radius 2 cm sits in the bottom-left corner; a dashed
// inner rectangle marks the path traced by the circle's CENTER as it rolls once
// around the inside. Labels: "2 cm" (radius), "8 cm" (right height), "10 cm"
// (bottom width).
//
// The static figure shows the SET-UP (outer walls, the rolling circle, the
// dashed center path) but never the answer length (20 cm). The explainer imports
// `RollRectFigure` and adds the measurements / result.

const INK = '#1F2937'

/** Pixels per cm in the SVG coordinate space. */
export const PX_PER_CM = 24

export const RECT_W_CM = 10
export const RECT_H_CM = 8
export const RADIUS_CM = 2

// Inner (center-path) rectangle: pulled in by one radius on every wall.
export const INNER_W_CM = RECT_W_CM - 2 * RADIUS_CM // 6
export const INNER_H_CM = RECT_H_CM - 2 * RADIUS_CM // 4
export const CENTER_PATH_CM = 2 * (INNER_W_CM + INNER_H_CM) // 20

// --- viewport -----------------------------------------------------------------
const PAD_L = 18
const PAD_R = 56 // room for the "8 cm" right label + bracket
const PAD_T = 18
const PAD_B = 52 // room for the "10 cm" bottom label + bracket

const rectW = RECT_W_CM * PX_PER_CM
const rectH = RECT_H_CM * PX_PER_CM
const r = RADIUS_CM * PX_PER_CM
const inset = RADIUS_CM * PX_PER_CM // center path inset = one radius

const X0 = PAD_L
const Y0 = PAD_T

export const Q18_VIEW_W = PAD_L + rectW + PAD_R
export const Q18_VIEW_H = PAD_T + rectH + PAD_B

// Circle centre — one radius in from the left wall and the bottom wall.
const circleCx = X0 + r
const circleCy = Y0 + rectH - r

function DimLabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={14}
      fontWeight={700}
      fontStyle="italic"
      fill={INK}
    >
      {text}
    </text>
  )
}

export interface RollRectFigureProps {
  /** Highlight the dashed center path (explainer "trace" beat). */
  highlightPath?: boolean
  /** Show the inner-rectangle dimension labels 6 cm / 4 cm. */
  showInnerDims?: boolean
  /** Show the rolling circle + its 2 cm radius spoke. */
  showCircle?: boolean
}

export function RollRectFigure({ highlightPath = false, showInnerDims = false, showCircle = true }: RollRectFigureProps) {
  const pathStroke = highlightPath ? '#2563EB' : INK
  const pathWidth = highlightPath ? 3 : 1.8

  // bracket geometry for outer labels
  const tick = 5
  const gap = 8

  return (
    <svg
      viewBox={`0 0 ${Q18_VIEW_W} ${Q18_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* outer rectangle (the rolling surface walls) */}
      <rect x={X0} y={Y0} width={rectW} height={rectH} fill="#FFFFFF" stroke={INK} strokeWidth={2.4} />

      {/* dashed inner rectangle = path of the circle's CENTER */}
      <rect
        x={X0 + inset}
        y={Y0 + inset}
        width={rectW - 2 * inset}
        height={rectH - 2 * inset}
        fill="none"
        stroke={pathStroke}
        strokeWidth={pathWidth}
        strokeDasharray="7 5"
        strokeLinejoin="round"
      />

      {/* rolling circle in the bottom-left corner */}
      {showCircle && (
        <>
          <circle cx={circleCx} cy={circleCy} r={r} fill="none" stroke={INK} strokeWidth={2.2} />
          {/* radius spoke pointing left to the wall */}
          <line x1={circleCx} y1={circleCy} x2={X0} y2={circleCy} stroke={INK} strokeWidth={1.6} />
          <circle cx={circleCx} cy={circleCy} r={2.6} fill={INK} />
          <DimLabel x={circleCx - r / 2} y={circleCy + 16} text="2 cm" />
        </>
      )}

      {/* inner-rectangle dimension labels (explainer only) */}
      {showInnerDims && (
        <>
          <DimLabel x={(X0 + inset + (rectW - inset)) / 2} y={Y0 + inset - 12} text={`${INNER_W_CM} cm`} />
          <DimLabel x={X0 + inset + 18} y={(Y0 + inset + (rectH - inset)) / 2} text={`${INNER_H_CM} cm`} />
        </>
      )}

      {/* 8 cm — right side bracket */}
      <line x1={X0 + rectW + gap} y1={Y0} x2={X0 + rectW + gap} y2={Y0 + rectH} stroke={INK} strokeWidth={1.3} />
      <line x1={X0 + rectW + gap - tick} y1={Y0} x2={X0 + rectW + gap + tick} y2={Y0} stroke={INK} strokeWidth={1.3} />
      <line x1={X0 + rectW + gap - tick} y1={Y0 + rectH} x2={X0 + rectW + gap + tick} y2={Y0 + rectH} stroke={INK} strokeWidth={1.3} />
      <DimLabel x={X0 + rectW + gap + 22} y={Y0 + rectH / 2} text="8 cm" />

      {/* 10 cm — bottom bracket */}
      <line x1={X0} y1={Y0 + rectH + gap} x2={X0 + rectW} y2={Y0 + rectH + gap} stroke={INK} strokeWidth={1.3} />
      <line x1={X0} y1={Y0 + rectH + gap - tick} x2={X0} y2={Y0 + rectH + gap + tick} stroke={INK} strokeWidth={1.3} />
      <line x1={X0 + rectW} y1={Y0 + rectH + gap - tick} x2={X0 + rectW} y2={Y0 + rectH + gap + tick} stroke={INK} strokeWidth={1.3} />
      <DimLabel x={X0 + rectW / 2} y={Y0 + rectH + gap + 20} text="10 cm" />
    </svg>
  )
}

export default function P25G3Q18Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A 10 cm by 8 cm rectangle. A circle of radius 2 cm sits in the bottom-left corner and rolls around inside; a dashed inner rectangle shows the path of the circle's centre."
    >
      <RollRectFigure />
    </div>
  )
}
