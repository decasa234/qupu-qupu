// Static card illustration for WMI-25F1A-Q20 (2025 G1 final).
//
// "A theater row has 12 seats. When Lisa arrives, some seats are taken. No matter
//  which empty seat she chooses, she will sit next to an occupied seat. What is the
//  smallest number of people already seated in the row?"  Answer: 4.
//
// This draws ONLY the setup: a single horizontal row of 12 empty numbered theater
// seats (1–12). It never marks which seats are occupied and never reveals the
// answer. Post-answer, the animator marks occupied seats (e.g. [2, 5, 8, 11]) and
// shades the empty seats those occupied neighbours cover, via the co-exported
// primitive `TheaterSeats25G1`.
//
// Pure render — no random, no dates, SSR-safe & deterministic. The primitive falls
// back to an empty `occupied` set when given the wrong shape so previews render.

const INK = '#1F2937'
const BLUE = '#30598A' // qupu-brand-blue
const SEAT_FILL = '#C6DCEC' // soft blue seat face (matches the source chairs)
const SEAT_FILL_LEG = '#9DBBD2' // slightly darker for the seat base/legs
const ORANGE = '#f0853a' // qupu-brand-orange
const OCC_FILL = '#FDE3CF' // peach — occupied seat face (animator only)
const COVER_FILL = '#E5F0E4' // soft green — empty seat covered by a neighbour (animator only)

const SEAT_COUNT = 12

/** One drawn theater chair: rounded backrest with a number, a seat base, two legs. */
function Seat({
  x,
  y,
  seatW,
  n,
  state,
}: {
  x: number
  y: number
  seatW: number
  n: number
  state: 'empty' | 'occupied' | 'covered'
}) {
  const backH = 34 // backrest height
  const baseH = 8 // seat-base bar height
  const legH = 12 // leg height
  const legW = 5
  const radius = 9

  const faceFill = state === 'occupied' ? OCC_FILL : state === 'covered' ? COVER_FILL : SEAT_FILL
  const stroke = state === 'occupied' ? ORANGE : state === 'covered' ? '#5B8C5A' : BLUE
  const strokeW = state === 'empty' ? 2 : 2.6
  const baseFill = state === 'empty' ? SEAT_FILL_LEG : faceFill

  const baseY = y + backH
  const legY = baseY + baseH

  return (
    <g>
      {/* backrest — rounded top, square-ish bottom meeting the base */}
      <path
        d={`M ${x} ${y + radius}
            Q ${x} ${y} ${x + radius} ${y}
            L ${x + seatW - radius} ${y}
            Q ${x + seatW} ${y} ${x + seatW} ${y + radius}
            L ${x + seatW} ${baseY}
            L ${x} ${baseY} Z`}
        fill={faceFill}
        stroke={stroke}
        strokeWidth={strokeW}
        strokeLinejoin="round"
      />
      {/* seat base bar (wider than the backrest, like the source) */}
      <rect
        x={x - 4}
        y={baseY}
        width={seatW + 8}
        height={baseH}
        rx={3}
        fill={baseFill}
        stroke={stroke}
        strokeWidth={strokeW}
        strokeLinejoin="round"
      />
      {/* two legs */}
      <rect x={x + 3} y={legY} width={legW} height={legH} rx={1.5} fill={baseFill} stroke={stroke} strokeWidth={1.8} />
      <rect
        x={x + seatW - 3 - legW}
        y={legY}
        width={legW}
        height={legH}
        rx={1.5}
        fill={baseFill}
        stroke={stroke}
        strokeWidth={1.8}
      />
      {/* a seated person (head) — only when occupied; never in the static figure */}
      {state === 'occupied' && (
        <circle cx={x + seatW / 2} cy={y + backH / 2 - 1} r={8.5} fill={ORANGE} stroke="#c8631f" strokeWidth={1.8} />
      )}
      {/* seat number on the backrest (hidden when a person sits there) */}
      {state !== 'occupied' && (
        <text
          x={x + seatW / 2}
          y={y + backH / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={15}
          fontWeight={800}
          fill={INK}
          className="font-display"
        >
          {n}
        </text>
      )}
    </g>
  )
}

/**
 * The twelve-seat theater row.
 *
 * @param occupied  0-based seat indices that are taken (animator marks these as
 *                  people). Out-of-range / non-array input is ignored.
 * @param covered   0-based indices of *empty* seats to shade green, signalling
 *                  they sit next to an occupied neighbour (animator only). If
 *                  omitted, it is derived automatically from `occupied`
 *                  (every empty seat adjacent to an occupied one).
 *
 * With no props it renders the bare 12 empty seats — the problem setup.
 */
export function TheaterSeats25G1({
  occupied,
  covered,
}: {
  occupied?: number[]
  covered?: number[]
} = {}) {
  const occSet = new Set(
    (Array.isArray(occupied) ? occupied : []).filter((i) => Number.isInteger(i) && i >= 0 && i < SEAT_COUNT),
  )

  // Derive covered empties from occupied neighbours when not explicitly given.
  const derivedCovered = new Set<number>()
  for (let i = 0; i < SEAT_COUNT; i++) {
    if (occSet.has(i)) continue
    if (occSet.has(i - 1) || occSet.has(i + 1)) derivedCovered.add(i)
  }
  const coverSet =
    Array.isArray(covered)
      ? new Set(covered.filter((i) => Number.isInteger(i) && i >= 0 && i < SEAT_COUNT && !occSet.has(i)))
      : derivedCovered

  const seatW = 32
  const gap = 7
  const padX = 12
  const padTop = 14
  const seatBlockH = 34 + 8 + 12 // back + base + legs
  const padBottom = 12
  const width = padX * 2 + SEAT_COUNT * seatW + (SEAT_COUNT - 1) * gap
  const height = padTop + seatBlockH + padBottom

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: 480, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {Array.from({ length: SEAT_COUNT }, (_, i) => {
        const x = padX + i * (seatW + gap)
        const state: 'empty' | 'occupied' | 'covered' = occSet.has(i)
          ? 'occupied'
          : coverSet.has(i)
            ? 'covered'
            : 'empty'
        return <Seat key={i} x={x} y={padTop} seatW={seatW} n={i + 1} state={state} />
      })}
    </svg>
  )
}

/** Default export — the bare row of 12 empty seats inside the card (no box). */
export default function TheaterSeats25G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Satu baris bioskop berisi 12 kursi bernomor 1 sampai 12, semuanya tergambar kosong. Beberapa kursi sudah terisi orang, tetapi gambar belum menunjukkan kursi mana yang terisi."
    >
      <TheaterSeats25G1 />
    </div>
  )
}
