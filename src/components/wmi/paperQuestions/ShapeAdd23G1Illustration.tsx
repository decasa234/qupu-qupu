// Shape-addition chain for WMI-23F1A-Q16 (2023 Grade 1 Final).
//
// "The figure shows four addition relationships. The same shape stands for the
// same number. Find ★."  Each row is  left + right = result :
//   1)  2 + 3 = 5
//   2)  7 + 4 = ●
//   3)  ● + 6 = ■
//   4)  ■ + ★ = 25
// Derivation (NEVER shown in the static figure): ●=11, ■=17, ★ = 25−17 = 8.
//
// One monochrome outline glyph set for the unknowns — ● filled circle,
// ■ filled square, ★ filled star — identical everywhere. The static figure
// shows only the four equations with the given numbers (2,3,5,7,4,6,25) and
// the shapes as placeholders; it must NOT reveal ●=11, ■=17 or ★=8.
//
// House-style reference: ShapeAddition22G2Illustration in paper22G2Visuals.tsx.
// Pure render, SSR-safe, deterministic (no random / dates / state).

type ShapeKind = 'circle' | 'square' | 'star'
// A cell is either a literal number or one of the three shape unknowns.
type Cell = number | ShapeKind

// The four rows, in figure order: [left, right, result].
const ROWS: ReadonlyArray<readonly [Cell, Cell, Cell]> = [
  [2, 3, 5],
  [7, 4, 'circle'],
  ['circle', 6, 'square'],
  ['square', 'star', 25],
] as const

// Solved values — used ONLY when the animator asks to reveal a stage. They are
// never drawn at revealUpTo = 0 (the question figure).
const SHAPE_VALUE: Record<ShapeKind, number> = { circle: 11, square: 17, star: 8 }

// revealUpTo gates which shapes show their number:
//   0 → none · 2 → ● known · 3 → ●,■ known · 4 → ●,■,★ known.
function isRevealed(kind: ShapeKind, revealUpTo: number): boolean {
  if (kind === 'circle') return revealUpTo >= 2
  if (kind === 'square') return revealUpTo >= 3
  return revealUpTo >= 4 // star
}

const INK = '#1F2937'
const GLYPH_STROKE = '#1F2937'

const GLYPH_R = 15

/** One filled monochrome unknown glyph, centred at (cx, cy). Identical everywhere. */
function ShapeGlyph({ kind, cx, cy }: { kind: ShapeKind; cx: number; cy: number }) {
  const fill = '#FBBF6B' // single warm fill shared by all three glyphs
  const common = { fill, stroke: GLYPH_STROKE, strokeWidth: 2.5 }
  if (kind === 'circle') {
    return <circle cx={cx} cy={cy} r={GLYPH_R} {...common} />
  }
  if (kind === 'square') {
    const s = GLYPH_R * 1.7
    return <rect x={cx - s / 2} y={cy - s / 2} width={s} height={s} rx={2} strokeLinejoin="round" {...common} />
  }
  // five-pointed star
  const inner = GLYPH_R * 0.42
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 === 0 ? GLYPH_R : inner
    pts.push(`${(cx + rr * Math.cos(rad)).toFixed(2)},${(cy + rr * Math.sin(rad)).toFixed(2)}`)
  }
  return <polygon points={pts.join(' ')} strokeLinejoin="round" {...common} />
}

// --- layout -----------------------------------------------------------------
const VIEW_W = 300
const VIEW_H = 244
const ROW_Y = [44, 100, 156, 212] // y-centre of the four rows
// x anchors for the three operand slots + the operators.
const LEFT_X = 74
const PLUS_X = 116
const RIGHT_X = 158
const EQ_X = 200
const RESULT_X = 244

/** Render a single cell (number literal or unknown glyph) centred at (x, y). */
function CellGlyph({ cell, x, y, revealUpTo }: { cell: Cell; x: number; y: number; revealUpTo: number }) {
  if (typeof cell === 'number') {
    return (
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={26} fontWeight={900} fill={INK}>
        {cell}
      </text>
    )
  }
  const revealed = isRevealed(cell, revealUpTo)
  return (
    <g>
      <ShapeGlyph kind={cell} cx={x} cy={y} />
      {revealed && (
        // number sits inside the filled glyph once the animator reveals it.
        <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={900} fill={INK}>
          {SHAPE_VALUE[cell]}
        </text>
      )}
    </g>
  )
}

export interface ShapeAdd23G1Props {
  /** 0 = nothing revealed · 2 = ● known · 3 = ■ known · 4 = ★ known. */
  revealUpTo?: 0 | 1 | 2 | 3 | 4
}

/**
 * Primitive board for the four shape-addition rows. The animator drives
 * `revealUpTo` to fill in ●, then ■, then ★ across beats. At revealUpTo = 0 the
 * figure is the pristine question (no shape carries a number).
 */
export function ShapeAdd23G1({ revealUpTo = 0 }: ShapeAdd23G1Props) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {ROWS.map((row, r) => {
        const y = ROW_Y[r]
        const [left, right, result] = row
        return (
          <g key={r}>
            <CellGlyph cell={left} x={LEFT_X} y={y} revealUpTo={revealUpTo} />
            <text x={PLUS_X} y={y} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={800} fill={INK}>
              +
            </text>
            <CellGlyph cell={right} x={RIGHT_X} y={y} revealUpTo={revealUpTo} />
            <text x={EQ_X} y={y} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={800} fill={INK}>
              =
            </text>
            <CellGlyph cell={result} x={RESULT_X} y={y} revealUpTo={revealUpTo} />
          </g>
        )
      })}
    </svg>
  )
}

// Indonesian aria description of the four relationships (shapes named, not solved).
const ARIA =
  'Empat hubungan penjumlahan dengan bentuk yang sama mewakili bilangan yang sama: ' +
  '2 ditambah 3 sama dengan 5; 7 ditambah 4 sama dengan lingkaran; ' +
  'lingkaran ditambah 6 sama dengan persegi; persegi ditambah bintang sama dengan 25. ' +
  'Cari nilai bintang.'

/** Question figure — nothing revealed. Sits in the card, no box. */
export default function ShapeAdd23G1Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <ShapeAdd23G1 revealUpTo={0} />
    </div>
  )
}
