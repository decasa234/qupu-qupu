// Puzzle figures for WMI-21F3A with solver-verified data.

const INK = '#1F2937'
const BLUE = '#30598A'

function Frame({ aria, children }: { aria: string; children: React.ReactNode }) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2" role="img" aria-label={aria}>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ Q19 —
 * Street map. Nodes (c,r): c = 0..6 left→right, r = 0..6 top→bottom;
 * John at (0,6) bottom-left, School at (6,0) top-right (pixel-verified).
 * MAP_H[r] = columns c with a street (c,r)–(c+1,r); MAP_V[c] = rows r with a
 * street (c,r)–(c,r+1); MAP_D = up-right diagonals (c,r)–(c+1,r−1).
 * DP over moves {right, up, diagonal} gives exactly 122 routes (solver-
 * verified; smoke re-asserts). A complete grid would give C(12,6) = 924. */
export const MAP_H: Record<number, number[]> = {
  0: [0, 1, 2, 3, 4, 5],
  1: [0, 1, 2],
  2: [0, 1, 2],
  3: [0, 1, 2, 3, 4, 5],
  4: [0, 1, 2, 3, 4, 5],
  5: [0, 3, 4, 5],
  6: [0, 1, 2, 3, 4, 5],
}
export const MAP_V: Record<number, number[]> = {
  0: [0, 1, 2, 3, 4, 5],
  1: [0, 1, 2, 3, 4, 5],
  2: [0, 1, 2, 3],
  3: [0, 1, 2, 3, 4, 5],
  4: [3, 4, 5],
  5: [3, 4, 5],
  6: [0, 1, 2, 3, 4, 5],
}
export const MAP_D: Array<[number, number]> = [[3, 3], [4, 2], [5, 1], [1, 6], [2, 5]]
export function mapWays(): number[][] {
  const ways: number[][] = Array.from({ length: 7 }, () => Array(7).fill(0))
  ways[0][6] = 1
  for (let r = 6; r >= 0; r--) {
    for (let c = 0; c <= 6; c++) {
      if (c === 0 && r === 6) continue
      let w = 0
      if (c > 0 && MAP_H[r].includes(c - 1)) w += ways[c - 1][r]
      if (r < 6 && MAP_V[c].includes(r)) w += ways[c][r + 1]
      if (MAP_D.some(([dc, dr]) => dc === c - 1 && dr === r + 1)) w += ways[c - 1][r + 1]
      ways[c][r] = w
    }
  }
  return ways
}
export const MAP_WAYS = mapWays() // MAP_WAYS[6][0] === 122

export function StreetMap21G3({ showRowsUpto }: { showRowsUpto?: number }) {
  const s = 52
  const px = (c: number) => 26 + c * s
  const py = (r: number) => 24 + r * s
  const rows = showRowsUpto ?? -1
  const street = (x1: number, y1: number, x2: number, y2: number, key: string) => (
    <g key={key}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D9C49A" strokeWidth={11} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8B6534" strokeWidth={1.4} strokeDasharray="5 5" />
    </g>
  )
  return (
    <svg viewBox="0 0 392 388" width="100%" style={{ maxWidth: 400, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {Object.entries(MAP_H).flatMap(([r, cols]) => cols.map((c) => street(px(c), py(Number(r)), px(c + 1), py(Number(r)), `h${r}-${c}`)))}
      {Object.entries(MAP_V).flatMap(([c, rws]) => rws.map((r) => street(px(Number(c)), py(r), px(Number(c)), py(r + 1), `v${c}-${r}`)))}
      {MAP_D.map(([c, r]) => street(px(c), py(r), px(c + 1), py(r - 1), `d${c}-${r}`))}
      {Array.from({ length: 7 }, (_, c) =>
        Array.from({ length: 7 }, (_, r) => {
          const touched = MAP_H[r].includes(c) || (c > 0 && MAP_H[r].includes(c - 1)) || MAP_V[c].includes(r) || (r > 0 && MAP_V[c].includes(r - 1)) || MAP_D.some(([dc, dr]) => (dc === c && dr === r) || (dc === c - 1 && dr === r + 1))
          if (!touched) return null
          const shown = rows >= 0 && r >= 6 - rows && MAP_WAYS[c][r] > 0
          return (
            <g key={`${c}-${r}`}>
              <circle cx={px(c)} cy={py(r)} r={3} fill="#8B6534" />
              {shown && (
                <g>
                  <circle cx={px(c)} cy={py(r)} r={11.5} fill="#E1EFFB" stroke={BLUE} strokeWidth={1.6} />
                  <text x={px(c)} y={py(r) + 1} textAnchor="middle" dominantBaseline="central" fontSize={MAP_WAYS[c][r] > 99 ? 9 : 11} fontWeight={900} fill={BLUE} className="font-display">
                    {MAP_WAYS[c][r]}
                  </text>
                </g>
              )}
            </g>
          )
        }),
      )}
      <text x={px(0) - 2} y={py(6) + 24} textAnchor="middle" fontSize={20}>🏠</text>
      <text x={px(0) - 2} y={py(6) + 40} textAnchor="middle" fontSize={9.5} fontWeight={800} fill={INK} className="font-display">John</text>
      <text x={px(6) + 2} y={py(0) - 10} textAnchor="middle" fontSize={20}>🏫</text>
    </svg>
  )
}
export function StreetMap21G3Illustration() {
  return (
    <Frame aria="A street map: John's home at the bottom left, the school at the top right, several street segments missing and two diagonal shortcut streets.">
      <StreetMap21G3 />
    </Frame>
  )
}

/* ------------------------------------------------------------------ Q24 —
 * Rabbit maze: 3 rows × 6 cols (row 1 = top), stones at (1,3), (2,3), (3,6);
 * rabbit starts (3,1), carrot at (2,6). Legend: 1 ↑, 2 ←, 3 ↓, 4 →.
 * Unique Hamiltonian path over the 15 open cells (solver-verified):
 * moves 1 1 4 3 3 4 4 4 1 2 1 4 4 3 → sum 39. */
export const MAZE_CELLS_G3: Array<[number, number]> = (() => {
  const out: Array<[number, number]> = []
  for (let r = 1; r <= 3; r++) for (let c = 1; c <= 6; c++) out.push([r, c])
  return out
})()
export const MAZE_STONES_G3: Array<[number, number]> = [[1, 3], [2, 3], [3, 6]]
export const MAZE_PATH_G3: Array<[number, number]> = [
  [3, 1], [2, 1], [1, 1], [1, 2], [2, 2], [3, 2], [3, 3], [3, 4], [3, 5], [2, 5], [2, 4], [1, 4], [1, 5], [1, 6], [2, 6],
]
export const MAZE_MOVES_G3 = [1, 1, 4, 3, 3, 4, 4, 4, 1, 2, 1, 4, 4, 3]
export function RabbitMaze21G3({ movesUpto }: { movesUpto?: number }) {
  const s = 52
  const upto = movesUpto ?? -1
  const stones = new Set(MAZE_STONES_G3.map(([r, c]) => `${r},${c}`))
  const visited = MAZE_PATH_G3.slice(0, Math.max(1, upto + 2))
  const head = visited[visited.length - 1]
  const px = (c: number) => 10 + (c - 1) * s + s / 2
  const py = (r: number) => 10 + (r - 1) * s + s / 2
  return (
    <svg viewBox="0 0 332 176" width="100%" style={{ maxWidth: 350, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {MAZE_CELLS_G3.map(([r, c]) => (
        <rect key={`${r}-${c}`} x={10 + (c - 1) * s} y={10 + (r - 1) * s} width={s} height={s} fill={stones.has(`${r},${c}`) ? '#E2E8F0' : '#F5E5C8'} stroke="#8B6534" strokeWidth={2} />
      ))}
      {MAZE_STONES_G3.map(([r, c]) => (
        <text key={`${r}-${c}`} x={px(c)} y={py(r)} textAnchor="middle" dominantBaseline="central" fontSize={22}>🪨</text>
      ))}
      {upto >= 0 && (
        <polyline points={visited.map(([r, c]) => `${px(c)},${py(r)}`).join(' ')} fill="none" stroke="#D7263D" strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" opacity={0.55} />
      )}
      <text x={px(6)} y={py(2)} textAnchor="middle" dominantBaseline="central" fontSize={20}>🥕</text>
      <text x={px(head[1])} y={py(head[0])} textAnchor="middle" dominantBaseline="central" fontSize={22}>🐇</text>
    </svg>
  )
}
export function RabbitMaze21G3Illustration() {
  return (
    <Frame aria="A three-by-six maze: the rabbit starts bottom left, stones block two cells of column three and the bottom-right corner, and the carrot waits at the middle of the right edge.">
      <RabbitMaze21G3 />
    </Frame>
  )
}
