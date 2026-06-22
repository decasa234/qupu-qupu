// IKMC-21-EC-Q24 — "What does Martin need to put on the left-hand side of the
// third set of scales for them to balance?"
//
// Three BALANCED (level-beam) balance scales showing three shape types:
//   hexagons (⬡), squares (□), and triangles (△).
//
//   Scale 1 (level): 1 hexagon (left)              = 3 triangles (right)   → H = 3T
//   Scale 2 (level): 1 hexagon + 1 triangle (left) = 1 square   (right)   → S = H + T = 4T
//   Scale 3 (level): ? (left, EMPTY)               = 1 hexagon + 1 triangle (right)
//                    → right side = 4T = 1 square → answer: A (1 square)
//
// Adapted from BallScales8ECIllustration (IKMC-21-EC-Q8) — same CELL geometry,
// Pan, beam, blue triangular pivot — shapes replaced with hexagon/square/triangle
// glyphs matching the scan colour palette (grey-blue hexagons, yellow squares,
// blue-grey triangles).
//
// The STEM figure shows ONLY the problem: the three balanced scales with their
// shapes. The left pan of Scale 3 is intentionally empty. Pure render — no
// randomness, no Date, SSR-safe.

import React from 'react'

// ---- palette ---------------------------------------------------------------
const INK = '#1F2937'
const HEX_FILL = '#9CA3AF'      // grey hexagon (matches scan)
const HEX_STROKE = '#4B5563'
const SQ_FILL = '#FDE68A'       // pale yellow square (matches scan)
const SQ_STROKE = '#B45309'
const TRI_FILL = '#BAE6FD'      // light blue triangle (matches scan)
const TRI_STROKE = '#0369A1'
const BASE_FILL = '#5BC0EB'     // blue triangular pivot (consistent with EC pool)
const BEAM_COLOR = '#9AA0A6'
const PAN_COLOR = '#FFFFFF'

// ---- one scale geometry ----------------------------------------------------
export const CELL_W = 310
export const CELL_H = 200

const PIVOT_Y = 108
const BEAM_HALF = 104
const PAN_DROP = 14
const TRAY_W = 90
const TRAY_HALF = TRAY_W / 2

// ---- shape sizes -----------------------------------------------------------
const HEX_R = 15    // hexagon circumradius
const SQ_SIDE = 28  // square side
const TRI_SIZE = 30 // triangle base / height

// ---- shape glyph helpers ---------------------------------------------------

/** Flat-top regular hexagon centred at (cx, cy). */
function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i + 30) // flat-top: first vertex at 30°
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(' ')
}

/** Render one shape glyph. baseY is the pan surface; shape sits on it. */
function ShapeGlyph({
  kind,
  cx,
  baseY,
}: {
  kind: 'hex' | 'square' | 'triangle'
  cx: number
  baseY: number
}) {
  if (kind === 'hex') {
    const cy = baseY - HEX_R
    return (
      <polygon
        points={hexPoints(cx, cy, HEX_R)}
        fill={HEX_FILL}
        stroke={HEX_STROKE}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    )
  }
  if (kind === 'square') {
    return (
      <rect
        x={cx - SQ_SIDE / 2}
        y={baseY - SQ_SIDE}
        width={SQ_SIDE}
        height={SQ_SIDE}
        rx={3}
        fill={SQ_FILL}
        stroke={SQ_STROKE}
        strokeWidth={2}
      />
    )
  }
  // triangle — pointing upward, base on pan surface
  const half = TRI_SIZE / 2
  const h = (TRI_SIZE * Math.sqrt(3)) / 2
  return (
    <polygon
      points={`${cx},${baseY - h} ${cx - half},${baseY} ${cx + half},${baseY}`}
      fill={TRI_FILL}
      stroke={TRI_STROKE}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  )
}

// ---- pan (V-hanger + shallow tray) ----------------------------------------
function Pan({
  px,
  py,
  children,
}: {
  px: number
  py: number
  children?: React.ReactNode
}) {
  const trayTop = py + PAN_DROP
  return (
    <g>
      {/* V-hanger lines */}
      <line x1={px} y1={py} x2={px - TRAY_HALF + 8} y2={trayTop} stroke={INK} strokeWidth={1.5} />
      <line x1={px} y1={py} x2={px + TRAY_HALF - 8} y2={trayTop} stroke={INK} strokeWidth={1.5} />
      {/* items */}
      {children}
      {/* shallow bowl rim */}
      <path
        d={`M ${px - TRAY_HALF} ${trayTop} Q ${px} ${trayTop + 14} ${px + TRAY_HALF} ${trayTop}`}
        fill="none"
        stroke={INK}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <ellipse cx={px} cy={trayTop} rx={TRAY_HALF} ry={4.5} fill={PAN_COLOR} stroke={INK} strokeWidth={2.5} />
    </g>
  )
}

// ---- per-scale data --------------------------------------------------------
export type ShapeKind = 'hex' | 'square' | 'triangle'

export interface ScaleDef24 {
  /** Shapes on the left pan, left → right. Empty = intentionally empty. */
  left: ShapeKind[]
  /** Shapes on the right pan, left → right. */
  right: ShapeKind[]
}

/** The three scales as shown in the source figure. */
export const SCALES_24: ScaleDef24[] = [
  // Scale 1 (balanced): 1 hexagon  vs  3 triangles   →  H = 3T
  { left: ['hex'], right: ['triangle', 'triangle', 'triangle'] },
  // Scale 2 (balanced): 1 hexagon + 1 triangle  vs  1 square   →  S = H + T = 4T
  { left: ['hex', 'triangle'], right: ['square'] },
  // Scale 3 (left EMPTY — student must supply): right = 1 hexagon + 1 triangle = 4T = 1 square
  { left: [], right: ['hex', 'triangle'] },
]

// ---- rendering one scale row -----------------------------------------------
const SHAPE_SPACING = 32 // horizontal gap between shapes on the same pan

/** Layout n shapes centred at panX on the pan surface. */
function layoutShapes(panX: number, baseY: number, shapes: ShapeKind[]) {
  const n = shapes.length
  if (n === 0) return []
  const totalW = (n - 1) * SHAPE_SPACING
  const startX = panX - totalW / 2
  return shapes.map((kind, i) => ({ kind, cx: startX + i * SHAPE_SPACING, baseY }))
}

export function ScaleRow24({
  def,
  ox,
  dim = false,
  highlight = false,
}: {
  def: ScaleDef24
  ox: number
  dim?: boolean
  highlight?: boolean
}) {
  const pivotX = ox + CELL_W / 2
  const panY = PIVOT_Y           // level beam — both pans hang from the same y
  const leftX = pivotX - BEAM_HALF
  const rightX = pivotX + BEAM_HALF
  const groundY = CELL_H - 10

  const trayTop = panY + PAN_DROP
  const shapeBase = trayTop - 2

  const leftItems = layoutShapes(leftX, shapeBase, def.left)
  const rightItems = layoutShapes(rightX, shapeBase, def.right)

  return (
    <g opacity={dim ? 0.25 : 1}>
      {highlight && (
        <rect
          x={ox + 4}
          y={4}
          width={CELL_W - 8}
          height={CELL_H - 8}
          rx={12}
          fill="none"
          stroke="#2563EB"
          strokeWidth={2.5}
          strokeDasharray="6 3"
          opacity={0.6}
        />
      )}

      {/* Left pan */}
      <Pan px={leftX} py={panY}>
        {leftItems.map((p, i) => (
          <ShapeGlyph key={i} kind={p.kind} cx={p.cx} baseY={p.baseY} />
        ))}
      </Pan>

      {/* Right pan */}
      <Pan px={rightX} py={panY}>
        {rightItems.map((p, i) => (
          <ShapeGlyph key={i} kind={p.kind} cx={p.cx} baseY={p.baseY} />
        ))}
      </Pan>

      {/* Horizontal beam (balanced) */}
      <line
        x1={leftX}
        y1={panY}
        x2={rightX}
        y2={panY}
        stroke={BEAM_COLOR}
        strokeWidth={8}
        strokeLinecap="round"
      />

      {/* Blue triangular pivot base */}
      <polygon
        points={`${pivotX},${PIVOT_Y - 4} ${pivotX - 32},${groundY} ${pivotX + 32},${groundY}`}
        fill={BASE_FILL}
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {/* pivot bolt */}
      <circle cx={pivotX} cy={PIVOT_Y} r={6} fill={PAN_COLOR} stroke={INK} strokeWidth={2.5} />
    </g>
  )
}

// ---- whole-figure SVG primitive (co-exported for the explainer) ------------
const GAP = 12
const PAD = 10
export const VIEW_W = PAD * 2 + CELL_W * 3 + GAP * 2  // 958
export const VIEW_H = CELL_H

export interface ThreeScales24Props {
  /** Spotlight one scale (1, 2, or 3); others dim. null = all neutral. */
  litScale?: 1 | 2 | 3 | null
}

/**
 * The three balance scales (Q24), optionally spotlighting one.
 * aria-hidden — must sit inside a labelled wrapper.
 */
export function ThreeScales24({ litScale = null }: ThreeScales24Props) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 720, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {SCALES_24.map((def, i) => (
        <ScaleRow24
          key={i}
          def={def}
          ox={PAD + i * (CELL_W + GAP)}
          dim={litScale !== null && litScale !== ((i + 1) as 1 | 2 | 3)}
          highlight={litScale === ((i + 1) as 1 | 2 | 3)}
        />
      ))}
    </svg>
  )
}

// ---- default export: the question stem figure ------------------------------
export default function ThreeScales24ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Tiga timbangan seimbang. ' +
        'Timbangan 1: 1 segi enam = 3 segitiga. ' +
        'Timbangan 2: 1 segi enam + 1 segitiga = 1 persegi. ' +
        'Timbangan 3: sisi kiri kosong (pertanyaan) vs 1 segi enam + 1 segitiga di sisi kanan.'
      }
    >
      <ThreeScales24 />
    </div>
  )
}
