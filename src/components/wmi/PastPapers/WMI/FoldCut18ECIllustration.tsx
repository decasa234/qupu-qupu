// IKMC-23-EC-Q18 — "Rebecca folds a square piece of paper twice. Then she cuts
// off one corner. Next, she unfolds the paper. What does the paper look like
// once unfolded?"  Answer: B — square with a diamond-shaped hole in the centre.
//
// Source figures:
//   docs/reference/ocr-res/ikmc/contest/ecolier/2023.imgs/049.jpg (stem)
//   docs/reference/ocr-res/ikmc/contest/ecolier/2023.imgs/050–054.jpg (options A–E)
//
// Fold sequence (reconstructed faithfully from 049.jpg):
//   Panel 1: square paper, horizontal dashed line across the middle, curved
//            arrow shows bottom half folds UP over the top half.
//   Panel 2: rectangle (half-height), vertical dashed line through the middle,
//            curved arrow shows right half folds LEFT over the left half.
//   Panel 3: small quarter square (four layers), diagonal dashed line at the
//            top-left corner (= the original paper's centre) with scissors.
//
// When unfolded both folds reflect the corner cut symmetrically, producing a
// diamond-shaped hole exactly at the centre of the original square (answer B).
//
// Exports:
//   default   FoldCut18ECIllustration  — stem: 3-panel fold-and-cut sequence
//   named     FoldCut18ECOption        — renders ONE unfolded-result picture (A–E)
//             + FoldCut18ECPrimitive   — shared stage-driven primitive for explainer
//
// Pure render — no Math.random, no Date, SSR-safe, no hooks.

import type { WmiChoice } from '../../../../types/wmi'

// ─── palette ────────────────────────────────────────────────────────────────
const PAPER       = '#ECECB0'   // pale-olive paper (matches PaperFold10 tokens)
const PAPER_DARK  = '#D8D880'   // folded-under flap
const EDGE        = '#6B6B3A'   // paper outline / creases
const CREASE      = '#8A8A55'   // dashed fold guide
const FOLD_ARROW  = '#3B74B0'   // curved fold arrows
const SCISSORS_C  = '#C0392B'   // scissors / cut line
const HOLE_FILL   = '#FFFFFF'   // diamond hole (white = cut-through)
const HOLE_STROKE = '#6B6B3A'   // hole border

// ─── layout ─────────────────────────────────────────────────────────────────
// Full square = SQ × SQ.  Half-width rect = SQ/2 × SQ. Quarter = SQ/2 × SQ/2.
const SQ = 64
const ARROW_W = 26
const PAD = 10

// three panels + two arrows, laid out horizontally
const P1_X = PAD
const P1_Y = PAD
const P2_X = P1_X + SQ + ARROW_W
const P2_Y = PAD + SQ / 4          // centred: rect is half height
const P3_X = P2_X + SQ / 2 + ARROW_W
const P3_Y = PAD + SQ / 4          // centred: quarter is half height & width

const STEM_W = P3_X + SQ / 2 + PAD
const STEM_H = SQ + PAD * 2

// ─── helper: right-arrow connector ──────────────────────────────────────────
function Arrow({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x + ARROW_W - 6} y2={y} stroke={EDGE} strokeWidth={2} strokeLinecap="round" />
      <polygon points={`${x + ARROW_W - 6},${y} ${x + ARROW_W - 14},${y - 5} ${x + ARROW_W - 14},${y + 5}`} fill={EDGE} />
    </g>
  )
}

// ─── helper: fold arrow (curved) ────────────────────────────────────────────
// dir 'bu' = bottom half folds UP (arc below the paper, curving up on the right)
// dir 'rl' = right half folds LEFT (arc to the right of the paper, curving left below)
function FoldArrow({ cx, cy, dir }: { cx: number; cy: number; dir: 'bu' | 'rl' }) {
  if (dir === 'bu') {
    // Arc above a horizontal midline — left end curves up to right end
    const r = 14
    const x1 = cx - r
    const x2 = cx + r
    const ay = cy
    return (
      <g>
        <path
          d={`M${x1},${ay} C${x1},${ay - 14} ${x2},${ay - 14} ${x2},${ay}`}
          fill="none" stroke={FOLD_ARROW} strokeWidth={2} strokeLinecap="round"
        />
        <polygon points={`${x2},${ay} ${x2 - 6},${ay - 8} ${x2 + 4},${ay - 9}`} fill={FOLD_ARROW} />
      </g>
    )
  }
  // 'rl': arc to the left of a vertical midline — top end curves left to bottom end
  const r = 12
  const y1 = cy - r
  const y2 = cy + r
  const ax = cx
  return (
    <g>
      <path
        d={`M${ax},${y1} C${ax - 14},${y1} ${ax - 14},${y2} ${ax},${y2}`}
        fill="none" stroke={FOLD_ARROW} strokeWidth={2} strokeLinecap="round"
      />
      <polygon points={`${ax},${y2} ${ax - 8},${y2 - 6} ${ax - 9},${y2 + 4}`} fill={FOLD_ARROW} />
    </g>
  )
}

// ─── helper: scissors glyph + dashed cut line ────────────────────────────────
// Placed at (cx,cy) with a diagonal cut going inward (toward bottom-right).
function ScissorsCut({ cx, cy, size = 10 }: { cx: number; cy: number; size?: number }) {
  return (
    <g>
      {/* dashed diagonal cut line on the paper */}
      <line
        x1={cx} y1={cy} x2={cx + size} y2={cy + size}
        stroke={SCISSORS_C} strokeWidth={1.6} strokeDasharray="3 2"
      />
      {/* scissors blades */}
      <line x1={cx - 7} y1={cy - 7} x2={cx + 1} y2={cy + 1} stroke={SCISSORS_C} strokeWidth={2.2} strokeLinecap="round" />
      <line x1={cx + 1} y1={cy - 7} x2={cx - 7} y2={cy + 1} stroke={SCISSORS_C} strokeWidth={2.2} strokeLinecap="round" />
      <circle cx={cx - 3} cy={cy - 3} r={1.8} fill={SCISSORS_C} />
    </g>
  )
}

// ─── helper: under-flap peek ────────────────────────────────────────────────
function FlapPeek({
  x, y, dir, w, h,
}: { x: number; y: number; dir: 'bottom' | 'right'; w: number; h: number }) {
  if (dir === 'bottom') {
    // flap peeking below the bottom edge
    return (
      <path
        d={`M${x + 5},${y + h} L${x + 14},${y + h + 8} L${x + w - 5},${y + h + 8} L${x + w - 14},${y + h} Z`}
        fill={PAPER_DARK} stroke={EDGE} strokeWidth={1.2} opacity={0.85}
      />
    )
  }
  // 'right': flap peeking right of the right edge
  return (
    <path
      d={`M${x + w},${y + 5} L${x + w + 8},${y + 14} L${x + w + 8},${y + h - 5} L${x + w},${y + h - 14} Z`}
      fill={PAPER_DARK} stroke={EDGE} strokeWidth={1.2} opacity={0.85}
    />
  )
}

// ─── stem panels ─────────────────────────────────────────────────────────────

/** Panel 1: full square, horizontal dashed fold line, curved arrow (bottom → up). */
function Panel1() {
  const x = P1_X
  const y = P1_Y
  const midY = y + SQ / 2
  return (
    <g>
      {/* fold arrow curving upward on the left */}
      <FoldArrow cx={x + SQ / 2} cy={midY + 2} dir="bu" />
      <rect x={x} y={y} width={SQ} height={SQ} rx={2} fill={PAPER} stroke={EDGE} strokeWidth={2} />
      {/* horizontal dashed fold line */}
      <line x1={x} y1={midY} x2={x + SQ} y2={midY} stroke={CREASE} strokeWidth={1.8} strokeDasharray="5 3" />
    </g>
  )
}

/** Panel 2: rectangle (half-height), vertical dashed fold line, arrow (right → left). */
function Panel2() {
  const x = P2_X
  const y = P2_Y
  const w = SQ
  const h = SQ / 2
  const midX = x + w / 2
  return (
    <g>
      {/* fold arrow curving leftward on the right */}
      <FoldArrow cx={midX + 2} cy={y + h / 2} dir="rl" />
      {/* under-flap at bottom showing first fold */}
      <FlapPeek x={x} y={y} dir="bottom" w={w} h={h} />
      <rect x={x} y={y} width={w} height={h} rx={2} fill={PAPER} stroke={EDGE} strokeWidth={2} />
      {/* vertical dashed fold line */}
      <line x1={midX} y1={y} x2={midX} y2={y + h} stroke={CREASE} strokeWidth={1.8} strokeDasharray="5 3" />
    </g>
  )
}

/** Panel 3: quarter square (4 layers), diagonal cut at top-left corner with scissors. */
function Panel3() {
  const x = P3_X
  const y = P3_Y
  const w = SQ / 2
  const h = SQ / 2
  const cx = 12   // corner cut size (diagonal triangle)
  return (
    <g>
      {/* under-flap at bottom (from fold 1) */}
      <FlapPeek x={x} y={y} dir="bottom" w={w} h={h} />
      {/* under-flap at right (from fold 2) */}
      <FlapPeek x={x} y={y} dir="right" w={w} h={h} />
      {/* folded square with top-left corner cut off */}
      <path
        d={`M${x + cx},${y} L${x + w},${y} L${x + w},${y + h} L${x},${y + h} L${x},${y + cx} Z`}
        fill={PAPER} stroke={EDGE} strokeWidth={2}
      />
      {/* detached corner triangle */}
      <path
        d={`M${x},${y} L${x + cx},${y} L${x},${y + cx} Z`}
        fill={PAPER} stroke={SCISSORS_C} strokeWidth={1.4} strokeDasharray="3 2" opacity={0.6}
      />
      {/* scissors at top-left corner */}
      <ScissorsCut cx={x + 1} cy={y + 1} size={cx - 2} />
    </g>
  )
}

// ─── stage-driven primitive (shared with explainer) ──────────────────────────
// stage 0 = Panel 1 only (flat square + horizontal fold line)
// stage 1 = Panel 2 only (rectangle + vertical fold line)
// stage 2 = Panel 3 only (quarter square + scissors)
// stage 3 = unfolded result: square with diamond hole (answer B)

export type FoldCut18ECStage = 0 | 1 | 2 | 3

export interface FoldCut18ECProps {
  stage?: FoldCut18ECStage
}

// Unfolded result: square with a diamond (rotated square) hole at the centre.
// The hole size corresponds to the cut triangle size when propagated through both folds.
const RESULT_SQ = 90        // side of the unfolded square in the primitive viewBox
const HOLE_HALF = 18        // half-diagonal of the diamond hole

function ResultSquare({ withHole = true }: { withHole?: boolean }) {
  const x = 5
  const y = 5
  const s = RESULT_SQ
  const cx = x + s / 2
  const cy = y + s / 2
  const h = HOLE_HALF
  // fold lines (dimmed, to show where the folds were)
  return (
    <g>
      {/* outer square */}
      <rect x={x} y={y} width={s} height={s} rx={2} fill={PAPER} stroke={EDGE} strokeWidth={2} />
      {/* dimmed fold guide lines */}
      <line x1={x} y1={cy} x2={x + s} y2={cy} stroke={CREASE} strokeWidth={1.2} strokeDasharray="4 3" opacity={0.45} />
      <line x1={cx} y1={y} x2={cx} y2={y + s} stroke={CREASE} strokeWidth={1.2} strokeDasharray="4 3" opacity={0.45} />
      {withHole && (
        /* diamond hole: a rotated square whose vertices touch the fold lines */
        <polygon
          points={`${cx},${cy - h} ${cx + h},${cy} ${cx},${cy + h} ${cx - h},${cy}`}
          fill={HOLE_FILL} stroke={HOLE_STROKE} strokeWidth={1.5}
        />
      )}
    </g>
  )
}

const PRIM_VB_W = RESULT_SQ + 10
const PRIM_VB_H = RESULT_SQ + 10

export function FoldCut18ECPrimitive({ stage = 0 }: FoldCut18ECProps = {}) {
  if (stage === 3) {
    return (
      <svg viewBox={`0 0 ${PRIM_VB_W} ${PRIM_VB_H}`} width={200} aria-hidden="true">
        <ResultSquare withHole />
      </svg>
    )
  }

  // For stages 0–2 render only the relevant panel in a dedicated viewBox
  const VB_W = STEM_W
  const VB_H = STEM_H
  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width={Math.min(240, VB_W)} aria-hidden="true">
      {stage === 0 && <Panel1 />}
      {stage === 1 && <Panel2 />}
      {stage === 2 && <Panel3 />}
    </svg>
  )
}

// ─── FoldCut18ECOption: renders ONE A–E choice picture ───────────────────────
// Options from OCR images (050–054.jpg):
//   A (050): square with SQUARE hole in centre
//   B (051): square with DIAMOND hole in centre  ← correct answer
//   C (052): octagon (corners cut off — no hole)
//   D (053): cross / plus shape
//   E (054): cross / plus with diamond hole in centre

const OPT_SQ = 64     // option square side
const OPT_PAD = 8     // padding around the option figure
const OPT_VB = OPT_SQ + OPT_PAD * 2

function OptionA() {
  // Square with a SQUARE hole in the centre
  const x = OPT_PAD
  const y = OPT_PAD
  const s = OPT_SQ
  const hs = 22   // half-side of the inner square hole
  const cx = x + s / 2
  const cy = y + s / 2
  return (
    <g>
      <rect x={x} y={y} width={s} height={s} rx={2} fill={PAPER} stroke={EDGE} strokeWidth={2} />
      {/* square hole — axis-aligned */}
      <rect x={cx - hs / 2} y={cy - hs / 2} width={hs} height={hs} fill={HOLE_FILL} stroke={HOLE_STROKE} strokeWidth={1.5} />
    </g>
  )
}

function OptionB() {
  // Square with DIAMOND hole in the centre (correct answer)
  const x = OPT_PAD
  const y = OPT_PAD
  const s = OPT_SQ
  const h = 16   // half-diagonal of diamond
  const cx = x + s / 2
  const cy = y + s / 2
  return (
    <g>
      <rect x={x} y={y} width={s} height={s} rx={2} fill={PAPER} stroke={EDGE} strokeWidth={2} />
      <polygon
        points={`${cx},${cy - h} ${cx + h},${cy} ${cx},${cy + h} ${cx - h},${cy}`}
        fill={HOLE_FILL} stroke={HOLE_STROKE} strokeWidth={1.5}
      />
    </g>
  )
}

function OptionC() {
  // Octagon (the four corners cut diagonally — no hole)
  const x = OPT_PAD
  const y = OPT_PAD
  const s = OPT_SQ
  const c = 14   // corner cut size
  return (
    <g>
      <polygon
        points={[
          `${x + c},${y}`,
          `${x + s - c},${y}`,
          `${x + s},${y + c}`,
          `${x + s},${y + s - c}`,
          `${x + s - c},${y + s}`,
          `${x + c},${y + s}`,
          `${x},${y + s - c}`,
          `${x},${y + c}`,
        ].join(' ')}
        fill={PAPER} stroke={EDGE} strokeWidth={2}
      />
    </g>
  )
}

function OptionD() {
  // Cross / plus shape (arms protrude from a central square)
  const x = OPT_PAD
  const y = OPT_PAD
  const s = OPT_SQ
  const arm = 14   // arm width
  const ext = 14   // arm extension beyond the inner square
  const cx = x + s / 2
  const cy = y + s / 2
  // Build as a plus: a horizontal rectangle ∪ a vertical rectangle
  const hx = cx - s / 2
  const hy = cy - arm / 2
  const hw = s
  const hh = arm
  const vx = cx - arm / 2
  const vy = cy - s / 2
  const vw = arm
  const vh = s
  // Use a polygon for a clean plus shape
  const left = cx - s / 2
  const right = cx + s / 2
  const top = cy - s / 2
  const bottom = cy + s / 2
  const il = cx - arm / 2   // inner left of the vertical bar
  const ir = cx + arm / 2   // inner right
  const it = cy - arm / 2   // inner top of the horizontal bar
  const ib = cy + arm / 2   // inner bottom
  // clockwise from top-left of top arm
  const pts = [
    `${il},${top}`, `${ir},${top}`, `${ir},${it}`,
    `${right},${it}`, `${right},${ib}`, `${ir},${ib}`,
    `${ir},${bottom}`, `${il},${bottom}`, `${il},${ib}`,
    `${left},${ib}`, `${left},${it}`, `${il},${it}`,
  ].join(' ')
  void hx; void hy; void hw; void hh; void vx; void vy; void vw; void vh; void ext
  return (
    <g>
      <polygon points={pts} fill={PAPER} stroke={EDGE} strokeWidth={2} />
    </g>
  )
}

function OptionE() {
  // Cross / plus with a diamond hole in the centre
  const x = OPT_PAD
  const y = OPT_PAD
  const s = OPT_SQ
  const arm = 14
  const cx = x + s / 2
  const cy = y + s / 2
  const left = cx - s / 2
  const right = cx + s / 2
  const top = cy - s / 2
  const bottom = cy + s / 2
  const il = cx - arm / 2
  const ir = cx + arm / 2
  const it = cy - arm / 2
  const ib = cy + arm / 2
  const pts = [
    `${il},${top}`, `${ir},${top}`, `${ir},${it}`,
    `${right},${it}`, `${right},${ib}`, `${ir},${ib}`,
    `${ir},${bottom}`, `${il},${bottom}`, `${il},${ib}`,
    `${left},${ib}`, `${left},${it}`, `${il},${it}`,
  ].join(' ')
  const dh = 12   // half-diagonal of diamond hole
  return (
    <g>
      <polygon points={pts} fill={PAPER} stroke={EDGE} strokeWidth={2} />
      <polygon
        points={`${cx},${cy - dh} ${cx + dh},${cy} ${cx},${cy + dh} ${cx - dh},${cy}`}
        fill={HOLE_FILL} stroke={HOLE_STROKE} strokeWidth={1.5}
      />
    </g>
  )
}

const OPTION_MAP: Record<string, () => React.JSX.Element> = {
  A: OptionA,
  B: OptionB,
  C: OptionC,
  D: OptionD,
  E: OptionE,
}

// Import React for JSX (needed in SSR context)
import React from 'react'

/** Renders ONE unfolded-result picture for choice label A/B/C/D/E. */
export function FoldCut18ECOption({ choice }: { choice: WmiChoice }) {
  const label = choice.label?.toUpperCase() ?? 'A'
  const Renderer = OPTION_MAP[label] ?? OptionA
  return (
    <svg
      viewBox={`0 0 ${OPT_VB} ${OPT_VB}`}
      width={90}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <Renderer />
    </svg>
  )
}

// ─── default export: stem illustration (3-panel fold sequence) ───────────────
export default function FoldCut18ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Rebecca folds a square piece of paper in half horizontally (bottom up), ' +
        'then in half vertically (right over left), then cuts off the top-left corner ' +
        '(which corresponds to the centre of the original square). ' +
        'Three panels show: full square with horizontal fold line, half-height rectangle ' +
        'with vertical fold line, then the quarter-size folded paper with scissors at the corner.'
      }
    >
      <svg
        viewBox={`0 0 ${STEM_W} ${STEM_H}`}
        width={Math.min(340, STEM_W)}
        aria-hidden="true"
      >
        <Panel1 />
        <Arrow x={P1_X + SQ + 2} y={PAD + SQ / 2} />
        <Panel2 />
        <Arrow x={P2_X + SQ + 2} y={PAD + SQ / 2} />
        <Panel3 />
      </svg>
    </div>
  )
}
