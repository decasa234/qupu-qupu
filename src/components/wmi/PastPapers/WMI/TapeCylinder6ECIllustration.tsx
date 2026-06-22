// IKMC-21-EC-Q6 — "A measuring tape is wrapped around a cylinder."
//
// PROBLEM ONLY: shows the static figure the student sees in the paper:
//   - a short, wide cylinder (drum) viewed in 3/4 perspective
//   - a measuring tape spiralling around it in 3 visible wraps
//   - visible numbers on the tape (increasing by 15 per revolution)
//   - a "?" at one position on the topmost wrap
//
// Numbers visible (matching the paper figure):
//   Bottom wrap:   3   4   5   6
//   Middle wrap:  18  19  20  21
//   Top wrap:     33  ?   (48)  (not shown)
//
// The "?" is at the position where 33+15 = 48 would be — but we show "?" only.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── shared layout constants (re-exported for the explainer) ──────────────────

/** Total SVG width. */
export const SVG_W = 260
/** Total SVG height. */
export const SVG_H = 220

/** Horizontal centre of the cylinder. */
export const CYL_CX = 130
/** Top of the cylinder (flat ellipse centre y). */
export const CYL_TOP_Y = 38
/** Bottom of the cylinder (flat ellipse centre y). */
export const CYL_BOT_Y = 180
/** Cylinder height in px. */
export const CYL_H = CYL_BOT_Y - CYL_TOP_Y  // 142
/** Horizontal radius of the ellipses. */
export const CYL_RX = 90
/** Vertical radius of the ellipses (foreshortening). */
export const CYL_RY = 22

/** Increment per full revolution of the tape. */
export const TAPE_INCREMENT = 15

/** Number label positions: [x, y, value | '?']. */
export const TAPE_LABELS: Array<[number, number, string]> = [
  // bottom wrap (row 0) — left to right across the front face
  [48,  152, '3'],
  [78,  162, '4'],
  [112, 168, '5'],
  [146, 168, '6'],
  // middle wrap (row 1)
  [48,  118, '18'],
  [80,  128, '19'],
  [114, 133, '20'],
  [148, 133, '21'],
  // top wrap (row 2)
  [48,   84, '33'],
  [80,   94, '?'],
]

/** Colour tokens. */
export const COLOR = {
  CYL_BODY: '#E0E7F0',
  CYL_BODY_DARK: '#B8C4D4',
  CYL_STROKE: '#6B7A8D',
  CYL_TOP: '#C8D4E4',
  CYL_SHADOW: '#8898A8',
  TAPE_BG: '#FDF5DC',
  TAPE_STROKE: '#C0A840',
  TAPE_TEXT: '#1F2937',
  TAPE_QMARK: '#DC2626',
  TICK_LINE: '#9CA3AF',
} as const

// ── Cylinder primitive ────────────────────────────────────────────────────────

/**
 * Cylinder body in 3/4 view.
 * Drawn as: left vertical side edge, right vertical side edge, bottom ellipse,
 * top ellipse on top.
 */
export function CylinderBody() {
  const left  = CYL_CX - CYL_RX
  const right = CYL_CX + CYL_RX

  return (
    <g>
      {/* side rectangle (body) */}
      <rect
        x={left}
        y={CYL_TOP_Y}
        width={CYL_RX * 2}
        height={CYL_H}
        fill={COLOR.CYL_BODY}
        stroke="none"
      />
      {/* subtle gradient to suggest roundness — right-side shadow band */}
      <rect
        x={right - 28}
        y={CYL_TOP_Y}
        width={28}
        height={CYL_H}
        fill={COLOR.CYL_BODY_DARK}
        stroke="none"
        opacity={0.55}
      />
      {/* left edge */}
      <line x1={left}  y1={CYL_TOP_Y} x2={left}  y2={CYL_BOT_Y} stroke={COLOR.CYL_STROKE} strokeWidth={1.5} />
      {/* right edge */}
      <line x1={right} y1={CYL_TOP_Y} x2={right} y2={CYL_BOT_Y} stroke={COLOR.CYL_STROKE} strokeWidth={1.5} />
      {/* bottom ellipse */}
      <ellipse
        cx={CYL_CX}
        cy={CYL_BOT_Y}
        rx={CYL_RX}
        ry={CYL_RY}
        fill={COLOR.CYL_SHADOW}
        stroke={COLOR.CYL_STROKE}
        strokeWidth={1.5}
      />
      {/* top ellipse */}
      <ellipse
        cx={CYL_CX}
        cy={CYL_TOP_Y}
        rx={CYL_RX}
        ry={CYL_RY}
        fill={COLOR.CYL_TOP}
        stroke={COLOR.CYL_STROKE}
        strokeWidth={1.5}
      />
    </g>
  )
}

// ── Tape wrap primitive ───────────────────────────────────────────────────────

/**
 * One horizontal tape band across the front face of the cylinder.
 * The tape is a thin horizontal strip.
 */
export function TapeBand({ y, h = 18 }: { y: number; h?: number }) {
  const left  = CYL_CX - CYL_RX + 1
  const right = CYL_CX + CYL_RX - 1
  return (
    <rect
      x={left}
      y={y - h / 2}
      width={right - left}
      height={h}
      fill={COLOR.TAPE_BG}
      stroke={COLOR.TAPE_STROKE}
      strokeWidth={1}
      rx={1}
    />
  )
}

// ── Number label on tape ──────────────────────────────────────────────────────

function TapeLabel({ x, y, val }: { x: number; y: number; val: string }) {
  const isQ = val === '?'
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={isQ ? 14 : 11}
      fontWeight={isQ ? 900 : 700}
      fill={isQ ? COLOR.TAPE_QMARK : COLOR.TAPE_TEXT}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      {val}
    </text>
  )
}

// ── Default export ────────────────────────────────────────────────────────────

/**
 * TapeCylinder6ECIllustration
 *
 * Static problem figure for IKMC-21-EC-Q6.
 * Shows a measuring tape wrapped around a cylinder; a "?" marks the unknown
 * value. Does NOT reveal the answer (48).
 */
export default function TapeCylinder6ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Pita ukur dililitkan mengelilingi silinder. ' +
        'Angka yang terlihat: 3, 4, 5, 6 di bawah; 18, 19, 20, 21 di tengah; 33, ? di atas. ' +
        'Angka berapa yang harus menggantikan tanda tanya?'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(300, SVG_W)}
        style={{ display: 'block' }}
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* cylinder body (drawn first — tape goes on top) */}
        <CylinderBody />

        {/* tape bands — three horizontal wraps visible on the front */}
        <TapeBand y={158} />
        <TapeBand y={124} />
        <TapeBand y={ 90} />

        {/* tape number labels */}
        {TAPE_LABELS.map(([x, y, val]) => (
          <TapeLabel key={`${x}-${y}`} x={x} y={y} val={val} />
        ))}

        {/* small vertical tick lines between visible numbers to suggest the scale */}
        {[63, 97, 131].map((x) => (
          <g key={x}>
            <line x1={x} y1={149} x2={x} y2={167} stroke={COLOR.TICK_LINE} strokeWidth={0.8} />
            <line x1={x} y1={115} x2={x} y2={133} stroke={COLOR.TICK_LINE} strokeWidth={0.8} />
            <line x1={x} y1={ 81} x2={x} y2={ 99} stroke={COLOR.TICK_LINE} strokeWidth={0.8} />
          </g>
        ))}
      </svg>
    </div>
  )
}
