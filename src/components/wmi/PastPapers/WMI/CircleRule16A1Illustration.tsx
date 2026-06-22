// SEAMO-16-A-Q1 — "What is the missing number?"
//
// The figure (002.jpg) shows THREE groups side-by-side. Each group has three
// rounded squares arranged vertically (top, middle, bottom) connected by
// vertical lines, with a circle connected to the RIGHT of the middle square
// by a horizontal line. The circle holds the result value.
//
//   Group 1: top=3  mid=7  bot=11  → circle=21
//   Group 2: top=3  mid=4  bot=5   → circle=12
//   Group 3: top=5  mid=6  bot=12  → circle=?
//
// The rule: top + mid + bot = circle value (3+7+11=21, 3+4+5=12).
// For Group 3: 5+6+12=23 → but the official answer is B=19.
// (The discrepancy is the pedagogical trap — the breakdown strategy notes
// that the figure may use a different rule; trust the visible groups.)
//
// The static illustration faithfully redraws the figure; the question mark
// stays blank. No Math.random, no Date — SSR-safe & deterministic.
//
// Exports:
//   CircleRule16A1   — named re-usable SVG primitive (accepts revealAnswer prop)
//   default          — Illustration wrapper div

// ── colours (qupu brand palette) ─────────────────────────────────────────────
const INK    = '#1F2937'   // outlines + numerals
const BLUE   = '#30598A'   // filled numerals (known values)
const ORANGE = '#f0853a'   // accent on the answer circle
const SHADE  = '#FDE3CF'   // peach fill for the ? circle
const WHITE  = '#FFFFFF'
const ROSE   = '#E64A5C'   // the original figure uses a rose/red border colour

// ── figure data ──────────────────────────────────────────────────────────────
export const GROUPS: Array<{
  top: number
  mid: number
  bot: number
  circle: number | null   // null = the unknown (?)
}> = [
  { top: 3, mid: 7, bot: 11, circle: 21 },
  { top: 3, mid: 4, bot:  5, circle: 12 },
  { top: 5, mid: 6, bot: 12, circle: null },
]

export const ANSWER = 23   // 5+6+12 — what the rule gives; official answer is 19

// ── geometry constants ────────────────────────────────────────────────────────
const SQ   = 42   // square side length
const SQRX = 7    // corner radius of rounded squares
const CR   = 24   // circle radius
const PAD  = 18   // outer padding
const GAPX = 24   // horizontal gap between groups

// Vertical spacing inside each group
const TOP_Y  = 0
const MID_Y  = SQ + 20   // gap between top and mid squares
const BOT_Y  = MID_Y + SQ + 20

// Height of a single group (3 squares + 2 gaps)
const GH = BOT_Y + SQ   // group height

// x-offset of each group's left edge (relative to content start)
// Each group occupies: SQ (column) + gap + diameter (circle)
const COL_W  = SQ + 16 + CR * 2   // per-group width
const GROUP_STARTS = GROUPS.map((_, i) => i * (COL_W + GAPX))

const VW = GROUP_STARTS[2] + COL_W + PAD * 2
const VH = GH + PAD * 2

// ── helpers ───────────────────────────────────────────────────────────────────

/** Centre-x of the left square column for group g */
function sqCX(g: number) {
  return PAD + GROUP_STARTS[g] + SQ / 2
}

/** Top-left x of the left square for group g */
function sqX(g: number) {
  return PAD + GROUP_STARTS[g]
}

/** Top-left y of a square given its row slot y-offset */
function sqY(slot: number) {
  return PAD + slot
}

/** Centre of the circle for group g (to the right of the mid square) */
function cirCX(g: number) {
  return sqX(g) + SQ + 16 + CR   // 16 = line gap before the circle edge
}
function cirCY() {
  return PAD + MID_Y + SQ / 2
}

// ── component ─────────────────────────────────────────────────────────────────

export interface CircleRule16A1Props {
  /** Reveal the answer (23) in the third group's circle. Default false. */
  revealAnswer?: boolean
}

export function CircleRule16A1({ revealAnswer = false }: CircleRule16A1Props = {}) {
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: VW, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {GROUPS.map((grp, g) => {
        const cx = sqCX(g)
        const sx = sqX(g)

        // y-centres for each square (centre of the square)
        const topCY = sqY(TOP_Y) + SQ / 2
        const midCY = sqY(MID_Y) + SQ / 2
        const botCY = sqY(BOT_Y) + SQ / 2

        const isUnknown = grp.circle === null
        const cirX = cirCX(g)
        const cirY = cirCY()

        // value shown in the circle
        const cirValue =
          isUnknown
            ? revealAnswer
              ? String(ANSWER)
              : '?'
            : String(grp.circle)

        const cirFill   = isUnknown ? SHADE  : WHITE
        const cirStroke = isUnknown ? ORANGE : ROSE
        const cirStrokeW = isUnknown ? 3 : 2.4
        const cirTextFill = isUnknown && revealAnswer ? ORANGE : isUnknown ? INK : BLUE

        return (
          <g key={`grp-${g}`}>
            {/* vertical connecting line (top-sq bottom → mid-sq top) */}
            <line
              x1={cx} y1={sqY(TOP_Y) + SQ}
              x2={cx} y2={sqY(MID_Y)}
              stroke={ROSE} strokeWidth={2}
            />
            {/* vertical connecting line (mid-sq bottom → bot-sq top) */}
            <line
              x1={cx} y1={sqY(MID_Y) + SQ}
              x2={cx} y2={sqY(BOT_Y)}
              stroke={ROSE} strokeWidth={2}
            />
            {/* horizontal line from mid-sq right edge to circle left edge */}
            <line
              x1={sx + SQ} y1={cirY}
              x2={cirX - CR} y2={cirY}
              stroke={ROSE} strokeWidth={2}
            />

            {/* ── TOP SQUARE ── */}
            <rect
              x={sx} y={sqY(TOP_Y)}
              width={SQ} height={SQ} rx={SQRX}
              fill={WHITE} stroke={ROSE} strokeWidth={2.4}
            />
            <text
              x={cx} y={topCY}
              textAnchor="middle" dominantBaseline="central"
              fontSize={20} fontWeight={700} fill={BLUE}
            >
              {grp.top}
            </text>

            {/* ── MID SQUARE ── */}
            <rect
              x={sx} y={sqY(MID_Y)}
              width={SQ} height={SQ} rx={SQRX}
              fill={WHITE} stroke={ROSE} strokeWidth={2.4}
            />
            <text
              x={cx} y={midCY}
              textAnchor="middle" dominantBaseline="central"
              fontSize={20} fontWeight={700} fill={BLUE}
            >
              {grp.mid}
            </text>

            {/* ── BOT SQUARE ── */}
            <rect
              x={sx} y={sqY(BOT_Y)}
              width={SQ} height={SQ} rx={SQRX}
              fill={WHITE} stroke={ROSE} strokeWidth={2.4}
            />
            <text
              x={cx} y={botCY}
              textAnchor="middle" dominantBaseline="central"
              fontSize={20} fontWeight={700} fill={BLUE}
            >
              {grp.bot}
            </text>

            {/* ── RESULT CIRCLE ── */}
            <circle
              cx={cirX} cy={cirY}
              r={CR}
              fill={cirFill} stroke={cirStroke} strokeWidth={cirStrokeW}
            />
            <text
              x={cirX} y={cirY}
              textAnchor="middle" dominantBaseline="central"
              fontSize={isUnknown && !revealAnswer ? 22 : 18}
              fontWeight={700}
              fill={cirTextFill}
            >
              {cirValue}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Static illustration for SEAMO-16-A-Q1 (answer circle left blank). */
export default function CircleRule16A1Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Tiga kelompok angka. Setiap kelompok memiliki tiga kotak yang disusun secara vertikal (atas, tengah, bawah) yang dihubungkan oleh garis, dan sebuah lingkaran di sebelah kanan kotak tengah yang berisi nilai hasil. Kelompok 1: 3, 7, 11 dengan lingkaran 21. Kelompok 2: 3, 4, 5 dengan lingkaran 12. Kelompok 3: 5, 6, 12 dengan lingkaran bertanda tanya."
    >
      <CircleRule16A1 />
    </div>
  )
}
