// IKMC-21-PE-Q7 — "children standing in a line, some facing forwards, others backwards"
//
// Stem illustration — shows the PROBLEM only (7 children in a line, alternating
// facing directions). Does NOT show which hands are right hands or the answer (6).
//
// Faithful reconstruction of OCR image 014.jpg from the 2021 IKMC Pre-Ecolier paper.
// Children alternate: forward (→), backward (←), forward, backward, forward, backward, forward.
// i.e. positions 1,3,5,7 face viewer's right; positions 2,4,6 face viewer's left.
//
// Co-exports (re-used by ChildrenLine7PEExplainer):
//   ChildFigure     — draws one child stick-figure (facing left or right)
//   SVG_W / SVG_H  — canvas dimensions
//   CHILD_CX       — array of 7 x-centres
//   GROUND_Y       — ground line y
//   DIRECTIONS     — per-child facing ('fwd' | 'bwd')
//   COLOR          — palette
//
// Pure SVG, no Math.random, no Date, SSR-safe & deterministic.

// ── layout constants ──────────────────────────────────────────────────────────

export const SVG_W = 420
export const SVG_H = 160
export const GROUND_Y = 140

/** X centres of the 7 children (evenly spaced with margin). */
// eslint-disable-next-line react-refresh/only-export-components
export const CHILD_CX: number[] = [30, 90, 150, 210, 270, 330, 390]

/**
 * Facing directions: 'fwd' = faces viewer's right (→), 'bwd' = faces viewer's left (←).
 * Alternating per the source figure: 1,3,5,7 forward; 2,4,6 backward.
 */
export type Direction = 'fwd' | 'bwd'
// eslint-disable-next-line react-refresh/only-export-components
export const DIRECTIONS: Direction[] = ['fwd', 'bwd', 'fwd', 'bwd', 'fwd', 'bwd', 'fwd']

// ── colour tokens ─────────────────────────────────────────────────────────────

export const COLOR = {
  GROUND: '#D4B896',
  GROUND_LINE: '#8B6914',
  SKIN: '#F9C784',
  SKIN_STROKE: '#C87941',
  SHIRT_FWD: '#4A90D9',   // forward-facing children: blue shirt
  SHIRT_BWD: '#E05252',   // backward-facing children: red shirt
  SHIRT_STROKE: '#1F2937',
  PANTS: '#374151',
  PANTS_STROKE: '#111827',
  HAIR_FWD: '#5C3B1E',   // brown hair
  HAIR_BWD: '#1F2937',   // dark hair
  HAND_LINE: '#F9C784',
  BG: '#FFFFFF',
} as const

// ── ChildFigure primitive ─────────────────────────────────────────────────────

export interface ChildFigureProps {
  cx: number
  /** Y of the ground (feet rest here). */
  groundY: number
  dir: Direction
  /** Index 0–6 (used for minor per-child variation in hair colour). */
  index: number
}

/**
 * Draws one stick-figure child facing 'fwd' (→) or 'bwd' (←).
 * The hand points are exported so the explainer can draw connection lines.
 *
 * Body proportions (total height ≈ 100 px):
 *   head radius 10 px, torso 28 px, legs 30 px, arms extend ±22 px from shoulder.
 */
export function ChildFigure({ cx, groundY, dir, index }: ChildFigureProps) {
  const faceRight = dir === 'fwd'

  // ── vertical layout (from ground up) ────────────────────────────────────
  const footY    = groundY
  const legLen   = 30
  const kneeY    = footY - legLen
  const torsoLen = 28
  const shoulderY = kneeY - torsoLen
  const neckLen  = 6
  const neckY    = shoulderY - neckLen
  const headR    = 10
  const headCY   = neckY - headR

  // ── arm layout ───────────────────────────────────────────────────────────
  const armY    = shoulderY + 4       // arm attach slightly below shoulder
  const armLen  = 22
  const leftHandX  = cx - armLen      // LEFT hand (viewer's left)
  const rightHandX = cx + armLen      // RIGHT hand (viewer's right)
  const handY   = armY + 4

  // ── face features (eye + nose on the side the child faces) ──────────────
  // eye is on whichever side the child faces
  const eyeOffX = faceRight ? headR * 0.35 : -headR * 0.35
  const noseOffX = faceRight ? headR * 0.7 : -headR * 0.7

  // ── hair (simple arc above head) ─────────────────────────────────────────
  const hairColor = index % 2 === 0 ? COLOR.HAIR_FWD : COLOR.HAIR_BWD

  // ── shirt colour by direction ─────────────────────────────────────────────
  const shirtColor = faceRight ? COLOR.SHIRT_FWD : COLOR.SHIRT_BWD

  return (
    <g>
      {/* left leg */}
      <line
        x1={cx - 5} y1={kneeY}
        x2={cx - 7} y2={footY}
        stroke={COLOR.PANTS}
        strokeWidth={5}
        strokeLinecap="round"
      />
      {/* right leg */}
      <line
        x1={cx + 5} y1={kneeY}
        x2={cx + 7} y2={footY}
        stroke={COLOR.PANTS}
        strokeWidth={5}
        strokeLinecap="round"
      />

      {/* torso / shirt */}
      <rect
        x={cx - 8}
        y={shoulderY}
        width={16}
        height={torsoLen}
        rx={4}
        fill={shirtColor}
        stroke={COLOR.SHIRT_STROKE}
        strokeWidth={1}
      />

      {/* left arm */}
      <line
        x1={cx - 7} y1={armY}
        x2={leftHandX} y2={handY}
        stroke={COLOR.SKIN}
        strokeWidth={4}
        strokeLinecap="round"
      />
      {/* right arm */}
      <line
        x1={cx + 7} y1={armY}
        x2={rightHandX} y2={handY}
        stroke={COLOR.SKIN}
        strokeWidth={4}
        strokeLinecap="round"
      />

      {/* neck */}
      <line
        x1={cx} y1={shoulderY}
        x2={cx} y2={neckY}
        stroke={COLOR.SKIN}
        strokeWidth={5}
        strokeLinecap="round"
      />

      {/* head */}
      <circle
        cx={cx}
        cy={headCY}
        r={headR}
        fill={COLOR.SKIN}
        stroke={COLOR.SKIN_STROKE}
        strokeWidth={1.5}
      />

      {/* hair */}
      <ellipse
        cx={cx}
        cy={headCY - headR * 0.5}
        rx={headR + 1}
        ry={headR * 0.7}
        fill={hairColor}
        stroke="none"
        clipPath={`inset(0 0 50% 0)`}
      />
      {/* simple hair arc — top semicircle */}
      <path
        d={`M ${cx - headR} ${headCY} A ${headR} ${headR} 0 0 1 ${cx + headR} ${headCY}`}
        fill={hairColor}
        stroke="none"
      />

      {/* eye */}
      <circle
        cx={cx + eyeOffX}
        cy={headCY - 2}
        r={1.8}
        fill={COLOR.SHIRT_STROKE}
      />

      {/* nose (tiny dot) */}
      <circle
        cx={cx + noseOffX}
        cy={headCY + 3}
        r={1.2}
        fill={COLOR.SKIN_STROKE}
      />

      {/* smile */}
      <path
        d={`M ${cx + (faceRight ? 2 : -6)} ${headCY + 5} Q ${cx + (faceRight ? 5 : -3)} ${headCY + 8} ${cx + (faceRight ? 8 : 0)} ${headCY + 5}`}
        stroke={COLOR.SKIN_STROKE}
        strokeWidth={1.2}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  )
}

// ── Compute per-child hand contact points ─────────────────────────────────────

/**
 * Returns the x-coordinate of the LEFT hand of child i
 * (leftmost point of their arm reach, in image space).
 */
// eslint-disable-next-line react-refresh/only-export-components
export function leftHandX(cx: number) { return cx - 22 }

/**
 * Returns the x-coordinate of the RIGHT hand of child i
 * (rightmost point of their arm reach, in image space).
 */
// eslint-disable-next-line react-refresh/only-export-components
export function rightHandX(cx: number) { return cx + 22 }

/** Y coordinate of all hand connection points. */
export const HAND_Y = GROUND_Y - 30 - 28 + 4 + 4  // armY + 4 (matches ChildFigure)

// ── Default export ─────────────────────────────────────────────────────────────

/**
 * ChildrenLine7PEIllustration
 *
 * Stem figure for IKMC-21-PE-Q7.
 * Shows 7 children in a line, alternating facing directions (→←→←→←→).
 * All children hold hands with neighbours (plain lines between them).
 * Does NOT reveal which hands are right hands or the answer.
 */
export default function ChildrenLine7PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        '7 anak berdiri berjajar sambil berpegangan tangan. Sebagian menghadap ke depan dan sebagian menghadap ke belakang.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(480, SVG_W)}
        style={{ display: 'block', maxWidth: '100%' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

        {/* ground */}
        <rect x={0} y={GROUND_Y} width={SVG_W} height={SVG_H - GROUND_Y} fill={COLOR.GROUND} />
        <line x1={0} y1={GROUND_Y} x2={SVG_W} y2={GROUND_Y} stroke={COLOR.GROUND_LINE} strokeWidth={2} />

        {/* hand-holding lines between adjacent children */}
        {CHILD_CX.slice(0, 6).map((cx, i) => {
          const nextCx = CHILD_CX[i + 1]
          return (
            <line
              key={`link-${i}`}
              x1={rightHandX(cx)}
              y1={HAND_Y}
              x2={leftHandX(nextCx)}
              y2={HAND_Y}
              stroke={COLOR.HAND_LINE}
              strokeWidth={3}
              strokeLinecap="round"
            />
          )
        })}

        {/* children */}
        {CHILD_CX.map((cx, i) => (
          <ChildFigure
            key={i}
            cx={cx}
            groundY={GROUND_Y}
            dir={DIRECTIONS[i]}
            index={i}
          />
        ))}
      </svg>
    </div>
  )
}
