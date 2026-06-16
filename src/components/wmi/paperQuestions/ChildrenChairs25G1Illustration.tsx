// Static card illustration for WMI-25F1A-Q10 (2025 G1 final).
//
// "There are 16 children and 7 chairs. A single chair seats 1, a double seats 2,
//  a triple seats 3. When all the chairs are filled, how many children have no
//  seat?"  Answer: 5.
//
// Source scan (2025-final-g1-a-q10.jpg): 16 children above a row of 7 chairs of
// mixed sizes, left to right — single, single, single, double, double, single,
// triple. Capacities 1+1+1+2+2+1+3 = 11 total seats. 16 − 11 = 5 children stand.
//
// This draws ONLY the setup: the 16 children + the 7 chairs by size. It never
// fills a chair and never reveals which children stand. Post-answer, the animator
// uses the co-exported primitive `ChildrenChairs25G1` with `seated` to fill the
// 11 seats and leave the 5 standers, counting them out.
//
// Pure render — no random, no dates, SSR-safe & deterministic. The primitive
// clamps `seated` and falls back to the bare setup when given the wrong shape.

const ORANGE = '#f0853a' // qupu-brand-orange

// Wooden tan chairs, matching the scanned figure.
const WOOD_FACE = '#E7C9A0'
const WOOD_EDGE = '#B8895A'
const WOOD_LEG = '#D9B68A'

// The 7 chairs by capacity, left to right (sums to 11).
const CHAIRS = [1, 1, 1, 2, 2, 1, 3] as const
const TOTAL_SEATS = CHAIRS.reduce((a, b) => a + b, 0) // 11
const CHILD_COUNT = 16

// Distinct shirt colours so the 16 children read as a crowd (not the answer).
const SHIRTS = [
  '#E25C5C', '#F0853A', '#FFC94D', '#6FAE5A', '#4FA3C7', '#7E7BD6', '#E07AB0',
  '#D9685A', '#5BB89A', '#C79A4F',
]

const SEAT_W = 26 // width of one seat slot within a chair
const SEAT_GAP = 4 // gap between adjacent chairs
const BACK_H = 24 // backrest height
const BASE_H = 7 // seat-base bar height
const LEG_H = 14 // leg height

/** One drawn child: head with hair, rounded body, two legs. Optional `standing`
 *  flag tints the body to flag a child with no seat (animator only). */
function Child({
  cx,
  baseY,
  i,
  standing,
}: {
  cx: number
  baseY: number
  i: number
  standing?: boolean
}) {
  const headR = 8
  const bodyH = 20
  const headCy = baseY - LEG_H - bodyH - headR + 2
  const bodyTop = headCy + headR - 1
  const legsTop = bodyTop + bodyH
  const shirt = SHIRTS[i % SHIRTS.length]
  const hair = i % 2 === 0 ? '#5B3A1E' : '#2E2A26'

  return (
    <g>
      {/* hair cap */}
      <path
        d={`M ${cx - headR} ${headCy}
            A ${headR} ${headR} 0 0 1 ${cx + headR} ${headCy}
            L ${cx + headR} ${headCy - 4}
            A ${headR} ${headR} 0 0 0 ${cx - headR} ${headCy - 4} Z`}
        fill={hair}
      />
      {/* head */}
      <circle cx={cx} cy={headCy} r={headR} fill="#FCD9B6" stroke="#E0A878" strokeWidth={1.2} />
      {/* body */}
      <rect
        x={cx - 10}
        y={bodyTop}
        width={20}
        height={bodyH}
        rx={8}
        fill={shirt}
        stroke={standing ? ORANGE : '#0000001a'}
        strokeWidth={standing ? 2.4 : 1}
      />
      {/* arms — gently out */}
      <line x1={cx - 9} y1={bodyTop + 6} x2={cx - 15} y2={bodyTop + 12} stroke={shirt} strokeWidth={4} strokeLinecap="round" />
      <line x1={cx + 9} y1={bodyTop + 6} x2={cx + 15} y2={bodyTop + 12} stroke={shirt} strokeWidth={4} strokeLinecap="round" />
      {/* legs */}
      <rect x={cx - 6} y={legsTop} width={5} height={LEG_H} rx={2} fill="#3A4A5A" />
      <rect x={cx + 1} y={legsTop} width={5} height={LEG_H} rx={2} fill="#3A4A5A" />
    </g>
  )
}

/** One wooden bench of a given capacity (1, 2 or 3 seat slots). */
function Chair({ x, y, seats }: { x: number; y: number; seats: number }) {
  const w = seats * SEAT_W
  const baseY = y + BACK_H
  const legY = baseY + BASE_H
  const radius = 6
  return (
    <g>
      {/* backrest */}
      <path
        d={`M ${x} ${y + radius}
            Q ${x} ${y} ${x + radius} ${y}
            L ${x + w - radius} ${y}
            Q ${x + w} ${y} ${x + w} ${y + radius}
            L ${x + w} ${baseY}
            L ${x} ${baseY} Z`}
        fill={WOOD_FACE}
        stroke={WOOD_EDGE}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
      {/* seat dividers for multi-seat benches */}
      {Array.from({ length: seats - 1 }, (_, k) => (
        <line
          key={k}
          x1={x + (k + 1) * SEAT_W}
          y1={y + 4}
          x2={x + (k + 1) * SEAT_W}
          y2={baseY - 3}
          stroke={WOOD_EDGE}
          strokeWidth={1.6}
        />
      ))}
      {/* seat-base bar (slightly wider than backrest) */}
      <rect
        x={x - 3}
        y={baseY}
        width={w + 6}
        height={BASE_H}
        rx={2.5}
        fill={WOOD_LEG}
        stroke={WOOD_EDGE}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
      {/* two legs */}
      <rect x={x + 4} y={legY} width={5} height={LEG_H} rx={1.5} fill={WOOD_LEG} stroke={WOOD_EDGE} strokeWidth={1.6} />
      <rect x={x + w - 9} y={legY} width={5} height={LEG_H} rx={1.5} fill={WOOD_LEG} stroke={WOOD_EDGE} strokeWidth={1.6} />
    </g>
  )
}

/** A small head sitting on a seat slot — the animator fills these. */
function SeatedHead({ cx, cy, i }: { cx: number; cy: number; i: number }) {
  const shirt = SHIRTS[i % SHIRTS.length]
  const hair = i % 2 === 0 ? '#5B3A1E' : '#2E2A26'
  return (
    <g>
      <path
        d={`M ${cx - 7} ${cy} A 7 7 0 0 1 ${cx + 7} ${cy} L ${cx + 7} ${cy - 3} A 7 7 0 0 0 ${cx - 7} ${cy - 3} Z`}
        fill={hair}
      />
      <circle cx={cx} cy={cy} r={7} fill="#FCD9B6" stroke="#E0A878" strokeWidth={1.2} />
      <rect x={cx - 8} y={cy + 6} width={16} height={9} rx={4} fill={shirt} />
    </g>
  )
}

/**
 * The 16-children / 7-chairs scene.
 *
 * @param seated  How many children are sitting (filled left-to-right across the
 *                11 seats; clamped to 0..11). The remaining `16 − seated` children
 *                stand above, the last `seated` of the row removed from the line.
 *                With no prop, all 16 children stand and every chair is empty —
 *                the problem setup. The animator passes `seated={11}` to fill all
 *                chairs and leave the 5 standers.
 */
export function ChildrenChairs25G1({ seated }: { seated?: number } = {}) {
  const filled = Number.isInteger(seated)
    ? Math.max(0, Math.min(TOTAL_SEATS, seated as number))
    : 0
  const standersCount = CHILD_COUNT - filled

  // ── layout ──────────────────────────────────────────────────────────────
  const padX = 14
  const padTop = 12
  const childRowH = LEG_H + 20 + 8 + 8 // legs + body + head + a little air
  const rowGap = 16
  const chairBlockH = BACK_H + BASE_H + LEG_H

  // Chair row width drives the viewBox; the children row sits above it, centered.
  const chairsW =
    CHAIRS.reduce((sum, s) => sum + s * SEAT_W, 0) + (CHAIRS.length - 1) * SEAT_GAP
  const width = padX * 2 + chairsW
  const height = padTop + childRowH + rowGap + chairBlockH + 14

  // Evenly space the standing children across the figure width.
  const childBaseY = padTop + childRowH
  const standerXs: number[] = []
  if (standersCount > 0) {
    const usable = width - padX * 2
    const step = usable / standersCount
    for (let k = 0; k < standersCount; k++) {
      standerXs.push(padX + step * (k + 0.5))
    }
  }

  // Chair x-positions and per-seat centers for the seated heads.
  const chairXs: number[] = []
  const seatCenters: number[] = []
  {
    let cx = padX
    for (const s of CHAIRS) {
      chairXs.push(cx)
      for (let k = 0; k < s; k++) seatCenters.push(cx + k * SEAT_W + SEAT_W / 2)
      cx += s * SEAT_W + SEAT_GAP
    }
  }
  const chairY = padTop + childRowH + rowGap
  const seatHeadCy = chairY + 6

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: 480, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* standing children */}
      {standerXs.map((cx, k) => (
        <Child key={`s${k}`} cx={cx} baseY={childBaseY} i={k} standing={filled > 0} />
      ))}

      {/* the 7 chairs */}
      {CHAIRS.map((s, i) => (
        <Chair key={`c${i}`} x={chairXs[i]} y={chairY} seats={s} />
      ))}

      {/* seated heads (animator only) */}
      {seatCenters.slice(0, filled).map((cx, k) => (
        <SeatedHead key={`h${k}`} cx={cx} cy={seatHeadCy} i={k} />
      ))}
    </svg>
  )
}

/** Default export — bare 16 children + 7 empty chairs inside the card (no box). */
export default function ChildrenChairs25G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Enam belas anak berdiri di atas sebaris tujuh kursi. Tiga kursi tunggal (1 tempat duduk), dua kursi ganda (2 tempat duduk), satu kursi tunggal lagi, dan satu kursi tiga (3 tempat duduk) — semuanya masih kosong. Gambar belum menunjukkan anak mana yang duduk."
    >
      <ChildrenChairs25G1 />
    </div>
  )
}

// Exported for the breakdown/animator: chair sizes and totals.
export const CHAIR_SIZES = CHAIRS
export const TOTAL_SEATS_25G1 = TOTAL_SEATS // 11
export const STANDERS_25G1 = CHILD_COUNT - TOTAL_SEATS // 5
