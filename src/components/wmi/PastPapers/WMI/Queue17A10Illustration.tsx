// SEAMO-17-A-Q10 — "20 children queuing to buy food; Ali is 8th from the front,
// Emma is 6th from the back. How many children are between them?"
//
// Stem illustration — shows a horizontal queue of 20 children.
// Ali (position 8, blue shirt) and Emma (position 15, pink shirt) are highlighted.
// The children between them (positions 9–14) wear a neutral grey.
// All others wear plain uniform colour.
//
// Adapted from ChildrenLine7PEIllustration (IKMC-21-PE-Q7).
// Compact representation: smaller figures + position labels underneath each child.
//
// Pure SVG, no hooks, no Date, SSR-safe & deterministic.

// ── layout constants ──────────────────────────────────────────────────────────

export const SVG_W = 520
export const SVG_H = 180
export const GROUND_Y = 155

/** Total children in the queue. */
const N = 20

/** X-centre of child at position i (1-based). */
function cx(i: number): number {
  const margin = 18
  const spacing = (SVG_W - margin * 2) / N
  return margin + (i - 1) * spacing + spacing / 2
}

// ── colour palette ────────────────────────────────────────────────────────────

const COLOR = {
  BG: '#FFFFFF',
  GROUND: '#D4B896',
  GROUND_LINE: '#8B6914',
  SKIN: '#F9C784',
  SKIN_STROKE: '#C87941',
  // child categories
  SHIRT_ALI: '#3B82F6',    // blue — Ali (pos 8)
  SHIRT_EMMA: '#EC4899',   // pink — Emma (pos 15)
  SHIRT_BETWEEN: '#6EE7B7',// mint — positions 9–14 (between them)
  SHIRT_OTHER: '#D1D5DB',  // grey — everyone else
  LABEL_ALI: '#1D4ED8',
  LABEL_EMMA: '#BE185D',
  LABEL_BETWEEN: '#065F46',
  LABEL_OTHER: '#6B7280',
  PANTS: '#374151',
  TEXT: '#111827',
} as const

// ── tiny stick-figure ─────────────────────────────────────────────────────────

interface TinyChildProps {
  posX: number
  /** shirt fill colour */
  shirt: string
  /** 1-based position label */
  pos: number
  labelColor: string
}

function TinyChild({ posX, shirt, pos, labelColor }: TinyChildProps) {
  const footY = GROUND_Y
  const legLen = 20
  const kneeY = footY - legLen
  const torsoH = 18
  const shoulderY = kneeY - torsoH
  const headR = 7
  const headCY = shoulderY - headR - 3

  return (
    <g>
      {/* legs */}
      <line x1={posX - 4} y1={kneeY} x2={posX - 5} y2={footY}
        stroke={COLOR.PANTS} strokeWidth={3.5} strokeLinecap="round" />
      <line x1={posX + 4} y1={kneeY} x2={posX + 5} y2={footY}
        stroke={COLOR.PANTS} strokeWidth={3.5} strokeLinecap="round" />

      {/* arms */}
      <line x1={posX - 6} y1={shoulderY + 4} x2={posX - 14} y2={shoulderY + 10}
        stroke={COLOR.SKIN} strokeWidth={3} strokeLinecap="round" />
      <line x1={posX + 6} y1={shoulderY + 4} x2={posX + 14} y2={shoulderY + 10}
        stroke={COLOR.SKIN} strokeWidth={3} strokeLinecap="round" />

      {/* torso */}
      <rect x={posX - 6} y={shoulderY} width={12} height={torsoH}
        rx={3} fill={shirt} stroke="#1F2937" strokeWidth={0.8} />

      {/* neck */}
      <line x1={posX} y1={shoulderY} x2={posX} y2={shoulderY - 4}
        stroke={COLOR.SKIN} strokeWidth={4} strokeLinecap="round" />

      {/* head */}
      <circle cx={posX} cy={headCY} r={headR}
        fill={COLOR.SKIN} stroke={COLOR.SKIN_STROKE} strokeWidth={1} />

      {/* hair */}
      <path
        d={`M ${posX - headR} ${headCY} A ${headR} ${headR} 0 0 1 ${posX + headR} ${headCY}`}
        fill="#5C3B1E" stroke="none"
      />

      {/* position number */}
      <text
        x={posX}
        y={GROUND_Y + 14}
        textAnchor="middle"
        fontSize={pos === 8 || pos === 15 ? 9 : 7.5}
        fontWeight={pos === 8 || pos === 15 ? 'bold' : 'normal'}
        fill={labelColor}
        fontFamily="sans-serif"
      >{pos}</text>
    </g>
  )
}

// ── helper: classify each position ───────────────────────────────────────────

function shirtColor(pos: number): string {
  if (pos === 8)  return COLOR.SHIRT_ALI
  if (pos === 15) return COLOR.SHIRT_EMMA
  if (pos >= 9 && pos <= 14) return COLOR.SHIRT_BETWEEN
  return COLOR.SHIRT_OTHER
}

function labelColor(pos: number): string {
  if (pos === 8)  return COLOR.LABEL_ALI
  if (pos === 15) return COLOR.LABEL_EMMA
  if (pos >= 9 && pos <= 14) return COLOR.LABEL_BETWEEN
  return COLOR.LABEL_OTHER
}

// ── default export ────────────────────────────────────────────────────────────

/**
 * Queue17A10Illustration
 *
 * Stem figure for SEAMO-17-A-Q10.
 * Shows 20 children queuing left-to-right. Ali (8th, blue) and Emma (15th, pink)
 * are labelled; the children between them (positions 9–14, mint) are visually grouped.
 */
export default function Queue17A10Illustration() {
  return (
    <div
      className="my-4 flex flex-col items-center gap-1"
      role="img"
      aria-label="20 anak mengantri dari kiri ke kanan. Ali berada di posisi ke-8 (baju biru) dan Emma di posisi ke-15 (baju merah muda). Enam anak di posisi 9 sampai 14 berada di antara mereka."
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(600, SVG_W)}
        style={{ display: 'block', maxWidth: '100%' }}
        aria-hidden="true"
      >
        {/* background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

        {/* ground strip */}
        <rect x={0} y={GROUND_Y} width={SVG_W} height={SVG_H - GROUND_Y}
          fill={COLOR.GROUND} />
        <line x1={0} y1={GROUND_Y} x2={SVG_W} y2={GROUND_Y}
          stroke={COLOR.GROUND_LINE} strokeWidth={1.5} />

        {/* "FRONT" and "BACK" labels */}
        <text x={8} y={GROUND_Y - 55} fontSize={9} fill="#9CA3AF"
          fontFamily="sans-serif" fontWeight="bold">FRONT</text>
        <text x={SVG_W - 36} y={GROUND_Y - 55} fontSize={9} fill="#9CA3AF"
          fontFamily="sans-serif" fontWeight="bold">BACK</text>

        {/* direction arrow (front → back) */}
        <line x1={28} y1={GROUND_Y - 48} x2={SVG_W - 10} y2={GROUND_Y - 48}
          stroke="#D1D5DB" strokeWidth={1} />
        <polygon
          points={`${SVG_W - 10},${GROUND_Y - 51} ${SVG_W - 3},${GROUND_Y - 48} ${SVG_W - 10},${GROUND_Y - 45}`}
          fill="#D1D5DB"
        />

        {/* name labels for Ali and Emma */}
        <text x={cx(8)} y={GROUND_Y - 88} textAnchor="middle" fontSize={10}
          fontWeight="bold" fill={COLOR.LABEL_ALI} fontFamily="sans-serif">Ali</text>
        <line x1={cx(8)} y1={GROUND_Y - 85} x2={cx(8)} y2={GROUND_Y - 65}
          stroke={COLOR.LABEL_ALI} strokeWidth={1} strokeDasharray="2 2" />

        <text x={cx(15)} y={GROUND_Y - 88} textAnchor="middle" fontSize={10}
          fontWeight="bold" fill={COLOR.LABEL_EMMA} fontFamily="sans-serif">Emma</text>
        <line x1={cx(15)} y1={GROUND_Y - 85} x2={cx(15)} y2={GROUND_Y - 65}
          stroke={COLOR.LABEL_EMMA} strokeWidth={1} strokeDasharray="2 2" />

        {/* bracket highlighting positions 9–14 */}
        <rect
          x={cx(9) - 10} y={GROUND_Y - 63}
          width={cx(14) - cx(9) + 20} height={58}
          rx={4} fill="none"
          stroke={COLOR.SHIRT_BETWEEN} strokeWidth={1.5} strokeDasharray="3 2"
          opacity={0.7}
        />

        {/* all 20 children */}
        {Array.from({ length: N }, (_, k) => k + 1).map(pos => (
          <TinyChild
            key={pos}
            posX={cx(pos)}
            shirt={shirtColor(pos)}
            pos={pos}
            labelColor={labelColor(pos)}
          />
        ))}
      </svg>

      {/* legend */}
      <div className="flex gap-4 text-xs" style={{ fontFamily: 'sans-serif' }}>
        <span style={{ color: COLOR.LABEL_ALI }}>
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              background: COLOR.SHIRT_ALI,
              borderRadius: 2,
              marginRight: 3,
              verticalAlign: 'middle',
            }}
          />
          Ali (ke-8)
        </span>
        <span style={{ color: COLOR.LABEL_EMMA }}>
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              background: COLOR.SHIRT_EMMA,
              borderRadius: 2,
              marginRight: 3,
              verticalAlign: 'middle',
            }}
          />
          Emma (ke-15)
        </span>
        <span style={{ color: COLOR.LABEL_BETWEEN }}>
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              background: COLOR.SHIRT_BETWEEN,
              borderRadius: 2,
              marginRight: 3,
              verticalAlign: 'middle',
            }}
          />
          Di antara (6 anak)
        </span>
      </div>
    </div>
  )
}
