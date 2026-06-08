/**
 * WMI-19F2A-Q5 — "What is the 9th figure counting from ★?"
 *
 * The real figure is a single horizontal row of 13 distinct Japanese-food
 * pictures with a ★ at the far RIGHT end. There is no repeating cycle; the
 * skill is positional counting: start at the ★ and count pictures one at a
 * time moving LEFT. The 9th picture from the ★ is the dango skewer 🍡, which
 * is drawn as answer option D.
 *
 * Row, left → right (★ sits to the right of the last food picture):
 *   🥗 🍙 🍜 🎍 🍡 🍢 🍰 🍥 🍣 🍤 🍛 🍥 🐟  ★
 *
 * Counting from the ★ moving left: 1=🐟, 2=🍥, 3=🍛, 4=🍤, 5=🍣, 6=🍥,
 * 7=🍰, 8=🍢, 9=🍡 → option D.
 */

/** The 13 food pictures, left → right as they appear in the original row. */
export const FOODS = ['🥗', '🍙', '🍜', '🎍', '🍡', '🍢', '🍰', '🍥', '🍣', '🍤', '🍛', '🍥', '🐟'] as const

/** How many pictures we count, starting at the ★ and moving left. */
export const TARGET_POSITION = 9

/**
 * 0-based index (from the LEFT of the row) of the picture reached after counting
 * `n` positions from the ★ moving left. n=1 → last picture (rightmost food),
 * n=9 → the answer. With 13 foods, index = FOODS.length - n.
 */
export function indexFromStar(n: number): number {
  return FOODS.length - n
}

/** 0-based left index of the answer picture (the 9th from the ★). */
export const TARGET_INDEX = indexFromStar(TARGET_POSITION) // 13 - 9 = 4 → 🍡

/** The answer emoji, drawn as option D. */
export const ANSWER_FOOD = FOODS[TARGET_INDEX] // 🍡

const PURPLE = '#341857'
const STAR_FILL = '#F59E0B'
const STAR_STROKE = '#B45309'

/** Row geometry, shared by the illustration and the explainer. */
export const ROW_VIEW_W = 600
export const ROW_VIEW_H = 110
export const ROW_GAP = 40
export const ROW_X0 = 30
export const ROW_Y = 56
/** Emoji glyph size for the row pictures. */
export const FOOD_SIZE = 28

/** X centre of the i-th (0-based, from the left) food picture. */
export function foodX(i: number): number {
  return ROW_X0 + i * ROW_GAP
}

/** X centre of the ★, just to the right of the last food picture. */
export function starX(): number {
  return foodX(FOODS.length - 1) + ROW_GAP
}

/** A small ★ marker centred at (cx, cy). Deterministic. */
export function StarMarker({ cx, cy, size = 14 }: { cx: number; cy: number; size?: number }) {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2
    const rad = i % 2 === 0 ? size : size * 0.45
    pts.push(`${cx + rad * Math.cos(angle)},${cy + rad * Math.sin(angle)}`)
  }
  return <polygon points={pts.join(' ')} fill={STAR_FILL} stroke={STAR_STROKE} strokeWidth={1} />
}

/** One food picture drawn as an emoji glyph centred at (cx, cy). */
export function FoodGlyph({
  emoji,
  cx,
  cy,
  size = FOOD_SIZE,
  opacity = 1,
}: {
  emoji: string
  cx: number
  cy: number
  size?: number
  opacity?: number
}) {
  return (
    <text
      x={cx}
      y={cy}
      fontSize={size}
      textAnchor="middle"
      dominantBaseline="central"
      opacity={opacity}
    >
      {emoji}
    </text>
  )
}

export default function PatternNinthG2Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A row of 13 food pictures with a star at the right end"
    >
      <svg
        viewBox={`0 0 ${ROW_VIEW_W} ${ROW_VIEW_H}`}
        width="100%"
        style={{ maxWidth: ROW_VIEW_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {FOODS.map((emoji, i) => (
          <g key={i}>
            <FoodGlyph emoji={emoji} cx={foodX(i)} cy={ROW_Y} />
            {/* optional small position numeral (left → right index) */}
            <text x={foodX(i)} y={ROW_Y + 30} textAnchor="middle" fontSize={10} fill="#9CA3AF">
              {i + 1}
            </text>
          </g>
        ))}
        {/* ★ at the far right end of the row */}
        <StarMarker cx={starX()} cy={ROW_Y} />
        <text x={starX()} y={ROW_Y + 30} textAnchor="middle" fontSize={11} fontWeight="bold" fill={PURPLE}>
          ★
        </text>
      </svg>
    </div>
  )
}
