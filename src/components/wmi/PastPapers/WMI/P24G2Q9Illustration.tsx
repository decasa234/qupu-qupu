// WMI-24P2A-Q9 (2024 Grade 2 Semifinal, Paper A) — Jimmy and Nancy face to face.
//
// READING THE STEM (figure 2024-semifinal-g2-a-q9.jpg shows two cartoon kids,
// Jimmy on the left and Nancy on the right, looking AT each other): "Jimmy and
// Nancy stand face to face. If Jimmy's back faces north, which direction is
// Nancy's LEFT?"
//
// SOLVE:
//   - Jimmy's BACK faces north  => Jimmy FACES south.
//   - Nancy is face to face with Jimmy, so Nancy FACES north.
//   - When you face north, your LEFT hand points WEST.
//   So Nancy's left is WEST -> answer B.
//
// We draw the cleanest possible top-down diagram of the problem: a compass and
// two people shown as discs with a "nose" arrow giving the way each one FACES.
// Jimmy (left) faces right toward Nancy; Nancy (right) faces left toward Jimmy.
// The only given fact — Jimmy's BACK points NORTH — is shown as a small "back"
// arrow behind Jimmy. The figure shows ONLY the setup: it never draws Nancy's
// left arrow and never labels a compass direction as the answer. Revealing
// Nancy's facing + her left hand is the animator's job, via the co-exported
// primitive `FaceOff24G2`.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const INK = '#1F2937'
const BLUE = '#30598A'
const SKIN = '#F6C99A'
const GREEN = '#10B981'
const ORANGE = '#f0853a' // reveal accent (animator only)
const LABEL = '#1E3A5F'

// ---- layout (square viewport, compass-style) -------------------------------
const VIEW = 280
const CX = VIEW / 2
const CY = VIEW / 2 + 6
const COMPASS_R = 120 // outer guide circle radius
const HEAD_R = 26
const PERSON_DX = 64 // half-distance between the two heads
const ARROW = 30 // facing-arrow length out of a head

export const FACEOFF_GEOM = { VIEW, CX, CY, HEAD_R, PERSON_DX, ARROW } as const

/** Jimmy's centre (left) and Nancy's centre (right). */
export const JIMMY_C = { x: CX - PERSON_DX, y: CY }
export const NANCY_C = { x: CX + PERSON_DX, y: CY }

/** A short arrow from (x,y) in screen-direction (dx,dy is a unit-ish vector). */
function DirArrow({
  x,
  y,
  dx,
  dy,
  len,
  color,
  width = 4,
  dashed = false,
}: {
  x: number
  y: number
  dx: number
  dy: number
  len: number
  color: string
  width?: number
  dashed?: boolean
}) {
  const ex = x + dx * len
  const ey = y + dy * len
  // perpendicular for the arrowhead wings
  const px = -dy
  const py = dx
  const head = 8
  return (
    <g>
      <line
        x1={x}
        y1={y}
        x2={ex}
        y2={ey}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dashed ? '5 4' : undefined}
      />
      <polygon
        points={`${ex + dx * head},${ey + dy * head} ${ex + px * head * 0.7},${ey + py * head * 0.7} ${ex - px * head * 0.7},${ey - py * head * 0.7}`}
        fill={color}
      />
    </g>
  )
}

/** A person seen from above: a head disc with a tiny nose at the FACING side. */
function PersonHead({ x, y, faceDx, name, accent }: { x: number; y: number; faceDx: number; name: string; accent: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={HEAD_R} fill={SKIN} stroke={accent} strokeWidth={2.5} />
      {/* hair cap on the BACK side (opposite to facing) */}
      <path
        d={`M ${x - faceDx * HEAD_R} ${y - HEAD_R} A ${HEAD_R} ${HEAD_R} 0 0 ${faceDx > 0 ? 0 : 1} ${x - faceDx * HEAD_R} ${y + HEAD_R} Z`}
        fill="#5b4636"
        opacity={0.85}
      />
      {/* nose marking the facing side */}
      <circle cx={x + faceDx * (HEAD_R - 4)} cy={y} r={4} fill={INK} />
      {/* name label below */}
      <text x={x} y={y + HEAD_R + 16} textAnchor="middle" fontSize={14} fontStyle="italic" fontWeight={700} fill={LABEL} className="font-display">
        {name}
      </text>
    </g>
  )
}

export interface FaceOff24G2Props {
  /** Animator beat: draw Jimmy's facing arrow (south). */
  showJimmyFace?: boolean
  /** Animator beat: draw Nancy's facing arrow (north). */
  showNancyFace?: boolean
  /** Animator beat: draw Nancy's LEFT-hand arrow (the answer direction, west). */
  showNancyLeft?: boolean
}

/**
 * Top-down face-off diagram. With no props it shows only the GIVEN setup:
 * the compass, the two heads facing each other, and Jimmy's "back -> North"
 * arrow. Nothing about the answer (Nancy's facing / left) is drawn.
 */
export function FaceOff24G2({ showJimmyFace = false, showNancyFace = false, showNancyLeft = false }: FaceOff24G2Props = {}) {
  // Compass labels: N up, E right, S down, W left.
  const labels = [
    { t: 'N', x: CX, y: CY - COMPASS_R - 2 },
    { t: 'E', x: CX + COMPASS_R + 8, y: CY + 4 },
    { t: 'S', x: CX, y: CY + COMPASS_R + 14 },
    { t: 'W', x: CX - COMPASS_R - 8, y: CY + 4 },
  ]

  return (
    <svg viewBox={`0 0 ${VIEW} ${VIEW + 8}`} width="100%" style={{ maxWidth: 320, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {/* faint compass guide circle + cross */}
      <circle cx={CX} cy={CY} r={COMPASS_R} fill="none" stroke={BLUE} strokeWidth={1} opacity={0.25} />
      <line x1={CX} y1={CY - COMPASS_R} x2={CX} y2={CY + COMPASS_R} stroke={BLUE} strokeWidth={1} opacity={0.2} />
      <line x1={CX - COMPASS_R} y1={CY} x2={CX + COMPASS_R} y2={CY} stroke={BLUE} strokeWidth={1} opacity={0.2} />
      {labels.map((l) => (
        <text key={l.t} x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle" fontSize={15} fontWeight={800} fill={LABEL} className="font-display">
          {l.t}
        </text>
      ))}

      {/* GIVEN: Jimmy's BACK points North (up) — a dashed arrow off his back. */}
      <DirArrow x={JIMMY_C.x} y={JIMMY_C.y - HEAD_R} dx={0} dy={-1} len={ARROW} color={INK} width={3} dashed />
      <text x={JIMMY_C.x - 4} y={JIMMY_C.y - HEAD_R - ARROW - 8} textAnchor="middle" fontSize={11} fontWeight={700} fill={INK} className="font-display">
        back
      </text>

      {/* the two people, facing each other (Jimmy faces right, Nancy faces left) */}
      <PersonHead x={JIMMY_C.x} y={JIMMY_C.y} faceDx={1} name="Jimmy" accent={showJimmyFace ? ORANGE : BLUE} />
      <PersonHead x={NANCY_C.x} y={NANCY_C.y} faceDx={-1} name="Nancy" accent={showNancyFace || showNancyLeft ? ORANGE : BLUE} />

      {/* animator: Jimmy faces South (down) */}
      {showJimmyFace && <DirArrow x={JIMMY_C.x} y={JIMMY_C.y + HEAD_R} dx={0} dy={1} len={ARROW} color={ORANGE} />}

      {/* animator: Nancy faces North (up) */}
      {showNancyFace && <DirArrow x={NANCY_C.x} y={NANCY_C.y - HEAD_R} dx={0} dy={-1} len={ARROW} color={ORANGE} />}

      {/* animator: Nancy's LEFT hand points West (left) — the answer */}
      {showNancyLeft && (
        <>
          <DirArrow x={NANCY_C.x - HEAD_R} y={NANCY_C.y} dx={-1} dy={0} len={ARROW + 6} color={GREEN} width={5} />
          <text x={NANCY_C.x - HEAD_R - ARROW - 12} y={NANCY_C.y - 10} textAnchor="middle" fontSize={11} fontWeight={800} fill={GREEN} className="font-display">
            left
          </text>
        </>
      )}
    </svg>
  )
}

/** Default export — the bare face-off setup (only the given fact shown). */
export default function P24G2Q9Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Top-down view: Jimmy on the left and Nancy on the right face each other. A compass shows North up, East right, South down, West left. A dashed arrow off Jimmy's back points North. Which direction is Nancy's left?"
    >
      <FaceOff24G2 />
    </div>
  )
}
