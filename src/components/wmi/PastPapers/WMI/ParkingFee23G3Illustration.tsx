// WMI-23F3A-Q7 (2023 Grade 3 Final) — parking-lot fee-rate table.
//
// "A parking lot charges — Small car: $5 first hour, then $3 each later hour;
//  Big car: $7 first hour, then $5 each later hour. Kevin parks a small car,
//  Josh parks a big car, and they pay the SAME total fee. Find the least total
//  hours they park combined."  (fill-in-style MC; answer = B = 8.)
//
// MATH (for reference only — the static figure must NOT reveal the matching
// hours, the equal fee, or the total):
//   small-car fee after h hours  = 5 + 3·(h−1) = 3h + 2
//   big-car   fee after k hours  = 7 + 5·(k−1) = 5k + 2
//   equal fee  ⇒  3h + 2 = 5k + 2  ⇒  3h = 5k.
//   smallest positive solution: h = 5, k = 3 — both pay 3·5+2 = 5·3+2 = $17.
//   least combined hours = h + k = 5 + 3 = 8.
//
// The default export draws ONLY the setup: a tidy fee-rate table (two rows
// Small Car / Big Car, two columns "First hour" / "Each later hour"). It commits
// to NO number of hours and never shows the equal fee or the total. Revealing
// the running cost ladders + the $17 match + the 8 combined hours is the
// animator's job, via the co-exported ParkingFee23G3 primitive.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

// ---- fee data (the printed table) ------------------------------------------

const SMALL_FIRST = 5
const SMALL_LATER = 3
const BIG_FIRST = 7
const BIG_LATER = 5

const INK = '#1F2937' // labels / table ink

// ---- table geometry --------------------------------------------------------

const PAD = 14
const LABEL_COL_W = 104 // left column holding the car icon + name
const DATA_COL_W = 100 // each of the two data columns
const HEADER_H = 38
const ROW_H = 50

const TABLE_W = LABEL_COL_W + DATA_COL_W * 2
const TABLE_X = PAD
const TABLE_Y = PAD

const FONT =
  '"Baloo 2", "Segoe UI Symbol", "Apple Symbols", "Noto Sans Symbols2", sans-serif'

/** A small, plain drawn car glyph (body + cabin + two wheels). No emoji. */
function CarGlyph({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* lower body */}
      <path
        d="M 2 14 L 6 14 Q 8 6 16 6 L 26 6 Q 32 6 36 11 L 42 13 Q 44 14 44 17 L 44 20 L 2 20 Z"
        className="fill-qupu-brand-blue stroke-qupu-brand-blue-shadow"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      {/* cabin / windows */}
      <path
        d="M 13 7 Q 15 1 21 1 L 25 1 Q 30 1 33 7 Z"
        className="fill-qupu-sky stroke-qupu-brand-blue-shadow"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      {/* window divider */}
      <line x1={23} y1={1} x2={23} y2={7} className="stroke-qupu-brand-blue-shadow" strokeWidth={1.2} />
      {/* wheels */}
      <circle cx={13} cy={20} r={4.5} className="fill-qupu-brand-blue-shadow" />
      <circle cx={13} cy={20} r={1.8} className="fill-qupu-cream" />
      <circle cx={34} cy={20} r={4.5} className="fill-qupu-brand-blue-shadow" />
      <circle cx={34} cy={20} r={1.8} className="fill-qupu-cream" />
    </g>
  )
}

interface FeeRow {
  name: string
  first: number
  later: number
}

const ROWS: FeeRow[] = [
  { name: 'Small car', first: SMALL_FIRST, later: SMALL_LATER },
  { name: 'Big car', first: BIG_FIRST, later: BIG_LATER },
]

// ---- ladder (animator only) geometry ---------------------------------------

const LADDER_W = 96
const LADDER_GAP = 22
const STEP_GAP = 4

/** Running cost after each hour for a car: [first, first+later, …] of length n. */
function runningCosts(first: number, later: number, hours: number): number[] {
  const out: number[] = []
  let total = 0
  for (let h = 1; h <= hours; h++) {
    total += h === 1 ? first : later
    out.push(total)
  }
  return out
}

export interface ParkingFee23G3Props {
  /** Hours the small car parks — draws its running cost ladder (animator only). */
  smallHours?: number
  /** Hours the big car parks — draws its running cost ladder (animator only). */
  bigHours?: number
  /** Reveal the equal fee + combined hours banner (animator post-answer only). */
  showTotals?: boolean
}

/**
 * Primitive. Default (no props) is the plain problem figure: the tidy fee-rate
 * table only — nothing about hours, the equal fee, or the total.
 *
 * The animator passes `smallHours` / `bigHours` to draw the two running-cost
 * ladders beside the table (small: 5, 8, 11, 14, 17; big: 7, 12, 17), highlighting
 * the row where both first reach the same dollar amount. `showTotals` adds the
 * "equal fee = $17, combined hours = 8" banner.
 */
export function ParkingFee23G3({ smallHours, bigHours, showTotals = false }: ParkingFee23G3Props = {}) {
  const hasLadders =
    typeof smallHours === 'number' && smallHours > 0 && typeof bigHours === 'number' && bigHours > 0

  const smallSteps = hasLadders ? runningCosts(SMALL_FIRST, SMALL_LATER, smallHours as number) : []
  const bigSteps = hasLadders ? runningCosts(BIG_FIRST, BIG_LATER, bigHours as number) : []

  // the matched (equal) fee, if both ladders end on the same amount
  const smallEnd = smallSteps.length ? smallSteps[smallSteps.length - 1] : null
  const bigEnd = bigSteps.length ? bigSteps[bigSteps.length - 1] : null
  const matchedFee = smallEnd != null && smallEnd === bigEnd ? smallEnd : null

  // ladder block height (tallest of the two)
  const maxSteps = Math.max(smallSteps.length, bigSteps.length)
  const ladderRowH = 22
  const ladderHeadH = 22
  const ladderH = hasLadders ? ladderHeadH + maxSteps * (ladderRowH + STEP_GAP) : 0

  const tableH = HEADER_H + ROW_H * ROWS.length
  const ladderTop = TABLE_Y
  const laddersBlockH = hasLadders ? ladderH : 0

  const totalsH = showTotals ? 40 : 0
  const totalsGap = showTotals ? 14 : 0

  const contentH = Math.max(tableH, laddersBlockH)
  const width =
    PAD * 2 + TABLE_W + (hasLadders ? LADDER_GAP + LADDER_W * 2 + LADDER_GAP : 0)
  const height = PAD * 2 + contentH + totalsGap + totalsH

  const laddersX = TABLE_X + TABLE_W + LADDER_GAP

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(hasLadders ? 320 : 280, width)} aria-hidden="true">
      {/* ---- the fee-rate table ---- */}
      {/* table body background */}
      <rect
        x={TABLE_X}
        y={TABLE_Y}
        width={TABLE_W}
        height={tableH}
        rx={12}
        className="fill-qupu-cream stroke-qupu-brand-orange"
        strokeWidth={2.4}
      />

      {/* header band */}
      <path
        d={`M ${TABLE_X + 12} ${TABLE_Y}
            L ${TABLE_X + TABLE_W - 12} ${TABLE_Y}
            Q ${TABLE_X + TABLE_W} ${TABLE_Y} ${TABLE_X + TABLE_W} ${TABLE_Y + 12}
            L ${TABLE_X + TABLE_W} ${TABLE_Y + HEADER_H}
            L ${TABLE_X} ${TABLE_Y + HEADER_H}
            L ${TABLE_X} ${TABLE_Y + 12}
            Q ${TABLE_X} ${TABLE_Y} ${TABLE_X + 12} ${TABLE_Y} Z`}
        className="fill-qupu-brand-blue"
      />

      {/* column header labels */}
      <text
        x={TABLE_X + LABEL_COL_W + DATA_COL_W / 2}
        y={TABLE_Y + HEADER_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={800}
        fontFamily={FONT}
        className="fill-qupu-cream"
      >
        First hour
      </text>
      <text
        x={TABLE_X + LABEL_COL_W + DATA_COL_W + DATA_COL_W / 2}
        y={TABLE_Y + HEADER_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={800}
        fontFamily={FONT}
        className="fill-qupu-cream"
      >
        Each later hour
      </text>

      {/* internal vertical column separators */}
      {[LABEL_COL_W, LABEL_COL_W + DATA_COL_W].map((dx) => (
        <line
          key={`v-${dx}`}
          x1={TABLE_X + dx}
          y1={TABLE_Y}
          x2={TABLE_X + dx}
          y2={TABLE_Y + tableH}
          className="stroke-qupu-brand-orange"
          strokeWidth={1.6}
          opacity={0.55}
        />
      ))}

      {/* horizontal separator under the header, then between the two rows */}
      {ROWS.map((_, i) => (
        <line
          key={`h-${i}`}
          x1={TABLE_X}
          y1={TABLE_Y + HEADER_H + i * ROW_H}
          x2={TABLE_X + TABLE_W}
          y2={TABLE_Y + HEADER_H + i * ROW_H}
          className="stroke-qupu-brand-orange"
          strokeWidth={1.6}
          opacity={0.55}
        />
      ))}

      {/* body rows: car icon + name, first-hour fee, later-hour fee */}
      {ROWS.map((row, i) => {
        const rowY = TABLE_Y + HEADER_H + i * ROW_H
        const midY = rowY + ROW_H / 2
        const big = row.first === BIG_FIRST
        const carScale = big ? 1.18 : 0.92
        const carW = 46 * carScale
        const carX = TABLE_X + 12
        const carY = midY - 14 * carScale
        return (
          <g key={row.name}>
            <CarGlyph x={carX} y={carY} scale={carScale} />
            <text
              x={carX + carW + 6}
              y={midY}
              dominantBaseline="central"
              fontSize={12.5}
              fontWeight={800}
              fontFamily={FONT}
              fill={INK}
            >
              {row.name}
            </text>
            {/* first-hour fee */}
            <text
              x={TABLE_X + LABEL_COL_W + DATA_COL_W / 2}
              y={midY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={20}
              fontWeight={800}
              fontFamily={FONT}
              className="fill-qupu-brand-blue"
            >
              {`$${row.first}`}
            </text>
            {/* each-later-hour fee */}
            <text
              x={TABLE_X + LABEL_COL_W + DATA_COL_W + DATA_COL_W / 2}
              y={midY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={20}
              fontWeight={800}
              fontFamily={FONT}
              className="fill-qupu-brand-blue"
            >
              {`$${row.later}`}
            </text>
          </g>
        )
      })}

      {/* ---- running-cost ladders (animator only) ---- */}
      {hasLadders && (
        <>
          <CostLadder
            x={laddersX}
            y={ladderTop}
            title="Small car"
            steps={smallSteps}
            matchedFee={matchedFee}
            headH={ladderHeadH}
            rowH={ladderRowH}
          />
          <CostLadder
            x={laddersX + LADDER_W + LADDER_GAP}
            y={ladderTop}
            title="Big car"
            steps={bigSteps}
            matchedFee={matchedFee}
            headH={ladderHeadH}
            rowH={ladderRowH}
          />
        </>
      )}

      {/* ---- totals banner (animator post-answer only) ---- */}
      {showTotals && matchedFee != null && (
        <g>
          {(() => {
            const by = PAD + contentH + totalsGap
            const bw = width - PAD * 2
            const combined = (smallSteps.length || 0) + (bigSteps.length || 0)
            return (
              <>
                <rect x={PAD} y={by} width={bw} height={totalsH} rx={10} className="fill-qupu-brand-orange" />
                <text
                  x={PAD + bw / 2}
                  y={by + totalsH / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={14}
                  fontWeight={800}
                  fontFamily={FONT}
                  className="fill-qupu-cream"
                >
                  {`Equal fee $${matchedFee} • ${combined} hours total`}
                </text>
              </>
            )
          })()}
        </g>
      )}
    </svg>
  )
}

/** A single car's running-cost ladder: title + one stacked chip per hour. */
function CostLadder({
  x,
  y,
  title,
  steps,
  matchedFee,
  headH,
  rowH,
}: {
  x: number
  y: number
  title: string
  steps: number[]
  matchedFee: number | null
  headH: number
  rowH: number
}) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <text
        x={LADDER_W / 2}
        y={headH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={800}
        fontFamily={FONT}
        fill={INK}
      >
        {title}
      </text>
      {steps.map((cost, i) => {
        const cy = headH + i * (rowH + STEP_GAP)
        const isMatch = matchedFee != null && cost === matchedFee && i === steps.length - 1
        return (
          <g key={i}>
            <rect
              x={0}
              y={cy}
              width={LADDER_W}
              height={rowH}
              rx={7}
              className={isMatch ? 'fill-qupu-brand-orange stroke-qupu-brand-orange' : 'fill-qupu-peach stroke-qupu-brand-orange'}
              strokeWidth={1.6}
            />
            <text
              x={10}
              y={cy + rowH / 2}
              dominantBaseline="central"
              fontSize={10.5}
              fontWeight={700}
              fontFamily={FONT}
              fill={INK}
              opacity={0.85}
            >
              {`${i + 1}h`}
            </text>
            <text
              x={LADDER_W - 10}
              y={cy + rowH / 2}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={13}
              fontWeight={800}
              fontFamily={FONT}
              className={isMatch ? 'fill-qupu-cream' : 'fill-qupu-brand-blue'}
            >
              {`$${cost}`}
            </text>
          </g>
        )
      })}
    </g>
  )
}

/**
 * Default export: the plain fee-rate table only (two rows Small Car / Big Car,
 * two columns First hour / Each later hour). Reveals nothing about the matching
 * hours, the equal fee, or the combined total.
 */
export default function ParkingFee23G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        `Tabel tarif parkir. Mobil kecil: jam pertama $${SMALL_FIRST}, tiap jam berikutnya $${SMALL_LATER}. ` +
        `Mobil besar: jam pertama $${BIG_FIRST}, tiap jam berikutnya $${BIG_LATER}. ` +
        `Kevin memarkir mobil kecil dan Josh memarkir mobil besar dengan total biaya yang sama; ` +
        `cari jumlah jam parkir gabungan paling sedikit.`
      }
    >
      <ParkingFee23G3 />
    </div>
  )
}
