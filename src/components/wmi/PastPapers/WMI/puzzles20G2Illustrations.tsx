// Puzzle-figure illustrations for WMI-20F2A, reconstructed from the scans.
// Data constants are exported so the batch-2 explainers bind to the same values.

const INK = '#1F2937'

function Frame({ aria, children }: { aria: string; children: React.ReactNode }) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2" role="img" aria-label={aria}>
      {children}
    </div>
  )
}

/* ---------- Q18: row/column sums grid (circle 21, pentagon 8, square 13) ---------- */
// Rows: ◯◯⬠=50, ⬠⬠◻=29, ◻⬠◻=34; columns: 42, 37, 34. Unique solution:
// p=8 (3p=24 from p+2s and 2p+s), s=13, c=21 → ◻×⬠ = 104.
export type ShapeKind = 'c' | 'p' | 's'
export const GRID18: ShapeKind[][] = [
  ['c', 'c', 'p'],
  ['p', 'p', 's'],
  ['s', 'p', 's'],
]
export const ROW_SUMS18 = [50, 29, 34]
export const COL_SUMS18 = [42, 37, 34]
export const VALUES18: Record<ShapeKind, number> = { c: 21, p: 8, s: 13 }

export function Shape18({ kind, x, y, r = 16, label }: { kind: ShapeKind; x: number; y: number; r?: number; label?: number | null }) {
  const shape =
    kind === 'c' ? (
      <circle cx={x} cy={y} r={r} fill="#F8C8DC" stroke="#B25D85" strokeWidth={2} />
    ) : kind === 'p' ? (
      <polygon
        points={Array.from({ length: 5 }, (_, i) => {
          const a = (i * 72 - 90) * (Math.PI / 180)
          return `${x + Math.cos(a) * r},${y + Math.sin(a) * r}`
        }).join(' ')}
        fill="#FCE0B6"
        stroke="#C98A3D"
        strokeWidth={2}
      />
    ) : (
      <rect x={x - r + 2} y={y - r + 2} width={2 * r - 4} height={2 * r - 4} fill="#BDE3F0" stroke="#23647E" strokeWidth={2} />
    )
  return (
    <g>
      {shape}
      {label != null && (
        <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={900} fill={INK} className="font-display">
          {label}
        </text>
      )}
    </g>
  )
}

export function GridSums18Figure({ values }: { values?: Partial<Record<ShapeKind, number>> }) {
  const CELL = 46
  const X0 = 70, Y0 = 8
  return (
    <svg viewBox="0 0 280 200" width="100%" style={{ maxWidth: 300, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {GRID18.map((row, r) =>
        row.map((k, c) => (
          <g key={`${r}-${c}`}>
            <rect x={X0 + c * CELL} y={Y0 + r * CELL} width={CELL} height={CELL} fill="white" stroke={INK} strokeWidth={1.6} />
            <Shape18 kind={k} x={X0 + c * CELL + CELL / 2} y={Y0 + r * CELL + CELL / 2} label={values?.[k] ?? null} />
          </g>
        )),
      )}
      {ROW_SUMS18.map((s, r) => (
        <text key={r} x={X0 + 3 * CELL + 18} y={Y0 + r * CELL + CELL / 2} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={900} fill={INK} className="font-display">
          {s}
        </text>
      ))}
      {COL_SUMS18.map((s, c) => (
        <text key={c} x={X0 + c * CELL + CELL / 2} y={Y0 + 3 * CELL + 18} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={900} fill={INK} className="font-display">
          {s}
        </text>
      ))}
    </svg>
  )
}

export function GridSumsG2Illustration() {
  return (
    <Frame aria="A three-by-three grid of shapes. Row sums: circle circle pentagon 50; pentagon pentagon square 29; square pentagon square 34. Column sums: 42, 37, 34. Find square times pentagon.">
      <GridSums18Figure />
    </Frame>
  )
}

/* ---------- Q19: ♣♣♣♣ + ♥♥♥♥ = ♠333♦ ---------- */
export function RepdigitAddFigure({ reveal }: { reveal?: boolean }) {
  const D = 34
  const row = (y: number, cells: Array<{ t: string; color?: string }>, xEnd: number) =>
    cells.map((cell, i) => (
      <text key={i} x={xEnd - (cells.length - 1 - i) * D} y={y} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={900} fill={cell.color ?? INK} className="font-display">
        {cell.t}
      </text>
    ))
  const club = { t: reveal ? '?' : '♣', color: '#1F7A33' }
  const heart = { t: reveal ? '?' : '♥', color: '#D7263D' }
  return (
    <svg viewBox="0 0 280 170" width="100%" style={{ maxWidth: 280, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {row(30, [club, club, club, club], 240)}
      <text x={62} y={64} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={900} fill={INK}>+</text>
      {row(64, [heart, heart, heart, heart], 240)}
      <line x1={48} y1={88} x2={258} y2={88} stroke={INK} strokeWidth={2.5} />
      {row(116, [{ t: '♠', color: '#444' }, { t: '3' }, { t: '3' }, { t: '3' }, { t: '♦', color: '#E0408A' }], 240)}
    </svg>
  )
}

export function RepdigitAddG2Illustration() {
  return (
    <Frame aria="A vertical addition: a four-digit number of identical club digits plus a four-digit number of identical heart digits equals the five-digit number spade 3 3 3 diamond.">
      <RepdigitAddFigure />
    </Frame>
  )
}

/* ---------- Q21: the eight nets ---------- */
export const NETS21: Array<{ cells: Array<[number, number]>; folds: boolean }> = [
  { cells: [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1], [3, 1]], folds: true },
  { cells: [[1, 0], [1, 1], [1, 2], [1, 3], [0, 2], [2, 1]], folds: true },
  { cells: [[1, 0], [1, 1], [1, 2], [1, 3], [0, 1], [2, 1]], folds: true },
  { cells: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 2], [1, 3]], folds: false },
  { cells: [[0, 0], [1, 0], [1, 1], [1, 2], [1, 3], [2, 3]], folds: true },
  { cells: [[0, 1], [1, 1], [2, 0], [2, 1], [2, 2], [2, 3]], folds: false },
  { cells: [[0, 2], [0, 3], [1, 1], [1, 2], [2, 0], [2, 1]], folds: true },
  { cells: [[0, 2], [0, 3], [1, 2], [2, 0], [2, 1], [2, 2]], folds: false },
]
export const NET_FOLD_COUNT = NETS21.filter((n) => n.folds).length // 5

export function NetFigure({ cells, size = 17, verdict }: { cells: Array<[number, number]>; size?: number; verdict?: boolean | null }) {
  const maxC = Math.max(...cells.map(([, c]) => c)) + 1
  const maxR = Math.max(...cells.map(([r]) => r)) + 1
  return (
    <g>
      {cells.map(([r, c], i) => (
        <rect key={i} x={c * size} y={r * size} width={size} height={size} fill={verdict == null ? '#D7E8D0' : verdict ? '#BBE5C8' : '#F6C6C6'} stroke={INK} strokeWidth={1.4} />
      ))}
      {verdict != null && (
        <text x={maxC * size + 10} y={(maxR * size) / 2} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={900} fill={verdict ? '#059669' : '#DC2626'}>
          {verdict ? '✓' : '✗'}
        </text>
      )}
    </g>
  )
}

export function CubeNetsFigure({ verdicts }: { verdicts?: Array<boolean | null> }) {
  return (
    <svg viewBox="0 0 420 200" width="100%" style={{ maxWidth: 440, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {NETS21.map((net, i) => {
        const col = i % 4
        const row = Math.floor(i / 4)
        return (
          <g key={i} transform={`translate(${16 + col * 102}, ${14 + row * 96})`}>
            <NetFigure cells={net.cells} verdict={verdicts?.[i] ?? null} />
          </g>
        )
      })}
    </svg>
  )
}

export function CubeNetsG2Illustration() {
  return (
    <Frame aria="Eight flat figures made of six squares each. Five of them can be folded into a cube.">
      <CubeNetsFigure />
    </Frame>
  )
}

/* ---------- Q22: the three balance scales ---------- */
// Blocks: ▲=3, ◼=2 or 3, ⬡=3 or 2, ●=3, ★=5 (▲+●=6). Scale 1 balanced,
// scale 2 left (★⬡) heavier, scale 3 right (▲●) heavier.
export function Glyph22({ t, x, y }: { t: '▲' | '◼' | '⬡' | '●' | '★'; x: number; y: number }) {
  const color: Record<string, string> = { '▲': '#F08080', '◼': '#9B8EC4', '⬡': '#7CB342', '●': '#2D9CDB', '★': '#F2994A' }
  return (
    <g>
      <rect x={x - 13} y={y - 13} width={26} height={26} rx={3} fill="white" stroke="#6B7280" strokeWidth={1.6} />
      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize={15} fill={color[t]}>
        {t}
      </text>
    </g>
  )
}

export function Scale22({ left, right, tilt, x }: { left: string[]; right: string[]; tilt: 'level' | 'left' | 'right'; x: number }) {
  const dy = tilt === 'level' ? 0 : 9
  const lY = tilt === 'left' ? dy : tilt === 'right' ? -dy : 0
  const rY = -lY
  return (
    <g transform={`translate(${x}, 0)`}>
      <polygon points="0,86 -13,108 13,108" fill="#2D9CDB" />
      <line x1={-58} y1={70 + lY} x2={58} y2={70 + rY} stroke="#8B5A2B" strokeWidth={5} strokeLinecap="round" />
      {[-1, 1].map((side) => {
        const py = (side === -1 ? lY : rY) + 70
        const blocks = side === -1 ? left : right
        return (
          <g key={side}>
            <line x1={side * 44} y1={py} x2={side * 44} y2={py - 12} stroke="#6B7280" strokeWidth={2} />
            <line x1={side * 44 - 26} y1={py - 12} x2={side * 44 + 26} y2={py - 12} stroke="#6B7280" strokeWidth={3} />
            {blocks.map((b, i) =>
              blocks.length === 3 && i === 0 ? (
                <Glyph22 key={i} t={b as never} x={side * 44 - 7} y={py - 40} />
              ) : (
                <Glyph22 key={i} t={b as never} x={side * 44 + (i - (blocks.length === 3 ? 1.5 : (blocks.length - 1) / 2)) * 27 + 13} y={py - 26} />
              ),
            )}
          </g>
        )
      })}
    </g>
  )
}

export function BalanceScalesFigure() {
  return (
    <svg viewBox="0 0 420 120" width="100%" style={{ maxWidth: 440, display: 'block', margin: '0 auto' }} aria-hidden="true">
      <Scale22 x={70} left={['▲', '◼', '⬡']} right={['●', '★']} tilt="level" />
      <Scale22 x={210} left={['★', '⬡']} right={['◼', '●']} tilt="left" />
      <Scale22 x={350} left={['◼', '⬡']} right={['▲', '●']} tilt="right" />
    </svg>
  )
}

export function BalanceScalesG2Illustration() {
  return (
    <Frame aria="Three balance scales with blocks marked triangle, square, hexagon, circle, and star. The first is balanced: triangle, square, hexagon versus circle, star. The second tips left: star, hexagon versus square, circle. The third tips right: square, hexagon versus triangle, circle.">
      <BalanceScalesFigure />
    </Frame>
  )
}

/* ---------- Q23: sudoku with expression givens ---------- */
// Givens (as printed expressions): (0,0) 2×2=4, (0,1) 1×1=1, (1,1) 1+1=2,
// (2,2) 9−8=1, (3,3) 10−6=4. Marked cells: ✕ at (2,3), ✚ at (3,0).
// Unique Latin solution: 4132 / 3241 ... see solver note in the explainer.
export const SUDOKU23_GIVENS: Array<{ r: number; c: number; expr: string; value: number }> = [
  { r: 0, c: 0, expr: '2×2', value: 4 },
  { r: 0, c: 1, expr: '1×1', value: 1 },
  { r: 1, c: 1, expr: '1+1', value: 2 },
  { r: 2, c: 2, expr: '9−8', value: 1 },
  { r: 3, c: 3, expr: '10−6', value: 4 },
]
export const SUDOKU23_SOLUTION = [
  [4, 1, 3, 2],
  [3, 2, 4, 1],
  [2, 4, 1, 3],
  [1, 3, 2, 4],
]
export const SUDOKU23_MARKS: Array<{ r: number; c: number; mark: string; color: string }> = [
  { r: 2, c: 3, mark: '✕', color: '#19A7CE' },
  { r: 3, c: 0, mark: '✚', color: '#E0408A' },
]

export function Sudoku23Figure({ solved = {}, activeKeys = [] }: { solved?: Record<string, number>; activeKeys?: string[] }) {
  const CELL = 52
  const active = new Set(activeKeys)
  return (
    <svg viewBox="0 0 230 230" width="100%" style={{ maxWidth: 250, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {Array.from({ length: 4 }, (_, r) =>
        Array.from({ length: 4 }, (__, c) => {
          const given = SUDOKU23_GIVENS.find((g) => g.r === r && g.c === c)
          const mark = SUDOKU23_MARKS.find((m) => m.r === r && m.c === c)
          const val = solved[`${r}-${c}`]
          const isActive = active.has(`${r}-${c}`)
          return (
            <g key={`${r}-${c}`}>
              <rect x={11 + c * CELL} y={11 + r * CELL} width={CELL} height={CELL} fill={isActive ? 'rgba(16,185,129,0.15)' : 'white'} stroke={INK} strokeWidth={1.8} />
              {given && (
                <text x={11 + c * CELL + CELL / 2} y={11 + r * CELL + CELL / 2} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={800} fill={INK} className="font-display">
                  {given.expr}
                </text>
              )}
              {!given && mark && val === undefined && (
                <text x={11 + c * CELL + CELL / 2} y={11 + r * CELL + CELL / 2} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill={mark.color}>
                  {mark.mark}
                </text>
              )}
              {!given && val !== undefined && (
                <text x={11 + c * CELL + CELL / 2} y={11 + r * CELL + CELL / 2} textAnchor="middle" dominantBaseline="central" fontSize={21} fontWeight={900} fill={isActive ? '#059669' : INK} className="font-display">
                  {val}
                </text>
              )}
            </g>
          )
        }),
      )}
    </svg>
  )
}

export function SudokuExprG2Illustration() {
  return (
    <Frame aria="A four-by-four sudoku. Five squares hold little expressions giving their values: 2 times 2, 1 times 1, 1 plus 1, 9 minus 8, and 10 minus 6. Two squares are marked with a blue cross and a pink plus; find their sum.">
      <Sudoku23Figure />
    </Frame>
  )
}

/* ---------- Q25: the cross-shaped digit grid ---------- */
// null = no cell. Transcribed from the scan; contains three horizontal and
// three vertical runs of 2 4 6 8.
export const DIGIT_GRID25: Array<Array<number | null>> = [
  [null, null, null, 5, 2, 4, 6, null, null, null],
  [null, null, null, 7, 4, 1, 3, null, null, null],
  [null, null, 6, 8, 6, 3, 8, 7, null, null],
  [4, 3, 8, 1, 8, 8, 2, 4, 6, 8],
  [6, 8, 3, 5, 7, 3, 2, 4, 6, 8],
  [1, 3, 2, 4, 6, 2, 4, 6, 3, 2],
  [3, 9, 4, 1, 2, 4, 6, 8, 2, 4],
  [null, null, 6, 8, 4, 6, 5, 2, null, null],
  [null, null, null, 4, 6, 8, 7, null, null, null],
  [null, null, null, 6, 8, 7, 1, null, null, null],
]
export const RUNS25: Array<{ cells: Array<[number, number]>; dir: 'h' | 'v' }> = [
  { dir: 'h', cells: [[3, 6], [3, 7], [3, 8], [3, 9]] },
  { dir: 'h', cells: [[4, 6], [4, 7], [4, 8], [4, 9]] },
  { dir: 'h', cells: [[6, 4], [6, 5], [6, 6], [6, 7]] },
  { dir: 'v', cells: [[0, 4], [1, 4], [2, 4], [3, 4]] },
  { dir: 'v', cells: [[5, 5], [6, 5], [7, 5], [8, 5]] },
  { dir: 'v', cells: [[6, 4], [7, 4], [8, 4], [9, 4]] },
]

export function DigitGrid25Figure({ upto = -1 }: { upto?: number }) {
  const CELL = 30
  const inRun = (r: number, c: number) => {
    for (let i = 0; i <= upto && i < RUNS25.length; i++) {
      if (RUNS25[i].cells.some(([rr, cc]) => rr === r && cc === c)) return i === upto ? 'now' : 'done'
    }
    return null
  }
  return (
    <svg viewBox="0 0 320 320" width="100%" style={{ maxWidth: 330, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {DIGIT_GRID25.map((row, r) =>
        row.map((v, c) => {
          if (v == null) return null
          const state = inRun(r, c)
          return (
            <g key={`${r}-${c}`}>
              <rect x={10 + c * CELL} y={10 + r * CELL} width={CELL} height={CELL} fill={state === 'now' ? 'rgba(16,185,129,0.25)' : state === 'done' ? 'rgba(37,99,235,0.15)' : 'white'} stroke="#E08C8C" strokeWidth={1.2} />
              <text x={10 + c * CELL + CELL / 2} y={10 + r * CELL + CELL / 2} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={700} fill={INK} className="font-display">
                {v}
              </text>
            </g>
          )
        }),
      )}
    </svg>
  )
}

export function DigitGridG2Illustration() {
  return (
    <Frame aria="A cross-shaped grid of digits. Somewhere inside, the run 2 4 6 8 appears six times, reading across or down.">
      <DigitGrid25Figure />
    </Frame>
  )
}
