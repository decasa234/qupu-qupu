// In-card figure for WMI-22P1A-Q7 (2022 Grade 1 Semifinal, Paper A).
//
// Stem: "The bar picture shows four ropes A, B, C, D. Write the codes from the
// longest to the shortest."  Redrawn from db/seed/wmi/figures/2022-semifinal-g1-a-q7.jpg
// — a 4-row table, one rope bar per row, all starting at the same left edge.
// Measured bar pixel-lengths from the scan (A 146, C 196, D 277, B 378) give the
// order B > D > C > A. We keep that order with clean unit lengths. The static
// figure shows ONLY the bars (no ordering, no answer).
//
// SSR-safe + deterministic: no window/document at module top, no Math.random/Date.

const INK = '#1F2937'

export interface Rope {
  code: string
  /** Length in grid units (preserves the scan's order B>D>C>A, visibly distinct). */
  len: number
  color: string
}

// Bars in the original A,B,C,D row order. Lengths chosen to match the measured
// ordering with comfortable visual gaps: A=3, B=8, C=4, D=6.
export const ROPES: Rope[] = [
  { code: 'A', len: 3, color: '#F6C28B' }, // orange
  { code: 'B', len: 8, color: '#8FCDF0' }, // blue (longest)
  { code: 'C', len: 4, color: '#F2A6A6' }, // pink/red
  { code: 'D', len: 6, color: '#CFE07F' }, // green-yellow
]

/** Ropes sorted longest → shortest. */
export const ORDER_LONGEST_FIRST = [...ROPES].sort((a, b) => b.len - a.len).map((r) => r.code)
export const ORDER_STRING = ORDER_LONGEST_FIRST.join('') // "BDCA"

export const Q7_VIEW_W = 460
export const Q7_VIEW_H = 240

const LABEL_W = 56 // left label column
const X0 = LABEL_W + 14 // bars start here
const U = 44 // one length unit in svg px
const ROW_H = 50
const BAR_H = 30
const TOP = 14

export interface Q7DiagramProps {
  /** Show each bar's measured length number inside it. */
  showLengths?: boolean
  /** Rope codes (uppercase) to spotlight; others dim. Empty = all normal. */
  spotlight?: string[]
  /** Optional rank badge per rope code (1 = longest). */
  ranks?: Record<string, number>
}

export function Q7Diagram({ showLengths = false, spotlight = [], ranks }: Q7DiagramProps) {
  const dim = (code: string) => spotlight.length > 0 && !spotlight.includes(code)
  return (
    <svg
      viewBox={`0 0 ${Q7_VIEW_W} ${Q7_VIEW_H}`}
      width="100%"
      style={{ maxWidth: Q7_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* outer table frame */}
      <rect x={4} y={TOP - 6} width={Q7_VIEW_W - 8} height={ROPES.length * ROW_H + 4} fill="white" stroke={INK} strokeWidth={2} />
      {/* vertical divider after the label column */}
      <line x1={LABEL_W} y1={TOP - 6} x2={LABEL_W} y2={TOP - 6 + ROPES.length * ROW_H + 4} stroke={INK} strokeWidth={2} />

      {ROPES.map((rope, i) => {
        const yMid = TOP + i * ROW_H + ROW_H / 2
        const faded = dim(rope.code)
        return (
          <g key={rope.code} opacity={faded ? 0.32 : 1}>
            {/* row separator */}
            {i > 0 && <line x1={4} y1={TOP - 6 + i * ROW_H} x2={Q7_VIEW_W - 4} y2={TOP - 6 + i * ROW_H} stroke={INK} strokeWidth={1.4} />}
            {/* code label */}
            <text x={LABEL_W / 2 + 2} y={yMid} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill={INK} className="font-display">
              {rope.code}
            </text>
            {/* bar */}
            <rect x={X0} y={yMid - BAR_H / 2} width={rope.len * U} height={BAR_H} rx={4} fill={rope.color} stroke={INK} strokeWidth={1.8} />
            {showLengths && (
              <text x={X0 + rope.len * U - 12} y={yMid} textAnchor="end" dominantBaseline="central" fontSize={14} fontWeight={900} fill={INK} className="font-display">
                {rope.len}
              </text>
            )}
            {ranks && ranks[rope.code] != null && (
              <g>
                <circle cx={X0 + rope.len * U + 16} cy={yMid} r={12} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={2} />
                <text x={X0 + rope.len * U + 16} y={yMid} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={900} fill="#92400E" className="font-display">
                  {ranks[rope.code]}
                </text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function P22G1Q7Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A table with four rope bars labelled A, B, C, D, all starting at the same left edge and reaching different lengths."
    >
      <Q7Diagram />
    </div>
  )
}
