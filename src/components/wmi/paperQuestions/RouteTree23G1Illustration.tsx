// WMI-23F1A-Q20 (Grade 1, 2023 Final, Paper A) — "Monkey route tree".
//
// Recovered from db/seed/wmi/figures/2023-final-g1-a-q20.jpg: a monkey sits in
// the CENTRE. Eight routes branch out — four to the LEFT (numbered 1-4, top to
// bottom) and four to the RIGHT (numbered 5-8, top to bottom). Every route runs
// monkey → an INTERMEDIATE food node (a "junction" that two routes share) → an
// ENDPOINT food in a numbered circle. So the tree is:
//
//                          (1) apple ─┐
//                                     ├─ [banana] ─┐
//                          (2) pine. ─┘            │
//                                                  ├─ MONKEY
//                          (3) grape ─┐            │           ┌─ [apple]  ─┬─ cherry (5)
//                                     ├─ [bluebry]─┘           │            └─ banana (6)
//                          (4) banana ┘                        ┴─ [banana] ─┬─ banana (7)
//                                                                           └─ wmelon (8)
//
//   Route | passes intermediate | ends at   | foods on the path
//   ------+---------------------+-----------+---------------------------
//     1   | banana              | apple     | banana, apple
//     2   | banana              | pineapple | banana, pineapple
//     3   | blueberry           | grapes    | blueberry, grapes
//     4   | blueberry           | banana    | blueberry, banana
//     5   | apple               | cherries  | apple, cherries
//     6   | apple               | banana    | apple, banana
//     7   | banana              | banana    | banana, banana
//     8   | banana              | watermelon| banana, watermelon
//
// The intended question: the monkey may eat BANANAS (🍌, the target) but must
// avoid APPLES (🍎, the forbidden food). "On how many of the 8 routes do you
// reach a banana WITHOUT passing an apple?"
//
//   Route 1: banana + apple   → has an apple  → NO
//   Route 2: banana, pineapple→ banana, no apple → YES
//   Route 3: blueberry, grapes→ no banana     → NO
//   Route 4: blueberry, banana→ banana, no apple → YES
//   Route 5: apple, cherries  → has an apple  → NO
//   Route 6: apple, banana    → has an apple  → NO
//   Route 7: banana, banana   → banana, no apple → YES
//   Route 8: banana, watermelon→ banana, no apple → YES
//
// → routes 2, 4, 7, 8 qualify = exactly 4 (the published answer).
//
// The static figure draws ONLY the tree (monkey + the two food badges per route).
// It never marks which routes qualify — that is the animator's job, via the
// co-exported <RouteTree> primitive (`litRoutes` traces a route per beat;
// `markGood` rings the four qualifying endpoints).

// ---- Food glyphs ------------------------------------------------------------
// Single-codepoint emoji only (verified [...e].length === 1), so SSR string
// shaping is byte-safe. Each route has a foods pair: [intermediate, endpoint].
const FOOD = {
  apple: '🍎',
  banana: '🍌',
  grapes: '🍇',
  cherries: '🍒',
  pineapple: '🍍',
  blueberry: '🫐',
  watermelon: '🍉',
  monkey: '🐵',
} as const

type FoodKey = keyof typeof FOOD

// Indonesian names for the aria-label.
const FOOD_ID: Record<FoodKey, string> = {
  apple: 'apel',
  banana: 'pisang',
  grapes: 'anggur',
  cherries: 'ceri',
  pineapple: 'nanas',
  blueberry: 'blueberry',
  watermelon: 'semangka',
  monkey: 'monyet',
}

// ---- The fixed tree ---------------------------------------------------------
// Each route: which side, its row (0 = top), the intermediate (junction) food,
// and the endpoint food. Junctions are SHARED: routes on the same side+pair of
// rows that name the same `via` draw a single merged junction node.
interface Route {
  n: number // 1..8 (the printed number)
  side: 'L' | 'R'
  row: number // 0 = top .. 3 = bottom (per side)
  via: FoodKey // intermediate food node
  end: FoodKey // endpoint food
}

const ROUTES: Route[] = [
  { n: 1, side: 'L', row: 0, via: 'banana', end: 'apple' },
  { n: 2, side: 'L', row: 1, via: 'banana', end: 'pineapple' },
  { n: 3, side: 'L', row: 2, via: 'blueberry', end: 'grapes' },
  { n: 4, side: 'L', row: 3, via: 'blueberry', end: 'banana' },
  { n: 5, side: 'R', row: 0, via: 'apple', end: 'cherries' },
  { n: 6, side: 'R', row: 1, via: 'apple', end: 'banana' },
  { n: 7, side: 'R', row: 2, via: 'banana', end: 'banana' },
  { n: 8, side: 'R', row: 3, via: 'banana', end: 'watermelon' },
]

// The target / forbidden foods for THIS question (kept here so the wording, the
// aria-label and the animator's `markGood` all agree).
const TARGET: FoodKey = 'banana'
const FORBID: FoodKey = 'apple'

/** Does route `r` reach the target without passing the forbidden food? */
function routeQualifies(r: Route): boolean {
  const foods = [r.via, r.end]
  return foods.includes(TARGET) && !foods.includes(FORBID)
}

// The four qualifying route numbers (computed, not hard-coded) — used by the
// primitive's `markGood` and asserted by the SSR smoke test = [2, 4, 7, 8].
export const QUALIFYING_ROUTES = ROUTES.filter(routeQualifies).map((r) => r.n)

// ---- Geometry ---------------------------------------------------------------
const PAD = 14 // headroom so circles/numbers never clip at the edges
const R_END = 26 // endpoint circle radius
const R_VIA = 22 // intermediate (junction) circle radius
const R_MONKEY = 30 // central monkey circle radius
const ROW_GAP = 70 // vertical centre-to-centre between rows
const COL_END_X = 56 // x of the endpoint column centre (from the side edge)
const COL_VIA_X = 200 // x of the junction column centre (from the side edge)
const PATH_W = 12 // grey route ribbon thickness

// Per-side layout: 4 endpoint rows. Junctions sit between their two member rows.
// Total content height = 4 rows worth of vertical span.
const CONTENT_H = 3 * ROW_GAP + 2 * R_END // top endpoint centre .. bottom endpoint centre + caps
const MID_Y = PAD + CONTENT_H / 2 // vertical centre (monkey row)

// Overall width: [left endpoints][left junctions][monkey][right junctions][right endpoints]
const HALF_W = COL_VIA_X + 60 // out to just past the junction column
const WIDTH = PAD * 2 + HALF_W * 2 // mirrored around the monkey
const HEIGHT = PAD * 2 + CONTENT_H

const CX = WIDTH / 2 // monkey centre x

// Endpoint y for a given row (0 top .. 3 bottom).
function endpointY(row: number): number {
  return PAD + R_END + row * ROW_GAP
}

// Endpoint centre for a route.
function endpointXY(r: Route) {
  const y = endpointY(r.row)
  const x = r.side === 'L' ? PAD + COL_END_X : WIDTH - (PAD + COL_END_X)
  return { x, y }
}

// Junction centre: midway (in y) between its two member rows, on the via column.
// Junctions span rows {0,1} (upper) and {2,3} (lower) on each side.
function junctionXY(side: 'L' | 'R', upper: boolean) {
  const y = upper ? (endpointY(0) + endpointY(1)) / 2 : (endpointY(2) + endpointY(3)) / 2
  const x = side === 'L' ? PAD + COL_VIA_X : WIDTH - (PAD + COL_VIA_X)
  return { x, y }
}

function junctionFor(r: Route) {
  return junctionXY(r.side, r.row <= 1)
}

// One de-duplicated junction record per (side, upper) group.
interface Junction {
  side: 'L' | 'R'
  upper: boolean
  food: FoodKey
}
const JUNCTIONS: Junction[] = [
  { side: 'L', upper: true, food: 'banana' },
  { side: 'L', upper: false, food: 'blueberry' },
  { side: 'R', upper: true, food: 'apple' },
  { side: 'R', upper: false, food: 'banana' },
]

// ---- Path builder -----------------------------------------------------------
// A route ribbon is a stepped (orthogonal) path: endpoint → junction → monkey.
// We draw it as a fat grey stroke with rounded joins. The endpoint→junction leg
// is the "outer" segment; the junction→monkey leg is shared visually but each
// route still draws its own so a single lit route shows the full monkey-to-fruit
// trace.
function routePath(r: Route): string {
  const e = endpointXY(r)
  const j = junctionFor(r)
  const mx = CX + (r.side === 'L' ? -R_MONKEY : R_MONKEY)
  const my = MID_Y
  // endpoint → (horizontal toward junction x) → (vertical to junction y) → junction
  // → (horizontal toward monkey) → (vertical to monkey y) → monkey edge.
  return [
    `M ${e.x} ${e.y}`,
    `L ${j.x} ${e.y}`,
    `L ${j.x} ${j.y}`,
    `L ${(j.x + mx) / 2} ${j.y}`,
    `L ${(j.x + mx) / 2} ${my}`,
    `L ${mx} ${my}`,
  ].join(' ')
}

// ---- Colours ----------------------------------------------------------------
// The grey route ribbons match the scan; qupu has no grey token, so a raw hex is
// used (conventions explicitly allow raw hex here). The lit-route highlight and
// the "good" rings reuse qupu brand tokens via className.
const PATH_GREY = '#A8AAB0'
const PATH_GREY_LIT = '#5B6470'

// ---- Primitive: RouteTree ---------------------------------------------------

export interface RouteTreeProps {
  /** Route numbers (1..8) to draw "lit" (darker ribbon) — the animator traces one per beat. */
  litRoutes?: number[]
  /** When true, ring the endpoints of the qualifying routes (2,4,7,8) in brand orange. */
  markGood?: boolean
}

/**
 * RouteTree — the monkey route diagram as a bare, self-contained <svg>.
 *
 * Default usage draws nothing lit (the static question figure). The animator
 * passes `litRoutes` to highlight individual monkey→fruit traces beat by beat,
 * and `markGood` to ring the four routes that reach a banana without an apple.
 */
export function RouteTree({ litRoutes, markGood }: RouteTreeProps) {
  const lit = new Set(litRoutes ?? [])

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={Math.min(360, WIDTH)}
      style={{ display: 'block' }}
    >
      {/* --- route ribbons (drawn first, behind the nodes) --- */}
      {/* unlit ribbons */}
      {ROUTES.map((r) => (
        <path
          key={`p-${r.n}`}
          d={routePath(r)}
          fill="none"
          stroke={lit.has(r.n) ? PATH_GREY_LIT : PATH_GREY}
          strokeWidth={PATH_W}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}

      {/* --- central monkey --- */}
      <g>
        <circle
          cx={CX}
          cy={MID_Y}
          r={R_MONKEY}
          className="fill-qupu-cream stroke-qupu-ink"
          strokeWidth={2}
        />
        <text
          x={CX}
          y={MID_Y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={34}
        >
          {FOOD.monkey}
        </text>
      </g>

      {/* --- junction (intermediate) food nodes --- */}
      {JUNCTIONS.map((jc, i) => {
        const { x, y } = junctionXY(jc.side, jc.upper)
        return (
          <g key={`j-${i}`}>
            <circle
              cx={x}
              cy={y}
              r={R_VIA}
              className="fill-white stroke-qupu-ink"
              strokeWidth={2}
            />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={26}>
              {FOOD[jc.food]}
            </text>
          </g>
        )
      })}

      {/* --- endpoint food nodes + printed numbers --- */}
      {ROUTES.map((r) => {
        const { x, y } = endpointXY(r)
        const isGood = markGood === true && routeQualifies(r)
        // The number label sits on the OUTER side of each endpoint circle.
        const numX = r.side === 'L' ? x - R_END - 12 : x + R_END + 12
        return (
          <g key={`e-${r.n}`}>
            <circle
              cx={x}
              cy={y}
              r={R_END}
              className="fill-white stroke-qupu-ink"
              strokeWidth={2}
            />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={30}>
              {FOOD[r.end]}
            </text>
            {/* qualifying-route ring — only when markGood (post-answer, animator) */}
            {isGood && (
              <circle
                cx={x}
                cy={y}
                r={R_END + 4}
                fill="none"
                className="stroke-qupu-brand-orange"
                strokeWidth={4}
              />
            )}
            <text
              x={numX}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={24}
              fontWeight={800}
              className="fill-qupu-ink"
              fontFamily="Nunito, sans-serif"
            >
              {r.n}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ---- SAMPLE fallback --------------------------------------------------------

interface RouteTreeParams {
  /** No dynamic params — the tree is fixed for this question. */
  _unused?: unknown
}

const SAMPLE: RouteTreeParams = {}

// ---- Default export: the static in-card figure ------------------------------

/**
 * RouteTree23G1Illustration
 *
 * Draws the bare monkey route tree (eight numbered routes, each via a junction
 * food to an endpoint food). It never reveals which routes qualify — no rings,
 * nothing lit. Finding the four banana-without-apple routes is left to the
 * solver (and to the animator, which passes litRoutes / markGood to <RouteTree>).
 */
export default function RouteTree23G1Illustration({ params }: { params: unknown }) {
  // params is unused (the puzzle is fixed) but narrowed defensively.
  void ((params ?? {}) as Partial<RouteTreeParams> ?? SAMPLE)

  // Build a route-by-route description for the aria-label, in Indonesian.
  const routeDesc = ROUTES.map(
    (r) => `rute ${r.n} lewat ${FOOD_ID[r.via]} ke ${FOOD_ID[r.end]}`,
  ).join('; ')

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        `Diagram rute monyet: seekor ${FOOD_ID.monkey} di tengah dengan 8 rute bercabang ` +
        `(nomor 1 sampai 4 di kiri, 5 sampai 8 di kanan). Setiap rute melewati satu buah ` +
        `persimpangan lalu berakhir di satu buah. ${routeDesc}. ` +
        `Monyet boleh makan ${FOOD_ID[TARGET]} tetapi harus menghindari ${FOOD_ID[FORBID]}. ` +
        `Cari pada berapa rute kamu sampai ke ${FOOD_ID[TARGET]} tanpa melewati ${FOOD_ID[FORBID]}.`
      }
    >
      <RouteTree />
    </div>
  )
}
