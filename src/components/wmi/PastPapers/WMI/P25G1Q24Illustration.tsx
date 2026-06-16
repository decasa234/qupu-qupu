// WMI-25P1A-Q24 (2025 Grade 1 Semifinal, Paper A) — "change of pattern" sequence.
//
// "Observe the change of pattern in the picture. Which option should '?' be?"
// Answer: D.
//
// Source figure (db/seed/wmi/figures/2025-semifinal-g1-a-q24.jpg) shows a square
// grid with a shaded L of cells. The option texts in the seed are placeholders
// ("Pattern A".."Pattern E") because the originals were images. We reconstruct
// the canonical WMI form: a shaded L-tromino inside a 3x3 grid that turns a
// QUARTER-TURN CLOCKWISE each step. Three frames are shown, then a "?".
//
// THE RULE (header so the step-explainer / animator agree):
//   The shaded shape is always the same L of 3 cells; it never grows or shrinks.
//   Each frame is the previous one rotated 90 degrees clockwise. Mapping a cell
//   (row, col) in a 3x3 grid: (r, c) -> (c, 2 - r).
//   Shown frames:  TL corner -> TR corner -> BR corner.
//   The "?" is the next quarter-turn: the BL corner. Among the five options only
//   option D is that bottom-left L, so the answer is D.
//
// The static figure draws the THREE shown frames + an empty "?" slot, and the
// five option grids. It NEVER fills the "?" with the answer and NEVER marks an
// option — that is the animator's job (revealNext / highlightOption props).
//
// Pure render: no Math.random, no Date, no window/document at module top.
// SSR-safe & deterministic.

export const GRID_N = 3

type Cell = readonly [number, number] // [row, col], 0 = top / left

/** Rotate a cell 90 degrees clockwise inside an N x N grid. */
function rotCW([r, c]: Cell): Cell {
  return [c, GRID_N - 1 - r]
}

const BASE_L: Cell[] = [
  [0, 0],
  [0, 1],
  [1, 0],
] // top-left corner L

/** The three SHOWN frames (TL -> TR -> BR corner). */
export const SHADED_FRAMES: Cell[][] = (() => {
  const frames: Cell[][] = [BASE_L]
  for (let i = 0; i < 2; i++) frames.push(frames[frames.length - 1].map(rotCW))
  return frames
})()

/** The correct next frame (BL corner) — what the "?" should be. */
export const NEXT_FRAME: Cell[] = SHADED_FRAMES[SHADED_FRAMES.length - 1].map(rotCW)

// The five option shapes. A,B,C are the three shown orientations (so they read
// as plausible), D is the correct next quarter-turn (bottom-left L), and E is a
// straight bar — visibly not an L, the obvious wrong shape.
export const OPTION_SHAPES: Record<string, Cell[]> = {
  A: [
    [0, 0],
    [0, 1],
    [1, 0],
  ],
  B: [
    [0, 1],
    [0, 2],
    [1, 2],
  ],
  C: [
    [1, 2],
    [2, 1],
    [2, 2],
  ],
  D: [
    [1, 0],
    [2, 0],
    [2, 1],
  ],
  E: [
    [1, 0],
    [1, 1],
    [1, 2],
  ],
}

export const Q24_ANSWER = 'D'

const INK = '#2B2622'
const GRID_LINE = '#3B342E'
const SHADE = '#F4B6BE' // pink wash matching the source figure
const SHADE_HOT = '#EE7B88' // brighter pink for the focused / revealed frame
const ORANGE = '#f0853a' // qupu-brand-orange — focus ring + correct option
const GREEN = '#10B981'

const CELL = 22 // px per grid cell
const PAD = 6 // inner padding inside each framed grid
const BOX = GRID_N * CELL + PAD * 2 // outer box size of one grid

function cellKey([r, c]: Cell): string {
  return `${r},${c}`
}

export interface MiniGridProps {
  shaded: Cell[]
  /** Brighter shade + a coloured frame (focus / reveal). */
  hot?: boolean
  /** Frame colour when not hot. */
  frame?: string
  /** Override shade colour. */
  shadeColor?: string
}

/** One framed 3x3 grid with the given cells shaded. Drawn from (0,0). */
export function MiniGrid({ shaded, hot = false, frame = GRID_LINE, shadeColor }: MiniGridProps) {
  const lit = new Set(shaded.map(cellKey))
  const fill = shadeColor ?? (hot ? SHADE_HOT : SHADE)
  return (
    <g>
      {/* outer frame */}
      <rect
        x={1}
        y={1}
        width={BOX - 2}
        height={BOX - 2}
        rx={3}
        fill="#FFFFFF"
        stroke={hot ? ORANGE : frame}
        strokeWidth={hot ? 3 : 2}
      />
      {/* cells */}
      {Array.from({ length: GRID_N }, (_, r) =>
        Array.from({ length: GRID_N }, (_, c) => {
          const x = PAD + c * CELL
          const y = PAD + r * CELL
          const on = lit.has(`${r},${c}`)
          return (
            <rect
              key={`${r}-${c}`}
              x={x}
              y={y}
              width={CELL}
              height={CELL}
              fill={on ? fill : '#FFFFFF'}
              stroke={GRID_LINE}
              strokeWidth={1.3}
            />
          )
        }),
      )}
    </g>
  )
}

export interface P25G1Q24DiagramProps {
  /** Index (0..2) of the shown frame to focus, or null. */
  focus?: number | null
  /** Fill the "?" slot with the predicted next frame. */
  revealNext?: boolean
}

const GAP = 18 // gap between sequence frames
const ARROW = 16 // arrow zone width between frames

/** The top sequence: three shown frames, arrows, then the "?" slot. */
export function P25G1Q24Sequence({ focus = null, revealNext = false }: P25G1Q24DiagramProps = {}) {
  const slots = SHADED_FRAMES.length + 1 // 3 shown + the "?"
  const stepW = BOX + ARROW + GAP
  const W = slots * BOX + (slots - 1) * (ARROW + GAP)
  const H = BOX + 10

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {SHADED_FRAMES.map((frame, i) => (
        <g key={i} transform={`translate(${i * stepW} 4)`}>
          <MiniGrid shaded={frame} hot={focus === i} />
        </g>
      ))}

      {/* the "?" slot at the end */}
      <g transform={`translate(${SHADED_FRAMES.length * stepW} 4)`}>
        {revealNext ? (
          <MiniGrid shaded={NEXT_FRAME} hot shadeColor={SHADE_HOT} />
        ) : (
          <>
            <rect x={1} y={1} width={BOX - 2} height={BOX - 2} rx={3} fill="#FFF4EA" stroke={ORANGE} strokeWidth={2.4} />
            <text
              x={BOX / 2}
              y={BOX / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={30}
              fontWeight={900}
              fill={ORANGE}
              className="font-display"
            >
              ?
            </text>
          </>
        )}
      </g>

      {/* arrows between slots */}
      {Array.from({ length: slots - 1 }, (_, i) => {
        const ax = i * stepW + BOX + GAP / 2
        const ay = 4 + BOX / 2
        return (
          <path
            key={`arr-${i}`}
            d={`M ${ax} ${ay} h ${ARROW} m -5 -5 l 5 5 l -5 5`}
            fill="none"
            stroke={INK}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )
      })}
    </svg>
  )
}

export interface P25G1Q24OptionsProps {
  /** Light up the correct option (the answer letter). */
  highlightCorrect?: boolean
}

/** The five labelled option grids in a row. */
export function P25G1Q24Options({ highlightCorrect = false }: P25G1Q24OptionsProps = {}) {
  const labels = ['A', 'B', 'C', 'D', 'E']
  const LBL = 18
  const stepW = BOX + 14
  const W = labels.length * BOX + (labels.length - 1) * 14
  const H = BOX + LBL + 6

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {labels.map((lbl, i) => {
        const correct = highlightCorrect && lbl === Q24_ANSWER
        return (
          <g key={lbl} transform={`translate(${i * stepW} 0)`}>
            <text
              x={BOX / 2}
              y={LBL - 6}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fontWeight={900}
              fill={correct ? GREEN : INK}
              className="font-display"
            >
              {lbl}
            </text>
            <g transform={`translate(0 ${LBL})`}>
              <MiniGrid
                shaded={OPTION_SHAPES[lbl]}
                hot={correct}
                frame={GRID_LINE}
                shadeColor={correct ? '#86E3B6' : SHADE}
              />
              {correct && (
                <rect x={1} y={1} width={BOX - 2} height={BOX - 2} rx={3} fill="none" stroke={GREEN} strokeWidth={3} />
              )}
            </g>
          </g>
        )
      })}
    </svg>
  )
}

export default function P25G1Q24Illustration() {
  return (
    <div
      className="my-4 flex flex-col gap-3 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Barisan pola: tiga kotak 3x3 dengan bentuk L yang diarsir berputar seperempat putaran searah jarum jam tiap langkah, lalu sebuah kotak tanda tanya. Di bawahnya lima pilihan A sampai E. Pilih kotak yang seharusnya menggantikan tanda tanya."
    >
      <P25G1Q24Sequence />
      <P25G1Q24Options />
    </div>
  )
}
