// OSN-08-SD-KAB-Q16 — Two parallel horizontal lines cut by a transversal + diagonal.
// Source: docs/reference/ocr-res/osn/kabupaten/sd/2008.imgs/009.jpg
//
// Problem (id): "Jika dua garis horizontal pada gambar di bawah ini sejajar,
//   maka nilai x yang memenuhi adalah …"
// Problem (en): "If the two horizontal lines in the figure below are parallel,
//   what is the value of x?"
//
// Figure: Upper horizontal line + lower horizontal line (parallel).
//   A transversal cuts both horizontals.  At the upper intersection a diagonal
//   line from the upper-left also meets.  Angles labelled:
//     "2x"  — between the diagonal and the transversal, above the upper horizontal
//     "x"   — between the transversal and the upper horizontal (interior, right side)
//     "2x"  — between the transversal and the lower horizontal (interior, left side)
//   Co-interior property: x + 2x = 180 → x = 60.
//
// Co-exports `ParallelAnglesFigure` for the explainer.
// SSR-safe: no hooks, no framer-motion, no window/document/Date/random.

// ── layout constants ──────────────────────────────────────────────────────
const W = 300, H = 220
const Y1 = 90   // upper horizontal y
const Y2 = 175  // lower horizontal y
const HX1 = 20, HX2 = 280  // horizontal extent

// Intersection point of transversal + upper horizontal
const IX = 190, IY = Y1

// Transversal: goes from upper-right down through lower horizontal
// Slope chosen so it makes a clear acute angle at both parallels.
// Angle x = 60° below upper horizontal (right side).
// tan(60°) ≈ 1.732; going downward-left so: dx negative, dy positive.
// We parameterise by a unit direction: dx = -cos60 = -0.5, dy = sin60 ≈ 0.866 (going down)
// but visual: transversal goes from top (above IY) to bottom (below Y2).
// For a 60° interior angle (between transversal going DOWN and horizontal going RIGHT),
// the transversal leans: for every 1 unit right the horizontal goes, the transversal
// goes 1/tan60 = ~0.577 units down. So going down by (Y2 - IY)=85, dx = 85/tan60 ≈ 49.
// Upper extension: continuing same direction upward from IX,IY by same slope.
const dxPerDy = 1 / Math.tan((60 * Math.PI) / 180) // ≈ 0.577

// Transversal points
const TX_UP   = IX + dxPerDy * (Y1 - 30 - IY)   // above upper horiz (negative dy → negative sign)
const TY_UP   = Y1 - 30
const TX_DOWN = IX + dxPerDy * (Y2 + 20 - IY)   // below lower horiz
const TY_DOWN = Y2 + 20

// Lower intersection
const LIX = IX + dxPerDy * (Y2 - IY)
// LIY = Y2

// Diagonal: from upper-left, meeting (IX, IY), making 2x=120° with the transversal
// above the upper horizontal. The transversal above IY goes in direction
// (TX_UP - IX, TY_UP - IY). The diagonal is rotated 120° clockwise from the
// transversal upper direction in the upper half.
// Transversal upper direction angle (from +x axis):
//   dx = TX_UP - IX = dxPerDy*(Y1-30-IY) = dxPerDy*(-30) < 0 (going left-up)
//   dy = TY_UP - IY = -30 (going up)
// atan2(-30, -dxPerDy*30): angle in Q2/Q3. Let's compute:
const tvecX = TX_UP - IX  // ≈ -17.3
const tvecY = TY_UP - IY  // = -30
const tAngle = Math.atan2(tvecY, tvecX)  // angle of transversal upper arm
// Diagonal angle = tAngle + 2x in radians (rotating by 2x clockwise = subtract for screen coords)
// 2x = 2*60° = 120° but we want the opening angle between diagonal and transversal to be 2x=120°...
// but actually angle is labeled as 2x=120° between them and angles on upper side sum to 180°.
// Simpler: diagonal from upper-left at angle 30° above horizontal to the right.
// At the intersection the diagonal goes upper-left at some angle that gives 2x between it
// and the transversal upper arm.
// The transversal upper arm direction: going up-right if dxPerDy is positive.
// Wait: TX_UP = IX + dxPerDy*(TY_UP-IY) = IX + 0.577*(-30) = IX - 17.3. So it goes UP-LEFT.
// Interior angle at upper horizontal: x = 60° between transversal (going down-right) and horizontal (going right).
// The transversal upper arm goes up-LEFT at angle 180°-60°=120° from +x axis.
// tAngle = atan2(-30, -17.3) ≈ atan(-30/-17.3) in Q3 ≈ -(180°-60°) in standard = -120° or 240°.
// For the diagonal to make 2x=120° with the transversal upper arm (measuring clockwise above horizontal):
// diagonal direction = tAngle + 120°*(π/180) going to upper-left:
const diagAngle = tAngle + (120 * Math.PI) / 180
const diagLen = 100
const DX_END = IX + Math.cos(diagAngle) * diagLen
const DY_END = IY + Math.sin(diagAngle) * diagLen

// Arc radius for angle marks
const ARC = 22

// ── arc helper ────────────────────────────────────────────────────────────
function arcD(cx: number, cy: number, r: number, a1: number, a2: number) {
  const x1 = cx + r * Math.cos(a1)
  const y1 = cy + r * Math.sin(a1)
  const x2 = cx + r * Math.cos(a2)
  const y2 = cy + r * Math.sin(a2)
  const large = Math.abs(a2 - a1) > Math.PI ? 1 : 0
  return `M${x1},${y1} A${r},${r},0,${large},1,${x2},${y2}`
}

// ── figure component ──────────────────────────────────────────────────────
export interface ParallelAnglesFigureProps {
  /** Highlight the co-interior angles in amber. */
  highlightCoInterior?: boolean
  /** Show the answer label (x = 60°) instead of algebraic labels. */
  showAnswer?: boolean
  /** Flash the co-interior angles with a coloured fill to show they sum to 180°. */
  fillCoInterior?: boolean
}

export function ParallelAnglesFigure({
  highlightCoInterior = false,
  showAnswer = false,
  fillCoInterior = false,
}: ParallelAnglesFigureProps) {
  const BLUE    = '#1E3A5F'
  const AMBER   = '#D97706'
  const GREEN   = '#059669'
  const lineClr = BLUE
  const xLabel  = showAnswer ? '60°' : 'x'
  const x2Label = showAnswer ? '120°' : '2x'

  // Transversal upper arm direction for the 2x arc above upper horizontal
  // 2x arc: between diagonal direction and transversal-upper direction
  const diagDir = diagAngle                             // direction of diagonal from intersection
  const transUpDir = Math.atan2(tvecY, tvecX)          // up-left arm of transversal
  // Arc for 2x (above upper horiz): from transUpDir to diagDir (counter-clockwise in SVG = clockwise in math)
  // We want the arc in the region above the upper horizontal between the two lines.
  const arc2xAbove = arcD(IX, IY, ARC, transUpDir, diagDir)

  // x arc: below upper horizontal, between transversal-down direction and horizontal-right direction
  const transDownDir = Math.atan2(TY_DOWN - IY, TX_DOWN - IX)  // down-right
  const horizRightDir = 0  // +x direction
  const arcX = arcD(IX, IY, ARC + 4, transDownDir, horizRightDir)

  // 2x arc at lower intersection: above lower horizontal, between horiz-left and transversal-up-from-lower
  const lTransUpDir = Math.atan2(IY - Y2, IX - LIX)  // direction from lower intersection toward upper horiz
  const horizLeftDir = Math.PI  // −x direction
  const arc2xLower = arcD(LIX, Y2, ARC, lTransUpDir, horizLeftDir)

  // Tick marks on horizontals (parallel indicator)
  const tick = (x: number, y: number) => (
    <>
      <line x1={x - 0} y1={y - 5} x2={x - 0} y2={y + 5} stroke={BLUE} strokeWidth={1.5} />
      <line x1={x + 4} y1={y - 5} x2={x + 4} y2={y + 5} stroke={BLUE} strokeWidth={1.5} />
    </>
  )

  const coColor = highlightCoInterior ? AMBER : BLUE
  const fillOpacity = fillCoInterior ? 0.15 : 0

  // Fill polygon for x angle (interior at upper horiz)
  // Triangle: IX,IY → IX+ARC+4,IY → arc endpoint
  // Approximate with a small triangle for the fill
  const fillXPts = [
    [IX, IY],
    [IX + (ARC + 4), IY],
    [IX + (ARC + 4) * Math.cos(transDownDir), IY + (ARC + 4) * Math.sin(transDownDir)],
  ].map((p) => p.join(',')).join(' ')

  const fill2xLowerPts = [
    [LIX, Y2],
    [LIX - (ARC), Y2],
    [LIX + (ARC) * Math.cos(lTransUpDir), Y2 + (ARC) * Math.sin(lTransUpDir)],
  ].map((p) => p.join(',')).join(' ')

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: W }}
      aria-label="Dua garis horizontal sejajar dipotong transversal; sudut x, 2x, 2x ditandai"
    >
      {/* Parallel horizontal lines */}
      <line x1={HX1} y1={Y1} x2={HX2} y2={Y1} stroke={lineClr} strokeWidth={2} />
      <line x1={HX1} y1={Y2} x2={HX2} y2={Y2} stroke={lineClr} strokeWidth={2} />
      {/* Parallel tick marks */}
      {tick(70, Y1)}
      {tick(70, Y2)}

      {/* Transversal */}
      <line x1={TX_UP} y1={TY_UP} x2={TX_DOWN} y2={TY_DOWN} stroke={lineClr} strokeWidth={2} />

      {/* Diagonal line from upper-left */}
      <line x1={DX_END} y1={DY_END} x2={IX} y2={IY} stroke={lineClr} strokeWidth={2} />

      {/* Co-interior angle fills */}
      <polygon points={fillXPts}      fill={AMBER} opacity={fillOpacity} />
      <polygon points={fill2xLowerPts} fill={AMBER} opacity={fillOpacity} />

      {/* Angle arcs */}
      {/* 2x arc above upper horiz (between diagonal and transversal upper arm) */}
      <path d={arc2xAbove} fill="none" stroke={BLUE} strokeWidth={1.4} />
      {/* x arc below upper horiz (between transversal and horizontal right) */}
      <path d={arcX} fill="none" stroke={coColor} strokeWidth={1.4} />
      {/* 2x arc above lower horiz (between horiz-left and transversal) */}
      <path d={arc2xLower} fill="none" stroke={coColor} strokeWidth={1.4} />

      {/* Labels */}
      {/* 2x above upper horiz */}
      <text
        x={IX - 28}
        y={IY - 20}
        fontSize={13}
        fill={BLUE}
        fontFamily="sans-serif"
        textAnchor="middle"
      >
        {x2Label}
      </text>
      {/* x below upper horiz */}
      <text
        x={IX + 30}
        y={IY + 22}
        fontSize={13}
        fill={coColor}
        fontFamily="sans-serif"
        textAnchor="middle"
      >
        {xLabel}
      </text>
      {/* 2x above lower horiz */}
      <text
        x={LIX - 30}
        y={Y2 - 18}
        fontSize={13}
        fill={coColor}
        fontFamily="sans-serif"
        textAnchor="middle"
      >
        {x2Label}
      </text>

      {/* Answer callout */}
      {showAnswer && (
        <text
          x={W / 2}
          y={H - 10}
          fontSize={14}
          fill={GREEN}
          fontFamily="sans-serif"
          fontWeight="bold"
          textAnchor="middle"
        >
          x = 60°
        </text>
      )}
    </svg>
  )
}

// ── default export (stem illustration — shows problem, not answer) ─────────
export default function ParallelAnglesOSN08KQ16Illustration() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
      <ParallelAnglesFigure />
    </div>
  )
}
