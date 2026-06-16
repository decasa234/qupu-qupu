// WMI-22P3A-Q5 (2022 Grade 3 Semifinal) — "compare three angles by eye".
//
// Recovered from db/seed/wmi/figures/2022-semifinal-g3-a-q5.jpg: three open
// angles drawn as two dark line segments meeting at a vertex, each tagged with a
// small italic number sitting inside the wedge:
//   ∠1 — a very narrow opening (the most pointed), on the left.
//   ∠2 — a medium opening, in the middle.
//   ∠3 — the widest opening, on the right.
// The learner orders them. Answer C: ∠3 > ∠2 > ∠1.
//
// The static figure shows ONLY the three angles + their labels; it never reveals
// the ordering nor which one wins. Pure render — no Math.random, no Date,
// SSR-safe & deterministic. A co-exported `AngleTrio` primitive lets the animator
// spotlight one angle (`highlight`) and surface its rough degree tag
// (`showValues`) post-answer; with the defaults it is the plain problem figure.

const INK = '#3A4A3A' // dark olive ink, matching the scan's pencil strokes
const ARM_W = 3.4 // angle-arm stroke thickness
const ARM_LEN = 84 // length of each angle arm

type Pt = [number, number]

// Each angle is described by its vertex, an opening (degrees), and the direction
// (degrees, measured CCW from the +x axis) its bisector points. The two arms are
// the bisector ± opening/2. This keeps every angle authored from one number, so
// "widest opening wins" is literally encoded in the data.
interface AngleSpec {
  id: 1 | 2 | 3
  vertex: Pt
  opening: number // the true opening in degrees
  bisectorDeg: number // direction the wedge points (0 = right, 90 = up on screen-y-down it's down)
}

// Geometry transcribed to match the scan: ∠1 opens to the right and is narrow,
// ∠2 a touch wider, ∠3 the widest. Bisectors fan so all three read clearly.
const ANGLES: AngleSpec[] = [
  { id: 1, vertex: [54, 150], opening: 30, bisectorDeg: -20 },
  { id: 2, vertex: [170, 158], opening: 55, bisectorDeg: -38 },
  { id: 3, vertex: [292, 162], opening: 78, bisectorDeg: -52 },
]

const VIEW_W = 380
const VIEW_H = 210

// Point at distance `len` from `vertex` in direction `deg` (CCW, screen y-down).
function ray(vertex: Pt, deg: number, len: number): Pt {
  const r = (deg * Math.PI) / 180
  return [vertex[0] + len * Math.cos(r), vertex[1] - len * Math.sin(r)]
}

// Small arc mark inside an angle wedge, from arm A to arm B at radius `r`.
function arcPath(vertex: Pt, degA: number, degB: number, r: number): string {
  const a = ray(vertex, degA, r)
  const b = ray(vertex, degB, r)
  // sweep flag 0 draws the short inner arc for this CCW-authored wedge (y-down)
  return `M ${a[0]} ${a[1]} A ${r} ${r} 0 0 0 ${b[0]} ${b[1]}`
}

export interface AngleTrioProps {
  /** Spotlight one angle (brighter, thicker arms + arc). */
  highlight?: 1 | 2 | 3 | null
  /** Surface each angle's rough degree tag (animator post-answer). */
  showValues?: boolean
}

/**
 * The three open angles with their "1", "2", "3" labels. With the defaults it is
 * the plain problem figure — no spotlight, no degree tags, no ordering shown.
 */
export function AngleTrio({ highlight = null, showValues = false }: AngleTrioProps = {}) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {ANGLES.map((a) => {
        const half = a.opening / 2
        const degTop = a.bisectorDeg + half
        const degBot = a.bisectorDeg - half
        const armTop = ray(a.vertex, degTop, ARM_LEN)
        const armBot = ray(a.vertex, degBot, ARM_LEN)
        const lit = highlight === a.id
        const armStroke = lit ? '#f0853a' : INK
        const armW = lit ? ARM_W + 1.4 : ARM_W
        // label sits along the bisector, a little way in from the vertex
        const labelPt = ray(a.vertex, a.bisectorDeg, 40)
        // degree tag sits a touch farther out along the bisector
        const tagPt = ray(a.vertex, a.bisectorDeg, 66)
        return (
          <g key={a.id}>
            {/* two arms */}
            <line
              x1={a.vertex[0]}
              y1={a.vertex[1]}
              x2={armTop[0]}
              y2={armTop[1]}
              stroke={armStroke}
              strokeWidth={armW}
              strokeLinecap="round"
            />
            <line
              x1={a.vertex[0]}
              y1={a.vertex[1]}
              x2={armBot[0]}
              y2={armBot[1]}
              stroke={armStroke}
              strokeWidth={armW}
              strokeLinecap="round"
            />
            {/* arc mark inside the wedge */}
            <path
              d={arcPath(a.vertex, degBot, degTop, 22)}
              fill="none"
              stroke={lit ? '#f0853a' : '#30598A'}
              strokeWidth={lit ? 3.2 : 2.2}
              strokeLinecap="round"
            />
            {/* numeric label */}
            <text
              x={labelPt[0]}
              y={labelPt[1]}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={22}
              fontStyle="italic"
              fontWeight={700}
              fill={INK}
            >
              {a.id}
            </text>
            {/* rough degree tag (animator only) */}
            {showValues && (
              <text
                x={tagPt[0]}
                y={tagPt[1]}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={14}
                fontWeight={800}
                fill={lit ? '#9A3412' : '#30598A'}
              >
                {`${a.opening}°`}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

const ARIA =
  'Tiga sudut terbuka diberi label 1, 2, dan 3. Sudut 1 bukaannya paling sempit, ' +
  'sudut 2 sedang, dan sudut 3 paling lebar. Urutkan ketiga sudut.'

/**
 * Default export: the plain three-angle problem figure — labels only, no
 * spotlight, no degree tags. Reveals neither the ordering nor the answer.
 */
export default function P22G3Q5Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <AngleTrio />
    </div>
  )
}
