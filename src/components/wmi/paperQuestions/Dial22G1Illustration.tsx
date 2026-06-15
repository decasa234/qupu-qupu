/**
 * WMI-22F1A-Q21 (Grade 1) — password-dial question figure.
 *
 * A round password dial carries ten numbers around its rim. Going CLOCKWISE
 * from the top the numbers are [0, 3, 1, 9, 2, 7, 6, 4, 8, 5]. A red pointer
 * starts at the top (number 0). A sequence of five turns is applied — a blue
 * arrow turns it clockwise, a green arrow turns it counter-clockwise — and the
 * number under the pointer after each turn spells the password.
 *
 * The default export draws ONLY the problem: the dial with the pointer parked
 * at 0, plus the five labelled turn arrows. It never reveals the readings
 * (9, 3, 1, 2, 8) or the password (93128) — that is the animator's job.
 *
 * `PasswordDial` is the reusable primitive the animator drives: it aims the red
 * pointer at any clockwise slot index (0 = top/number 0 … 9 = number 5).
 *
 * Pure render — no random, no dates, SSR-safe and deterministic.
 */

// Semantic colours the problem itself names. RED = pointer, GREEN = the
// counter-clockwise turn arrow. The clockwise arrow uses the qupu blue token.
const RED = '#EF4444'
const GREEN = '#10B981'

/** Clockwise number layout starting from the top of the dial. */
const NUMBERS = [0, 3, 1, 9, 2, 7, 6, 4, 8, 5] as const
const SLOTS = NUMBERS.length

/** The printed turn sequence: amount + direction. `cw` = blue clockwise. */
const TURNS: { amount: number; cw: boolean }[] = [
  { amount: 3, cw: true },
  { amount: 2, cw: false },
  { amount: 1, cw: true },
  { amount: 2, cw: true },
  { amount: 6, cw: false },
]

// --- dial geometry ---------------------------------------------------------
const DIAL = 150 // viewBox is DIAL x DIAL for the dial primitive
const CX = DIAL / 2
const CY = DIAL / 2
const R_DECAGON = 56 // vertex radius of the decagon rim
const R_NUMBER = 70 // radius the numbers sit at (outside the rim)
const R_TICK_IN = 12 // tick segments fan out from near the hub

/** Point on a circle for a slot index, measured clockwise from the top. */
function slotPoint(index: number, radius: number): { x: number; y: number } {
  // -90° puts slot 0 at the top; +clockwise as index grows.
  const deg = -90 + (360 / SLOTS) * index
  const rad = (deg * Math.PI) / 180
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) }
}

/**
 * The dial face with the red pointer aimed at clockwise slot `pointerIndex`.
 * Reused by the animator to step through the turns. Does not print readings.
 */
export function PasswordDial({ pointerIndex = 0 }: { pointerIndex?: number }) {
  const idx = Number.isInteger(pointerIndex) ? ((pointerIndex % SLOTS) + SLOTS) % SLOTS : 0
  const pointerAngle = -90 + (360 / SLOTS) * idx

  // Decagon outline — vertices sit halfway between the number slots so each
  // number is centred on a flat edge (matching the printed figure).
  const vertices = Array.from({ length: SLOTS }, (_, i) => slotPoint(i + 0.5, R_DECAGON))
  const polyPoints = vertices.map((v) => `${v.x.toFixed(2)},${v.y.toFixed(2)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${DIAL} ${DIAL}`} width={DIAL} height={DIAL} aria-hidden="true" style={{ overflow: 'visible' }}>
      {/* decagon rim */}
      <polygon points={polyPoints} className="fill-qupu-shell stroke-qupu-brand-blue" strokeWidth={2.5} strokeLinejoin="round" />

      {/* alternating wedges from the hub to each rim edge */}
      {Array.from({ length: SLOTS }, (_, i) => {
        const a = vertices[i]
        const b = vertices[(i + 1) % SLOTS]
        return (
          <polygon
            key={`wedge-${i}`}
            points={`${CX},${CY} ${a.x.toFixed(2)},${a.y.toFixed(2)} ${b.x.toFixed(2)},${b.y.toFixed(2)}`}
            className={i % 2 === 0 ? 'fill-qupu-cream' : 'fill-qupu-shell'}
            stroke="currentColor"
            strokeWidth={1}
            style={{ color: '#caa57a' }}
          />
        )
      })}

      {/* tick segments pointing at each number slot */}
      {Array.from({ length: SLOTS }, (_, i) => {
        const inner = slotPoint(i, R_TICK_IN)
        const outer = slotPoint(i, R_DECAGON - 2)
        return (
          <line
            key={`tick-${i}`}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            className="stroke-qupu-brand-blue"
            strokeWidth={1.2}
            opacity={0.55}
          />
        )
      })}

      {/* the ten numbers around the rim */}
      {NUMBERS.map((n, i) => {
        const p = slotPoint(i, R_NUMBER)
        return (
          <text
            key={`num-${i}`}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={15}
            fontWeight="bold"
            className="fill-qupu-brand-blue-shadow"
          >
            {n}
          </text>
        )
      })}

      {/* red pointer — a slim triangle from the hub to the aimed slot */}
      <g transform={`rotate(${pointerAngle} ${CX} ${CY})`}>
        <polygon
          points={`${CX - 5},${CY} ${CX + 5},${CY} ${CX},${CY - (R_DECAGON - 8)}`}
          fill={RED}
          stroke={RED}
          strokeWidth={1}
          strokeLinejoin="round"
        />
      </g>

      {/* hub ring sits on top of the pointer base */}
      <circle cx={CX} cy={CY} r={9} fill="white" stroke={RED} strokeWidth={4} />
    </svg>
  )
}

/** A single labelled turn arrow: blue curved arrow = CW, green = CCW. */
function TurnArrow({ amount, cw }: { amount: number; cw: boolean }) {
  // Each arrow lives in a 56 x 70 cell (arc on top, number below).
  const W = 56
  const ax = W / 2
  const ay = 26
  const r = 16
  const color = cw ? '#30598A' : GREEN // blue token hex for CW, green for CCW

  // A near-full circular arc with a gap; arrowhead at the gap. Mirror the sweep
  // for CW vs CCW so the head visibly points the right way around the loop.
  const start = cw ? 60 : 120
  const end = cw ? -210 : 210
  const toRad = (d: number) => (d * Math.PI) / 180
  const sx = ax + r * Math.cos(toRad(start))
  const sy = ay - r * Math.sin(toRad(start))
  const ex = ax + r * Math.cos(toRad(end))
  const ey = ay - r * Math.sin(toRad(end))
  const sweepFlag = cw ? 1 : 0 // SVG y is down, so CW visually = sweep 1
  const arcPath = `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 1 ${sweepFlag} ${ex.toFixed(2)} ${ey.toFixed(2)}`

  // Arrowhead: a small triangle near the start point, tangent to the circle.
  const tangent = cw ? start - 90 : start + 90
  const hx = sx
  const hy = sy
  const head = (offsetDeg: number, len: number) => {
    const d = toRad(tangent + offsetDeg)
    return { x: hx + len * Math.cos(d), y: hy - len * Math.sin(d) }
  }
  const h1 = head(150, 9)
  const h2 = head(-150, 9)

  return (
    <svg viewBox={`0 0 ${W} 70`} width={W} height={70} aria-hidden="true" style={{ overflow: 'visible' }}>
      <path d={arcPath} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" />
      <polygon
        points={`${hx.toFixed(2)},${hy.toFixed(2)} ${h1.x.toFixed(2)},${h1.y.toFixed(2)} ${h2.x.toFixed(2)},${h2.y.toFixed(2)}`}
        fill={color}
      />
      <text x={ax} y={58} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight="bold" fill={color}>
        {amount}
      </text>
    </svg>
  )
}

export default function Dial22G1Illustration() {
  const turnAria = TURNS.map((t) => `${t.amount} ${t.cw ? 'searah jarum jam' : 'berlawanan arah jarum jam'}`).join(', ')

  return (
    <div
      className="my-4 flex flex-col items-center justify-center gap-3"
      role="img"
      aria-label={`Kunci putar bersandi dengan sepuluh angka mengelilingi tepinya. Searah jarum jam dari atas: 0, 3, 1, 9, 2, 7, 6, 4, 8, 5. Penunjuk merah mulai di angka 0. Urutan putaran: ${turnAria}. Panah biru memutar searah jarum jam, panah hijau berlawanan arah jarum jam. Bacalah angka yang ditunjuk setelah setiap putaran.`}
    >
      <PasswordDial pointerIndex={0} />

      {/* the five labelled turn arrows, left to right */}
      <div className="flex items-end justify-center gap-1">
        {TURNS.map((t, i) => (
          <TurnArrow key={i} amount={t.amount} cw={t.cw} />
        ))}
      </div>
    </div>
  )
}
