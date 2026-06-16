// Scene illustrations + shared puzzle data for WMI-21F1A.

const INK = '#1F2937'

function Frame({ aria, children }: { aria: string; children: React.ReactNode }) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2" role="img" aria-label={aria}>
      {children}
    </div>
  )
}

/* Q2 — the apple grid 1 9 4 / 7 🍎 6 / 5 8 2. */
export const APPLE_GRID: Array<Array<number | null>> = [
  [1, 9, 4],
  [7, null, 6],
  [5, 8, 2],
]
export function AppleGrid21({ mark }: { mark?: Array<[number, number]> }) {
  const s = 56
  return (
    <svg viewBox={`0 0 ${16 + 3 * s} ${16 + 3 * s}`} width="100%" style={{ maxWidth: 220, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {APPLE_GRID.map((row, r) =>
        row.map((v, c) => {
          const hit = mark?.some(([mr, mc]) => mr === r && mc === c)
          return (
            <g key={`${r}-${c}`}>
              <rect x={8 + c * s} y={8 + r * s} width={s} height={s} fill={hit ? '#FFE9A8' : 'white'} stroke={hit ? '#D97706' : INK} strokeWidth={hit ? 3 : 1.8} />
              <text x={8 + c * s + s / 2} y={8 + r * s + s / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize={v == null ? 26 : 22} fontWeight={800} fill={INK} className="font-display">
                {v == null ? '🍎' : v}
              </text>
            </g>
          )
        }),
      )}
    </svg>
  )
}
export function AppleGrid21Illustration() {
  return (
    <Frame aria="A three-by-three grid: one nine four, seven apple six, five eight two.">
      <AppleGrid21 />
    </Frame>
  )
}

/* Q4 — the repeating fruit pattern. */
export const FRUIT_BLOCK = ['🍍', '🍉', '🍓', '🍓', '🍇', '🍓'] as const
export const fruitAt = (pos: number) => FRUIT_BLOCK[(pos - 1) % 6]
export function FruitRow21({ revealUpto, showIndex }: { revealUpto?: number; showIndex?: boolean }) {
  const upto = revealUpto ?? 13
  return (
    <svg viewBox={`0 0 470 ${showIndex ? 64 : 52}`} width="100%" style={{ maxWidth: 470, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {Array.from({ length: 18 }, (_, i) => {
        const pos = i + 1
        const printed = pos <= 13
        const shown = pos <= upto
        const q = pos === 15 || pos === 16
        return (
          <g key={i}>
            {!printed && <circle cx={16 + i * 25.5} cy={26} r={12} fill={q ? '#FEF9C3' : 'white'} stroke={q ? '#D97706' : '#94A3B8'} strokeWidth={q ? 2.2 : 1.4} strokeDasharray={shown ? undefined : '3 3'} />}
            {shown && (
              <text x={16 + i * 25.5} y={27} textAnchor="middle" dominantBaseline="central" fontSize={17} opacity={printed ? 1 : 0.9}>
                {fruitAt(pos)}
              </text>
            )}
            {!shown && q && (
              <text x={16 + i * 25.5} y={27} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={900} fill="#D97706" className="font-display">?</text>
            )}
            {showIndex && (
              <text x={16 + i * 25.5} y={54} textAnchor="middle" fontSize={8.5} fontWeight={700} fill="#9CA3AF" className="font-display">{pos}</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
export function FruitRow21Illustration() {
  return (
    <Frame aria="A row of fruits repeating pineapple, watermelon, strawberry, strawberry, grapes, strawberry; two circles marked with question marks.">
      <FruitRow21 />
    </Frame>
  )
}

/* Q5 — six baskets of 10 apples and three loose apples. */
export function Baskets21({ countedBaskets, countedLoose }: { countedBaskets?: number; countedLoose?: number }) {
  const baskets: Array<[number, number]> = [[60, 50], [160, 30], [260, 44], [350, 56], [110, 120], [250, 124]]
  const loose: Array<[number, number]> = [[190, 96], [200, 142], [330, 140]]
  const cb = countedBaskets ?? -1
  const cl = countedLoose ?? -1
  return (
    <svg viewBox="0 0 420 190" width="100%" style={{ maxWidth: 440, display: 'block', margin: '0 auto' }} aria-hidden="true">
      <ellipse cx={210} cy={95} rx={205} ry={92} fill="#FDE7EF" />
      {baskets.map(([x, y], i) => (
        <g key={i} opacity={cb === -1 || i < cb ? 1 : 0.45}>
          <rect x={x - 26} y={y} width={52} height={34} rx={7} fill="#C9A36E" stroke="#8B6534" strokeWidth={1.8} />
          {[-14, 0, 14].map((dx) => (
            <circle key={dx} cx={x + dx} cy={y - 2} r={8} fill="#D7263D" stroke="#7A0C1E" strokeWidth={1.2} />
          ))}
          {i < cb && (
            <g>
              <circle cx={x + 24} cy={y - 10} r={11} fill="#30598A" />
              <text x={x + 24} y={y - 9} textAnchor="middle" dominantBaseline="central" fontSize={10.5} fontWeight={900} fill="white" className="font-display">{(i + 1) * 10}</text>
            </g>
          )}
        </g>
      ))}
      {loose.map(([x, y], i) => (
        <g key={i} opacity={cl === -1 || i < cl ? 1 : 0.45}>
          <circle cx={x} cy={y} r={9} fill="#D7263D" stroke="#7A0C1E" strokeWidth={1.4} />
          {i < cl && (
            <g>
              <circle cx={x + 13} cy={y - 11} r={10} fill="#10B981" />
              <text x={x + 13} y={y - 10} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={900} fill="white" className="font-display">{61 + i}</text>
            </g>
          )}
        </g>
      ))}
    </svg>
  )
}
export function Baskets21Illustration() {
  return (
    <Frame aria="Six baskets of apples (ten in each) and three loose apples.">
      <Baskets21 />
    </Frame>
  )
}

/* Q7 — the paint-by-counting grid. Colored = even (red) or multiple of 5 (yellow);
 * a number that is both (ends in 0) paints red first, then yellow on top → yellow. */
export const GRID7: number[][] = [
  [91, 65, 7, 11, 38, 80, 76],
  [5, 83, 64, 3, 12, 49, 9],
  [48, 19, 29, 31, 4, 95, 20],
  [25, 41, 100, 59, 65, 57, 83],
  [17, 30, 73, 47, 26, 33, 69],
]
export const paint7 = (n: number): 'red' | 'yellow' | null => (n % 5 === 0 ? 'yellow' : n % 2 === 0 ? 'red' : null)
export function PaintGrid21({ paintedRows }: { paintedRows?: number }) {
  const pr = paintedRows ?? 5
  const s = 56
  return (
    <svg viewBox={`0 0 ${16 + 7 * s} ${16 + 5 * s}`} width="100%" style={{ maxWidth: 440, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {GRID7.map((row, r) =>
        row.map((n, c) => {
          const color = r < pr ? paint7(n) : null
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={8 + c * s}
                y={8 + r * s}
                width={s}
                height={s}
                fill={color === 'red' ? '#E5333E' : color === 'yellow' ? '#FFD23F' : 'white'}
                stroke={INK}
                strokeWidth={1.6}
              />
              <text x={8 + c * s + s / 2} y={8 + r * s + s / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={800} fill={color === 'red' ? 'white' : INK} className="font-display">
                {n}
              </text>
            </g>
          )
        }),
      )}
    </svg>
  )
}
export function PaintGrid21Illustration() {
  return (
    <Frame aria="A grid of numbers; squares with even numbers paint red and multiples of five paint yellow, revealing the letters C and F.">
      <PaintGrid21 paintedRows={0} />
    </Frame>
  )
}

/* Q8 — the lightning-bolt triangle grid. Each cell split by a “\” diagonal into
 * an upper-right (u) and lower-left (l) triangle; 'W' = white (missing).
 * Pixel-verified from the scan: 17 white triangles. */
export const TRI8: string[][] = [
  ['PP', 'PP', 'PP', 'PW', 'PP', 'PP', 'PP'],
  ['PP', 'WP', 'PW', 'WW', 'PP', 'PP', 'PP'],
  ['PP', 'WP', 'WW', 'WW', 'WW', 'PW', 'PP'],
  ['PP', 'PP', 'PP', 'WW', 'WW', 'PP', 'PP'],
  ['PP', 'PP', 'PP', 'PP', 'PP', 'PP', 'PP'],
]
export const TRI8_WHITE: Array<[number, number, 'u' | 'l']> = (() => {
  const out: Array<[number, number, 'u' | 'l']> = []
  TRI8.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell[0] === 'W') out.push([r, c, 'u'])
      if (cell[1] === 'W') out.push([r, c, 'l'])
    }),
  )
  return out
})()
const triIsWhite = (r: number, c: number, k: 'u' | 'l') => {
  const cell = TRI8[r]?.[c]
  if (!cell) return false
  return (k === 'u' ? cell[0] : cell[1]) === 'W'
}
/** Boundary segments of the white region (edges where a white triangle meets purple). */
const TRI8_BOUNDARY: Array<[number, number, number, number]> = (() => {
  const s = 52
  const out: Array<[number, number, number, number]> = []
  for (const [r, c, k] of TRI8_WHITE) {
    const x = 8 + c * s
    const y = 8 + r * s
    if (k === 'u') {
      if (!triIsWhite(r - 1, c, 'l')) out.push([x, y, x + s, y])
      if (!triIsWhite(r, c + 1, 'l')) out.push([x + s, y, x + s, y + s])
      if (!triIsWhite(r, c, 'l')) out.push([x, y, x + s, y + s])
    } else {
      if (!triIsWhite(r + 1, c, 'u')) out.push([x, y + s, x + s, y + s])
      if (!triIsWhite(r, c - 1, 'u')) out.push([x, y, x, y + s])
      if (!triIsWhite(r, c, 'u')) out.push([x, y, x + s, y + s])
    }
  }
  return out
})()
export function TriangleGrid21({ filledUpto, innerLines = true }: { filledUpto?: number; innerLines?: boolean }) {
  const s = 52
  const upto = filledUpto ?? -1
  const filledSet = new Set(TRI8_WHITE.slice(0, Math.max(0, upto + 1)).map(([r, c, k]) => `${r}${c}${k}`))
  const active = upto >= 0 && upto < TRI8_WHITE.length ? TRI8_WHITE[upto] : null
  return (
    <svg viewBox={`0 0 ${16 + 7 * s} ${16 + 5 * s}`} width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {TRI8.map((row, r) =>
        row.map((cell, c) => {
          const x = 8 + c * s
          const y = 8 + r * s
          const tri = (kind: 'u' | 'l') => {
            const isWhite = (kind === 'u' ? cell[0] : cell[1]) === 'W'
            const filled = filledSet.has(`${r}${c}${kind}`)
            const isActive = active && active[0] === r && active[1] === c && active[2] === kind
            const fill = !isWhite ? '#C5BCE0' : filled ? '#8FD6A8' : 'white'
            const hideStroke = !innerLines && isWhite && !filled
            const pts = kind === 'u' ? `${x},${y} ${x + s},${y} ${x + s},${y + s}` : `${x},${y} ${x + s},${y + s} ${x},${y + s}`
            return (
              <g key={kind}>
                <polygon points={pts} fill={fill} stroke={hideStroke ? 'none' : INK} strokeWidth={1.6} />
                {isActive && <polygon points={pts} fill="none" stroke="#D97706" strokeWidth={3.4} />}
              </g>
            )
          }
          return (
            <g key={`${r}-${c}`}>
              {tri('u')}
              {tri('l')}
            </g>
          )
        }),
      )}
      {!innerLines &&
        TRI8_BOUNDARY.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={1.8} />
        ))}
    </svg>
  )
}
export function TriangleGrid21Illustration() {
  return (
    <Frame aria="A purple triangle mosaic with a white lightning-bolt gap to fill.">
      <TriangleGrid21 innerLines={false} />
    </Frame>
  )
}

/* Q10 — the rope bar chart (lengths measured from the scan: bars do NOT all
 * start at 0): blue 0→6, red 1→5, green 2→7, yellow 4→7. */
export const ROPES = [
  { key: 'blue', en: 'Blue', id: 'Biru', start: 0, end: 6, color: '#2E76C9' },
  { key: 'red', en: 'Red', id: 'Merah', start: 1, end: 5, color: '#D7263D' },
  { key: 'green', en: 'Green', id: 'Hijau', start: 2, end: 7, color: '#2F9E44' },
  { key: 'yellow', en: 'Yellow', id: 'Kuning', start: 4, end: 7, color: '#F4C400' },
] as const
export function RopeBars21({ showLengths }: { showLengths?: boolean }) {
  const x0 = 46
  const u = 46
  return (
    <svg viewBox="0 0 420 190" width="100%" style={{ maxWidth: 440, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <line x1={x0 + i * u} y1={14} x2={x0 + i * u} y2={146} stroke="#CBD5E1" strokeWidth={1.2} />
          <text x={x0 + i * u} y={162} textAnchor="middle" fontSize={13} fontWeight={800} fill={INK} className="font-display">{i}</text>
        </g>
      ))}
      {ROPES.map((rope, i) => (
        <g key={rope.key}>
          <rect x={x0 + rope.start * u} y={20 + i * 32} width={(rope.end - rope.start) * u} height={20} rx={5} fill={rope.color} stroke={INK} strokeWidth={1.6} />
          {showLengths && (
            <text x={x0 + ((rope.start + rope.end) / 2) * u} y={31 + i * 32} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={900} fill="white" className="font-display">
              {rope.end - rope.start}
            </text>
          )}
          <text x={x0 + rope.end * u + 12} y={31 + i * 32} textAnchor="start" dominantBaseline="central" fontSize={11.5} fontWeight={800} fill={INK} className="font-display">{rope.en}</text>
        </g>
      ))}
      <line x1={x0} y1={146} x2={x0 + 7 * u} y2={146} stroke={INK} strokeWidth={2.2} />
      <text x={x0 + 3.5 * u} y={182} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#6B7280" className="font-display">the ropes start at different marks!</text>
    </svg>
  )
}
export function RopeBars21Illustration() {
  return (
    <Frame aria="Four rope bars over a ruler from zero to seven: blue from zero to six, red from one to five, green from two to seven, yellow from four to seven.">
      <RopeBars21 />
    </Frame>
  )
}

/* Q14 — seesaw primitive: items 'M' (magnifier), 'E' (eraser), 'P' (pencil). */
export type SeesawItem = 'M' | 'E' | 'P'
const ITEM_GLYPH: Record<SeesawItem, string> = { M: '🔍', E: '🧽', P: '✏️' }
export function Seesaw21({ left, right, tilt, size = 170 }: { left: SeesawItem[]; right: SeesawItem[]; tilt: 'left' | 'right' | 'level'; size?: number }) {
  const w = size
  const h = size * 0.56
  // SVG y points down, so a NEGATIVE angle drops the LEFT end of the plank.
  const angle = tilt === 'left' ? -9 : tilt === 'right' ? 9 : 0
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} aria-hidden="true">
      <polygon points={`${w / 2},${h - 12} ${w / 2 - 14},${h - 2} ${w / 2 + 14},${h - 2}`} fill="#D7263D" />
      <g transform={`rotate(${angle} ${w / 2} ${h - 14})`}>
        <rect x={w * 0.06} y={h - 18} width={w * 0.88} height={7} rx={3} fill="#9B6B9E" />
        <text x={w * 0.16} y={h - 26} textAnchor="middle" fontSize={size * 0.13}>
          {left.map((it) => ITEM_GLYPH[it]).join('')}
        </text>
        <text x={w * 0.84} y={h - 26} textAnchor="middle" fontSize={size * 0.13}>
          {right.map((it) => ITEM_GLYPH[it]).join('')}
        </text>
      </g>
    </svg>
  )
}
export function Scales21Illustration() {
  return (
    <Frame aria="Two seesaws: the magnifier outweighs the eraser, and the eraser outweighs the pencil.">
      <div className="flex flex-wrap items-end justify-center gap-4 py-1">
        <Seesaw21 left={['M']} right={['E']} tilt="left" />
        <Seesaw21 left={['P']} right={['E']} tilt="right" />
      </div>
    </Frame>
  )
}
