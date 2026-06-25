/**
 * SEAMOX-20-A-Q3 — "Find the missing number" stick-figure puzzle.
 *
 * Three stick figures, each with a head (circle) and four numbered limbs:
 *   UL = upper-left, UR = upper-right, LL = lower-left, LR = lower-right.
 *
 *   Fig 1: head = 7,  UL=8, UR=5, LL=2, LR=4
 *   Fig 2: head = 3,  UL=9, UR=2, LL=5, LR=3
 *   Fig 3: head = ?,  UL=6, UR=4, LL=2, LR=3  → answer = 5
 *
 *   Rule: head = (UL + UR) − (LL + LR)
 *
 * Source: docs/reference/ocr-res/seamo-x/contest/paper-a/2020.imgs/002–004.jpg
 *
 * Stem shows the PROBLEM only — Fig 3 head shows "?".
 * Co-exports `StickFigSVG` so the explainer can reuse it.
 *
 * Pure SVG, SSR-safe: no hooks, no framer-motion, no Date/random.
 */

// ── geometry constants ────────────────────────────────────────────────────────
const HEAD_R   = 22      // head circle radius
const NECK_LEN = 18      // distance from head centre down to torso junction
const ARM_LEN  = 32      // length of each upper-arm limb
const LEG_LEN  = 32      // length of each lower-leg limb

// Arm/leg angles (degrees from vertical):
const ARM_ANGLE = 50     // upper limbs spread
const LEG_ANGLE = 40     // lower limbs spread

// Column layout for three figures inside one SVG:
const FIG_W    = 110     // width allocated per figure
const FIG_H    = 140     // height of each figure cell
const PAD_X    = 10      // left/right outer padding
const TOTAL_W  = PAD_X * 2 + FIG_W * 3
const TOTAL_H  = FIG_H + 20

// ── colour tokens ─────────────────────────────────────────────────────────────
const HEAD_FILL   = '#354A6A'   // dark navy (matches source image)
const BODY_STROKE = '#1F2937'
const LABEL_CLR   = '#1F2937'
const MISS_FILL   = '#354A6A'   // same dark circle for "?"
const MISS_TXT    = '#FFFFFF'
const NUM_TXT     = '#FFFFFF'
const ARC_TXT     = '#1F2937'

// ── helper: convert degrees to radians ───────────────────────────────────────
function deg(d: number) { return (d * Math.PI) / 180 }

// ── shared primitive ─────────────────────────────────────────────────────────

export interface StickFigData {
  head:    string         // text in head circle, e.g. "7" or "?"
  ul:      number         // upper-left limb value
  ur:      number         // upper-right limb value
  ll:      number         // lower-left limb value
  lr:      number         // lower-right limb value
  /** When true, highlights the head circle in amber (for explainer beats). */
  highlightHead?: boolean
  /** When set, highlights that limb pair label in amber. */
  highlightArms?: boolean
  highlightLegs?: boolean
}

export interface StickFigSVGProps {
  figures: StickFigData[]
  /** Width of each figure cell (defaults to FIG_W). */
  cellW?: number
}

/** Renders 1–3 stick figures side by side as a `<g>` element. Wrap in `<svg>`. */
export function StickFigGroup({ figures, cellW = FIG_W }: StickFigSVGProps) {
  return (
    <>
      {figures.map((fig, i) => {
        const cx = PAD_X + cellW * i + cellW / 2  // centre x of this figure
        const headCY = 30                          // y of head centre
        const juncY  = headCY + HEAD_R + NECK_LEN // torso junction y

        // Arm endpoints
        const ulX = cx - Math.sin(deg(ARM_ANGLE)) * ARM_LEN
        const ulY = juncY - Math.cos(deg(ARM_ANGLE)) * ARM_LEN
        const urX = cx + Math.sin(deg(ARM_ANGLE)) * ARM_LEN
        const urY = juncY - Math.cos(deg(ARM_ANGLE)) * ARM_LEN

        // Leg endpoints
        const llX = cx - Math.sin(deg(LEG_ANGLE)) * LEG_LEN
        const llY = juncY + Math.cos(deg(LEG_ANGLE)) * LEG_LEN
        const lrX = cx + Math.sin(deg(LEG_ANGLE)) * LEG_LEN
        const lrY = juncY + Math.cos(deg(LEG_ANGLE)) * LEG_LEN

        const hlAmber = '#F59E0B'
        const headStroke = fig.highlightHead ? hlAmber : BODY_STROKE
        const headSW     = fig.highlightHead ? 3        : 1.5
        const armClr     = fig.highlightArms ? hlAmber  : ARC_TXT
        const legClr     = fig.highlightLegs ? hlAmber  : ARC_TXT

        return (
          <g key={i}>
            {/* Neck */}
            <line
              x1={cx} y1={headCY + HEAD_R}
              x2={cx} y2={juncY}
              stroke={BODY_STROKE} strokeWidth={2.5} strokeLinecap="round"
            />

            {/* Upper limbs */}
            <line x1={cx} y1={juncY} x2={ulX} y2={ulY}
              stroke={BODY_STROKE} strokeWidth={2.5} strokeLinecap="round" />
            <line x1={cx} y1={juncY} x2={urX} y2={urY}
              stroke={BODY_STROKE} strokeWidth={2.5} strokeLinecap="round" />

            {/* Lower limbs */}
            <line x1={cx} y1={juncY} x2={llX} y2={llY}
              stroke={BODY_STROKE} strokeWidth={2.5} strokeLinecap="round" />
            <line x1={cx} y1={juncY} x2={lrX} y2={lrY}
              stroke={BODY_STROKE} strokeWidth={2.5} strokeLinecap="round" />

            {/* Head circle */}
            <circle
              cx={cx} cy={headCY} r={HEAD_R}
              fill={fig.head === '?' ? MISS_FILL : HEAD_FILL}
              stroke={headStroke} strokeWidth={headSW}
            />
            <text
              x={cx} y={headCY}
              textAnchor="middle" dominantBaseline="central"
              fontSize={15} fontWeight={700}
              fill={fig.head === '?' ? MISS_TXT : NUM_TXT}
            >
              {fig.head}
            </text>

            {/* Limb labels */}
            {/* UL */}
            <text x={ulX - 6} y={ulY}
              textAnchor="end" dominantBaseline="central"
              fontSize={13} fontWeight={600} fill={armClr}>
              {fig.ul}
            </text>
            {/* UR */}
            <text x={urX + 6} y={urY}
              textAnchor="start" dominantBaseline="central"
              fontSize={13} fontWeight={600} fill={armClr}>
              {fig.ur}
            </text>
            {/* LL */}
            <text x={llX - 6} y={llY + 2}
              textAnchor="end" dominantBaseline="central"
              fontSize={13} fontWeight={600} fill={legClr}>
              {fig.ll}
            </text>
            {/* LR */}
            <text x={lrX + 6} y={lrY + 2}
              textAnchor="start" dominantBaseline="central"
              fontSize={13} fontWeight={600} fill={legClr}>
              {fig.lr}
            </text>
          </g>
        )
      })}
    </>
  )
}

// ── The three figures (problem state) ────────────────────────────────────────
const PROBLEM_FIGS: StickFigData[] = [
  { head: '7', ul: 8, ur: 5, ll: 2, lr: 4 },
  { head: '3', ul: 9, ur: 2, ll: 5, lr: 3 },
  { head: '?', ul: 6, ur: 4, ll: 2, lr: 3 },
]

// ── Default export: stem illustration ─────────────────────────────────────────

export default function StickFigNum3X20A3Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Tiga orang-orangan dengan angka di kepala dan empat anggota badan. Gambar 3 memiliki tanda tanya di kepala."
    >
      <svg
        viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`}
        width="100%"
        style={{ maxWidth: TOTAL_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={TOTAL_W} height={TOTAL_H} fill="#F9FAFB" />

        {/* Figure labels: Fig 1, Fig 2, Fig 3 */}
        {[0, 1, 2].map((i) => (
          <text
            key={i}
            x={PAD_X + FIG_W * i + FIG_W / 2}
            y={TOTAL_H - 6}
            textAnchor="middle"
            dominantBaseline="auto"
            fontSize={10}
            fill="#6B7280"
            fontWeight={500}
          >
            {`Fig ${i + 1}`}
          </text>
        ))}

        <StickFigGroup figures={PROBLEM_FIGS} />
      </svg>
    </div>
  )
}

// Re-export geometry for explainer layout
export { TOTAL_W, TOTAL_H, PROBLEM_FIGS, FIG_W, PAD_X, LABEL_CLR }
