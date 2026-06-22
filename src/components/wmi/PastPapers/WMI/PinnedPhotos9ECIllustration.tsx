// IKMC-19-EC-Q9 — "Linda pinned 3 photos in a row using 8 pins."
//
// PROBLEM ONLY: shows the static figure the student sees in the paper:
//   - 3 rectangular photos side by side
//   - 4 columns of 2 pins each (corners shared between adjacent photos)
//   - total 8 pins visible
//
// Does NOT show:
//   - the formula (n + 1) × 2
//   - the answer (16 pins for 7 photos)
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── shared layout constants (re-exported so the explainer can overlay in the same coords) ──────

/** Total SVG width. */
export const SVG_W = 320

/** Total SVG height. */
export const SVG_H = 160

/** Number of photos to show in the stem (matches Linda's count). */
export const N_PHOTOS = 3

/** Left margin before the first photo. */
export const MARGIN_LEFT = 24

/** Top margin above photos. */
export const MARGIN_TOP = 24

/** Width of each photo. */
export const PHOTO_W = 72

/** Height of each photo. */
export const PHOTO_H = 104

/** Horizontal gap between photos (they share a pin column, so 0 gap). */
export const PHOTO_GAP = 0

/** Pin radius. */
export const PIN_R = 5

/** Colour tokens (echoing qupu palette). */
export const COLOR = {
  PHOTO_FILL: '#F8FAFC',
  PHOTO_STROKE: '#334155',
  PHOTO_STROKE_W: 2,
  PHOTO_INNER: '#E2E8F0',
  PIN_FILL: '#1E293B',
  PIN_STROKE: '#0F172A',
  LABEL: '#334155',
  COUNT_FILL: '#3B82F6',
} as const

// ── Photo primitive ──────────────────────────────────────────────────────────────────────────

/**
 * A single photo rectangle at position (x, y).
 * Draws a thin frame with a slightly shaded inner area to resemble a photo.
 */
export function PhotoRect({ x, y }: { x: number; y: number }) {
  const innerPad = 6
  return (
    <g>
      {/* outer border */}
      <rect
        x={x}
        y={y}
        width={PHOTO_W}
        height={PHOTO_H}
        fill={COLOR.PHOTO_FILL}
        stroke={COLOR.PHOTO_STROKE}
        strokeWidth={COLOR.PHOTO_STROKE_W}
        rx={2}
        ry={2}
      />
      {/* inner photo area (slightly shaded) */}
      <rect
        x={x + innerPad}
        y={y + innerPad}
        width={PHOTO_W - innerPad * 2}
        height={PHOTO_H - innerPad * 2}
        fill={COLOR.PHOTO_INNER}
        rx={1}
        ry={1}
      />
    </g>
  )
}

// ── Pin primitive ────────────────────────────────────────────────────────────────────────────

/**
 * A single round pin (thumbtack) at position (cx, cy).
 */
export function PinDot({ cx, cy }: { cx: number; cy: number }) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={PIN_R}
      fill={COLOR.PIN_FILL}
      stroke={COLOR.PIN_STROKE}
      strokeWidth={1}
    />
  )
}

// ── PinnedPhotosRow primitive (co-exported for explainer reuse) ──────────────────────────────

/**
 * Renders `count` photos in a row with shared corner pins.
 * For `count` photos there are `count + 1` pin columns, each with 2 pins (top + bottom).
 * `startX` is the left edge of the first photo; `startY` is the top edge.
 */
export function PinnedPhotosRow({
  count,
  startX,
  startY,
}: {
  count: number
  startX: number
  startY: number
}) {
  const photos: JSX.Element[] = []
  const pins: JSX.Element[] = []

  for (let i = 0; i < count; i++) {
    const x = startX + i * PHOTO_W
    photos.push(<PhotoRect key={`p${i}`} x={x} y={startY} />)
  }

  // Pin columns: one column per photo boundary (left edge of each photo + right edge of last)
  const numCols = count + 1
  for (let col = 0; col < numCols; col++) {
    const cx = startX + col * PHOTO_W
    const topY = startY
    const botY = startY + PHOTO_H
    pins.push(<PinDot key={`pt${col}`} cx={cx} cy={topY} />)
    pins.push(<PinDot key={`pb${col}`} cx={cx} cy={botY} />)
  }

  return (
    <g>
      {photos}
      {pins}
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────────────────────────

/**
 * PinnedPhotos9ECIllustration
 *
 * Static, problem-only figure for IKMC-19-EC-Q9.
 * Shows 3 rectangular photos pinned in a row, sharing pins at adjacent corners.
 * Total 8 pins (4 columns × 2).
 * Does NOT show the formula, or the answer for 7 photos.
 */
export default function PinnedPhotos9ECIllustration() {
  // Horizontally centre the row of N_PHOTOS photos
  const totalPhotoW = N_PHOTOS * PHOTO_W
  const startX = (SVG_W - totalPhotoW) / 2
  const startY = MARGIN_TOP

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Linda memajang 3 foto berjajar di papan gabus. ' +
        'Setiap sudut foto ditancapkan satu paku, dan foto yang berdekatan berbagi paku. ' +
        'Total ada 8 paku untuk 3 foto.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(360, SVG_W)}
        style={{ display: 'block' }}
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* 3 photos in a row with 8 shared pins */}
        <PinnedPhotosRow count={N_PHOTOS} startX={startX} startY={startY} />

        {/* label: "8 pins" */}
        <text
          x={SVG_W / 2}
          y={startY + PHOTO_H + 22}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={700}
          fill={COLOR.LABEL}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          8 pins / 8 paku
        </text>
      </svg>
    </div>
  )
}
