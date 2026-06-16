// Static card illustration for WMI-25F1A-Q24 (2025 G1 final).
//
// A row of 10 pine trees of DIFFERENT heights, standing on a common ground line,
// with a "West" label at the far-left end and an "East" label at the far-right.
// Reading the scan west -> east, the trees rank (1 = shortest … 10 = tallest):
//
//   West  2  1  3  4  6  5  7  9 10  8  East
//
// A tree is "special" iff every tree to its WEST is shorter than it AND every
// tree to its EAST is taller than it — i.e. it is a pivot where
//   max(all to the left) < it < min(all to the right).
//
// Working through the ranks [2,1,3,4,6,5,7,9,10,8]:
//   • pos 3 (rank 3): left max = 2 (<3), right min = 4 (>3)  -> SPECIAL
//   • pos 4 (rank 4): left max = 3 (<4), right min = 5 (>4)  -> SPECIAL
//   • pos 7 (rank 7): left max = 6 (<7), right min = 8 (>7)  -> SPECIAL
// No other position qualifies, so the answer is 3.
//
// This component draws ONLY the row exactly as scanned — it never highlights the
// special trees or otherwise reveals the count. Post-answer, the animator probes
// each tree and marks the special ones via the co-exported primitive
// `SpecialTrees25G1` (`litTree` to spotlight one candidate, `markSpecial` to flag
// the three pivots once confirmed).
//
// Pure render — no random, no dates, SSR-safe & deterministic. The primitive
// ignores out-of-range props so previews always render.

// qupu tokens used where available (blue ground/labels, peach lit wash, orange
// highlight). Pine green + trunk brown have no token, so raw hex (allowed).
const GREEN = '#1E9E54' // pine foliage (matches the scan)
const GREEN_DARK = '#16763E' // shaded tier edges
const TRUNK = '#9A5B33' // bark brown
const TRUNK_DARK = '#7A4526'
const BLUE = '#30598A' // qupu-brand-blue — ground line + outlines
const ORANGE = '#f0853a' // qupu-brand-orange — lit / special highlight (animator)
const PEACH = '#FFD3B1' // qupu-peach — lit wash behind a probed tree (animator)
const CREAM = '#FFF2DF' // qupu-cream — check-mark disc fill (animator)
const LABEL_FILL = '#DBEAFE' // qupu-sky — soft pill behind the West / East labels
const INK = '#1E3A8A' // qupu-ink — label text

// The 10 trees west -> east, as height RANKS (1 = shortest … 10 = tallest).
// This is the load-bearing reading of the scan; everything else derives from it.
export const TREE_RANKS: number[] = [2, 1, 3, 4, 6, 5, 7, 9, 10, 8]
const TREE_COUNT = TREE_RANKS.length

// Stable ids so the animator can target individual trees (t0 … t9, west -> east).
export const TREE_IDS: string[] = Array.from({ length: TREE_COUNT }, (_, i) => `t${i}`)

/**
 * Number of foliage tiers per tree, derived from its rank so taller-ranked trees
 * read as visibly taller. Shortest trees get 2 tiers, tallest get 6.
 */
function tiersForRank(rank: number): number {
  // ranks 1–2 -> 2 tiers, 3–4 -> 3, 5–6 -> 4, 7–8 -> 5, 9–10 -> 6
  return Math.min(6, 2 + Math.floor((rank - 1) / 2))
}

/** One pine tree: a stacked-triangle canopy on a short trunk, standing on baseY. */
function PineTree({
  cx,
  baseY,
  tiers,
  lit,
  special,
}: {
  cx: number
  baseY: number
  tiers: number
  lit: boolean
  special: boolean
}) {
  const tierH = 22 // vertical drop of one foliage triangle
  const tierStep = 15 // how much each higher tier rises above the previous
  const halfW = 26 // half-width of the widest (bottom) tier
  const trunkW = 9
  const trunkH = 16

  const stroke = lit || special ? ORANGE : GREEN_DARK
  const strokeW = lit || special ? 2.4 : 1.4

  // Trunk sits on the ground line; canopy starts just above it.
  const trunkTop = baseY - trunkH
  const canopyBottom = trunkTop + 3

  // Build the tiers bottom -> top. Each tier is a triangle whose base sits a bit
  // higher than the previous one, and whose half-width shrinks toward the apex.
  const triangles = []
  for (let t = 0; t < tiers; t++) {
    const baseLineY = canopyBottom - t * tierStep
    const apexY = baseLineY - tierH
    const w = halfW * (1 - (t / (tiers + 1)) * 0.55)
    triangles.push(
      <path
        key={t}
        d={`M ${cx} ${apexY} L ${cx + w} ${baseLineY} L ${cx - w} ${baseLineY} Z`}
        fill={GREEN}
        stroke={stroke}
        strokeWidth={strokeW}
        strokeLinejoin="round"
      />,
    )
  }

  return (
    <g>
      {/* trunk */}
      <rect
        x={cx - trunkW / 2}
        y={trunkTop}
        width={trunkW}
        height={trunkH + 1}
        rx={1.5}
        fill={TRUNK}
        stroke={lit || special ? ORANGE : TRUNK_DARK}
        strokeWidth={lit || special ? 1.8 : 1}
      />
      {/* foliage tiers (bottom drawn first so upper tiers overlap cleanly) */}
      {triangles}
    </g>
  )
}

/** A small rounded "West" / "East" label pill. */
function EndLabel({ x, y, text }: { x: number; y: number; text: string }) {
  const w = text.length * 7 + 18
  const h = 20
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2} fill={LABEL_FILL} stroke={BLUE} strokeWidth={1.2} />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontStyle="italic"
        fontWeight={700}
        fill={INK}
        className="font-display"
      >
        {text}
      </text>
    </g>
  )
}

/**
 * The 10-tree row.
 *
 * @param litTree     0-based index (west -> east) of a single tree to spotlight
 *                    while the animator tests it (peach wash + orange outline).
 *                    `null`/out-of-range is ignored.
 * @param markSpecial when true, the three special trees (positions 3, 4, 7 ->
 *                    indices 2, 3, 6) get an orange outline + a check-mark badge.
 *                    Used by the animator AFTER the answer is revealed. Defaults
 *                    to false, so the bare problem figure never leaks the answer.
 *
 * With no props it renders the bare row of 10 trees at their scanned heights.
 */
export function SpecialTrees25G1({
  litTree = null,
  markSpecial = false,
}: {
  litTree?: number | null
  markSpecial?: boolean
} = {}) {
  // The three special trees, derived from TREE_RANKS so the figure and the logic
  // can never drift apart.
  const specialSet = new Set<number>()
  for (let i = 0; i < TREE_COUNT; i++) {
    const leftMax = i === 0 ? -Infinity : Math.max(...TREE_RANKS.slice(0, i))
    const rightMin = i === TREE_COUNT - 1 ? Infinity : Math.min(...TREE_RANKS.slice(i + 1))
    if (leftMax < TREE_RANKS[i] && TREE_RANKS[i] < rightMin) specialSet.add(i)
  }

  const litIndex = typeof litTree === 'number' && litTree >= 0 && litTree < TREE_COUNT ? litTree : null

  // --- layout -------------------------------------------------------------
  const cellW = 50 // horizontal slot per tree
  const padX = 16
  const padTop = 30 // room for the West / East labels above the row
  const padBottom = 18
  const baseY = padTop + 150 // ground line: tall enough for a 6-tier tree above
  const width = padX * 2 + TREE_COUNT * cellW
  const height = baseY + padBottom
  const labelY = padTop - 12

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: 560, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* end labels */}
      <EndLabel x={padX + cellW * 0.55} y={labelY} text="Barat" />
      <EndLabel x={width - padX - cellW * 0.55} y={labelY} text="Timur" />

      {/* ground line all 10 trees stand on */}
      <line
        x1={padX - 2}
        y1={baseY}
        x2={width - padX + 2}
        y2={baseY}
        stroke={BLUE}
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {/* the row of trees */}
      {TREE_RANKS.map((rank, i) => {
        const cx = padX + i * cellW + cellW / 2
        const lit = litIndex === i
        const special = markSpecial && specialSet.has(i)
        const tiers = tiersForRank(rank)
        return (
          <g key={TREE_IDS[i]}>
            {/* lit wash behind a probed tree (animator only) */}
            {lit && (
              <rect
                x={cx - cellW / 2 + 3}
                y={padTop + 4}
                width={cellW - 6}
                height={baseY - padTop - 4 + 6}
                rx={10}
                fill={PEACH}
                stroke={ORANGE}
                strokeWidth={1.6}
                opacity={0.55}
              />
            )}
            <PineTree cx={cx} baseY={baseY} tiers={tiers} lit={lit} special={special} />
            {/* check-mark badge over a confirmed special tree (animator only) */}
            {special && (
              <g>
                <circle cx={cx} cy={padTop + 8} r={9} fill={CREAM} stroke={ORANGE} strokeWidth={2} />
                <path
                  d={`M ${cx - 4} ${padTop + 8} l 2.6 3 l 5 -6.5`}
                  fill="none"
                  stroke={ORANGE}
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/** Default export — the bare 10-tree row inside the card (no box, no highlight). */
export default function SpecialTrees25G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Sebaris 10 pohon dengan tinggi berbeda, dengan tanda Barat di ujung kiri dan Timur di ujung kanan. Sebuah pohon disebut istimewa jika setiap pohon di sebelah baratnya lebih pendek dan setiap pohon di sebelah timurnya lebih tinggi. Pertanyaannya: berapa banyak pohon istimewa."
    >
      <SpecialTrees25G1 />
    </div>
  )
}
