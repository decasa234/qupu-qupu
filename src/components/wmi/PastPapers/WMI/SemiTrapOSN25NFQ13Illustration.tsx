// OSN-25-SD-NAS-FINAL-Q13 — setengah lingkaran dengan trapesium ORSQ
//
// PROBLEM ONLY — shows the static figure from the paper:
//   • diameter line P–O–Q (PQ = 20 cm)
//   • semicircle arc above the diameter
//   • point O on PQ with OP = 4 cm
//   • point R on the arc, directly above O (OR ⊥ PQ)
//   • point S above Q with QS ∥ OR and QS = (3/4) OR
//   • shaded (hatched) trapezoid ORSQ
//   • right-angle box at Q
//
// Does NOT reveal: OR = 8 cm, QS = 6 cm, or area = 112 cm².
// Pure render — no hooks, no framer-motion, SSR-safe, deterministic.

// ── layout constants (re-exported for the explainer) ─────────────────────────

/** SVG canvas width in px. */
export const SVG_W = 340
/** SVG canvas height in px. */
export const SVG_H = 195

/** Scale: 12 px per 1 cm. */
export const SCALE = 12

/** Semicircle centre in SVG coords. */
export const Mx = 150
export const My = 155

/** Radius in px (10 cm × 12 px/cm). */
export const RAD = 120

// ── key points (px) ─────────────────────────────────────────────────────────
// P: left end of diameter (OP = 4 cm = 48 px from P)
export const Px = Mx - RAD  // 30
export const Py = My         // 155

// Q: right end of diameter
export const Qx = Mx + RAD  // 270
export const Qy = My         // 155

// O: on PQ with OP = 4 cm = 48 px
export const Ox = Px + 4 * SCALE  // 78
export const Oy = My               // 155

// R: on semicircle above O
// MO = Mx − Ox = 150 − 78 = 72 px = 6 cm
// OR = sqrt(RAD² − MO²) = sqrt(120²−72²) = sqrt(14400−5184) = sqrt(9216) = 96 px = 8 cm
export const Rx = Ox           // 78
export const Ry = My - 96      // 59

// S: above Q with QS ∥ OR, QS = (3/4) × 96 = 72 px = 6 cm
export const Sx = Qx           // 270
export const Sy = My - 72      // 83

// ── colour tokens ────────────────────────────────────────────────────────────
export const C = {
  axis:    '#6B7280',
  arc:     '#374151',
  fill:    '#DBEAFE',
  hatch:   '#93C5FD',
  border:  '#1D4ED8',
  dot:     '#1D4ED8',
  label:   '#1E293B',
  right:   '#374151',
} as const

const HATCH_ID = 'osn25nfq13-hatch'

// ── sub-components ───────────────────────────────────────────────────────────

function HatchDefs() {
  return (
    <defs>
      <pattern
        id={HATCH_ID}
        width="8"
        height="8"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line x1="0" y1="0" x2="0" y2="8" stroke={C.hatch} strokeWidth="1.5" />
      </pattern>
    </defs>
  )
}

function Pt({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={3.5} fill={C.dot} />
}

function Lbl({
  x, y, children, dx = 0, dy = 0,
  anchor = 'middle',
}: {
  x: number; y: number; children: string
  dx?: number; dy?: number; anchor?: 'start' | 'middle' | 'end'
}) {
  return (
    <text
      x={x + dx}
      y={y + dy}
      fontSize={13}
      fontWeight={700}
      fill={C.label}
      textAnchor={anchor}
      dominantBaseline="central"
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      {children}
    </text>
  )
}

// ── default export — illustration ────────────────────────────────────────────

export default function SemiTrapOSN25NFQ13Illustration() {
  const trap = `${Ox},${Oy} ${Rx},${Ry} ${Sx},${Sy} ${Qx},${Qy}`

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Setengah lingkaran dengan trapesium ORSQ yang diarsir"
    >
      <HatchDefs />

      {/* diameter (ground) line — extended slightly */}
      <line
        x1={Px - 14} y1={My} x2={Qx + 14} y2={My}
        stroke={C.axis} strokeWidth={1.5}
      />

      {/* semicircle arc P → Q (counterclockwise in SVG = upper arc) */}
      <path
        d={`M ${Px} ${Py} A ${RAD} ${RAD} 0 0 0 ${Qx} ${Qy}`}
        fill="none"
        stroke={C.arc}
        strokeWidth={2}
      />

      {/* trapezoid ORSQ: light fill then hatch */}
      <polygon points={trap} fill={C.fill} stroke="none" />
      <polygon points={trap} fill={`url(#${HATCH_ID})`} stroke={C.border} strokeWidth={2} strokeLinejoin="round" />

      {/* right-angle box at Q (QS ⊥ PQ) */}
      <path
        d={`M ${Qx - 11},${Qy} L ${Qx - 11},${Qy - 11} L ${Qx},${Qy - 11}`}
        fill="none"
        stroke={C.right}
        strokeWidth={1.5}
      />

      {/* key points */}
      <Pt x={Px} y={Py} />
      <Pt x={Ox} y={Oy} />
      <Pt x={Qx} y={Qy} />
      <Pt x={Rx} y={Ry} />
      <Pt x={Sx} y={Sy} />

      {/* labels */}
      <Lbl x={Px} y={Py} dy={17}>P</Lbl>
      <Lbl x={Ox} y={Oy} dy={17}>O</Lbl>
      <Lbl x={Qx} y={Qy} dy={17}>Q</Lbl>
      <Lbl x={Rx} y={Ry} dx={-14}>R</Lbl>
      <Lbl x={Sx} y={Sy} dx={15}>S</Lbl>
    </svg>
  )
}
