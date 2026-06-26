// SASMO-19-G3-Q16 — "Berapa banyak persegi panjang yang ada pada gambar berikut?"
// Static problem figure: a house with embedded rectangular elements.
// Does NOT label or highlight any count — shows the problem only.
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── Layout constants (re-exported so explainer can overlay in same coords) ──

export const SVG_W = 300
export const SVG_H = 215

/** Garage (annex) body */
export const G = { x: 5, y: 115, w: 80, h: 90 } as const
/** Garage roof peak */
export const GROOF = { px: 45, py: 88 } as const
/** Garage window outer rect */
export const GW = { x: 10, y: 152, w: 65, h: 25 } as const
/** Garage window divider x-positions (3 panes) */
export const GW_D1 = 31
export const GW_D2 = 52

/** Main house body */
export const H = { x: 85, y: 68, w: 185, h: 137 } as const
/** Main roof peak */
export const HROOF = { px: 177, py: 8 } as const
/** Attic window */
export const AW = { x: 154, y: 20, w: 46, h: 28 } as const
/** Left 2×2 window outer rect */
export const LW = { x: 93, y: 86, w: 72, h: 52 } as const
export const LW_DIV_X = 129
export const LW_DIV_Y = 112
/** Right 2×2 window outer rect */
export const RW = { x: 176, y: 86, w: 72, h: 52 } as const
export const RW_DIV_X = 212
export const RW_DIV_Y = 112
/** Door */
export const DR = { x: 150, y: 140, w: 52, h: 65 } as const
/** Left side panel */
export const LP = { x: 136, y: 150, w: 12, h: 45 } as const
/** Right side panel */
export const RP = { x: 204, y: 150, w: 12, h: 45 } as const

// ── Color tokens ─────────────────────────────────────────────────────────────

export const C = {
  WALL: '#FFF8EC',
  STROKE: '#1F2937',
  ROOF_FILL: '#E8D5B0',
  ROOF_STROKE: '#7D5A20',
  WIN: '#D6EAF8',
  WIN_STROKE: '#1F618D',
  DOOR: '#D5A86A',
  DOOR_STROKE: '#7D4800',
  GARAGE_FILL: '#F5ECD7',
} as const

// ── Shared sub-components (re-exported for the explainer) ────────────────────

export function Window2x2({
  x, y, w, h, divX, divY,
}: {
  x: number; y: number; w: number; h: number; divX: number; divY: number
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={C.WIN} stroke={C.WIN_STROKE} strokeWidth={1.5} />
      <line x1={divX} y1={y} x2={divX} y2={y + h} stroke={C.WIN_STROKE} strokeWidth={1.5} />
      <line x1={x} y1={divY} x2={x + w} y2={divY} stroke={C.WIN_STROKE} strokeWidth={1.5} />
    </g>
  )
}

export function GarageWindow3({
  x, y, w, h, d1, d2,
}: {
  x: number; y: number; w: number; h: number; d1: number; d2: number
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={C.WIN} stroke={C.WIN_STROKE} strokeWidth={1.5} />
      <line x1={d1} y1={y} x2={d1} y2={y + h} stroke={C.WIN_STROKE} strokeWidth={1.5} />
      <line x1={d2} y1={y} x2={d2} y2={y + h} stroke={C.WIN_STROKE} strokeWidth={1.5} />
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────────

/**
 * HouseRectsSASMO19G3Q16Illustration
 *
 * Shows a house (main body + attic window + two 2×2 windows + door with side panels
 * + attached garage with 3-pane window). Together they contain exactly 30 rectangles.
 * Does NOT reveal the count or highlight any element.
 */
export default function HouseRectsSASMO19G3Q16Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Gambar rumah dengan berbagai persegi panjang — hitung semua persegi panjang yang ada"
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(320, SVG_W)}
        style={{ display: 'block' }}
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* ── Garage ── */}
        <rect
          x={G.x} y={G.y} width={G.w} height={G.h}
          fill={C.GARAGE_FILL} stroke={C.STROKE} strokeWidth={2}
        />
        <polygon
          points={`${G.x},${G.y} ${GROOF.px},${GROOF.py} ${G.x + G.w},${G.y}`}
          fill={C.ROOF_FILL} stroke={C.ROOF_STROKE} strokeWidth={2}
        />
        <GarageWindow3 x={GW.x} y={GW.y} w={GW.w} h={GW.h} d1={GW_D1} d2={GW_D2} />

        {/* ── Main house ── */}
        <rect
          x={H.x} y={H.y} width={H.w} height={H.h}
          fill={C.WALL} stroke={C.STROKE} strokeWidth={2}
        />
        <polygon
          points={`${H.x},${H.y} ${HROOF.px},${HROOF.py} ${H.x + H.w},${H.y}`}
          fill={C.ROOF_FILL} stroke={C.ROOF_STROKE} strokeWidth={2}
        />
        {/* Attic window */}
        <rect
          x={AW.x} y={AW.y} width={AW.w} height={AW.h}
          fill={C.WIN} stroke={C.WIN_STROKE} strokeWidth={1.5}
        />
        {/* Left 2×2 window */}
        <Window2x2 x={LW.x} y={LW.y} w={LW.w} h={LW.h} divX={LW_DIV_X} divY={LW_DIV_Y} />
        {/* Right 2×2 window */}
        <Window2x2 x={RW.x} y={RW.y} w={RW.w} h={RW.h} divX={RW_DIV_X} divY={RW_DIV_Y} />
        {/* Door */}
        <rect
          x={DR.x} y={DR.y} width={DR.w} height={DR.h}
          fill={C.DOOR} stroke={C.DOOR_STROKE} strokeWidth={1.5}
        />
        {/* Side panels */}
        <rect
          x={LP.x} y={LP.y} width={LP.w} height={LP.h}
          fill={C.WIN} stroke={C.WIN_STROKE} strokeWidth={1.5}
        />
        <rect
          x={RP.x} y={RP.y} width={RP.w} height={RP.h}
          fill={C.WIN} stroke={C.WIN_STROKE} strokeWidth={1.5}
        />
      </svg>
    </div>
  )
}
