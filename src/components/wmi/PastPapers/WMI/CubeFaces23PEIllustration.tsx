// IKMC-20-PE-Q23 — "Six different numbers chosen from 1 to 9 are written on the
// faces of a cube, one number on each face. The sums of numbers on each pair of
// opposite faces are equal. Which number could be on the face opposite to the
// face with the number 5?"
//
// Answer: C (6).  S = 5+6 = 11; remaining pairs from {1,2,3,4,7,8,9}: (2,9)
// and (3,8), both sum to 11. ✓
//
// The stem figure (OCR image 066.jpg) shows a cube in standard isometric view
// with three visible faces:
//   Top face   → "5"
//   Left face  → "4"
//   Right face → "8"
//
// Opposite (hidden) faces are not labelled in the stem — that is the puzzle.
//
// Reuses the isometric cube primitive from CubeShapes14Illustration (same
// stack19project transform, same SIZE/CX/CY constants, same polygon geometry).
//
// Pure SVG, no randomness, no dates, SSR-safe.

// ---------------------------------------------------------------------------
// Isometric cube constants  (matching CubeShapes14Illustration)
// ---------------------------------------------------------------------------

const INK = '#1F2937'
const SIZE = 50          // larger so number glyphs are legible
const CX   = SIZE * 0.866
const CY   = SIZE * 0.5

// Face palettes — white/cream cube to keep numbers readable
const TOP_FILL   = '#F8F4EE'
const LEFT_FILL  = '#E2D9CE'
const RIGHT_FILL = '#C8BAA8'

// Highlight palette (used by explainer)
export const HL_TOP   = '#FDE68A'
export const HL_LEFT  = '#FCD34D'
export const HL_RIGHT = '#F59E0B'

// Answer-pair highlight (green)
export const ANS_TOP   = '#A7F3D0'
export const ANS_LEFT  = '#6EE7B7'
export const ANS_RIGHT = '#34D399'

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

/** Project a single cube's origin to SVG space.
 * The cube's anchor (sx, sy) is the leftmost point of the top rhombus.
 */
export function projectCube23(ox: number, oy: number) {
  // For a single cube sitting at (0,0,0) in iso space we fix the projection:
  //   sx = 0, sy = 0
  // The caller supplies ox/oy as a direct SVG translation offset.
  return { sx: ox, sy: oy }
}

// Points for each face relative to (sx, sy) — the top-left anchor of the top face.
export function topFacePts(sx: number, sy: number) {
  // rhombus: left → top → right → bottom
  return `${sx},${sy} ${sx + CX},${sy - CY} ${sx + 2 * CX},${sy} ${sx + CX},${sy + CY}`
}
export function leftFacePts(sx: number, sy: number) {
  return `${sx},${sy} ${sx + CX},${sy + CY} ${sx + CX},${sy + CY + SIZE} ${sx},${sy + SIZE}`
}
export function rightFacePts(sx: number, sy: number) {
  return `${sx + CX},${sy + CY} ${sx + 2 * CX},${sy} ${sx + 2 * CX},${sy + SIZE} ${sx + CX},${sy + CY + SIZE}`
}

// Label centres
export function topCentre(sx: number, sy: number)   { return { cx: sx + CX,           cy: sy + CY * 0.3  } }
export function leftCentre(sx: number, sy: number)  { return { cx: sx + CX * 0.5,     cy: sy + CY + SIZE * 0.52 } }
export function rightCentre(sx: number, sy: number) { return { cx: sx + CX * 1.5 + CX * 0.05, cy: sy + CY + SIZE * 0.52 } }

// ---------------------------------------------------------------------------
// Props for the shared cube face renderer
// ---------------------------------------------------------------------------

export interface SingleCubeProps {
  /** SVG coordinate of the cube's top-left anchor */
  ox?: number
  oy?: number
  /** Text on each visible face (empty string = unlabelled) */
  topLabel?:   string
  leftLabel?:  string
  rightLabel?: string
  /** Optional override fills for highlight animations */
  topFill?:   string
  leftFill?:  string
  rightFill?: string
  /** Font size for the number glyphs */
  fontSize?: number
}

/**
 * IsoCube23 — renders one labelled isometric cube.
 * Co-exported so the explainer can reuse it with different highlight fills.
 */
export function IsoCube23({
  ox = 0,
  oy = 0,
  topLabel   = '',
  leftLabel  = '',
  rightLabel = '',
  topFill:   topC   = TOP_FILL,
  leftFill:  leftC  = LEFT_FILL,
  rightFill: rightC = RIGHT_FILL,
  fontSize = 17,
}: SingleCubeProps) {
  const { sx, sy } = projectCube23(ox, oy)

  const tPts  = topFacePts(sx, sy)
  const lPts  = leftFacePts(sx, sy)
  const rPts  = rightFacePts(sx, sy)

  const tCtr  = topCentre(sx, sy)
  const lCtr  = leftCentre(sx, sy)
  const rCtr  = rightCentre(sx, sy)

  // Rotation transforms so numbers sit "on" the tilted face naturally
  // Top face: italic 30° lean
  const topTransform  = `rotate(-30, ${tCtr.cx}, ${tCtr.cy})`
  // Left face: slight italic lean to follow the face angle
  const leftTransform = `rotate(30, ${lCtr.cx}, ${lCtr.cy})`
  // Right face: stay upright (slight ccw)
  const rightTransform = `rotate(-30, ${rCtr.cx}, ${rCtr.cy})`

  return (
    <g>
      <polygon points={tPts}  fill={topC}   stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <polygon points={lPts}  fill={leftC}  stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <polygon points={rPts}  fill={rightC} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />

      {topLabel && (
        <text
          x={tCtr.cx} y={tCtr.cy + fontSize * 0.35}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight="bold"
          fontFamily="Georgia, serif"
          fill={INK}
          transform={topTransform}
          dominantBaseline="auto"
        >
          {topLabel}
        </text>
      )}
      {leftLabel && (
        <text
          x={lCtr.cx} y={lCtr.cy + fontSize * 0.35}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight="bold"
          fontFamily="Georgia, serif"
          fill={INK}
          transform={leftTransform}
          dominantBaseline="auto"
        >
          {leftLabel}
        </text>
      )}
      {rightLabel && (
        <text
          x={rCtr.cx} y={rCtr.cy + fontSize * 0.35}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight="bold"
          fontFamily="Georgia, serif"
          fill={INK}
          transform={rightTransform}
          dominantBaseline="auto"
        >
          {rightLabel}
        </text>
      )}
    </g>
  )
}

// ---------------------------------------------------------------------------
// Viewbox: compute bounding box for one cube at (ox,oy) = (0,0)
// ---------------------------------------------------------------------------
const PAD = 14
// Width of one cube: 2*CX, height: CY + SIZE (below anchor) + CY (above)
const VBX = 0 - PAD
const VBY = -CY - PAD
const VBW = 2 * CX + PAD * 2
const VBH = CY + SIZE + CY + PAD * 2

// ---------------------------------------------------------------------------
// Default stem illustration export
// ---------------------------------------------------------------------------

/**
 * CubeFaces23PEIllustration — shows the cube as given in the problem:
 *   Top=5, Left=4, Right=8.
 * Does NOT reveal opposite face values (that is the puzzle).
 */
export default function CubeFaces23PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'An isometric cube with the number 5 on the top face, 4 on the left face, and 8 on the right face. ' +
        'Three faces are hidden. The sums of opposite face pairs are all equal.'
      }
    >
      <svg
        viewBox={`${VBX} ${VBY} ${VBW} ${VBH}`}
        width={160}
        style={{ display: 'block', overflow: 'visible' }}
        aria-hidden="true"
      >
        <IsoCube23
          ox={0} oy={0}
          topLabel="5"
          leftLabel="4"
          rightLabel="8"
        />
      </svg>
    </div>
  )
}
