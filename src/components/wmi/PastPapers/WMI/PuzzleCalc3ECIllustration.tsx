// Stem illustration for IKMC-2021-Ecolier-Q3 (puzzle-piece calculation).
//
// The question gives four jigsaw puzzle pieces, each carrying part of a
// calculation. When assembled correctly they form a rectangle that reads:
//
//   12 + 3 = ?
//
// Piece layout (left→right in the assembled rectangle):
//   Piece A: carries "1"   (left half of "12")
//   Piece B: carries "2"   (right half of "12")
//   Piece C: carries "+"   (operator)
//   Piece D: carries "3"   (right operand)
//
// Answer: 12 + 3 = 15 → choice B.
//
// The static illustration shows the FOUR DISCONNECTED PIECES (the problem
// state — not the assembled rectangle) so the question "can you put them
// together?" is clear. Each piece is a rounded rectangle with a jigsaw
// tab/notch on its connecting edges, matching the source scan.
//
// The assembled view (used by the explainer) is driven by `showAssembled`.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const INK = '#1F2937'
const BLUE = '#30598A'
const CREAM = '#FFF9F4'
// CREAM_DARK used via Tailwind class border-qupu-cream-dark (not a JS const)
const ORANGE = '#F0853A'
const GREEN = '#10B981'

// ── Geometry ─────────────────────────────────────────────────────────────────

// Each piece cell: 64×64 user units. Tab radius = 10.
const CELL = 64
const TAB_R = 10
const TAB_H = 14   // how far the tab protrudes
const STROKE = 2.5

// Piece positions in the 4-up scattered layout (column-based, slight stagger).
// We scatter them in a 2×2 grid for the illustration.
const SCATTER: Record<string, { x: number; y: number }> = {
  A: { x: 10, y: 10 },
  B: { x: 106, y: 28 },
  C: { x: 10, y: 110 },
  D: { x: 106, y: 96 },
}

// Piece positions in the assembled rectangle (left→right).
const ASSEMBLED: Record<string, { x: number; y: number }> = {
  A: { x: 4,                  y: 40 },
  B: { x: 4 + CELL,           y: 40 },
  C: { x: 4 + CELL * 2,       y: 40 },
  D: { x: 4 + CELL * 3,       y: 40 },
}

// ── Jigsaw path helpers ───────────────────────────────────────────────────────
//
// Each piece is a rectangle with tabs (+) or notches (-) on its edges.
// Convention: tab = protrudes outward, notch = cut inward.
// We use cubic-bezier arcs drawn with SVG path commands.
//
// Edge descriptions for each piece (top/right/bottom/left):
//   A: top=flat, right=tab,   bottom=flat, left=flat   (left edge of rect)
//   B: top=flat, right=tab,   bottom=flat, left=notch  (connects to A on left)
//   C: top=flat, right=tab,   bottom=flat, left=notch  (connects to B on left)
//   D: top=flat, right=flat,  bottom=flat, left=notch  (rightmost piece)

// ── Shared primitive ──────────────────────────────────────────────────────────

export interface PuzzleCalc3ECFigureProps {
  /** Show pieces assembled (for explainer). Default = false (scattered). */
  showAssembled?: boolean
  /** Highlight which piece(s) for explainer beats. */
  highlightPieces?: string[] | null
  /** Show the completed calculation "12 + 3 = 15" (final beat). */
  showResult?: boolean
}

/**
 * Primitive: four jigsaw puzzle pieces.
 * Scattered by default; pass `showAssembled` to see them joined.
 */
export function PuzzleCalc3ECFigure({
  showAssembled = false,
  highlightPieces = null,
  showResult = false,
}: PuzzleCalc3ECFigureProps = {}) {
  const hiSet = new Set(highlightPieces ?? [])

  // Piece definitions: key, label text, position source, path builder
  type PieceSpec = {
    key: string
    label: string
    tabRight: boolean
    notchLeft: boolean
  }
  const PIECES: PieceSpec[] = [
    { key: 'A', label: '1', tabRight: true,  notchLeft: false },
    { key: 'B', label: '2', tabRight: true,  notchLeft: true  },
    { key: 'C', label: '+', tabRight: true,  notchLeft: true  },
    { key: 'D', label: '3', tabRight: false, notchLeft: true  },
  ]

  const pos = showAssembled ? ASSEMBLED : SCATTER

  // Canvas size differs for scattered vs assembled
  const SVG_W = showAssembled ? CELL * 4 + 8 + TAB_H * 2 : 180
  const SVG_H = showAssembled ? CELL + 80 + 8 : 190

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: showAssembled ? 320 : 200, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {PIECES.map((piece) => {
        const { x, y } = pos[piece.key]
        const isHi = hiSet.has(piece.key)
        const fill = isHi ? '#E1EFFB' : CREAM
        const stroke = isHi ? ORANGE : BLUE

        // Build the SVG path for this piece
        let d: string
        if (piece.notchLeft && piece.tabRight) {
          // Middle pieces B and C: notch on left, tab on right
          // We combine: draw rect outline, notch on left, tab on right
          d = buildPiecePath(x, y, CELL, CELL, { tabRight: true, notchLeft: true })
        } else if (!piece.notchLeft && piece.tabRight) {
          // Piece A: flat left, tab on right
          d = buildPiecePath(x, y, CELL, CELL, { tabRight: true, notchLeft: false })
        } else {
          // Piece D: notch on left, flat right
          d = buildPiecePath(x, y, CELL, CELL, { tabRight: false, notchLeft: true })
        }

        return (
          <g key={piece.key}>
            <path
              d={d}
              fill={fill}
              stroke={stroke}
              strokeWidth={isHi ? STROKE + 1.5 : STROKE}
              strokeLinejoin="round"
            />
            <text
              x={x + CELL / 2}
              y={y + CELL / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={piece.label === '+' ? 28 : 30}
              fontWeight={900}
              fill={isHi ? BLUE : INK}
              className="font-display"
            >
              {piece.label}
            </text>
          </g>
        )
      })}

      {/* Result row when assembled — "= 15" appended */}
      {showAssembled && showResult && (
        <g>
          <text
            x={SVG_W / 2}
            y={ASSEMBLED.A.y + CELL + 30}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={22}
            fontWeight={900}
            fill={GREEN}
            className="font-display"
          >
            = 15
          </text>
        </g>
      )}
    </svg>
  )
}

// ── Path builder ──────────────────────────────────────────────────────────────
// Builds a piece with optional right-tab and left-notch.

function buildPiecePath(
  x: number,
  y: number,
  w: number,
  h: number,
  opts: { tabRight: boolean; notchLeft: boolean },
): string {
  const t = TAB_R
  const th = TAB_H
  const my = y + h / 2

  // Rect corners
  const x1 = x, y1 = y
  const x2 = x + w, y2 = y + h

  let d = `M ${x1} ${y1}`

  // TOP — flat
  d += ` L ${x2} ${y1}`

  // RIGHT — tab or flat
  if (opts.tabRight) {
    const tTop = my - t
    const tBot = my + t
    d += ` L ${x2} ${tTop}`
    d += ` C ${x2 + th / 2} ${tTop} ${x2 + th} ${tTop - t} ${x2 + th} ${my}`
    d += ` C ${x2 + th} ${tBot + t} ${x2 + th / 2} ${tBot} ${x2} ${tBot}`
    d += ` L ${x2} ${y2}`
  } else {
    d += ` L ${x2} ${y2}`
  }

  // BOTTOM — flat
  d += ` L ${x1} ${y2}`

  // LEFT — notch or flat
  if (opts.notchLeft) {
    const tBot = my + t
    const tTop = my - t
    d += ` L ${x1} ${tBot}`
    // Notch curves inward (toward +x)
    d += ` C ${x1 + th / 2} ${tBot} ${x1 + th} ${tBot + t} ${x1 + th} ${my}`
    d += ` C ${x1 + th} ${tTop - t} ${x1 + th / 2} ${tTop} ${x1} ${tTop}`
    d += ` L ${x1} ${y1}`
  } else {
    d += ` L ${x1} ${y1}`
  }

  d += ' Z'
  return d
}

// ── Default export: static illustration (4 scattered pieces) ─────────────────

export default function PuzzleCalc3ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Empat keping puzzle yang masing-masing membawa bagian dari sebuah perhitungan: keping 1 berisi angka 1, keping 2 berisi angka 2, keping 3 berisi tanda plus, keping 4 berisi angka 3. Susun keempat keping untuk membentuk sebuah persegi panjang dengan perhitungan lengkap."
    >
      <PuzzleCalc3ECFigure />
    </div>
  )
}
