// SEAMOX-24-A-Q5 — "Draw the missing diagram in your answer script."
// Three-row analogy: [A] + [B] → [result]. Row 3 A is the unknown (?).
// Rule (from rows 1–2): result = A minus what B contributes.
// Reverse for row 3: ? = plain-square + X = square overlaid with X.
// No matching primitive in PRIMITIVE-INDEX → fresh SVG.
// PatternRuleX24A5Diagram is co-exported for the explainer to reuse.

const BLUE = '#2563EB'
const INK = '#1F2937'
const STROKE = '#374151'
const HL_BG = '#FEF3C7'
const HL_STK = '#F59E0B'
const ANS_BG = '#D1FAE5'

const W = 490
const H = 345

// Column X centres
const AX = 60    // figure A
const PLX = 150  // "+" operator
const BX = 240   // figure B
const ARX = 330  // "→" arrow
const RX = 420   // result

// Row Y centres
const R1Y = 58
const R2Y = 173
const R3Y = 283

const CR = 36  // circle radius

// Blue sector angle ranges [start, end] in standard math degrees (SVG y-down)
// Three 60° sectors alternating, starting at 12-o'clock
const BLUE_SECTORS: [number, number][] = [[-90, -30], [30, 90], [150, 210]]

function sectorPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const p = (d: number) => (d * Math.PI) / 180
  const x0 = cx + r * Math.cos(p(a0)), y0 = cy + r * Math.sin(p(a0))
  const x1 = cx + r * Math.cos(p(a1)), y1 = cy + r * Math.sin(p(a1))
  return `M${cx},${cy} L${x0},${y0} A${r},${r} 0 0,1 ${x1},${y1}Z`
}

/** Row 1 A: circle with three alternating blue sectors */
function CircleWithSectors({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={CR} fill="white" stroke={STROKE} strokeWidth={2} />
      {BLUE_SECTORS.map(([a0, a1], i) => (
        <path key={i} d={sectorPath(cx, cy, CR, a0, a1)} fill={BLUE} />
      ))}
      <circle cx={cx} cy={cy} r={CR} fill="none" stroke={STROKE} strokeWidth={2} />
    </g>
  )
}

/** Row 1 result: blue sectors only (no circle outline) */
function SectorsOnly({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {BLUE_SECTORS.map(([a0, a1], i) => (
        <path key={i} d={sectorPath(cx, cy, CR, a0, a1)} fill={BLUE} stroke={STROKE} strokeWidth={1} />
      ))}
    </g>
  )
}

// Equilateral triangle geometry (half-base 38, height ≈ 66)
// For centre (cx, cy): top=(cx, cy-44), BL=(cx-38, cy+22), BR=(cx+38, cy+22)
// Medial midpoints: mL=(cx-19, cy-11), mR=(cx+19, cy-11), mBot=(cx, cy+22)

/** Row 2 A: large triangle divided into 4 sub-triangles via medial lines */
function BigTriangle({ cx, cy }: { cx: number; cy: number }) {
  const pts = `${cx},${cy - 44} ${cx - 38},${cy + 22} ${cx + 38},${cy + 22}`
  return (
    <g>
      <polygon points={pts} fill="white" stroke={STROKE} strokeWidth={2} />
      {/* inner medial lines connecting midpoints of each side */}
      <line x1={cx - 19} y1={cy - 11} x2={cx + 19} y2={cy - 11} stroke={STROKE} strokeWidth={1.5} />
      <line x1={cx - 19} y1={cy - 11} x2={cx}      y2={cy + 22} stroke={STROKE} strokeWidth={1.5} />
      <line x1={cx + 19} y1={cy - 11} x2={cx}      y2={cy + 22} stroke={STROKE} strokeWidth={1.5} />
    </g>
  )
}

/** Row 2 B: plain upward triangle */
function PlainTriangle({ cx, cy }: { cx: number; cy: number }) {
  return (
    <polygon
      points={`${cx},${cy - 44} ${cx - 38},${cy + 22} ${cx + 38},${cy + 22}`}
      fill="white" stroke={STROKE} strokeWidth={2}
    />
  )
}

/** Row 2 result: the centre inverted sub-triangle (medial vertices) */
function SmallInvertedTriangle({ cx, cy }: { cx: number; cy: number }) {
  return (
    <polygon
      points={`${cx - 19},${cy - 11} ${cx + 19},${cy - 11} ${cx},${cy + 22}`}
      fill="white" stroke={STROKE} strokeWidth={2}
    />
  )
}

/** Row 3 B: X shape (two crossing diagonal lines) */
function XShape({ cx, cy }: { cx: number; cy: number }) {
  const d = 32
  return (
    <g>
      <line x1={cx - d} y1={cy - d} x2={cx + d} y2={cy + d}
        stroke={STROKE} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={cx + d} y1={cy - d} x2={cx - d} y2={cy + d}
        stroke={STROKE} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  )
}

/** Row 3 result: plain square */
function PlainSquare({ cx, cy }: { cx: number; cy: number }) {
  const hs = 34
  return (
    <rect x={cx - hs} y={cy - hs} width={hs * 2} height={hs * 2}
      fill="white" stroke={STROKE} strokeWidth={2} />
  )
}

/** Answer figure: square overlaid with X */
function SquareWithX({ cx, cy, fill }: { cx: number; cy: number; fill?: string }) {
  const hs = 34, d = 26
  return (
    <g>
      <rect x={cx - hs} y={cy - hs} width={hs * 2} height={hs * 2}
        fill={fill ?? 'white'} stroke={STROKE} strokeWidth={2} />
      <line x1={cx - d} y1={cy - d} x2={cx + d} y2={cy + d}
        stroke={STROKE} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={cx + d} y1={cy - d} x2={cx - d} y2={cy + d}
        stroke={STROKE} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  )
}

// Per-row highlight bounding boxes [y, height] (8 px padding on each side)
const ROW_HL: Record<1 | 2 | 3, [number, number]> = {
  1: [R1Y - 44, 88],   // circle top at -36, give 8 extra
  2: [R2Y - 52, 82],   // triangle top at -44
  3: [R3Y - 42, 84],   // square top at -34
}

export interface PatternRuleX24A5DiagramProps {
  /** Show the answer (square + X) in row-3 A instead of "?". */
  revealAnswer?: boolean
  /** Amber highlight behind the given row. */
  highlightRow?: 1 | 2 | 3 | null
}

/** Shared diagram — used by both the stem illustration and the explainer. */
export function PatternRuleX24A5Diagram({
  revealAnswer = false,
  highlightRow = null,
}: PatternRuleX24A5DiagramProps) {
  const hl = highlightRow ? ROW_HL[highlightRow] : null

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* row highlight */}
      {hl && (
        <rect x={4} y={hl[0]} width={W - 8} height={hl[1]}
          fill={HL_BG} stroke={HL_STK} strokeWidth={2} rx={8} />
      )}

      {/* ── Row 1 ── */}
      <CircleWithSectors cx={AX} cy={R1Y} />
      <text x={PLX} y={R1Y} textAnchor="middle" dominantBaseline="central"
        fontSize={24} fontWeight={700} fill={INK}>+</text>
      <circle cx={BX} cy={R1Y} r={CR} fill="white" stroke={STROKE} strokeWidth={2} />
      <text x={ARX} y={R1Y} textAnchor="middle" dominantBaseline="central"
        fontSize={22} fontWeight={700} fill={INK}>→</text>
      <SectorsOnly cx={RX} cy={R1Y} />

      {/* ── Row 2 ── */}
      <BigTriangle cx={AX} cy={R2Y} />
      <text x={PLX} y={R2Y} textAnchor="middle" dominantBaseline="central"
        fontSize={24} fontWeight={700} fill={INK}>+</text>
      <PlainTriangle cx={BX} cy={R2Y} />
      <text x={ARX} y={R2Y} textAnchor="middle" dominantBaseline="central"
        fontSize={22} fontWeight={700} fill={INK}>→</text>
      <SmallInvertedTriangle cx={RX} cy={R2Y} />

      {/* ── Row 3 ── */}
      {revealAnswer ? (
        <SquareWithX cx={AX} cy={R3Y} fill={ANS_BG} />
      ) : (
        <text x={AX} y={R3Y} textAnchor="middle" dominantBaseline="central"
          fontSize={40} fontWeight={900} fill={INK}>?</text>
      )}
      <text x={PLX} y={R3Y} textAnchor="middle" dominantBaseline="central"
        fontSize={24} fontWeight={700} fill={INK}>+</text>
      <XShape cx={BX} cy={R3Y} />
      <text x={ARX} y={R3Y} textAnchor="middle" dominantBaseline="central"
        fontSize={22} fontWeight={700} fill={INK}>→</text>
      <PlainSquare cx={RX} cy={R3Y} />
    </svg>
  )
}

/** SEAMOX-24-A-Q5 stem illustration — shows the problem only (row 3 A = "?"). */
export default function PatternRuleX24A5Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-xl border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Three-row visual analogy. ' +
        'Row 1: circle with blue sectors + plain circle → blue sectors only. ' +
        'Row 2: triangle divided into 4 sub-triangles + plain triangle → small inverted triangle. ' +
        'Row 3: ? + X shape → plain square. Find the missing diagram.'
      }
    >
      <PatternRuleX24A5Diagram />
    </div>
  )
}
