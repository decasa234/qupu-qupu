// WMI-24P1A-Q17 (2024 Grade 1 Semifinal, Paper A) — stem illustration.
//
// "Which option shows the figure that is the same as the one below?"
// The scan (db/seed/wmi/figures/2024-semifinal-g1-a-q17.jpg) shows a single
// yellow rounded "bug" silhouette: a chunky four-lobed body with TWO dark
// filled spots clustered toward one side and TWO white round holes toward the
// other side. The five options A-E are pictures (printed as placeholders in the
// seed), so this file draws only the REFERENCE shape; the explainer rotates a
// copy to show option A is the same figure turned.
//
// Pure render, SSR-safe, deterministic (no random/date, no state).

const BODY = '#F5C518' // bright yellow body
const BODY_EDGE = '#E0AE0A'
const SPOT = '#332E27' // dark spot
const HOLE = '#FFFFFF' // white hole
const HOLE_EDGE = '#E0AE0A'

/**
 * The reference "bug" shape, drawn centred in a 200x200 box and rotated by
 * `rotate` degrees about the centre. Built once so the stem and the explainer's
 * rotated copies are guaranteed identical (same spots, same holes, same body).
 *
 * The body is a four-lobed blob; two DARK spots sit in the upper-right pair of
 * lobes, two WHITE holes sit in the lower-left pair — an asymmetric pattern, so
 * a wrong option could only match by flipping (which is not allowed).
 */
export function LadybugShape({ rotate = 0 }: { rotate?: number }) {
  const cx = 100
  const cy = 100
  return (
    <g transform={`rotate(${rotate} ${cx} ${cy})`}>
      {/* four-lobed body: a bowtie of two overlapping rounded blobs */}
      <g fill={BODY} stroke={BODY_EDGE} strokeWidth={2}>
        {/* main central body */}
        <ellipse cx={cx} cy={cy} rx={42} ry={34} transform={`rotate(28 ${cx} ${cy})`} />
        {/* upper-right lobe */}
        <circle cx={cx + 32} cy={cy - 30} r={26} />
        {/* upper-left lobe (smaller, the "head") */}
        <circle cx={cx - 30} cy={cy - 24} r={22} />
        {/* lower-left lobe */}
        <circle cx={cx - 34} cy={cy + 30} r={24} />
        {/* lower-right lobe */}
        <circle cx={cx + 34} cy={cy + 30} r={24} />
      </g>

      {/* two DARK spots clustered upper-right */}
      <circle cx={cx + 30} cy={cy - 34} r={13} fill={SPOT} />
      <circle cx={cx - 6} cy={cy - 22} r={13} fill={SPOT} />

      {/* two WHITE holes clustered lower */}
      <circle cx={cx - 30} cy={cy + 32} r={12} fill={HOLE} stroke={HOLE_EDGE} strokeWidth={2} />
      <circle cx={cx + 30} cy={cy + 32} r={12} fill={HOLE} stroke={HOLE_EDGE} strokeWidth={2} />
    </g>
  )
}

export const VIEW = 200

export default function P24G1Q17Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A yellow rounded bug shape with two dark spots near the top and two white holes near the bottom. Find which option shows the same figure, possibly rotated."
    >
      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        width="100%"
        style={{ maxWidth: 240, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        <LadybugShape rotate={0} />
      </svg>
    </div>
  )
}
