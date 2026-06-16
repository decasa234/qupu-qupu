// WMI-22F1A-Q14 (Grade 1) — "Who is tallest?" (four children, order unknown).
//
// Four children — Dan, Pan, Ken, Ann. The text gives the clues:
//   • Dan is the tallest.
//   • Pan is taller than Ken.
//   • Ken is taller than Ann.
// So tallest → shortest = Dan, Pan, Ken, Ann (answer B).
//
// The STATIC problem figure must NOT reveal that order. It shows the four
// children at AMBIGUOUS / EQUAL heights, each with a name tag and a "?" above —
// the ordering is exactly what the solver must DEDUCE from the text. Sorting
// them by height is the animator's job, post-answer, via the HeightBars
// primitive co-exported below.
//
// Pure render, SSR-safe & deterministic (no Math.random / Date). The default
// export accepts `params` to match the illustration signature but ignores it
// (this is a fixed paper figure); HeightBars takes explicit relative heights so
// the animator can reuse the identical glyphs while showing the deduced order.

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
}: {
  heights: Record<Name, number>
  showMarks?: boolean
}) {
  // --- layout -------------------------------------------------------------
  const pad = 14
  const topPad = 26 // headroom for the floating "?" marks
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

            {/* name tag beneath the ground line */}
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
          </g>
        )
      })}
    </svg>
  )
}

/**
 * WMI-22F1A-Q14 question figure — four children (Dan, Pan, Ken, Ann) shown at
 * the SAME ambiguous height, each with a name tag and a "?" above. The order is
 * unknown by design; the solver deduces it from the text clues. `params` is
 * accepted to match the illustration signature but unused.
 */
export default function HeightOrder22G1Illustration() {
  // All four at the same middle level (3) so the figure never hints at order.
  const equal: Record<Name, number> = { Dan: 3, Pan: 3, Ken: 3, Ann: 3 }
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Empat anak berdiri berjajar: Dan, Pan, Ken, dan Ann. Tinggi mereka belum diketahui (ditandai tanda tanya). Urutkan dari yang tertinggi ke terpendek berdasarkan petunjuk."
    >
      <HeightBars heights={equal} showMarks />
    </div>
  )
}
