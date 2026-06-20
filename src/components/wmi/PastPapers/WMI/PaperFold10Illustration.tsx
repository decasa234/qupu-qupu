// IKMC-19-PE-Q10 — "Patricia folds a sheet of paper twice and then cuts it,
// as shown. How many pieces of paper does she end up with?"  Answer: B = 3.
//
// The paper figure (page 3 of IKMC-2019-Class1-2_PreEcolier.pdf) shows THREE
// panels in a horizontal sequence connected by right-arrows:
//
//   Panel 1: tall rectangle with a VERTICAL dashed fold line + curved arrow
//            (fold left half over to the right).
//   Panel 2: narrower (half-width) rectangle with a HORIZONTAL dashed fold
//            line + curved arrow (fold top half down over the bottom).
//   Panel 3: small square (quarter-size, 4 layers) with a pair of scissors
//            snipping the TOP-RIGHT CORNER diagonally.
//
// The stem shows the PROBLEM (the folded+cut state), not the answer (3 pieces).
//
// Pool reuse: exports `PaperFold10Primitive` which reuses the same paper/colour
// tokens as PaperFold23G1Illustration so both questions share the visual language.
// The primitive's `stage` prop also covers the explainer's beat-by-beat reveal.
//
// Pure render — no Math.random, no Date, SSR-safe.

const PAPER = '#ECECB0' // pale-olive paper
const PAPER_DARK = '#D8D880' // slightly darker for folded-under flaps
const EDGE = '#6B6B3A' // paper outline / fold creases
const CREASE = '#8A8A55' // dashed fold guide lines
const FOLD_ARROW = '#3B74B0' // curved fold arrow
const SCISSORS = '#C0392B' // scissors
const PIECE_A = '#F0C040' // piece colour for explainer (left piece)
const PIECE_B = '#5CB85C' // piece colour for explainer (middle piece)
const PIECE_C = '#E05050' // piece colour for explainer (right piece)

// ---- layout constants -------------------------------------------------------
const W = 60 // full-width of the unfolded rectangle
const H = 80 // full-height of the unfolded rectangle

/** Curved fold arrow drawn above a panel to indicate which way the paper folds. */
function FoldArrow({ cx, cy, dir }: { cx: number; cy: number; dir: 'lr' | 'tb' }) {
  // dir 'lr' = fold left half rightward (arrow arcs left-to-right, above the panel)
  // dir 'tb' = fold top half downward (arrow arcs top-to-bottom, left of panel)
  if (dir === 'lr') {
    // arc from upper-left to upper-right, curving upward
    const r = 18
    const x1 = cx - r
    const x2 = cx + r
    const ay = cy - 10
    return (
      <g>
        <path
          d={`M${x1},${ay} C${x1},${ay - 12} ${x2},${ay - 12} ${x2},${ay}`}
          fill="none"
          stroke={FOLD_ARROW}
          strokeWidth={2}
          strokeLinecap="round"
        />
        {/* arrowhead at right end */}
        <polygon
          points={`${x2},${ay} ${x2 - 5},${ay - 7} ${x2 + 5},${ay - 7}`}
          fill={FOLD_ARROW}
        />
      </g>
    )
  }
  // dir 'tb': arc from upper-left to lower-left, curving to the left
  const r = 16
  const y1 = cy - r
  const y2 = cy + r
  const ax = cx - 10
  return (
    <g>
      <path
        d={`M${ax},${y1} C${ax - 12},${y1} ${ax - 12},${y2} ${ax},${y2}`}
        fill="none"
        stroke={FOLD_ARROW}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* arrowhead at bottom end */}
      <polygon
        points={`${ax},${y2} ${ax - 7},${y2 - 5} ${ax - 7},${y2 + 5}`}
        fill={FOLD_ARROW}
      />
    </g>
  )
}

/** A simple right-arrow connector between panels. */
function Arrow({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x + 22} y2={y} stroke={EDGE} strokeWidth={2} strokeLinecap="round" />
      <polygon points={`${x + 22},${y} ${x + 15},${y - 5} ${x + 15},${y + 5}`} fill={EDGE} />
    </g>
  )
}

/** Scissors glyph at top-right corner of a rect, cutting diagonally. */
function Scissors({ rx, ry }: { rx: number; ry: number }) {
  // rx, ry = top-right corner of the folded square
  const x = rx + 2
  const y = ry - 10
  return (
    <g>
      {/* diagonal cut line on the paper */}
      <line
        x1={rx - 14}
        y1={ry + 14}
        x2={rx}
        y2={ry}
        stroke={SCISSORS}
        strokeWidth={1.8}
        strokeDasharray="3 2"
      />
      {/* scissors body: two blades as crossing lines */}
      <line x1={x} y1={y - 6} x2={x + 10} y2={y + 6} stroke={SCISSORS} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={x + 10} y1={y - 6} x2={x} y2={y + 6} stroke={SCISSORS} strokeWidth={2.5} strokeLinecap="round" />
      {/* pivot dot */}
      <circle cx={x + 5} cy={y} r={2} fill={SCISSORS} />
    </g>
  )
}

// ---- stages for the animator ------------------------------------------------
// stage 0 — Panel 1 only: flat rectangle + vertical fold crease + fold arrow
// stage 1 — Panel 2 only: half-width rect + horizontal fold crease + fold arrow
// stage 2 — Panel 3 only: quarter-size square + scissors
// stage 3 — Cut result (still folded, zoomed): the small square with the
//           corner clearly cut off
// stage 4 — Unfolded result: 3 separate coloured pieces

export type PaperFold10Stage = 0 | 1 | 2 | 3 | 4

export interface PaperFold10Props {
  stage?: PaperFold10Stage
}

// ---- stage sub-renderers ----------------------------------------------------

/** Stage 0: full rectangle, vertical fold crease, L->R fold arrow. */
function Stage0() {
  const x0 = 20
  const y0 = 18
  const mid = x0 + W / 2
  return (
    <g>
      <FoldArrow cx={x0 + W / 2} cy={y0} dir="lr" />
      <rect x={x0} y={y0} width={W} height={H} rx={3} fill={PAPER} stroke={EDGE} strokeWidth={2} />
      <line x1={mid} y1={y0} x2={mid} y2={y0 + H} stroke={CREASE} strokeWidth={1.8} strokeDasharray="5 4" />
    </g>
  )
}

/** Stage 1: half-width rect + flap peek left edge, horizontal fold crease, T->B fold arrow. */
function Stage1() {
  const x0 = 30
  const y0 = 18
  const w = W / 2
  const mid = y0 + H / 2
  return (
    <g>
      <FoldArrow cx={x0 - 12} cy={y0 + H / 2} dir="tb" />
      {/* folded-under flap peeking left */}
      <path
        d={`M${x0} ${y0 + 4} L${x0 - 10} ${y0 + 14} L${x0 - 10} ${y0 + H - 10} L${x0} ${y0 + H - 4} Z`}
        fill={PAPER_DARK}
        stroke={EDGE}
        strokeWidth={1.5}
        opacity={0.85}
      />
      <rect x={x0} y={y0} width={w} height={H} rx={3} fill={PAPER} stroke={EDGE} strokeWidth={2} />
      <line x1={x0} y1={mid} x2={x0 + w} y2={mid} stroke={CREASE} strokeWidth={1.8} strokeDasharray="5 4" />
    </g>
  )
}

/** Stage 2: quarter-square + scissors at top-right (cut shown but not yet separated). */
function Stage2() {
  const x0 = 25
  const y0 = 28
  const w = W / 2
  const h = H / 2
  return (
    <g>
      {/* flap peek at bottom edge */}
      <path
        d={`M${x0 + 4} ${y0 + h} L${x0 + 14} ${y0 + h + 9} L${x0 + w - 4} ${y0 + h + 9} L${x0 + w - 14} ${y0 + h} Z`}
        fill={PAPER_DARK}
        stroke={EDGE}
        strokeWidth={1.5}
        opacity={0.8}
      />
      {/* flap peek at left edge */}
      <path
        d={`M${x0} ${y0 + 4} L${x0 - 9} ${y0 + 13} L${x0 - 9} ${y0 + h - 4} L${x0} ${y0 + h - 13} Z`}
        fill={PAPER_DARK}
        stroke={EDGE}
        strokeWidth={1.5}
        opacity={0.8}
      />
      <rect x={x0} y={y0} width={w} height={h} rx={3} fill={PAPER} stroke={EDGE} strokeWidth={2} />
      <Scissors rx={x0 + w} ry={y0} />
    </g>
  )
}

/** Stage 3: zoomed-in view of the cut (small square with corner snipped off). */
function Stage3() {
  const x0 = 20
  const y0 = 18
  const w = W / 2 + 12
  const h = H / 2 + 12
  const cx = 14 // corner cut size
  return (
    <g>
      {/* flap peeks to show it is multi-layer */}
      <path
        d={`M${x0 + 4} ${y0 + h} L${x0 + 14} ${y0 + h + 10} L${x0 + w - 4} ${y0 + h + 10} L${x0 + w - 14} ${y0 + h} Z`}
        fill={PAPER_DARK}
        stroke={EDGE}
        strokeWidth={1.5}
        opacity={0.8}
      />
      <path
        d={`M${x0} ${y0 + 4} L${x0 - 10} ${y0 + 14} L${x0 - 10} ${y0 + h - 4} L${x0} ${y0 + h - 14} Z`}
        fill={PAPER_DARK}
        stroke={EDGE}
        strokeWidth={1.5}
        opacity={0.8}
      />
      {/* body with corner cut */}
      <path
        d={`M${x0} ${y0} L${x0 + w - cx} ${y0} L${x0 + w} ${y0 + cx} L${x0 + w} ${y0 + h} L${x0} ${y0 + h} Z`}
        fill={PAPER}
        stroke={EDGE}
        strokeWidth={2}
      />
      {/* detached corner triangle */}
      <path
        d={`M${x0 + w - cx} ${y0} L${x0 + w} ${y0} L${x0 + w} ${y0 + cx} Z`}
        fill={PAPER}
        stroke={SCISSORS}
        strokeWidth={1.5}
        strokeDasharray="3 2"
      />
      {/* scissors hint */}
      <Scissors rx={x0 + w} ry={y0} />
    </g>
  )
}

/** Stage 4: unfolded — three separate pieces laid out with colour. */
function Stage4() {
  // The cut at the top-right corner of the folded quarter-sheet:
  // - The corner snip cuts through ALL 4 layers → but one of those layers is the
  //   top-right fold edge itself, so when unfolded the original sheet splits into
  //   3 pieces, not 4.
  //
  // Visual: show 3 pieces side-by-side.
  // Piece A (left): tall rectangle (the left half of the original, minus top-right corner = notch top)
  //   Actually simplified: show 3 roughly-equal irregular pieces for clarity.
  //
  // Simplification for a Grade-1 kid: show 3 distinct coloured rectangles.
  const gap = 8
  const pw = 28
  const ph = 52
  const y0 = 22
  const x0 = (VIEW_W - 3 * pw - 2 * gap) / 2
  const pieces = [PIECE_A, PIECE_B, PIECE_C]
  return (
    <g>
      {pieces.map((fill, i) => {
        const x = x0 + i * (pw + gap)
        return (
          <g key={i}>
            <rect x={x} y={y0} width={pw} height={ph} rx={3} fill={fill} stroke={EDGE} strokeWidth={2} />
          </g>
        )
      })}
      {/* "3 pieces" label */}
      <text
        x={VIEW_W / 2}
        y={y0 + ph + 18}
        textAnchor="middle"
        fontSize="16"
        fontWeight="bold"
        fill={PIECE_B}
      >
        3 pieces
      </text>
    </g>
  )
}

// ---- main primitive ---------------------------------------------------------
const VIEW_W = 100
const VIEW_H = 120

/**
 * Paper-fold-and-cut primitive for IKMC-19-PE-Q10.
 * stage 0 = flat + fold crease (for explainer beat 0)
 * stage 1 = after first fold (for explainer beat 1)
 * stage 2 = after second fold + scissors (for explainer beat 2)
 * stage 3 = zoomed cut view (for explainer beat 3)
 * stage 4 = 3 unfolded pieces revealed (for explainer beat 4 — the answer)
 */
export function PaperFold10Primitive({ stage = 0 }: PaperFold10Props = {}) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width={220}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      {stage === 0 && <Stage0 />}
      {stage === 1 && <Stage1 />}
      {stage === 2 && <Stage2 />}
      {stage === 3 && <Stage3 />}
      {stage === 4 && <Stage4 />}
    </svg>
  )
}

// ---- stem illustration (default export) ------------------------------------
// Shows all three panels side-by-side: flat → first fold → second fold+cut.
// This is the PROBLEM figure, never the answer.

const STEM_W = 320
const STEM_H = 120
const P_W = W // 60 panel width
const P_H = H // 80 panel height
const ARROW_W = 28

// x-offsets for the three panels
const P1_X = 10
const P2_X = P1_X + P_W + ARROW_W + 10
const P3_X = P2_X + P_W / 2 + ARROW_W + 10

export default function PaperFold10Illustration() {
  const y0 = (STEM_H - P_H) / 2 // vertically center all panels
  const midY = STEM_H / 2

  // ---- Panel 1: full rectangle + vertical crease + fold arrow above ---------
  const p1mid = P1_X + P_W / 2

  // ---- Panel 2: half-width + flap + horizontal crease + fold arrow left -----
  const p2x = P2_X
  const p2w = P_W / 2

  // ---- Panel 3: quarter-size square + scissors at top-right -----------------
  const p3x = P3_X
  const p3w = P_W / 2
  const p3h = P_H / 2
  const p3y = (STEM_H - p3h) / 2

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Patricia melipat kertas dua kali lalu memotong sudut kanan atasnya: tampak tiga tahap — kertas utuh dengan garis lipat vertikal, kertas terlipat sekali dengan garis lipat horizontal, dan kertas terlipat dua kali dengan gunting di sudut kanan atas."
    >
      <svg
        viewBox={`0 0 ${STEM_W} ${STEM_H}`}
        width={Math.min(340, STEM_W)}
        aria-hidden="true"
      >
        {/* ---- Panel 1: flat rectangle + vertical crease ---- */}
        {/* fold arrow above */}
        <path
          d={`M${p1mid - 16},${y0 - 6} C${p1mid - 16},${y0 - 20} ${p1mid + 16},${y0 - 20} ${p1mid + 16},${y0 - 6}`}
          fill="none"
          stroke={FOLD_ARROW}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <polygon
          points={`${p1mid + 16},${y0 - 6} ${p1mid + 10},${y0 - 14} ${p1mid + 22},${y0 - 14}`}
          fill={FOLD_ARROW}
        />
        <rect x={P1_X} y={y0} width={P_W} height={P_H} rx={3} fill={PAPER} stroke={EDGE} strokeWidth={2} />
        <line
          x1={p1mid}
          y1={y0}
          x2={p1mid}
          y2={y0 + P_H}
          stroke={CREASE}
          strokeWidth={1.8}
          strokeDasharray="5 4"
        />

        {/* ---- Arrow 1 ---- */}
        <Arrow x={P1_X + P_W + 2} y={midY} />

        {/* ---- Panel 2: half-width + horizontal crease ---- */}
        {/* fold arrow at left edge, curving leftward */}
        <path
          d={`M${p2x - 8},${midY - 14} C${p2x - 22},${midY - 14} ${p2x - 22},${midY + 14} ${p2x - 8},${midY + 14}`}
          fill="none"
          stroke={FOLD_ARROW}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <polygon
          points={`${p2x - 8},${midY + 14} ${p2x - 16},${midY + 8} ${p2x - 16},${midY + 20}`}
          fill={FOLD_ARROW}
        />
        {/* under-flap peeking left */}
        <path
          d={`M${p2x} ${y0 + 4} L${p2x - 9} ${y0 + 13} L${p2x - 9} ${y0 + P_H - 9} L${p2x} ${y0 + P_H - 4} Z`}
          fill={PAPER_DARK}
          stroke={EDGE}
          strokeWidth={1.5}
          opacity={0.85}
        />
        <rect x={p2x} y={y0} width={p2w} height={P_H} rx={3} fill={PAPER} stroke={EDGE} strokeWidth={2} />
        <line
          x1={p2x}
          y1={midY}
          x2={p2x + p2w}
          y2={midY}
          stroke={CREASE}
          strokeWidth={1.8}
          strokeDasharray="5 4"
        />

        {/* ---- Arrow 2 ---- */}
        <Arrow x={p2x + p2w + 2} y={midY} />

        {/* ---- Panel 3: quarter square + scissors ---- */}
        {/* under-flap at bottom */}
        <path
          d={`M${p3x + 4} ${p3y + p3h} L${p3x + 12} ${p3y + p3h + 8} L${p3x + p3w - 4} ${p3y + p3h + 8} L${p3x + p3w - 12} ${p3y + p3h} Z`}
          fill={PAPER_DARK}
          stroke={EDGE}
          strokeWidth={1.5}
          opacity={0.8}
        />
        {/* under-flap at left */}
        <path
          d={`M${p3x} ${p3y + 4} L${p3x - 8} ${p3y + 12} L${p3x - 8} ${p3y + p3h - 4} L${p3x} ${p3y + p3h - 12} Z`}
          fill={PAPER_DARK}
          stroke={EDGE}
          strokeWidth={1.5}
          opacity={0.8}
        />
        {/* the folded square */}
        <rect x={p3x} y={p3y} width={p3w} height={p3h} rx={3} fill={PAPER} stroke={EDGE} strokeWidth={2} />
        {/* scissors at top-right corner */}
        <line
          x1={p3x + p3w - 12}
          y1={p3y + 12}
          x2={p3x + p3w}
          y2={p3y}
          stroke={SCISSORS}
          strokeWidth={1.8}
          strokeDasharray="3 2"
        />
        {/* scissors blades */}
        <line
          x1={p3x + p3w + 2}
          y1={p3y - 8}
          x2={p3x + p3w + 10}
          y2={p3y}
          stroke={SCISSORS}
          strokeWidth={2.2}
          strokeLinecap="round"
        />
        <line
          x1={p3x + p3w + 10}
          y1={p3y - 8}
          x2={p3x + p3w + 2}
          y2={p3y}
          stroke={SCISSORS}
          strokeWidth={2.2}
          strokeLinecap="round"
        />
        <circle cx={p3x + p3w + 6} cy={p3y - 4} r={2} fill={SCISSORS} />
      </svg>
    </div>
  )
}
