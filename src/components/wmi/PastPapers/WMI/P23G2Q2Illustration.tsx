// WMI-23P2A-Q2 (2023 Semifinal Grade 2, Paper A) — apple divisibility.
//
// Figure (db/seed/wmi/figures/2023-semifinal-g2-a-q2.jpg): a loose scatter of
// red apples on a pale-green panel. Connected-component count of the real scan
// gives exactly 30 apples, laid out as three rows of 10.
//
// Stem: "Which number of people can the apples NOT be divided into equally?"
//   30 ÷ 6 = 5   ✓   30 ÷ 5 = 6   ✓   30 ÷ 3 = 10  ✓   30 ÷ 4 = 7.5  ✗
// Answer C (4): 30 is NOT divisible by 4 (the other choices all divide 30).
//
// The static figure shows ONLY the apples — never the count or any grouping.
export const APPLE_ROWS = [10, 10, 10] as const
export const APPLE_TOTAL = APPLE_ROWS.reduce((a, b) => a + b, 0) // 30

const APPLE_RED = '#E23B3B'
const APPLE_SHINE = '#F6A6A6'
const LEAF = '#3CA34A'
const STEM = '#5A3A22'

/** One stylized apple centred at (x, y); `r` is the body radius. */
export function Apple({ x, y, r = 16 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      {/* stem */}
      <path
        d={`M ${x} ${y - r * 0.7} q ${r * 0.18} ${-r * 0.5} ${r * 0.05} ${-r * 0.9}`}
        fill="none"
        stroke={STEM}
        strokeWidth={r * 0.16}
        strokeLinecap="round"
      />
      {/* leaf */}
      <ellipse
        cx={x + r * 0.5}
        cy={y - r * 1.25}
        rx={r * 0.5}
        ry={r * 0.24}
        fill={LEAF}
        transform={`rotate(-28 ${x + r * 0.5} ${y - r * 1.25})`}
      />
      {/* two lobes make the classic apple silhouette */}
      <circle cx={x - r * 0.34} cy={y} r={r * 0.82} fill={APPLE_RED} />
      <circle cx={x + r * 0.34} cy={y} r={r * 0.82} fill={APPLE_RED} />
      <ellipse cx={x} cy={y + r * 0.1} rx={r} ry={r * 0.95} fill={APPLE_RED} />
      {/* highlight */}
      <ellipse
        cx={x - r * 0.38}
        cy={y - r * 0.32}
        rx={r * 0.26}
        ry={r * 0.42}
        fill={APPLE_SHINE}
        opacity={0.85}
        transform={`rotate(-18 ${x - r * 0.38} ${y - r * 0.32})`}
      />
    </g>
  )
}

export const APPLES_VIEW_W = 560
export const APPLES_VIEW_H = 240

const ROW_Y = [70, 140, 210]
const FIRST_X = 56
const GAP_X = 50

/** Centre of apple at flat index i (0..29) on the tidy 3×10 grid. */
function appleAt(i: number): { x: number; y: number } {
  const r = Math.floor(i / 10)
  const c = i % 10
  return { x: FIRST_X + c * GAP_X, y: ROW_Y[r] }
}

export interface AppleFieldProps {
  /** Apples highlighted (ringed) so far, in reading order (top→bottom, left→right). */
  ringedCount?: number
  /** Optional ring colour for the highlighted apples (used by the explainer). */
  ringColor?: string
  /**
   * Partition all 30 apples into equal groups of this size, drawing a tinted box
   * around each full group. Any leftover apples (when 30 isn't a multiple) glow red.
   */
  groupBy?: number
  /** Box colour for full groups. */
  groupColor?: string
}

export function AppleField({ ringedCount = 0, ringColor = '#2563EB', groupBy = 0, groupColor = '#10B981' }: AppleFieldProps) {
  let idx = 0
  // Build group boxes (bounding rect over each consecutive block of `groupBy`).
  const boxes: Array<{ x: number; y: number; w: number; h: number; full: boolean }> = []
  const leftover: number[] = []
  if (groupBy > 0) {
    for (let start = 0; start < APPLE_TOTAL; start += groupBy) {
      const end = Math.min(start + groupBy, APPLE_TOTAL)
      const full = end - start === groupBy
      const pts = Array.from({ length: end - start }, (_, k) => appleAt(start + k))
      const xs = pts.map((p) => p.x)
      const ys = pts.map((p) => p.y)
      const x0 = Math.min(...xs) - 22
      const x1 = Math.max(...xs) + 22
      const y0 = Math.min(...ys) - 22
      const y1 = Math.max(...ys) + 22
      if (full) boxes.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0, full })
      else for (let k = start; k < end; k++) leftover.push(k)
    }
  }
  const leftoverSet = new Set(leftover)
  return (
    <svg
      viewBox={`0 0 ${APPLES_VIEW_W} ${APPLES_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 560, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <rect x={6} y={10} width={APPLES_VIEW_W - 12} height={APPLES_VIEW_H - 20} rx={24} fill="#E4F0E2" />
      {boxes.map((b, i) => (
        <rect
          key={`box${i}`}
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          rx={14}
          fill={groupColor}
          fillOpacity={0.14}
          stroke={groupColor}
          strokeWidth={2.5}
        />
      ))}
      {APPLE_ROWS.map((count, r) =>
        Array.from({ length: count }, (_, c) => {
          const here = idx++
          const x = FIRST_X + c * GAP_X
          const y = ROW_Y[r]
          return (
            <g key={`a${r}-${c}`}>
              {here < ringedCount && (
                <circle cx={x} cy={y} r={24} fill="none" stroke={ringColor} strokeWidth={3} opacity={0.9} />
              )}
              {leftoverSet.has(here) && (
                <circle cx={x} cy={y} r={24} fill="#FECACA" fillOpacity={0.55} stroke="#DC2626" strokeWidth={3} />
              )}
              <Apple x={x} y={y} r={16} />
            </g>
          )
        }),
      )}
    </svg>
  )
}

export default function P23G2Q2Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A pile of apples shown on a green panel, arranged in three rows of ten — thirty apples in all."
    >
      <AppleField />
    </div>
  )
}
