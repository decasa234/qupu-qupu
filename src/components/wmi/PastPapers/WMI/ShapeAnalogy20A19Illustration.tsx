// SEAMOX-20-A-Q19 — "What is the missing figure?"
//
// Stem: 2-row analogy grid.
//   Row 1: plain diamond (rotated square) → axis-aligned square with two diagonals (X).
//   Row 2: upward triangle subdivided into 4 smaller triangles → ? (answer = option B).
//
// The figure shows the PROBLEM only (no answer).
// Co-exports ShapeAnalogy20A19Option for CHOICE_RENDERERS (choices A–D).
//
// Choices (from images 018–021):
//   A — inverted large triangle subdivided: top-half is two small upward triangles,
//       bottom-half is one inverted triangle (same 4-triangle subdivision but rotated).
//   B — plain inverted triangle (no internal lines).
//   C — inverted triangle with lines from all 3 vertices meeting at internal point
//       (centroid/incenter rays — 3 cevians creating 3 inner triangles from centre).
//   D — inverted triangle with 3 lines: from top-left and top-right corners + a
//       vertical midline, all meeting inside (Y-like division creating 3 sub-regions).
//
// Answer: B — the transformation rule is rotate the shape 180° (flip vertically);
//   the inner subdivision of the original upward triangle is replaced by the plain
//   outline of the inverted version, matching how the diamond's details map to the
//   clean square with only its diagonals added.
//
// Pure SVG, no hooks, SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Shared geometry constants
// ---------------------------------------------------------------------------

const INK = '#1F2937'
const FILL = '#FFFFFF'
const SW = 2.2  // main stroke width

// ---------------------------------------------------------------------------
// Shape drawing helpers (all return JSX path/polygon elements)
// ---------------------------------------------------------------------------

/** Diamond (rotated square) — plain outline */
function Diamond({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const pts = `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`
  return <polygon points={pts} fill={FILL} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
}

/** Axis-aligned square with two diagonals (X pattern) */
function SquareWithX({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const x0 = cx - r, y0 = cy - r, x1 = cx + r, y1 = cy + r
  return (
    <g>
      <rect x={x0} y={y0} width={r * 2} height={r * 2} fill={FILL} stroke={INK} strokeWidth={SW} />
      <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={INK} strokeWidth={SW} />
      <line x1={x1} y1={y0} x2={x0} y2={y1} stroke={INK} strokeWidth={SW} />
    </g>
  )
}

/**
 * Upward triangle subdivided into 4 equal smaller triangles.
 * apex at (cx, cy-h), base from (cx-b, cy+h) to (cx+b, cy+h).
 * Midpoints of each side connected to produce 4 smaller triangles.
 */
function TriangleSubdivided({ cx, cy, b, h }: { cx: number; cy: number; b: number; h: number }) {
  // 3 vertices of the big upward triangle
  const top = { x: cx, y: cy - h }
  const bl  = { x: cx - b, y: cy + h }
  const br  = { x: cx + b, y: cy + h }
  // midpoints
  const ml = { x: (top.x + bl.x) / 2, y: (top.y + bl.y) / 2 }   // left mid
  const mr = { x: (top.x + br.x) / 2, y: (top.y + br.y) / 2 }   // right mid
  const mb = { x: (bl.x + br.x) / 2, y: (bl.y + br.y) / 2 }    // base mid
  return (
    <g>
      {/* outer triangle */}
      <polygon
        points={`${top.x},${top.y} ${bl.x},${bl.y} ${br.x},${br.y}`}
        fill={FILL} stroke={INK} strokeWidth={SW} strokeLinejoin="round"
      />
      {/* inner subdivision lines */}
      <line x1={ml.x} y1={ml.y} x2={mr.x} y2={mr.y} stroke={INK} strokeWidth={SW} />
      <line x1={ml.x} y1={ml.y} x2={mb.x} y2={mb.y} stroke={INK} strokeWidth={SW} />
      <line x1={mr.x} y1={mr.y} x2={mb.x} y2={mb.y} stroke={INK} strokeWidth={SW} />
    </g>
  )
}

/** Arrow shape (right-pointing hollow chevron) */
function Arrow({ cx, cy }: { cx: number; cy: number }) {
  const w = 20, h = 14, nk = 6
  // Hollow right-pointing arrow
  const pts = [
    `${cx - w / 2},${cy - nk}`,
    `${cx},${cy - nk}`,
    `${cx},${cy - h / 2}`,
    `${cx + w / 2},${cy}`,
    `${cx},${cy + h / 2}`,
    `${cx},${cy + nk}`,
    `${cx - w / 2},${cy + nk}`,
  ].join(' ')
  return <polygon points={pts} fill="#D1D5DB" stroke={INK} strokeWidth={1.5} />
}

/** Question mark glyph */
function QuestionMark({ cx, cy }: { cx: number; cy: number }) {
  return (
    <text
      x={cx} y={cy}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={30}
      fontWeight="bold"
      fill={INK}
      fontFamily="sans-serif"
    >
      ?
    </text>
  )
}

// ---------------------------------------------------------------------------
// Option shape renderers
// ---------------------------------------------------------------------------

/**
 * Option A: large inverted triangle subdivided into 4 triangles
 * (same 4-subdivision but pointing down).
 */
function OptionAShape({ cx, cy, b, h }: { cx: number; cy: number; b: number; h: number }) {
  // big inverted triangle
  const bot  = { x: cx, y: cy + h }
  const tl   = { x: cx - b, y: cy - h }
  const tr   = { x: cx + b, y: cy - h }
  // midpoints
  const ml = { x: (bot.x + tl.x) / 2, y: (bot.y + tl.y) / 2 }
  const mr = { x: (bot.x + tr.x) / 2, y: (bot.y + tr.y) / 2 }
  const mt = { x: (tl.x + tr.x) / 2, y: (tl.y + tr.y) / 2 }
  return (
    <g>
      <polygon
        points={`${bot.x},${bot.y} ${tl.x},${tl.y} ${tr.x},${tr.y}`}
        fill={FILL} stroke={INK} strokeWidth={SW} strokeLinejoin="round"
      />
      <line x1={ml.x} y1={ml.y} x2={mr.x} y2={mr.y} stroke={INK} strokeWidth={SW} />
      <line x1={ml.x} y1={ml.y} x2={mt.x} y2={mt.y} stroke={INK} strokeWidth={SW} />
      <line x1={mr.x} y1={mr.y} x2={mt.x} y2={mt.y} stroke={INK} strokeWidth={SW} />
    </g>
  )
}

/**
 * Option B: plain inverted triangle (no internal lines).
 */
function OptionBShape({ cx, cy, b, h }: { cx: number; cy: number; b: number; h: number }) {
  const bot = { x: cx, y: cy + h }
  const tl  = { x: cx - b, y: cy - h }
  const tr  = { x: cx + b, y: cy - h }
  return (
    <polygon
      points={`${bot.x},${bot.y} ${tl.x},${tl.y} ${tr.x},${tr.y}`}
      fill={FILL} stroke={INK} strokeWidth={SW} strokeLinejoin="round"
    />
  )
}

/**
 * Option C: inverted triangle with cevian lines from all 3 vertices meeting
 * at the centroid (3 medians), dividing it into 6 inner triangles.
 * Visually: from the bottom apex and both top corners, lines go to the midpoints
 * of the opposite sides — creating a Y inside meeting at centroid.
 */
function OptionCShape({ cx, cy, b, h }: { cx: number; cy: number; b: number; h: number }) {
  const bot = { x: cx, y: cy + h }
  const tl  = { x: cx - b, y: cy - h }
  const tr  = { x: cx + b, y: cy - h }
  // centroid
  const gc = { x: (bot.x + tl.x + tr.x) / 3, y: (bot.y + tl.y + tr.y) / 3 }
  // midpoints of sides (for medians)
  const mTop  = { x: (tl.x + tr.x) / 2, y: (tl.y + tr.y) / 2 }
  const mLeft = { x: (bot.x + tl.x) / 2, y: (bot.y + tl.y) / 2 }
  const mRight= { x: (bot.x + tr.x) / 2, y: (bot.y + tr.y) / 2 }
  return (
    <g>
      <polygon
        points={`${bot.x},${bot.y} ${tl.x},${tl.y} ${tr.x},${tr.y}`}
        fill={FILL} stroke={INK} strokeWidth={SW} strokeLinejoin="round"
      />
      {/* 3 medians: vertex to opposite midpoint */}
      <line x1={bot.x} y1={bot.y} x2={mTop.x} y2={mTop.y} stroke={INK} strokeWidth={SW} />
      <line x1={tl.x} y1={tl.y} x2={mRight.x} y2={mRight.y} stroke={INK} strokeWidth={SW} />
      <line x1={tr.x} y1={tr.y} x2={mLeft.x} y2={mLeft.y} stroke={INK} strokeWidth={SW} />
      {/* Dot at centroid for clarity */}
      <circle cx={gc.x} cy={gc.y} r={2.5} fill={INK} />
    </g>
  )
}

/**
 * Option D: inverted triangle with internal Y pattern — vertical midline from
 * top-midpoint to a central meeting point, plus lines from both top corners
 * to the same meeting point, creating 3 regions.
 */
function OptionDShape({ cx, cy, b, h }: { cx: number; cy: number; b: number; h: number }) {
  const bot = { x: cx, y: cy + h }
  const tl  = { x: cx - b, y: cy - h }
  const tr  = { x: cx + b, y: cy - h }
  // Internal meeting point — roughly at 2/3 height from top
  const meet = { x: cx, y: cy - h + h * 1.1 }
  const midTop = { x: cx, y: cy - h }  // top midpoint
  return (
    <g>
      <polygon
        points={`${bot.x},${bot.y} ${tl.x},${tl.y} ${tr.x},${tr.y}`}
        fill={FILL} stroke={INK} strokeWidth={SW} strokeLinejoin="round"
      />
      {/* vertical from top-mid to meeting point */}
      <line x1={midTop.x} y1={midTop.y} x2={meet.x} y2={meet.y} stroke={INK} strokeWidth={SW} />
      {/* from top-left corner to meeting point */}
      <line x1={tl.x} y1={tl.y} x2={meet.x} y2={meet.y} stroke={INK} strokeWidth={SW} />
      {/* from top-right corner to meeting point */}
      <line x1={tr.x} y1={tr.y} x2={meet.x} y2={meet.y} stroke={INK} strokeWidth={SW} />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Stem illustration — 2-row analogy grid
// ---------------------------------------------------------------------------

const VB = { w: 320, h: 220 }

// Row 1: diamond → square-with-X
// Row 2: subdivided-triangle → ?
const R1Y = 60   // row 1 vertical center
const R2Y = 160  // row 2 vertical center
const COL1X = 70  // left column x
const ARROWX = 155 // arrow x
const COL2X = 250  // right column x
const SHAPER = 42  // shape "radius"

/**
 * ShapeAnalogy20A19Illustration — the stem analogy grid.
 * Does NOT reveal the answer (right cell of row 2 shows '?').
 */
export default function ShapeAnalogy20A19Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Analogy: a plain diamond becomes a square with two diagonals (X). ' +
        'A triangle subdivided into four smaller triangles transforms into which option?'
      }
    >
      <svg
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        width={VB.w}
        height={VB.h}
        aria-hidden="true"
        style={{ display: 'block', maxWidth: '100%' }}
      >
        {/* Row 1: diamond → square-with-X */}
        <Diamond cx={COL1X} cy={R1Y} r={SHAPER} />
        <Arrow cx={ARROWX} cy={R1Y} />
        <SquareWithX cx={COL2X} cy={R1Y} r={SHAPER * 0.75} />

        {/* Row 2: subdivided triangle → ? */}
        <TriangleSubdivided cx={COL1X} cy={R2Y} b={SHAPER * 0.95} h={SHAPER * 0.82} />
        <Arrow cx={ARROWX} cy={R2Y} />
        <QuestionMark cx={COL2X} cy={R2Y} />

        {/* Horizontal divider between rows */}
        <line
          x1={12} y1={(R1Y + R2Y) / 2}
          x2={VB.w - 12} y2={(R1Y + R2Y) / 2}
          stroke="#D1D5DB" strokeWidth={1} strokeDasharray="4 4"
        />
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Option renderer — renders ONE A/B/C/D choice as an SVG figure
// ---------------------------------------------------------------------------

type OptionLabel = 'A' | 'B' | 'C' | 'D'

const OPTION_ARIA: Record<OptionLabel, { en: string; id: string }> = {
  A: {
    en: 'Option A: inverted triangle subdivided into four smaller triangles.',
    id: 'Pilihan A: segitiga terbalik dibagi menjadi empat segitiga kecil.',
  },
  B: {
    en: 'Option B: plain inverted triangle with no internal lines.',
    id: 'Pilihan B: segitiga terbalik polos tanpa garis internal.',
  },
  C: {
    en: 'Option C: inverted triangle with three median lines from vertices meeting at the centroid.',
    id: 'Pilihan C: segitiga terbalik dengan tiga garis median dari simpul bertemu di pusat.',
  },
  D: {
    en: 'Option D: inverted triangle with three lines forming a Y-pattern meeting inside.',
    id: 'Pilihan D: segitiga terbalik dengan tiga garis membentuk pola-Y bertemu di dalam.',
  },
}

const OPT_VB = 100
const OPT_CX = OPT_VB / 2
const OPT_CY = OPT_VB / 2
const OPT_B = 38
const OPT_H = 34

/**
 * ShapeAnalogy20A19Option — renders one choice A/B/C/D for CHOICE_RENDERERS.
 */
export function ShapeAnalogy20A19Option({ choice }: { choice: WmiChoice }) {
  const label = choice.label as OptionLabel
  const aria = OPTION_ARIA[label]

  let shape: React.ReactNode
  if (label === 'A') {
    shape = <OptionAShape cx={OPT_CX} cy={OPT_CY} b={OPT_B} h={OPT_H} />
  } else if (label === 'B') {
    shape = <OptionBShape cx={OPT_CX} cy={OPT_CY} b={OPT_B} h={OPT_H} />
  } else if (label === 'C') {
    shape = <OptionCShape cx={OPT_CX} cy={OPT_CY} b={OPT_B} h={OPT_H} />
  } else if (label === 'D') {
    shape = <OptionDShape cx={OPT_CX} cy={OPT_CY} b={OPT_B} h={OPT_H} />
  } else {
    return <span>{choice.text}</span>
  }

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <svg
        viewBox={`0 0 ${OPT_VB} ${OPT_VB}`}
        width={80}
        height={80}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        {shape}
      </svg>
    </span>
  )
}
