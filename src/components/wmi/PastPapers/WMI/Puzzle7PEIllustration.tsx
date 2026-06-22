// IKMC-22-PE-Q7 — "Peter puts the 4 puzzle pieces shown together to make a square.
// Which picture can he make?"
//
// Stem: four standard jigsaw-style pieces laid out side-by-side. Each piece is a
// blue square with one interlocking tab/notch edge. Together they form a 2×2 grid.
// The artwork on the pieces is blue with yellow and white shapes — when assembled
// the white circle (notch on pieces 1 and 2) centres on a yellow crescent (answer B).
//
// Co-exports:
//   Puzzle7PEOption   — renders ONE answer choice (A–E) for CHOICE_RENDERERS.
//
// Pure SVG, no raster, no random, no Date, SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ── colour tokens ────────────────────────────────────────────────────────────
const BLUE   = '#0B3D91'   // deep kangaroo blue (puzzle body)
const YELLOW = '#F5C518'   // golden yellow (the crescent / shapes)
const WHITE  = '#FFFFFF'   // circle cutout
const INK    = '#1A2B5A'   // outline
const BG     = '#F8FAFC'   // card background

// ── shared viewBox constants ─────────────────────────────────────────────────
// Each piece cell is 60×60 inside a 64×64 bounding box (2 px margin each side).
const S = 60   // piece side length in SVG units
const TAB = 10 // tab radius
const TAB_H = 10 // tab protrusion height
const PAD = 4   // margin around piece

// ── Tab-and-notch path builders ──────────────────────────────────────────────
// Each piece is a square with jigsaw tabs on some edges.
// Convention: tabs protrude OUT, notches cut IN.
// For simplicity we use a single arc-bump per active edge.

/**
 * Build the SVG path for a jigsaw piece.
 * edges: which edges have a TAB (protrusion): 'right' | 'bottom'
 * The left and top edges always have notches (mirror of adjacent piece's tab).
 */
function piecePath(x: number, y: number, tabRight: boolean, tabBottom: boolean): string {
  const x2 = x + S
  const y2 = y + S
  const mx = x + S / 2
  const my = y + S / 2
  const tr = TAB  // arc radius for tab

  // Top edge: notch in (goes inward)
  const topNotchX = mx
  const topNotchY1 = y
  const topNotchYm = y + TAB_H  // deepest notch point

  // Left edge: notch in
  const leftNotchY = my
  const leftNotchX1 = x
  const leftNotchXm = x + TAB_H

  // Right edge: tab out or straight
  const rightTabY = my
  const rightTabX2 = x2 + (tabRight ? TAB_H : 0)

  // Bottom edge: tab out or straight
  const botTabX = mx
  const botTabY2 = y2 + (tabBottom ? TAB_H : 0)

  // Build path as: start at top-left, go clockwise
  // Top edge (with notch going inward):
  //   TL → notch-start → arc down → arc up → TR
  const topLeft  = `M ${x},${y}`
  // top edge left half
  const top1 = `L ${topNotchX - tr},${topNotchY1}`
  // notch arc (goes inward then back out)
  const topNotch = `Q ${topNotchX},${topNotchYm} ${topNotchX + tr},${topNotchY1}`
  // top edge right half
  const top2 = `L ${x2},${y}`

  // Right edge
  let rightEdge: string
  if (tabRight) {
    rightEdge = `L ${x2},${rightTabY - tr} Q ${rightTabX2},${rightTabY} ${x2},${rightTabY + tr} L ${x2},${y2}`
  } else {
    rightEdge = `L ${x2},${y2}`
  }

  // Bottom edge (with tab going outward if tabBottom, else straight)
  let botEdge: string
  if (tabBottom) {
    botEdge = `L ${botTabX + tr},${y2} Q ${botTabX},${botTabY2} ${botTabX - tr},${y2} L ${x},${y2}`
  } else {
    botEdge = `L ${x},${y2}`
  }

  // Left edge (with notch going inward)
  const leftEdge = `L ${leftNotchX1},${leftNotchY + tr} Q ${leftNotchXm},${leftNotchY} ${leftNotchX1},${leftNotchY - tr} L ${x},${y}`

  return [topLeft, top1, topNotch, top2, rightEdge, botEdge, leftEdge, 'Z'].join(' ')
}

// ── Artwork (clip shapes on each piece) ─────────────────────────────────────
// The 4 pieces together tile into a 2×2 square whose artwork forms a crescent:
//   - A white circle centred at (S, S) (the join point of all 4 pieces)
//   - A yellow disc centred slightly above-right of the white circle
//   → yellow disc minus white circle = crescent moon (= answer B)
//
// Piece layout (indices 0–3):
//   0 = top-left,  1 = top-right
//   2 = bottom-left, 3 = bottom-right
//
// We clip artwork to each piece's rectangle.

interface PieceArtworkProps {
  // offset of this piece in the 4-piece grid
  pieceCol: number
  pieceRow: number
}

// The crescent is built from:
//   yellow disc: center (cx, cy) radius R
//   white circle: center (wx, wy) radius r  (cx + dx, cy + dy)
// In the assembled 2×2 (total 2S × 2S), the white circle is centred at (S, S).
const ASSEMBLE_CX = S        // white circle centre x in assembled coords
const ASSEMBLE_CY = S        // white circle centre y in assembled coords
const WHITE_R = S * 0.28     // white circle radius
const YELLOW_R = S * 0.38    // yellow disc radius
// yellow disc centre is offset from white circle
const YELLOW_CX = S - S * 0.14   // slightly left of centre
const YELLOW_CY = S - S * 0.18   // slightly above centre

function PieceArtwork({ pieceCol, pieceRow }: PieceArtworkProps) {
  // In local piece coords (0..S × 0..S), the assembled grid offset is:
  const ox = pieceCol * S   // x offset of this piece in assembled coords
  const oy = pieceRow * S   // y offset

  // Transform assembled coords to local piece coords
  const wCx = ASSEMBLE_CX - ox
  const wCy = ASSEMBLE_CY - oy
  const yCx = YELLOW_CX - ox
  const yCy = YELLOW_CY - oy

  return (
    <>
      {/* yellow disc */}
      <circle cx={yCx} cy={yCy} r={YELLOW_R} fill={YELLOW} />
      {/* white circle punches out the crescent */}
      <circle cx={wCx} cy={wCy} r={WHITE_R} fill={WHITE} />
    </>
  )
}

// ── PIECE definitions ─────────────────────────────────────────────────────────
// We render 4 pieces in a horizontal row (separated by a small gap).
// Each piece has:
//   - a coloured body (blue)
//   - artwork clipped to its cell rectangle
//   - tab on right edge for pieces 0, 2; tab on bottom for pieces 2, 3

interface PieceDef {
  col: number  // 0 or 1 in assembled grid
  row: number  // 0 or 1 in assembled grid
  tabRight: boolean
  tabBottom: boolean
}

const PIECE_DEFS: PieceDef[] = [
  { col: 0, row: 0, tabRight: true,  tabBottom: true  },  // top-left
  { col: 1, row: 0, tabRight: false, tabBottom: true  },  // top-right
  { col: 0, row: 1, tabRight: true,  tabBottom: false },  // bottom-left
  { col: 1, row: 1, tabRight: false, tabBottom: false },  // bottom-right
]

// Layout: pieces rendered in a row with 12 px gaps, clipping to piece boundary
const PIECE_GAP = 12
const PIECE_W = S + TAB_H + PAD  // max width including tab (right or bottom)
const PIECE_H = S + TAB_H + PAD

const TOTAL_W = PIECE_DEFS.length * PIECE_W + (PIECE_DEFS.length - 1) * PIECE_GAP
const TOTAL_H = PIECE_H + 4

// ── Illustration: 4 pieces side-by-side ─────────────────────────────────────

/**
 * Puzzle7PEIllustration — shows the 4 puzzle pieces from the stem.
 * Does NOT show the answer.
 */
export default function Puzzle7PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Four blue jigsaw puzzle pieces with yellow and white artwork. When assembled they form a square."
    >
      <svg
        viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`}
        width={Math.min(TOTAL_W * 2, 380)}
        height={Math.min(TOTAL_H * 2, 95)}
        aria-hidden="true"
        style={{ display: 'block', maxWidth: '100%' }}
      >
        {PIECE_DEFS.map((def, i) => {
          const px = i * (PIECE_W + PIECE_GAP) + PAD
          const py = PAD
          const clipId = `p7stem-clip-${i}`

          return (
            <g key={i}>
              <defs>
                <clipPath id={clipId}>
                  {/* clip to the piece's square body (not tabs) */}
                  <rect x={px} y={py} width={S} height={S} />
                </clipPath>
              </defs>
              {/* piece body */}
              <path
                d={piecePath(px, py, def.tabRight, def.tabBottom)}
                fill={BLUE}
                stroke={INK}
                strokeWidth={1.5}
                strokeLinejoin="round"
              />
              {/* artwork clipped to square */}
              <g clipPath={`url(#${clipId})`} transform={`translate(${px},${py})`}>
                <PieceArtwork pieceCol={def.col} pieceRow={def.row} />
              </g>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── Option shapes for A–E ────────────────────────────────────────────────────
// All options are a blue square showing a different yellow shape:
//   A: half-disc (D-shape) — flat bottom
//   B: crescent moon (yellow disc minus white circle) — answer
//   C: full yellow circle
//   D: teardrop / lens (pointed on one side)
//   E: semi-circle with a flat bottom edge (like A but wider)

const OPT_S = 64   // option square side
const OPT_R = OPT_S / 2  // centre

function OptionAShape() {
  // Half-disc: flat bottom, curved top
  const cx = OPT_R
  const cy = OPT_R + OPT_S * 0.06
  const r = OPT_S * 0.36
  return (
    <path
      d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy} Z`}
      fill={YELLOW}
    />
  )
}

function OptionBShape() {
  // Crescent: yellow disc minus white circle (same geometry as assembled puzzle)
  const cx = OPT_R
  const cy = OPT_R
  const yR = OPT_S * 0.35
  const wR = OPT_S * 0.25
  const wCx = cx + OPT_S * 0.08
  const wCy = cy + OPT_S * 0.08
  return (
    <>
      <circle cx={cx - OPT_S * 0.04} cy={cy - OPT_S * 0.04} r={yR} fill={YELLOW} />
      <circle cx={wCx} cy={wCy} r={wR} fill={BLUE} />
    </>
  )
}

function OptionCShape() {
  return <circle cx={OPT_R} cy={OPT_R} r={OPT_S * 0.36} fill={YELLOW} />
}

function OptionDShape() {
  // Teardrop / lens: pointed at top-right, rounded at bottom-left
  const cx = OPT_R - 2
  const cy = OPT_R + 2
  const r = OPT_S * 0.33
  return (
    <path
      d={`
        M ${cx},${cy - r}
        C ${cx + r * 0.9},${cy - r * 0.6} ${cx + r * 0.6},${cy + r * 0.2} ${cx},${cy + r * 0.7}
        C ${cx - r * 0.8},${cy + r * 0.2} ${cx - r * 0.5},${cy - r * 0.6} ${cx},${cy - r}
        Z
      `}
      fill={YELLOW}
    />
  )
}

function OptionEShape() {
  // Semi-circle: flat bottom, half-height
  const cx = OPT_R
  const cy = OPT_R + OPT_S * 0.1
  const r = OPT_S * 0.38
  return (
    <path
      d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy} Z`}
      fill={YELLOW}
    />
  )
}

const OPTION_SHAPES: Record<string, () => JSX.Element> = {
  A: OptionAShape,
  B: OptionBShape,
  C: OptionCShape,
  D: OptionDShape,
  E: OptionEShape,
}

const OPTION_ARIA: Record<string, { en: string; id: string }> = {
  A: { en: 'Option A: blue square with a yellow D-shape (half-disc, flat bottom).', id: 'Pilihan A: persegi biru dengan bentuk setengah lingkaran kuning, sisi datar di bawah.' },
  B: { en: 'Option B: blue square with a yellow crescent moon shape.', id: 'Pilihan B: persegi biru dengan bentuk bulan sabit kuning.' },
  C: { en: 'Option C: blue square with a full yellow circle.', id: 'Pilihan C: persegi biru dengan lingkaran kuning penuh.' },
  D: { en: 'Option D: blue square with a yellow teardrop shape.', id: 'Pilihan D: persegi biru dengan bentuk tetesan kuning.' },
  E: { en: 'Option E: blue square with a yellow semi-circle (wider, flat bottom).', id: 'Pilihan E: persegi biru dengan setengah lingkaran kuning yang lebih lebar, sisi datar di bawah.' },
}

/**
 * PuzzleOptionBox — renders one answer-choice square (blue bg + yellow shape).
 * Co-exported for both the stem illustration (unused in this Q) and CHOICE_RENDERERS.
 */
function PuzzleOptionBox({ label, size = OPT_S }: { label: string; size?: number }) {
  const Shape = OPTION_SHAPES[label]
  if (!Shape) return null
  return (
    <svg
      viewBox={`0 0 ${OPT_S} ${OPT_S}`}
      width={size}
      height={size}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      <rect x={0} y={0} width={OPT_S} height={OPT_S} fill={BLUE} rx={3} />
      <Shape />
    </svg>
  )
}

/**
 * Puzzle7PEOption — renders ONE A/B/C/D/E answer choice for CHOICE_RENDERERS.
 * Registered in CHOICE_RENDERERS for IKMC-22-PE-Q7.
 */
export function Puzzle7PEOption({ choice }: { choice: WmiChoice }) {
  const k = choice.label
  const aria = OPTION_ARIA[k]
  if (!OPTION_SHAPES[k]) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <PuzzleOptionBox label={k} size={72} />
    </span>
  )
}

// Export the PuzzleOptionBox so the explainer can reuse it
export { PuzzleOptionBox, BG, BLUE, YELLOW, WHITE, INK, OPT_S }
