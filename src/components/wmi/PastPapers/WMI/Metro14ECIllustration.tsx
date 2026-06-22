// IKMC-23-EC-Q14 — "Metro line 6 stations" stem illustration.
//
// PROBLEM ONLY: shows the static figure from the paper:
//   - A horizontal metro line from West to East
//   - 6 stations labelled A, B, C, D, E, F
//   - A train icon at station B (driver starts here)
//   - Double-headed arrows on the train to indicate it can go both ways
//
// Does NOT show:
//   - The answer (station D)
//   - The cycle period (10)
//   - The 96 mod 10 = 6 reasoning
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── shared layout constants (re-exported so the explainer can overlay) ────────

/** Total SVG width. */
export const SVG_W = 340

/** Total SVG height. */
export const SVG_H = 120

/** Y coordinate of the metro line. */
export const LINE_Y = 68

/** X coordinates of the 6 stations A–F. */
export const STATION_X: Record<string, number> = {
  A: 38,
  B: 88,
  C: 138,
  D: 188,
  E: 238,
  F: 302,
}

/** All station labels in order. */
export const STATIONS = ['A', 'B', 'C', 'D', 'E', 'F'] as const

/** Radius of each station dot. */
export const DOT_R = 6

/** Colour tokens. */
export const COLOR = {
  TRACK: '#4B5563',
  STATION_FILL: '#FFFFFF',
  STATION_STROKE: '#1F2937',
  TRAIN_BODY: '#3B82F6',
  TRAIN_STROKE: '#1D4ED8',
  TRAIN_WINDOW: '#BFDBFE',
  LABEL: '#1F2937',
  DIRECTION: '#1F2937',
  START_HIGHLIGHT: '#FDE68A',
} as const

// ── Train primitive ───────────────────────────────────────────────────────────

/**
 * Simple train icon drawn as a rectangle with wheels and windows.
 * Centred at (cx, cy). Double-headed arrows above to show it can go both ways.
 */
export function TrainPrimitive({ cx, cy }: { cx: number; cy: number }) {
  const bodyW = 36
  const bodyH = 18
  const bodyX = cx - bodyW / 2
  const bodyY = cy - bodyH / 2

  // Window positions inside the body
  const winW = 6
  const winH = 7
  const winY = bodyY + 3

  // Wheels
  const wheelR = 3
  const wheelY = bodyY + bodyH

  // Double-headed arrow above the train
  const arrY = bodyY - 9
  const arrLeft = cx - 14
  const arrRight = cx + 14

  return (
    <g>
      {/* Double-headed arrow */}
      <line
        x1={arrLeft + 5}
        y1={arrY}
        x2={arrRight - 5}
        y2={arrY}
        stroke={COLOR.DIRECTION}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* left arrowhead */}
      <path
        d={`M ${arrLeft + 5} ${arrY} L ${arrLeft + 10} ${arrY - 4} M ${arrLeft + 5} ${arrY} L ${arrLeft + 10} ${arrY + 4}`}
        stroke={COLOR.DIRECTION}
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
      {/* right arrowhead */}
      <path
        d={`M ${arrRight - 5} ${arrY} L ${arrRight - 10} ${arrY - 4} M ${arrRight - 5} ${arrY} L ${arrRight - 10} ${arrY + 4}`}
        stroke={COLOR.DIRECTION}
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />

      {/* Train body */}
      <rect
        x={bodyX}
        y={bodyY}
        width={bodyW}
        height={bodyH}
        rx={3}
        fill={COLOR.TRAIN_BODY}
        stroke={COLOR.TRAIN_STROKE}
        strokeWidth={1.5}
      />

      {/* Windows */}
      <rect x={bodyX + 4} y={winY} width={winW} height={winH} rx={1} fill={COLOR.TRAIN_WINDOW} />
      <rect x={bodyX + 13} y={winY} width={winW} height={winH} rx={1} fill={COLOR.TRAIN_WINDOW} />
      <rect x={bodyX + 22} y={winY} width={winW} height={winH} rx={1} fill={COLOR.TRAIN_WINDOW} />

      {/* Wheels */}
      <circle cx={bodyX + 8} cy={wheelY + wheelR} r={wheelR} fill={COLOR.TRAIN_STROKE} />
      <circle cx={bodyX + 28} cy={wheelY + wheelR} r={wheelR} fill={COLOR.TRAIN_STROKE} />
    </g>
  )
}

// ── Station dot primitive ─────────────────────────────────────────────────────

/**
 * A station: vertical tick on the track + a dot + a label below.
 */
export function StationDot({
  label,
  x,
  highlight,
}: {
  label: string
  x: number
  highlight?: boolean
}) {
  return (
    <g>
      {/* tick mark */}
      <line
        x1={x}
        y1={LINE_Y - DOT_R - 2}
        x2={x}
        y2={LINE_Y + DOT_R + 2}
        stroke={COLOR.STATION_STROKE}
        strokeWidth={1.5}
      />
      {/* station dot */}
      <circle
        cx={x}
        cy={LINE_Y}
        r={DOT_R}
        fill={highlight ? COLOR.START_HIGHLIGHT : COLOR.STATION_FILL}
        stroke={COLOR.STATION_STROKE}
        strokeWidth={2}
      />
      {/* label below */}
      <text
        x={x}
        y={LINE_Y + DOT_R + 13}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        fill={COLOR.LABEL}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Default export ─────────────────────────────────────────────────────────────

/**
 * Metro14ECIllustration
 *
 * Static problem-only figure for IKMC-23-EC-Q14.
 * Shows the metro line A–F with the train at station B.
 * Does NOT reveal the answer (station D at the 96th stop).
 */
export default function Metro14ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Jalur metro dengan 6 stasiun dari kiri ke kanan: A, B, C, D, E, F. ' +
        'Kereta berada di stasiun B dengan tanda panah dua arah. Arah barat ada di kiri (stasiun A) dan timur di kanan (stasiun F).'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(340, SVG_W)}
        style={{ display: 'block' }}
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* "West" and "East" labels */}
        <text
          x={8}
          y={LINE_Y}
          textAnchor="start"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={600}
          fill={COLOR.LABEL}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          West
        </text>
        <text
          x={SVG_W - 8}
          y={LINE_Y}
          textAnchor="end"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={600}
          fill={COLOR.LABEL}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          East
        </text>

        {/* Track line from A to F */}
        <line
          x1={STATION_X.A}
          y1={LINE_Y}
          x2={STATION_X.F}
          y2={LINE_Y}
          stroke={COLOR.TRACK}
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Station dots */}
        {STATIONS.map((s) => (
          <StationDot key={s} label={s} x={STATION_X[s]} highlight={s === 'B'} />
        ))}

        {/* Train at station B */}
        <TrainPrimitive cx={STATION_X.B} cy={LINE_Y - 24} />
      </svg>
    </div>
  )
}
