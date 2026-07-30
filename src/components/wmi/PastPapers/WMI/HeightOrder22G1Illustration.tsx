// WMI-22F1A-Q14 (Grade 1) — read the children's names off the picture.
//
// Restored 2026-07-30 to the OFFICIAL problem. The seed had been re-authored
// into a different, easier question (a pure transitive chain, no picture), which
// happened to land on the same key B. The paper's version is:
//
//   Ann says, "Ken is shorter than I."     -> Ann > Ken
//   Dan says, "I am the tallest."          -> Dan on top
//   Ken says, "I am taller than Pan."      -> Ken > Pan
//   "Write down their names from left to right."
//
// so the HEIGHT order is Dan > Ann > Ken > Pan — but the answer is the LEFT-TO-
// RIGHT order, which only the picture gives. That makes this figure load-bearing
// evidence rather than decoration: it prints four children whose heights are
// plainly different, with a red star marking the LEFT end.
//
//   position (left -> right):   1        2         3        4
//   height rank:                tallest  shortest  third    second
//
// Mapping the deduced ranking onto those positions gives Dan, Pan, Ken, Ann = B.
// Because that IS the reading order, the fixed draw order below doubles as the
// answer, so the names must stay hidden in the static figure — revealing them
// would hand over the answer.
//
// Pure render, SSR-safe & deterministic (no Math.random / Date). HeightBars is
// co-exported for the animator (and reused by Podium1ECIllustration), so its
// defaults are unchanged: names all shown, no star.

// The four children, fixed left → right reading order (NOT height order). Each
// gets a distinct qupu-token body colour so the animator can track who moves.
const NAMES = ['Dan', 'Pan', 'Ken', 'Ann'] as const
type Name = (typeof NAMES)[number]

const BODY_FILL: Record<Name, string> = {
  Dan: 'fill-qupu-brand-blue',
  Pan: 'fill-qupu-brand-orange',
  Ken: 'fill-qupu-brand-yellow',
  Ann: 'fill-qupu-peach',
}

// Relative-height level (1 = shortest … 4 = tallest) → body-scale fraction.
// Used by HeightBars; the default export passes the same level (3) for all
// four so nothing leaks the answer.
const LEVEL_SCALE: Record<number, number> = {
  1: 0.6,
  2: 0.74,
  3: 0.87,
  4: 1.0,
}

/** A small filled five-pointed star, drawn as a path so no glyph font is needed. */
function RedStar({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const inner = r * 0.42
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    // Start at -90deg so a point faces up, then alternate outer/inner radius.
    const a = (Math.PI / 5) * i - Math.PI / 2
    const rad = i % 2 === 0 ? r : inner
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`)
  }
  return <polygon points={pts.join(' ')} fill="#D93025" stroke="#A32217" strokeWidth={1} />
}

/**
 * HeightBars — the shared four-children figure.
 *
 * @param heights  relative height level per child, 1 (shortest) … 4 (tallest).
 *                 The animator passes the DEDUCED order, e.g.
 *                 `{ Dan: 4, Pan: 3, Ken: 2, Ann: 1 }`, to reveal the answer.
 * @param showMarks when true (the static problem default), a "?" floats above
 *                 each child because the order is still unknown.
 *
 * Children are always drawn in the fixed reading order Dan, Pan, Ken, Ann; only
 * their heights change. Each is a friendly silhouette (head + tapered body) on a
 * common ground line, with a name tag beneath.
 */
export function HeightBars({
  heights,
  showMarks = false,
  revealNames = 'all',
  showStar = false,
}: {
  heights: Record<Name, number>
  showMarks?: boolean
  /**
   * Which name tags to draw. Defaults to 'all' so existing callers (the
   * animator, Podium1ECIllustration) are unaffected. The static problem figure
   * passes [] because the names are what the solver must work out, and the
   * animator pins them one at a time as each is deduced.
   */
  revealNames?: readonly Name[] | 'all'
  /** Red star over the leftmost child, marking the "left" end as the paper does. */
  showStar?: boolean
}) {
  const shown = (name: Name) => revealNames === 'all' || revealNames.includes(name)
  // --- layout -------------------------------------------------------------
  const pad = 14
  // Headroom for the floating "?" marks. With the star on, this also has to
  // clear the tallest child's head: at topPad 26 the level-4 head top lands at
  // y = 24, leaving nowhere to put the star, so the row is pushed down.
  const topPad = showStar ? 34 : 26
  const slotW = 78 // per-child column
  const slotGap = 8
  const maxBodyH = 132 // height of a level-4 (tallest) child's body
  const headR = 17
  const tagH = 24
  const tagGap = 10

  const contentW = NAMES.length * slotW + (NAMES.length - 1) * slotGap
  const width = pad * 2 + contentW
  // Ground line sits below the tallest possible body; the tag hangs under it.
  const groundY = topPad + headR * 2 + maxBodyH
  const height = groundY + tagGap + tagH + pad

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(280, width)}>
      {/* ground line all four children stand on */}
      <line
        x1={pad}
        y1={groundY}
        x2={width - pad}
        y2={groundY}
        className="stroke-qupu-brand-blue"
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {/* The paper's red star, marking which end counts as "left". */}
      {showStar && <RedStar cx={pad + slotW / 2} cy={14} r={9} />}

      {NAMES.map((name, i) => {
        const level = LEVEL_SCALE[heights[name]] != null ? heights[name] : 3
        const scale = LEVEL_SCALE[level] ?? LEVEL_SCALE[3]
        const bodyH = maxBodyH * scale
        const cx = pad + slotW / 2 + i * (slotW + slotGap)

        // Body is a rounded tapered "dress/coat" trapezoid standing on the
        // ground; the head circle sits just above it.
        const bodyTopW = headR * 1.5
        const bodyBotW = headR * 2.6
        const bodyTopY = groundY - bodyH
        const headCy = bodyTopY - headR - 2

        const bx0 = cx - bodyTopW / 2
        const bx1 = cx + bodyTopW / 2
        const bx2 = cx + bodyBotW / 2
        const bx3 = cx - bodyBotW / 2

        return (
          <g key={name}>
            {/* floating "?" — heights are unknown in the static problem */}
            {showMarks && (
              <text
                x={cx}
                y={topPad - 2}
                textAnchor="middle"
                fontSize="24"
                fontWeight="bold"
                className="fill-qupu-brand-orange"
              >
                ?
              </text>
            )}

            {/* tapered body */}
            <path
              d={`M ${bx0} ${bodyTopY}
                  L ${bx1} ${bodyTopY}
                  L ${bx2} ${groundY}
                  L ${bx3} ${groundY} Z`}
              className={`${BODY_FILL[name]} stroke-qupu-brand-blue`}
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
            {/* head */}
            <circle
              cx={cx}
              cy={headCy}
              r={headR}
              className="fill-qupu-cream stroke-qupu-brand-blue"
              strokeWidth={2.5}
            />

            {/* Name tag beneath the ground line. Hidden in the static figure —
                the draw order is the answer, so a visible tag gives it away. */}
            {shown(name) && (
              <>
                <rect
                  x={cx - slotW / 2 + 4}
                  y={groundY + tagGap}
                  width={slotW - 8}
                  height={tagH}
                  rx={6}
                  className="fill-qupu-shell stroke-qupu-brand-orange"
                  strokeWidth={2}
                />
                <text
                  x={cx}
                  y={groundY + tagGap + tagH / 2 + 5}
                  textAnchor="middle"
                  fontSize="15"
                  fontWeight="bold"
                  className="fill-qupu-brand-blue"
                >
                  {name}
                </text>
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/**
 * The printed heights, left -> right: tallest, shortest, third, second.
 *
 * Keyed by name because HeightBars draws in the fixed order Dan, Pan, Ken, Ann
 * — which is also the answer, so these keys ARE the position mapping. Exported
 * so the storyboard uses the same numbers rather than its own copy.
 */
export const PRINTED_HEIGHTS: Record<Name, number> = { Dan: 4, Pan: 1, Ken: 2, Ann: 3 }

/**
 * WMI-22F1A-Q14 question figure — the four children at the heights the paper
 * prints, with the red star on the left end and NO name tags. The heights are
 * given; the names are the puzzle.
 */
export default function HeightOrder22G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Empat anak berdiri berjajar tanpa nama, dengan bintang merah menandai ujung kiri. Dari kiri ke kanan: anak paling tinggi, lalu anak paling pendek, lalu anak ketiga tertinggi, lalu anak kedua tertinggi."
    >
      <HeightBars heights={PRINTED_HEIGHTS} revealNames={[]} showStar />
    </div>
  )
}
