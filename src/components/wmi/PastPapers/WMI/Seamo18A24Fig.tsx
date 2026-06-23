// Seamo18A24Fig — SEAMO 2018 Paper A Q24
// "Each row represents one of the following numbers: 892, 485, 364, 624.
//  Which number does Row 2 represent?"
//
// Source figure (2018.imgs/032.jpg): a 4×3 grid of 2×2-quadrant blocks.
// Each 2×2 block has some quadrants shaded blue; the shading encodes a digit.
//
// Digit encoding (shaded quadrants, using TL/TR/BL/BR):
//   2 → [TR]              (top-right only)
//   3 → [BL]              (bottom-left only)
//   4 → [TL, BL, BR]      (left column + bottom-right)
//   5 → [TL, TR, BL]      (top-row + bottom-left)
//   6 → [TL, BL]          (left column)
//   8 → [TR, BL]          (diagonal pair)
//   9 → [TR, BL, BR]      (right column + bottom-left)
//
// Row → number mapping:
//   Row 1 → 892  (blocks: 8, 9, 2)
//   Row 2 → 624  (blocks: 6, 2, 4)  ← ANSWER
//   Row 3 → 364  (blocks: 3, 6, 4)
//   Row 4 → 485  (blocks: 4, 8, 5)
//
// Classification: STEM (figure in question stem; answer is fill-in "624")
//
// Pure SVG, SSR-safe — no hooks, no framer-motion, no window/document.

// ── Colour tokens ─────────────────────────────────────────────────────────────

const BLUE_FILL   = '#BFDBFE'   // blue-200 — matches the scanned figure
const WHITE_FILL  = '#FFFFFF'
const BORDER      = '#374151'   // gray-700
const ROW_LABEL   = '#1F2937'   // gray-900

// ── Layout constants ──────────────────────────────────────────────────────────

const CELL     = 28   // size of each small quadrant square
const BLOCK    = CELL * 2   // 56 — one 2×2 block
const GAP      = 16   // gap between blocks within a row
const ROW_GAP  = 18   // gap between rows
const LABEL_W  = 52   // left-margin width for "Row N" labels
const PAD      = 12   // outer padding

const N_ROWS   = 4
const N_BLOCKS = 3

// Total SVG dimensions
const SVG_W = PAD + LABEL_W + N_BLOCKS * BLOCK + (N_BLOCKS - 1) * GAP + PAD
const SVG_H = PAD + N_ROWS * BLOCK + (N_ROWS - 1) * ROW_GAP + PAD

// ── Quadrant shading catalogue ────────────────────────────────────────────────
//
// Each digit maps to the set of quadrants that are shaded blue.
// Quadrant indices: 0=TL, 1=TR, 2=BL, 3=BR

type Quadrant = 0 | 1 | 2 | 3

const DIGIT_SHADING: Record<number, Quadrant[]> = {
  2: [1],         // TR
  3: [2],         // BL
  4: [0, 2, 3],   // TL, BL, BR
  5: [0, 1, 2],   // TL, TR, BL
  6: [0, 2],      // TL, BL
  8: [1, 2],      // TR, BL
  9: [1, 2, 3],   // TR, BL, BR
}

// ── Row data ──────────────────────────────────────────────────────────────────

interface RowDef {
  label: string
  digits: [number, number, number]
}

export const ROWS_18A24: RowDef[] = [
  { label: 'Row 1', digits: [8, 9, 2] },
  { label: 'Row 2', digits: [6, 2, 4] },
  { label: 'Row 3', digits: [3, 6, 4] },
  { label: 'Row 4', digits: [4, 8, 5] },
]

// ── Figure (reusable by explainer) ───────────────────────────────────────────

export interface Seamo18A24FigureProps {
  /**
   * If set, this row index (0-based) is highlighted with a ring to indicate
   * it is the focus of attention (used during explainer steps).
   */
  highlightRow?: number | null
  /**
   * If true, the answer label "= 624" is shown next to Row 2.
   */
  showAnswer?: boolean
}

export function Seamo18A24Figure({
  highlightRow = null,
  showAnswer   = false,
}: Seamo18A24FigureProps) {
  // Helper: top-left x of block [blockCol] within a row
  const blockX = (blockCol: number) =>
    PAD + LABEL_W + blockCol * (BLOCK + GAP)

  // Helper: top-left y of row [rowIdx]
  const rowY = (rowIdx: number) =>
    PAD + rowIdx * (BLOCK + ROW_GAP)

  // Helper: render one 2×2 shaded-quadrant block
  function QuadBlock({
    x, y, digit,
  }: { x: number; y: number; digit: number }) {
    const shaded = new Set(DIGIT_SHADING[digit] ?? [])

    // Quadrant positions (row, col) within the 2×2:
    //   TL=0 → (0,0), TR=1 → (0,1), BL=2 → (1,0), BR=3 → (1,1)
    const quadrant = (idx: Quadrant) => {
      const qRow = idx < 2 ? 0 : 1       // 0,1 → top; 2,3 → bottom
      const qCol = idx % 2               // 0,2 → left; 1,3 → right
      const qx = x + qCol * CELL
      const qy = y + qRow * CELL
      return { qx, qy, filled: shaded.has(idx) }
    }

    const quads: Quadrant[] = [0, 1, 2, 3]

    return (
      <g>
        {/* Background rects for each quadrant */}
        {quads.map((idx) => {
          const { qx, qy, filled } = quadrant(idx)
          return (
            <rect
              key={`q-${idx}`}
              x={qx}
              y={qy}
              width={CELL}
              height={CELL}
              fill={filled ? BLUE_FILL : WHITE_FILL}
            />
          )
        })}
        {/* Outer block border */}
        <rect
          x={x}
          y={y}
          width={BLOCK}
          height={BLOCK}
          fill="none"
          stroke={BORDER}
          strokeWidth={1.5}
        />
        {/* Interior dividing lines */}
        {/* Vertical centre line */}
        <line
          x1={x + CELL} y1={y}
          x2={x + CELL} y2={y + BLOCK}
          stroke={BORDER}
          strokeWidth={0.75}
        />
        {/* Horizontal centre line */}
        <line
          x1={x}         y1={y + CELL}
          x2={x + BLOCK} y2={y + CELL}
          stroke={BORDER}
          strokeWidth={0.75}
        />
      </g>
    )
  }

  const ANSWER_COL = '#2563EB'   // blue-600 for the revealed answer text

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <rect width={SVG_W} height={SVG_H} fill="#FFFBF0" rx={8} />

      {ROWS_18A24.map((row, rowIdx) => {
        const ry = rowY(rowIdx)
        const isHighlighted = highlightRow === rowIdx
        const rowCentreY = ry + BLOCK / 2

        return (
          <g key={`row-${rowIdx}`}>
            {/* Highlight ring behind the blocks */}
            {isHighlighted && (
              <rect
                x={PAD + LABEL_W - 4}
                y={ry - 4}
                width={N_BLOCKS * (BLOCK + GAP) - GAP + 8}
                height={BLOCK + 8}
                fill="none"
                stroke="#2563EB"
                strokeWidth={2.5}
                rx={6}
                strokeDasharray="6 3"
              />
            )}

            {/* "Row N" label */}
            <text
              x={PAD + LABEL_W - 8}
              y={rowCentreY}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={13}
              fontWeight={700}
              fill={isHighlighted ? ANSWER_COL : ROW_LABEL}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {row.label}
            </text>

            {/* Three digit blocks */}
            {row.digits.map((digit, blockCol) => (
              <QuadBlock
                key={`block-${blockCol}`}
                x={blockX(blockCol)}
                y={ry}
                digit={digit}
              />
            ))}

            {/* Answer reveal for Row 2 */}
            {showAnswer && rowIdx === 1 && (
              <text
                x={PAD + LABEL_W + N_BLOCKS * (BLOCK + GAP) - GAP + 10}
                y={rowCentreY}
                textAnchor="start"
                dominantBaseline="central"
                fontSize={14}
                fontWeight={900}
                fill={ANSWER_COL}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                = 624
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ── Default export — static illustration ─────────────────────────────────────

export default function Seamo18A24Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'A table of four rows, each with three 2-by-2 grid blocks. ' +
        'Each block has some quadrants shaded blue to encode a digit. ' +
        'The four rows encode the numbers 892, 624, 364, and 485 in order. ' +
        'Question: which number does Row 2 represent?'
      }
    >
      <Seamo18A24Figure />
    </div>
  )
}

// ── Registry entry (paste into registry.ts — do NOT edit here) ───────────────
//
//   'SEAMO-18-A-Q24': {
//     illustration: () => import('./Seamo18A24Fig'),
//   },
