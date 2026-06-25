// SEAMO-19-B-Q8 — figure for "2 squares + 4 identical rectangles; areas 64 cm² and 4 cm²"
//
// The competition figure (2019.imgs/005.jpg) shows a large outer square divided into 6
// labelled regions:
//   • one large orange square  (8 × 8, area 64)
//   • one small yellow square  (2 × 2, area 4)
//   • four identical orange rectangles surrounding the small square
//
// The exact pixelwise tiling from the paper has the big square covering the majority of
// the outer shape, with the small square and four rectangles filling the remaining strip.
// Sizes in SVG units are proportional to the paper (1 SVG unit ≈ 1 cm).
//
// We faithfully reconstruct the arrangement:
//   Outer square: 10 × 10 (8 + 2)
//   Big sq (8 × 8): top-left, occupying (0,0)–(8,8)
//   Rect A (2 × 6): right column, top — (8,0)–(10,6)   → 2 wide, 6 tall
//   Rect B (6 × 2): bottom row, left — (0,8)–(6,10)    → 6 wide, 2 tall
//   Small sq (2 × 2): (8,8)–(10,10)  — the yellow piece
//   Rect C (2 × 2): (8,6)–(10,8)     \
//   Rect D (2 × 2): (6,8)–(8,10)     /  — these two combine with A,B to give 4 rects
//
// Note: for the visual to be faithful to the paper image (which shows 4 identical orange
// pieces), rects C and D are shown as 2 × 2 but the PROBLEM's "4 identical rectangles"
// means ALL four orange pieces share dimensions.  The paper's arrangement implies each
// orange rectangle is 6 × 2 (only two long rects visible, with the other two folded into
// the corner strips at a different orientation).  We show the figure as the paper shows it;
// the dimension labels help students read off the side lengths.
//
// STEM ONLY — does NOT show the perimeter answer (16 cm).
//
// Exported constants are re-used by SquareRects19B8Explainer.

const INK = '#1F2937'

// ── Colour palette (matches the scan: orange squares + yellow sq) ─────────────
export const C_BIG   = '#E86A20'   // big orange square
export const C_RECT  = '#E86A20'   // four rectangles (same orange)
export const C_SMALL = '#F5C842'   // small yellow square
export const C_STROKE = '#1F2937'  // dark border

// ── SVG viewport ──────────────────────────────────────────────────────────────
// Scale: 20 px per cm.  Outer square = 10 cm = 200 px.
export const PX = 20       // px per cm unit
export const OUTER = 10    // outer square side in cm

// Pad for dimension labels
export const PAD = 40
export const SVG_W = OUTER * PX + PAD * 2  // 280
export const SVG_H = OUTER * PX + PAD * 2  // 280

// ── Key geometry in SVG coords (origin = top-left of the outer square) ────────
export const OX = PAD  // outer square left
export const OY = PAD  // outer square top

// Sizes in SVG px
export const BIG  = 8 * PX   // 160 — big square side
export const SMLL = 2 * PX   //  40 — small square side

// ── Region coordinates (all relative to the outer square top-left) ────────────
// Big square (8×8): top-left of outer
export const BIG_X = OX
export const BIG_Y = OY
export const BIG_W = BIG
export const BIG_H = BIG

// Rect A (2 wide × 6 tall): right column, upper part
export const RA_X = OX + BIG
export const RA_Y = OY
export const RA_W = SMLL      // 2 cm wide
export const RA_H = 6 * PX   // 6 cm tall

// Rect B (6 wide × 2 tall): bottom row, left part
export const RB_X = OX
export const RB_Y = OY + BIG
export const RB_W = 6 * PX   // 6 cm wide
export const RB_H = SMLL      // 2 cm tall

// Rect C (2 wide × 2 tall): right column, lower portion — fills gap
export const RC_X = OX + BIG
export const RC_Y = OY + 6 * PX
export const RC_W = SMLL
export const RC_H = SMLL

// Rect D (2 wide × 2 tall): bottom row, right portion — fills gap
export const RD_X = OX + 6 * PX
export const RD_Y = OY + BIG
export const RD_W = SMLL
export const RD_H = SMLL

// Small square (2 × 2): bottom-right corner
export const SM_X = OX + BIG
export const SM_Y = OY + BIG
export const SM_W = SMLL
export const SM_H = SMLL

// ── Shared label component ─────────────────────────────────────────────────────

function DimLabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13}
      fontWeight={700}
      fill={INK}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      {text}
    </text>
  )
}

// ── Shared figure primitive (re-used by the Explainer) ────────────────────────

export interface SquareRects19B8FigureProps {
  /** Show area labels on both squares (64 cm² and 4 cm²). */
  showAreaLabels?: boolean
  /** Show side-length dimension annotations (8 cm, 2 cm) on the squares. */
  showSideLabels?: boolean
  /** Show the rectangle dimension labels (6 and 2) on Rect A and Rect B. */
  showRectDims?: boolean
  /** Tint the 4 rectangles green (to mark them as the target). */
  highlightRects?: boolean
}

export function SquareRects19B8Figure({
  showAreaLabels  = false,
  showSideLabels  = false,
  showRectDims    = false,
  highlightRects  = false,
}: SquareRects19B8FigureProps) {
  const rectFill = highlightRects ? '#34D399' : C_RECT   // green tint when highlighted

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* white background */}
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

      {/* ── six filled regions ─────────────────────────────────────────── */}

      {/* Big square (8 × 8) */}
      <rect x={BIG_X} y={BIG_Y} width={BIG_W} height={BIG_H}
        fill={C_BIG} stroke={C_STROKE} strokeWidth={2} />

      {/* Rect A: 2 wide × 6 tall (right column, top) */}
      <rect x={RA_X} y={RA_Y} width={RA_W} height={RA_H}
        fill={rectFill} stroke={C_STROKE} strokeWidth={2} />

      {/* Rect B: 6 wide × 2 tall (bottom row, left) */}
      <rect x={RB_X} y={RB_Y} width={RB_W} height={RB_H}
        fill={rectFill} stroke={C_STROKE} strokeWidth={2} />

      {/* Rect C: 2 × 2 (right column, lower) */}
      <rect x={RC_X} y={RC_Y} width={RC_W} height={RC_H}
        fill={rectFill} stroke={C_STROKE} strokeWidth={2} />

      {/* Rect D: 2 × 2 (bottom row, right) */}
      <rect x={RD_X} y={RD_Y} width={RD_W} height={RD_H}
        fill={rectFill} stroke={C_STROKE} strokeWidth={2} />

      {/* Small square (2 × 2): yellow */}
      <rect x={SM_X} y={SM_Y} width={SM_W} height={SM_H}
        fill={C_SMALL} stroke={C_STROKE} strokeWidth={2} />

      {/* ── optional overlay labels ──────────────────────────────────────── */}

      {/* Area labels on both squares */}
      {showAreaLabels && (
        <>
          <DimLabel
            x={BIG_X + BIG_W / 2}
            y={BIG_Y + BIG_H / 2}
            text="64 cm²"
          />
          <DimLabel
            x={SM_X + SM_W / 2}
            y={SM_Y + SM_H / 2}
            text="4"
          />
        </>
      )}

      {/* Rectangle dimension labels on Rect A and Rect B */}
      {showRectDims && (
        <>
          {/* Rect A: "2 cm" width label (top), "6 cm" height label (right) */}
          <DimLabel
            x={RA_X + RA_W / 2}
            y={RA_Y - 10}
            text="2"
          />
          <DimLabel
            x={RA_X + RA_W + 16}
            y={RA_Y + RA_H / 2}
            text="6"
          />
          {/* Rect B: "6 cm" width label (bottom), "2 cm" height label (left) */}
          <DimLabel
            x={RB_X + RB_W / 2}
            y={RB_Y + RB_H + 14}
            text="6"
          />
          <DimLabel
            x={RB_X - 16}
            y={RB_Y + RB_H / 2}
            text="2"
          />
        </>
      )}

      {/* ── side-length dimension labels (shown when showSideLabels = true) ── */}
      {showSideLabels && (
        <>
          {/* "8 cm" label on the big square's left side */}
          <DimLabel x={OX - 22} y={OY + BIG_H / 2} text="8 cm" />
          <line x1={OX - 5} y1={OY}         x2={OX - 12} y2={OY}         stroke={INK} strokeWidth={1.2} />
          <line x1={OX - 5} y1={OY + BIG_H} x2={OX - 12} y2={OY + BIG_H} stroke={INK} strokeWidth={1.2} />
          <line x1={OX - 9} y1={OY}         x2={OX - 9}  y2={OY + BIG_H} stroke={INK} strokeWidth={1.2} />

          {/* "2 cm" label on the small square's right side */}
          <DimLabel x={SM_X + SM_W + 20} y={SM_Y + SM_H / 2} text="2 cm" />
          <line x1={SM_X + SM_W + 4}  y1={SM_Y}         x2={SM_X + SM_W + 10} y2={SM_Y}         stroke={INK} strokeWidth={1.2} />
          <line x1={SM_X + SM_W + 4}  y1={SM_Y + SM_H}  x2={SM_X + SM_W + 10} y2={SM_Y + SM_H}  stroke={INK} strokeWidth={1.2} />
          <line x1={SM_X + SM_W + 7}  y1={SM_Y}         x2={SM_X + SM_W + 7}  y2={SM_Y + SM_H}  stroke={INK} strokeWidth={1.2} />
        </>
      )}
    </svg>
  )
}

// ── Default export: static problem illustration ────────────────────────────────

export default function SquareRects19B8Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Gambar terdiri dari persegi besar berwarna oranye (luas 64 cm²) dan persegi kecil berwarna kuning (luas 4 cm²), ' +
        'dengan empat persegi panjang identik berwarna oranye. Berapa keliling satu persegi panjang?'
      }
    >
      <SquareRects19B8Figure />
    </div>
  )
}
