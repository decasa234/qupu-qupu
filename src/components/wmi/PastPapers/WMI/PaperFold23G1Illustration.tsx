// WMI-23F1A-Q18 (2023 Grade 1 Final) — "Fold a square paper in half left->right,
// then top->bottom. Reading from the top layer down to the bottom layer, what
// are the four numbers in order?"  Answer: 3124 (fill-in).
//
// Reconstructed from db/seed/wmi/figures/2023-final-g1-a-q18.jpg — a square cut
// into a 2x2 grid of four parts. Recovered quadrant layout (col 0 = LEFT,
// row 0 = TOP):
//
//        col0  col1
//   row0   1     3
//   row1   2     4
//
// SOLVER PROOF (two-fold simulation, confirmed against the scan's own fold
// frames + answer key):
//
//   Flat (front face up):           Each cell carries {front} number.
//        1   3
//        2   4
//
//   Fold 1 = LEFT half over to the RIGHT (L->R). The left column flips onto the
//   right column, so for each row the right number stays on top (front up) and
//   the left number lands underneath it:
//        top row  -> stack {3 on top, 1 under}
//        bot row  -> stack {4 on top, 2 under}
//   (matches the scan's middle frame: a tall 1-wide strip reading 3 over 4.)
//
//   Fold 2 = TOP half down over the BOTTOM (top->bottom). The top panel rotates
//   down over the bottom panel and inverts, so its under-layer (1) becomes the
//   topmost and its front (3) tucks just beneath it; the bottom panel keeps its
//   own order (2 over 4) below them. Reading top layer -> bottom layer:
//        3, 1, 2, 4   =>  3124  (matches the scan's final frame: 3 showing on top).
//
// The static figure (default export / stage 0) draws ONLY the flat square with
// its four numbers in place — it NEVER shows the folded stack or the answer.
// The co-exported PaperFold23G1({ stage }) primitive renders each fold step for
// the post-answer animator (0 flat, 1 after L->R, 2 after top->bottom, 3 stack).
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const PAPER = '#ECECB0' // pale-olive paper (matches the scan)
const EDGE = '#6B6B3A' // paper outline / fold creases
const INK = '#2B2622' // printed numbers
const CREASE = '#8A8A55' // dashed fold guide line

// Recovered 2x2 layout, row-major [row0col0, row0col1, row1col0, row1col1].
export const QUADRANTS = [
  ['1', '3'],
  ['2', '4'],
] as const

// Final top->bottom reading after both folds (kept here so the animator's stage 3
// stays bound to the same source of truth — never rendered in the question card).
export const STACK_TOP_TO_BOTTOM = ['3', '1', '2', '4'] as const

// ---- layout ----------------------------------------------------------------
const PAD = 14
const SQ = 120 // full square side
const HALF = SQ / 2

export type PaperFoldStage = 0 | 1 | 2 | 3

export interface PaperFold23G1Props {
  /** 0 = flat, 1 = after L->R fold, 2 = after top->bottom fold, 3 = labelled stack. */
  stage?: PaperFoldStage
}

/** A printed number centred in a region. */
function Num({ x, y, value, dim = false }: { x: number; y: number; value: string; dim?: boolean }) {
  return (
    <text
      x={x}
      y={y + 9}
      textAnchor="middle"
      fontSize="30"
      fontWeight="bold"
      fill={INK}
      opacity={dim ? 0.35 : 1}
    >
      {value}
    </text>
  )
}

// Each stage gets its own little drawing; all share the same viewBox so the
// animator can swap stages in place without the figure jumping around.
const VIEW = SQ + PAD * 2

/** Stage 0 — flat square, 2x2 grid, all four numbers visible. The question figure. */
function FlatPaper() {
  const x0 = PAD
  const y0 = PAD
  return (
    <g>
      <rect x={x0} y={y0} width={SQ} height={SQ} rx={4} fill={PAPER} stroke={EDGE} strokeWidth={2.5} />
      {/* vertical fold guide (left->right) */}
      <line x1={x0 + HALF} y1={y0} x2={x0 + HALF} y2={y0 + SQ} stroke={CREASE} strokeWidth={2} strokeDasharray="5 5" />
      {/* horizontal fold guide (top->bottom) */}
      <line x1={x0} y1={y0 + HALF} x2={x0 + SQ} y2={y0 + HALF} stroke={CREASE} strokeWidth={2} strokeDasharray="5 5" />
      {/* four printed numbers */}
      <Num x={x0 + HALF / 2} y={y0 + HALF / 2} value={QUADRANTS[0][0]} />
      <Num x={x0 + HALF + HALF / 2} y={y0 + HALF / 2} value={QUADRANTS[0][1]} />
      <Num x={x0 + HALF / 2} y={y0 + HALF + HALF / 2} value={QUADRANTS[1][0]} />
      <Num x={x0 + HALF + HALF / 2} y={y0 + HALF + HALF / 2} value={QUADRANTS[1][1]} />
    </g>
  )
}

/** Stage 1 — after L->R fold: a tall 1-wide, 2-row strip. Right column on top. */
function AfterLeftRight() {
  // centre the half-width strip horizontally
  const x0 = PAD + HALF / 2
  const y0 = PAD
  return (
    <g>
      {/* folded-under flap peeking at the left edge (shows a fold happened) */}
      <path
        d={`M${x0} ${y0 + 4} L${x0 - 12} ${y0 + 16} L${x0 - 12} ${y0 + SQ - 4} L${x0} ${y0 + SQ - 16} Z`}
        fill={PAPER}
        stroke={EDGE}
        strokeWidth={2}
        opacity={0.85}
      />
      <rect x={x0} y={y0} width={HALF} height={SQ} rx={4} fill={PAPER} stroke={EDGE} strokeWidth={2.5} />
      {/* horizontal fold guide for the next fold */}
      <line x1={x0} y1={y0 + HALF} x2={x0 + HALF} y2={y0 + HALF} stroke={CREASE} strokeWidth={2} strokeDasharray="5 5" />
      {/* top panel shows the right-top number (3), bottom panel the right-bottom (4) */}
      <Num x={x0 + HALF / 2} y={y0 + HALF / 2} value={QUADRANTS[0][1]} />
      <Num x={x0 + HALF / 2} y={y0 + HALF + HALF / 2} value={QUADRANTS[1][1]} />
    </g>
  )
}

/** Stage 2 — after top->bottom fold: a small square, top layer showing. */
function AfterTopBottom() {
  const x0 = PAD + HALF / 2
  const y0 = PAD + HALF / 2
  return (
    <g>
      {/* under-flap peeking at the bottom edge */}
      <path
        d={`M${x0 + 4} ${y0 + HALF} L${x0 + 16} ${y0 + HALF + 12} L${x0 + HALF - 4} ${y0 + HALF + 12} L${x0 + HALF - 16} ${y0 + HALF} Z`}
        fill={PAPER}
        stroke={EDGE}
        strokeWidth={2}
        opacity={0.85}
      />
      {/* under-flap peeking at the left edge (from the first fold) */}
      <path
        d={`M${x0} ${y0 + 4} L${x0 - 11} ${y0 + 15} L${x0 - 11} ${y0 + HALF - 4} L${x0} ${y0 + HALF - 14} Z`}
        fill={PAPER}
        stroke={EDGE}
        strokeWidth={2}
        opacity={0.85}
      />
      <rect x={x0} y={y0} width={HALF} height={HALF} rx={4} fill={PAPER} stroke={EDGE} strokeWidth={2.5} />
      {/* topmost layer of the stack (the under-layer that flipped to the top) */}
      <Num x={x0 + HALF / 2} y={y0 + HALF / 2} value={STACK_TOP_TO_BOTTOM[0]} />
    </g>
  )
}

/** Stage 3 — exploded stack, top layer down to bottom layer, all four numbers. */
function StackView() {
  const w = HALF
  const layerH = 26
  const gap = 8
  const totalH = layerH * 4 + gap * 3
  const x0 = (VIEW - w) / 2
  const y0 = (VIEW - totalH) / 2
  return (
    <g>
      {STACK_TOP_TO_BOTTOM.map((value, i) => {
        const y = y0 + i * (layerH + gap)
        return (
          <g key={i}>
            <rect x={x0} y={y} width={w} height={layerH} rx={4} fill={PAPER} stroke={EDGE} strokeWidth={2} />
            <text x={x0 + w / 2} y={y + layerH / 2 + 7} textAnchor="middle" fontSize="20" fontWeight="bold" fill={INK}>
              {value}
            </text>
          </g>
        )
      })}
    </g>
  )
}

/**
 * Folding-paper primitive. Pure function of `stage`. Reveals the answer ONLY at
 * stages 2/3 (the folded result), which the animator shows post-answer — the
 * default export below pins it to stage 0 so the question card never leaks it.
 */
export function PaperFold23G1({ stage = 0 }: PaperFold23G1Props = {}) {
  return (
    <svg viewBox={`0 0 ${VIEW} ${VIEW}`} width={Math.min(220, VIEW)} aria-hidden="true">
      {stage === 0 && <FlatPaper />}
      {stage === 1 && <AfterLeftRight />}
      {stage === 2 && <AfterTopBottom />}
      {stage === 3 && <StackView />}
    </svg>
  )
}

/** Default export: the flat square with its four numbers — no fold, no answer. */
export default function PaperFold23G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Kertas persegi dibagi menjadi empat bagian: di atas tertulis 1 dan 3, di bawah tertulis 2 dan 4. Lipat dua dari kiri ke kanan, lalu lipat dua dari atas ke bawah. Bacalah keempat angka dari lapisan paling atas ke lapisan paling bawah."
    >
      <PaperFold23G1 stage={0} />
    </div>
  )
}
