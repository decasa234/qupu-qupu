// Matchstick-digit costs for WMI-20F1A-Q16.
//
// Source figure: wmiPastPaper/2020 WMI Final G01 Paper B — digits 1..9,0 drawn
// in 7-segment matchstick style (tan sticks, dark rounded tips).
// Canonical stick counts (db/seed/wmi/papers/2020-final-g1.json q16):
//   1→2, 7→3, 4→4, 2/3/5→5, 0/6/9→6, 8→7
// Asked: the THIRD largest 2-digit number using at most 8 sticks.
//   91 = 6+2 = 8 ✓ (1st) · tens 8 impossible (7+? — no 1-stick digit) ·
//   77 = 3+3 = 6 ✓ (2nd) · 76 = 3+6 = 9 ✗ · 75 = 3+5 = 8 ✓ (3rd) → 75.

type Seg = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

// Standard 7-segment map: A top, B top-right, C bottom-right, D bottom,
// E bottom-left, F top-left, G middle.
const DIGIT_SEGMENTS: Record<string, Seg[]> = {
  '0': ['A', 'B', 'C', 'D', 'E', 'F'],
  '1': ['B', 'C'],
  '2': ['A', 'B', 'G', 'E', 'D'],
  '3': ['A', 'B', 'G', 'C', 'D'],
  '4': ['F', 'G', 'B', 'C'],
  '5': ['A', 'F', 'G', 'C', 'D'],
  '6': ['A', 'F', 'G', 'E', 'D', 'C'],
  '7': ['A', 'B', 'C'],
  '8': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  '9': ['A', 'B', 'C', 'D', 'F', 'G'],
}

/** Sticks needed per digit — matches the seed's canonical counts. */
export const STICK_COUNT: Record<string, number> = Object.fromEntries(
  Object.entries(DIGIT_SEGMENTS).map(([d, segs]) => [d, segs.length]),
)

// Digit-local geometry: width 24, height 44 (two stacked 22-high halves).
export const DIGIT_W = 24
export const DIGIT_H = 44

const SEG_LINE: Record<Seg, [number, number, number, number]> = {
  A: [3.5, 0, 20.5, 0],
  B: [24, 3.5, 24, 18.5],
  C: [24, 25.5, 24, 40.5],
  D: [3.5, 44, 20.5, 44],
  E: [0, 25.5, 0, 40.5],
  F: [0, 3.5, 0, 18.5],
  G: [3.5, 22, 20.5, 22],
}

const STICK_COLOR = '#C8956C'
const TIP_COLOR = '#3B2B20'

function MatchSeg({ seg }: { seg: Seg }) {
  const [x1, y1, x2, y2] = SEG_LINE[seg]
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={STICK_COLOR} strokeWidth={4.2} strokeLinecap="round" />
      <circle cx={x1} cy={y1} r={2.4} fill={TIP_COLOR} />
      <circle cx={x2} cy={y2} r={2.4} fill={TIP_COLOR} />
    </g>
  )
}

/** One 7-segment matchstick digit with its top-left corner at (x, y). */
export function MatchstickDigit({
  digit,
  x,
  y,
  scale = 1,
  dim = false,
}: {
  digit: string
  x: number
  y: number
  scale?: number
  dim?: boolean
}) {
  const segs = DIGIT_SEGMENTS[digit] ?? []
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={dim ? 0.35 : 1}>
      {segs.map((seg) => (
        <MatchSeg key={seg} seg={seg} />
      ))}
    </g>
  )
}

// ---------------------------------------------------------------------------
// Explainer diagram: compact costs row on top + a candidates board below.

export interface MatchstickCandidate {
  /** Tens digit of the candidate. */
  tens: string
  /** Ones digit, or null when no digit fits the remaining sticks. */
  ones: string | null
  /** Stick math shown beside the digits, e.g. "6 + 2 = 8". */
  math: string
  /** Whether the candidate fits within 8 sticks. */
  ok: boolean
  /** Rank among the accepted numbers (1 = largest), null for rejected tries. */
  rank: 1 | 2 | 3 | null
}

export const MATCH_VIEW_W = 420
export const MATCH_VIEW_H = 268

const COSTS_SCALE = 0.5
const COSTS_SLOT = 40
const COSTS_X0 = (MATCH_VIEW_W - (9 * COSTS_SLOT + DIGIT_W * COSTS_SCALE)) / 2
const COSTS_Y = 12
const COSTS_LABEL_Y = COSTS_Y + DIGIT_H * COSTS_SCALE + 13

const ROW_Y0 = 80
const ROW_H = 37
const CAND_SCALE = 0.6

const COSTS_DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

/** Compact "stick price" row: all ten digits with their stick counts. */
function CostsRow({ dim = false }: { dim?: boolean }) {
  return (
    <g opacity={dim ? 0.45 : 1}>
      {COSTS_DIGITS.map((d, i) => {
        const x = COSTS_X0 + i * COSTS_SLOT
        return (
          <g key={d}>
            <MatchstickDigit digit={d} x={x} y={COSTS_Y} scale={COSTS_SCALE} />
            <text
              x={x + (DIGIT_W * COSTS_SCALE) / 2}
              y={COSTS_LABEL_Y}
              textAnchor="middle"
              fontSize={11}
              fontWeight={700}
              fill="#6B7280"
            >
              {STICK_COUNT[d]}
            </text>
          </g>
        )
      })}
    </g>
  )
}

function CandidateRow({ cand, y, highlight }: { cand: MatchstickCandidate; y: number; highlight: boolean }) {
  const glyphH = DIGIT_H * CAND_SCALE
  const midY = y + glyphH / 2
  return (
    <g opacity={cand.ok ? 1 : 0.7}>
      {highlight && <rect x={8} y={y - 6} width={MATCH_VIEW_W - 16} height={glyphH + 12} rx={9} fill="#D1FAE5" />}
      {/* rank badge for accepted numbers */}
      {cand.rank !== null && (
        <g>
          <circle cx={22} cy={midY} r={11} fill={highlight ? '#10B981' : '#2f6df0'} />
          <text x={22} y={midY} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={900} fill="#FFFFFF">
            {cand.rank}
          </text>
        </g>
      )}
      <MatchstickDigit digit={cand.tens} x={44} y={y} scale={CAND_SCALE} dim={!cand.ok} />
      {cand.ones !== null ? (
        <MatchstickDigit digit={cand.ones} x={44 + DIGIT_W * CAND_SCALE + 11} y={y} scale={CAND_SCALE} dim={!cand.ok} />
      ) : (
        <text x={44 + DIGIT_W * CAND_SCALE + 18} y={midY} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={900} fill="#94A3B8">
          ?
        </text>
      )}
      <text x={104} y={midY} dominantBaseline="central" fontSize={13.5} fontWeight={700} fill={cand.ok ? '#1F2937' : '#6B7280'}>
        {cand.math}
      </text>
      <text
        x={MATCH_VIEW_W - 22}
        y={midY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={18}
        fontWeight={900}
        fill={cand.ok ? '#10B981' : '#EF4444'}
      >
        {cand.ok ? '✓' : '✗'}
      </text>
    </g>
  )
}

export interface Matchstick20DiagramProps {
  /** Candidate numbers tried so far, in try order. */
  candidates?: MatchstickCandidate[]
  /** Highlight the rank-3 row (the answer, 75) in green. */
  highlightAnswer?: boolean
}

export function Matchstick20Diagram({ candidates = [], highlightAnswer = false }: Matchstick20DiagramProps) {
  return (
    <svg
      viewBox={`0 0 ${MATCH_VIEW_W} ${MATCH_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <CostsRow />
      <line x1={14} y1={ROW_Y0 - 14} x2={MATCH_VIEW_W - 14} y2={ROW_Y0 - 14} stroke="#CBD5E1" strokeWidth={1.5} />
      {candidates.map((cand, i) => (
        <CandidateRow
          key={`${cand.tens}${cand.ones ?? 'x'}`}
          cand={cand}
          y={ROW_Y0 + i * ROW_H}
          highlight={highlightAnswer && cand.rank === 3}
        />
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Question illustration: the figure — all ten digits with their stick counts.

const FIG_SLOT = 45
const FIG_X0 = 16
const FIG_Y = 10
const FIG_VIEW_W = FIG_X0 * 2 + 9 * FIG_SLOT + DIGIT_W
const FIG_VIEW_H = 84

export default function Matchstick20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Digits 1 to 9 and 0 built from matchsticks: 1 uses 2 sticks, 2 uses 5, 3 uses 5, 4 uses 4, 5 uses 5, 6 uses 6, 7 uses 3, 8 uses 7, 9 uses 6, 0 uses 6."
    >
      <svg
        viewBox={`0 0 ${FIG_VIEW_W} ${FIG_VIEW_H}`}
        width="100%"
        style={{ maxWidth: 480, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {COSTS_DIGITS.map((d, i) => {
          const x = FIG_X0 + i * FIG_SLOT
          return (
            <g key={d}>
              <MatchstickDigit digit={d} x={x} y={FIG_Y} />
              <text x={x + DIGIT_W / 2} y={FIG_Y + DIGIT_H + 18} textAnchor="middle" fontSize={12} fontWeight={700} fill="#6B7280">
                {STICK_COUNT[d]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
