// HKIMO-25-P2H-Q20 — Symbol-pattern sequence (fill-in)
// Groups: ■★•••▲ | ■★••▲▲ | ■★•▲▲▲ | ■★[?]▲▲
// Dots decrease 3→2→1→0; triangles increase 1→2→3→4 per group.
// Answer (fill-in): ▲▲  (blank holds first 2 of 4 triangles in group 4)
// Adapted from Pattern4PEIllustration structure.
// Pure SVG. SSR-safe. No hooks.

export const BLUE = '#30598A'
export const INK = '#1F2937'
export const DOT_FILL = '#64748B'
export const TRI_FILL = '#F59E0B'
export const TRI_HL = '#10B981'

export const CELL_STEP = 30
export const X0 = 52
export const Y0 = 56
export const ROW_STEP = 40
export const VIEW_W = 228
export const VIEW_H = 195

export type SymKind = 'sq' | 'star' | 'dot' | 'tri' | 'blank'

export const GROUPS: ReadonlyArray<ReadonlyArray<SymKind>> = [
  ['sq', 'star', 'dot', 'dot', 'dot', 'tri'],
  ['sq', 'star', 'dot', 'dot', 'tri', 'tri'],
  ['sq', 'star', 'dot', 'tri', 'tri', 'tri'],
  ['sq', 'star', 'blank', 'tri', 'tri'],
] as const

export interface Slot { kind: SymKind; cx: number; cy: number }

/** Pre-compute slot positions for one group row at vertical centre cy.
 *  'blank' spans 2 column-widths; its cx is the midpoint of those 2 columns. */
export function getGroupSlots(group: ReadonlyArray<SymKind>, cy: number): Slot[] {
  const slots: Slot[] = []
  let col = 0
  for (const kind of group) {
    const cx =
      kind === 'blank'
        ? X0 + (col + 0.5) * CELL_STEP
        : X0 + col * CELL_STEP
    slots.push({ kind, cx, cy })
    col += kind === 'blank' ? 2 : 1
  }
  return slots
}

interface SymProps { cx: number; cy: number; fill?: string }

export function SqSym({ cx, cy, fill = INK }: SymProps) {
  return <rect x={cx - 9} y={cy - 9} width={18} height={18} fill={fill} rx={1} />
}

export function StarSym({ cx, cy, fill = INK }: SymProps) {
  return (
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={16}
      fill={fill}
    >
      ★
    </text>
  )
}

export function DotSym({ cx, cy, fill = DOT_FILL }: SymProps) {
  return <circle cx={cx} cy={cy} r={7} fill={fill} />
}

export function TriSym({ cx, cy, fill = TRI_FILL }: SymProps) {
  return (
    <polygon
      points={`${cx},${cy - 10} ${cx + 10},${cy + 6} ${cx - 10},${cy + 6}`}
      fill={fill}
    />
  )
}

interface BlankProps { cx: number; cy: number; filled?: boolean }
export function BlankSym({ cx, cy, filled = false }: BlankProps) {
  const bw = CELL_STEP + 14
  if (filled) {
    return (
      <g>
        <rect
          x={cx - bw / 2}
          y={cy - 11}
          width={bw}
          height={22}
          rx={4}
          fill="rgba(16,185,129,0.15)"
          stroke={TRI_HL}
          strokeWidth={1.8}
        />
        <TriSym cx={cx - 9} cy={cy} fill={TRI_HL} />
        <TriSym cx={cx + 9} cy={cy} fill={TRI_HL} />
      </g>
    )
  }
  return (
    <g>
      <rect
        x={cx - bw / 2}
        y={cy - 11}
        width={bw}
        height={22}
        rx={4}
        fill="#EEF2FF"
        stroke={BLUE}
        strokeWidth={1.8}
        strokeDasharray="5 3"
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        fill={BLUE}
      >
        ?
      </text>
    </g>
  )
}

export interface RenderSlotOpts {
  dotFill?: string
  triFill?: string
  blankFilled?: boolean
}

export function renderSlot(slot: Slot, key: string, opts: RenderSlotOpts = {}) {
  const { cx, cy, kind } = slot
  const { dotFill = DOT_FILL, triFill = TRI_FILL, blankFilled = false } = opts
  if (kind === 'sq') return <SqSym key={key} cx={cx} cy={cy} />
  if (kind === 'star') return <StarSym key={key} cx={cx} cy={cy} />
  if (kind === 'dot') return <DotSym key={key} cx={cx} cy={cy} fill={dotFill} />
  if (kind === 'tri') return <TriSym key={key} cx={cx} cy={cy} fill={triFill} />
  if (kind === 'blank') return <BlankSym key={key} cx={cx} cy={cy} filled={blankFilled} />
  return null
}

export default function SymbolPatternHK25P2Q20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Symbol pattern sequence: 4 groups each starting with square and star; dots decrease and triangles increase by 1 per group; group 4 has a blank to fill."
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        <text
          x={VIEW_W / 2}
          y={18}
          textAnchor="middle"
          fontSize={11}
          fontWeight={800}
          fill={BLUE}
          className="font-display"
        >
          Pattern / Pola
        </text>

        {GROUPS.map((group, gi) => {
          const cy = Y0 + gi * ROW_STEP
          const slots = getGroupSlots(group, cy)
          return (
            <g key={gi}>
              <text
                x={22}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={11}
                fontWeight={700}
                fill={INK}
                className="font-display"
              >
                {gi + 1}:
              </text>
              {slots.map((slot, si) => renderSlot(slot, `g${gi}-s${si}`))}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
