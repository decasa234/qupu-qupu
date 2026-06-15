/**
 * WMI-19P1A-Q25 — "Five different letters go in a row of five boxes. From the
 * statements, in which box (from the left) is the letter B?" (2019 Semifinal
 * Grade 1, answer C = box 5.)
 *
 * Redrawn from the source scan (db/seed/wmi/figures/2019-semifinal-g1-a-q25.jpg):
 * three speech-bubble clues, each with a left-to-right reading arrow and a strip
 * of boxes showing a fragment of the final row:
 *
 *   Clue 1 (3 boxes):  D _ E     → D, one box, then E   (E is two right of D)
 *   Clue 2 (4 boxes):  D _ _ B   → D, two boxes, then B (B is three right of D)
 *   Clue 3 (4 boxes):  C _ _ E   → C, two boxes, then E (E is three right of C)
 *
 * Five letters A B C D E. Reading the gaps EXACTLY:
 *   clue 3 → C at 1, E at 4 ;  clue 1 → D at 2 (E = D+2) ;  clue 2 → B at 5 (B = D+3)
 *   leftover A fills box 3.  Final row:  C D A E B  → B is in box 5.
 *
 * The STATIC figure shows ONLY the problem: five empty answer boxes (1..5) and
 * the three clue strips. It never reveals the deduced order.
 *
 * Pure render — no Math.random, no Date, no window/document at module top.
 * SSR-safe and deterministic.
 */

// ─── colour tokens ──────────────────────────────────────────────────────────
const BOX_STROKE = '#6B7280'
const BOX_FILL = '#EFF1F4' // empty box
const BUBBLE_STROKE = '#9AA3AF'
const BUBBLE_FILL = '#FFFFFF'
const INK = '#2B2118'
const ARROW = '#2B2118'
const SLOT_STROKE = '#30598A' // answer-row boxes (stroke-qupu-brand-blue)
const SLOT_FILL = '#FFFFFF'
const PLACED_FILL = '#FFE48A' // a letter just placed (warm yellow)
const TARGET_FILL = '#FF8A3D' // the target box B (fill-qupu-brand-orange)

export const N = 5 // five boxes in the answer row
export const ANSWER_BOX = 5 // B sits in box 5 (1-based) → option C

// The deduced solution row (left → right). Co-exported for the animator only;
// the static figure never draws it.
export const SOLUTION: readonly string[] = ['C', 'D', 'A', 'E', 'B'] as const

// The three clues as fragments: letters keyed by their column (0-based) within
// the clue strip, and the strip's box count.
export interface Clue {
  boxes: number
  /** letter at each 0-based slot (undefined = blank) */
  slots: Array<string | undefined>
}
export const CLUES: Clue[] = [
  { boxes: 3, slots: ['D', undefined, 'E'] }, // D _ E
  { boxes: 4, slots: ['D', undefined, undefined, 'B'] }, // D _ _ B
  { boxes: 4, slots: ['C', undefined, undefined, 'E'] }, // C _ _ E
]

// ─── geometry ───────────────────────────────────────────────────────────────
const CELL = 40
const GAP = 6

// ─── small building blocks ──────────────────────────────────────────────────

/** A horizontal strip of boxes with optional letters, with a reading arrow above. */
export function ClueStrip({ clue, width }: { clue: Clue; width: number }) {
  const stripW = clue.boxes * CELL + (clue.boxes - 1) * GAP
  const x0 = (width - stripW) / 2
  const arrowY = 14
  const boxY = 26
  return (
    <g>
      {/* reading arrow (left → right) */}
      <g stroke={ARROW} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <line x1={x0 + 4} y1={arrowY} x2={x0 + 30} y2={arrowY} />
        <polyline points={`${x0 + 24},${arrowY - 5} ${x0 + 31},${arrowY} ${x0 + 24},${arrowY + 5}`} />
      </g>
      {/* boxes */}
      {Array.from({ length: clue.boxes }).map((_, i) => {
        const x = x0 + i * (CELL + GAP)
        const letter = clue.slots[i]
        return (
          <g key={i}>
            <rect x={x} y={boxY} width={CELL} height={CELL} rx={5} fill={BOX_FILL} stroke={BOX_STROKE} strokeWidth={2} />
            {letter && (
              <text x={x + CELL / 2} y={boxY + CELL / 2} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={800} fill={INK}>
                {letter}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

/** A speech bubble wrapping a clue strip. */
function ClueBubble({ clue, width, y }: { clue: Clue; width: number; y: number }) {
  const h = 80
  return (
    <g transform={`translate(0 ${y})`}>
      <rect x={6} y={2} width={width - 12} height={h} rx={20} fill={BUBBLE_FILL} stroke={BUBBLE_STROKE} strokeWidth={2} />
      <ClueStrip clue={clue} width={width} />
    </g>
  )
}

// ─── answer row ──────────────────────────────────────────────────────────────

export interface SlotState {
  letter?: string
  /** highlight as the target box (where B lands). */
  target?: boolean
  /** highlight as just-placed. */
  placed?: boolean
}

/**
 * The five-box answer row. `slots` (length 5) controls what each box shows.
 * With no `slots` it draws five empty numbered boxes — the static problem row.
 */
export function AnswerRow({ slots, width }: { slots?: SlotState[]; width: number }) {
  const rowW = N * CELL + (N - 1) * GAP
  const x0 = (width - rowW) / 2
  const boxY = 16
  return (
    <g>
      {Array.from({ length: N }).map((_, i) => {
        const x = x0 + i * (CELL + GAP)
        const s = slots?.[i]
        const fill = s?.target ? TARGET_FILL : s?.placed ? PLACED_FILL : SLOT_FILL
        return (
          <g key={i}>
            <rect x={x} y={boxY} width={CELL} height={CELL} rx={6} fill={fill} stroke={SLOT_STROKE} strokeWidth={2.6} />
            {s?.letter ? (
              <text x={x + CELL / 2} y={boxY + CELL / 2} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill={INK}>
                {s.letter}
              </text>
            ) : (
              // box number beneath (position from the left)
              null
            )}
            <text x={x + CELL / 2} y={boxY + CELL + 14} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700} fill="#6B7280">
              {i + 1}
            </text>
          </g>
        )
      })}
    </g>
  )
}

// ─── full static figure ──────────────────────────────────────────────────────

const VIEW_W = 320

export default function LetterOrder19P1Illustration() {
  const width = VIEW_W
  const bubbleGap = 90
  const rowTop = 8
  const rowH = 50
  const cluesTop = rowTop + rowH + 8
  const totalH = cluesTop + CLUES.length * bubbleGap + 6
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Lima kotak kosong bernomor 1 sampai 5 dari kiri, dan tiga petunjuk dalam balon bicara (masing-masing dengan panah baca dari kiri ke kanan): D _ E; D _ _ B; C _ _ E. Di kotak ke berapa huruf B?"
    >
      <svg viewBox={`0 0 ${width} ${totalH}`} width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: 320 }} aria-hidden="true">
        {/* five empty answer boxes (the row to fill) */}
        <g transform={`translate(0 ${rowTop})`}>
          <AnswerRow width={width} />
        </g>
        {/* the three clue bubbles */}
        {CLUES.map((clue, i) => (
          <ClueBubble key={i} clue={clue} width={width} y={cluesTop + i * bubbleGap} />
        ))}
      </svg>
    </div>
  )
}
