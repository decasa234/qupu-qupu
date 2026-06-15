/**
 * WMI-22P1A-Q15 (2022 Grade 1 Semifinal) — "Which figure comes next?"
 *
 * Reconstructed from db/seed/wmi/figures/2022-semifinal-g1-a-q15.jpg:
 * a row of four bordered panels. Each of the first three panels is a 3×3 grid
 * of orange shapes — every cell is a circle (○) EXCEPT for two triangles (▲).
 * The fourth panel is a "?" (the one to find); a "…" trails to the right.
 *
 * Reading the triangle cells (row, col), 1-indexed top-left:
 *   panel 1: (1,2) and (2,2)
 *   panel 2: (1,1) and (2,2)
 *   panel 3: (2,1) and (2,2)
 *
 * Pattern: ONE triangle is anchored at the centre cell (2,2) in every panel.
 * The OTHER triangle orbits the centre, one step counter-clockwise each panel:
 *   (1,2) top  →  (1,1) top-left  →  (2,1) left  →  (3,1) bottom-left …
 * So the missing panel (4th) has triangles at the centre (2,2) and bottom-left
 * (3,1). That matches option B (the seed's answer).
 *
 * The static figure NEVER draws the answer panel's shapes — the 4th panel shows
 * only a "?". Pure render: no state, no Math.random / Date. SSR-safe.
 */

// ─── colour tokens (hex echoes of the scan) ─────────────────────────────────
const ORANGE = '#F08A24' // the shapes
const BORDER = '#E2872A' // panel frames
const QMARK = '#2B2118' // the "?" and the "…"

// ─── one 3×3 panel ──────────────────────────────────────────────────────────
// A cell is either a circle ('o') or a triangle ('t').
export type Cell = 'o' | 't'
export type Panel3x3 = Cell[][] // 3 rows × 3 cols

/** The centre cell (2,2) and the orbiting cell that defines each panel. */
const CENTRE: [number, number] = [1, 1] // 0-indexed (row 2, col 2)

/** Build a 3×3 panel of circles with triangles at the given 0-indexed cells. */
export function makePanel(triangleCells: Array<[number, number]>): Panel3x3 {
  const grid: Panel3x3 = [
    ['o', 'o', 'o'],
    ['o', 'o', 'o'],
    ['o', 'o', 'o'],
  ]
  for (const [r, c] of triangleCells) grid[r][c] = 't'
  return grid
}

// The three GIVEN panels (faithful to the scan), 0-indexed triangle cells.
export const PANEL_1 = makePanel([[0, 1], CENTRE]) // top + centre
export const PANEL_2 = makePanel([[0, 0], CENTRE]) // top-left + centre
export const PANEL_3 = makePanel([[1, 0], CENTRE]) // left + centre

// The ANSWER panel (option B): bottom-left + centre. Only used by the explainer.
export const PANEL_ANSWER = makePanel([[2, 0], CENTRE]) // bottom-left + centre

export const GIVEN_PANELS: Panel3x3[] = [PANEL_1, PANEL_2, PANEL_3]

// ─── geometry ───────────────────────────────────────────────────────────────
const PANEL = 96 // panel side length
const GAP = 12 // gap between panels
const PAD = 10 // inner padding inside a panel
const CELL = (PANEL - 2 * PAD) / 3 // cell pitch
const SH = 13 // shape "radius"

export const Q15_VIEW_W = 4 * PANEL + 3 * GAP + 56 // +room for the trailing "…"
export const Q15_VIEW_H = PANEL + 20

function shapeCentre(col: number, row: number, ox: number): [number, number] {
  const x = ox + PAD + CELL * col + CELL / 2
  const y = 10 + PAD + CELL * row + CELL / 2
  return [x, y]
}

/** One orange shape — a circle or an upward triangle — centred in its cell. */
function Shape({ kind, cx, cy }: { kind: Cell; cx: number; cy: number }) {
  if (kind === 'o') return <circle cx={cx} cy={cy} r={SH} fill={ORANGE} />
  const pts = `${cx},${cy - SH} ${cx - SH},${cy + SH * 0.85} ${cx + SH},${cy + SH * 0.85}`
  return <polygon points={pts} fill={ORANGE} />
}

/** One bordered 3×3 panel at left-offset `ox`. */
export function GridPanel({ panel, ox }: { panel: Panel3x3; ox: number }) {
  return (
    <g>
      <rect x={ox} y={10} width={PANEL} height={PANEL} rx={3} fill="#FFFFFF" stroke={BORDER} strokeWidth={3} />
      {panel.map((rowCells, r) =>
        rowCells.map((kind, c) => {
          const [cx, cy] = shapeCentre(c, r, ox)
          return <Shape key={`${r}-${c}`} kind={kind} cx={cx} cy={cy} />
        }),
      )}
    </g>
  )
}

/** The "?" panel placeholder (4th panel). */
function QuestionPanel({ ox }: { ox: number }) {
  return (
    <g>
      <rect x={ox} y={10} width={PANEL} height={PANEL} rx={3} fill="#FFFFFF" stroke={BORDER} strokeWidth={3} />
      <text
        x={ox + PANEL / 2}
        y={10 + PANEL / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={42}
        fontWeight={900}
        fill={QMARK}
      >
        ?
      </text>
    </g>
  )
}

/**
 * The full problem strip: three given panels, a "?" panel, and a trailing "…".
 * When `answerPanel` is supplied (explainer only) the 4th panel shows that panel
 * instead of the "?".
 */
export function Q15Strip({ answerPanel }: { answerPanel?: Panel3x3 }) {
  const ox = (i: number) => i * (PANEL + GAP)
  return (
    <svg
      viewBox={`0 0 ${Q15_VIEW_W} ${Q15_VIEW_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 560 }}
      aria-hidden="true"
    >
      {GIVEN_PANELS.map((p, i) => (
        <GridPanel key={i} panel={p} ox={ox(i)} />
      ))}
      {answerPanel ? <GridPanel panel={answerPanel} ox={ox(3)} /> : <QuestionPanel ox={ox(3)} />}
      <text x={ox(4) + 6} y={10 + PANEL / 2} textAnchor="start" dominantBaseline="central" fontSize={30} fontWeight={900} fill={QMARK}>
        …
      </text>
    </svg>
  )
}

export default function P22G1Q15Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Tiga panel kisi 3×3 berisi lingkaran dan dua segitiga oranye, lalu panel keempat bertanda tanya. Gambar manakah yang berikutnya?"
    >
      <Q15Strip />
    </div>
  )
}
