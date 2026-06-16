/**
 * WMI-23F1A-Q13 — Card statistics deduction (2023 Grade 1 Final).
 *
 * The paper prints 12 cards (one shown as a "?") plus two summary tables, and
 * asks which card belongs in the "?" place. Each card has exactly ONE shape
 * (square / circle / triangle) and ONE colour (gray / white).
 *
 * THE TWO TALLIES (read from the printed tables)
 * ----------------------------------------------
 *   By SHAPE:  Square = 5,  Circle = 3,  Triangle = 4   (total 12)
 *   By COLOUR: Gray   = 7,  White  = 5                  (total 12)
 *
 * THE 11 VISIBLE CARDS (read cell-by-cell from the scan
 *   images/00dcabef…c8c.jpg — diamonds are squares rotated 45°):
 *     1  white  square   (outlined diamond, top-left)
 *     2  white  circle   (outlined)
 *     3  gray   square   (rotated)
 *     4  white  triangle (outlined)
 *     5  gray   circle   (small)
 *     6  gray   circle   (large)
 *     7  gray   triangle (bottom-left)
 *     8  gray   square   (small)
 *     9  white  square   (large rotated, outlined)
 *    10  white  square   (small)
 *    11  gray   triangle (large, right)
 *    12  "?"               ← the missing card
 *
 * VISIBLE COUNTS
 *     shapes : square 5, circle 3, triangle 3
 *     colours: gray 6,  white 5
 *
 * DEDUCTION (answer = D)
 *   Shape  : target triangle 4 − visible 3 = 1  → missing card is a TRIANGLE.
 *   Colour : target gray   7 − visible 6 = 1   → missing card is GRAY.
 *   Therefore the "?" must be a GRAY TRIANGLE — uniquely candidate D.
 *   (A = white triangle, B = gray circle, C = white square,
 *    D = GRAY TRIANGLE ✓, E = white circle.) Only D completes BOTH tallies.
 *
 * Source scans (Paper A):
 *   images/00dcabef6fb9f0a07f559275225254ddabfab87947595ca4be5d223737502c8c.jpg  (12 cards)
 *   images/f6c3879192bd…0622.jpg  (A)  images/1524bd10…64cd.jpg (B)
 *   images/69846b20…3df99.jpg  (C)  images/5355d2bc…701c4.jpg (D)
 *   images/63fd069f…a437c.jpg  (E)
 *
 * Pure SVG — no randomness, no dates, SSR-safe & deterministic.
 */

export type CardShape = 'square' | 'circle' | 'triangle'
export type CardColor = 'gray' | 'white'

export interface CardSpec {
  shape: CardShape
  color: CardColor
}

// --- colours (monochrome card set, raw hex per spec) -----------------------
const GRAY_FILL = '#9e9e9e'
const WHITE_FILL = '#ffffff'
const SHAPE_STROKE = '#3a322b'
const QMARK_STROKE = '#3a322b'

function fillFor(color: CardColor): string {
  return color === 'gray' ? GRAY_FILL : WHITE_FILL
}

// ---------------------------------------------------------------------------
// ShapeGlyph — one monochrome shape (□ ○ △) drawn inside a `size`×`size` box
// whose top-left is (0,0). Used by the cards, the option renderer and the
// tally tables, so the shape/colour vocabulary can never drift.
// ---------------------------------------------------------------------------

export interface ShapeGlyphProps {
  shape: CardShape
  color: CardColor
  size: number
  /** Highlight ring (animator use) — draws a soft orange halo behind the shape. */
  lit?: boolean
}

export function ShapeGlyph({ shape, color, size, lit = false }: ShapeGlyphProps) {
  const fill = fillFor(color)
  const sw = Math.max(1.6, size * 0.05)
  const cx = size / 2
  const cy = size / 2
  // inset so strokes never clip the cell edges
  const m = sw + size * 0.06
  const inner = size - 2 * m

  let glyph: JSX.Element
  if (shape === 'circle') {
    glyph = <circle cx={cx} cy={cy} r={inner / 2} fill={fill} stroke={SHAPE_STROKE} strokeWidth={sw} />
  } else if (shape === 'triangle') {
    const pts = `${cx},${m} ${m},${size - m} ${size - m},${size - m}`
    glyph = (
      <polygon
        points={pts}
        fill={fill}
        stroke={SHAPE_STROKE}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    )
  } else {
    glyph = (
      <rect
        x={m}
        y={m}
        width={inner}
        height={inner}
        rx={size * 0.06}
        fill={fill}
        stroke={SHAPE_STROKE}
        strokeWidth={sw}
      />
    )
  }

  return (
    <g>
      {lit && (
        <circle cx={cx} cy={cy} r={size * 0.56} fill="#f0853a" opacity={0.22} />
      )}
      {glyph}
    </g>
  )
}

// ---------------------------------------------------------------------------
// The 11 visible cards (row-major layout) + the missing card (D = gray triangle).
// ---------------------------------------------------------------------------

/** The 11 printed cards, in reading order (left→right, top→bottom of the scan). */
export const VISIBLE_CARDS: CardSpec[] = [
  { shape: 'square', color: 'white' }, // 1 outlined diamond
  { shape: 'circle', color: 'white' }, // 2 outlined circle
  { shape: 'square', color: 'gray' }, // 3 rotated square
  { shape: 'triangle', color: 'white' }, // 4 outlined triangle
  { shape: 'circle', color: 'gray' }, // 5 small circle
  { shape: 'circle', color: 'gray' }, // 6 large circle
  { shape: 'triangle', color: 'gray' }, // 7 bottom-left triangle
  { shape: 'square', color: 'gray' }, // 8 small square
  { shape: 'square', color: 'white' }, // 9 large rotated square
  { shape: 'square', color: 'white' }, // 10 small square
  { shape: 'triangle', color: 'gray' }, // 11 large triangle
]

/** The card that completes both tallies — a GRAY TRIANGLE (candidate D). */
export const MISSING_CARD: CardSpec = { shape: 'triangle', color: 'gray' }

// Shape tally rows (label, target count) — matches the printed table.
const SHAPE_TALLY: { shape: CardShape; count: number }[] = [
  { shape: 'square', count: 5 },
  { shape: 'circle', count: 3 },
  { shape: 'triangle', count: 4 },
]
// Colour tally rows.
const COLOR_TALLY: { color: CardColor; count: number }[] = [
  { color: 'gray', count: 7 },
  { color: 'white', count: 5 },
]

// ---------------------------------------------------------------------------
// CardStats23G1 — the shared primitive (stem + animator).
// Draws the 12-card scatter (with the "?" slot) and the two tally tables.
// Props let the animator highlight one tally row and reveal the deduced card.
// ---------------------------------------------------------------------------

export interface CardStats23G1Props {
  /** Fill the "?" slot with the deduced gray triangle (post-answer reveal). */
  revealMissing?: boolean
  /** Highlight every card / row of this shape (e.g. 'triangle'). */
  litShape?: CardShape | null
  /** Highlight every card / row of this colour (e.g. 'gray'). */
  litColor?: CardColor | null
}

// One card cell on the scatter board: an upright card with the shape centred.
function CardCell({
  spec,
  x,
  y,
  w,
  h,
  lit,
}: {
  spec: CardSpec
  x: number
  y: number
  w: number
  h: number
  lit: boolean
}) {
  const glyphSize = Math.min(w, h) * 0.72
  const gx = x + (w - glyphSize) / 2
  const gy = y + (h - glyphSize) / 2
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        fill="#fff9f4"
        stroke={lit ? '#f0853a' : '#d9cfc0'}
        strokeWidth={lit ? 3 : 1.6}
      />
      <g transform={`translate(${gx} ${gy})`}>
        <ShapeGlyph shape={spec.shape} color={spec.color} size={glyphSize} />
      </g>
    </g>
  )
}

export function CardStats23G1({
  revealMissing = false,
  litShape = null,
  litColor = null,
}: CardStats23G1Props) {
  // --- card-board layout: 12 cells in a 4×3 grid, "?" in the 12th slot -----
  const cols = 4
  const rows = 3
  const cellW = 58
  const cellH = 58
  const gap = 10
  const pad = 12
  const boardW = cols * cellW + (cols - 1) * gap
  const boardH = rows * cellH + (rows - 1) * gap

  const cardIsLit = (spec: CardSpec) =>
    (litShape != null && spec.shape === litShape) || (litColor != null && spec.color === litColor)

  // --- tally tables (stacked below the board) -----------------------------
  const tallyGapY = 18
  const rowH = 34
  const swatch = 22
  const tableW = boardW
  const shapeTableTop = pad + boardH + tallyGapY
  const shapeTableH = SHAPE_TALLY.length * rowH + 14
  const colorTableTop = shapeTableTop + shapeTableH + 12
  const colorTableH = COLOR_TALLY.length * rowH + 14

  const width = pad * 2 + boardW
  const height = colorTableTop + colorTableH + pad

  // dot-strip count marks for one tally row
  const Dots = ({ n, x, y }: { n: number; x: number; y: number }) => (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={x + i * 14} cy={y} r={4.5} fill="#475569" />
      ))}
    </g>
  )

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(300, width)} style={{ display: 'block' }}>
      {/* ---- 12 cards (11 printed + "?" / reveal) ---- */}
      {Array.from({ length: cols * rows }, (_, i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        const x = pad + col * (cellW + gap)
        const y = pad + row * (cellH + gap)

        if (i < VISIBLE_CARDS.length) {
          const spec = VISIBLE_CARDS[i]
          return (
            <CardCell key={i} spec={spec} x={x} y={y} w={cellW} h={cellH} lit={cardIsLit(spec)} />
          )
        }

        // the 12th slot — "?" unless revealing the deduced card
        if (revealMissing) {
          const lit = cardIsLit(MISSING_CARD)
          return (
            <g key={i}>
              <CardCell spec={MISSING_CARD} x={x} y={y} w={cellW} h={cellH} lit />
              {!lit && (
                <rect
                  x={x}
                  y={y}
                  width={cellW}
                  height={cellH}
                  rx={6}
                  fill="none"
                  stroke="#f0853a"
                  strokeWidth={3}
                />
              )}
            </g>
          )
        }

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={cellW}
              height={cellH}
              rx={6}
              fill="#fff9f4"
              stroke="#f0853a"
              strokeWidth={2.4}
              strokeDasharray="6 5"
            />
            <text
              x={x + cellW / 2}
              y={y + cellH / 2 + 11}
              textAnchor="middle"
              fontSize={32}
              fontWeight="bold"
              fill={QMARK_STROKE}
            >
              ?
            </text>
          </g>
        )
      })}

      {/* ---- SHAPE tally table ---- */}
      <g>
        <rect
          x={pad}
          y={shapeTableTop}
          width={tableW}
          height={shapeTableH}
          rx={8}
          fill="#fff2df"
          stroke="#d9cfc0"
          strokeWidth={1.6}
        />
        {SHAPE_TALLY.map((r, i) => {
          const ry = shapeTableTop + 7 + i * rowH
          const lit = litShape === r.shape
          return (
            <g key={r.shape}>
              {lit && (
                <rect
                  x={pad + 4}
                  y={ry - 2}
                  width={tableW - 8}
                  height={rowH - 4}
                  rx={5}
                  fill="#f0853a"
                  opacity={0.16}
                />
              )}
              <g transform={`translate(${pad + 12} ${ry})`}>
                <ShapeGlyph shape={r.shape} color="gray" size={swatch} lit={false} />
              </g>
              <Dots n={r.count} x={pad + 12 + swatch + 16} y={ry + swatch / 2} />
              <text
                x={pad + tableW - 14}
                y={ry + swatch / 2 + 6}
                textAnchor="end"
                fontSize={18}
                fontWeight="bold"
                fill="#332e29"
              >
                {r.count}
              </text>
            </g>
          )
        })}
      </g>

      {/* ---- COLOUR tally table ---- */}
      <g>
        <rect
          x={pad}
          y={colorTableTop}
          width={tableW}
          height={colorTableH}
          rx={8}
          fill="#fff2df"
          stroke="#d9cfc0"
          strokeWidth={1.6}
        />
        {COLOR_TALLY.map((r, i) => {
          const ry = colorTableTop + 7 + i * rowH
          const lit = litColor === r.color
          return (
            <g key={r.color}>
              {lit && (
                <rect
                  x={pad + 4}
                  y={ry - 2}
                  width={tableW - 8}
                  height={rowH - 4}
                  rx={5}
                  fill="#f0853a"
                  opacity={0.16}
                />
              )}
              {/* colour swatch: a filled square in the row's colour */}
              <rect
                x={pad + 12}
                y={ry}
                width={swatch}
                height={swatch}
                rx={4}
                fill={fillFor(r.color)}
                stroke={SHAPE_STROKE}
                strokeWidth={1.6}
              />
              <Dots n={r.count} x={pad + 12 + swatch + 16} y={ry + swatch / 2} />
              <text
                x={pad + tableW - 14}
                y={ry + swatch / 2 + 6}
                textAnchor="end"
                fontSize={18}
                fontWeight="bold"
                fill="#332e29"
              >
                {r.count}
              </text>
            </g>
          )
        })}
      </g>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Stem illustration (default export) — the in-card figure shown with the
// question. Draws the 12 cards (with the "?" slot) + the two tally tables.
// Shows ONLY the problem; never reveals the answer.
// ---------------------------------------------------------------------------

export default function CardStats23G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Dua belas kartu (satu ditandai "?") dan dua tabel statistik. ' +
        'Menurut bentuk: persegi 5, lingkaran 3, segitiga 4. ' +
        'Menurut warna: abu-abu 7, putih 5. ' +
        'Setiap kartu punya satu bentuk dan satu warna. Kartu mana yang cocok untuk tempat "?".'
      }
    >
      <CardStats23G1 />
    </div>
  )
}
