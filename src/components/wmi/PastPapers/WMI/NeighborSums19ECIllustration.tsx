// IKMC-21-EC-Q19 — "The numbers 1 to 9 are placed in the squares shown with a
// number in each square. The sums of all pairs of neighbouring numbers are
// shown: above the pairs are 7, 9, 11, 9 and below are 15, 3, 15, 8. Which
// number is placed in the shaded square?"   Answer D: 7.
//
// LAYOUT (reconstructed from docs/reference/ocr-res/ikmc/contest/ecolier/2021.imgs/060.jpg):
//   Nine cells in a horizontal strip (positions 0–8 left to right).
//   Sums of adjacent pairs alternate above / below:
//     Above: (0,1)=7, (2,3)=9, (4,5)=11, (6,7)=9
//     Below: (1,2)=15, (3,4)=3, (5,6)=15, (7,8)=8
//   The SHADED cell is position 4 (the 5th cell from the left).
//
// SOLUTION (checked):
//   Setting b (cell 1) = 6 gives:
//     cell 0 = 9, 1 = 6, 2 = 1, 3 = 2, 4 = 7, 5 = 8, 6 = 3, 7 = 5, 8 = 4
//   Verify: {1..9} used exactly once; all 8 sums correct.
//   The shaded cell (pos 4) holds 7 → answer D.
//
// STEM RULE: the static illustration shows the nine EMPTY cells plus the eight
// sum labels and the shaded highlight.  It NEVER reveals the cell values —
// that is the explainer's job.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

// ── palette ────────────────────────────────────────────────────────────────────
const INK         = '#1F2937'  // cell outlines + sum labels
const SHADE_FILL  = '#FDE3CF'  // peach wash — shaded cell bg
const SHADE_STROKE = '#f0853a' // qupu-brand-orange — shaded cell border
const SUM_ABOVE   = '#30598A'  // qupu-brand-blue — sums shown above
const SUM_BELOW   = '#10B981'  // emerald — sums shown below

// ── geometry ───────────────────────────────────────────────────────────────────
const CELL_W   = 34  // cell width
const CELL_H   = 34  // cell height
const PAD_X    = 18  // left/right padding
const PAD_Y    = 36  // top/bottom padding (room for above-labels)
const GAP      = 2   // gap between cells
const N        = 9   // number of cells

const TOTAL_W  = PAD_X * 2 + N * CELL_W + (N - 1) * GAP
const TOTAL_H  = PAD_Y * 2 + CELL_H

/** X of the left edge of cell i. */
const cellX = (i: number) => PAD_X + i * (CELL_W + GAP)
/** Y of the top edge of every cell. */
const cellY = () => PAD_Y
/** X of the centre between cells i and i+1. */
const pairMidX = (i: number) => cellX(i) + CELL_W + GAP / 2

// ── sum layout ─────────────────────────────────────────────────────────────────
// The solved values are [9,6,1,2,7,8,3,5,4].  Adjacent pair sums:
//   Gap 0: 9+6=15 (below), gap 1: 6+1=7 (above), gap 2: 1+2=3 (below),
//   gap 3: 2+7=9 (above), gap 4: 7+8=15 (below), gap 5: 8+3=11 (above),
//   gap 6: 3+5=8 (below), gap 7: 5+4=9 (above).
// Above sums 7,9,11,9 sit at ODD gaps (1,3,5,7).
// Below sums 15,3,15,8 sit at EVEN gaps (0,2,4,6).
const ABOVE_SUMS = [7, 9, 11, 9]   // at gaps 1, 3, 5, 7 (odd)
const BELOW_SUMS = [15, 3, 15, 8]  // at gaps 0, 2, 4, 6 (even)

// ── SumBracket: a small bracket + label above or below a cell gap ──────────────
function SumBracket({
  gapIndex,
  value,
  above,
}: {
  gapIndex: number
  value: number
  above: boolean
}) {
  const mx  = pairMidX(gapIndex)          // x centre of the gap
  const cy  = cellY()
  const brickHalfW = CELL_W * 0.4         // bracket arm reaches ~40% of a cell each side
  const armLen     = 8                    // vertical arm of the bracket

  // Above: bracket opens downward, label sits above it.
  // Below: bracket opens upward, label sits below it.
  const bracketY1 = above ? cy - 6 : cy + CELL_H + 6
  const bracketY2 = above ? cy - 6 + armLen : cy + CELL_H + 6 - armLen
  const labelY    = above ? cy - 22 : cy + CELL_H + 22
  const color     = above ? SUM_ABOVE : SUM_BELOW

  return (
    <g fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round">
      {/* left arm */}
      <line x1={mx - brickHalfW} y1={bracketY1} x2={mx - brickHalfW} y2={bracketY2} />
      {/* horizontal bar */}
      <line x1={mx - brickHalfW} y1={bracketY1} x2={mx + brickHalfW} y2={bracketY1} />
      {/* right arm */}
      <line x1={mx + brickHalfW} y1={bracketY1} x2={mx + brickHalfW} y2={bracketY2} />
      {/* sum label */}
      <text
        x={mx}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        stroke="none"
        fontSize={12}
        fontWeight={800}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {value}
      </text>
    </g>
  )
}

// ── NeighborStrip: shared primitive ────────────────────────────────────────────

export interface NeighborStripProps {
  /**
   * If provided, fills in the given values (array of 9, indexed 0–8).
   * Used by the explainer to reveal cell contents beat by beat.
   * The static illustration passes nothing.
   */
  revealedValues?: Array<number | null>
  /**
   * When true, the shaded cell's value is rendered in the orange answer colour
   * (used on the result beat).
   */
  highlightShaded?: boolean
}

/**
 * The shared nine-cell strip primitive with sum brackets.
 * Cell 4 (0-indexed) is the shaded cell.
 *
 * Used by NeighborSums19ECIllustration (no values) and
 * NeighborSums19ECExplainer (values revealed progressively).
 */
export function NeighborStrip({
  revealedValues,
  highlightShaded = false,
}: NeighborStripProps = {}) {
  const SHADED_IDX = 4

  return (
    <svg
      viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`}
      width="100%"
      style={{ display: 'block', maxWidth: 360 }}
      aria-hidden="true"
    >
      {/* cells */}
      {Array.from({ length: N }, (_, i) => {
        const x      = cellX(i)
        const y      = cellY()
        const shaded = i === SHADED_IDX
        const fill   = shaded ? SHADE_FILL : '#FFFFFF'
        const stroke = shaded ? SHADE_STROKE : INK
        const sw     = shaded ? 2.5 : 1.5
        const value  = revealedValues ? revealedValues[i] : null
        const textColor =
          shaded && highlightShaded && value != null
            ? '#f0853a'
            : shaded && value != null
              ? '#9a4a14'
              : INK
        return (
          <g key={i}>
            <rect x={x} y={y} width={CELL_W} height={CELL_H} rx={4} fill={fill} stroke={stroke} strokeWidth={sw} />
            {value != null && (
              <text
                x={x + CELL_W / 2}
                y={y + CELL_H / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={16}
                fontWeight={800}
                fill={textColor}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {value}
              </text>
            )}
          </g>
        )
      })}

      {/* sum brackets — above (odd gaps: 1, 3, 5, 7) */}
      {ABOVE_SUMS.map((v, j) => (
        <SumBracket key={`above-${j}`} gapIndex={j * 2 + 1} value={v} above={true} />
      ))}

      {/* sum brackets — below (even gaps: 0, 2, 4, 6) */}
      {BELOW_SUMS.map((v, j) => (
        <SumBracket key={`below-${j}`} gapIndex={j * 2} value={v} above={false} />
      ))}
    </svg>
  )
}

// ── Default export: static stem illustration ────────────────────────────────────

/** Static stem figure for IKMC-21-EC-Q19. Shows the empty nine-cell strip with
 * neighbour-sum brackets and the shaded cell. Does NOT reveal any cell value. */
export default function NeighborSums19ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Sembilan kotak berjejer mendatar. Jumlah pasangan bersebelahan ditampilkan di atas: 7, 9, 11, 9 (pasangan genap) dan di bawah: 15, 3, 15, 8 (pasangan ganjil). Kotak kelima dari kiri diarsir. Angka berapa yang ada di kotak yang diarsir?'
      }
    >
      <NeighborStrip />
    </div>
  )
}
