// WMI-23P2A-Q5 (2023 Semifinal Grade 2, Paper A) — fill-order of four containers.
//
// Figure (db/seed/wmi/figures/2023-semifinal-g2-a-q5.jpg): an open-topped tank
// drawn with two black side walls + a base, partly filled with blue water. The
// paper shows four such tanks A, B, C, D of different sizes; water is poured into
// all four at the SAME rate at the SAME time — find the order they become full.
//
// The smaller the capacity, the sooner it fills. Capacities below (width × height
// of each open tank) are strictly B < A < C < D, so the fill order is B, A, C, D.
// Answer D ("BACD").
export interface Tank {
  id: 'A' | 'B' | 'C' | 'D'
  w: number
  h: number
  /** capacity ∝ w × h (equal-rate pour ⇒ fill time ∝ capacity) */
  cap: number
}

// Tank footprints (px). Capacity = w*h. Strictly increasing B < A < C < D.
const RAW: Array<Omit<Tank, 'cap'>> = [
  { id: 'A', w: 64, h: 96 },
  { id: 'B', w: 52, h: 72 },
  { id: 'C', w: 84, h: 104 },
  { id: 'D', w: 98, h: 124 },
]
export const TANKS: Tank[] = RAW.map((t) => ({ ...t, cap: t.w * t.h }))
/** Tanks ordered by who fills first (smallest capacity first): B, A, C, D. */
export const FILL_ORDER = [...TANKS].sort((a, b) => a.cap - b.cap).map((t) => t.id)
export const FILL_ORDER_STR = FILL_ORDER.join('') // "BACD"

const WALL = '#1F2937'
const WATER = '#00A3E0'
const WATER_TOP = '#34BDF0'
const LABEL = '#1F2937'

export const TANKS_VIEW_W = 540
export const TANKS_VIEW_H = 220
const BASE_Y = 176 // common ground line all tanks stand on
const SLOT_X = [70, 200, 330, 470] // centre x of each display slot (A, B, C, D order)

/**
 * One open-topped tank centred at `cx`, standing on `baseY`. `fill` is 0..1 of
 * its height filled with water. When `done`, a small ✓ + "full" tag appears.
 */
export function TankShape({
  cx,
  baseY,
  tank,
  fill = 0,
  done = false,
  rank,
}: {
  cx: number
  baseY: number
  tank: Tank
  fill?: number
  done?: boolean
  rank?: number
}) {
  const { w, h, id } = tank
  const left = cx - w / 2
  const right = cx + w / 2
  const top = baseY - h
  const wall = 5
  const waterH = Math.max(0, Math.min(1, fill)) * (h - wall)
  const waterY = baseY - wall - waterH
  return (
    <g>
      {/* water (drawn first, clipped inside the walls) */}
      {waterH > 0 && (
        <g>
          <rect x={left + wall / 2} y={waterY} width={w - wall} height={waterH} fill={WATER} />
          <rect x={left + wall / 2} y={waterY} width={w - wall} height={Math.min(6, waterH)} fill={WATER_TOP} />
        </g>
      )}
      {/* base */}
      <rect x={left - wall / 2} y={baseY - wall} width={w + wall} height={wall} rx={1.5} fill={WALL} />
      {/* side walls (open top) */}
      <rect x={left - wall / 2} y={top} width={wall} height={h} rx={1.5} fill={WALL} />
      <rect x={right - wall / 2} y={top} width={wall} height={h} rx={1.5} fill={WALL} />
      {/* label under the tank */}
      <text x={cx} y={baseY + 26} textAnchor="middle" fontSize={22} fontWeight={900} fill={LABEL} className="font-display">
        {id}
      </text>
      {/* "full" badge */}
      {done && (
        <g>
          <circle cx={cx} cy={top - 16} r={14} fill="#10B981" stroke="#065F46" strokeWidth={2.5} />
          <path
            d={`M ${cx - 6} ${top - 16} l 4 5 l 8 -10`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {rank != null && (
            <text x={cx} y={top - 36} textAnchor="middle" fontSize={14} fontWeight={800} fill="#065F46" className="font-display">
              #{rank}
            </text>
          )}
        </g>
      )}
    </g>
  )
}

export interface TankRowProps {
  /** Fill fraction 0..1 per tank id. */
  fills?: Partial<Record<Tank['id'], number>>
  /** Which tanks show the "full" badge. */
  done?: Partial<Record<Tank['id'], boolean>>
  /** Finishing rank (1..4) per tank id, shown above a done tank. */
  ranks?: Partial<Record<Tank['id'], number>>
}

export function TankRow({ fills = {}, done = {}, ranks = {} }: TankRowProps) {
  return (
    <svg
      viewBox={`0 0 ${TANKS_VIEW_W} ${TANKS_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 540, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ground line */}
      <line x1={24} y1={BASE_Y} x2={TANKS_VIEW_W - 24} y2={BASE_Y} stroke="#CBD5E1" strokeWidth={2} />
      {TANKS.map((t, i) => (
        <TankShape
          key={t.id}
          cx={SLOT_X[i]}
          baseY={BASE_Y}
          tank={t}
          fill={fills[t.id] ?? 0}
          done={done[t.id] ?? false}
          rank={ranks[t.id]}
        />
      ))}
    </svg>
  )
}

export default function P23G2Q5Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Four empty open-topped tanks labelled A, B, C and D, standing side by side. They have different sizes: B is the smallest, then A, then C, and D is the largest."
    >
      <TankRow />
    </div>
  )
}
