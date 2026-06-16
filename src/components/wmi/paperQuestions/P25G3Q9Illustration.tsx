// Cross / jigsaw fraction figure for WMI-25P3A-Q9 (2025 Grade-3 Semifinal).
//
// "The sum of the 3 fractions on the vertical line and the sum of the 3
//  fractions on the horizontal line are each 1, as shown. Find the fraction ▲."
//  Answer: E = 2/18.
//
// Reading db/seed/wmi/figures/2025-semifinal-g3-a-q9.jpg: five jigsaw-puzzle
// tiles in a plus/cross layout sharing one centre tile:
//   • top tile     = 5/18   (pink)
//   • left tile    = 7/18   (blue)
//   • bottom tile  = 4/18   (green)
//   • centre tile  = ? (a black dot — the shared crossing fraction)
//   • right tile   = ▲ (a black triangle — the unknown we must find)
//
// Each straight line of 3 tiles sums to 1 = 18/18.
//   Vertical:   5/18 + centre + 4/18 = 18/18  →  centre = 9/18
//   Horizontal: 7/18 + centre + ▲    = 18/18  →  ▲ = 18/18 − 16/18 = 2/18
//
// The static figure draws ONLY the problem: the four given tiles, the centre
// dot, and ▲ as an unknown triangle (never the value). The co-exported CrossPuzzle
// primitive lets the explainer fill in the centre (9/18) and then ▲ (2/18).
//
// Pure render, SSR-safe, deterministic — no random / dates / window / state.

const INK = '#2E2A29' // tile outline / glyphs
const PINK = '#F6D4D4'
const BLUE = '#CFE2F3'
const GREEN = '#CFE6D2'
const WHITE = '#FFFFFF'
const SOLVE = '#2C7BE5' // explainer-only reveal accent

const TILE = 86 // tile side
const GAP = 6 // visual gap between tiles
const STEP = TILE + GAP
const PAD = 22 // viewBox padding (headroom)
export const Q9_VIEW = TILE * 3 + GAP * 2 + PAD * 2
const C = Q9_VIEW / 2 // centre of the whole cross

// centres of the five tiles
const POS = {
  top: [C, PAD + TILE / 2] as [number, number],
  left: [PAD + TILE / 2, C] as [number, number],
  centre: [C, C] as [number, number],
  right: [Q9_VIEW - PAD - TILE / 2, C] as [number, number],
  bottom: [C, Q9_VIEW - PAD - TILE / 2] as [number, number],
}

/** A rounded puzzle tile centred at (cx, cy) with an optional stacked fraction. */
function Tile({
  cx,
  cy,
  fill,
  num,
  den,
  glyph,
}: {
  cx: number
  cy: number
  fill: string
  num?: number | string
  den?: number | string
  glyph?: 'dot' | 'tri'
}) {
  return (
    <g>
      <rect
        x={cx - TILE / 2}
        y={cy - TILE / 2}
        width={TILE}
        height={TILE}
        rx={10}
        fill={fill}
        stroke={INK}
        strokeWidth={2.5}
      />
      {num !== undefined && den !== undefined && (
        <g>
          <text x={cx} y={cy - 11} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={800} fill={INK}>
            {num}
          </text>
          <line x1={cx - 18} y1={cy + 1} x2={cx + 18} y2={cy + 1} stroke={INK} strokeWidth={2.5} />
          <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={800} fill={INK}>
            {den}
          </text>
        </g>
      )}
      {glyph === 'dot' && <circle cx={cx} cy={cy} r={13} fill={INK} />}
      {glyph === 'tri' && (
        <polygon points={`${cx},${cy - 14} ${cx - 14},${cy + 12} ${cx + 14},${cy + 12}`} fill={INK} />
      )}
    </g>
  )
}

void STEP // STEP retained for layout documentation; positions derived from POS

export interface CrossPuzzleProps {
  /** Reveal the centre fraction (9/18) instead of the black dot. */
  showCentre?: boolean
  /** Reveal ▲ as 2/18 instead of the black triangle. */
  showTriangle?: boolean
  /** Highlight the vertical line of tiles. */
  litLine?: 'none' | 'vertical' | 'horizontal'
}

export function CrossPuzzle({ showCentre = false, showTriangle = false, litLine = 'none' }: CrossPuzzleProps) {
  const lit = (which: 'vertical' | 'horizontal') =>
    litLine === which ? { stroke: SOLVE, strokeWidth: 6, opacity: 0.35 } : null

  const vLit = lit('vertical')
  const hLit = lit('horizontal')

  return (
    <svg
      viewBox={`0 0 ${Q9_VIEW} ${Q9_VIEW}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* line highlight underlay */}
      {vLit && <line x1={C} y1={POS.top[1]} x2={C} y2={POS.bottom[1]} {...vLit} strokeLinecap="round" />}
      {hLit && <line x1={POS.left[0]} y1={C} x2={POS.right[0]} y2={C} {...hLit} strokeLinecap="round" />}

      <Tile cx={POS.top[0]} cy={POS.top[1]} fill={PINK} num={5} den={18} />
      <Tile cx={POS.left[0]} cy={POS.left[1]} fill={BLUE} num={7} den={18} />
      <Tile cx={POS.bottom[0]} cy={POS.bottom[1]} fill={GREEN} num={4} den={18} />

      {/* centre tile: dot until solved, then 9/18 */}
      {showCentre ? (
        <g>
          <Tile cx={POS.centre[0]} cy={POS.centre[1]} fill={WHITE} num={9} den={18} />
          <rect
            x={POS.centre[0] - TILE / 2}
            y={POS.centre[1] - TILE / 2}
            width={TILE}
            height={TILE}
            rx={10}
            fill="none"
            stroke={SOLVE}
            strokeWidth={3}
          />
        </g>
      ) : (
        <Tile cx={POS.centre[0]} cy={POS.centre[1]} fill={WHITE} glyph="dot" />
      )}

      {/* right tile: triangle until solved, then 2/18 */}
      {showTriangle ? (
        <g>
          <Tile cx={POS.right[0]} cy={POS.right[1]} fill={WHITE} num={2} den={18} />
          <rect
            x={POS.right[0] - TILE / 2}
            y={POS.right[1] - TILE / 2}
            width={TILE}
            height={TILE}
            rx={10}
            fill="none"
            stroke={SOLVE}
            strokeWidth={3}
          />
        </g>
      ) : (
        <Tile cx={POS.right[0]} cy={POS.right[1]} fill={WHITE} glyph="tri" />
      )}
    </svg>
  )
}

const ARIA =
  'Lima keping puzzle membentuk tanda tambah berbagi keping tengah. ' +
  'Atas 5/18, kiri 7/18, bawah 4/18, tengah sebuah titik, kanan sebuah segitiga ▲. ' +
  'Jumlah 3 pecahan pada garis tegak dan pada garis mendatar masing-masing 1. Tentukan ▲.'

export default function P25G3Q9Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={ARIA}
    >
      <CrossPuzzle />
    </div>
  )
}
