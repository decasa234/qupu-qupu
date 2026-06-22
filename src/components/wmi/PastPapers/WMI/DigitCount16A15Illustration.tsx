// SEAMO-16-A-Q15 — Digit counting from 1 to 59.
//
// Problem: Jane writes 1 2 3 4 5 6 7 8 9 10 11 12 … 57 58 59.
// How many digits did she write altogether?
// Answer: B — 109
//
// Strategy: split into two groups:
//   1-digit numbers 1–9:  9 numbers × 1 digit =  9 digits
//   2-digit numbers 10–59: 50 numbers × 2 digits = 100 digits
//   Total = 9 + 100 = 109
//
// The stem figure (paper shows "1 2 3 4 5 6 7 8 9 10 11 12 … … 57 58 59")
// with a decorative pen glyph. We reconstruct the number sequence split into
// two colour-coded groups with digit-count annotations.
//
// Pure render — no framer-motion, no hooks. SSR-safe.

// ── Layout constants ──────────────────────────────────────────────────────────

const SVG_W = 360
const SVG_H = 210

// Colours
const ORANGE   = '#EA580C'  // group-1 (1-digit)
const ORANGE_BG = '#FFF7ED'
const BLUE     = '#2563EB'  // group-2 (2-digit)
const BLUE_BG  = '#EFF6FF'
const INK      = '#1F2937'
const MUTED    = '#6B7280'
const GREEN    = '#065F46'
const GREEN_BG = '#D1FAE5'
const GREEN_BORDER = '#10B981'

// ── Single digit box ──────────────────────────────────────────────────────────

function DigitBox({
  x, y, label, fill, ink,
}: { x: number; y: number; label: string; fill: string; ink: string }) {
  return (
    <g>
      <rect x={x} y={y} width={24} height={24} rx={4} fill={fill} />
      <text
        x={x + 12}
        y={y + 14}
        textAnchor="middle"
        dominantBaseline="auto"
        fontFamily="system-ui, sans-serif"
        fontWeight={700}
        fontSize={12}
        fill={ink}
      >
        {label}
      </text>
    </g>
  )
}

// ── Row of number boxes ───────────────────────────────────────────────────────

interface RowConfig {
  numbers: string[]
  startX: number
  y: number
  boxW: number
  gap: number
  fill: string
  ink: string
  /** Show "…" ellipsis after last visible number */
  ellipsis?: boolean
}

function NumberBoxRow({ numbers, startX, y, boxW, gap, fill, ink, ellipsis }: RowConfig) {
  const nodes: React.ReactNode[] = []
  numbers.forEach((n, i) => {
    const x = startX + i * (boxW + gap)
    nodes.push(
      <g key={n}>
        <rect x={x} y={y} width={boxW} height={26} rx={4} fill={fill} />
        <text
          x={x + boxW / 2}
          y={y + 15}
          textAnchor="middle"
          dominantBaseline="auto"
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          fontSize={12}
          fill={ink}
        >
          {n}
        </text>
      </g>,
    )
  })
  if (ellipsis) {
    const x = startX + numbers.length * (boxW + gap)
    nodes.push(
      <text
        key="ellipsis"
        x={x + 6}
        y={y + 15}
        textAnchor="start"
        dominantBaseline="auto"
        fontFamily="system-ui, sans-serif"
        fontWeight={700}
        fontSize={14}
        fill={ink}
      >
        …
      </text>,
    )
  }
  return <g>{nodes}</g>
}

// ── Exported geometry (shared with explainer) ─────────────────────────────────

export const GROUP1 = { count: 9,  digits: 1, total:   9 } as const  // 1–9
export const GROUP2 = { count: 50, digits: 2, total: 100 } as const  // 10–59
export const GRAND_TOTAL = GROUP1.total + GROUP2.total                // 109

// ── Main illustration ─────────────────────────────────────────────────────────

export interface DigitCountDiagramProps {
  /** Whether to show the final total annotation */
  showTotal?: boolean
  /** 0 = no groups lit, 1 = group1 lit, 2 = both lit */
  revealedGroups?: 0 | 1 | 2
}

export function DigitCountDiagram({
  showTotal = false,
  revealedGroups = 2,
}: DigitCountDiagramProps) {
  // Group 1: show 1–9 (all 9)
  const g1numbers = ['1','2','3','4','5','6','7','8','9']
  const g1StartX = 14
  const g1Y = 24
  const g1BoxW = 24
  const g1Gap = 4

  // Group 2: show 10, 11, 12, …, 58, 59 (a sample)
  const g2sample = ['10','11','12']
  const g2end    = ['57','58','59']
  const g2StartX = 14
  const g2Y = 104
  const g2BoxW = 30
  const g2Gap = 4

  const g1Active = revealedGroups >= 1
  const g2Active = revealedGroups >= 2

  // Annotation x positions
  const g1BraceX = g1StartX + g1numbers.length * (g1BoxW + g1Gap) + 4
  const g2BraceX = g2StartX + (g2sample.length + g2end.length + 1) * (g2BoxW + g2Gap) + 4

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={Math.min(SVG_W, 360)}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {/* white background */}
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

      {/* ── GROUP 1: 1-digit numbers 1–9 ──────────────────────────── */}
      {/* Background band */}
      <rect x={8} y={g1Y - 8} width={SVG_W - 16} height={44} rx={8}
        fill={g1Active ? ORANGE_BG : '#F9FAFB'}
        stroke={g1Active ? ORANGE : '#E5E7EB'}
        strokeWidth={1.5}
      />
      {/* Number boxes */}
      <NumberBoxRow
        numbers={g1numbers}
        startX={g1StartX}
        y={g1Y}
        boxW={g1BoxW}
        gap={g1Gap}
        fill={g1Active ? ORANGE : '#E5E7EB'}
        ink={g1Active ? '#FFF7ED' : MUTED}
      />
      {/* Brace annotation */}
      <text
        x={g1BraceX}
        y={g1Y + 14}
        textAnchor="start"
        dominantBaseline="auto"
        fontFamily="system-ui, sans-serif"
        fontWeight={700}
        fontSize={11}
        fill={g1Active ? ORANGE : MUTED}
      >
        9 × 1 = 9 digits
      </text>

      {/* Group 1 label */}
      <text
        x={14}
        y={g1Y - 12}
        textAnchor="start"
        dominantBaseline="auto"
        fontFamily="system-ui, sans-serif"
        fontWeight={800}
        fontSize={10}
        fill={g1Active ? ORANGE : MUTED}
      >
        1-digit numbers (1–9)
      </text>

      {/* ── GROUP 2: 2-digit numbers 10–59 ────────────────────────── */}
      {/* Background band */}
      <rect x={8} y={g2Y - 8} width={SVG_W - 16} height={44} rx={8}
        fill={g2Active ? BLUE_BG : '#F9FAFB'}
        stroke={g2Active ? BLUE : '#E5E7EB'}
        strokeWidth={1.5}
      />
      {/* Number boxes: 10 11 12 … 57 58 59 */}
      <NumberBoxRow
        numbers={g2sample}
        startX={g2StartX}
        y={g2Y}
        boxW={g2BoxW}
        gap={g2Gap}
        fill={g2Active ? BLUE : '#E5E7EB'}
        ink={g2Active ? '#EFF6FF' : MUTED}
        ellipsis
      />
      {/* ellipsis gap then end numbers */}
      {(() => {
        const ellipsisW = 20
        const endStartX = g2StartX + (g2sample.length) * (g2BoxW + g2Gap) + ellipsisW + 6
        return (
          <NumberBoxRow
            numbers={g2end}
            startX={endStartX}
            y={g2Y}
            boxW={g2BoxW}
            gap={g2Gap}
            fill={g2Active ? BLUE : '#E5E7EB'}
            ink={g2Active ? '#EFF6FF' : MUTED}
          />
        )
      })()}
      {/* Annotation */}
      <text
        x={g2BraceX}
        y={g2Y + 14}
        textAnchor="start"
        dominantBaseline="auto"
        fontFamily="system-ui, sans-serif"
        fontWeight={700}
        fontSize={11}
        fill={g2Active ? BLUE : MUTED}
      >
        50 × 2 = 100 digits
      </text>

      {/* Group 2 label */}
      <text
        x={14}
        y={g2Y - 12}
        textAnchor="start"
        dominantBaseline="auto"
        fontFamily="system-ui, sans-serif"
        fontWeight={800}
        fontSize={10}
        fill={g2Active ? BLUE : MUTED}
      >
        2-digit numbers (10–59)
      </text>

      {/* ── TOTAL ─────────────────────────────────────────────────── */}
      {showTotal && (
        <g>
          <rect x={14} y={165} width={SVG_W - 28} height={34} rx={8}
            fill={GREEN_BG}
            stroke={GREEN_BORDER}
            strokeWidth={2}
          />
          <text
            x={SVG_W / 2}
            y={183}
            textAnchor="middle"
            dominantBaseline="auto"
            fontFamily="system-ui, sans-serif"
            fontWeight={800}
            fontSize={14}
            fill={GREEN}
          >
            Total: 9 + 100 = 109 digits ✓
          </text>
        </g>
      )}

      {/* Separator label: when total not shown, show a + sign between groups */}
      {!showTotal && revealedGroups === 2 && (
        <text
          x={SVG_W / 2}
          y={87}
          textAnchor="middle"
          dominantBaseline="auto"
          fontFamily="system-ui, sans-serif"
          fontWeight={800}
          fontSize={18}
          fill={INK}
        >
          +
        </text>
      )}
    </svg>
  )
}

// ── Default export ─────────────────────────────────────────────────────────────

/**
 * DigitCount16A15Illustration
 *
 * Static, problem-only figure for SEAMO-16-A-Q15.
 * Shows Jane's number sequence 1–59 split into two colour-coded groups:
 *   • Orange: 1-digit numbers 1–9  (9 × 1 = 9 digits)
 *   • Blue:   2-digit numbers 10–59 (50 × 2 = 100 digits)
 * Never reveals the total (shown by the explainer).
 */
export default function DigitCount16A15Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Barisan bilangan 1 sampai 59: kelompok 1-digit (1–9) berwarna oranye dengan 9 kotak, ' +
        'diikuti kelompok 2-digit (10–59) berwarna biru dengan contoh 10, 11, 12, …, 57, 58, 59.'
      }
    >
      <DigitCountDiagram showTotal={false} revealedGroups={2} />
    </div>
  )
}
