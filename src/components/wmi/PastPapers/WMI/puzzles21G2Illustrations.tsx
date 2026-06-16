// Puzzle figures for WMI-21F2A with solver-verified data.

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
 * Number chains: top 18→20→🐤→24 (+2 → 🐤 22); middle 🐑→24→27→🐊 (+3 →
 * 🐑 21, 🐊 30); bottom 🐊→🦁→40→45 (+5 → 🦁 35). Sum 108. */
export const CHAIN21G2 = { chick: 22, sheep: 21, croc: 30, lion: 35 }
export function ChainDiagram21G2({ reveal }: { reveal?: { chick?: boolean; sheep?: boolean; croc?: boolean; lion?: boolean } }) {
  const r = reveal ?? {}
  const plain = (x: number, y: number, v: string) => (
    <g>
      <circle cx={x} cy={y} r={23} fill="white" stroke={INK} strokeWidth={2} />
      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={800} fill={INK} className="font-display">{v}</text>
    </g>
  )
  const node = (x: number, y: number, glyph: string, value: number | null, color: string) => (
    <g>
      <circle cx={x} cy={y} r={25} fill="#FEF9C3" stroke={color} strokeWidth={2.4} />
      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize={value != null ? 16 : 20} fontWeight={900} fill={value != null ? BLUE : INK} className="font-display">
        {value != null ? value : glyph}
      </text>
    </g>
  )
  const arrow = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1, dy = y2 - y1
    const len = Math.hypot(dx, dy)
    const ux = dx / len, uy = dy / len
    const ax = x1 + ux * (len - 31), ay = y1 + uy * (len - 31)
    return (
      <g>
        <line x1={x1 + ux * 27} y1={y1 + uy * 27} x2={ax} y2={ay} stroke="#2E76C9" strokeWidth={3} />
        <polygon points={`${ax + ux * 9},${ay + uy * 9} ${ax - uy * 6},${ay + ux * 6} ${ax + uy * 6},${ay - ux * 6}`} fill="#2E76C9" />
      </g>
    )
  }
  return (
    <svg viewBox="0 0 440 330" width="100%" style={{ maxWidth: 460, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {arrow(55, 75, 120, 75)}
      {arrow(120, 75, 185, 75)}
      {arrow(185, 75, 250, 75)}
      {arrow(250, 30, 250, 75)}
      {arrow(250, 75, 250, 140)}
      {arrow(250, 140, 250, 205)}
      {arrow(250, 205, 315, 205)}
      {arrow(315, 205, 380, 205)}
      {arrow(380, 205, 380, 270)}
      {plain(55, 75, '18')}
      {plain(120, 75, '20')}
      {node(185, 75, '🐤', r.chick ? CHAIN21G2.chick : null, '#E2B33C')}
      {node(250, 30, '🐑', r.sheep ? CHAIN21G2.sheep : null, '#8FBF6B')}
      {plain(250, 75, '24')}
      {plain(250, 140, '27')}
      {node(250, 205, '🐊', r.croc ? CHAIN21G2.croc : null, '#2F9E44')}
      {node(315, 205, '🦁', r.lion ? CHAIN21G2.lion : null, '#D97706')}
      {plain(380, 205, '40')}
      {plain(380, 270, '45')}
    </svg>
  )
}
export function ChainDiagram21G2Illustration() {
  return (
    <Frame aria="Chains of circles: eighteen, twenty, chick, twenty-four across the top; sheep, twenty-four, twenty-seven, crocodile down the middle; crocodile, lion, forty, forty-five across the bottom.">
      <ChainDiagram21G2 />
    </Frame>
  )
}

/* ------------------------------------------------------------------ Q18 —
 * 4×4×4 cube with a stepped pit: 3 columns miss 1, 2 columns miss 2,
 * 1 column misses 3 → 10 missing. */
export type Voxel21G2 = [number, number, number]
export const CUBE_MISSING_G2: Voxel21G2[] = [
  [1, 2, 3], [2, 2, 3], [3, 2, 3],
  [2, 1, 3], [2, 1, 2], [3, 1, 3], [3, 1, 2],
  [3, 0, 3], [3, 0, 2], [3, 0, 1],
]
export function BigCube21G2({ countUpto }: { countUpto?: number }) {
  const missingKey = new Set(CUBE_MISSING_G2.map(([x, y, z]) => `${x},${y},${z}`))
  const voxels: Voxel21G2[] = []
  for (let z = 0; z < 4; z++)
    for (let y = 3; y >= 0; y--)
      for (let x = 0; x < 4; x++)
        if (!missingKey.has(`${x},${y},${z}`)) voxels.push([x, y, z])
  const size = 17
  const cx = size * 0.86
  const cy = size * 0.5
  const proj = ([x, y, z]: Voxel21G2) => ({ sx: (x + y) * cx, sy: (x - y) * cy - z * size })
  const upto = countUpto ?? -1
  return (
    <svg viewBox="-12 -110 180 190" width="100%" style={{ maxWidth: 320, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {voxels
        .sort((a, b) => b[1] - a[1] || a[2] - b[2] || a[0] - b[0])
        .map((v, i) => {
          const { sx, sy } = proj(v)
          return (
            <g key={i}>
              <polygon points={`${sx},${sy} ${sx + cx},${sy - cy} ${sx + 2 * cx},${sy} ${sx + cx},${sy + cy}`} fill="#D3EDD4" stroke={INK} strokeWidth={1.1} />
              <polygon points={`${sx},${sy} ${sx + cx},${sy + cy} ${sx + cx},${sy + cy + size} ${sx},${sy + size}`} fill="#A4D6A7" stroke={INK} strokeWidth={1.1} />
              <polygon points={`${sx + cx},${sy + cy} ${sx + 2 * cx},${sy} ${sx + 2 * cx},${sy + size} ${sx + cx},${sy + cy + size}`} fill="#74B978" stroke={INK} strokeWidth={1.1} />
            </g>
          )
        })}
      {CUBE_MISSING_G2.slice(0, Math.max(0, upto + 1)).map((v, i) => {
        const { sx, sy } = proj(v)
        return (
          <g key={i}>
            <polygon points={`${sx},${sy} ${sx + cx},${sy - cy} ${sx + 2 * cx},${sy} ${sx + cx},${sy + cy}`} fill="#F4B40055" stroke="#9A6B00" strokeWidth={2} />
            <text x={sx + cx} y={sy + 2} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={900} fill="#9A6B00" className="font-display">{i + 1}</text>
          </g>
        )
      })}
    </svg>
  )
}
export function BigCube21G2Illustration() {
  return (
    <Frame aria="A four-by-four-by-four green cube with a stepped pit carved into the top.">
      <BigCube21G2 />
    </Frame>
  )
}

/* ------------------------------------------------------------------ Q19 —
 * Hexagons: center = sum of products of the three OPPOSITE pairs.
 * Order around: [top, upper-right, lower-right, bottom, lower-left, upper-left];
 * opposite pairs: (0,3), (1,4), (2,5). */
export const HEXES19 = [
  { around: [2, 9, 3, 5, 1, 4], center: 31 as number | null },
  { around: [8, 9, 4, 1, 2, 7], center: 54 as number | null },
  { around: [4, 2, 8, 5, 6, 3], center: null as number | null },
]
const HEX_COLORS = ['#FBD3E0', '#FFE9A8', '#BFE3B4', '#FBD3E0', '#FFE9A8', '#BFE3B4']
export function Hexagon19({ data, litPair, showCenter }: { data: (typeof HEXES19)[number]; litPair?: number; showCenter?: number | null }) {
  const R = 56
  const r = 24
  const cx = 64, cy = 64
  const pt = (i: number, rad: number) => {
    const a = ((i * 60 - 90) * Math.PI) / 180
    return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]
  }
  // hexagon vertices offset by 30° so sectors face up/down etc.
  const v = (i: number, rad: number) => {
    const a = ((i * 60 - 120) * Math.PI) / 180
    return `${cx + Math.cos(a) * rad},${cy + Math.sin(a) * rad}`
  }
  const center = showCenter !== undefined ? showCenter : data.center
  return (
    <svg viewBox="0 0 128 128" width={118} aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => {
        const lit = litPair !== undefined && (i === litPair || i === (litPair + 3) % 6)
        return (
          <polygon
            key={i}
            points={`${v(i, R)} ${v(i + 1, R)} ${v(i + 1, r)} ${v(i, r)}`}
            fill={HEX_COLORS[i]}
            stroke={lit ? '#D97706' : INK}
            strokeWidth={lit ? 3.2 : 1.6}
          />
        )
      })}
      <polygon points={Array.from({ length: 6 }, (_, i) => v(i, r)).join(' ')} fill="white" stroke={INK} strokeWidth={1.6} />
      {data.around.map((n, i) => {
        const [x, y] = pt(i, (R + r) / 2 + 2)
        return (
          <text key={i} x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={900} fill={INK} className="font-display">
            {n}
          </text>
        )
      })}
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="central" fontSize={center == null ? 18 : 15} fontWeight={900} fill={center == null ? '#D97706' : INK} className="font-display">
        {center == null ? '🍍' : center}
      </text>
    </svg>
  )
}
export function Hexagons21G2Illustration() {
  return (
    <Frame aria="Three hexagons split into six parts around a centre number: thirty-one, fifty-four, and a pineapple.">
      <div className="flex flex-wrap items-end justify-center gap-3 py-1">
        {HEXES19.map((h, i) => (
          <Hexagon19 key={i} data={h} />
        ))}
      </div>
    </Frame>
  )
}

/* ------------------------------------------------------------------ Q23 —
 * The tower: layer heights bottom→top (verified from the scan):
 * 10 (lying rects) + 10 (squares) + 25 (standing legs) + 10 + 10 + 25 (torso)
 * + 10 + 25 (neck) + 15 (three 5-squares) = 140. */
export const TOWER23: Array<{ h: number; w: number; color: string; labelEn: string; labelId: string }> = [
  { h: 10, w: 130, color: '#F4B400', labelEn: 'lying rectangle: +10', labelId: 'persegi panjang rebah: +10' },
  { h: 10, w: 110, color: '#8FD6A8', labelEn: 'two rows of 5-squares: +10', labelId: 'dua baris persegi-5: +10' },
  { h: 25, w: 90, color: '#F4B400', labelEn: 'standing rectangle: +25', labelId: 'persegi panjang berdiri: +25' },
  { h: 10, w: 120, color: '#E8965A', labelEn: 'lying rectangle: +10', labelId: 'persegi panjang rebah: +10' },
  { h: 10, w: 120, color: '#F4B400', labelEn: 'lying rectangle: +10', labelId: 'persegi panjang rebah: +10' },
  { h: 25, w: 80, color: '#E8965A', labelEn: 'standing rectangle: +25', labelId: 'persegi panjang berdiri: +25' },
  { h: 10, w: 100, color: '#F4B400', labelEn: 'lying rectangle: +10', labelId: 'persegi panjang rebah: +10' },
  { h: 25, w: 40, color: '#E8965A', labelEn: 'standing rectangle: +25', labelId: 'persegi panjang berdiri: +25' },
  { h: 15, w: 18, color: '#8FD6A8', labelEn: 'three 5-squares: +15', labelId: 'tiga persegi-5: +15' },
]
export const TOWER_TOTAL = TOWER23.reduce((a, l) => a + l.h, 0) // 140
export function Tower23({ litUpto }: { litUpto?: number }) {
  const scale = 1.55
  const totalH = TOWER_TOTAL * scale
  let y = 14 + totalH
  const upto = litUpto ?? -1
  return (
    <svg viewBox="0 0 300 248" width="100%" style={{ maxWidth: 300, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {TOWER23.map((l, i) => {
        y -= l.h * scale
        const lit = i === upto
        const counted = upto >= 0 && i <= upto
        return (
          <g key={i} opacity={upto === -1 || counted ? 1 : 0.3}>
            <rect x={150 - l.w / 2} y={y} width={l.w} height={l.h * scale - 1.5} fill={l.color} stroke={lit ? '#D7263D' : INK} strokeWidth={lit ? 3 : 1.6} />
            {lit && (
              <text x={150 + l.w / 2 + 8} y={y + (l.h * scale) / 2} textAnchor="start" dominantBaseline="central" fontSize={13} fontWeight={900} fill="#D7263D" className="font-display">
                +{l.h}
              </text>
            )}
          </g>
        )
      })}
      <line x1={48} y1={14} x2={48} y2={14 + totalH} stroke={BLUE} strokeWidth={2} />
      <text x={34} y={14 + totalH / 2} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={900} fill={BLUE} transform={`rotate(-90 34 ${14 + totalH / 2})`} className="font-display">? cm</text>
    </svg>
  )
}
export function Tower21G2Illustration() {
  return (
    <Frame aria="A tower stacked from twenty-five by ten rectangles and five by five squares, with its full height marked by a question mark.">
      <Tower23 />
    </Frame>
  )
}

/* ------------------------------------------------------------------ Q24 —
 * Rabbit maze: 3 rows × 5 cols, stones at (1,3),(2,3); rabbit (3,1); carrot
 * (1,5). Verified path: 1 1 4 3 3 4 4 4 1 2 1 4 → sum 32. */
export const MAZE_CELLS_G2: Array<[number, number]> = (() => {
  const out: Array<[number, number]> = []
  for (let r = 1; r <= 3; r++) for (let c = 1; c <= 5; c++) out.push([r, c])
  return out
})()
export const MAZE_STONES_G2: Array<[number, number]> = [[1, 3], [2, 3]]
export const MAZE_PATH_G2: Array<[number, number]> = [
  [3, 1], [2, 1], [1, 1], [1, 2], [2, 2], [3, 2], [3, 3], [3, 4], [3, 5], [2, 5], [2, 4], [1, 4], [1, 5],
]
export const MAZE_MOVES_G2 = [1, 1, 4, 3, 3, 4, 4, 4, 1, 2, 1, 4]
export function RabbitMaze21G2({ movesUpto }: { movesUpto?: number }) {
  const s = 58
  const upto = movesUpto ?? -1
  const stones = new Set(MAZE_STONES_G2.map(([r, c]) => `${r},${c}`))
  const visited = MAZE_PATH_G2.slice(0, Math.max(1, upto + 2))
  const head = visited[visited.length - 1]
  const px = (c: number) => 10 + (c - 1) * s + s / 2
  const py = (r: number) => 10 + (r - 1) * s + s / 2
  return (
    <svg viewBox="0 0 310 196" width="100%" style={{ maxWidth: 330, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {MAZE_CELLS_G2.map(([r, c]) => (
        <rect key={`${r}-${c}`} x={10 + (c - 1) * s} y={10 + (r - 1) * s} width={s} height={s} fill={stones.has(`${r},${c}`) ? '#E2E8F0' : '#F5E5C8'} stroke="#8B6534" strokeWidth={2} />
      ))}
      {MAZE_STONES_G2.map(([r, c]) => (
        <text key={`${r}-${c}`} x={px(c)} y={py(r)} textAnchor="middle" dominantBaseline="central" fontSize={24}>🪨</text>
      ))}
      {upto >= 0 && (
        <polyline points={visited.map(([r, c]) => `${px(c)},${py(r)}`).join(' ')} fill="none" stroke="#D7263D" strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" opacity={0.55} />
      )}
      <text x={px(5)} y={py(1)} textAnchor="middle" dominantBaseline="central" fontSize={22}>🥕</text>
      <text x={px(head[1])} y={py(head[0])} textAnchor="middle" dominantBaseline="central" fontSize={24}>🐇</text>
    </svg>
  )
}
export function RabbitMaze21G2Illustration() {
  return (
    <Frame aria="A three-by-five maze: the rabbit starts bottom left, two stones block column three's upper cells, and the carrot waits top right.">
      <RabbitMaze21G2 />
    </Frame>
  )
}

/* ------------------------------------------------------------------ Q25 —
 * 5×5 quadruple-clue Sudoku. Unique solution (solver-verified):
 *   2 4 1 3 5 / 1 3 5 2 4 / 3 5 2 4 1 / 4 1 3 5 2 / 5 2 4 1 3
 * Given: 2 at (3,3). Quads (top-left corner of the 2×2): 1235@(1,3),
 * 1335@(2,1), 2355@(2,2), 1345@(3,1), 1234@(4,2). Letters down column 5
 * read 5,4,1,2,3 → ABCDE = 54123. */
export const SUDOKU25: number[][] = [
  [2, 4, 1, 3, 5],
  [1, 3, 5, 2, 4],
  [3, 5, 2, 4, 1],
  [4, 1, 3, 5, 2],
  [5, 2, 4, 1, 3],
]
export const SUDOKU25_GIVEN: Array<[number, number]> = [[3, 3]]
export const SUDOKU25_QUADS: Array<{ at: [number, number]; nums: string }> = [
  { at: [1, 3], nums: '1235' },
  { at: [2, 1], nums: '1335' },
  { at: [2, 2], nums: '2355' },
  { at: [3, 1], nums: '1345' },
  { at: [4, 2], nums: '1234' },
]
export function SudokuBoard25({ revealKeys, litQuad }: { revealKeys?: Set<string>; litQuad?: number }) {
  const s = 56
  const given = new Set(SUDOKU25_GIVEN.map(([r, c]) => `${r},${c}`))
  return (
    <svg viewBox={`0 0 ${20 + 5 * s + 36} ${20 + 5 * s}`} width="100%" style={{ maxWidth: 400, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {SUDOKU25.map((row, ri) =>
        row.map((v, ci) => {
          const r = ri + 1
          const c = ci + 1
          const key = `${r},${c}`
          const isGiven = given.has(key)
          const shown = isGiven || (revealKeys?.has(key) ?? false)
          const letter = c === 5 ? ['A', 'B', 'C', 'D', 'E'][ri] : null
          return (
            <g key={key}>
              <rect x={10 + ci * s} y={10 + ri * s} width={s} height={s} fill={letter && !shown ? '#EFF6FF' : 'white'} stroke={INK} strokeWidth={1.4} />
              {shown ? (
                <text x={10 + ci * s + s / 2} y={10 + ri * s + s / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill={isGiven ? '#D7263D' : BLUE} className="font-display">
                  {v}
                </text>
              ) : letter ? (
                <text x={10 + ci * s + s / 2} y={10 + ri * s + s / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={900} fill="#93C5FD" className="font-display">
                  {letter}
                </text>
              ) : null}
            </g>
          )
        }),
      )}
      <rect x={10} y={10} width={5 * s} height={5 * s} fill="none" stroke={INK} strokeWidth={3} />
      {SUDOKU25_QUADS.map((q, i) => {
        const [r, c] = q.at
        const x = 10 + c * s
        const y = 10 + r * s
        const lit = litQuad === i
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={17} fill={lit ? '#FFE9A8' : 'white'} stroke={lit ? '#D97706' : INK} strokeWidth={lit ? 2.6 : 1.4} />
            <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize={10.5} fontWeight={900} fill={INK} className="font-display">{q.nums}</text>
          </g>
        )
      })}
    </svg>
  )
}
export function Sudoku21G2Illustration() {
  return (
    <Frame aria="A five-by-five Sudoku with one given two, five small four-number clues at square intersections, and letters A to E down the last column.">
      <SudokuBoard25 />
    </Frame>
  )
}
