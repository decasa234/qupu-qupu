// Symbol-lookup grid for WMI-19P1A-Q20.
//
// Source figure: db/seed/wmi/figures/2019-semifinal-g1-a-q20.jpg —
// a 5×5 frame: the top row and left column are HEADER symbols, the inner 4×4
// holds the looked-up symbols. A symbol is named by its (row-header,
// column-header) pair. The static figure shows the grid + headers ONLY — it
// never marks which cell is the asked one.
//
// Symbols are redrawn as clean line glyphs (basic shapes), NOT the source jpg.

const INK = '#1F2937'

// --- glyph library: each draws a symbol centred at (cx, cy) at ~size s -------

function Glyph({ name, cx, cy, s = 18 }: { name: string; cx: number; cy: number; s?: number }) {
  const stroke = { stroke: INK, strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (name) {
    case 'phone':
      return (
        <g {...stroke}>
          <path d={`M ${cx - s * 0.7} ${cy + s * 0.5} q ${s * 0.7} ${-s * 1.4} ${s * 1.4} 0`} />
          <line x1={cx - s * 0.7} y1={cy + s * 0.5} x2={cx - s * 0.45} y2={cy + s * 0.5} />
          <line x1={cx + s * 0.7} y1={cy + s * 0.5} x2={cx + s * 0.45} y2={cy + s * 0.5} />
          <rect x={cx - s * 0.35} y={cy - s * 0.1} width={s * 0.7} height={s * 0.55} rx={2} />
        </g>
      )
    case 'scissors':
      return (
        <g {...stroke}>
          <circle cx={cx - s * 0.4} cy={cy + s * 0.4} r={s * 0.22} />
          <circle cx={cx + s * 0.4} cy={cy + s * 0.4} r={s * 0.22} />
          <line x1={cx - s * 0.25} y1={cy + s * 0.25} x2={cx + s * 0.6} y2={cy - s * 0.55} />
          <line x1={cx + s * 0.25} y1={cy + s * 0.25} x2={cx - s * 0.6} y2={cy - s * 0.55} />
        </g>
      )
    case 'flower':
      return (
        <g {...stroke}>
          {[0, 90, 180, 270].map((a) => (
            <ellipse key={a} cx={cx} cy={cy} rx={s * 0.55} ry={s * 0.22} transform={`rotate(${a + 45} ${cx} ${cy})`} />
          ))}
        </g>
      )
    case 'bell':
      return (
        <g {...stroke}>
          <path d={`M ${cx - s * 0.5} ${cy + s * 0.35} q 0 ${-s} ${s * 0.5} ${-s} q ${s * 0.5} 0 ${s * 0.5} ${s} Z`} />
          <line x1={cx - s * 0.6} y1={cy + s * 0.35} x2={cx + s * 0.6} y2={cy + s * 0.35} />
          <circle cx={cx} cy={cy + s * 0.55} r={s * 0.12} fill={INK} />
        </g>
      )
    case 'snowburst':
      return (
        <g {...stroke}>
          {[0, 45, 90, 135].map((a) => (
            <line key={a} x1={cx - s * 0.6} y1={cy} x2={cx + s * 0.6} y2={cy} transform={`rotate(${a} ${cx} ${cy})`} />
          ))}
          {[0, 45, 90, 135].map((a) => (
            <line key={`t${a}`} x1={cx + s * 0.45} y1={cy - s * 0.15} x2={cx + s * 0.6} y2={cy} transform={`rotate(${a} ${cx} ${cy})`} />
          ))}
        </g>
      )
    case 'asterisk':
      return (
        <g {...stroke}>
          {[0, 60, 120].map((a) => (
            <line key={a} x1={cx - s * 0.6} y1={cy} x2={cx + s * 0.6} y2={cy} transform={`rotate(${a} ${cx} ${cy})`} />
          ))}
        </g>
      )
    case 'hourglass':
      return (
        <g {...stroke}>
          <path d={`M ${cx - s * 0.45} ${cy - s * 0.6} h ${s * 0.9} L ${cx - s * 0.45} ${cy + s * 0.6} h ${s * 0.9} Z`} />
          <line x1={cx - s * 0.55} y1={cy - s * 0.6} x2={cx + s * 0.55} y2={cy - s * 0.6} />
          <line x1={cx - s * 0.55} y1={cy + s * 0.6} x2={cx + s * 0.55} y2={cy + s * 0.6} />
        </g>
      )
    case 'laptop':
      return (
        <g {...stroke}>
          <rect x={cx - s * 0.45} y={cy - s * 0.5} width={s * 0.9} height={s * 0.6} rx={2} />
          <path d={`M ${cx - s * 0.65} ${cy + s * 0.4} h ${s * 1.3} l ${-s * 0.12} ${-s * 0.15} h ${-s * 1.06} Z`} />
        </g>
      )
    case 'check':
      return <path d={`M ${cx - s * 0.5} ${cy} l ${s * 0.3} ${s * 0.4} l ${s * 0.6} ${-s * 0.8}`} {...stroke} />
    case 'noentry':
      return (
        <g {...stroke}>
          <circle cx={cx} cy={cy} r={s * 0.55} />
          <line x1={cx - s * 0.4} y1={cy - s * 0.4} x2={cx + s * 0.4} y2={cy + s * 0.4} />
        </g>
      )
    case 'sun':
      return (
        <g {...stroke}>
          <circle cx={cx} cy={cy} r={s * 0.5} />
          <circle cx={cx} cy={cy} r={s * 0.12} fill={INK} />
        </g>
      )
    case 'moonstar':
      return (
        <g {...stroke}>
          <path d={`M ${cx + s * 0.4} ${cy - s * 0.45} a ${s * 0.55} ${s * 0.55} 0 1 0 0 ${s * 0.9} a ${s * 0.42} ${s * 0.42} 0 1 1 0 ${-s * 0.9} Z`} />
          <circle cx={cx + s * 0.25} cy={cy} r={s * 0.1} fill={INK} />
        </g>
      )
    case 'diamond':
      return (
        <g {...stroke}>
          <path d={`M ${cx} ${cy - s * 0.6} L ${cx + s * 0.55} ${cy} L ${cx} ${cy + s * 0.6} L ${cx - s * 0.55} ${cy} Z`} />
          <path d={`M ${cx} ${cy - s * 0.3} L ${cx + s * 0.28} ${cy} L ${cx} ${cy + s * 0.3} L ${cx - s * 0.28} ${cy} Z`} />
        </g>
      )
    case 'moon':
      return <path d={`M ${cx + s * 0.4} ${cy - s * 0.5} a ${s * 0.6} ${s * 0.6} 0 1 0 0 ${s} a ${s * 0.45} ${s * 0.45} 0 1 1 0 ${-s} Z`} {...stroke} />
    case 'cross-x':
      return (
        <g {...stroke}>
          <line x1={cx - s * 0.45} y1={cy - s * 0.45} x2={cx + s * 0.45} y2={cy + s * 0.45} />
          <line x1={cx + s * 0.45} y1={cy - s * 0.45} x2={cx - s * 0.45} y2={cy + s * 0.45} />
          <circle cx={cx} cy={cy} r={s * 0.08} fill={INK} />
        </g>
      )
    case 'scales':
      return (
        <g {...stroke}>
          <path d={`M ${cx - s * 0.55} ${cy + s * 0.1} q ${s * 0.55} ${-s * 0.55} ${s * 1.1} 0`} />
          <line x1={cx - s * 0.5} y1={cy + s * 0.45} x2={cx + s * 0.5} y2={cy + s * 0.45} />
        </g>
      )
    case 'star6':
      return (
        <g {...stroke}>
          <path d={`M ${cx} ${cy - s * 0.6} L ${cx + s * 0.52} ${cy + s * 0.3} L ${cx - s * 0.52} ${cy + s * 0.3} Z`} />
          <path d={`M ${cx} ${cy + s * 0.6} L ${cx + s * 0.52} ${cy - s * 0.3} L ${cx - s * 0.52} ${cy - s * 0.3} Z`} />
        </g>
      )
    case 'smiley':
      return (
        <g {...stroke}>
          <circle cx={cx} cy={cy} r={s * 0.55} />
          <circle cx={cx - s * 0.2} cy={cy - s * 0.12} r={s * 0.07} fill={INK} />
          <circle cx={cx + s * 0.2} cy={cy - s * 0.12} r={s * 0.07} fill={INK} />
          <path d={`M ${cx - s * 0.25} ${cy + s * 0.15} q ${s * 0.25} ${s * 0.25} ${s * 0.5} 0`} />
        </g>
      )
    case 'bull':
      return (
        <g {...stroke}>
          <circle cx={cx} cy={cy + s * 0.25} r={s * 0.35} />
          <path d={`M ${cx - s * 0.55} ${cy - s * 0.5} q ${s * 0.55} ${s * 0.5} ${s * 1.1} 0`} />
        </g>
      )
    case 'flag':
      return (
        <g {...stroke}>
          <line x1={cx - s * 0.4} y1={cy - s * 0.6} x2={cx - s * 0.4} y2={cy + s * 0.6} />
          <path d={`M ${cx - s * 0.4} ${cy - s * 0.6} q ${s * 0.5} ${s * 0.2} ${s} 0 q ${-s * 0.3} ${s * 0.3} 0 ${s * 0.5} q ${-s * 0.5} ${-s * 0.2} ${-s} 0 Z`} />
        </g>
      )
    case 'snowflake':
      return (
        <g {...stroke}>
          {[0, 60, 120].map((a) => (
            <line key={a} x1={cx - s * 0.6} y1={cy} x2={cx + s * 0.6} y2={cy} transform={`rotate(${a} ${cx} ${cy})`} />
          ))}
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <line key={`b${a}`} x1={cx + s * 0.4} y1={cy - s * 0.15} x2={cx + s * 0.6} y2={cy} transform={`rotate(${a} ${cx} ${cy})`} />
          ))}
        </g>
      )
    case 'plane':
      return (
        <path
          d={`M ${cx - s * 0.6} ${cy} l ${s * 1.2} ${-s * 0.25} l 0 ${s * 0.1} l ${-s * 0.4} ${s * 0.15} l ${s * 0.05} ${s * 0.3} l ${-s * 0.15} 0 l ${-s * 0.2} ${-s * 0.25} l ${-s * 0.5} ${s * 0.1} Z`}
          {...stroke}
        />
      )
    case 'plus-cross':
      return (
        <g {...stroke}>
          <line x1={cx} y1={cy - s * 0.6} x2={cx} y2={cy + s * 0.6} />
          <line x1={cx - s * 0.45} y1={cy - s * 0.15} x2={cx + s * 0.45} y2={cy - s * 0.15} />
        </g>
      )
    case 'hand':
      return (
        <g {...stroke}>
          <path
            d={`M ${cx - s * 0.35} ${cy + s * 0.55} q ${-s * 0.15} ${-s * 0.5} ${s * 0.05} ${-s * 0.7} l 0 ${-s * 0.45} q ${s * 0.12} ${-s * 0.1} ${s * 0.18} 0 l 0 ${s * 0.35} q ${s * 0.1} ${-s * 0.12} ${s * 0.2} 0 q ${s * 0.1} ${-s * 0.1} ${s * 0.2} 0 q ${s * 0.1} ${-s * 0.05} ${s * 0.18} ${s * 0.05} l 0 ${s * 0.7} q 0 ${s * 0.4} ${-s * 0.3} ${s * 0.55} Z`}
          />
        </g>
      )
    default:
      return <circle cx={cx} cy={cy} r={s * 0.3} {...stroke} />
  }
}

// Column-header symbols (top row, left-to-right).
export const COL_HEADERS = ['phone', 'scissors', 'flower', 'bell']
// Row-header symbols (left column, top-to-bottom).
export const ROW_HEADERS = ['snowburst', 'asterisk', 'hourglass', 'laptop']

// The inner 4×4 looked-up symbols [row][col], read from the source figure.
export const INNER: string[][] = [
  ['check', 'noentry', 'sun', 'moonstar'],
  ['diamond', 'moon', 'cross-x', 'scales'],
  ['star6', 'smiley', 'bull', 'flag'],
  ['snowflake', 'plane', 'plus-cross', 'hand'],
]

// The asked cell (the answer symbol): row 4 / column 4 → 'hand'. This is option D.
export const ASKED_ROW = 3
export const ASKED_COL = 3

const CELL = 64
const GAP = 4
const PAD = 8

export const GRID_VIEW_W = PAD * 2 + 5 * CELL + 4 * GAP
export const GRID_VIEW_H = GRID_VIEW_W

export interface SymbolGridDiagramProps {
  /** Highlight the looked-up row (0..3) — left header + the row of cells. */
  highlightRow?: number | null
  /** Highlight the looked-up column (0..3) — top header + the column of cells. */
  highlightCol?: number | null
  /** Outline the single intersection cell (row, col). */
  pickCell?: boolean
}

export function SymbolGridDiagram({ highlightRow = null, highlightCol = null, pickCell = false }: SymbolGridDiagramProps) {
  // grid origin: col index 0 is the header column; col index 1 = first symbol col.
  const at = (i: number) => PAD + i * (CELL + GAP)
  const center = (i: number) => at(i) + CELL / 2

  return (
    <svg
      viewBox={`0 0 ${GRID_VIEW_W} ${GRID_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* row highlight band (over the inner row) */}
      {highlightRow != null && (
        <rect x={at(0)} y={at(highlightRow + 1)} width={5 * CELL + 4 * GAP} height={CELL} fill="#FEF08A" opacity={0.55} rx={4} />
      )}
      {/* col highlight band */}
      {highlightCol != null && (
        <rect x={at(highlightCol + 1)} y={at(0)} width={CELL} height={5 * CELL + 4 * GAP} fill="#BFDBFE" opacity={0.55} rx={4} />
      )}

      {/* column headers (top row, cols 1..4) */}
      {COL_HEADERS.map((name, c) => (
        <g key={`ch${c}`}>
          <rect x={at(c + 1)} y={at(0)} width={CELL} height={CELL} fill="#F1F5F9" stroke={INK} strokeWidth={1.5} rx={3} />
          <Glyph name={name} cx={center(c + 1)} cy={center(0)} s={18} />
        </g>
      ))}

      {/* row headers (left column, rows 1..4) */}
      {ROW_HEADERS.map((name, r) => (
        <g key={`rh${r}`}>
          <rect x={at(0)} y={at(r + 1)} width={CELL} height={CELL} fill="#F1F5F9" stroke={INK} strokeWidth={1.5} rx={3} />
          <Glyph name={name} cx={center(0)} cy={center(r + 1)} s={18} />
        </g>
      ))}

      {/* inner 4×4 looked-up symbols */}
      {INNER.map((row, r) =>
        row.map((name, c) => (
          <g key={`in${r}-${c}`}>
            <rect x={at(c + 1)} y={at(r + 1)} width={CELL} height={CELL} fill="none" stroke={INK} strokeWidth={1.5} rx={3} />
            <Glyph name={name} cx={center(c + 1)} cy={center(r + 1)} s={18} />
          </g>
        )),
      )}

      {/* picked intersection cell outline */}
      {pickCell && highlightRow != null && highlightCol != null && (
        <rect
          x={at(highlightCol + 1)}
          y={at(highlightRow + 1)}
          width={CELL}
          height={CELL}
          fill="none"
          stroke="#16A34A"
          strokeWidth={4}
          rx={4}
        />
      )}
    </svg>
  )
}

export default function SymbolGrid19P1Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A 4-by-4 grid of symbols with a header row across the top and a header column down the left. Each inner symbol is named by its row-header and column-header."
    >
      <SymbolGridDiagram />
    </div>
  )
}
