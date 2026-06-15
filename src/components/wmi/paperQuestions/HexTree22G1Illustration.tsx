// WMI-22F1A-Q18 (Grade 1) — "Hexagon trees" (honeycomb sum-pyramids on a trunk).
//
// Recovered from db/seed/wmi/figures/2022-final-g1-a-q18.jpg: two trees, each a
// 3-row honeycomb pyramid (bottom 3 hexagons, middle 2, top 1) sitting on a
// little brown trunk. In every tree each hexagon equals the SUM of the two
// hexagons directly below it.
//
//   TREE 1 (the worked example, fully filled):
//       top    : 7
//       middle : 3  4        (3 = 2+1, 4 = 1+3)
//       bottom : 2  1  3      → 3+4 = 7
//
//   TREE 2 (the one to solve — three blanks):
//       top    : 14
//       middle : _  _
//       bottom : 5  _  1
//
// Canonical solution (FOR THE ANIMATOR ONLY — the static figure must keep the
// three blanks EMPTY): bottom-mid = 4, mid-left = 5+4 = 9, mid-right = 4+1 = 5,
// check 9+5 = 14. The answer string is 459 (mid-left, mid-right, bottom-mid?
// note: the published answer for this item is 459).
//
// `rows` are passed top→bottom, e.g. [['7'], ['3','4'], ['2','1','3']]. An empty
// string ('') renders an empty (blank) hexagon. `highlight` (optional
// [rowIndex, colIndex]) draws an amber ring on one hexagon — used by the
// animator, never by the static figure.

// ---- Colours ----------------------------------------------------------------
// The qupu palette has no green/brown tokens, so (like NestedTri22G3Explainer)
// we use raw hex constants that mirror the scan and echo the fill-qupu-* family.
// Numbers reuse the real fill-qupu-ink token; the highlight ring reuses
// stroke-qupu-brand-orange. Both are applied via className below.
const HEX_FILL = '#DBF0CB' // honeycomb interior — pale leaf green (matches scan)
const HEX_EDGE = '#2E9B4E' // honeycomb border — vivid green (matches scan)
const TRUNK_FILL = '#A9683C' // trunk — warm saddle brown (matches scan)
const TRUNK_EDGE = '#7A4724' // trunk outline — darker brown

// ---- Geometry ---------------------------------------------------------------
// Flat-top hexagons (horizontal edges top & bottom, points on left & right),
// packed into a centred pyramid. Each row's hexagons interlock with the row
// below: the row above is raised by VSTEP and the whole row is horizontally
// offset by half a hexagon so an upper hexagon straddles the gap below it.

const HEX_W = 56 // point-to-point width (left point .. right point)
const HEX_H = 50 // flat-top to flat-bottom height
const SIDE = HEX_W * 0.5 // x-distance from centre to the left/right point
const FLAT = HEX_W * 0.5 // half-width of the flat top/bottom edge
const HSTEP = HEX_W * 0.75 // horizontal centre-to-centre within a row (tessellation)
const VSTEP = HEX_H * 0.5 // vertical rise per row up the pyramid (rows overlap)

const PAD = 12 // headroom so points/strokes never clip
const TRUNK_H = 56 // brown trunk drawn under the bottom row

const TREE_GAP = 36 // horizontal gap between the two trees in the default export

// Width of a single tree = widest row (3 hexagons) + padding.
const TREE_W = 3 * HSTEP + (HEX_W - HSTEP) // = 2*HSTEP + HEX_W
const PYR_H = HEX_H + 2 * VSTEP // 3 rows: base + two rises

/** Flat-top hexagon outline centred at (cx, cy). */
function hexPoints(cx: number, cy: number): string {
  return [
    [cx - FLAT, cy - HEX_H / 2], // top-left
    [cx + FLAT, cy - HEX_H / 2], // top-right
    [cx + SIDE, cy], // right point
    [cx + FLAT, cy + HEX_H / 2], // bottom-right
    [cx - FLAT, cy + HEX_H / 2], // bottom-left
    [cx - SIDE, cy], // left point
  ]
    .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ')
}

/**
 * Centre of hexagon `col` (0-based, left→right) in `row` (0 = bottom), within a
 * tree whose pyramid occupies [0, TREE_W] x [0, PYR_H] (local coords, y down).
 * Row `r` from the bottom has `3 - r` hexagons, centred horizontally.
 */
function hexCentre(rowFromBottom: number, col: number) {
  const count = 3 - rowFromBottom
  const rowSpan = (count - 1) * HSTEP
  const x = (TREE_W - rowSpan) / 2 + col * HSTEP
  const y = PYR_H - HEX_H / 2 - rowFromBottom * VSTEP
  return { x, y }
}

// ---- Primitive: HexTree -----------------------------------------------------

export interface HexTreeProps {
  /** Rows top→bottom, e.g. [['7'], ['3','4'], ['2','1','3']]. '' = empty hexagon. */
  rows: string[][]
  /** Optional [rowIndex, colIndex] (top→bottom indexing, matching `rows`) to ring in amber. */
  highlight?: [number, number]
}

/**
 * HexTree — one honeycomb sum-pyramid on a brown trunk.
 *
 * A self-contained <svg> wrapped in nothing (no outer div): the default export
 * lays two of these side by side; the animator can drop one anywhere. Numbers
 * are centred and dark; empty strings render a blank green hexagon. The optional
 * `highlight` draws an amber ring without changing the fill.
 */
export function HexTree({ rows, highlight }: HexTreeProps) {
  const nRows = rows.length // expected 3 (top, middle, bottom)
  const VIEW_W = TREE_W + 2 * PAD
  const VIEW_H = PYR_H + TRUNK_H + 2 * PAD

  const trunkTopY = PAD + PYR_H - 4 // tuck the trunk just under the bottom row
  const trunkCx = PAD + TREE_W / 2

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={Math.min(150, VIEW_W)} style={{ display: 'block' }}>
      {/* trunk — drawn first so the hexagons overlap its top */}
      <g fill={TRUNK_FILL} stroke={TRUNK_EDGE} strokeWidth={1.5} strokeLinejoin="round">
        {/* central stem */}
        <path
          d={`M ${trunkCx - 7} ${trunkTopY}
              L ${trunkCx + 7} ${trunkTopY}
              L ${trunkCx + 9} ${trunkTopY + TRUNK_H * 0.55}
              L ${trunkCx + 4} ${trunkTopY + TRUNK_H}
              L ${trunkCx - 4} ${trunkTopY + TRUNK_H}
              L ${trunkCx - 9} ${trunkTopY + TRUNK_H * 0.55} Z`}
        />
        {/* root flares left & right */}
        <path
          d={`M ${trunkCx - 6} ${trunkTopY + TRUNK_H * 0.7}
              Q ${trunkCx - 24} ${trunkTopY + TRUNK_H * 0.9} ${trunkCx - 30} ${trunkTopY + TRUNK_H + 2}
              Q ${trunkCx - 16} ${trunkTopY + TRUNK_H * 0.95} ${trunkCx - 3} ${trunkTopY + TRUNK_H} Z`}
        />
        <path
          d={`M ${trunkCx + 6} ${trunkTopY + TRUNK_H * 0.7}
              Q ${trunkCx + 24} ${trunkTopY + TRUNK_H * 0.9} ${trunkCx + 30} ${trunkTopY + TRUNK_H + 2}
              Q ${trunkCx + 16} ${trunkTopY + TRUNK_H * 0.95} ${trunkCx + 3} ${trunkTopY + TRUNK_H} Z`}
        />
      </g>

      {/* honeycomb hexagons */}
      {rows.map((rowArr, rIdx) => {
        const rowFromBottom = nRows - 1 - rIdx
        return rowArr.map((label, col) => {
          const { x, y } = hexCentre(rowFromBottom, col)
          const cx = PAD + x
          const cy = PAD + y
          const isHi = highlight != null && highlight[0] === rIdx && highlight[1] === col
          return (
            <g key={`h-${rIdx}-${col}`}>
              <polygon
                points={hexPoints(cx, cy)}
                fill={HEX_FILL}
                stroke={HEX_EDGE}
                strokeWidth={3}
                strokeLinejoin="round"
              />
              {label !== '' && (
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={22}
                  fontWeight={800}
                  className="fill-qupu-ink"
                  fontFamily="Nunito, sans-serif"
                >
                  {label}
                </text>
              )}
              {isHi && (
                <polygon
                  points={hexPoints(cx, cy)}
                  fill="none"
                  className="stroke-qupu-brand-orange"
                  strokeWidth={4}
                  strokeLinejoin="round"
                />
              )}
            </g>
          )
        })
      })}
    </svg>
  )
}

// ---- SAMPLE fallback --------------------------------------------------------

interface HexTreeParams {
  /** No dynamic params for this question; both trees are fixed. */
  _unused?: unknown
}

const SAMPLE: HexTreeParams = {}

const TREE1: string[][] = [['7'], ['3', '4'], ['2', '1', '3']]
const TREE2: string[][] = [['14'], ['', ''], ['5', '', '1']]

// ---- Default export: the static in-card figure ------------------------------

/**
 * HexTree22G1Illustration
 *
 * Draws BOTH trees side by side: Tree 1 fully filled (the worked example) and
 * Tree 2 with its three blanks EMPTY. It never reveals the solution digits
 * (9, 5, 4) — that is the animator's job (pass solved `rows` to <HexTree>).
 */
export default function HexTree22G1Illustration({ params }: { params: unknown }) {
  // params is unused (the puzzle is fixed) but narrowed defensively.
  void ((params ?? {}) as Partial<HexTreeParams> ?? SAMPLE)

  return (
    <div
      className="my-4 flex items-end justify-center"
      style={{ gap: TREE_GAP }}
      role="img"
      aria-label={
        'Dua pohon segi enam (sarang lebah di atas batang pohon coklat). Pada setiap pohon, ' +
        'tiap segi enam sama dengan jumlah dua segi enam tepat di bawahnya. ' +
        'Pohon pertama lengkap sebagai contoh: puncak 7; baris tengah 3 dan 4; baris bawah 2, 1, 3. ' +
        'Pohon kedua harus diselesaikan: puncak 14; baris tengah dua segi enam kosong; ' +
        'baris bawah 5, satu segi enam kosong, lalu 1. Cari angka pada segi enam yang kosong.'
      }
    >
      <HexTree rows={TREE1} />
      <HexTree rows={TREE2} />
    </div>
  )
}
