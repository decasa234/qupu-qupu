// WMI-22P1A-Q14 (2022 Semifinal Grade 1 Paper A) — "Look at the grid of desserts.
// Which single dessert appears the most often in the grid?"  Answer: B.
//
// Faithful redraw of db/seed/wmi/figures/2022-semifinal-g1-a-q14.jpg: a 3-row x
// 10-column grid of dessert glyphs. Four dessert kinds appear:
//   cake  = strawberry-topped white-frosted cake
//   cookie = cream-filled cookie sandwich
//   donut = ring donut with sprinkles
//   cheese = yellow triangular cheese wedge
//
// GRID (reading order, row by row) — verified cell-by-cell against the scan:
//   Row 0: cake  cookie donut donut donut donut cookie cheese cheese cookie
//   Row 1: donut cheese cookie cake  cake  cheese donut cake  donut cookie
//   Row 2: donut donut  cake  cookie donut cheese cake  donut cookie cake
//
// TALLY (throwaway — NEVER drawn on the static figure):
//   donut -> 11, cake -> 7, cookie -> 7, cheese -> 5.  Most = donut (11).
//   The original answer options were pictures of one dessert each; the seed key
//   is option B = the donut.
//
// The static figure draws ONLY the grid of desserts — no tally, no highlight,
// no answer. The animator tallies each kind afterwards via the co-exported
// DessertCell / DessertGrid22 primitives (highlightKind / tally props).
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

export type DessertKind = 'cake' | 'cookie' | 'donut' | 'cheese'

/** The grid in reading order — the single source of truth. */
export const DESSERT_GRID: ReadonlyArray<ReadonlyArray<DessertKind>> = [
  ['cake', 'cookie', 'donut', 'donut', 'donut', 'donut', 'cookie', 'cheese', 'cheese', 'cookie'],
  ['donut', 'cheese', 'cookie', 'cake', 'cake', 'cheese', 'donut', 'cake', 'donut', 'cookie'],
  ['donut', 'donut', 'cake', 'cookie', 'donut', 'cheese', 'cake', 'donut', 'cookie', 'cake'],
] as const

export const DESSERT_KINDS: readonly DessertKind[] = ['donut', 'cake', 'cookie', 'cheese']

export const DESSERT_LABEL: Record<DessertKind, string> = {
  donut: 'Donut',
  cake: 'Cake',
  cookie: 'Cookie',
  cheese: 'Cheese',
}

/** Count how many cells in the grid are `kind`. Animation/derivation only. */
export function frequencyOfKind(kind: DessertKind): number {
  let n = 0
  for (const row of DESSERT_GRID) for (const cell of row) if (cell === kind) n += 1
  return n
}

// ---- colours (echo the scan) ----------------------------------------------
const INK = '#5b4636' // grid lines / outlines (warm brown)
const CHOC = '#8a5a2b'
const CHOC_DK = '#6e4621'
const CREAM = '#fdf6ea'
const FROST = '#ffffff'
const STRAW = '#e23b3b'
const STRAW_DK = '#b62a2a'
const LEAF = '#3f9d54'
const CHEESE = '#f6c94a'
const CHEESE_DK = '#e0a92e'
const SPRINKLE = ['#e23b3b', '#3f9d54', '#f6c94a', '#ffffff']

// ---- one dessert glyph (drawn inside a unit 100x100 box) -------------------
function CakeGlyph() {
  return (
    <g>
      {/* cake base */}
      <rect x={26} y={58} width={48} height={26} rx={5} fill={CHOC} stroke={INK} strokeWidth={1.5} />
      {/* frosting */}
      <path
        d="M22 58 q6 -10 14 -2 q8 -10 14 -2 q8 -10 14 -2 q8 -10 14 0 l0 6 q-3 6 -10 4 q-6 6 -14 2 q-8 6 -14 0 q-8 6 -14 0 z"
        fill={FROST}
        stroke={INK}
        strokeWidth={1.5}
      />
      {/* strawberry */}
      <path d="M50 22 q10 4 8 16 q-2 10 -8 12 q-6 -2 -8 -12 q-2 -12 8 -16 z" fill={STRAW} stroke={STRAW_DK} strokeWidth={1.2} />
      <path d="M44 22 q6 -6 12 0 q-6 4 -12 0 z" fill={LEAF} />
      <circle cx={47} cy={34} r={1.2} fill={STRAW_DK} />
      <circle cx={53} cy={38} r={1.2} fill={STRAW_DK} />
      <circle cx={49} cy={43} r={1.2} fill={STRAW_DK} />
    </g>
  )
}

function CookieGlyph() {
  return (
    <g>
      {/* bottom cookie */}
      <ellipse cx={50} cy={64} rx={32} ry={13} fill={CHOC} stroke={INK} strokeWidth={1.5} />
      {/* cream filling */}
      <ellipse cx={50} cy={54} rx={31} ry={9} fill={CREAM} stroke={INK} strokeWidth={1.2} />
      {/* top cookie */}
      <ellipse cx={50} cy={44} rx={32} ry={14} fill={CHOC} stroke={INK} strokeWidth={1.5} />
      {/* choc chips on top */}
      <circle cx={40} cy={40} r={2.2} fill={CHOC_DK} />
      <circle cx={56} cy={38} r={2.2} fill={CHOC_DK} />
      <circle cx={62} cy={46} r={2.2} fill={CHOC_DK} />
      <circle cx={46} cy={48} r={2.2} fill={CHOC_DK} />
    </g>
  )
}

function DonutGlyph() {
  return (
    <g>
      {/* dough ring */}
      <circle cx={50} cy={54} r={30} fill="#d8a25a" stroke={INK} strokeWidth={1.5} />
      {/* chocolate glaze (wavy top half) */}
      <path
        d="M20 54 a30 30 0 0 1 60 0 q-2 8 -8 6 q-6 8 -14 4 q-8 8 -16 2 q-8 6 -14 -2 q-6 4 -8 -10 z"
        fill={CHOC}
        stroke={INK}
        strokeWidth={1.2}
      />
      {/* hole */}
      <circle cx={50} cy={54} r={11} fill={CREAM} stroke={INK} strokeWidth={1.5} />
      {/* sprinkles */}
      {[
        [34, 42],
        [44, 38],
        [60, 40],
        [68, 50],
        [38, 62],
        [62, 64],
      ].map(([x, y], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={6}
          height={2.4}
          rx={1.2}
          fill={SPRINKLE[i % SPRINKLE.length]}
          transform={`rotate(${(i * 47) % 180} ${x + 3} ${y + 1})`}
        />
      ))}
    </g>
  )
}

function CheeseGlyph() {
  return (
    <g>
      {/* wedge */}
      <path d="M22 70 L74 70 L74 40 Z" fill={CHEESE} stroke={CHEESE_DK} strokeWidth={1.5} />
      {/* rind top edge */}
      <path d="M74 40 L74 70 L66 70 L66 46 Z" fill={CHEESE_DK} opacity={0.4} />
      {/* holes */}
      <circle cx={42} cy={62} r={4} fill={CREAM} />
      <circle cx={56} cy={56} r={3} fill={CREAM} />
      <circle cx={62} cy={64} r={3.4} fill={CREAM} />
    </g>
  )
}

const GLYPHS: Record<DessertKind, () => React.ReactElement> = {
  cake: CakeGlyph,
  cookie: CookieGlyph,
  donut: DonutGlyph,
  cheese: CheeseGlyph,
}

/** One dessert in a unit cell, optionally washed when highlighted. */
export function DessertCell({ kind, highlighted = false }: { kind: DessertKind; highlighted?: boolean }) {
  const Glyph = GLYPHS[kind]
  return (
    <g>
      {highlighted && <rect x={2} y={2} width={96} height={96} fill="rgba(240,133,58,0.18)" />}
      <Glyph />
    </g>
  )
}

// ---- grid layout -----------------------------------------------------------
const COLS = 10
const ROWS = 3
const PAD = 6
const CELL = 56
const BOARD_W = COLS * CELL
const BOARD_H = ROWS * CELL

const VIEW_W = BOARD_W + PAD * 2
const VIEW_H = BOARD_H + PAD * 2

export interface DessertGrid22Props {
  /** When set, every cell of this kind gets an orange wash. Null for the bare problem. */
  highlightKind?: DessertKind | null
}

/** Bare 3x10 dessert grid primitive, with an optional kind-highlight overlay. */
export function DessertGrid22({ highlightKind = null }: DessertGrid22Props = {}) {
  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: 620, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {/* outer board */}
      <rect x={PAD} y={PAD} width={BOARD_W} height={BOARD_H} fill="#FFFFFF" stroke={INK} strokeWidth={2.5} />

      {/* cells */}
      {DESSERT_GRID.map((row, r) =>
        row.map((kind, c) => {
          const x = PAD + c * CELL
          const y = PAD + r * CELL
          return (
            <g key={`${r}-${c}`} transform={`translate(${x} ${y}) scale(${CELL / 100})`}>
              <DessertCell kind={kind} highlighted={highlightKind === kind} />
            </g>
          )
        }),
      )}

      {/* interior vertical grid lines */}
      {Array.from({ length: COLS - 1 }, (_, i) => i + 1).map((i) => (
        <line key={`v-${i}`} x1={PAD + i * CELL} y1={PAD} x2={PAD + i * CELL} y2={PAD + BOARD_H} stroke={INK} strokeWidth={1.5} />
      ))}
      {/* interior horizontal grid lines */}
      {Array.from({ length: ROWS - 1 }, (_, i) => i + 1).map((i) => (
        <line key={`h-${i}`} x1={PAD} y1={PAD + i * CELL} x2={PAD + BOARD_W} y2={PAD + i * CELL} stroke={INK} strokeWidth={1.5} />
      ))}
    </svg>
  )
}

export default function P22G1Q14Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A grid of desserts, 3 rows by 10 columns. Each cell holds one dessert: a strawberry cake, a cream-filled cookie, a sprinkled donut, or a cheese wedge. Which dessert appears most often?"
    >
      <DessertGrid22 />
    </div>
  )
}
