// IKMC-23-EC-Q7 — "Anna has 4 discs of different sizes. How many towers of 3?"
//
// PROBLEM ONLY: shows the 4 discs of different sizes scattered/arranged as in
// the paper's stem figure — the student sees the raw material, not the answer.
//
// Does NOT show:
//   - any built tower (the answer)
//   - which combinations are valid
//   - the count (4)
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.
// Faithfully reconstructs the paper figure: 4 flat disc-cylinders (like
// hockey pucks) of distinct sizes arranged in a 2×2 loose grid.
//
// ── Shared layout constants (re-exported for the explainer) ──────────────────

/** Total SVG width. */
export const SVG_W = 280

/** Total SVG height. */
export const SVG_H = 210

// Disc radii (horizontal rx of the top ellipse): smallest to largest
export const R = [18, 26, 35, 46] as const

// Disc colours matching the paper (gold, orange-red, blue-grey, amber)
export const DISC_COLORS = [
  { top: '#FACC15', stroke: '#B45309', side: '#CA8A04' },  // disc 1 – gold (smallest)
  { top: '#FB923C', stroke: '#9A3412', side: '#EA580C' },  // disc 2 – orange
  { top: '#60A5FA', stroke: '#1D4ED8', side: '#3B82F6' },  // disc 3 – blue
  { top: '#FDE68A', stroke: '#92400E', side: '#F59E0B' },  // disc 4 – pale-amber (largest)
] as const

// Disc thickness (height of the side band)
export const DISC_THICKNESS = 10

// Side band ry (vertical radius of the top ellipse — gives the 3-D puck illusion)
export const TOP_RY = 6

// Centre positions for each disc in the scattered 2×2 layout
// Disc 1 (small gold)     → top-left
// Disc 2 (medium orange)  → top-right
// Disc 3 (large blue)     → bottom-left
// Disc 4 (largest amber)  → bottom-right
export const DISC_CX = [72, 200, 78, 206] as const
export const DISC_CY = [68, 75, 153, 148] as const

// Size labels
export const DISC_LABELS = ['1', '2', '3', '4'] as const

// ── Disc primitive ────────────────────────────────────────────────────────────

/**
 * A single flat disc (puck) centred at (cx, cy).
 * rx  — horizontal radius of the top ellipse
 * cy  — y of the top face centre
 */
export function DiscPuck({
  cx,
  cy,
  rx,
  colorIdx,
  label,
}: {
  cx: number
  cy: number
  rx: number
  colorIdx: number
  label: string
}) {
  const c = DISC_COLORS[colorIdx]
  const ry = TOP_RY
  const sideTop = cy + ry            // bottom of top-ellipse centre
  const sideBot = sideTop + DISC_THICKNESS

  return (
    <g>
      {/* side band (gives the puck depth) */}
      <ellipse
        cx={cx}
        cy={sideBot}
        rx={rx}
        ry={ry}
        fill={c.side}
        stroke={c.stroke}
        strokeWidth={1.2}
      />
      <rect
        x={cx - rx}
        y={sideTop}
        width={rx * 2}
        height={DISC_THICKNESS}
        fill={c.side}
      />
      {/* left & right edge lines */}
      <line x1={cx - rx} y1={sideTop} x2={cx - rx} y2={sideBot} stroke={c.stroke} strokeWidth={1.2} />
      <line x1={cx + rx} y1={sideTop} x2={cx + rx} y2={sideBot} stroke={c.stroke} strokeWidth={1.2} />

      {/* top face */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={c.top}
        stroke={c.stroke}
        strokeWidth={1.5}
      />

      {/* size number label on top face */}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={800}
        fill={c.stroke}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────────

/**
 * Discs7ECIllustration
 *
 * Static stem figure for IKMC-23-EC-Q7.
 * Shows 4 flat disc-cylinders of different sizes scattered in a 2×2 layout,
 * numbered 1 (smallest) to 4 (largest). Does NOT show any built tower or answer.
 */
export default function Discs7ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Empat cakram dengan ukuran berbeda: cakram 1 terkecil, cakram 4 terbesar. ' +
        'Anna ingin membangun menara dari 3 cakram sehingga setiap cakram lebih kecil dari yang di bawahnya.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(300, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* Discs drawn back-to-front (larger ones first so smaller sit "in front") */}
        {/* Disc 4 (largest, amber) — bottom-right */}
        <DiscPuck cx={DISC_CX[3]} cy={DISC_CY[3]} rx={R[3]} colorIdx={3} label={DISC_LABELS[3]} />

        {/* Disc 3 (large, blue) — bottom-left */}
        <DiscPuck cx={DISC_CX[2]} cy={DISC_CY[2]} rx={R[2]} colorIdx={2} label={DISC_LABELS[2]} />

        {/* Disc 2 (medium, orange) — top-right */}
        <DiscPuck cx={DISC_CX[1]} cy={DISC_CY[1]} rx={R[1]} colorIdx={1} label={DISC_LABELS[1]} />

        {/* Disc 1 (smallest, gold) — top-left */}
        <DiscPuck cx={DISC_CX[0]} cy={DISC_CY[0]} rx={R[0]} colorIdx={0} label={DISC_LABELS[0]} />

        {/* question prompt */}
        <text
          x={SVG_W / 2}
          y={SVG_H - 8}
          textAnchor="middle"
          dominantBaseline="auto"
          fontSize={10}
          fontWeight={700}
          fill="#6B7280"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          How many towers of 3?
        </text>
      </svg>
    </div>
  )
}
