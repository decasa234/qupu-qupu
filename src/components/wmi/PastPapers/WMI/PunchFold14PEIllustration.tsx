// IKMC-23-PE-Q14 — "A sheet of paper is folded in half. Square and round holes
// are punched. How does the sheet look after it is unfolded again?" Answer: B.
//
// Source figures:
//   Stem:   docs/reference/ocr-res/ikmc/contest/preecolier/2023.imgs/032.jpg
//   Opt A:  033.jpg  Opt B: 034.jpg  Opt C: 035.jpg  Opt D: 036.jpg  Opt E: 037.jpg
//
// The stem (032) shows TWO panels with a right-arrow between them:
//   Left panel:  full square sheet with a vertical dashed fold line in the centre.
//   Right panel: the RIGHT half of the paper (the left half folded over to the
//                right). Only the right half is visible. The fold creates a dashed
//                line on the right edge. Two holes are punched on this half:
//                  • round hole (circle) — upper area of the right half
//                  • square hole — lower area of the right half
//
// When unfolded the fold line is the mirror axis (vertical):
//   • round hole appears UPPER-LEFT and UPPER-RIGHT (mirrored)
//   • square hole appears LOWER-LEFT and LOWER-RIGHT (mirrored)
// → This is option B.
//
// Pool reuse: adapted from PaperFold10Illustration (same paper colour tokens,
// same fold-arrow idiom, same panel + arrow layout). The co-exported primitive
// PunchFold14PEPrimitive drives the explainer beat-by-beat; the co-exported
// PunchFold14PEOption renders each A–E answer choice for CHOICE_RENDERERS.
//
// Pure render — no Math.random, no Date, SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ── colour tokens (same as PaperFold10) ─────────────────────────────────────
const PAPER      = '#ECECB0'   // pale-olive paper
const PAPER_DARK = '#D8D880'   // folded-under flap
const EDGE       = '#6B6B3A'   // outlines / fold crease dashes
const CREASE     = '#8A8A55'   // dashed fold guide
const FOLD_ARROW = '#3B74B0'   // curved fold arrow
const HOLE_FILL  = '#1A1A1A'   // punched-through hole interior

// ── layout ──────────────────────────────────────────────────────────────────
// A square sheet – both panels W×W.
const W = 70   // full sheet width = height
const ARROW_W = 26

// Positions for the two panels in the stem SVG.
const STEM_W   = W + ARROW_W + W / 2 + 16  // full + arrow + half-sheet + pad
const STEM_H   = W + 16
const P1_X = 4
const P1_Y = 8
// After fold we show the right half of the sheet (width W/2).
const P2_X = P1_X + W + ARROW_W + 4
const P2_Y = P1_Y
const P2_W = W / 2

// Punch-hole positions on the FOLDED half (relative to P2_X, P2_Y).
// Upper area → circle; lower area → square.
const HOLE_CX = P2_W * 0.5          // horizontal centre of the half-sheet
const HOLE_CY_CIRCLE = W * 0.28     // upper
const HOLE_CY_SQ     = W * 0.68     // lower
const SQ_HALF = 7                    // half-size of the square hole

// ── helpers ─────────────────────────────────────────────────────────────────
/** A right-pointing arrow connecting the two panels. */
function Arrow({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x + ARROW_W - 6} y2={y} stroke={EDGE} strokeWidth={2} strokeLinecap="round" />
      <polygon points={`${x + ARROW_W - 6},${y} ${x + ARROW_W - 14},${y - 5} ${x + ARROW_W - 14},${y + 5}`} fill={EDGE} />
    </g>
  )
}

/** Curved fold arrow above / to the left-of a panel indicating fold direction. */
function FoldArrow({ cx, cy }: { cx: number; cy: number }) {
  // Arc above the top edge, curving left-to-right (fold left half over right).
  const r = 16
  const x1 = cx - r
  const x2 = cx + r
  const ay = cy - 8
  return (
    <g>
      <path
        d={`M${x1},${ay} C${x1},${ay - 14} ${x2},${ay - 14} ${x2},${ay}`}
        fill="none"
        stroke={FOLD_ARROW}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* arrowhead at right end */}
      <polygon points={`${x2},${ay} ${x2 - 5},${ay - 8} ${x2 + 5},${ay - 8}`} fill={FOLD_ARROW} />
    </g>
  )
}

// ── primitive stages ─────────────────────────────────────────────────────────
// stage 0 — full sheet, vertical fold crease, fold arrow above
// stage 1 — folded half with two punch holes
// stage 2 — unfolded result (correct pattern: 2 circles + 2 squares mirrored)

export type PunchFold14PEStage = 0 | 1 | 2

export interface PunchFold14PEPrimitiveProps {
  stage?: PunchFold14PEStage
}

const VB_W = 110
const VB_H = 100

/** Stage 0: flat square sheet with vertical fold crease. */
function Stage0() {
  const x0 = (VB_W - W) / 2
  const y0 = (VB_H - W) / 2
  const midX = x0 + W / 2
  return (
    <g>
      <FoldArrow cx={x0 + W / 2} cy={y0} />
      <rect x={x0} y={y0} width={W} height={W} rx={3} fill={PAPER} stroke={EDGE} strokeWidth={2} />
      {/* vertical fold crease */}
      <line x1={midX} y1={y0} x2={midX} y2={y0 + W} stroke={CREASE} strokeWidth={1.8} strokeDasharray="5 4" />
    </g>
  )
}

/** Stage 1: right half of the paper after folding (left half folded over right).
 *  Shows the two punched holes on the visible face. */
function Stage1() {
  const hw = W / 2
  const x0 = (VB_W - hw) / 2
  const y0 = (VB_H - W) / 2
  return (
    <g>
      {/* folded-under flap peeking from the left edge */}
      <path
        d={`M${x0} ${y0 + 5} L${x0 - 9} ${y0 + 14} L${x0 - 9} ${y0 + W - 14} L${x0} ${y0 + W - 5} Z`}
        fill={PAPER_DARK}
        stroke={EDGE}
        strokeWidth={1.5}
        opacity={0.85}
      />
      {/* half-sheet body */}
      <rect x={x0} y={y0} width={hw} height={W} rx={3} fill={PAPER} stroke={EDGE} strokeWidth={2} />
      {/* dashed line on right edge marks the original fold */}
      <line
        x1={x0 + hw}
        y1={y0}
        x2={x0 + hw}
        y2={y0 + W}
        stroke={CREASE}
        strokeWidth={1.8}
        strokeDasharray="5 4"
      />
      {/* round hole — upper */}
      <circle
        cx={x0 + hw * 0.5}
        cy={y0 + W * 0.28}
        r={7}
        fill={HOLE_FILL}
      />
      {/* square hole — lower */}
      <rect
        x={x0 + hw * 0.5 - 6}
        y={y0 + W * 0.68 - 6}
        width={12}
        height={12}
        fill={HOLE_FILL}
      />
    </g>
  )
}

/** Stage 2: unfolded result — option B pattern.
 *  Vertical fold crease shown; circles upper-left + upper-right, squares lower-left + lower-right. */
function Stage2() {
  const x0 = (VB_W - W) / 2
  const y0 = (VB_H - W) / 2
  const midX = x0 + W / 2

  // Mirror positions: left half mirrors the right half across the fold line.
  const qx = W * 0.25  // horizontal offset from midX (both directions)
  const cy_circ = y0 + W * 0.28
  const cy_sq   = y0 + W * 0.68

  return (
    <g>
      <rect x={x0} y={y0} width={W} height={W} rx={3} fill={PAPER} stroke={EDGE} strokeWidth={2} />
      {/* fold crease (dashed centre) */}
      <line x1={midX} y1={y0} x2={midX} y2={y0 + W} stroke={CREASE} strokeWidth={1.8} strokeDasharray="5 4" />
      {/* round holes – left and right */}
      <circle cx={midX - qx} cy={cy_circ} r={7} fill={HOLE_FILL} />
      <circle cx={midX + qx} cy={cy_circ} r={7} fill={HOLE_FILL} />
      {/* square holes – left and right */}
      <rect x={midX - qx - 6} y={cy_sq - 6} width={12} height={12} fill={HOLE_FILL} />
      <rect x={midX + qx - 6} y={cy_sq - 6} width={12} height={12} fill={HOLE_FILL} />
    </g>
  )
}

/**
 * PunchFold14PEPrimitive — drives all three stages for the explainer.
 * stage 0 = flat sheet (plan)
 * stage 1 = folded, holes punched
 * stage 2 = unfolded result (answer B)
 */
export function PunchFold14PEPrimitive({ stage = 0 }: PunchFold14PEPrimitiveProps = {}) {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={200}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      {stage === 0 && <Stage0 />}
      {stage === 1 && <Stage1 />}
      {stage === 2 && <Stage2 />}
    </svg>
  )
}

// ── option patterns (A–E) ─────────────────────────────────────────────────────
// Positions expressed relative to a W×W square, midX = W/2.
// Each hole is described by { shape, cx_offset, cy } where:
//   cx_offset is measured FROM the centre (positive = right of fold).
//   cy is absolute (0..W).
// Circle holes: shape 'circle', radius 7.
// Square holes: shape 'square', half-side 6.

const QX = W * 0.25   // standard horizontal offset from centre

interface HoleDef {
  shape: 'circle' | 'square'
  cx_offset: number   // from midX
  cy: number          // absolute y within W
}

/** True unfolded pattern for each option.
 *  Derived directly from the scan crops. */
const OPTION_HOLES: Record<string, HoleDef[]> = {
  // A: circles top-left + top-right, squares bottom-left + bottom-right
  //    BUT the squares are very close to the fold line (nearly touching).
  A: [
    { shape: 'circle', cx_offset: -QX,  cy: W * 0.25 },
    { shape: 'circle', cx_offset: +QX,  cy: W * 0.25 },
    { shape: 'square', cx_offset: -QX * 0.4, cy: W * 0.72 },
    { shape: 'square', cx_offset: +QX * 0.4, cy: W * 0.72 },
  ],
  // B (CORRECT): circles upper-left + upper-right, squares lower-left + lower-right,
  //    all at standard QX offset from fold line.
  B: [
    { shape: 'circle', cx_offset: -QX,  cy: W * 0.27 },
    { shape: 'circle', cx_offset: +QX,  cy: W * 0.27 },
    { shape: 'square', cx_offset: -QX,  cy: W * 0.68 },
    { shape: 'square', cx_offset: +QX,  cy: W * 0.68 },
  ],
  // C: diagonal asymmetric pattern — circle top-left, square mid-left,
  //    square bottom-right, circle bottom-right (not symmetric across fold).
  C: [
    { shape: 'circle', cx_offset: -QX,  cy: W * 0.25 },
    { shape: 'square', cx_offset: -QX,  cy: W * 0.60 },
    { shape: 'square', cx_offset: +QX,  cy: W * 0.40 },
    { shape: 'circle', cx_offset: +QX,  cy: W * 0.72 },
  ],
  // D: circles top (higher up, close together), squares bottom (wider apart).
  D: [
    { shape: 'circle', cx_offset: -QX * 0.55, cy: W * 0.22 },
    { shape: 'circle', cx_offset: +QX * 0.55, cy: W * 0.22 },
    { shape: 'square', cx_offset: -QX,        cy: W * 0.68 },
    { shape: 'square', cx_offset: +QX,        cy: W * 0.68 },
  ],
  // E: circles top, squares bottom — similar to B/D but circles positioned higher
  //    and squares slightly lower.
  E: [
    { shape: 'circle', cx_offset: -QX,  cy: W * 0.22 },
    { shape: 'circle', cx_offset: +QX,  cy: W * 0.22 },
    { shape: 'square', cx_offset: -QX,  cy: W * 0.72 },
    { shape: 'square', cx_offset: +QX,  cy: W * 0.72 },
  ],
}

const OPTION_ARIA: Record<string, string> = {
  A: 'Option A: two circles upper area (near fold), two squares lower area (very close to fold line)',
  B: 'Option B: two circles upper-left and upper-right, two squares lower-left and lower-right, each at the same distance from the fold — the correct unfolded pattern',
  C: 'Option C: diagonal pattern — circle and square on each side but at different heights',
  D: 'Option D: two circles near top centre, two squares lower with wider spread',
  E: 'Option E: two circles at top, two squares at bottom — similar to B but circles higher',
}

// ── OptionSVG internal helper ─────────────────────────────────────────────────
/** Renders one option's paper + fold crease + holes in a W×W viewBox. */
function OptionPaper({ label }: { label: string }) {
  const holes = OPTION_HOLES[label]
  if (!holes) return null
  const midX = W / 2
  return (
    <svg
      viewBox={`0 0 ${W} ${W}`}
      width={80}
      aria-hidden="true"
    >
      {/* paper body */}
      <rect x={0} y={0} width={W} height={W} rx={3} fill={PAPER} stroke={EDGE} strokeWidth={1.5} />
      {/* fold crease (dashed vertical centre) */}
      <line x1={midX} y1={0} x2={midX} y2={W} stroke={CREASE} strokeWidth={1.5} strokeDasharray="4 3" />
      {/* holes */}
      {holes.map((h, i) => {
        const cx = midX + h.cx_offset
        const cy = h.cy
        if (h.shape === 'circle') {
          return <circle key={i} cx={cx} cy={cy} r={6} fill={HOLE_FILL} />
        }
        return (
          <rect
            key={i}
            x={cx - 5.5}
            y={cy - 5.5}
            width={11}
            height={11}
            fill={HOLE_FILL}
          />
        )
      })}
    </svg>
  )
}

/**
 * PunchFold14PEOption — renders ONE A/B/C/D/E answer choice as an SVG paper
 * figure showing the unfolded hole pattern.
 * Registered in CHOICE_RENDERERS for IKMC-23-PE-Q14.
 */
export function PunchFold14PEOption({ choice }: { choice: WmiChoice }) {
  const label = choice.label
  if (!OPTION_HOLES[label]) return <span>{choice.text}</span>
  return (
    <span
      role="img"
      aria-label={OPTION_ARIA[label] ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <OptionPaper label={label} />
    </span>
  )
}

// ── stem illustration (default export) ───────────────────────────────────────
/**
 * PunchFold14PEIllustration — the PROBLEM figure for IKMC-23-PE-Q14.
 * Shows two panels: full square sheet with fold crease → folded half with
 * circle and square punch holes.
 * Does NOT show the unfolded answer.
 */
export default function PunchFold14PEIllustration() {
  const midY = STEM_H / 2

  // Panel 1: full square
  const p1cx = P1_X + W / 2  // fold arrow anchor

  // Panel 2: right half shown after folding
  const p2hw = P2_W

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'A square sheet of paper with a vertical dashed fold line in the centre. ' +
        'After folding in half, the right half shows a round hole in the upper area ' +
        'and a square hole in the lower area.'
      }
    >
      <svg
        viewBox={`0 0 ${STEM_W} ${STEM_H}`}
        width={Math.min(320, STEM_W * 3)}
        aria-hidden="true"
      >
        {/* ── Panel 1: flat sheet with vertical fold crease ── */}
        {/* fold arrow above */}
        <path
          d={`M${p1cx - 14},${P1_Y - 5} C${p1cx - 14},${P1_Y - 18} ${p1cx + 14},${P1_Y - 18} ${p1cx + 14},${P1_Y - 5}`}
          fill="none"
          stroke={FOLD_ARROW}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <polygon
          points={`${p1cx + 14},${P1_Y - 5} ${p1cx + 8},${P1_Y - 14} ${p1cx + 20},${P1_Y - 14}`}
          fill={FOLD_ARROW}
        />
        <rect x={P1_X} y={P1_Y} width={W} height={W} rx={3} fill={PAPER} stroke={EDGE} strokeWidth={2} />
        <line
          x1={P1_X + W / 2}
          y1={P1_Y}
          x2={P1_X + W / 2}
          y2={P1_Y + W}
          stroke={CREASE}
          strokeWidth={1.8}
          strokeDasharray="5 4"
        />

        {/* ── Arrow ── */}
        <Arrow x={P1_X + W + 2} y={midY} />

        {/* ── Panel 2: folded half (right half visible) ── */}
        {/* under-flap peeking left */}
        <path
          d={`M${P2_X} ${P2_Y + 5} L${P2_X - 8} ${P2_Y + 14} L${P2_X - 8} ${P2_Y + W - 14} L${P2_X} ${P2_Y + W - 5} Z`}
          fill={PAPER_DARK}
          stroke={EDGE}
          strokeWidth={1.5}
          opacity={0.85}
        />
        <rect x={P2_X} y={P2_Y} width={p2hw} height={W} rx={3} fill={PAPER} stroke={EDGE} strokeWidth={2} />
        {/* dashed right edge = original fold */}
        <line
          x1={P2_X + p2hw}
          y1={P2_Y}
          x2={P2_X + p2hw}
          y2={P2_Y + W}
          stroke={CREASE}
          strokeWidth={1.8}
          strokeDasharray="5 4"
        />
        {/* round hole — upper */}
        <circle
          cx={P2_X + HOLE_CX}
          cy={P2_Y + HOLE_CY_CIRCLE}
          r={7}
          fill={HOLE_FILL}
        />
        {/* square hole — lower */}
        <rect
          x={P2_X + HOLE_CX - SQ_HALF}
          y={P2_Y + HOLE_CY_SQ - SQ_HALF}
          width={SQ_HALF * 2}
          height={SQ_HALF * 2}
          fill={HOLE_FILL}
        />
      </svg>
    </div>
  )
}
