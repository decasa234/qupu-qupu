// Stacked-cube "2025" figure for WMI-25F2A-Q17 (2025 Grade-2 Final).
// Reconstructed from db/seed/wmi/figures/2025-final-g2-a-q17.jpg: the year 2025
// spelled out of unit cubes, each digit one cube thick, drawn in isometric.
//
// Verified against the question (66 cubes in all, answer 60 with exactly 4 painted
// faces, so 6 end cubes show 3 sides instead of 2):
//   '2' = 16 cubes (2 free ends)   '0' = 18 cubes (0 free ends)
//   '2' = 16 cubes (2 free ends)   '5' = 16 cubes (2 free ends)
//   total 16 + 18 + 16 + 16 = 66, free ends 2 + 0 + 2 + 2 = 6  ->  66 - 6 = 60.
//
// The figure shows the SETUP only: the four cube-built digits. It does NOT mark
// which cubes count or expose the answer — that is the animator's job post-answer.

const INK = '#1F2937'

// Scan palette: pale-yellow cube bodies with a peach-tinted top face. Three shades
// give the isometric read (top lightest/peachy, left mid, right darkest).
const TOP = '#FBE0B6' // qupu-peach-ish top face
const LEFT = '#FCF1D6' // front/left face — pale cream
const RIGHT = '#F6E3B8' // right face — slightly deeper cream

/* ---------------------------------------------------------------- data ----- */
// Each digit is a 7-row x 4-col bitmap (row 0 = top), one cube thick. 1 = a cube.
// `ends` flags the free-tip cubes (exactly one orthogonal neighbour); those show a
// third side and are the six cubes EXCLUDED from the 60. The illustration does not
// use `ends` — it is co-exported for the explainer/animator to bind to.
export type DigitGrid = number[][]

export const DIGIT_TWO: DigitGrid = [
  [1, 1, 1, 1],
  [0, 0, 0, 1],
  [0, 0, 0, 1],
  [1, 1, 1, 1],
  [1, 0, 0, 0],
  [1, 0, 0, 0],
  [1, 1, 1, 1],
]
export const DIGIT_ZERO: DigitGrid = [
  [1, 1, 1, 1],
  [1, 0, 0, 1],
  [1, 0, 0, 1],
  [1, 0, 0, 1],
  [1, 0, 0, 1],
  [1, 0, 0, 1],
  [1, 1, 1, 1],
]
export const DIGIT_FIVE: DigitGrid = [
  [1, 1, 1, 1],
  [1, 0, 0, 0],
  [1, 0, 0, 0],
  [1, 1, 1, 1],
  [0, 0, 0, 1],
  [0, 0, 0, 1],
  [1, 1, 1, 1],
]

// The year, left to right.
export const YEAR_2025: DigitGrid[] = [DIGIT_TWO, DIGIT_ZERO, DIGIT_TWO, DIGIT_FIVE]

const cubeCount = (g: DigitGrid) => g.flat().reduce((a, b) => a + b, 0)

// Free-end cubes: exactly one orthogonal cube neighbour within the same digit.
export function endCubes(g: DigitGrid): Array<[number, number]> {
  const R = g.length
  const C = g[0].length
  const out: Array<[number, number]> = []
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (!g[r][c]) continue
      let n = 0
      if (r > 0 && g[r - 1][c]) n++
      if (r < R - 1 && g[r + 1][c]) n++
      if (c > 0 && g[r][c - 1]) n++
      if (c < C - 1 && g[r][c + 1]) n++
      if (n === 1) out.push([r, c])
    }
  }
  return out
}

export const TOTAL_CUBES = YEAR_2025.reduce((a, g) => a + cubeCount(g), 0) // 66
export const END_CUBES = YEAR_2025.reduce((a, g) => a + endCubes(g).length, 0) // 6
export const FOUR_FACE_CUBES = TOTAL_CUBES - END_CUBES // 60

/* ----------------------------------------------------------- primitive ----- */
// Isometric unit cube standing in a vertical plane (the digit's front face). The
// front face is an axis-aligned square at (fx, fy); the single cube of depth runs
// up-and-right to expose the top rhombus and the right face. `dep`/`rgt` toggle
// whether the top / right faces are drawn (hidden where a neighbour covers them).
const SIZE = 17
const CX = SIZE * 0.62 // horizontal run of the one-cube depth
const CY = SIZE * 0.42 // vertical run of the one-cube depth

export function IsoCube({
  fx,
  fy,
  size = SIZE,
  showTop = true,
  showRight = true,
}: {
  fx: number
  fy: number
  size?: number
  showTop?: boolean
  showRight?: boolean
}) {
  const cx = (size / SIZE) * CX
  const cy = (size / SIZE) * CY
  // front-face corners
  const tl = `${fx},${fy}`
  const tr = `${fx + size},${fy}`
  const br = `${fx + size},${fy + size}`
  const bl = `${fx},${fy + size}`
  // back corners (depth offset up-right)
  const tlB = `${fx + cx},${fy - cy}`
  const trB = `${fx + size + cx},${fy - cy}`
  const brB = `${fx + size + cx},${fy + size - cy}`
  return (
    <g>
      {showTop && <polygon points={`${tl} ${tr} ${trB} ${tlB}`} fill={TOP} stroke={INK} strokeWidth={1.1} />}
      {showRight && <polygon points={`${tr} ${br} ${brB} ${trB}`} fill={RIGHT} stroke={INK} strokeWidth={1.1} />}
      {/* front face drawn last so it reads on top of any underlying depth faces */}
      <polygon points={`${tl} ${tr} ${br} ${bl}`} fill={LEFT} stroke={INK} strokeWidth={1.1} />
    </g>
  )
}

/* ------------------------------------------------------------ component ----- */
// Render one digit as a flat extruded plate. Front faces tile the grid; a cube
// shows its top face only when no cube sits directly above it, and its right face
// only when no cube sits to its right. Painter's order = top rows first, so a
// lower cube's depth faces never poke through the cube above.
const GAP_COLS = 1.6 // empty columns between digits

function DigitCubes({ grid, originCol }: { grid: DigitGrid; originCol: number }) {
  const cells: Array<{ row: number; col: number; showTop: boolean; showRight: boolean }> = []
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (!grid[r][c]) continue
      const above = r > 0 && grid[r - 1][c] === 1
      const right = c < grid[r].length - 1 && grid[r][c + 1] === 1
      cells.push({ row: r, col: originCol + c, showTop: !above, showRight: !right })
    }
  }
  // Draw top rows first, then within a row right-to-left so each right face is
  // overdrawn by the front face of its left neighbour where they meet.
  cells.sort((a, b) => a.row - b.row || b.col - a.col)
  return (
    <g>
      {cells.map(({ row, col, showTop, showRight }, i) => (
        <IsoCube key={i} fx={col * SIZE} fy={row * SIZE} showTop={showTop} showRight={showRight} />
      ))}
    </g>
  )
}

export function Cube2025G2Figure() {
  // Lay out the four digits left to right by advancing the column origin.
  const DIGIT_COLS = 4
  let col = 0
  const layout = YEAR_2025.map((grid) => {
    const originCol = col
    col += DIGIT_COLS + GAP_COLS
    return { grid, originCol }
  })

  // Extents (front faces span cols x rows; depth adds CX right and CY up).
  const totalCols = col - GAP_COLS // last digit has no trailing gap
  const rows = YEAR_2025[0].length // 7
  const width = totalCols * SIZE + CX
  const height = rows * SIZE + CY
  const padX = 10
  const padY = 12
  const vbW = width + padX * 2
  const vbH = height + padY * 2

  return (
    <svg
      viewBox={`${-padX} ${-padY - CY} ${vbW} ${vbH}`}
      width="100%"
      style={{ maxWidth: 460, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {layout.map(({ grid, originCol }, i) => (
        <DigitCubes key={i} grid={grid} originCol={originCol} />
      ))}
    </svg>
  )
}

export default function Cube2025G2Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Angka tahun 2025 yang disusun dari kubus-kubus kecil, masing-masing angka setebal satu kubus, digambar secara isometrik. Seluruhnya memakai 66 kubus."
    >
      <Cube2025G2Figure />
    </div>
  )
}
