/**
 * WMI-21P2A-Q19 — "Which three fruits belong in the hidden circles?"
 *
 * Reconstructed from db/seed/wmi/figures/2021-semifinal-g2-a-q19.jpg: a long
 * line of circles each holding a fruit, forming a repeating banana / green-apple
 * pattern. One run of THREE circles is covered by a box marked "?" with an arrow
 * pointing to the three empty answer circles below.
 *
 * The repeating unit has period 3 — 🍌 🍏 🍌 — so reading across, the visible
 * fruits alternate banana, apple, banana, banana, apple, banana, … The three
 * hidden circles are exactly one unit: 🍌 🍏 🍌 → answer C.
 *
 * The static figure shows ONLY the problem: the visible fruit, the covering box,
 * and three EMPTY answer circles (never the hidden fruit / answer).
 */

export const BANANA = '🍌'
export const APPLE = '🍏'
export type FruitGlyph = typeof BANANA | typeof APPLE

/** The repeating unit (period 3). */
export const UNIT: FruitGlyph[] = [BANANA, APPLE, BANANA]

/** The three hidden fruit (= the answer, used by the explainer only). */
export const HIDDEN: FruitGlyph[] = [BANANA, APPLE, BANANA]

// How many visible circles sit before / after the covered run.
const BEFORE = 6
const AFTER = 6
const HIDDEN_COUNT = 3

/** Full sequence of slot kinds across the row: 'fruit' (visible) or 'box' (hidden). */
export interface Slot {
  kind: 'fruit' | 'box'
  fruit?: FruitGlyph
}

/** Build the visible row from the repeating unit, with a covered run in the middle. */
export function buildRow(): { slots: Slot[]; boxStart: number } {
  const at = (i: number): FruitGlyph => UNIT[i % UNIT.length]
  const slots: Slot[] = []
  for (let i = 0; i < BEFORE; i++) slots.push({ kind: 'fruit', fruit: at(i) })
  const boxStart = BEFORE
  for (let i = 0; i < HIDDEN_COUNT; i++) slots.push({ kind: 'box' })
  for (let i = 0; i < AFTER; i++) slots.push({ kind: 'fruit', fruit: at(BEFORE + HIDDEN_COUNT + i) })
  return { slots, boxStart }
}

const R = 22 // circle radius
const STEP = 50 // horizontal spacing between circle centres
const RING = '#1F2937'

/** A single circle holding (or not) a fruit; can be revealed, lit, or empty. */
export function FruitCircle({
  cx,
  cy,
  fruit,
  lit = false,
}: {
  cx: number
  cy: number
  fruit?: FruitGlyph
  lit?: boolean
}) {
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill={lit ? '#FEF3C7' : '#FFFFFF'}
        stroke={lit ? '#F59E0B' : RING}
        strokeWidth={lit ? 3.5 : 2.5}
      />
      {fruit && (
        <text x={cx} y={cy + 1} fontSize={26} textAnchor="middle" dominantBaseline="central">
          {fruit}
        </text>
      )}
    </g>
  )
}

export const Q19_VIEW_W = (BEFORE + HIDDEN_COUNT + AFTER) * STEP + 24
export const Q19_VIEW_H = 200

const ROW_Y = 52
const ANS_Y = 150

export interface Q19DiagramProps {
  /** When true, lift the "?" box and reveal the three hidden fruit in their slots. */
  reveal?: boolean
  /** When true, also fill the three answer circles below with the hidden fruit. */
  fillAnswer?: boolean
  /** Highlight the visible run that establishes the unit (index range), -1 = none. */
  litUnit?: boolean
}

export function Q19Diagram({ reveal = false, fillAnswer = false, litUnit = false }: Q19DiagramProps) {
  const { slots, boxStart } = buildRow()
  const firstX = 12 + R
  const boxCx = firstX + (boxStart + (HIDDEN_COUNT - 1) / 2) * STEP

  return (
    <svg
      viewBox={`0 0 ${Q19_VIEW_W} ${Q19_VIEW_H}`}
      width="100%"
      style={{ maxWidth: Q19_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* the row of circles */}
      {slots.map((slot, i) => {
        const cx = firstX + i * STEP
        if (slot.kind === 'fruit') {
          const lit = litUnit && i < UNIT.length
          return <FruitCircle key={i} cx={cx} cy={ROW_Y} fruit={slot.fruit} lit={lit} />
        }
        // hidden slot: empty circle until revealed
        const hi = i - boxStart
        return <FruitCircle key={i} cx={cx} cy={ROW_Y} fruit={reveal ? HIDDEN[hi] : undefined} />
      })}

      {/* the "?" cover box (hidden once revealed) */}
      {!reveal && (
        <g>
          <rect
            x={boxCx - (HIDDEN_COUNT * STEP) / 2 + 4}
            y={ROW_Y - R - 12}
            width={HIDDEN_COUNT * STEP - 8}
            height={2 * R + 24}
            rx={6}
            fill="#FFFFFF"
            stroke={RING}
            strokeWidth={3}
          />
          <text x={boxCx} y={ROW_Y + 1} fontSize={34} fontWeight={900} textAnchor="middle" dominantBaseline="central" fill={RING}>
            ?
          </text>
        </g>
      )}

      {/* arrow down to the answer circles */}
      <line x1={boxCx} y1={ROW_Y + R + 16} x2={boxCx} y2={ANS_Y - R - 10} stroke={RING} strokeWidth={3} />
      <polygon
        points={`${boxCx - 7},${ANS_Y - R - 12} ${boxCx + 7},${ANS_Y - R - 12} ${boxCx},${ANS_Y - R - 2}`}
        fill={RING}
      />

      {/* three answer circles */}
      {Array.from({ length: HIDDEN_COUNT }, (_, i) => {
        const cx = boxCx + (i - (HIDDEN_COUNT - 1) / 2) * STEP
        return <FruitCircle key={`a${i}`} cx={cx} cy={ANS_Y} fruit={fillAnswer ? HIDDEN[i] : undefined} lit={fillAnswer} />
      })}
    </svg>
  )
}

export default function P21G2Q19Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A line of circles holding bananas and green apples in a repeating pattern. Three circles in the middle are covered by a box marked with a question mark, with an arrow pointing to three empty answer circles below."
    >
      <Q19Diagram />
    </div>
  )
}
