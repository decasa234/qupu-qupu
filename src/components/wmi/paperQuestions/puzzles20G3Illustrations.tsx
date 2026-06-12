// Puzzle figures for WMI-20F3A with their solver-verified data.

const INK = '#1F2937'
const BLUE = '#30598A'

function Frame({ aria, children }: { aria: string; children: React.ReactNode }) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2" role="img" aria-label={aria}>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ Q17 —
 * The quilt figure on a 4×4 frame. Verified line structure (unit coords):
 *  - full grid lines at x ∈ {0,1,3,4} and y ∈ {0,1,3,4}
 *  - half lines: x=2 for y∈[0,1] and [3,4]; y=2 for x∈[0,1] and [3,4]
 *  - big diamond (2,0)-(4,2)-(2,4)-(0,2); small diamond (2,1)-(3,2)-(2,3)-(1,2)
 * Square count = 20: twelve 1×1 (4 top, 4 bottom, 2 left-mid, 2 right-mid),
 * one 2×2 (1,1)-(3,3), four 3×3, one 4×4, two tilted diamonds. */
export const QUILT_SQUARES: Array<{ kind: 'unit' | 'two' | 'three' | 'four' | 'diamond'; pts: Array<[number, number]> }> = [
  // 12 unit squares (top-left corners → 4 corner points)
  ...([[0, 0], [1, 0], [2, 0], [3, 0], [0, 3], [1, 3], [2, 3], [3, 3], [0, 1], [0, 2], [3, 1], [3, 2]] as Array<[number, number]>).map(
    ([x, y]) => ({ kind: 'unit' as const, pts: [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]] as Array<[number, number]> }),
  ),
  { kind: 'two', pts: [[1, 1], [3, 1], [3, 3], [1, 3]] },
  { kind: 'three', pts: [[0, 0], [3, 0], [3, 3], [0, 3]] },
  { kind: 'three', pts: [[1, 0], [4, 0], [4, 3], [1, 3]] },
  { kind: 'three', pts: [[0, 1], [3, 1], [3, 4], [0, 4]] },
  { kind: 'three', pts: [[1, 1], [4, 1], [4, 4], [1, 4]] },
  { kind: 'four', pts: [[0, 0], [4, 0], [4, 4], [0, 4]] },
  { kind: 'diamond', pts: [[2, 0], [4, 2], [2, 4], [0, 2]] },
  { kind: 'diamond', pts: [[2, 1], [3, 2], [2, 3], [1, 2]] },
]
export const QUILT_TOTAL = QUILT_SQUARES.length // 20

export function QuiltBoard({ highlight, size = 64 }: { highlight?: Array<[number, number]> | null; size?: number }) {
  const g = (n: number) => 14 + n * size
  const seg = (x1: number, y1: number, x2: number, y2: number, key: string) => (
    <line key={key} x1={g(x1)} y1={g(y1)} x2={g(x2)} y2={g(y2)} stroke={INK} strokeWidth={2} />
  )
  return (
    <svg viewBox={`0 0 ${28 + 4 * size} ${28 + 4 * size}`} width="100%" style={{ maxWidth: 300, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {[0, 1, 3, 4].map((x) => seg(x, 0, x, 4, `vx${x}`))}
      {[0, 1, 3, 4].map((y) => seg(0, y, 4, y, `hy${y}`))}
      {seg(2, 0, 2, 1, 'v2a')}
      {seg(2, 3, 2, 4, 'v2b')}
      {seg(0, 2, 1, 2, 'h2a')}
      {seg(3, 2, 4, 2, 'h2b')}
      <polygon points={`${g(2)},${g(0)} ${g(4)},${g(2)} ${g(2)},${g(4)} ${g(0)},${g(2)}`} fill="none" stroke={INK} strokeWidth={2} />
      <polygon points={`${g(2)},${g(1)} ${g(3)},${g(2)} ${g(2)},${g(3)} ${g(1)},${g(2)}`} fill="none" stroke={INK} strokeWidth={2} />
      {highlight && (
        <polygon
          points={highlight.map(([x, y]) => `${g(x)},${g(y)}`).join(' ')}
          fill="#19A7CE2E"
          stroke="#19A7CE"
          strokeWidth={4}
        />
      )}
    </svg>
  )
}
export function QuiltSquaresG3Illustration() {
  return (
    <Frame aria="A quilt-like figure: a four-by-four square with some inner grid lines, a large tilted square touching the edge midpoints, and a small tilted square in the centre.">
      <QuiltBoard highlight={null} />
    </Frame>
  )
}

/* ------------------------------------------------------------------ Q20 —
 * Three rectangles: orange 7 cm² (3 cm wide), pink 50 cm², green 33 cm².
 * Left side (orange + green) is 6 cm tall. Verified: green is 9 wide,
 * pink is 6 wide, right side ? = (50 + 22) ÷ 6 = 12 cm.
 * Drawing uses true proportions: green 9 × 11/3, orange 3 × 7/3, pink 6 × 25/3. */
export function ThreeRectangles({ region }: { region?: 'leftCol' | 'strip' | 'greenWidth' | 'pinkWidth' | 'rightCol' | null }) {
  const u = 34 // px per cm horizontally
  const v = 13.2 // px per cm vertically (heights are thirds)
  const x0 = 30
  const yBase = 196 // bottom of green
  const hGreen = (11 / 3) * v
  const hOrange = (7 / 3) * v
  const hPink = (25 / 3) * v
  const yGreenTop = yBase - hGreen
  const yOrangeTop = yGreenTop - hOrange
  const yPinkTop = yBase - hGreen - hPink
  return (
    <svg viewBox="0 0 420 230" width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
      <rect x={x0} y={yGreenTop} width={9 * u} height={hGreen} fill="#BFE3B4" stroke={INK} strokeWidth={2} />
      <rect x={x0} y={yOrangeTop} width={3 * u} height={hOrange} fill="#F4B400" stroke={INK} strokeWidth={2} />
      <rect x={x0 + 3 * u} y={yPinkTop} width={6 * u} height={hPink} fill="#F6B8CD" stroke={INK} strokeWidth={2} />
      <g className="font-display" fontWeight={800}>
        <text x={x0 + 1.5 * u} y={yOrangeTop + hOrange / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize={14} fill={INK}>7 cm²</text>
        <text x={x0 + 6 * u} y={yPinkTop + hPink / 2} textAnchor="middle" dominantBaseline="central" fontSize={16} fill={INK}>50 cm²</text>
        <text x={x0 + 4.5 * u} y={yGreenTop + hGreen / 2} textAnchor="middle" dominantBaseline="central" fontSize={16} fill={INK}>33 cm²</text>
        <text x={x0 + 1.5 * u} y={yOrangeTop - 8} textAnchor="middle" fontSize={13} fill={INK}>3 cm</text>
        <text x={x0 - 16} y={(yOrangeTop + yBase) / 2} textAnchor="middle" dominantBaseline="central" fontSize={13} fill={INK} transform={`rotate(-90 ${x0 - 16} ${(yOrangeTop + yBase) / 2})`}>6 cm</text>
        <text x={x0 + 9 * u + 18} y={(yPinkTop + yBase) / 2} textAnchor="middle" dominantBaseline="central" fontSize={14} fill="#D7263D" transform={`rotate(90 ${x0 + 9 * u + 18} ${(yPinkTop + yBase) / 2})`}>? cm</text>
      </g>
      {region === 'leftCol' && <rect x={x0} y={yOrangeTop} width={3 * u} height={hOrange + hGreen} fill="#19A7CE2E" stroke="#19A7CE" strokeWidth={3.6} strokeDasharray="8 5" />}
      {region === 'strip' && <rect x={x0} y={yGreenTop} width={3 * u} height={hGreen} fill="#19A7CE2E" stroke="#19A7CE" strokeWidth={3.6} strokeDasharray="8 5" />}
      {region === 'greenWidth' && (
        <g>
          {[0, 1, 2].map((k) => (
            <rect key={k} x={x0 + 3 * k * u} y={yGreenTop} width={3 * u} height={hGreen} fill="#19A7CE22" stroke="#19A7CE" strokeWidth={3} strokeDasharray="8 5" />
          ))}
        </g>
      )}
      {region === 'pinkWidth' && <rect x={x0 + 3 * u} y={yPinkTop} width={6 * u} height={hPink} fill="#19A7CE2E" stroke="#19A7CE" strokeWidth={3.6} strokeDasharray="8 5" />}
      {region === 'rightCol' && <rect x={x0 + 3 * u} y={yPinkTop} width={6 * u} height={hPink + hGreen} fill="#19A7CE2E" stroke="#19A7CE" strokeWidth={3.6} strokeDasharray="8 5" />}
    </svg>
  )
}
export function ThreeRectanglesG3Illustration() {
  return (
    <Frame aria="An L-arrangement of three rectangles: orange seven square centimetres above-left, pink fifty square centimetres above-right, green thirty-three square centimetres across the bottom. The orange is three centimetres wide, the left side is six centimetres, and the right side is marked with a question mark.">
      <ThreeRectangles region={null} />
    </Frame>
  )
}

/* ------------------------------------------------------------------ Q22 —
 * The 5×7 spiral grid. Numbers 1–5 repeat along a counterclockwise spiral
 * starting at the top-right corner (verified against every printed cell):
 * outer ring 20 cells closes exactly; the path coils inward and fills the
 * blanks. Red block rows 2-3 × cols 4-5 (0-indexed) → 3+2+5+1 = 11. */
export const SPIRAL_PATH: Array<[number, number]> = (() => {
  const path: Array<[number, number]> = []
  // counterclockwise rings, outer to inner, starting top-right of each ring
  let top = 0, bottom = 4, left = 0, right = 6
  while (top <= bottom && left <= right) {
    for (let c = right; c >= left; c--) path.push([top, c])
    for (let r = top + 1; r <= bottom; r++) path.push([r, left])
    if (bottom > top) for (let c = left + 1; c <= right; c++) path.push([bottom, c])
    if (right > left) for (let r = bottom - 1; r > top; r--) path.push([r, right])
    top++; bottom--; left++; right--
  }
  return path
})()
export const SPIRAL_VALUES: number[][] = (() => {
  const grid = Array.from({ length: 5 }, () => Array<number>(7).fill(0))
  SPIRAL_PATH.forEach(([r, c], i) => {
    grid[r][c] = (i % 5) + 1
  })
  return grid
})()
/** Cells printed in the paper (everything except rows 2-3 × cols 2-5). */
export const SPIRAL_GIVEN = (r: number, c: number) => !(r >= 2 && r <= 3 && c >= 2 && c <= 5)
export const SPIRAL_RED = (r: number, c: number) => r >= 2 && r <= 3 && c >= 4 && c <= 5

export function SpiralGrid({ revealUpto, showPath }: { revealUpto?: number; showPath?: boolean }) {
  const s = 50
  const upto = revealUpto ?? -1
  const idxOf = new Map(SPIRAL_PATH.map(([r, c], i) => [`${r},${c}`, i]))
  return (
    <svg viewBox={`0 0 ${16 + 7 * s} ${16 + 5 * s}`} width="100%" style={{ maxWidth: 380, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {SPIRAL_VALUES.map((row, r) =>
        row.map((v, c) => {
          const given = SPIRAL_GIVEN(r, c)
          const red = SPIRAL_RED(r, c)
          const i = idxOf.get(`${r},${c}`) ?? 0
          const revealed = given || i <= upto
          const active = i === upto && !given
          return (
            <g key={`${r}-${c}`}>
              <rect x={8 + c * s} y={8 + r * s} width={s} height={s} fill={red ? '#E5333E' : 'white'} stroke={INK} strokeWidth={2} />
              {active && <rect x={11 + c * s} y={11 + r * s} width={s - 6} height={s - 6} fill="none" stroke="#F4B400" strokeWidth={4} />}
              {revealed && (
                <text x={8 + c * s + s / 2} y={8 + r * s + s / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={800} fill={red ? 'white' : given ? INK : BLUE} className="font-display">
                  {v}
                </text>
              )}
            </g>
          )
        }),
      )}
      {showPath && (
        <g opacity={0.85}>
          <path
            d={SPIRAL_PATH.map(([r, c], i) => `${i === 0 ? 'M' : 'L'} ${8 + c * s + s / 2} ${8 + r * s + s / 2}`).join(' ')}
            fill="none"
            stroke="#19A7CE"
            strokeWidth={3.4}
            strokeLinejoin="round"
            strokeDasharray="6 5"
          />
          <circle cx={8 + 6 * s + s / 2} cy={8 + s / 2} r={6} fill="#19A7CE" />
        </g>
      )}
    </svg>
  )
}
export function SpiralGridG3Illustration() {
  return (
    <Frame aria="A five-by-seven grid of the numbers one to five with a blank middle; four cells are shaded red.">
      <SpiralGrid />
    </Frame>
  )
}

/* ------------------------------------------------------------------ Q23 —
 * Football results table. Solved grid (verified: totals M10 T8 H11 A1 W5 I5,
 * total points 40 = 10 wins × 3 + 5 draws × 2):
 *   M: -, W, L, W, W, D = 10      T: L, -, D, W, D, W = 8
 *   H: W, D, -, D, W, W = 11      A: L, L, D, -, L, L = 1
 *   W: L, D, L, W, -, D = 5       I: D, L, L, W, D, - = 5
 * 'given' marks the symbols printed in the paper. */
export const TEAMS = ['M', 'T', 'H', 'A', 'W', 'I'] as const
export type Cell = { v: 'W' | 'L' | 'D'; given: boolean }
const c = (v: 'W' | 'L' | 'D', given: boolean): Cell => ({ v, given })
export const FOOTBALL: Array<Array<Cell | null>> = [
  [null, c('W', true), c('L', false), c('W', false), c('W', false), c('D', true)],
  [c('L', true), null, c('D', true), c('W', true), c('D', false), c('W', false)],
  [c('W', true), c('D', true), null, c('D', true), c('W', true), c('W', false)],
  [c('L', true), c('L', true), c('D', true), null, c('L', true), c('L', true)],
  [c('L', true), c('D', false), c('L', false), c('W', true), null, c('D', true)],
  [c('D', true), c('L', false), c('L', false), c('W', false), c('D', true), null],
]
export const FOOTBALL_PTS: Record<string, number | null> = { M: null, T: 8, H: 11, A: 1, W: 5, I: null }
export const SYMBOL: Record<'W' | 'L' | 'D', string> = { W: '○', L: '×', D: '△' }
export const SYMBOL_COLOR: Record<'W' | 'L' | 'D', string> = { W: '#1F2937', L: '#DC2626', D: '#E2A33C' }

export function FootballBoard({ revealKeys, pts }: { revealKeys?: Set<string>; pts?: Partial<Record<string, number>> }) {
  const s = 44
  const x0 = 50, y0 = 40
  return (
    <svg viewBox={`0 0 ${x0 + 7 * s + 64} ${y0 + 6 * s + 10}`} width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {TEAMS.map((t, i) => (
        <g key={t} className="font-display" fontWeight={800}>
          <rect x={x0 + i * s} y={y0 - 30} width={s} height={30} fill="#BBD6F0" stroke={INK} strokeWidth={1.4} />
          <text x={x0 + i * s + s / 2} y={y0 - 14} textAnchor="middle" dominantBaseline="central" fontSize={15} fill={INK}>{t}</text>
          <rect x={x0 - 44} y={y0 + i * s} width={44} height={s} fill="#BBD6F0" stroke={INK} strokeWidth={1.4} />
          <text x={x0 - 22} y={y0 + i * s + s / 2} textAnchor="middle" dominantBaseline="central" fontSize={15} fill={INK}>{t}</text>
        </g>
      ))}
      <rect x={x0 + 6 * s} y={y0 - 30} width={62} height={30} fill="#F3C6D3" stroke={INK} strokeWidth={1.4} />
      <text x={x0 + 6 * s + 31} y={y0 - 14} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill={INK} className="font-display">Pts</text>
      {TEAMS.map((rowT, r) =>
        TEAMS.map((colT, cl) => {
          const cell = FOOTBALL[r][cl]
          const key = `${rowT}${colT}`
          const shown = cell && (cell.given || (revealKeys?.has(key) ?? false))
          return (
            <g key={key}>
              <rect x={x0 + cl * s} y={y0 + r * s} width={s} height={s} fill={r === cl ? '#E2E8F0' : 'white'} stroke={INK} strokeWidth={1.4} />
              {r === cl && <text x={x0 + cl * s + s / 2} y={y0 + r * s + s / 2} textAnchor="middle" dominantBaseline="central" fontSize={15} fill="#94A3B8">–</text>}
              {shown && cell && (
                <text x={x0 + cl * s + s / 2} y={y0 + r * s + s / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={900} fill={cell.given ? SYMBOL_COLOR[cell.v] : '#19A7CE'} className="font-display">
                  {SYMBOL[cell.v]}
                </text>
              )}
            </g>
          )
        }),
      )}
      {TEAMS.map((t, r) => {
        const fixed = FOOTBALL_PTS[t]
        const dyn = pts?.[t]
        const val = fixed ?? dyn
        return (
          <g key={t}>
            <rect x={x0 + 6 * s} y={y0 + r * s} width={62} height={s} fill="white" stroke={INK} strokeWidth={1.4} />
            {val != null && (
              <text x={x0 + 6 * s + 31} y={y0 + r * s + s / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={900} fill={fixed != null ? INK : '#19A7CE'} className="font-display">
                {val}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
export function FootballTableG3Illustration() {
  return (
    <Frame aria="A six-team results table with circles for wins, crosses for losses and triangles for draws; several cells and the points for teams M and I are blank.">
      <FootballBoard />
    </Frame>
  )
}
