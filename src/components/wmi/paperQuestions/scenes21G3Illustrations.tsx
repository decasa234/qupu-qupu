// Figure reconstructions + puzzle data for WMI-21F3A (2021 G3 final).
// All geometry below is pixel-verified against the source PDF scans.

import { useId } from 'react'

const INK = '#1F2937'
const BLUE = '#30598A'

function Frame({ aria, children }: { aria: string; children: React.ReactNode }) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2" role="img" aria-label={aria}>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ Q5 —
 * Star on an offset dot lattice. Lattice coords (k,i): x = k·UX, y = i·UY,
 * dots where k+i is even. The unit triangle (area 1 cm²) is (k,i),(k,i+2),
 * (k+1,i+1). Star outline (clockwise) below; shoelace area in (k,i) = 60.
 * Horizontal band areas rows 1..13 (clip-verified, sum 60):
 * 1,3,5,7,9 (top triangle = 25) then 9, 7.5, 6, 4.5, 4, 3, 1 (bottom = 35). */
export const STAR_PTS: Array<[number, number]> = [
  [2, 6], [7, 1], [12, 6], [11, 7], [11, 9], [10, 8], [10, 10], [9, 9], [9, 13], [7, 11], [5, 13], [5, 9],
]
export const STAR_BANDS = [1, 3, 5, 7, 9, 9, 7.5, 6, 4.5, 4, 3, 1]
export const STAR_AREA = STAR_BANDS.reduce((a, b) => a + b, 0) // 60
const UX = 26
const UY = 13
const sx = (k: number) => 16 + k * UX
const sy = (i: number) => 10 + i * UY
export function StarGrid21G3({ bandUpto }: { bandUpto?: number }) {
  const clipId = useId()
  const upto = bandUpto ?? -1
  const pts = STAR_PTS.map(([k, i]) => `${sx(k)},${sy(i)}`).join(' ')
  return (
    <svg viewBox="0 0 400 206" width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <polygon points={pts} />
        </clipPath>
      </defs>
      <polygon points={pts} fill="#F9A8C9" stroke="#BE3A6C" strokeWidth={2.2} />
      {upto >= 0 &&
        STAR_BANDS.map((_, b) =>
          b <= upto ? (
            <rect key={b} x={0} y={sy(b + 1)} width={400} height={UY} fill={b % 2 ? '#7C2D5230' : '#7C2D5215'} stroke="#7C2D52" strokeWidth={0.8} clipPath={`url(#${clipId})`} />
          ) : null,
        )}
      {Array.from({ length: 15 }, (_, i) =>
        Array.from({ length: 15 }, (_, k) =>
          (k + i) % 2 === 0 ? <circle key={`${k}-${i}`} cx={sx(k)} cy={sy(i)} r={1.7} fill="#94A3B8" /> : null,
        ),
      )}
      <polygon points={`${sx(0.6)},${sy(10)} ${sx(0.6)},${sy(12)} ${sx(1.6)},${sy(11)}`} fill="#BFD8F0" stroke={BLUE} strokeWidth={1.6} />
      <text x={sx(0.45)} y={sy(13.4)} fontSize={10.5} fontWeight={800} fill={BLUE} className="font-display">1 cm²</text>
    </svg>
  )
}
export function StarGrid21G3Illustration() {
  return (
    <Frame aria="A pink star drawn on a dotted grid; a small blue reference triangle of one square centimetre sits at the lower left.">
      <StarGrid21G3 />
    </Frame>
  )
}

/* ------------------------------------------------------------------ Q6 —
 * Chocolate bar 8 × 3: border eaten → inner 6 × 1 remains; 6/24 = 1/4. */
export const CHOC_COLS = 8
export const CHOC_ROWS = 3
export function ChocolateBar21G3({ eaten, innerLit }: { eaten?: boolean; innerLit?: number }) {
  const s = 40
  const lit = innerLit ?? -1
  return (
    <svg viewBox="0 0 340 140" width="100%" style={{ maxWidth: 360, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {Array.from({ length: CHOC_ROWS }, (_, r) =>
        Array.from({ length: CHOC_COLS }, (_, c) => {
          const border = r === 0 || r === CHOC_ROWS - 1 || c === 0 || c === CHOC_COLS - 1
          const innerIdx = border ? -1 : c - 1
          const isLit = innerIdx >= 0 && innerIdx <= lit
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={10 + c * s}
                y={10 + r * s}
                width={s - 2}
                height={s - 2}
                rx={5}
                fill={border ? (eaten ? '#F8FAFC' : '#8B5A2B') : isLit ? '#F4B400' : '#6B4423'}
                stroke={border && eaten ? '#CBD5E1' : '#4A2C12'}
                strokeWidth={1.6}
                strokeDasharray={border && eaten ? '4 3' : undefined}
              />
              {!border && (
                <rect x={10 + c * s + 7} y={10 + r * s + 7} width={s - 16} height={s - 16} rx={3} fill="none" stroke={isLit ? '#9A6B00' : '#4A2C12'} strokeWidth={1.2} />
              )}
              {isLit && (
                <text x={10 + c * s + s / 2 - 1} y={10 + r * s + s / 2} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={900} fill="#4A2C12" className="font-display">
                  {innerIdx + 1}
                </text>
              )}
            </g>
          )
        }),
      )}
    </svg>
  )
}
export function ChocolateBar21G3Illustration() {
  return (
    <Frame aria="A chocolate bar of eight by three square pieces.">
      <ChocolateBar21G3 />
    </Frame>
  )
}

/* ------------------------------------------------------------------ Q7 —
 * 30×30 square with a 20×10 rectangle notched out of the left side
 * (vertically centred). Outline walk, lengths sum 160. */
export const NOTCH_VERTS: Array<[number, number]> = [
  [0, 0], [30, 0], [30, 30], [0, 30], [0, 20], [20, 20], [20, 10], [0, 10],
]
export const NOTCH_EDGES = NOTCH_VERTS.map((v, i) => {
  const w = NOTCH_VERTS[(i + 1) % NOTCH_VERTS.length]
  return { from: v, to: w, len: Math.abs(w[0] - v[0]) + Math.abs(w[1] - v[1]) }
})
export const NOTCH_PERIMETER = NOTCH_EDGES.reduce((a, e) => a + e.len, 0) // 160
export function NotchedSquare21G3({ edgeUpto }: { edgeUpto?: number }) {
  const sc = 5.4
  const X = (x: number) => 46 + x * sc
  const Y = (y: number) => 26 + y * sc
  const upto = edgeUpto ?? -1
  return (
    <svg viewBox="0 0 260 220" width="100%" style={{ maxWidth: 280, display: 'block', margin: '0 auto' }} aria-hidden="true">
      <polygon points={NOTCH_VERTS.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')} fill="#BFD8F0" stroke={INK} strokeWidth={2.2} />
      {NOTCH_EDGES.map((e, i) =>
        i <= upto ? (
          <line key={i} x1={X(e.from[0])} y1={Y(e.from[1])} x2={X(e.to[0])} y2={Y(e.to[1])} stroke="#D7263D" strokeWidth={4.5} strokeLinecap="round" />
        ) : null,
      )}
      <text x={X(15)} y={Y(0) - 9} textAnchor="middle" fontSize={13} fontWeight={800} fill={INK} className="font-display">30</text>
      <text x={X(30) + 12} y={Y(15)} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill={INK} className="font-display">30</text>
      <text x={X(10)} y={Y(20) + 14} textAnchor="middle" fontSize={12} fontWeight={800} fill={INK} className="font-display">20</text>
      <text x={X(20) + 11} y={Y(15)} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={800} fill={INK} className="font-display">10</text>
      <text x={X(28)} y={Y(30) + 15} textAnchor="end" fontSize={11} fontWeight={700} fill="#6B7280" className="font-display">(cm)</text>
    </svg>
  )
}
export function NotchedSquare21G3Illustration() {
  return (
    <Frame aria="A thirty by thirty square with a twenty by ten rectangle cut from the middle of its left side; labels thirty, thirty, twenty and ten centimetres.">
      <NotchedSquare21G3 />
    </Frame>
  )
}

/* ------------------------------------------------------------------ Q11 —
 * Diving scores: drop one highest + one lowest, sum the remaining six. */
export const DIVERS11 = [
  { name: 'Ada', scores: [4, 5, 5, 6, 7, 6, 4, 3] },
  { name: 'Betty', scores: [5, 4, 8, 6, 7, 4, 7, 5] },
  { name: 'Candice', scores: [6, 6, 6, 5, 6, 2, 6, 7] },
  { name: 'Dora', scores: [5, 6, 1, 9, 5, 5, 5, 6] },
]
export function diveDrops(scores: number[]): { hi: number; lo: number; final: number } {
  const hi = scores.indexOf(Math.max(...scores))
  const lo = scores.indexOf(Math.min(...scores))
  const final = scores.reduce((a, b) => a + b, 0) - scores[hi] - scores[lo]
  return { hi, lo, final }
}
export function DivingTable21G3({ litRow, showFinals }: { litRow?: number; showFinals?: number }) {
  const cw = 34
  const rh = 34
  const finUpto = showFinals ?? -1
  return (
    <svg viewBox="0 0 414 156" width="100%" style={{ maxWidth: 440, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {DIVERS11.map((d, r) => {
        const lit = litRow === r
        const { hi, lo, final } = diveDrops(d.scores)
        return (
          <g key={d.name} opacity={litRow === undefined || lit ? 1 : 0.45}>
            <rect x={4} y={6 + r * rh} width={66} height={rh - 4} fill={lit ? '#FFE9A8' : '#E1EFFB'} stroke={INK} strokeWidth={1.3} />
            <text x={37} y={6 + r * rh + rh / 2 - 1} textAnchor="middle" dominantBaseline="central" fontSize={11.5} fontWeight={800} fill={INK} className="font-display">{d.name}</text>
            {d.scores.map((v, c) => {
              const dropped = lit && (c === hi || c === lo)
              return (
                <g key={c}>
                  <rect x={70 + c * cw} y={6 + r * rh} width={cw} height={rh - 4} fill={dropped ? '#FEE2E2' : 'white'} stroke={INK} strokeWidth={1.1} />
                  <text x={70 + c * cw + cw / 2} y={6 + r * rh + rh / 2 - 1} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700} fill={dropped ? '#DC2626' : INK} className="font-display" textDecoration={dropped ? 'line-through' : undefined}>{v}</text>
                </g>
              )
            })}
            {r <= finUpto && (
              <text x={362} y={6 + r * rh + rh / 2 - 1} dominantBaseline="central" fontSize={14} fontWeight={900} fill={BLUE} className="font-display">= {final}</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
export function DivingTable21G3Illustration() {
  return (
    <Frame aria="A table of eight judge scores for Ada, Betty, Candice and Dora.">
      <DivingTable21G3 />
    </Frame>
  )
}

/* ------------------------------------------------------------------ Q12 —
 * Four 3×3 grids with orange shading; areas (shoelace-verified):
 * A = 4.5, B = 4, C = 5, D = 4 → C largest. Polygons in grid coords. */
export const SHADED12: Record<'A' | 'B' | 'C' | 'D', { polys: Array<Array<[number, number]>>; areaText: string; area: number }> = {
  A: {
    polys: [
      [[1, 1], [2, 1], [2, 2], [1, 2]],
      [[1, 0], [1, 1], [0, 1]],
      [[1, 0], [2, 1], [1, 1]],
      [[3, 0], [3, 1], [2, 1]],
      [[0, 1], [1, 1], [1, 2]],
      [[2, 1], [3, 1], [2, 2]],
      [[1, 2], [1, 3], [0, 3]],
      [[1, 2], [2, 2], [1, 3]],
    ],
    areaText: '1 + 7×½ = 4½',
    area: 4.5,
  },
  B: {
    polys: [[[0.5, 0.5], [2.5, 0.5], [2.5, 2.5], [0.5, 2.5]]],
    areaText: '2 × 2 = 4',
    area: 4,
  },
  C: {
    polys: [
      [[1, 0], [2, 0], [2, 1], [1, 1]],
      [[1, 1], [2, 1], [2, 2], [1, 2]],
      [[1, 2], [2, 2], [2, 3], [1, 3]],
      [[0, 0], [1, 0], [1, 1]],
      [[2, 0], [3, 0], [2, 1]],
      [[1, 2], [1, 3], [0, 3]],
      [[2, 2], [3, 3], [2, 3]],
    ],
    areaText: '3 + 4×½ = 5',
    area: 5,
  },
  D: {
    polys: [[[3, 0], [0, 1], [2, 3]]],
    areaText: '4',
    area: 4,
  },
}
export function shadedArea(key: 'A' | 'B' | 'C' | 'D'): number {
  return SHADED12[key].polys.reduce((sum, p) => {
    let s = 0
    for (let i = 0; i < p.length; i++) {
      const [x1, y1] = p[i]
      const [x2, y2] = p[(i + 1) % p.length]
      s += x1 * y2 - x2 * y1
    }
    return sum + Math.abs(s) / 2
  }, 0)
}
export function ShadedFig21G3({ k, size = 32 }: { k: 'A' | 'B' | 'C' | 'D'; size?: number }) {
  const d = SHADED12[k]
  return (
    <svg viewBox={`0 0 ${3 * size + 4} ${3 * size + 4}`} width={3 * size + 4} aria-hidden="true">
      {d.polys.map((p, i) => (
        <polygon key={i} points={p.map(([x, y]) => `${2 + x * size},${2 + y * size}`).join(' ')} fill="#F9B36B" stroke="none" />
      ))}
      {Array.from({ length: 4 }, (_, i) => (
        <g key={i}>
          <line x1={2} y1={2 + i * size} x2={2 + 3 * size} y2={2 + i * size} stroke={INK} strokeWidth={1.2} />
          <line x1={2 + i * size} y1={2} x2={2 + i * size} y2={2 + 3 * size} stroke={INK} strokeWidth={1.2} />
        </g>
      ))}
    </svg>
  )
}
export function ShadedGrids21G3Illustration() {
  return (
    <Frame aria="Four three-by-three grids labelled A to D, each with an orange shaded region.">
      <div className="flex flex-wrap items-end justify-center gap-4 py-1">
        {(['A', 'B', 'C', 'D'] as const).map((k) => (
          <div key={k} className="flex flex-col items-center">
            <ShadedFig21G3 k={k} />
            <span className="font-display text-xs font-extrabold text-gray-600">({k})</span>
          </div>
        ))}
      </div>
    </Frame>
  )
}

/* ------------------------------------------------------------------ Q13 —
 * Two shelves of bottles, equal totals. Top: L M S S S S S; bottom: L L S S M.
 * Given S = 850 ml, M = 1 L 750 ml → cancelling leaves 3S = L = 2550 ml. */
export const SHELF_TOP: string[] = ['L', 'M', 'S', 'S', 'S', 'S', 'S']
export const SHELF_BOT: string[] = ['L', 'L', 'S', 'S', 'M']
const BOTTLE = {
  L: { w: 30, h: 56, fill: '#7EC8E3' },
  M: { w: 24, h: 42, fill: '#8FD6A8' },
  S: { w: 17, h: 29, fill: '#F9B36B' },
} as const
function Bottle({ x, baseY, kind, faded }: { x: number; baseY: number; kind: string; faded?: boolean }) {
  const b = BOTTLE[kind as keyof typeof BOTTLE]
  return (
    <g opacity={faded ? 0.18 : 1}>
      <rect x={x} y={baseY - b.h} width={b.w} height={b.h} rx={5} fill={b.fill} stroke={INK} strokeWidth={1.6} />
      <rect x={x + b.w / 2 - 5} y={baseY - b.h - 7} width={10} height={8} rx={2} fill={b.fill} stroke={INK} strokeWidth={1.4} />
      <text x={x + b.w / 2} y={baseY - b.h / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={900} fill={INK} className="font-display">{kind}</text>
      {faded && <line x1={x - 2} y1={baseY - 3} x2={x + b.w + 2} y2={baseY - b.h - 5} stroke="#DC2626" strokeWidth={2.4} />}
    </g>
  )
}
export function Shelves21G3({ faded }: { faded?: Set<string> }) {
  const f = faded ?? new Set<string>()
  const layout = (items: string[], baseY: number, prefix: string) => {
    let x = 14
    return items.map((kind, i) => {
      const b = BOTTLE[kind as keyof typeof BOTTLE]
      const el = <Bottle key={`${prefix}${i}`} x={x} baseY={baseY} kind={kind} faded={f.has(`${prefix}${i}`)} />
      x += b.w + 12
      return el
    })
  }
  return (
    <svg viewBox="0 0 400 206" width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {layout(SHELF_TOP, 78, 't')}
      <rect x={6} y={79} width={300} height={6} fill="#8B6534" />
      {layout(SHELF_BOT, 168, 'b')}
      <rect x={6} y={169} width={300} height={6} fill="#8B6534" />
      <text x={330} y={50} fontSize={12.5} fontWeight={800} fill={BLUE} className="font-display">S = 850 ml</text>
      <text x={330} y={70} fontSize={12.5} fontWeight={800} fill={BLUE} className="font-display">M = 1 L 750 ml</text>
      <text x={330} y={90} fontSize={12.5} fontWeight={900} fill="#D7263D" className="font-display">L = ?</text>
    </svg>
  )
}
export function Shelves21G3Illustration() {
  return (
    <Frame aria="Two shelves of bottles holding equal totals: top shelf one large, one medium and five small; bottom shelf two large, two small and one medium. Small is eight hundred fifty millilitres, medium is one litre seven hundred fifty.">
      <Shelves21G3 />
    </Frame>
  )
}

/* ------------------------------------------------------------------ Q15 —
 * US bills counted with tally marks (pixel-verified):
 * $100×8, $50×12, $20×4, $10×7, $5×3, $1×5 → total 1570. */
export const MONEY15 = [
  { value: 100, count: 8 },
  { value: 50, count: 12 },
  { value: 20, count: 4 },
  { value: 10, count: 7 },
  { value: 5, count: 3 },
  { value: 1, count: 5 },
]
export const MONEY15_TOTAL = MONEY15.reduce((a, m) => a + m.value * m.count, 0) // 1570
function Tally({ x, y, count }: { x: number; y: number; count: number }) {
  const gates = Math.floor(count / 5)
  const rest = count % 5
  const strokes: React.ReactNode[] = []
  let cx = x
  for (let g = 0; g < gates; g++) {
    for (let i = 0; i < 4; i++) strokes.push(<line key={`g${g}-${i}`} x1={cx + i * 5} y1={y} x2={cx + i * 5} y2={y + 20} stroke="#D7263D" strokeWidth={2.2} />)
    strokes.push(<line key={`g${g}-d`} x1={cx - 3} y1={y + 16} x2={cx + 18} y2={y + 4} stroke="#D7263D" strokeWidth={2.2} />)
    cx += 26
  }
  for (let i = 0; i < rest; i++) strokes.push(<line key={`r${i}`} x1={cx + i * 5} y1={y} x2={cx + i * 5} y2={y + 20} stroke="#D7263D" strokeWidth={2.2} />)
  return <g>{strokes}</g>
}
export function TallyMoney21G3({ upto }: { upto?: number }) {
  const u = upto ?? -1
  const colW = 66
  return (
    <svg viewBox="0 0 410 110" width="100%" style={{ maxWidth: 430, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {MONEY15.map((m, i) => (
        <g key={m.value} opacity={u === -1 || i <= u ? 1 : 0.35}>
          <rect x={6 + i * colW} y={8} width={colW - 6} height={30} rx={5} fill={i <= u ? '#D1FAE5' : '#E8F5E9'} stroke="#2F9E44" strokeWidth={1.6} />
          <text x={6 + i * colW + (colW - 6) / 2} y={24} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={900} fill="#1B5E20" className="font-display">${m.value}</text>
          <Tally x={14 + i * colW} y={52} count={m.count} />
          <text x={6 + i * colW + (colW - 6) / 2} y={92} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={i <= u ? BLUE : '#9CA3AF'} className="font-display">{i <= u ? `× ${m.count}` : ''}</text>
        </g>
      ))}
    </svg>
  )
}
export function TallyMoney21G3Illustration() {
  return (
    <Frame aria="Six bill values from one hundred dollars down to one dollar, each with red tally marks: eight, twelve, four, seven, three and five bills.">
      <TallyMoney21G3 />
    </Frame>
  )
}

/* ------------------------------------------------------------------ Q18 —
 * Fruit equations: 🍓×🍇×🍍 = 240, 🍓+🍇×🍍 = 31, 🍓+🍇−🍍 = 9.
 * Unique solution 🍓 = 15, 🍇 = 2, 🍍 = 8 → the number reads 1528. */
export const FRUITS18 = { s: 15, g: 2, p: 8 }
export function FruitEquations21G3({ reveal }: { reveal?: { s?: boolean; g?: boolean; p?: boolean } }) {
  const r = reveal ?? {}
  const fruit = (x: number, y: number, glyph: string, val: number | null) => (
    <g>
      <rect x={x - 17} y={y - 17} width={34} height={34} rx={8} fill="#FFF7E6" stroke="#E8965A" strokeWidth={1.8} />
      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize={val != null ? 15 : 19} fontWeight={900} fill={BLUE} className="font-display">
        {val != null ? val : glyph}
      </text>
    </g>
  )
  const op = (x: number, y: number, ch: string) => (
    <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize={19} fontWeight={900} fill={INK} className="font-display">{ch}</text>
  )
  const rows: Array<{ ops: [string, string]; rhs: number }> = [
    { ops: ['×', '×'], rhs: 240 },
    { ops: ['+', '×'], rhs: 31 },
    { ops: ['+', '−'], rhs: 9 },
  ]
  return (
    <svg viewBox="0 0 330 224" width="100%" style={{ maxWidth: 350, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {rows.map((row, i) => {
        const y = 30 + i * 50
        return (
          <g key={i}>
            {fruit(36, y, '🍓', r.s ? FRUITS18.s : null)}
            {op(72, y, row.ops[0])}
            {fruit(108, y, '🍇', r.g ? FRUITS18.g : null)}
            {op(144, y, row.ops[1])}
            {fruit(180, y, '🍍', r.p ? FRUITS18.p : null)}
            {op(214, y, '=')}
            <text x={252} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize={19} fontWeight={900} fill={INK} className="font-display">{row.rhs}</text>
          </g>
        )
      })}
      <line x1={110} y1={184} x2={222} y2={184} stroke={INK} strokeWidth={2.4} />
      <text x={166} y={206} textAnchor="middle" dominantBaseline="central" fontSize={19} fontWeight={900} fill={INK} className="font-display">🍓 🍇 🍍 = ?</text>
    </svg>
  )
}
export function FruitEquations21G3Illustration() {
  return (
    <Frame aria="Three equations with a strawberry, a grape bunch and a pineapple: their product is two hundred forty; strawberry plus grape times pineapple is thirty-one; strawberry plus grape minus pineapple is nine. The fruits side by side form a four-digit number.">
      <FruitEquations21G3 />
    </Frame>
  )
}

/* ------------------------------------------------------------------ Q20 —
 * Two hexagon rings of six trapezoids around a centre. Opposite segments
 * share a colour; the colour is the operation that produces the centre:
 * yellow = difference, pink = sum, blue = product (verified on figure 1).
 * Order around: [top, upper-right, lower-right, bottom, lower-left, upper-left].
 * Figure 2's missing pink value: 8 + ? = 48 → ? = 40. */
export type HexSeg21G3 = { v: number | null; color: 'Y' | 'P' | 'B' }
export const HEX20: Array<{ around: HexSeg21G3[]; center: number }> = [
  {
    around: [
      { v: 64, color: 'Y' }, { v: 28, color: 'P' }, { v: 6, color: 'B' },
      { v: 10, color: 'Y' }, { v: 26, color: 'P' }, { v: 9, color: 'B' },
    ],
    center: 54,
  },
  {
    around: [
      { v: 8, color: 'P' }, { v: 8, color: 'B' }, { v: 27, color: 'Y' },
      { v: null, color: 'P' }, { v: 6, color: 'B' }, { v: 75, color: 'Y' },
    ],
    center: 48,
  },
]
const HEX_FILL: Record<string, string> = { Y: '#FFE9A8', P: '#FBD3E0', B: '#BFD8F0' }
export function HexRing21G3({ data, litPair, showMissing }: { data: (typeof HEX20)[number]; litPair?: number; showMissing?: boolean }) {
  const R = 58
  const r = 25
  const cx = 66, cy = 66
  const pt = (i: number, rad: number) => {
    const a = ((i * 60 - 90) * Math.PI) / 180
    return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]
  }
  const v = (i: number, rad: number) => {
    const a = ((i * 60 - 120) * Math.PI) / 180
    return `${cx + Math.cos(a) * rad},${cy + Math.sin(a) * rad}`
  }
  return (
    <svg viewBox="0 0 132 132" width={124} aria-hidden="true">
      {data.around.map((seg, i) => {
        const lit = litPair !== undefined && (i === litPair || i === (litPair + 3) % 6)
        return (
          <polygon key={i} points={`${v(i, R)} ${v(i + 1, R)} ${v(i + 1, r)} ${v(i, r)}`} fill={HEX_FILL[seg.color]} stroke={lit ? '#D97706' : INK} strokeWidth={lit ? 3.2 : 1.6} />
        )
      })}
      <polygon points={Array.from({ length: 6 }, (_, i) => v(i, r)).join(' ')} fill="white" stroke={INK} strokeWidth={1.6} />
      {data.around.map((seg, i) => {
        const [x, y] = pt(i, (R + r) / 2 + 2)
        return (
          <text key={i} x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize={13.5} fontWeight={900} fill={seg.v == null ? '#D7263D' : INK} className="font-display">
            {seg.v == null ? (showMissing ? '40' : '?') : seg.v}
          </text>
        )
      })}
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={900} fill={INK} className="font-display">{data.center}</text>
    </svg>
  )
}
export function HexRings21G3Illustration() {
  return (
    <Frame aria="Two hexagon rings of coloured segments around a centre number: the first has centre fifty-four, the second centre forty-eight with one segment marked by a question mark.">
      <div className="flex flex-wrap items-end justify-center gap-4 py-1">
        {HEX20.map((h, i) => (
          <HexRing21G3 key={i} data={h} />
        ))}
      </div>
    </Frame>
  )
}

/* ------------------------------------------------------------------ Q21 —
 * Six rectangles in two rows. Top row height 6 (areas 32, blank, 26), bottom
 * row height 7 (36, blank, ?). Arc 9 cm spans R1+R2's top; arc 10 cm spans
 * R5+R6's bottom. Alignments: R1.right = R2.left = R4.left; R3.right = R5.right.
 * Widths (exact fractions, they cancel): R2+R3 spans (54−32+26)/6 = 8 cm; so
 * R4+R5 = 8×7 = 56 → R5 = 20; R5+R6 = 10×7 = 70 → ? = 50. */
const W1 = 32 / 6
const W4 = 36 / 7
export const RECTS21G3 = [
  { x: 0, y: 0, w: W1, h: 6, label: '32cm²' },
  { x: W1, y: 0, w: 9 - W1, h: 6, label: '' },
  { x: 9, y: 0, w: 26 / 6, h: 6, label: '26cm²' },
  { x: W1, y: 6, w: W4, h: 7, label: '36cm²' },
  { x: W1 + W4, y: 6, w: 8 - W4, h: 7, label: '' },
  { x: W1 + 8, y: 6, w: 50 / 7, h: 7, label: '? cm²' },
]
export function SixRectangles21G3({ litRects, reveal }: { litRects?: number[]; reveal?: Partial<Record<number, string>> }) {
  const sc = 21
  const X = (x: number) => 34 + x * sc
  const Y = (y: number) => 30 + y * sc
  const lit = new Set(litRects ?? [])
  const fills = ['#E1EFFB', '#FFFFFF', '#FDE7EF', '#FFF3D6', '#FFFFFF', '#CDEFD2']
  return (
    <svg viewBox="0 0 480 330" width="100%" style={{ maxWidth: 460, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {RECTS21G3.map((rc, i) => (
        <g key={i}>
          <rect x={X(rc.x)} y={Y(rc.y)} width={rc.w * sc} height={rc.h * sc} fill={fills[i]} stroke={lit.has(i) ? '#D7263D' : INK} strokeWidth={lit.has(i) ? 3.2 : 1.8} />
          <text x={X(rc.x) + (rc.w * sc) / 2} y={Y(rc.y) + (rc.h * sc) / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize={13.5} fontWeight={900} fill={i === 5 ? '#1B5E20' : INK} className="font-display">
            {reveal?.[i] ?? rc.label}
          </text>
        </g>
      ))}
      <path d={`M ${X(0)} ${Y(0) - 10} L ${X(9)} ${Y(0) - 10}`} stroke={BLUE} strokeWidth={2} fill="none" />
      <text x={X(4.5)} y={Y(0) - 16} textAnchor="middle" fontSize={13} fontWeight={800} fill={BLUE} className="font-display">9cm</text>
      <text x={X(0) - 16} y={Y(3)} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill={BLUE} className="font-display">6cm</text>
      <path d={`M ${X(W1 + W4)} ${Y(13) + 10} L ${X(W1 + 8 + 50 / 7)} ${Y(13) + 10}`} stroke={BLUE} strokeWidth={2} fill="none" />
      <text x={X(W1 + W4 + 5)} y={Y(13) + 26} textAnchor="middle" fontSize={13} fontWeight={800} fill={BLUE} className="font-display">10cm</text>
      <text x={X(W1 + 8 + 50 / 7) + 18} y={Y(9.5)} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill={BLUE} className="font-display">7cm</text>
    </svg>
  )
}
export function SixRectangles21G3Illustration() {
  return (
    <Frame aria="Six rectangles in two offset rows: the top row is six centimetres tall with areas thirty-two and twenty-six marked, the bottom row seven centimetres tall with thirty-six marked and a green question-mark rectangle; spans of nine and ten centimetres are labelled.">
      <SixRectangles21G3 />
    </Frame>
  )
}
