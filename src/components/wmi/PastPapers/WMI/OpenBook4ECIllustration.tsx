// IKMC-19-EC-Q4 — "Olaf has an open book. He can see five vehicles on the right page.
// The cover has two holes. When he closes the book, which vehicles can he see?"
// Answer: D = motorcycle + orange van + magenta tractor.
//
// Open book: left page (cover) has 2 rectangular holes. Right page has 5 vehicles
// spaced evenly. When the book is closed, the cover flips left-to-right (mirror),
// so the holes now reveal different vehicles: the motorcycle, van, and tractor.
//
// Co-exports:
//   OpenBook4ECPrimitive  — stage-driven primitive used by the explainer
//   OpenBook4ECOption     — choice renderer (A–E) for the quiz UI
// Default export: OpenBook4ECIllustration (the stem figure, stage 0 / open book).
//
// Pure SVG, no Math.random, no Date — SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Color tokens
// ---------------------------------------------------------------------------
const GRID_BG   = '#FDD835' // yellow grid background
const GRID_LINE = '#F9A825' // grid lines
const SPINE_BG  = '#616161' // spine strip
const SPINE_DOT = '#212121' // spine circles
const HOLE_FILL = '#FFFFFF' // hole fill
const HOLE_STRK = '#BDBDBD' // hole stroke
const COVER_BG  = '#FDD835' // cover (same yellow for simplicity)

// Vehicle colors
const CAR_COLOR        = '#E53935' // red car
const MOTO_COLOR       = '#1E88E5' // blue motorcycle
const TRUCK_COLOR      = '#43A047' // green truck
const VAN_COLOR        = '#FB8C00' // orange van
const TRACTOR_COLOR    = '#E91E63' // magenta tractor

const WHEEL_COLOR      = '#212121'
const VEHICLE_STROKE   = '#212121'

// ---------------------------------------------------------------------------
// Vehicle drawing helpers — simple shapes, no glyphs, no random
// ---------------------------------------------------------------------------

/** Red Car: ellipse body + roof rect + 2 wheels */
function Car({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  const s = size
  // body centered at (x, y)
  const bw = 22 * s
  const bh = 9 * s
  const rw = 12 * s
  const rh = 7 * s
  const wr = 4 * s // wheel radius
  return (
    <g>
      {/* body */}
      <rect x={x - bw / 2} y={y - bh / 2} width={bw} height={bh} rx={3 * s} fill={CAR_COLOR} stroke={VEHICLE_STROKE} strokeWidth={0.8 * s} />
      {/* roof */}
      <rect x={x - rw / 2} y={y - bh / 2 - rh} width={rw} height={rh} rx={2 * s} fill={CAR_COLOR} stroke={VEHICLE_STROKE} strokeWidth={0.8 * s} />
      {/* wheels */}
      <circle cx={x - 6 * s} cy={y + bh / 2 - 1 * s} r={wr} fill={WHEEL_COLOR} />
      <circle cx={x + 6 * s} cy={y + bh / 2 - 1 * s} r={wr} fill={WHEEL_COLOR} />
    </g>
  )
}

/** Blue Motorcycle: 2 wheels + slanted body line + seat bump */
function Motorcycle({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  const s = size
  const wr = 5 * s
  const lx = x - 7 * s
  const rx = x + 7 * s
  const cy2 = y + 2 * s
  return (
    <g>
      {/* rear wheel */}
      <circle cx={lx} cy={cy2} r={wr} fill="none" stroke={MOTO_COLOR} strokeWidth={2 * s} />
      <circle cx={lx} cy={cy2} r={1.5 * s} fill={WHEEL_COLOR} />
      {/* front wheel */}
      <circle cx={rx} cy={cy2} r={wr} fill="none" stroke={MOTO_COLOR} strokeWidth={2 * s} />
      <circle cx={rx} cy={cy2} r={1.5 * s} fill={WHEEL_COLOR} />
      {/* frame / body diagonal */}
      <line x1={lx} y1={cy2 - wr} x2={rx} y2={cy2 - wr + 2 * s} stroke={MOTO_COLOR} strokeWidth={2.5 * s} strokeLinecap="round" />
      <line x1={lx + 4 * s} y1={cy2 - wr} x2={x} y2={cy2 - wr - 4 * s} stroke={MOTO_COLOR} strokeWidth={2 * s} strokeLinecap="round" />
      {/* seat bump */}
      <ellipse cx={x - 2 * s} cy={cy2 - wr - 4 * s} rx={5 * s} ry={2.5 * s} fill={MOTO_COLOR} stroke={VEHICLE_STROKE} strokeWidth={0.6 * s} />
    </g>
  )
}

/** Green Truck: large box body + small cab + 2 big wheels */
function Truck({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  const s = size
  const bw = 20 * s
  const bh = 12 * s
  const cw = 8 * s
  const ch = 10 * s
  const wr = 4 * s
  const bx = x - bw / 2 - 2 * s
  const by = y - bh / 2
  const cx2 = bx + bw
  return (
    <g>
      {/* cargo box */}
      <rect x={bx} y={by} width={bw} height={bh} rx={1.5 * s} fill={TRUCK_COLOR} stroke={VEHICLE_STROKE} strokeWidth={0.8 * s} />
      {/* cab */}
      <rect x={cx2} y={by + bh - ch} width={cw} height={ch} rx={2 * s} fill={TRUCK_COLOR} stroke={VEHICLE_STROKE} strokeWidth={0.8 * s} />
      {/* windows on cab */}
      <rect x={cx2 + 1.5 * s} y={by + bh - ch + 1.5 * s} width={cw - 3 * s} height={ch * 0.4} rx={1 * s} fill="#B3E5FC" stroke={VEHICLE_STROKE} strokeWidth={0.5 * s} />
      {/* wheels */}
      <circle cx={bx + 5 * s} cy={by + bh} r={wr} fill={WHEEL_COLOR} />
      <circle cx={cx2 + cw - 3 * s} cy={by + bh} r={wr} fill={WHEEL_COLOR} />
    </g>
  )
}

/** Orange Van: boxy rectangle body + 2 wheels */
function Van({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  const s = size
  const bw = 20 * s
  const bh = 13 * s
  const wr = 4 * s
  const bx = x - bw / 2
  const by = y - bh / 2
  return (
    <g>
      {/* body */}
      <rect x={bx} y={by} width={bw} height={bh} rx={2 * s} fill={VAN_COLOR} stroke={VEHICLE_STROKE} strokeWidth={0.8 * s} />
      {/* windshield */}
      <rect x={bx + bw - 6 * s} y={by + 2 * s} width={4 * s} height={5 * s} rx={1 * s} fill="#B3E5FC" stroke={VEHICLE_STROKE} strokeWidth={0.5 * s} />
      {/* side window */}
      <rect x={bx + 2 * s} y={by + 2 * s} width={8 * s} height={4 * s} rx={1 * s} fill="#B3E5FC" stroke={VEHICLE_STROKE} strokeWidth={0.5 * s} />
      {/* wheels */}
      <circle cx={bx + 4 * s} cy={by + bh} r={wr} fill={WHEEL_COLOR} />
      <circle cx={bx + bw - 4 * s} cy={by + bh} r={wr} fill={WHEEL_COLOR} />
    </g>
  )
}

/** Magenta Tractor: large rear wheel + small front wheel + rectangular body + chimney */
function Tractor({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  const s = size
  const rwr = 7 * s // rear wheel radius
  const fwr = 4 * s // front wheel radius
  const bw = 14 * s
  const bh = 8 * s
  const rx2 = x - 4 * s // rear wheel center x
  const fx  = x + 10 * s // front wheel center x
  const gy  = y + 4 * s // ground level (bottom of wheels)
  const by  = gy - rwr - bh + 2 * s // body top
  return (
    <g>
      {/* rear wheel */}
      <circle cx={rx2} cy={gy - rwr} r={rwr} fill="none" stroke={TRACTOR_COLOR} strokeWidth={2.5 * s} />
      <circle cx={rx2} cy={gy - rwr} r={2 * s} fill={WHEEL_COLOR} />
      {/* front wheel */}
      <circle cx={fx} cy={gy - fwr} r={fwr} fill="none" stroke={TRACTOR_COLOR} strokeWidth={2 * s} />
      <circle cx={fx} cy={gy - fwr} r={1.5 * s} fill={WHEEL_COLOR} />
      {/* body */}
      <rect x={rx2 - 1 * s} y={by} width={bw} height={bh} rx={2 * s} fill={TRACTOR_COLOR} stroke={VEHICLE_STROKE} strokeWidth={0.8 * s} />
      {/* chimney */}
      <rect x={rx2 + 1 * s} y={by - 5 * s} width={3 * s} height={5 * s} rx={0.5 * s} fill={TRACTOR_COLOR} stroke={VEHICLE_STROKE} strokeWidth={0.7 * s} />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Grid helper — draws a yellow grid page
// ---------------------------------------------------------------------------
function Grid({
  x, y, w, h, rows, cols,
}: {
  x: number; y: number; w: number; h: number; rows: number; cols: number
}) {
  const cellW = w / cols
  const cellH = h / rows
  const lines: JSX.Element[] = []
  for (let r = 1; r < rows; r++) {
    const ly = y + r * cellH
    lines.push(<line key={`hr${r}`} x1={x} y1={ly} x2={x + w} y2={ly} stroke={GRID_LINE} strokeWidth={0.5} />)
  }
  for (let c = 1; c < cols; c++) {
    const lx = x + c * cellW
    lines.push(<line key={`vc${c}`} x1={lx} y1={y} x2={lx} y2={y + h} stroke={GRID_LINE} strokeWidth={0.5} />)
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={GRID_BG} />
      {lines}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={VEHICLE_STROKE} strokeWidth={1} />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Stage type
// ---------------------------------------------------------------------------
export type OpenBook4ECStage = 0 | 1 | 2 | 3

export interface OpenBook4ECProps {
  stage?: OpenBook4ECStage
}

// ---------------------------------------------------------------------------
// Layout constants for the stem (wide landscape book)
// ---------------------------------------------------------------------------
const VIEW_W = 320
const VIEW_H = 100

// Pages
const LEFT_X  = 0
const LEFT_W  = 148
const SPINE_X = 148
const SPINE_W = 24
const RIGHT_X = 172
const RIGHT_W = 148

const PAGE_Y  = 4
const PAGE_H  = 92

const GRID_ROWS = 6
const GRID_COLS = 8

// Holes on the left page (cover)
// Hole 1 (large): cols 1–4 approx
const HOLE1_X = LEFT_X + 8
const HOLE1_Y = PAGE_Y + 20
const HOLE1_W = 50
const HOLE1_H = 55

// Hole 2 (smaller): cols 6–7 approx
const HOLE2_X = LEFT_X + 75
const HOLE2_Y = PAGE_Y + 30
const HOLE2_W = 30
const HOLE2_H = 40

// Vehicles on right page — 5 evenly spaced
// Order left to right: car, motorcycle, truck, van, tractor
const VY = PAGE_Y + PAGE_H / 2 + 2 // vertical center on right page
const V_SPACING = RIGHT_W / 6       // 5 vehicles in 6 slots

const V_POSITIONS = [1, 2, 3, 4, 5].map((i) => RIGHT_X + i * V_SPACING)

// When the book closes: left↔right mirror.
// Original right-page x-range: RIGHT_X to RIGHT_X + RIGHT_W (172 to 320).
// After mirroring across center of right page: x' = RIGHT_X + RIGHT_W - (x - RIGHT_X) = 320 - x + 172 + 172 = …
// More simply: x_mirrored = RIGHT_X + (RIGHT_X + RIGHT_W - x) = 2*RIGHT_X + RIGHT_W - x
//
// The cover holes, once flipped, map to mirrored positions on the right page.
// Hole 1 original: center-x ≈ LEFT_X + 8 + 25 = 33 on LEFT page (0..148).
//   On left page its position within LEFT_W: 33/148 ≈ 22%.
//   When cover flips left↔right: new x fraction = 1 - 22% = 78% from left of RIGHT page.
//   New center-x in RIGHT page space: RIGHT_X + 0.78 * RIGHT_W ≈ 172 + 115 = 287.
//
// Hole 2 original: center-x ≈ 75 + 15 = 90 on LEFT page.
//   Fraction: 90/148 ≈ 60.8%.  Mirrored fraction: 1 - 60.8% = 39.2%.
//   New center-x: RIGHT_X + 0.392 * RIGHT_W ≈ 172 + 58 = 230.
//
// Vehicle positions (index 0-4 = car, moto, truck, van, tractor):
//   V_SPACING = 148/6 ≈ 24.67
//   V_POSITIONS[0] = 172 + 24.67 ≈ 197  (car)
//   V_POSITIONS[1] = 172 + 49.33 ≈ 221  (motorcycle)
//   V_POSITIONS[2] = 172 + 74    ≈ 246  (truck)
//   V_POSITIONS[3] = 172 + 98.67 ≈ 271  (van)
//   V_POSITIONS[4] = 172 + 123.3 ≈ 295  (tractor)
//
// Hole1 lands at ~287 → between van (~271) and tractor (~295) → shows tractor (idx 4) and part of van (idx 3).
// Hole2 lands at ~230 → between car (~197) and motorcycle (~221) → shows motorcycle (idx 1).
// Answer D: motorcycle + van + tractor. ✓

// Stage renderers
function StageOpenBook() {
  return (
    <g>
      {/* Left page (cover) */}
      <Grid x={LEFT_X} y={PAGE_Y} w={LEFT_W} h={PAGE_H} rows={GRID_ROWS} cols={GRID_COLS} />
      {/* Holes */}
      <rect x={HOLE1_X} y={HOLE1_Y} width={HOLE1_W} height={HOLE1_H} rx={3} fill={HOLE_FILL} stroke={HOLE_STRK} strokeWidth={1.5} />
      <rect x={HOLE2_X} y={HOLE2_Y} width={HOLE2_W} height={HOLE2_H} rx={3} fill={HOLE_FILL} stroke={HOLE_STRK} strokeWidth={1.5} />
      {/* Spine */}
      <rect x={SPINE_X} y={PAGE_Y} width={SPINE_W} height={PAGE_H} fill={SPINE_BG} />
      {[0.25, 0.45, 0.65, 0.85].map((f, i) => (
        <circle key={i} cx={SPINE_X + SPINE_W / 2} cy={PAGE_Y + PAGE_H * f} r={3} fill={SPINE_DOT} />
      ))}
      {/* Right page */}
      <Grid x={RIGHT_X} y={PAGE_Y} w={RIGHT_W} h={PAGE_H} rows={GRID_ROWS} cols={GRID_COLS} />
      {/* 5 vehicles */}
      <Car        x={V_POSITIONS[0]} y={VY} size={0.85} />
      <Motorcycle x={V_POSITIONS[1]} y={VY} size={0.85} />
      <Truck      x={V_POSITIONS[2]} y={VY} size={0.75} />
      <Van        x={V_POSITIONS[3]} y={VY} size={0.85} />
      <Tractor    x={V_POSITIONS[4]} y={VY} size={0.8} />
    </g>
  )
}

/** Stage 1: open book with highlighted holes (colored overlay). */
function StageHighlightHoles() {
  return (
    <g>
      <StageOpenBook />
      {/* Highlight overlays on holes */}
      <rect x={HOLE1_X} y={HOLE1_Y} width={HOLE1_W} height={HOLE1_H} rx={3} fill="#FFF176" stroke="#F9A825" strokeWidth={2} opacity={0.7} />
      <rect x={HOLE2_X} y={HOLE2_Y} width={HOLE2_W} height={HOLE2_H} rx={3} fill="#FFF176" stroke="#F9A825" strokeWidth={2} opacity={0.7} />
    </g>
  )
}

/** Stage 2: book closing — show a partially folded cover with dotted fold line. */
function StageClosing() {
  // Show right page + spine + partially folded cover (skewed trapezoidal)
  const coverSkew = 30 // px of horizontal skew at top of cover
  return (
    <g>
      {/* Right page */}
      <Grid x={RIGHT_X} y={PAGE_Y} w={RIGHT_W} h={PAGE_H} rows={GRID_ROWS} cols={GRID_COLS} />
      {/* 5 vehicles */}
      <Car        x={V_POSITIONS[0]} y={VY} size={0.85} />
      <Motorcycle x={V_POSITIONS[1]} y={VY} size={0.85} />
      <Truck      x={V_POSITIONS[2]} y={VY} size={0.75} />
      <Van        x={V_POSITIONS[3]} y={VY} size={0.85} />
      <Tractor    x={V_POSITIONS[4]} y={VY} size={0.8} />
      {/* Spine */}
      <rect x={SPINE_X} y={PAGE_Y} width={SPINE_W} height={PAGE_H} fill={SPINE_BG} />
      {[0.25, 0.45, 0.65, 0.85].map((f, i) => (
        <circle key={i} cx={SPINE_X + SPINE_W / 2} cy={PAGE_Y + PAGE_H * f} r={3} fill={SPINE_DOT} />
      ))}
      {/* Partially folded cover — trapezoid sweeping right toward spine */}
      <polygon
        points={`
          ${SPINE_X + SPINE_W},${PAGE_Y}
          ${SPINE_X + SPINE_W + coverSkew},${PAGE_Y}
          ${SPINE_X + SPINE_W + coverSkew - 8},${PAGE_Y + PAGE_H}
          ${SPINE_X + SPINE_W},${PAGE_Y + PAGE_H}
        `}
        fill={COVER_BG}
        stroke={VEHICLE_STROKE}
        strokeWidth={1}
        opacity={0.9}
      />
      {/* Dotted fold line showing the axis of rotation */}
      <line
        x1={SPINE_X + SPINE_W}
        y1={PAGE_Y}
        x2={SPINE_X + SPINE_W}
        y2={PAGE_Y + PAGE_H}
        stroke="#1E88E5"
        strokeWidth={2}
        strokeDasharray="6 4"
      />
      {/* Mirror arrow annotation */}
      <path
        d={`M${SPINE_X + SPINE_W + 40},${PAGE_Y + PAGE_H / 2 - 10} C${SPINE_X + SPINE_W + 60},${PAGE_Y + PAGE_H / 2 - 20} ${SPINE_X + SPINE_W + 80},${PAGE_Y + PAGE_H / 2 - 20} ${SPINE_X + SPINE_W + 100},${PAGE_Y + PAGE_H / 2 - 10}`}
        fill="none"
        stroke="#E53935"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <polygon
        points={`${SPINE_X + SPINE_W + 100},${PAGE_Y + PAGE_H / 2 - 10} ${SPINE_X + SPINE_W + 93},${PAGE_Y + PAGE_H / 2 - 18} ${SPINE_X + SPINE_W + 93},${PAGE_Y + PAGE_H / 2 - 2}`}
        fill="#E53935"
      />
    </g>
  )
}

/** Stage 3: closed book — cover on top, holes showing vehicles underneath.
 *  Holes now reveal: motorcycle (idx 1), van (idx 3), tractor (idx 4).
 */
function StageClosedBook() {
  // The closed book: cover lays on top of right page.
  // Cover occupies the same x-space as the right page (RIGHT_X to RIGHT_X + RIGHT_W).
  // The holes, now mirrored, show through to vehicles beneath.
  const cx = RIGHT_X
  const cw = RIGHT_W
  const cy = PAGE_Y
  const ch = PAGE_H

  // Mirrored hole positions on the cover
  // Hole1 mirrored: occupies fraction [1 - (HOLE1_X + HOLE1_W)/LEFT_W .. 1 - HOLE1_X/LEFT_W]
  const h1LeftFrac  = HOLE1_X / LEFT_W
  const h1RightFrac = (HOLE1_X + HOLE1_W) / LEFT_W
  const mh1X = cx + (1 - h1RightFrac) * cw
  const mh1W = (h1RightFrac - h1LeftFrac) * cw

  const h2LeftFrac  = HOLE2_X / LEFT_W
  const h2RightFrac = (HOLE2_X + HOLE2_W) / LEFT_W
  const mh2X = cx + (1 - h2RightFrac) * cw
  const mh2W = (h2RightFrac - h2LeftFrac) * cw

  return (
    <g>
      {/* The right page vehicles (rendered underneath, clipped to hole shapes) */}
      {/* Render vehicles normally, then cover with yellow cover, then cut holes */}
      {/* Right page background */}
      <Grid x={RIGHT_X} y={PAGE_Y} w={RIGHT_W} h={PAGE_H} rows={GRID_ROWS} cols={GRID_COLS} />
      <Car        x={V_POSITIONS[0]} y={VY} size={0.85} />
      <Motorcycle x={V_POSITIONS[1]} y={VY} size={0.85} />
      <Truck      x={V_POSITIONS[2]} y={VY} size={0.75} />
      <Van        x={V_POSITIONS[3]} y={VY} size={0.85} />
      <Tractor    x={V_POSITIONS[4]} y={VY} size={0.8} />
      {/* Spine */}
      <rect x={SPINE_X} y={PAGE_Y} width={SPINE_W} height={PAGE_H} fill={SPINE_BG} />
      {[0.25, 0.45, 0.65, 0.85].map((f, i) => (
        <circle key={i} cx={SPINE_X + SPINE_W / 2} cy={PAGE_Y + PAGE_H * f} r={3} fill={SPINE_DOT} />
      ))}
      {/* Cover overlay (closed on top) */}
      <rect x={cx} y={cy} width={cw} height={ch} fill={COVER_BG} stroke={VEHICLE_STROKE} strokeWidth={1.5} />
      {/* Grid lines on cover */}
      {Array.from({ length: GRID_ROWS - 1 }, (_, r) => (
        <line
          key={`cr${r}`}
          x1={cx}
          y1={cy + (r + 1) * (ch / GRID_ROWS)}
          x2={cx + cw}
          y2={cy + (r + 1) * (ch / GRID_ROWS)}
          stroke={GRID_LINE}
          strokeWidth={0.5}
        />
      ))}
      {Array.from({ length: GRID_COLS - 1 }, (_, c) => (
        <line
          key={`cc${c}`}
          x1={cx + (c + 1) * (cw / GRID_COLS)}
          y1={cy}
          x2={cx + (c + 1) * (cw / GRID_COLS)}
          y2={cy + ch}
          stroke={GRID_LINE}
          strokeWidth={0.5}
        />
      ))}
      {/* Hole 1 (mirrored — large, now on right side of cover) — shows through */}
      <rect x={mh1X} y={HOLE1_Y} width={mh1W} height={HOLE1_H} rx={3} fill="none" stroke={HOLE_STRK} strokeWidth={1.5} />
      {/* Hole 2 (mirrored — smaller, now on left-center of cover) — shows through */}
      <rect x={mh2X} y={HOLE2_Y} width={mh2W} height={HOLE2_H} rx={3} fill="none" stroke={HOLE_STRK} strokeWidth={1.5} />
      {/* Re-render visible vehicles through holes using clipPath technique */}
      <defs>
        <clipPath id="hole1clip">
          <rect x={mh1X} y={HOLE1_Y} width={mh1W} height={HOLE1_H} rx={3} />
        </clipPath>
        <clipPath id="hole2clip">
          <rect x={mh2X} y={HOLE2_Y} width={mh2W} height={HOLE2_H} rx={3} />
        </clipPath>
      </defs>
      {/* Show vehicles through hole 1 (right mirrored hole — shows tractor and van) */}
      <g clipPath="url(#hole1clip)">
        <rect x={cx} y={cy} width={cw} height={ch} fill={GRID_BG} />
        <Van     x={V_POSITIONS[3]} y={VY} size={0.85} />
        <Tractor x={V_POSITIONS[4]} y={VY} size={0.8} />
      </g>
      {/* Show vehicles through hole 2 (left-center mirrored hole — shows motorcycle) */}
      <g clipPath="url(#hole2clip)">
        <rect x={cx} y={cy} width={cw} height={ch} fill={GRID_BG} />
        <Motorcycle x={V_POSITIONS[1]} y={VY} size={0.85} />
      </g>
      {/* Hole outlines on top of clip content */}
      <rect x={mh1X} y={HOLE1_Y} width={mh1W} height={HOLE1_H} rx={3} fill="none" stroke={HOLE_STRK} strokeWidth={1.5} />
      <rect x={mh2X} y={HOLE2_Y} width={mh2W} height={HOLE2_H} rx={3} fill="none" stroke={HOLE_STRK} strokeWidth={1.5} />
    </g>
  )
}

// ---------------------------------------------------------------------------
// OpenBook4ECPrimitive — named export, stage-driven
// ---------------------------------------------------------------------------

/**
 * OpenBook4ECPrimitive — reusable stage-animated primitive.
 * stage 0 — open book (default stem view)
 * stage 1 — open book with holes highlighted
 * stage 2 — book closing (partially folded cover, dotted fold line)
 * stage 3 — closed book, holes showing motorcycle + van + tractor
 */
export function OpenBook4ECPrimitive({ stage = 0 }: OpenBook4ECProps = {}) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width={300}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      {stage === 0 && <StageOpenBook />}
      {stage === 1 && <StageHighlightHoles />}
      {stage === 2 && <StageClosing />}
      {stage === 3 && <StageClosedBook />}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// OpenBook4ECOption — named export, choice renderer (A–E)
// ---------------------------------------------------------------------------

// Each option shows 3 vehicles in a small SVG row
// A = car + motorcycle + van
// B = car + motorcycle + tractor
// C = motorcycle + truck + van
// D = motorcycle + van + tractor
// E = car + truck + tractor

type VehicleKey = 'car' | 'motorcycle' | 'truck' | 'van' | 'tractor'

const CHOICE_VEHICLES: Record<string, [VehicleKey, VehicleKey, VehicleKey]> = {
  A: ['car', 'motorcycle', 'van'],
  B: ['car', 'motorcycle', 'tractor'],
  C: ['motorcycle', 'truck', 'van'],
  D: ['motorcycle', 'van', 'tractor'],
  E: ['car', 'truck', 'tractor'],
}

function renderVehicle(key: VehicleKey, x: number, y: number) {
  switch (key) {
    case 'car':        return <Car        key={key} x={x} y={y} size={0.85} />
    case 'motorcycle': return <Motorcycle key={key} x={x} y={y} size={0.85} />
    case 'truck':      return <Truck      key={key} x={x} y={y} size={0.75} />
    case 'van':        return <Van        key={key} x={x} y={y} size={0.85} />
    case 'tractor':    return <Tractor    key={key} x={x} y={y} size={0.8} />
  }
}

const OPT_W = 180
const OPT_H = 60
const OPT_VY = OPT_H / 2 + 4

/**
 * OpenBook4ECOption — renders 3 vehicles for the given choice label A–E.
 * Used in the quiz answer-choice UI.
 */
export function OpenBook4ECOption({ choice }: { choice: WmiChoice }) {
  const vehicles = CHOICE_VEHICLES[choice.label]
  if (!vehicles) return <span>{choice.text}</span>

  const spacing = OPT_W / 4
  const positions = [1, 2, 3].map((i) => i * spacing)

  return (
    <span
      role="img"
      aria-label={choice.text}
      style={{
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1.5px solid #E5E7EB',
        borderRadius: 8,
        padding: 4,
      }}
    >
      <svg
        viewBox={`0 0 ${OPT_W} ${OPT_H}`}
        width={160}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        {vehicles.map((key, i) => renderVehicle(key, positions[i], OPT_VY))}
      </svg>
    </span>
  )
}

// ---------------------------------------------------------------------------
// Default export — stem illustration (open book, stage 0)
// ---------------------------------------------------------------------------

/**
 * OpenBook4ECIllustration — the question stem figure.
 * Shows the open book with two holes on the left page (cover) and five
 * vehicles on the right page, left to right: car, motorcycle, truck, van, tractor.
 */
export default function OpenBook4ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Buku terbuka dengan dua lubang di sampul (halaman kiri) dan lima kendaraan di halaman kanan: mobil merah, motor biru, truk hijau, van oranye, traktor magenta."
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width={Math.min(340, VIEW_W)}
        aria-hidden="true"
      >
        <StageOpenBook />
      </svg>
    </div>
  )
}
