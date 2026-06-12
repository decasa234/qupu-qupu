// Puzzle figures for WMI-21F1A with solver-verified data.

const INK = '#1F2937'
const BLUE = '#30598A'

function Frame({ aria, children }: { aria: string; children: React.ReactNode }) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2" role="img" aria-label={aria}>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ Q3 —
 * Cube solids. Voxels (x = right, y = depth, z = up); counts verified against
 * the scan: A 8, B 8, C 8, D 9 → answer D. */
export type Voxel = [number, number, number]
export const SOLIDS: Record<string, Voxel[]> = {
  A: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 1, 0], [2, 2, 0], [3, 2, 0], [4, 2, 0], [0, 0, 1]],
  B: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [2, 0, 1], [2, 0, 2], [2, 1, 0], [3, 1, 0], [3, 2, 0]],
  C: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 1, 0], [3, 1, 0], [3, 2, 0], [4, 2, 0], [5, 2, 0]],
  D: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0], [4, 0, 0], [0, 0, 1], [0, 0, 2], [2, 0, 1], [2, 0, 2]],
}
export const SOLID_COUNTS: Record<string, number> = { A: 8, B: 8, C: 8, D: 9 }

export function IsoStack({ voxels, size = 20, upto, pad = 12 }: { voxels: Voxel[]; size?: number; upto?: number; pad?: number }) {
  const cx = size * 0.86
  const cy = size * 0.5
  const order = [...voxels.keys()].sort((a, b) => {
    const [ax, ay, az] = voxels[a]
    const [bx, by, bz] = voxels[b]
    return ay - by || az - bz || ax - bx
  })
  const pts = voxels.map(([x, y, z]) => ({ sx: (x + y) * cx, sy: (x - y) * cy - z * size }))
  const minX = Math.min(...pts.map((p) => p.sx)) - pad
  const maxX = Math.max(...pts.map((p) => p.sx)) + cx * 2 + pad
  const minY = Math.min(...pts.map((p) => p.sy)) - size - cy - pad
  const maxY = Math.max(...pts.map((p) => p.sy)) + cy * 2 + pad
  return (
    <svg viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} width={(maxX - minX) * 0.9} aria-hidden="true">
      {order.map((idx) => {
        const [x, y, z] = voxels[idx]
        const sx = (x + y) * cx
        const sy = (x - y) * cy - z * size
        const lit = upto !== undefined && idx === upto
        const dim = upto !== undefined && idx > upto
        const top = `${sx},${sy} ${sx + cx},${sy - cy} ${sx + 2 * cx},${sy} ${sx + cx},${sy + cy}`
        const leftF = `${sx},${sy} ${sx + cx},${sy + cy} ${sx + cx},${sy + cy + size} ${sx},${sy + size}`
        const rightF = `${sx + cx},${sy + cy} ${sx + 2 * cx},${sy} ${sx + 2 * cx},${sy + size} ${sx + cx},${sy + cy + size}`
        return (
          <g key={idx} opacity={dim ? 0.25 : 1}>
            <polygon points={top} fill={lit ? '#FFD23F' : '#D6EBF7'} stroke={INK} strokeWidth={1.4} />
            <polygon points={leftF} fill={lit ? '#F4B400' : '#8FC6E8'} stroke={INK} strokeWidth={1.4} />
            <polygon points={rightF} fill={lit ? '#D97706' : '#5BA8D4'} stroke={INK} strokeWidth={1.4} />
          </g>
        )
      })}
    </svg>
  )
}
/* ------------------------------------------------------------------ Q18 —
 * Balloon grid (rows 3-5-5-5-3) and five arrows. Cell coords [row, col],
 * 1-based. Verified: 16 broken, 5 survive. */
export const BALLOONS: Array<[number, number]> = [
  [1, 2], [1, 3], [1, 4],
  [2, 1], [2, 2], [2, 3], [2, 4], [2, 5],
  [3, 1], [3, 2], [3, 3], [3, 4], [3, 5],
  [4, 1], [4, 2], [4, 3], [4, 4], [4, 5],
  [5, 2], [5, 3], [5, 4],
]
export interface Arrow21 {
  hits: Array<[number, number]>
  /** line endpoints in cell coordinates (row, col), may be fractional */
  from: [number, number]
  to: [number, number]
  labelEn: string
  labelId: string
}
export const ARROWS21: Arrow21[] = [
  {
    hits: [[1, 2], [3, 3], [5, 4]],
    from: [-0.1, 1.45], to: [5.9, 4.45],
    labelEn: 'The steep arrow dives through 3 balloons',
    labelId: 'Panah curam menembus 3 balon',
  },
  {
    hits: [[3, 5], [3, 4], [3, 3], [3, 2], [3, 1]],
    from: [3, 6.1], to: [3, 0.2],
    labelEn: 'The right arrow sweeps row 3: 5 balloons',
    labelId: 'Panah kanan menyapu baris 3: 5 balon',
  },
  {
    hits: [[4, 1], [4, 2], [4, 3], [4, 4], [4, 5]],
    from: [4, -0.1], to: [4, 5.8],
    labelEn: 'The left arrow sweeps row 4: 5 balloons',
    labelId: 'Panah kiri menyapu baris 4: 5 balon',
  },
  {
    hits: [[4, 1], [3, 2], [2, 3], [1, 4]],
    from: [5.2, -0.2], to: [0.4, 4.6],
    labelEn: 'The diagonal arrow climbs through 4 (2 new)',
    labelId: 'Panah diagonal menanjak lewat 4 (2 baru)',
  },
  {
    hits: [[5, 2], [4, 2], [3, 2], [2, 2], [1, 2]],
    from: [6.1, 2], to: [0.2, 2],
    labelEn: 'The bottom arrow flies up column 2: 5 (2 new)',
    labelId: 'Panah bawah terbang ke atas kolom 2: 5 (2 baru)',
  },
]
export const SURVIVORS21: Array<[number, number]> = [[1, 3], [2, 1], [2, 4], [2, 5], [5, 3]]

export function BalloonField21({ shotUpto, highlightSurvivors, showArrows }: { shotUpto?: number; highlightSurvivors?: boolean; showArrows?: boolean }) {
  const s = 54
  const upto = shotUpto ?? -1
  const popped = new Set<string>()
  ARROWS21.slice(0, upto + 1).forEach((a) => a.hits.forEach(([r, c]) => popped.add(`${r},${c}`)))
  const px = (c: number) => 20 + (c - 1) * s + s / 2
  const py = (r: number) => 10 + (r - 1) * s + s / 2
  return (
    <svg viewBox={showArrows ? '-50 -50 430 430' : '0 0 330 330'} width="100%" style={{ maxWidth: showArrows ? 400 : 340, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {BALLOONS.map(([r, c]) => {
        const dead = popped.has(`${r},${c}`)
        const safe = highlightSurvivors && !dead
        return (
          <g key={`${r}-${c}`}>
            {safe && <circle cx={px(c)} cy={py(r)} r={20} fill="#D1FAE5" stroke="#10B981" strokeWidth={2.5} />}
            <text x={px(c)} y={py(r)} textAnchor="middle" dominantBaseline="central" fontSize={24} opacity={dead ? 0.18 : 1}>
              {dead ? '💥' : '🎈'}
            </text>
          </g>
        )
      })}
      {showArrows &&
        // like the printed figure: a short arrow at each line's START, aimed into the field
        ARROWS21.map((a, i) => {
          const x1 = px(a.from[1]), y1 = py(a.from[0])
          const x2 = px(a.to[1]), y2 = py(a.to[0])
          const len = Math.hypot(x2 - x1, y2 - y1)
          const ux = (x2 - x1) / len, uy = (y2 - y1) / len
          const tx = x1 + ux * 34, ty = y1 + uy * 34
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={tx} y2={ty} stroke={INK} strokeWidth={3.2} strokeLinecap="round" />
              <polygon points={`${tx + ux * 11},${ty + uy * 11} ${tx - uy * 6.5},${ty + ux * 6.5} ${tx + uy * 6.5},${ty - ux * 6.5}`} fill={INK} />
              <line x1={x1 - uy * 6} y1={y1 + ux * 6} x2={x1 + ux * 9 - uy * 2} y2={y1 + uy * 9 + ux * 2} stroke={INK} strokeWidth={2} />
              <line x1={x1 + uy * 6} y1={y1 - ux * 6} x2={x1 + ux * 9 + uy * 2} y2={y1 + uy * 9 - ux * 2} stroke={INK} strokeWidth={2} />
            </g>
          )
        })}
      {upto >= 0 && upto < ARROWS21.length && (() => {
        const a = ARROWS21[upto]
        return (
          <g>
            <line x1={px(a.from[1])} y1={py(a.from[0])} x2={px(a.to[1])} y2={py(a.to[0])} stroke="#D97706" strokeWidth={3} strokeDasharray="8 5" />
            <circle cx={px(a.to[1])} cy={py(a.to[0])} r={5} fill="#D97706" />
          </g>
        )
      })()}
    </svg>
  )
}
export function Balloons21Illustration() {
  return (
    <Frame aria="Twenty-one balloons in rows of three, five, five, five and three, with five arrows aimed across the field.">
      <BalloonField21 showArrows />
    </Frame>
  )
}

/* ------------------------------------------------------------------ Q19 —
 * The number-chain cross: middle column 2,4,○,△,10 (+2); left row 0,☆,○ (+3)
 * joining at the circle; bottom row △,9,□,11 (+1) starting at the triangle.
 * Plain shapes (was animals in the scan; per review): ☆ 3, ○ 6, △ 8, □ 10 → 27. */
export const CHAIN21 = { sheep: 3, chick: 6, croc: 8, lion: 10 }
export const CHAIN21_GLYPHS = { sheep: '☆', chick: '○', croc: '△', lion: '□' } as const
export function ChainDiagram21({ reveal }: { reveal?: { chick?: boolean; croc?: boolean; sheep?: boolean; lion?: boolean } }) {
  const r = reveal ?? {}
  const node = (x: number, y: number, label: string, value: number | null, color: string) => (
    <g>
      <circle cx={x} cy={y} r={24} fill="#FEF9C3" stroke={color} strokeWidth={2.4} />
      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize={value != null ? 17 : 24} fontWeight={900} fill={value != null ? BLUE : INK} className="font-display">
        {value != null ? value : label}
      </text>
    </g>
  )
  const plain = (x: number, y: number, v: string) => (
    <g>
      <circle cx={x} cy={y} r={22} fill="white" stroke={INK} strokeWidth={2} />
      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={800} fill={INK} className="font-display">{v}</text>
    </g>
  )
  const arrow = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1, dy = y2 - y1
    const len = Math.hypot(dx, dy)
    const ux = dx / len, uy = dy / len
    const ax = x1 + ux * (len - 30), ay = y1 + uy * (len - 30)
    return (
      <g>
        <line x1={x1 + ux * 26} y1={y1 + uy * 26} x2={ax} y2={ay} stroke="#2E76C9" strokeWidth={3} />
        <polygon points={`${ax + ux * 9},${ay + uy * 9} ${ax - uy * 6},${ay + ux * 6} ${ax + uy * 6},${ay - ux * 6}`} fill="#2E76C9" />
      </g>
    )
  }
  const CX = 190
  return (
    <svg viewBox="0 0 420 332" width="100%" style={{ maxWidth: 440, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {arrow(CX, 40, CX, 105)}
      {arrow(CX, 105, CX, 170)}
      {arrow(CX, 170, CX, 235)}
      {arrow(CX, 235, CX, 300)}
      {arrow(60, 170, 125, 170)}
      {arrow(125, 170, CX, 170)}
      {arrow(CX, 235, 255, 235)}
      {arrow(255, 235, 320, 235)}
      {arrow(320, 235, 385, 235)}
      {plain(CX, 40, '2')}
      {plain(CX, 105, '4')}
      {plain(60, 170, '0')}
      {node(125, 170, CHAIN21_GLYPHS.sheep, r.sheep ? CHAIN21.sheep : null, INK)}
      {node(CX, 170, CHAIN21_GLYPHS.chick, r.chick ? CHAIN21.chick : null, INK)}
      {node(CX, 235, CHAIN21_GLYPHS.croc, r.croc ? CHAIN21.croc : null, INK)}
      {plain(255, 235, '9')}
      {node(320, 235, CHAIN21_GLYPHS.lion, r.lion ? CHAIN21.lion : null, INK)}
      {plain(385, 235, '11')}
      {plain(CX, 300, '10')}
    </svg>
  )
}
export function ChainDiagram21Illustration() {
  return (
    <Frame aria="A cross of circles joined by arrows: two, four, circle, triangle, ten down the middle; zero, star, circle across the left; triangle, nine, square, eleven across the bottom.">
      <ChainDiagram21 />
    </Frame>
  )
}

/* ------------------------------------------------------------------ Q21 —
 * 4×4×4 cube with 8 missing cubes. johan's height matrix, 2 at the
 * front-right (viewer-facing) corner:
 *   4 4 4 4    (back)
 *   4 4 4 3
 *   4 4 4 1
 *   4 3 3 2    (front)
 * (rows back→front, cols left→right, value = stack height)
 * → missing: right side 6 (corner stack 2 + deep pit 3 + one top), front-row tops 2. */
export const CUBE_MISSING: Voxel[] = [
  // right column, front to back, top down
  [3, 0, 3], [3, 0, 2],
  [3, 1, 3], [3, 1, 2], [3, 1, 1],
  [3, 2, 3],
  // front row: two more missing top cubes
  [1, 0, 3], [2, 0, 3],
]
export function BigCube21({ countUpto }: { countUpto?: number }) {
  const missingKey = new Set(CUBE_MISSING.map(([x, y, z]) => `${x},${y},${z}`))
  const voxels: Voxel[] = []
  for (let z = 0; z < 4; z++)
    for (let y = 3; y >= 0; y--)
      for (let x = 0; x < 4; x++)
        if (!missingKey.has(`${x},${y},${z}`)) voxels.push([x, y, z])
  const size = 17
  const cx = size * 0.86
  const cy = size * 0.5
  const proj = ([x, y, z]: Voxel) => ({ sx: (x + y) * cx, sy: (x - y) * cy - z * size })
  const upto = countUpto ?? -1
  return (
    <svg viewBox="-12 -110 180 190" width="100%" style={{ maxWidth: 320, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {voxels
        .sort((a, b) => b[1] - a[1] || a[2] - b[2] || a[0] - b[0])
        .map((v, i) => {
          const { sx, sy } = proj(v)
          const top = `${sx},${sy} ${sx + cx},${sy - cy} ${sx + 2 * cx},${sy} ${sx + cx},${sy + cy}`
          const leftF = `${sx},${sy} ${sx + cx},${sy + cy} ${sx + cx},${sy + cy + size} ${sx},${sy + size}`
          const rightF = `${sx + cx},${sy + cy} ${sx + 2 * cx},${sy} ${sx + 2 * cx},${sy + size} ${sx + cx},${sy + cy + size}`
          return (
            <g key={i}>
              <polygon points={top} fill="#FBD3E0" stroke={INK} strokeWidth={1.1} />
              <polygon points={leftF} fill="#F3A6C0" stroke={INK} strokeWidth={1.1} />
              <polygon points={rightF} fill="#E37FA4" stroke={INK} strokeWidth={1.1} />
            </g>
          )
        })}
      {CUBE_MISSING.slice(0, Math.max(0, upto + 1)).map((v, i) => {
        const { sx, sy } = proj(v)
        return (
          <g key={i}>
            <polygon points={`${sx},${sy} ${sx + cx},${sy - cy} ${sx + 2 * cx},${sy} ${sx + cx},${sy + cy}`} fill="#10B98155" stroke="#065F46" strokeWidth={2} />
            <text x={sx + cx} y={sy + 2} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={900} fill="#065F46" className="font-display">{i + 1}</text>
          </g>
        )
      })}
    </svg>
  )
}
export function BigCube21Illustration() {
  return (
    <Frame aria="A four-by-four-by-four cube with a low corner stack at the front right, a deep pit behind it, and two more missing top cubes along the front row.">
      <BigCube21 />
    </Frame>
  )
}

/* ------------------------------------------------------------------ Q22 —
 * The four circle puzzles: rule green-left + green-right − pink-top = box. */
export const CIRCLES22 = [
  { top: 8, left: 5, right: 8 as number | null, box: 5 },
  { top: 2, left: 4, right: 7 as number | null, box: 9 },
  { top: 5, left: 11, right: 6 as number | null, box: 12 },
  { top: 4, left: 9, right: null as number | null, box: 11 },
]
export function CircleCard22({ data, showApple, lit }: { data: (typeof CIRCLES22)[number]; showApple?: boolean; lit?: boolean }) {
  return (
    <svg viewBox="0 0 110 140" width={104} aria-hidden="true">
      <circle cx={55} cy={50} r={44} fill="#F6B8CD" stroke={lit ? '#D97706' : INK} strokeWidth={lit ? 3.4 : 2} />
      <path d="M 11 50 A 44 44 0 0 0 99 50 Z" fill="#BFE3B4" stroke={lit ? '#D97706' : INK} strokeWidth={lit ? 3.4 : 2} />
      <line x1={55} y1={50} x2={55} y2={94} stroke={INK} strokeWidth={2} />
      <text x={55} y={30} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={900} fill={INK} className="font-display">{data.top}</text>
      <text x={36} y={68} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={900} fill={INK} className="font-display">{data.left}</text>
      <text x={74} y={68} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={900} fill={INK} className="font-display">
        {data.right != null ? data.right : showApple ? '🍎' : '?'}
      </text>
      <rect x={35} y={102} width={40} height={30} rx={4} fill="white" stroke={INK} strokeWidth={2.2} />
      <text x={55} y={118} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={900} fill={INK} className="font-display">{data.box}</text>
    </svg>
  )
}
export function Circles22Illustration() {
  return (
    <Frame aria="Four circles, each with a pink top number, two green bottom numbers, and a box below; the last circle has an apple in place of one number.">
      <div className="flex flex-wrap items-end justify-center gap-2 py-1">
        {CIRCLES22.map((d, i) => (
          <CircleCard22 key={i} data={d} showApple={i === 3} />
        ))}
      </div>
    </Frame>
  )
}

/* ------------------------------------------------------------------ Q24 —
 * The balanced mobile: strings 3×🍓 | 2×🍉 | 🍍🍍🍇 | 🍓🍉🍍; 🍓=10 → 🍉15, 🍍5, 🍇20. */
export function Mobile21({ values, showKnown = true }: { values?: { melon?: boolean; pine?: boolean; grape?: boolean }; showKnown?: boolean }) {
  const v = values ?? {}
  const straw = showKnown ? 10 : null
  const fruit = (x: number, y: number, glyph: string, val: number | null) => (
    <g>
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={22}>{glyph}</text>
      {val != null && (
        <g>
          <circle cx={x + 17} cy={y - 11} r={11} fill="#30598A" />
          <text x={x + 17} y={y - 10} textAnchor="middle" dominantBaseline="central" fontSize={10.5} fontWeight={900} fill="white" className="font-display">{val}</text>
        </g>
      )}
    </g>
  )
  const strings: Array<{ x: number; items: Array<[string, number | null]> }> = [
    { x: 60, items: [['🍓', straw], ['🍓', straw], ['🍓', straw]] },
    { x: 150, items: [['🍉', v.melon ? 15 : null], ['🍉', v.melon ? 15 : null]] },
    { x: 250, items: [['🍍', v.pine ? 5 : null], ['🍍', v.pine ? 5 : null], ['🍇', v.grape ? 20 : null]] },
    { x: 340, items: [['🍓', straw], ['🍉', v.melon ? 15 : null], ['🍍', v.pine ? 5 : null]] },
  ]
  return (
    <svg viewBox="0 0 420 240" width="100%" style={{ maxWidth: 440, display: 'block', margin: '0 auto' }} aria-hidden="true">
      <line x1={105} y1={28} x2={295} y2={28} stroke={INK} strokeWidth={4} />
      <line x1={200} y1={12} x2={200} y2={28} stroke={INK} strokeWidth={3} />
      <line x1={105} y1={28} x2={105} y2={46} stroke={INK} strokeWidth={3} />
      <line x1={295} y1={28} x2={295} y2={46} stroke={INK} strokeWidth={3} />
      <line x1={60} y1={46} x2={150} y2={46} stroke={INK} strokeWidth={4} />
      <line x1={250} y1={46} x2={340} y2={46} stroke={INK} strokeWidth={4} />
      {strings.map(({ x, items }) => (
        <g key={x}>
          <line x1={x} y1={46} x2={x} y2={66 + (items.length - 1) * 42 + 10} stroke={INK} strokeWidth={2} />
          {items.map(([glyph, val], i) => (
            <g key={i}>{fruit(x, 72 + i * 42, glyph, val)}</g>
          ))}
        </g>
      ))}
    </svg>
  )
}
export function Mobile21Illustration() {
  return (
    <Frame aria="A balanced hanging mobile: three strawberries, two watermelons, two pineapples with grapes, and a strawberry-watermelon-pineapple string.">
      <Mobile21 showKnown={false} />
    </Frame>
  )
}

/* ------------------------------------------------------------------ Q25 —
 * Rabbit maze. Open cells: rows 1-2 cols 1-3 minus stones at (1,3),(2,3)…
 * actually stones occupy (1,3) and (2,3); rows 3-4 have cols 1-4.
 * Path (verified, sums 32): 4 3 2 3 3 4 1 4 3 4 1. */
export const MAZE_CELLS: Array<[number, number]> = [
  [1, 1], [1, 2], [1, 3],
  [2, 1], [2, 2], [2, 3],
  [3, 1], [3, 2], [3, 3], [3, 4],
  [4, 1], [4, 2], [4, 3], [4, 4],
]
export const MAZE_STONES: Array<[number, number]> = [[1, 3], [2, 3]]
export const MAZE_PATH: Array<[number, number]> = [
  [1, 1], [1, 2], [2, 2], [2, 1], [3, 1], [4, 1], [4, 2], [3, 2], [3, 3], [4, 3], [4, 4], [3, 4],
]
export const MAZE_MOVES = [4, 3, 2, 3, 3, 4, 1, 4, 3, 4, 1]
export const MOVE_NAMES_EN = ['', 'up', 'left', 'down', 'right']
export const MOVE_NAMES_ID = ['', 'atas', 'kiri', 'bawah', 'kanan']

export function RabbitMaze21({ movesUpto }: { movesUpto?: number }) {
  const s = 62
  const upto = movesUpto ?? -1
  const stones = new Set(MAZE_STONES.map(([r, c]) => `${r},${c}`))
  const visited = MAZE_PATH.slice(0, Math.max(1, upto + 2))
  const head = visited[visited.length - 1]
  const px = (c: number) => 10 + (c - 1) * s + s / 2
  const py = (r: number) => 10 + (r - 1) * s + s / 2
  return (
    <svg viewBox="0 0 280 280" width="100%" style={{ maxWidth: 300, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {MAZE_CELLS.map(([r, c]) => (
        <rect key={`${r}-${c}`} x={10 + (c - 1) * s} y={10 + (r - 1) * s} width={s} height={s} fill={stones.has(`${r},${c}`) ? '#E2E8F0' : '#F5E5C8'} stroke="#8B6534" strokeWidth={2} />
      ))}
      {MAZE_STONES.map(([r, c]) => (
        <text key={`${r}-${c}`} x={px(c)} y={py(r)} textAnchor="middle" dominantBaseline="central" fontSize={26}>🪨</text>
      ))}
      {upto >= 0 && (
        <polyline
          points={visited.map(([r, c]) => `${px(c)},${py(r)}`).join(' ')}
          fill="none"
          stroke="#D7263D"
          strokeWidth={7}
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={0.55}
        />
      )}
      <text x={px(4)} y={py(3)} textAnchor="middle" dominantBaseline="central" fontSize={24}>🥕</text>
      <text x={px(head[1])} y={py(head[0])} textAnchor="middle" dominantBaseline="central" fontSize={26}>🐇</text>
    </svg>
  )
}
export function RabbitMaze21Illustration() {
  return (
    <Frame aria="A maze of squares with a rabbit at the top left, two stones blocking the right of the upper rows, and a carrot at the right of the third row.">
      <RabbitMaze21 />
    </Frame>
  )
}
