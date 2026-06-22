// Stem illustration for IKMC-23-PE-Q1.
//
// "How many circles are there in the figure?"  Answer D = 8.
//
// Faithfully redrawn from the OCR crop
// docs/reference/ocr-res/ikmc/contest/preecolier/2023.imgs/001.jpg:
//
//   A Mickey-Mouse-like face built entirely from overlapping circles:
//     1. Large yellow FACE circle (centre of figure)
//     2. Blue LEFT EAR circle  (upper-left, partially overlapping face)
//     3. Green inner dot in left ear
//     4. Blue RIGHT EAR circle (upper-right, partially overlapping face)
//     5. Green inner dot in right ear
//     6. Orange LEFT EYE circle (inside face)
//     7. Orange RIGHT EYE circle (inside face)
//     8. Purple MOUTH circle (inside face, lower-centre)
//
// Total = 8 circles — answer D.
//
// Pure SVG, SSR-safe, deterministic (no random/Date/state).
// The shared primitive `CircleFacePrimitive` is exported so the explainer
// can reuse it and animate circle-by-circle counting without drifting.

// ── shared layout constants ──────────────────────────────────────────────────

export const SVG_W = 240
export const SVG_H = 230

/** Centre of the large face circle. */
export const FACE_CX = 120
export const FACE_CY = 128

/** Radius of the large face circle. */
export const FACE_R = 78

/** Left ear centre and radius. */
export const EAR_L_CX = 66
export const EAR_L_CY = 62
export const EAR_R = 36

/** Right ear centre and radius. */
export const EAR_R_CX = 174
export const EAR_R_CY = 62

/** Inner dot (eye-like) in each ear. */
export const EAR_DOT_R = 12

/** Left eye inside the face. */
export const EYE_L_CX = 95
export const EYE_L_CY = 118
export const EYE_R = 13

/** Right eye inside the face. */
export const EYE_R_CX = 145
export const EYE_R_CY = 118

/** Mouth circle: lower-centre of face. */
export const MOUTH_CX = 120
export const MOUTH_CY = 160
export const MOUTH_R = 14

// ── colours (sampled from the scan) ─────────────────────────────────────────

export const COLOR = {
  FACE_FILL: '#F5C542',
  FACE_STROKE: '#B8890A',
  EAR_FILL: '#7EC8E3',
  EAR_STROKE: '#4A9CB8',
  EAR_DOT_FILL: '#4CBB6E',
  EAR_DOT_STROKE: '#2D8A4E',
  EYE_FILL: '#F08030',
  EYE_STROKE: '#B85A10',
  MOUTH_FILL: '#9B59B6',
  MOUTH_STROKE: '#6C3483',
  BG: '#FFFFFF',
} as const

// ── circle id → data (for explainer iteration) ───────────────────────────────

export interface CircleSpec {
  id: number
  cx: number
  cy: number
  r: number
  fill: string
  stroke: string
  /** z-order: higher = painted later (on top). */
  z: number
}

/** All 8 circles in z-order (face first so ears/eyes/mouth paint on top). */
export const CIRCLES: CircleSpec[] = [
  // 1 — face (bottom layer)
  { id: 1, cx: FACE_CX, cy: FACE_CY, r: FACE_R, fill: COLOR.FACE_FILL, stroke: COLOR.FACE_STROKE, z: 1 },
  // 2 — left ear
  { id: 2, cx: EAR_L_CX, cy: EAR_L_CY, r: EAR_R, fill: COLOR.EAR_FILL, stroke: COLOR.EAR_STROKE, z: 2 },
  // 3 — left ear inner dot
  { id: 3, cx: EAR_L_CX, cy: EAR_L_CY, r: EAR_DOT_R, fill: COLOR.EAR_DOT_FILL, stroke: COLOR.EAR_DOT_STROKE, z: 3 },
  // 4 — right ear
  { id: 4, cx: EAR_R_CX, cy: EAR_R_CY, r: EAR_R, fill: COLOR.EAR_FILL, stroke: COLOR.EAR_STROKE, z: 2 },
  // 5 — right ear inner dot
  { id: 5, cx: EAR_R_CX, cy: EAR_R_CY, r: EAR_DOT_R, fill: COLOR.EAR_DOT_FILL, stroke: COLOR.EAR_DOT_STROKE, z: 3 },
  // 6 — left eye
  { id: 6, cx: EYE_L_CX, cy: EYE_L_CY, r: EYE_R, fill: COLOR.EYE_FILL, stroke: COLOR.EYE_STROKE, z: 4 },
  // 7 — right eye
  { id: 7, cx: EYE_R_CX, cy: EYE_R_CY, r: EYE_R, fill: COLOR.EYE_FILL, stroke: COLOR.EYE_STROKE, z: 4 },
  // 8 — mouth
  { id: 8, cx: MOUTH_CX, cy: MOUTH_CY, r: MOUTH_R, fill: COLOR.MOUTH_FILL, stroke: COLOR.MOUTH_STROKE, z: 5 },
]

/** Total number of circles in the figure. */
export const TOTAL_CIRCLES = CIRCLES.length // 8

// ── shared primitive ──────────────────────────────────────────────────────────

export interface CircleFacePrimitiveProps {
  /**
   * How many circles to highlight (counted in id order 1..8).
   * 0 = show all at full opacity, no badge.
   * n > 0 = circles 1..n get a blue highlight ring; n+1..8 are dimmed.
   * When `mode` = 'count', a small numbered badge appears on each highlighted circle.
   */
  highlighted?: number
  mode?: 'static' | 'count'
}

/**
 * The Mickey-face figure as a composable SVG group.
 * Re-exported for use in the explainer without re-implementing the geometry.
 */
export function CircleFacePrimitive({ highlighted = 0, mode = 'static' }: CircleFacePrimitiveProps) {
  // z-order groups: render face first, then ears, then inner dots + eyes + mouth
  const byZ = [...CIRCLES].sort((a, b) => a.z - b.z)

  return (
    <g>
      {byZ.map(({ id, cx, cy, r, fill, stroke }) => {
        const isHighlighted = highlighted > 0 && id <= highlighted
        const isDimmed = highlighted > 0 && id > highlighted
        const opacity = isDimmed ? 0.3 : 1

        return (
          <g key={id} opacity={opacity}>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill={fill}
              stroke={stroke}
              strokeWidth={2}
            />
            {/* highlight ring */}
            {isHighlighted && mode === 'count' && (
              <circle
                cx={cx}
                cy={cy}
                r={r + 4}
                fill="none"
                stroke="#2563EB"
                strokeWidth={2.5}
                strokeDasharray="6 3"
              />
            )}
            {/* count badge on the counted circle */}
            {mode === 'count' && id === highlighted && (
              <g>
                <circle cx={cx + r * 0.6} cy={cy - r * 0.6} r={10} fill="#2563EB" />
                <text
                  x={cx + r * 0.6}
                  y={cy - r * 0.6}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={11}
                  fontWeight={900}
                  fill="#FFFFFF"
                >
                  {id}
                </text>
              </g>
            )}
          </g>
        )
      })}
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────────

/**
 * CountCircles1PEIllustration
 *
 * Static, problem-only figure for IKMC-23-PE-Q1.
 * Shows the Mickey-face made of overlapping coloured circles.
 * Does NOT show the count or the answer.
 */
export default function CountCircles1PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Gambar wajah bulat kuning besar dengan dua lingkaran biru (telinga) masing-masing berisi lingkaran hijau kecil, ' +
        'dua lingkaran oranye (mata), dan satu lingkaran ungu (mulut). ' +
        'Ada berapa lingkaran seluruhnya?'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(280, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />
        <CircleFacePrimitive />
      </svg>
    </div>
  )
}
