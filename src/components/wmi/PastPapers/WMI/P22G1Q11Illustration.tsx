// WMI-22P1A-Q11 (2022 Semifinal Grade 1 Paper A) — "Colour each region of the
// figure by its value: dark if the expression is greater than 8, grey if less
// than 8, white if it equals 8. Which option shows the correct colouring?"
// Answer: C.
//
// Faithful redraw of db/seed/wmi/figures/2022-semifinal-g1-a-q11.jpg: a
// cat/house silhouette built from 9 labelled regions, each holding one
// expression:
//   left roof triangle   12 - 6
//   right roof triangle  4 + 3
//   left oval eye        6 + 2
//   right oval eye       8 - 1
//   big body square      14 - 7
//   lower-left leg rect  16 - 8
//   bottom small rect    11 + 5
//   tilted rect (right)  5 + 7
//   circle (top-right)   8
//
// VALUES vs 8 (throwaway — NEVER coloured on the static figure):
//   12-6=6 grey, 4+3=7 grey, 6+2=8 WHITE, 8-1=7 grey, 14-7=7 grey,
//   16-8=8 WHITE, 11+5=16 DARK, 8=8 WHITE, 5+7=12 DARK.
//
// The static figure draws ONLY the outlines + expressions — no colouring, no
// answer. The animator colours each region via the co-exported HouseFigure22
// primitive (coloured / revealed props).
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

export type RegionShape = 'triangle' | 'ellipse' | 'rect' | 'circle'
export type RegionTone = 'dark' | 'grey' | 'white'

export interface Region {
  id: string
  shape: RegionShape
  /** SVG fragment describing the outline; geometry is fixed in viewBox units. */
  expr: string
  value: number
  /** Where to anchor the expression text. */
  tx: number
  ty: number
}

/** value -> tone, exactly the question's rule. */
export function toneOf(value: number): RegionTone {
  if (value > 8) return 'dark'
  if (value < 8) return 'grey'
  return 'white'
}

/** The 9 regions, in reading order. Single source of truth. */
export const REGIONS: readonly Region[] = [
  { id: 'roofL', shape: 'triangle', expr: '12 − 6', value: 6, tx: 92, ty: 96 },
  { id: 'roofR', shape: 'triangle', expr: '4 + 3', value: 7, tx: 218, ty: 96 },
  { id: 'eyeL', shape: 'ellipse', expr: '6 + 2', value: 8, tx: 100, ty: 168 },
  { id: 'eyeR', shape: 'ellipse', expr: '8 − 1', value: 7, tx: 222, ty: 168 },
  { id: 'body', shape: 'rect', expr: '14 − 7', value: 7, tx: 160, ty: 232 },
  { id: 'leg', shape: 'rect', expr: '16 − 8', value: 8, tx: 158, ty: 332 },
  { id: 'foot', shape: 'rect', expr: '11 + 5', value: 16, tx: 262, ty: 384 },
  { id: 'tile', shape: 'rect', expr: '5 + 7', value: 12, tx: 392, ty: 352 },
  { id: 'circ', shape: 'circle', expr: '8', value: 8, tx: 416, ty: 248 },
] as const

// ---- colours ---------------------------------------------------------------
const INK = '#2B2622' // outlines (matches scan's black ink)
const DARK_FILL = '#4b4b4b' // "greater than 8" — dark
const GREY_FILL = '#c4c4c4' // "less than 8" — grey
const WHITE_FILL = '#ffffff' // "equals 8" — white
const PENDING = '#ffffff' // un-coloured (problem state)
const HILITE = '#f0853a' // qupu brand orange (the region being examined)

const TONE_FILL: Record<RegionTone, string> = {
  dark: DARK_FILL,
  grey: GREY_FILL,
  white: WHITE_FILL,
}

/** Outline geometry for each region id, in a 470 x 430 viewBox. */
function regionPath(id: string): React.ReactElement {
  switch (id) {
    case 'roofL':
      return <polygon points="32,116 92,30 152,116" />
    case 'roofR':
      return <polygon points="158,116 218,30 278,116" />
    case 'body':
      return <rect x={32} y={116} width={246} height={150} />
    case 'eyeL':
      return <ellipse cx={100} cy={168} rx={48} ry={22} />
    case 'eyeR':
      return <ellipse cx={222} cy={168} rx={48} ry={22} />
    case 'leg':
      return <rect x={104} y={266} width={108} height={132} />
    case 'foot':
      return <rect x={212} y={356} width={108} height={42} />
    case 'tile':
      // tilted rectangle to the right
      return <rect x={342} y={324} width={104} height={42} transform="rotate(-20 394 345)" />
    case 'circ':
      return <circle cx={416} cy={248} r={30} />
    default:
      return <rect x={0} y={0} width={1} height={1} />
  }
}

export interface HouseFigure22Props {
  /** When true, fill each region with its tone colour (answer reveal). */
  coloured?: boolean
  /** Region ids already revealed; only these get tone fill when `coloured`. */
  revealed?: ReadonlySet<string> | null
  /** Region id currently under examination — gets an orange outline ring. */
  active?: string | null
  /** Show the expression text inside each region. */
  showExpr?: boolean
}

/**
 * The cat/house figure. By default (problem state) it draws outlines +
 * expressions only. With `coloured`, the revealed regions take their tone fill.
 */
export function HouseFigure22({ coloured = false, revealed = null, active = null, showExpr = true }: HouseFigure22Props = {}) {
  const fillFor = (rgn: Region): string => {
    if (!coloured) return PENDING
    if (revealed && !revealed.has(rgn.id)) return PENDING
    return TONE_FILL[toneOf(rgn.value)]
  }

  // Eyes sit ON TOP of the body, so draw the body first then eyes.
  const order = ['body', 'roofL', 'roofR', 'leg', 'foot', 'tile', 'circ', 'eyeL', 'eyeR']
  const byId = (id: string) => REGIONS.find((r) => r.id === id)!

  return (
    <svg viewBox="0 0 470 430" width="100%" style={{ maxWidth: 470, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {order.map((id) => {
        const rgn = byId(id)
        const isActive = active === id
        // dark regions need light text; grey/white/pending need dark text.
        const filled = fillFor(rgn)
        const textFill = filled === DARK_FILL ? '#FFFFFF' : INK
        return (
          <g key={id}>
            <g fill={filled} stroke={isActive ? HILITE : INK} strokeWidth={isActive ? 4 : 2} strokeLinejoin="round">
              {regionPath(id)}
            </g>
            {showExpr && (
              <text
                x={rgn.tx}
                y={rgn.ty}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={id === 'foot' || id === 'tile' || id === 'circ' || id === 'eyeL' || id === 'eyeR' ? 18 : 22}
                fontWeight="bold"
                fill={textFill}
              >
                {rgn.expr}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function P22G1Q11Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A cat-shaped figure made of 9 regions, each labelled with an expression: two roof triangles (12 minus 6, 4 plus 3), two oval eyes (6 plus 2, 8 minus 1), a body square (14 minus 7), a leg rectangle (16 minus 8), a bottom rectangle (11 plus 5), a tilted rectangle (5 plus 7), and a circle (8). Colour each region by comparing its value to 8."
    >
      <HouseFigure22 />
    </div>
  )
}
