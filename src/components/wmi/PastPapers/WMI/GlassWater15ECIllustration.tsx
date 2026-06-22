// IKMC-19-EC-Q15 — "A full glass of water weighs 400 grams. An empty glass
// weighs 100 grams. How many grams does a half-full glass of water weigh?"
//
// Stem illustration: three glasses side by side.
//   Left  — full glass (blue fill to the top, labelled "400 g")
//   Middle — empty glass (no fill, labelled "100 g")
//   Right  — half-full glass (blue fill to the halfway mark, labelled "?")
//
// Reconstructed from docs/reference/ocr-res/ikmc/contest/ecolier/2019.imgs/045.jpg.
// The scan shows exactly this three-glass layout. The illustration does NOT show the
// answer (250 g) — that is the explainer's job.
//
// Pool primitive: GlassVessel (adapted from the Cylinder primitive in
// CylinderCount19P1Illustration, same elliptical-top open-vessel style, now
// frontal-view 2D rather than isometric).
//
// Pure render — no window/document, no Math.random, no Date. SSR-safe + deterministic.

// ── colour tokens ─────────────────────────────────────────────────────────────
const INK = '#1F2937'
const WATER_FILL = '#5BA8D8'   // blue water
const WATER_SURFACE = '#90C8E8' // lighter surface ellipse
const GLASS_FILL = '#EFF8FD'    // very pale glass body
const LABEL_COLOR = '#1F2937'

// ── geometry constants ────────────────────────────────────────────────────────

/** SVG canvas size. */
export const SVG_W = 300
export const SVG_H = 180

/** A single glass: measured in local coords, origin at top-left of the glass. */
export const GLASS_W = 52        // outer width
export const GLASS_H = 100       // body height
export const RIM_RX = GLASS_W / 2  // ellipse x-radius at the rim
export const RIM_RY = 7            // ellipse y-radius at the rim (depth cue)
export const BOT_RX = RIM_RX - 2   // ellipse x-radius at the bottom (slight taper)
export const BOT_RY = RIM_RY - 1   // ellipse y-radius at the bottom

// Three glasses: centres on the SVG canvas.
export const GLASS_CXS = [50, 150, 250] as const  // cx of each glass
export const GLASS_TOP_Y = 30                      // y of the rim top
export const GLASS_BOT_Y = GLASS_TOP_Y + GLASS_H  // y of the bottom centre

// ── GlassVessel primitive ─────────────────────────────────────────────────────

/**
 * A single drinking glass drawn as a frontal 2D cylinder with elliptical
 * top and bottom edges (adapted from the CylinderCount19P1 pool primitive).
 *
 * `fillFraction` — 0 = empty, 1 = full. The water surface is an ellipse
 * at the appropriate height; the water body fills from that surface to the
 * bottom.
 */
export function GlassVessel({
  cx,
  fillFraction,
}: {
  cx: number
  fillFraction: number   // 0..1
}) {
  const topY = GLASS_TOP_Y
  const botY = GLASS_BOT_Y

  // Water surface Y: topY (full) → botY (empty)
  const waterSurfaceY = topY + GLASS_H * (1 - fillFraction)
  const hasFill = fillFraction > 0

  const leftX = cx - RIM_RX
  const rightX = cx + RIM_RX

  return (
    <g>
      {/* ── water body (drawn before the glass outline so glass rim clips it) ── */}
      {hasFill && (
        <>
          {/* water rectangle below the surface ellipse */}
          <path
            d={`M ${leftX} ${waterSurfaceY}
                L ${leftX} ${botY}
                A ${BOT_RX} ${BOT_RY} 0 0 0 ${rightX} ${botY}
                L ${rightX} ${waterSurfaceY} Z`}
            fill={WATER_FILL}
          />
          {/* water surface top ellipse (gives depth) */}
          <ellipse
            cx={cx}
            cy={waterSurfaceY}
            rx={RIM_RX - 1}
            ry={RIM_RY - 1}
            fill={WATER_SURFACE}
          />
        </>
      )}

      {/* ── glass outline ─────────────────────────────────────────────────── */}
      {/* body sides + bottom arc */}
      <path
        d={`M ${leftX} ${topY}
            L ${leftX} ${botY}
            A ${BOT_RX} ${BOT_RY} 0 0 0 ${rightX} ${botY}
            L ${rightX} ${topY} Z`}
        fill={hasFill ? 'none' : GLASS_FILL}
        stroke={INK}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      {/* rim ellipse (open top — the dashed bottom of the ellipse shows "depth") */}
      {/* front half of rim (solid) */}
      <path
        d={`M ${leftX} ${topY} A ${RIM_RX} ${RIM_RY} 0 0 1 ${rightX} ${topY}`}
        fill="none"
        stroke={INK}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      {/* back half of rim (dashed) */}
      <path
        d={`M ${leftX} ${topY} A ${RIM_RX} ${RIM_RY} 0 0 0 ${rightX} ${topY}`}
        fill="none"
        stroke={INK}
        strokeWidth={1.2}
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
    </g>
  )
}

// ── Label primitive ────────────────────────────────────────────────────────────

function GlassLabel({ cx, label }: { cx: number; label: string }) {
  return (
    <text
      x={cx}
      y={GLASS_BOT_Y + 20}
      textAnchor="middle"
      dominantBaseline="auto"
      fontSize={14}
      fontWeight={800}
      fill={LABEL_COLOR}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      {label}
    </text>
  )
}

// ── Default export ─────────────────────────────────────────────────────────────

/**
 * GlassWater15ECIllustration
 *
 * Static, problem-only figure for IKMC-19-EC-Q15.
 * Shows three glasses: full (400 g), empty (100 g), half-full (?).
 * Does NOT reveal the answer (250 g).
 */
export default function GlassWater15ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Three glasses: a full glass of water labelled 400 g, an empty glass labelled 100 g, and a half-full glass labelled with a question mark.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(320, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* full glass — 400 g */}
        <GlassVessel cx={GLASS_CXS[0]} fillFraction={1} />
        <GlassLabel cx={GLASS_CXS[0]} label="400 g" />

        {/* empty glass — 100 g */}
        <GlassVessel cx={GLASS_CXS[1]} fillFraction={0} />
        <GlassLabel cx={GLASS_CXS[1]} label="100 g" />

        {/* half-full glass — ? */}
        <GlassVessel cx={GLASS_CXS[2]} fillFraction={0.5} />
        <GlassLabel cx={GLASS_CXS[2]} label="?" />
      </svg>
    </div>
  )
}
