// Scene illustrations + shared data for WMI-21F2A.

const INK = '#1F2937'
const BLUE = '#30598A'

function Frame({ aria, children }: { aria: string; children: React.ReactNode }) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2" role="img" aria-label={aria}>
      {children}
    </div>
  )
}

/* Q2 — the four zigzag lines on a 3×3 grid, edge-verified from the scan.
 * H[y][x] = unit edge on horizontal grid line y (0..3) starting at x (0..2);
 * V[band][x] = vertical edge at column x (0..3) in band y..y+1.
 * Segment counts: A 8+6=14, B 8+5=13, C 7+8=15 ✓ longest, D 10+3=13. */
export interface LineFig {
  H: string[]
  V: string[]
}
export const LINES2: Record<string, LineFig> = {
  A: { H: ['H..', 'H.H', 'H.H', 'HHH'], V: ['V..V', '.VV.', 'V..V'] },
  B: { H: ['HH.', 'H.H', 'H.H', 'HH.'], V: ['V.V.', '...V', 'V.V.'] },
  C: { H: ['H.H', 'H.H', '.H.', 'H.H'], V: ['.VV.', 'V..V', 'VVVV'] },
  D: { H: ['HHH', 'HH.', 'HH.', 'HHH'], V: ['V...', '..V.', 'V...'] },
}
export const lineCounts = (f: LineFig) => {
  const h = f.H.join('').split('').filter((c) => c === 'H').length
  const v = f.V.join('').split('').filter((c) => c === 'V').length
  return { h, v, total: h + v }
}
export function LineFigure({ fig, size = 30, showCount }: { fig: LineFig; size?: number; showCount?: boolean }) {
  const c = lineCounts(fig)
  return (
    <svg viewBox={`0 0 ${3 * size + 12} ${3 * size + (showCount ? 30 : 12)}`} width={3 * size + 12} aria-hidden="true">
      {fig.H.map((row, y) =>
        row.split('').map((ch, x) =>
          ch === 'H' ? <line key={`h${y}${x}`} x1={6 + x * size} y1={6 + y * size} x2={6 + (x + 1) * size} y2={6 + y * size} stroke={INK} strokeWidth={4.5} strokeLinecap="round" /> : null,
        ),
      )}
      {fig.V.map((row, b) =>
        row.split('').map((ch, x) =>
          ch === 'V' ? <line key={`v${b}${x}`} x1={6 + x * size} y1={6 + b * size} x2={6 + x * size} y2={6 + (b + 1) * size} stroke={INK} strokeWidth={4.5} strokeLinecap="round" /> : null,
        ),
      )}
      {showCount && (
        <text x={(3 * size + 12) / 2} y={3 * size + 24} textAnchor="middle" fontSize={13} fontWeight={800} fill={BLUE} className="font-display">
          {c.h} + {c.v} = {c.total}
        </text>
      )}
    </svg>
  )
}
export function Lines21G2Illustration() {
  return (
    <Frame aria="Four black zigzag lines labelled A to D drawn on unit grids.">
      <div className="flex flex-wrap items-end justify-center gap-4 py-1">
        {(['A', 'B', 'C', 'D'] as const).map((k) => (
          <div key={k} className="flex flex-col items-center gap-1">
            <LineFigure fig={LINES2[k]} />
            <span className="font-display text-sm font-extrabold text-gray-600">({k})</span>
          </div>
        ))}
      </div>
    </Frame>
  )
}

/* Q11 — money tallies (read from the scan): $100×4, $20×6, $10×2, $5×3, $1×8 = 563. */
export const MONEY11: Array<{ value: number; count: number }> = [
  { value: 100, count: 4 },
  { value: 20, count: 6 },
  { value: 10, count: 2 },
  { value: 5, count: 3 },
  { value: 1, count: 8 },
]
export function Tally({ n, x, y }: { n: number; x: number; y: number }) {
  const groups: React.ReactNode[] = []
  let drawn = 0
  let gx = x
  while (drawn < n) {
    const g = Math.min(5, n - drawn)
    groups.push(
      <g key={drawn}>
        {Array.from({ length: Math.min(g, 4) }, (_, i) => (
          <line key={i} x1={gx + i * 7} y1={y} x2={gx + i * 7} y2={y + 24} stroke="#D7263D" strokeWidth={3} strokeLinecap="round" />
        ))}
        {g === 5 && <line x1={gx - 4} y1={y + 20} x2={gx + 25} y2={y + 4} stroke="#D7263D" strokeWidth={3} strokeLinecap="round" />}
      </g>,
    )
    drawn += g
    gx += 38
  }
  return <g>{groups}</g>
}
export function Money21G2Illustration() {
  return (
    <Frame aria="Five money columns: one hundred dollars tallied four, twenty dollars tallied six, ten dollars tallied two, five dollars tallied three, one dollar tallied eight.">
      <svg viewBox="0 0 420 130" width="100%" style={{ maxWidth: 440, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {MONEY11.map((m, i) => (
          <g key={m.value}>
            <rect x={10 + i * 82} y={8} width={74} height={42} rx={6} fill="#DCE8D4" stroke={INK} strokeWidth={1.8} />
            <text x={47 + i * 82} y={30} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={900} fill={INK} className="font-display">${m.value}</text>
            <rect x={10 + i * 82} y={54} width={74} height={62} rx={6} fill="white" stroke={INK} strokeWidth={1.8} />
            <Tally n={m.count} x={26 + i * 82} y={72} />
          </g>
        ))}
      </svg>
    </Frame>
  )
}

/* Q13 — the seven words. Letter counts: A 8, E 7, P 6, N 5. */
export const WORDS13 = ['APPLE', 'PENCIL', 'ERASER', 'AIRPLANE', 'ELEPHANT', 'BANANA', 'PIG']
export const countLetter = (letter: string) => WORDS13.reduce((sum, w) => sum + w.split('').filter((ch) => ch === letter).length, 0)
export function Words21G2({ markLetter }: { markLetter?: string }) {
  return (
    <svg viewBox="0 0 420 130" width="100%" style={{ maxWidth: 440, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {WORDS13.map((w, i) => {
        const x = 14 + (i % 4) * 104
        const y = 24 + Math.floor(i / 4) * 56
        return (
          <g key={w}>
            {w.split('').map((ch, k) => (
              <text key={k} x={x + k * 12} y={y} fontSize={14.5} fontWeight={800} fill={markLetter === ch ? '#D7263D' : INK} className="font-display" style={markLetter === ch ? { textDecoration: 'underline' } : undefined}>
                {ch}
              </text>
            ))}
          </g>
        )
      })}
    </svg>
  )
}
export function Words21G2Illustration() {
  return (
    <Frame aria="The words APPLE, PENCIL, ERASER, AIRPLANE, ELEPHANT, BANANA, PIG.">
      <Words21G2 />
    </Frame>
  )
}

/* Q14 — the L-tetromino and the six figures, with solver-verified two-piece
 * splits (rotations only, no flips). Figure 4 is the impossible one. */
export type Cells = Array<[number, number]>
export const L_PIECE: Cells = [[1, 1], [1, 2], [1, 3], [0, 3]]
export const FIGURES14: Array<{ cells: Cells; split: { a: Cells; b: Cells } | null }> = [
  {
    cells: [[1, 3], [1, 4], [2, 3], [2, 4], [3, 1], [3, 2], [3, 3], [3, 4]],
    split: { a: [[2, 3], [3, 1], [3, 2], [3, 3]], b: [[1, 3], [1, 4], [2, 4], [3, 4]] },
  },
  {
    cells: [[1, 3], [1, 4], [2, 1], [2, 2], [2, 3], [2, 4], [3, 1], [3, 4]],
    split: { a: [[2, 1], [2, 2], [2, 3], [3, 1]], b: [[1, 3], [1, 4], [2, 4], [3, 4]] },
  },
  {
    cells: [[1, 1], [1, 2], [1, 3], [1, 4], [2, 1], [2, 2], [2, 3], [2, 4]],
    split: { a: [[1, 4], [2, 2], [2, 3], [2, 4]], b: [[1, 1], [1, 2], [1, 3], [2, 1]] },
  },
  {
    cells: [[1, 2], [1, 3], [1, 4], [2, 1], [2, 2], [2, 3], [2, 4], [3, 4]],
    split: null,
  },
  {
    cells: [[1, 2], [1, 3], [1, 4], [2, 2], [2, 3], [3, 1], [3, 2], [3, 3]],
    split: { a: [[2, 3], [3, 1], [3, 2], [3, 3]], b: [[1, 2], [1, 3], [1, 4], [2, 2]] },
  },
  {
    cells: [[1, 1], [1, 2], [1, 3], [2, 1], [2, 3], [3, 1], [3, 2], [3, 3]],
    split: { a: [[2, 3], [3, 1], [3, 2], [3, 3]], b: [[1, 1], [1, 2], [1, 3], [2, 1]] },
  },
]
export function CellsShape({ cells, size = 18, colorOf }: { cells: Cells; size?: number; colorOf?: (cell: [number, number]) => string }) {
  const minR = Math.min(...cells.map((c) => c[0]))
  const minC = Math.min(...cells.map((c) => c[1]))
  const maxR = Math.max(...cells.map((c) => c[0]))
  const maxC = Math.max(...cells.map((c) => c[1]))
  const w = (maxC - minC + 1) * size + 6
  const h = (maxR - minR + 1) * size + 6
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} aria-hidden="true">
      {cells.map(([r, c]) => (
        <rect
          key={`${r}-${c}`}
          x={3 + (c - minC) * size}
          y={3 + (r - minR) * size}
          width={size}
          height={size}
          fill={colorOf ? colorOf([r, c]) : '#C5BCE0'}
          stroke={INK}
          strokeWidth={1.5}
        />
      ))}
    </svg>
  )
}
export function Pieces21G2Illustration() {
  return (
    <Frame aria="An L-shaped piece of four squares, and six candidate figures of eight squares each.">
      <div className="flex flex-col items-center gap-2 py-1">
        <div className="flex items-center gap-2">
          <span className="font-display text-xs font-bold text-gray-500">piece:</span>
          <CellsShape cells={L_PIECE} colorOf={() => '#F4B400'} />
          <span className="font-display text-xs font-bold text-gray-500">× 2, rotate only</span>
        </div>
        <div className="flex flex-wrap items-end justify-center gap-3">
          {FIGURES14.map((f, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <CellsShape cells={f.cells} />
              <span className="font-display text-xs font-extrabold text-gray-600">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  )
}

/* Q15 — the lidless-box net (2×2 base, four 2×2 walls). */
export function BoxNet21G2({ liftLayers }: { liftLayers?: number }) {
  const s = 26
  const cell = (cx: number, cy: number, fill: string) => (
    <rect x={cx} y={cy} width={2 * s} height={2 * s} fill={fill} stroke={INK} strokeWidth={2} />
  )
  const layers = liftLayers ?? 0
  return (
    <svg viewBox="0 0 380 190" width="100%" style={{ maxWidth: 400, display: 'block', margin: '0 auto' }} aria-hidden="true">
      <g>
        {cell(70, 70, '#F6B8CD')}
        {cell(70, 70 - 2 * s, '#FBD3E0')}
        {cell(70, 70 + 2 * s, '#FBD3E0')}
        {cell(70 - 2 * s, 70, '#FBD3E0')}
        {cell(70 + 2 * s, 70, '#FBD3E0')}
        {[1, 2, 3].map((k) => (
          <g key={k}>
            <line x1={70 - 2 * s + ((k % 2) * 0)} y1={70 - 2 * s + k * s} x2={70 + 4 * s} y2={70 - 2 * s + k * s} stroke={INK} strokeWidth={0.6} opacity={0.35} />
            <line x1={70 - 2 * s + k * s} y1={70 - 2 * s} x2={70 - 2 * s + k * s} y2={70 + 4 * s} stroke={INK} strokeWidth={0.6} opacity={0.35} />
          </g>
        ))}
        <text x={122} y={12} textAnchor="middle" fontSize={12} fontWeight={800} fill={INK} className="font-display">2 cm</text>
        <text x={184} y={70} textAnchor="middle" fontSize={12} fontWeight={800} fill={INK} className="font-display">2</text>
      </g>
      {/* folded box with cubes */}
      <g transform="translate(255, 30)">
        <polygon points="0,60 52,60 78,40 26,40" fill="#FBD3E0" stroke={INK} strokeWidth={1.8} />
        <polygon points="0,60 52,60 52,112 0,112" fill="#F6B8CD" stroke={INK} strokeWidth={1.8} />
        <polygon points="52,60 78,40 78,92 52,112" fill="#E37FA4" stroke={INK} strokeWidth={1.8} />
        {layers >= 1 && (
          <g>
            {[0, 1].map((i) => (
              <rect key={i} x={4 + i * 24} y={88} width={22} height={22} fill="#7EC8E3" stroke={INK} strokeWidth={1.4} />
            ))}
            <text x={64} y={104} fontSize={11} fontWeight={800} fill={BLUE} className="font-display">4</text>
          </g>
        )}
        {layers >= 2 && (
          <g>
            {[0, 1].map((i) => (
              <rect key={i} x={4 + i * 24} y={64} width={22} height={22} fill="#A8DCEF" stroke={INK} strokeWidth={1.4} />
            ))}
            <text x={64} y={78} fontSize={11} fontWeight={800} fill={BLUE} className="font-display">+4</text>
          </g>
        )}
      </g>
    </svg>
  )
}
export function BoxNet21G2Illustration() {
  return (
    <Frame aria="A cross-shaped net: a two-by-two base with four two-by-two walls, folding into a lidless box.">
      <BoxNet21G2 />
    </Frame>
  )
}
