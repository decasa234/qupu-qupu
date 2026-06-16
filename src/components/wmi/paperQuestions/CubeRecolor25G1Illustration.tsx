// Cube-recolour figure for WMI-25F1A-Q16 (2025 Grade 1 Final).
//
// "To change the design on the left (2025) into the design on the right
//  (0726), how many cubes must change their color?"  Answer: 9 (fill-in).
//
// Each board is a billboard holding FOUR digits; every digit is a 3-wide ×
// 5-tall grid of cubes that are either FILLED (orange) or EMPTY (cream). The
// left board spells 2025, the right board spells 0726. The learner overlays
// the two boards cell-by-cell and counts the cubes whose state differs.
//
// Grids recovered pixel-by-pixel from db/seed/wmi/figures/2025-final-g1-a-q16.jpg:
//
//   LEFT  "2025"           RIGHT "0726"
//    2: ### . . # ### # . . ###   (per digit, rows top→bottom, # = filled)
//   pos0  2 -> 0   diffs 3 : (1,0) (2,1) (3,2)
//   pos1  0 -> 7   diffs 5 : (1,0) (2,0) (3,0) (4,0) (4,1)
//   pos2  2 -> 2   diffs 0 : (identical)
//   pos3  5 -> 6   diffs 1 : (3,0)
//   TOTAL changed cubes = 9  ✓ (matches the answer key)
//
// The static question figure draws ONLY the two boards + the arrow between
// them — it NEVER highlights which 9 cubes differ. Revealing the changed
// cubes is the animator's job, post-answer, via the co-exported
// CubeRecolor25G1 primitive with markChanges = true.
//
// Pure render, SSR-safe, deterministic — no random / dates / state.
// House-style reference: BlockStack24G1Illustration (the 2024 G1 sibling).

// qupu palette mirrored as raw hex for the hand-drawn SVG (tokens preferred in
// class-styled figures; this figure is fully hand-drawn so raw hex is allowed).
const INK = '#374151' // qupu ink — cube outlines + board frame
const ORANGE = '#F2A007' // qupu-brand-orange family — a FILLED cube
const ORANGE_DK = '#D98A00' // shaded edge for a filled cube
const CREAM = '#FBF6EC' // qupu-cream — an EMPTY cube (and the board face)
const GREY = '#D9DCE1' // stand legs
const GREY_DK = '#9AA0A8' // stand base shadow
const HILITE = '#2C9CDB' // qupu-brand-blue — change marker (animator only)

// --- the two designs --------------------------------------------------------
// Each digit is a 5-row × 3-col grid; true = filled (orange), false = empty.
type Cell = boolean
type Digit = Cell[][] // [row][col]

const F = true
const E = false

// LEFT board: 2 0 2 5
const LEFT: Digit[] = [
  // 2
  [[F, F, F], [E, E, F], [F, F, F], [F, E, E], [F, F, F]],
  // 0
  [[F, F, F], [F, E, F], [F, E, F], [F, E, F], [F, F, F]],
  // 2
  [[F, F, F], [E, E, F], [F, F, F], [F, E, E], [F, F, F]],
  // 5
  [[F, F, F], [F, E, E], [F, F, F], [E, E, F], [F, F, F]],
]

// RIGHT board: 0 7 2 6
const RIGHT: Digit[] = [
  // 0
  [[F, F, F], [F, E, F], [F, E, F], [F, E, F], [F, F, F]],
  // 7
  [[F, F, F], [E, E, F], [E, E, F], [E, E, F], [E, E, F]],
  // 2
  [[F, F, F], [E, E, F], [F, F, F], [F, E, E], [F, F, F]],
  // 6
  [[F, F, F], [F, E, E], [F, F, F], [F, E, F], [F, F, F]],
]

const ROWS = 5
const COLS = 3

// --- layout -----------------------------------------------------------------
const CUBE = 12 // one cube side
const CUBE_GAP = 2 // gutter between cubes within a digit
const DIGIT_W = COLS * CUBE + (COLS - 1) * CUBE_GAP // 40
const DIGIT_H = ROWS * CUBE + (ROWS - 1) * CUBE_GAP // 68
const DIGIT_GAP = 12 // space between digits on a board
const BOARD_PAD = 12 // inner padding inside the billboard frame

const GRIDS_W = 4 * DIGIT_W + 3 * DIGIT_GAP // 196
const BOARD_W = GRIDS_W + 2 * BOARD_PAD // 220
const BOARD_H = DIGIT_H + 2 * BOARD_PAD // 92

const LEG_H = 22 // stand legs below the board

const ARROW_W = 40 // gap reserved for the arrow between the two boards
const SIDE_PAD = 8 // outer headroom so strokes never clip

const VIEW_W = SIDE_PAD + BOARD_W + ARROW_W + BOARD_W + SIDE_PAD
const VIEW_H = 8 + BOARD_H + LEG_H + 8

// --- a single cube ----------------------------------------------------------
function Cube({
  x,
  y,
  filled,
  changed,
}: {
  x: number
  y: number
  filled: boolean
  changed: boolean
}) {
  const face = filled ? ORANGE : CREAM
  const edge = filled ? ORANGE_DK : INK
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={CUBE}
        height={CUBE}
        rx={1.5}
        fill={face}
        stroke={edge}
        strokeWidth={1.4}
      />
      {changed && (
        // change marker (animator only): a blue ring + dot, never drawn in the
        // pristine question figure.
        <>
          <rect
            x={x - 1}
            y={y - 1}
            width={CUBE + 2}
            height={CUBE + 2}
            rx={2}
            fill="none"
            stroke={HILITE}
            strokeWidth={2.2}
          />
          <circle cx={x + CUBE / 2} cy={y + CUBE / 2} r={2.2} fill={HILITE} />
        </>
      )}
    </g>
  )
}

// --- one digit grid ---------------------------------------------------------
function DigitGrid({
  x,
  y,
  digit,
  changes,
}: {
  x: number
  y: number
  digit: Digit
  changes: boolean[][] | null
}) {
  const cubes = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cx = x + c * (CUBE + CUBE_GAP)
      const cy = y + r * (CUBE + CUBE_GAP)
      cubes.push(
        <Cube
          key={`${r}-${c}`}
          x={cx}
          y={cy}
          filled={digit[r][c]}
          changed={changes ? changes[r][c] : false}
        />,
      )
    }
  }
  return <g>{cubes}</g>
}

// --- one billboard (frame + stand + four digit grids) -----------------------
function Board({
  x,
  digits,
  changeMap,
}: {
  x: number
  digits: Digit[]
  // changeMap[digitIndex][row][col] — true where this board's cube differs
  changeMap: boolean[][][] | null
}) {
  const top = 8
  const gridsX = x + BOARD_PAD
  const gridsY = top + BOARD_PAD

  return (
    <g>
      {/* billboard frame */}
      <rect
        x={x}
        y={top}
        width={BOARD_W}
        height={BOARD_H}
        rx={6}
        fill="#FFFFFF"
        stroke={INK}
        strokeWidth={2.5}
      />

      {/* two stand legs + bases */}
      {[x + BOARD_W * 0.3, x + BOARD_W * 0.7].map((legX, i) => (
        <g key={i}>
          <rect x={legX - 5} y={top + BOARD_H} width={10} height={LEG_H - 7} fill={GREY} stroke={INK} strokeWidth={1.4} />
          <path
            d={`M ${legX - 11} ${top + BOARD_H + LEG_H} L ${legX - 7} ${top + BOARD_H + LEG_H - 7} L ${legX + 7} ${top + BOARD_H + LEG_H - 7} L ${legX + 11} ${top + BOARD_H + LEG_H} Z`}
            fill={GREY_DK}
            stroke={INK}
            strokeWidth={1.4}
          />
        </g>
      ))}

      {/* four digit grids */}
      {digits.map((digit, i) => (
        <DigitGrid
          key={i}
          x={gridsX + i * (DIGIT_W + DIGIT_GAP)}
          y={gridsY}
          digit={digit}
          changes={changeMap ? changeMap[i] : null}
        />
      ))}
    </g>
  )
}

// --- which cubes differ between LEFT and RIGHT ------------------------------
// Computed once, shared by both boards when markChanges is on.
function buildChangeMap(): boolean[][][] {
  return LEFT.map((digit, d) =>
    digit.map((row, r) => row.map((cell, c) => cell !== RIGHT[d][r][c])),
  )
}

export interface CubeRecolor25G1Props {
  /**
   * When true, the animator highlights every cube whose colour differs between
   * the two boards (the 9 cubes that must change). Default false = the pristine
   * question figure: just the two designs + arrow, nothing revealed.
   */
  markChanges?: boolean
}

/**
 * Primitive board. At markChanges = false it draws the two billboards (2025 →
 * 0726) with an arrow between them — the question setup, with NOTHING about the
 * answer revealed. When the animator passes markChanges = true the 9 differing
 * cubes are ringed in blue on BOTH boards so the count can be shown post-answer.
 */
export function CubeRecolor25G1({ markChanges = false }: CubeRecolor25G1Props) {
  const changeMap = markChanges ? buildChangeMap() : null

  const leftX = SIDE_PAD
  const rightX = SIDE_PAD + BOARD_W + ARROW_W
  const arrowCx = SIDE_PAD + BOARD_W + ARROW_W / 2
  const arrowCy = 8 + BOARD_H / 2

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={Math.min(360, VIEW_W)}>
      {/* left billboard: 2025 */}
      <Board x={leftX} digits={LEFT} changeMap={changeMap} />

      {/* arrow pointing left → right */}
      <g>
        <rect x={arrowCx - 14} y={arrowCy - 6} width={18} height={12} fill={INK} />
        <path
          d={`M ${arrowCx + 2} ${arrowCy - 13} L ${arrowCx + 16} ${arrowCy} L ${arrowCx + 2} ${arrowCy + 13} Z`}
          fill={INK}
        />
      </g>

      {/* right billboard: 0726 */}
      <Board x={rightX} digits={RIGHT} changeMap={changeMap} />
    </svg>
  )
}

/**
 * Default export = the pristine question figure (markChanges off). It draws the
 * two designs (2025 → 0726) and the arrow, and reveals nothing about which
 * cubes change — that is the animator's job, post-answer.
 */
export default function CubeRecolor25G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Dua papan kubus berwarna: papan kiri membentuk angka 2025 dan papan kanan membentuk angka 0726, dengan tanda panah dari kiri ke kanan. Setiap kubus berwarna jingga (terisi) atau krem (kosong). Hitung berapa kubus yang harus berganti warna untuk mengubah desain kiri menjadi desain kanan."
    >
      <CubeRecolor25G1 />
    </div>
  )
}
