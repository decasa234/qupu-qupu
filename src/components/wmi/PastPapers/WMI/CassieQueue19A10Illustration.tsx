// SEAMO-19-A-Q10 — "Cassie is 12th from front and 5th from back. How many people in queue?"
//
// Stem illustration — shows a horizontal queue of 16 people.
// Cassie (position 12, pink shirt) is highlighted.
// The 11 people in front (positions 1–11) wear a neutral grey.
// The 4 people behind her (positions 13–16) wear light blue.
// Direction arrows and "FRONT" / "BACK" labels orient the viewer.
//
// Copied from Queue17A10Illustration (SEAMO-17-A-Q10) and adapted:
//   N = 16, highlighted person = Cassie at pos 12.
//   Front group (1–11), Cassie (12), back group (13–16).
//   The stem does NOT reveal the count — it shows the queue and marks Cassie.
//
// Pure SVG, no hooks, no Date, SSR-safe & deterministic.

// ── layout constants ──────────────────────────────────────────────────────────

export const SVG_W = 520
export const SVG_H = 180
export const GROUND_Y = 155

/** Total people in queue (the answer — shown in the stem figure). */
const N = 16

/** X-centre of person at position i (1-based). */
export function cx(i: number): number {
  const margin = 18
  const spacing = (SVG_W - margin * 2) / N
  return margin + (i - 1) * spacing + spacing / 2
}

// ── colour palette ────────────────────────────────────────────────────────────

export const COLOR = {
  BG: '#FFFFFF',
  GROUND: '#D4B896',
  GROUND_LINE: '#8B6914',
  SKIN: '#F9C784',
  SKIN_STROKE: '#C87941',
  SHIRT_CASSIE: '#EC4899',   // pink — Cassie (pos 12)
  SHIRT_FRONT:  '#D1D5DB',   // grey — positions 1–11 (in front)
  SHIRT_BACK:   '#93C5FD',   // light blue — positions 13–16 (behind)
  LABEL_CASSIE: '#BE185D',
  LABEL_FRONT:  '#6B7280',
  LABEL_BACK:   '#1D4ED8',
  PANTS: '#374151',
  TEXT: '#111827',
} as const

// ── tiny stick-figure ─────────────────────────────────────────────────────────

interface TinyPersonProps {
  posX: number
  shirt: string
  pos: number
  labelColor: string
  bold?: boolean
}

export function TinyPerson({ posX, shirt, pos, labelColor, bold }: TinyPersonProps) {
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
        fontSize={bold ? 9 : 7.5}
        fontWeight={bold ? 'bold' : 'normal'}
        fill={labelColor}
        fontFamily="sans-serif"
      >{pos}</text>
    </g>
  )
}

// ── helper: classify each position ───────────────────────────────────────────

function shirtColor(pos: number): string {
  if (pos === 12) return COLOR.SHIRT_CASSIE
  if (pos >= 13)  return COLOR.SHIRT_BACK
  return COLOR.SHIRT_FRONT
}

function labelColor(pos: number): string {
  if (pos === 12) return COLOR.LABEL_CASSIE
  if (pos >= 13)  return COLOR.LABEL_BACK
  return COLOR.LABEL_FRONT
}

// ── default export ────────────────────────────────────────────────────────────

/**
 * CassieQueue19A10Illustration
 *
 * Stem figure for SEAMO-19-A-Q10.
 * Shows 16 people queuing left-to-right. Cassie (12th, pink) is labelled.
 * Front group (1–11, grey) and back group (13–16, blue) are visually distinct.
 * The stem does NOT state the count — that is what students must find.
 */
export default function CassieQueue19A10Illustration() {
  return (
    <div
      className="my-4 flex flex-col items-center gap-1"
      role="img"
      aria-label="Antrian orang dari depan ke belakang. Cassie berada di posisi ke-12 dari depan (baju merah muda). Ada 11 orang di depannya (abu-abu) dan 4 orang di belakangnya (biru)."
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

        {/* direction arrow */}
        <line x1={28} y1={GROUND_Y - 48} x2={SVG_W - 10} y2={GROUND_Y - 48}
          stroke="#D1D5DB" strokeWidth={1} />
        <polygon
          points={`${SVG_W - 10},${GROUND_Y - 51} ${SVG_W - 3},${GROUND_Y - 48} ${SVG_W - 10},${GROUND_Y - 45}`}
          fill="#D1D5DB"
        />

        {/* Cassie name label */}
        <text x={cx(12)} y={GROUND_Y - 88} textAnchor="middle" fontSize={10}
          fontWeight="bold" fill={COLOR.LABEL_CASSIE} fontFamily="sans-serif">Cassie</text>
        <line x1={cx(12)} y1={GROUND_Y - 85} x2={cx(12)} y2={GROUND_Y - 65}
          stroke={COLOR.LABEL_CASSIE} strokeWidth={1} strokeDasharray="2 2" />

        {/* bracket labelling "12th from front" */}
        <rect
          x={cx(1) - 10} y={GROUND_Y - 63}
          width={cx(12) - cx(1) + 20} height={58}
          rx={4} fill="none"
          stroke="#6B7280" strokeWidth={1} strokeDasharray="3 2"
          opacity={0.5}
        />
        <text x={(cx(1) + cx(12)) / 2} y={GROUND_Y - 66} textAnchor="middle"
          fontSize={7.5} fill="#6B7280" fontFamily="sans-serif">12th from front</text>

        {/* bracket labelling "5th from back" */}
        <rect
          x={cx(12) - 10} y={GROUND_Y - 63}
          width={cx(16) - cx(12) + 20} height={58}
          rx={4} fill="none"
          stroke="#1D4ED8" strokeWidth={1} strokeDasharray="3 2"
          opacity={0.5}
        />
        <text x={(cx(12) + cx(16)) / 2} y={GROUND_Y - 66} textAnchor="middle"
          fontSize={7.5} fill="#1D4ED8" fontFamily="sans-serif">5th from back</text>

        {/* all 16 people */}
        {Array.from({ length: N }, (_, k) => k + 1).map(pos => (
          <TinyPerson
            key={pos}
            posX={cx(pos)}
            shirt={shirtColor(pos)}
            pos={pos}
            labelColor={labelColor(pos)}
            bold={pos === 12}
          />
        ))}
      </svg>

      {/* legend */}
      <div className="flex gap-4 text-xs" style={{ fontFamily: 'sans-serif' }}>
        <span style={{ color: COLOR.LABEL_FRONT }}>
          <span style={{
            display: 'inline-block', width: 10, height: 10,
            background: COLOR.SHIRT_FRONT, borderRadius: 2,
            marginRight: 3, verticalAlign: 'middle',
          }} />
          Di depan Cassie (11 orang)
        </span>
        <span style={{ color: COLOR.LABEL_CASSIE }}>
          <span style={{
            display: 'inline-block', width: 10, height: 10,
            background: COLOR.SHIRT_CASSIE, borderRadius: 2,
            marginRight: 3, verticalAlign: 'middle',
          }} />
          Cassie (ke-12)
        </span>
        <span style={{ color: COLOR.LABEL_BACK }}>
          <span style={{
            display: 'inline-block', width: 10, height: 10,
            background: COLOR.SHIRT_BACK, borderRadius: 2,
            marginRight: 3, verticalAlign: 'middle',
          }} />
          Di belakang Cassie (4 orang)
        </span>
      </div>
    </div>
  )
}
