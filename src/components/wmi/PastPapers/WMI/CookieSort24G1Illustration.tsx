// WMI-24F1A-Q14 (Grade 1) — sort the cookies by SHAPE or by NUMBER OF DOTS.
//
// Recovered from the Paper A scans (nine cookie tiles, numbered 1..9, laid out
// left-to-right in the source; redrawn here as a 3x3 grid). Each cookie carries a
// SHAPE (circle / square / triangle) and a DOT COUNT. Verified per tile:
//   1 circle   · 2 dots      6 triangle · 1 dot
//   2 square   · 1 dot       7 square   · 4 dots
//   3 triangle · 2 dots      8 triangle · 4 dots
//   4 circle   · 2 dots      9 circle   · 4 dots
//   5 square   · 1 dot
//
// A "group" of three cookie numbers is "the same kind" iff all three share a
// SHAPE *or* all three share a DOT COUNT. The question asks which option is NOT
// the same kind:
//   A 1,4,9  → circle, circle, circle           → same SHAPE
//   B 7,8,9  → 4, 4, 4 dots                      → same DOTS
//   C 2,5,6  → 1, 1, 1 dots                      → same DOTS
//   D 3,6,8  → triangle, triangle, triangle      → same SHAPE
//   E 1,3,6  → circle/triangle/triangle (mixed) and 2/2/1 dots (mixed) → NEITHER
// So E is the odd one out (answer E).
//
// The static figure shows ONLY the nine cookies with their shapes + dots — never
// a grouping mark or the answer. The animator imports CookieSort24G1 and passes
// `litGroup` to highlight a trio of cookies post-answer.

interface Cookie {
  n: number
  shape: 'circle' | 'square' | 'triangle'
  dots: 1 | 2 | 4
}

// Cookie 1..9 — shape + dot count traced from the scan.
const COOKIES: Cookie[] = [
  { n: 1, shape: 'circle', dots: 2 },
  { n: 2, shape: 'square', dots: 1 },
  { n: 3, shape: 'triangle', dots: 2 },
  { n: 4, shape: 'circle', dots: 2 },
  { n: 5, shape: 'square', dots: 1 },
  { n: 6, shape: 'triangle', dots: 1 },
  { n: 7, shape: 'square', dots: 4 },
  { n: 8, shape: 'triangle', dots: 4 },
  { n: 9, shape: 'circle', dots: 4 },
]

// --- layout (viewBox units) ---------------------------------------------
const COLS = 3
const ROWS = 3
const CELL = 96 // cookie cell (shape lives here)
const GAP_X = 22
const GAP_Y = 26
const PAD = 16
const LABEL_H = 24 // room under each cookie for its number

const GRID_W = COLS * CELL + (COLS - 1) * GAP_X
const GRID_H = ROWS * (CELL + LABEL_H) + (ROWS - 1) * GAP_Y
const VIEW_W = PAD * 2 + GRID_W
const VIEW_H = PAD * 2 + GRID_H

const INK = '#2B2B2B' // cookie shape outline + number label (no darker token needed)

// Dot positions (in a unit square 0..1) by count, matching the scan layouts.
const DOT_LAYOUT: Record<number, Array<[number, number]>> = {
  1: [[0.5, 0.5]],
  2: [
    [0.38, 0.5],
    [0.62, 0.5],
  ],
  4: [
    [0.38, 0.38],
    [0.62, 0.38],
    [0.38, 0.62],
    [0.62, 0.62],
  ],
}

/**
 * Draw one cookie's shape outline + its dots inside a CELL x CELL box at (ox, oy).
 * The shape is the "cookie" silhouette; dots sit centered on the lower portion so
 * the apex of the triangle stays clear (mirrors the source tiles).
 */
function CookieGlyph({ ox, oy, cookie, lit }: { ox: number; oy: number; cookie: Cookie; lit: boolean }) {
  const stroke = lit ? '#f0853a' : INK
  const sw = lit ? 3.5 : 2.5
  const cx = ox + CELL / 2
  const cy = oy + CELL / 2

  // Where the dots cluster differs slightly per shape so they sit inside.
  const dotBox =
    cookie.shape === 'triangle'
      ? { x: ox + CELL * 0.2, y: oy + CELL * 0.42, w: CELL * 0.6, h: CELL * 0.42 }
      : { x: ox + CELL * 0.18, y: oy + CELL * 0.18, w: CELL * 0.64, h: CELL * 0.64 }

  const dots = DOT_LAYOUT[cookie.dots] ?? []

  return (
    <g>
      {/* cookie body fill behind the shape */}
      {cookie.shape === 'circle' && (
        <circle cx={cx} cy={cy} r={CELL * 0.44} className="fill-qupu-cream" stroke={stroke} strokeWidth={sw} />
      )}
      {cookie.shape === 'square' && (
        <rect
          x={ox + CELL * 0.08}
          y={oy + CELL * 0.08}
          width={CELL * 0.84}
          height={CELL * 0.84}
          rx={6}
          className="fill-qupu-cream"
          stroke={stroke}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
      )}
      {cookie.shape === 'triangle' && (
        <polygon
          points={[
            `${cx},${oy + CELL * 0.07}`,
            `${ox + CELL * 0.07},${oy + CELL * 0.92}`,
            `${ox + CELL * 0.93},${oy + CELL * 0.92}`,
          ].join(' ')}
          className="fill-qupu-cream"
          stroke={stroke}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
      )}

      {/* dots */}
      {dots.map(([dx, dy], i) => (
        <circle
          key={i}
          cx={dotBox.x + dx * dotBox.w}
          cy={dotBox.y + dy * dotBox.h}
          r={6.5}
          fill={INK}
        />
      ))}
    </g>
  )
}

/**
 * Reusable primitive: the nine numbered cookies (shape + dots) in a 3x3 grid.
 * `litGroup` (optional) rings/recolors the listed cookie numbers in orange —
 * used by the animator to highlight a trio of cookies post-answer. The default
 * (no prop) draws the bare problem with no highlight.
 */
export function CookieSort24G1({ litGroup = null }: { litGroup?: number[] | null } = {}) {
  const lit = new Set(litGroup ?? [])
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 360 }}
      aria-hidden="true"
    >
      {COOKIES.map((cookie, i) => {
        const col = i % COLS
        const row = Math.floor(i / COLS)
        const ox = PAD + col * (CELL + GAP_X)
        const oy = PAD + row * (CELL + LABEL_H + GAP_Y)
        const isLit = lit.has(cookie.n)
        return (
          <g key={cookie.n}>
            {/* soft highlight halo behind a lit cookie */}
            {isLit && (
              <circle
                cx={ox + CELL / 2}
                cy={oy + CELL / 2}
                r={CELL * 0.56}
                className="fill-qupu-peach"
                opacity={0.5}
              />
            )}
            <CookieGlyph ox={ox} oy={oy} cookie={cookie} lit={isLit} />
            {/* number label under the cookie */}
            <text
              x={ox + CELL / 2}
              y={oy + CELL + LABEL_H - 6}
              textAnchor="middle"
              className="font-display"
              fontSize={20}
              fontWeight={800}
              fill={isLit ? '#f0853a' : INK}
            >
              {cookie.n}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function CookieSort24G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Sembilan biskuit bernomor 1 sampai 9, masing-masing berbentuk lingkaran, persegi, atau segitiga dengan sejumlah titik. Biskuit 1 lingkaran 2 titik, 2 persegi 1 titik, 3 segitiga 2 titik, 4 lingkaran 2 titik, 5 persegi 1 titik, 6 segitiga 1 titik, 7 persegi 4 titik, 8 segitiga 4 titik, 9 lingkaran 4 titik. Kelompokkan menurut bentuk atau jumlah titik."
    >
      <CookieSort24G1 />
    </div>
  )
}
