// HKIMO-22-P2H-Q5 — "According to the pattern shown below, how many * is / are
// there in the 9th group?"
//
// Stem figure: four groups of ★ arranged as right-triangles (staircase).
// Group n has n rows; row k (top→bottom) has k stars. Counts: 1, 3, 6, 10.
// Does NOT reveal the answer (group 9 = 45 stars).
//
// No existing primitive covers "repeating triangular star groups" → fresh SVG.
// Co-exports StarTriangleGroup so the explainer can re-use and highlight.
//
// SSR-safe, no hooks, no motion, pure geometry.

const INK = '#1F2937'
const STAR_FILL = '#F59E0B'     // amber star
const STAR_STROKE = '#B45309'
const BG_FILL = '#FFFBEB'
const LABEL_INK = '#6B7280'
const GROUP_BG = '#FEF3C7'
const GROUP_STROKE = '#FCD34D'
const HIGHLIGHT_BG = '#D1FAE5'
const HIGHLIGHT_STROKE = '#059669'

/** Radius of each star dot */
const R = 7

/** Spacing between star dots */
const CELL = 18

/** Width of each group panel */
const PANEL_W = 90

/** Height of each group panel (fits 4 rows) */
const PANEL_H = 90

/** Horizontal gap between panels */
const GAP = 14

const PAD_X = 20
const PAD_TOP = 16
const LABEL_H = 24
const SVG_W = PAD_X * 2 + 4 * PANEL_W + 3 * GAP
const SVG_H = PAD_TOP + PANEL_H + LABEL_H + 12

interface StarTriangleGroupProps {
  groupNum: number
  /** panel top-left x */
  px: number
  /** panel top-left y */
  py: number
  highlight?: boolean
  showCount?: boolean
}

/** Renders one triangular group of ★ dots. */
export function StarTriangleGroup({ groupNum, px, py, highlight, showCount }: StarTriangleGroupProps) {
  const bg = highlight ? HIGHLIGHT_BG : GROUP_BG
  const stroke = highlight ? HIGHLIGHT_STROKE : GROUP_STROKE

  // Build star positions: row k (1-indexed from top) has k stars
  const starDots: { cx: number; cy: number }[] = []
  for (let row = 1; row <= groupNum; row++) {
    const y = py + 10 + (row - 1) * CELL
    for (let col = 0; col < row; col++) {
      starDots.push({ cx: px + 10 + col * CELL, cy: y })
    }
  }

  const count = (groupNum * (groupNum + 1)) / 2
  const countText = `${count} ★`

  return (
    <g>
      {/* panel background */}
      <rect x={px} y={py} width={PANEL_W} height={PANEL_H} rx={6} fill={bg} stroke={stroke} strokeWidth={1.5} />
      {/* stars */}
      {starDots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={R} fill={STAR_FILL} stroke={STAR_STROKE} strokeWidth={1} />
      ))}
      {/* count badge (only in explainer / when showCount=true) */}
      {showCount && (
        <text
          x={px + PANEL_W / 2}
          y={py + PANEL_H - 6}
          textAnchor="middle"
          fontSize={10}
          fontFamily="sans-serif"
          fontWeight="700"
          fill={highlight ? '#065F46' : '#92400E'}
        >
          {countText}
        </text>
      )}
    </g>
  )
}

interface GroupLabelProps {
  ordinal: string
  cx: number
  y: number
}

function GroupLabel({ ordinal, cx, y }: GroupLabelProps) {
  return (
    <text
      x={cx}
      y={y}
      textAnchor="middle"
      fontSize={11}
      fontFamily="sans-serif"
      fill={LABEL_INK}
    >
      {ordinal}
    </text>
  )
}

const ORDINALS_EN = ['1st Group', '2nd Group', '3rd Group', '4th Group']
const ORDINALS_ID = ['Kelompok 1', 'Kelompok 2', 'Kelompok 3', 'Kelompok 4']

interface Props {
  lang?: 'en' | 'id'
  /** Groups 1-4 to highlight (used by explainer). */
  highlightGroups?: number[]
  showCounts?: boolean
}

export default function StarTriangleHK22P2Q5Illustration({ lang = 'en', highlightGroups = [], showCounts }: Props) {
  const ordinals = lang === 'id' ? ORDINALS_ID : ORDINALS_EN

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      role="img"
      aria-label={
        lang === 'id'
          ? 'Pola bintang segitiga: kelompok 1 punya 1 bintang, kelompok 2 punya 3, kelompok 3 punya 6, kelompok 4 punya 10'
          : 'Star triangle pattern: group 1 has 1 star, group 2 has 3, group 3 has 6, group 4 has 10'
      }
      style={{ background: BG_FILL, borderRadius: 8, display: 'block' }}
    >
      {[1, 2, 3, 4].map((n, i) => {
        const px = PAD_X + i * (PANEL_W + GAP)
        const py = PAD_TOP
        const cx = px + PANEL_W / 2
        return (
          <g key={n}>
            <StarTriangleGroup
              groupNum={n}
              px={px}
              py={py}
              highlight={highlightGroups.includes(n)}
              showCount={showCounts}
            />
            <GroupLabel ordinal={ordinals[i]} cx={cx} y={py + PANEL_H + 16} />
          </g>
        )
      })}
      {/* Question mark — the 9th group is unknown */}
      <text
        x={SVG_W - PAD_X / 2 - 4}
        y={PAD_TOP + PANEL_H / 2 + 5}
        textAnchor="end"
        fontSize={22}
        fontFamily="sans-serif"
        fontWeight="900"
        fill={INK}
        opacity={0.3}
      >
        …
      </text>
    </svg>
  )
}
