import { MazeGrid } from '../../PastPapers/WMI/primitives/MazeGrid'

// In-card figure for `visit-all-cells-path`. The stem states the rules; this
// picture carries the layout — which squares are stones, where the rabbit sits,
// which squares carry a mark. That split is how the WMI papers this concept is
// mined from present it.
//
// It must NEVER draw the route, not as a trail and not in the aria-label: the
// route is the whole puzzle. The row and column numbers around the edge are
// printed because the step-by-step names squares by "row 2, column 3" and a
// child has to be able to find them.
//
// Pure SVG, no hooks, no randomness: safe to render on the server and identical
// for the same params every time. Grid, stones and start marker are MazeGrid's;
// this file only decides what goes in each square.

/** Mirrors MARK_LETTERS / MARK_GLYPH in api/services/wmi/concepts/visit-all-cells-path. */
const MARK_LETTERS = ['A', 'B', 'C']
const MARK_GLYPH = '★'

const CELL = 48
const PAD = 28

const GREEN_SOFT = '#EAF6DC'
const AMBER_SOFT = '#FFF3D4'
const AMBER_INK = '#8A6100'
const MUTED = '#9AA2AE'
const RABBIT_FUR = '#FFFFFF'
const RABBIT_LINE = '#5C6470'
const RABBIT_EAR = '#FFD3B1'

interface Cell {
  r: number
  c: number
}

interface Params {
  rows: number
  cols: number
  blocked: Cell[]
  start: Cell
  marks: Cell[]
}

const FALLBACK: Params = {
  rows: 3,
  cols: 3,
  blocked: [
    { r: 0, c: 1 },
    { r: 1, c: 1 },
  ],
  start: { r: 0, c: 0 },
  marks: [{ r: 1, c: 2 }],
}

const int = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : fallback

const readCell = (v: unknown): Cell => ({ r: int((v as Cell)?.r, -1), c: int((v as Cell)?.c, -1) })

/**
 * Params arrive as `unknown` from the DB, so every field is re-derived and
 * clamped. Anything that does not add up falls back whole rather than in
 * pieces — a half-read board would draw a puzzle nobody set.
 */
function read(raw: unknown): Params {
  const p = (raw ?? {}) as Partial<Params>
  const rows = Math.max(3, Math.min(4, int(p.rows, 0)))
  const cols = Math.max(3, Math.min(4, int(p.cols, 0)))
  const inside = (cell: Cell) => cell.r >= 0 && cell.r < rows && cell.c >= 0 && cell.c < cols

  const start = readCell(p.start)
  if (!inside(start)) return FALLBACK

  const blocked = (Array.isArray(p.blocked) ? p.blocked : []).map(readCell).filter(inside)
  const stones = new Set(blocked.map((cell) => `${cell.r},${cell.c}`))
  if (stones.has(`${start.r},${start.c}`)) return FALLBACK
  if (rows * cols - stones.size < 2) return FALLBACK

  const marks = (Array.isArray(p.marks) ? p.marks : [])
    .map(readCell)
    .filter((cell) => inside(cell) && !stones.has(`${cell.r},${cell.c}`))
    .slice(0, MARK_LETTERS.length)

  return { rows, cols, blocked, start, marks }
}

/** MazeGrid's own cell geometry, mirrored so labels can sit on cell centres. */
const centreX = (col: number) => PAD + col * CELL + CELL / 2
const centreY = (row: number) => PAD + row * CELL + CELL / 2

const cellName = (cell: Cell): string => `baris ${cell.r + 1} kolom ${cell.c + 1}`

function listId(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} dan ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, dan ${items[items.length - 1]}`
}

/** A small rabbit, drawn around (0,0) so MazeGrid can translate it into place. */
function Rabbit() {
  return (
    <g>
      <ellipse cx={-5} cy={-11} rx={3.4} ry={8} fill={RABBIT_FUR} stroke={RABBIT_LINE} strokeWidth={1.6} />
      <ellipse cx={5} cy={-11} rx={3.4} ry={8} fill={RABBIT_FUR} stroke={RABBIT_LINE} strokeWidth={1.6} />
      <ellipse cx={-5} cy={-11} rx={1.4} ry={5} fill={RABBIT_EAR} />
      <ellipse cx={5} cy={-11} rx={1.4} ry={5} fill={RABBIT_EAR} />
      <circle cx={0} cy={3} r={10} fill={RABBIT_FUR} stroke={RABBIT_LINE} strokeWidth={1.8} />
      <circle cx={-3.6} cy={1} r={1.5} fill={RABBIT_LINE} />
      <circle cx={3.6} cy={1} r={1.5} fill={RABBIT_LINE} />
      <path d="M -2.6 6 Q 0 8.4 2.6 6" fill="none" stroke={RABBIT_LINE} strokeWidth={1.5} strokeLinecap="round" />
    </g>
  )
}

export default function VisitAllCellsPathIllustration({ params }: { params: unknown }) {
  const p = read(params)
  const markAt = new Map(
    p.marks.map((cell, i) => [
      `${cell.r},${cell.c}`,
      p.marks.length === 1 ? MARK_GLYPH : (MARK_LETTERS[i] as string),
    ]),
  )

  const width = p.cols * CELL + PAD * 2
  const height = p.rows * CELL + PAD * 2

  // The label speaks only what the picture prints. It names the stones, the
  // rabbit's square and the marks — never a single step of the route.
  const stoneSpeech =
    p.blocked.length === 0
      ? 'tidak ada batu'
      : `batu di ${listId(p.blocked.map(cellName))}`
  const markSpeech =
    p.marks.length === 0
      ? ''
      : p.marks.length === 1
        ? ` Petak bertanda ${MARK_GLYPH} di ${cellName(p.marks[0])}.`
        : ` Petak bertanda ${listId(p.marks.map((cell, i) => `${MARK_LETTERS[i]} di ${cellName(cell)}`))}.`
  const ariaLabel = `Papan ${p.rows} kali ${p.cols}, ${stoneSpeech}. Kelinci mulai di ${cellName(p.start)}.${markSpeech}`

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ariaLabel}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ maxWidth: width * 1.4 }}>
        <MazeGrid
          rows={p.rows}
          cols={p.cols}
          cellSize={CELL}
          padding={PAD}
          blocked={p.blocked.map((cell) => [cell.c, cell.r] as [number, number])}
          cellFill={(col, row) => {
            if (row === p.start.r && col === p.start.c) return GREEN_SOFT
            return markAt.has(`${row},${col}`) ? AMBER_SOFT : undefined
          }}
          start={{ cell: [p.start.c, p.start.r], glyph: <Rabbit /> }}
        />

        {/* Column numbers along the top, row numbers down the left — the names
            the step-by-step uses to point at a square. */}
        {Array.from({ length: p.cols }, (_, c) => (
          <text
            key={`col-${c}`}
            x={centreX(c)}
            y={PAD - 8}
            textAnchor="middle"
            fontSize={13}
            fontWeight={700}
            fill={MUTED}
          >
            {c + 1}
          </text>
        ))}
        {Array.from({ length: p.rows }, (_, r) => (
          <text
            key={`row-${r}`}
            x={PAD - 9}
            y={centreY(r) + 4}
            textAnchor="middle"
            fontSize={13}
            fontWeight={700}
            fill={MUTED}
          >
            {r + 1}
          </text>
        ))}

        {/* Marks last, so they sit above the grid lines. */}
        {p.marks.map((cell, i) => (
          <text
            key={`mark-${i}`}
            x={centreX(cell.c)}
            y={centreY(cell.r) + 7}
            textAnchor="middle"
            fontSize={21}
            fontWeight={800}
            fill={AMBER_INK}
          >
            {markAt.get(`${cell.r},${cell.c}`)}
          </text>
        ))}
      </svg>
    </div>
  )
}
