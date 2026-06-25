// SEAMO-21-B-Q19 — Javier's staircase walking path.
//
// Reconstructed from docs/reference/ocr-res/seamo/contest/paper-b/2021.imgs/006.jpg:
//   A dashed bounding box (120 m wide × 70 m tall).
//   Javier starts at the bottom-left (person glyph) and walks home at the top-right
//   (house glyph) via a stair-stepping path of right/up segments with directional arrows.
//   Horizontal span label "120 m" appears above the dashed top edge.
//   Vertical span label "70 m" appears to the right of the dashed right edge.
//
// Key insight: total horizontal steps = 120 m, total vertical steps = 70 m → 190 m total.
// The figure SHOWS the problem (the path and spans); it does NOT reveal the answer.
//
// Adapted from StairPerim18B2Illustration (dashed-box + labeled dimension technique).
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

/** SVG canvas dimensions */
export const SP19_W = 380
export const SP19_H = 260

/** Dashed box inner area origin and size (in SVG px) */
export const BOX = {
  x: 54,    // left edge of dashed box
  y: 28,    // top edge
  w: 256,   // width  ↔ 120 m
  h: 170,   // height ↕  70 m
}

/** Staircase path corners (SVG coordinates, 6-step zigzag). */
export const PATH_POINTS: ReadonlyArray<[number, number]> = [
  // start: bottom-left corner of box
  [BOX.x, BOX.y + BOX.h],
  // step 1: right
  [BOX.x + 40, BOX.y + BOX.h],
  // step 1: up
  [BOX.x + 40, BOX.y + BOX.h - 28],
  // step 2: right
  [BOX.x + 80, BOX.y + BOX.h - 28],
  // step 2: up
  [BOX.x + 80, BOX.y + BOX.h - 56],
  // step 3: right
  [BOX.x + 120, BOX.y + BOX.h - 56],
  // step 3: up
  [BOX.x + 120, BOX.y + BOX.h - 85],
  // step 4: right
  [BOX.x + 170, BOX.y + BOX.h - 85],
  // step 4: up
  [BOX.x + 170, BOX.y + BOX.h - 113],
  // step 5: right
  [BOX.x + 216, BOX.y + BOX.h - 113],
  // step 5: up
  [BOX.x + 216, BOX.y + BOX.h - 141],
  // step 6: right — reach top-right corner
  [BOX.x + BOX.w, BOX.y + BOX.h - 141],
  // step 6: up — to top-right corner
  [BOX.x + BOX.w, BOX.y],
]

const INK = '#1F2937'
const PATH_COLOR = '#1F2937'
const DASH_COLOR = '#9CA3AF'
const LABEL_COLOR = '#374151'
const ARROW_COLOR = '#1F2937'

/** Arrow marker id */
const ARROW_ID = 'sp19-arrow'

/** Draw a small directional arrow at the midpoint of a segment */
function SegArrow({ x1, y1, x2, y2, color = ARROW_COLOR }: {
  x1: number; y1: number; x2: number; y2: number; color?: string
}) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 1) return null
  const ux = dx / len
  const uy = dy / len
  const size = 5
  // Arrowhead: triangle pointing in direction (ux, uy)
  const ax = mx + ux * size
  const ay = my + uy * size
  const bx = mx - ux * size - uy * size * 0.6
  const by = my - uy * size + ux * size * 0.6
  const cx2 = mx - ux * size + uy * size * 0.6
  const cy2 = my - uy * size - ux * size * 0.6
  return (
    <polygon
      points={`${ax},${ay} ${bx},${by} ${cx2},${cy2}`}
      fill={color}
    />
  )
}

/** Person glyph (stick figure) at a given (cx, baseY) */
function PersonGlyph({ cx, baseY }: { cx: number; baseY: number }) {
  return (
    <g>
      {/* head */}
      <circle cx={cx} cy={baseY - 22} r={7} fill="none" stroke={INK} strokeWidth={1.8} />
      {/* body */}
      <line x1={cx} y1={baseY - 15} x2={cx} y2={baseY - 2} stroke={INK} strokeWidth={1.8} />
      {/* arms */}
      <line x1={cx - 8} y1={baseY - 10} x2={cx + 8} y2={baseY - 10} stroke={INK} strokeWidth={1.8} />
      {/* left leg */}
      <line x1={cx} y1={baseY - 2} x2={cx - 6} y2={baseY + 10} stroke={INK} strokeWidth={1.8} />
      {/* right leg */}
      <line x1={cx} y1={baseY - 2} x2={cx + 6} y2={baseY + 10} stroke={INK} strokeWidth={1.8} />
    </g>
  )
}

/** Simple house glyph */
function HouseGlyph({ cx, baseY }: { cx: number; baseY: number }) {
  const w = 22
  const h = 16
  const roofH = 10
  return (
    <g>
      {/* house body */}
      <rect x={cx - w / 2} y={baseY - h} width={w} height={h} fill="#F3F4F6" stroke={INK} strokeWidth={1.5} />
      {/* door */}
      <rect x={cx - 4} y={baseY - 9} width={7} height={9} fill={INK} />
      {/* window */}
      <rect x={cx - 9} y={baseY - 13} width={5} height={5} fill="#BFDBFE" stroke={INK} strokeWidth={1} />
      {/* roof */}
      <polygon
        points={`${cx - w / 2 - 2},${baseY - h} ${cx},${baseY - h - roofH} ${cx + w / 2 + 2},${baseY - h}`}
        fill="#9CA3AF"
        stroke={INK}
        strokeWidth={1.5}
      />
    </g>
  )
}

/**
 * StairPath21B19Figure — the static staircase path diagram.
 * Phase prop used by the explainer to colour horizontal vs vertical segments.
 */
export type PathPhase = 'horizontal' | 'vertical' | 'total' | null

export interface StairPath21B19FigureProps {
  phase?: PathPhase
}

export function StairPath21B19Figure({ phase = null }: StairPath21B19FigureProps) {
  const pts = PATH_POINTS

  // Determine colours per segment
  const segColor = (i: number) => {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[i + 1]
    const isHoriz = Math.abs(y2 - y1) < 1
    if (phase === null) return PATH_COLOR
    if (phase === 'horizontal') return isHoriz ? '#2563EB' : '#CBD5E1'
    if (phase === 'vertical')   return !isHoriz ? '#10B981' : '#CBD5E1'
    return '#6366F1'  // total
  }

  return (
    <svg
      viewBox={`0 0 ${SP19_W} ${SP19_H}`}
      width="100%"
      style={{ maxWidth: SP19_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* white background */}
      <rect x={0} y={0} width={SP19_W} height={SP19_H} fill="white" />

      {/* dashed bounding box */}
      <rect
        x={BOX.x}
        y={BOX.y}
        width={BOX.w}
        height={BOX.h}
        fill="none"
        stroke={DASH_COLOR}
        strokeWidth={1.8}
        strokeDasharray="6 4"
      />

      {/* dimension label: 120 m (horizontal, above top edge) */}
      {/* horizontal arrow line above dashed top */}
      <line
        x1={BOX.x}
        y1={BOX.y - 10}
        x2={BOX.x + BOX.w}
        y2={BOX.y - 10}
        stroke={LABEL_COLOR}
        strokeWidth={1.2}
        markerEnd={`url(#${ARROW_ID})`}
        markerStart={`url(#${ARROW_ID})`}
      />
      <text
        x={BOX.x + BOX.w / 2}
        y={BOX.y - 14}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize={12}
        fontWeight={700}
        fill={LABEL_COLOR}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        120 m
      </text>

      {/* dimension label: 70 m (vertical, right of right edge) */}
      <line
        x1={BOX.x + BOX.w + 10}
        y1={BOX.y}
        x2={BOX.x + BOX.w + 10}
        y2={BOX.y + BOX.h}
        stroke={LABEL_COLOR}
        strokeWidth={1.2}
        markerEnd={`url(#${ARROW_ID})`}
        markerStart={`url(#${ARROW_ID})`}
      />
      <text
        x={BOX.x + BOX.w + 20}
        y={BOX.y + BOX.h / 2}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={700}
        fill={LABEL_COLOR}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        70 m
      </text>

      {/* marker definition */}
      <defs>
        <marker
          id={ARROW_ID}
          markerWidth="6"
          markerHeight="6"
          refX="3"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" fill={LABEL_COLOR} />
        </marker>
      </defs>

      {/* staircase path segments with arrows */}
      {pts.slice(0, -1).map((pt, i) => {
        const [x1, y1] = pt
        const [x2, y2] = pts[i + 1]
        const c = segColor(i)
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={2.2} strokeLinecap="round" />
            <SegArrow x1={x1} y1={y1} x2={x2} y2={y2} color={c} />
          </g>
        )
      })}

      {/* Phase-aware annotation */}
      {phase === 'horizontal' && (
        <text
          x={BOX.x + BOX.w / 2}
          y={BOX.y + BOX.h + 20}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill="#2563EB"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          Horizontal total = 120 m
        </text>
      )}
      {phase === 'vertical' && (
        <text
          x={BOX.x + BOX.w + 20}
          y={BOX.y + BOX.h / 2 + 24}
          textAnchor="start"
          fontSize={11}
          fontWeight={700}
          fill="#10B981"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          Vert = 70 m
        </text>
      )}
      {phase === 'total' && (
        <text
          x={BOX.x + BOX.w / 2}
          y={BOX.y + BOX.h + 20}
          textAnchor="middle"
          fontSize={12}
          fontWeight={800}
          fill="#6366F1"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          120 + 70 = 190 m
        </text>
      )}

      {/* Person glyph at bottom-left (start) */}
      <PersonGlyph cx={BOX.x - 22} baseY={BOX.y + BOX.h} />

      {/* House glyph at top-right (home) */}
      <HouseGlyph cx={BOX.x + BOX.w + 20} baseY={BOX.y + 18} />
    </svg>
  )
}

/**
 * StairPath21B19Illustration
 *
 * Static problem figure for SEAMO-21-B-Q19.
 * Shows Javier's staircase walking path inside a 120 m × 70 m dashed bounding box
 * with directional arrows. Does NOT reveal the total distance (190 m = answer D).
 */
export default function StairPath21B19Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Javier berjalan pulang mengikuti jalur tangga di dalam kotak putus-putus ' +
        '120 m × 70 m. Gambar menunjukkan jalur dengan panah arah tetapi tidak mengungkapkan total jarak.'
      }
    >
      <StairPath21B19Figure />
    </div>
  )
}
