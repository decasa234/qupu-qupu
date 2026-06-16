// Classroom compass-rose illustration for WMI-24F3A-Q3.
// Top-down floor plan: blackboard on the east wall, teacher facing west,
// student desks in the room. Compass rose shows N/S/E/W.
// NEVER reveals the answer (teacher's left = south).

// --- exported primitives (reusable by the animator / explainer) ---

/** Cardinal directions placed around the room */
export const COMPASS_LABELS = [
  { label: 'U', angle: -90 }, // Utara (North)
  { label: 'T', angle: 0 },   // Timur (East)
  { label: 'S', angle: 90 },  // Selatan (South)
  { label: 'B', angle: 180 }, // Barat (West)
] as const

/** Room dimensions in SVG units */
export const ROOM = { x: 60, y: 44, w: 200, h: 160 } as const

/** Blackboard is on the EAST wall */
export const BLACKBOARD = {
  x: ROOM.x + ROOM.w - 6,
  y: ROOM.y + 40,
  w: 10,
  h: 80,
} as const

/** Teacher position (center of room, slightly east of midpoint, facing west) */
export const TEACHER_POS = { cx: ROOM.x + ROOM.w * 0.65, cy: ROOM.y + ROOM.h / 2 } as const

/** Four student desk positions (2×2 grid in the western half) */
export const DESK_POSITIONS: Array<{ x: number; y: number }> = [
  { x: ROOM.x + 28, y: ROOM.y + 32 },
  { x: ROOM.x + 80, y: ROOM.y + 32 },
  { x: ROOM.x + 28, y: ROOM.y + 88 },
  { x: ROOM.x + 80, y: ROOM.y + 88 },
]

// --- main component ---

export default function Classroom24G3Illustration() {
  const W = 320
  const H = 260

  // Compass rose center (top-left corner area)
  const roseX = 28
  const roseY = 28
  const roseR = 20

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Denah kelas tampak atas: papan tulis di dinding timur, guru Sandra menghadap ke barat (ke arah siswa), empat meja siswa di bagian barat ruangan. Kompas menunjukkan arah utara, timur, selatan, barat."
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={Math.min(300, W)}
        aria-hidden="true"
      >
        {/* ---- room floor ---- */}
        <rect
          x={ROOM.x}
          y={ROOM.y}
          width={ROOM.w}
          height={ROOM.h}
          rx={4}
          className="fill-qupu-cream stroke-qupu-brand-blue"
          strokeWidth={2.5}
        />

        {/* ---- blackboard on east wall ---- */}
        <rect
          x={BLACKBOARD.x}
          y={BLACKBOARD.y}
          width={BLACKBOARD.w}
          height={BLACKBOARD.h}
          rx={2}
          className="fill-qupu-brand-blue"
        />
        {/* chalk lines on blackboard */}
        <line
          x1={BLACKBOARD.x + 2}
          y1={BLACKBOARD.y + 20}
          x2={BLACKBOARD.x + 8}
          y2={BLACKBOARD.y + 20}
          stroke="white"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <line
          x1={BLACKBOARD.x + 2}
          y1={BLACKBOARD.y + 30}
          x2={BLACKBOARD.x + 8}
          y2={BLACKBOARD.y + 30}
          stroke="white"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        {/* blackboard label */}
        <text
          x={BLACKBOARD.x + BLACKBOARD.w / 2}
          y={BLACKBOARD.y - 8}
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          className="fill-qupu-brand-blue"
        >
          Papan Tulis
        </text>
        {/* east wall label */}
        <text
          x={ROOM.x + ROOM.w + 12}
          y={ROOM.y + ROOM.h / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="10"
          fontWeight="700"
          className="fill-qupu-brand-orange"
        >
          T
        </text>

        {/* ---- student desks (4, drawn as small rectangles with chairs) ---- */}
        {DESK_POSITIONS.map((pos, i) => (
          <g key={i} transform={`translate(${pos.x}, ${pos.y})`}>
            {/* desk surface */}
            <rect
              x={-18}
              y={-10}
              width={36}
              height={24}
              rx={3}
              className="fill-qupu-peach stroke-qupu-brand-orange"
              strokeWidth={1.5}
            />
            {/* chair (drawn below desk, students face east toward teacher) */}
            <rect
              x={-10}
              y={-20}
              width={20}
              height={10}
              rx={3}
              className="fill-qupu-cream stroke-qupu-brand-orange"
              strokeWidth={1.2}
            />
          </g>
        ))}

        {/* ---- teacher figure (top-down, faces west = left in SVG) ---- */}
        {/* body circle */}
        <circle
          cx={TEACHER_POS.cx}
          cy={TEACHER_POS.cy}
          r={14}
          className="fill-qupu-peach stroke-qupu-brand-orange"
          strokeWidth={2}
        />
        {/* head (teacher faces west — triangle/arrow pointing left) */}
        <polygon
          points={`${TEACHER_POS.cx - 14},${TEACHER_POS.cy} ${TEACHER_POS.cx - 22},${TEACHER_POS.cy - 7} ${TEACHER_POS.cx - 22},${TEACHER_POS.cy + 7}`}
          className="fill-qupu-brand-orange"
        />
        {/* teacher label */}
        <text
          x={TEACHER_POS.cx}
          y={TEACHER_POS.cy + 28}
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          className="fill-qupu-brand-blue"
        >
          Bu Sandra
        </text>

        {/* ---- compass rose (top-left corner) ---- */}
        {/* outer circle */}
        <circle
          cx={roseX}
          cy={roseY}
          r={roseR}
          className="fill-qupu-cream stroke-qupu-brand-blue"
          strokeWidth={1.5}
        />
        {/* cardinal tick lines */}
        {[0, 90, 180, 270].map((deg) => {
          const rad = (deg * Math.PI) / 180
          const x1 = roseX + Math.cos(rad) * (roseR - 6)
          const y1 = roseY + Math.sin(rad) * (roseR - 6)
          const x2 = roseX + Math.cos(rad) * roseR
          const y2 = roseY + Math.sin(rad) * roseR
          return (
            <line
              key={deg}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className="stroke-qupu-brand-blue"
              strokeWidth={1.5}
            />
          )
        })}
        {/* north arrow (pointing up) */}
        <polygon
          points={`${roseX},${roseY - roseR + 4} ${roseX - 4},${roseY - 4} ${roseX + 4},${roseY - 4}`}
          className="fill-qupu-brand-orange"
        />
        <polygon
          points={`${roseX},${roseY + roseR - 4} ${roseX - 4},${roseY + 4} ${roseX + 4},${roseY + 4}`}
          className="fill-qupu-brand-blue"
        />
        {/* cardinal labels around rose */}
        <text x={roseX} y={roseY - roseR - 4} textAnchor="middle" fontSize="9" fontWeight="800" className="fill-qupu-brand-orange">U</text>
        <text x={roseX} y={roseY + roseR + 10} textAnchor="middle" fontSize="9" fontWeight="800" className="fill-qupu-brand-blue">S</text>
        <text x={roseX + roseR + 6} y={roseY + 3} textAnchor="middle" fontSize="9" fontWeight="800" className="fill-qupu-brand-blue">T</text>
        <text x={roseX - roseR - 6} y={roseY + 3} textAnchor="middle" fontSize="9" fontWeight="800" className="fill-qupu-brand-blue">B</text>

        {/* ---- wall labels (all four sides) ---- */}
        <text
          x={ROOM.x + ROOM.w / 2}
          y={ROOM.y - 10}
          textAnchor="middle"
          fontSize="9"
          fontWeight="600"
          className="fill-qupu-brand-blue"
        >
          Utara
        </text>
        <text
          x={ROOM.x + ROOM.w / 2}
          y={ROOM.y + ROOM.h + 16}
          textAnchor="middle"
          fontSize="9"
          fontWeight="600"
          className="fill-qupu-brand-blue"
        >
          Selatan
        </text>
        <text
          x={ROOM.x - 16}
          y={ROOM.y + ROOM.h / 2 + 3}
          textAnchor="middle"
          fontSize="9"
          fontWeight="600"
          className="fill-qupu-brand-blue"
        >
          B
        </text>
      </svg>
    </div>
  )
}
