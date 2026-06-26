// OSN-16-SD-PROV-Q14 — Road map: two 2×2 unit-segment grids staircase-connected
// at corner B. Stem illustration shows the map with A, B, C labelled.
//
// PRIMITIVE-INDEX: NodeGraph draws circle-nodes; this figure is a plain
// line-grid. No existing primitive matched, so the SVG is written directly.
// The grid helper (RoadMapGrid) is also exported for the explainer overlay.
//
// Exports:
//   default        RoadMapOSN16PQ14Illustration — the stem component.
//   RoadMapGrid    — shared <g> drawing of all road segments.
//   NODE_POS       — pixel coordinates of every intersection.
//   NodeId         — union type of NODE_POS keys.
//   CELL, STROKE, SW — layout constants shared with the explainer.

export const CELL   = 50        // px per unit cell
export const STROKE = '#30598A' // qupu brand blue
export const SW     = 2.2       // stroke width
const LABEL_INK     = '#1F2937'

// ── Node positions (content space) ───────────────────────────────────────────
// Lower grid: x=[0,100], y=[100,200]   A=(0,200) → B=(100,100)
// Upper grid: x=[100,200], y=[0,100]   B=(100,100) → C=(200,0)
export const NODE_POS = {
  // Lower grid
  A:   { x:   0, y: 200 },
  l10: { x:  50, y: 200 },
  l20: { x: 100, y: 200 },
  l01: { x:   0, y: 150 },
  l11: { x:  50, y: 150 },
  l21: { x: 100, y: 150 },
  l02: { x:   0, y: 100 },
  l12: { x:  50, y: 100 },
  B:   { x: 100, y: 100 },
  // Upper grid
  u10: { x: 150, y: 100 },
  u20: { x: 200, y: 100 },
  u01: { x: 100, y:  50 },
  u11: { x: 150, y:  50 },
  u21: { x: 200, y:  50 },
  u02: { x: 100, y:   0 },
  u12: { x: 150, y:   0 },
  C:   { x: 200, y:   0 },
} as const
export type NodeId = keyof typeof NODE_POS

// ── Road segments ─────────────────────────────────────────────────────────────

/** Renders all 12 road segments for the two sub-grids as a bare <g>. */
export function RoadMapGrid() {
  // [x1, y1, x2, y2]
  // prettier-ignore
  const segs: [number, number, number, number][] = [
    // Lower grid — horizontals
    [  0, 200, 100, 200],
    [  0, 150, 100, 150],
    [  0, 100, 100, 100],
    // Lower grid — verticals
    [  0, 100,   0, 200],
    [ 50, 100,  50, 200],
    [100, 100, 100, 200],
    // Upper grid — horizontals
    [100, 100, 200, 100],
    [100,  50, 200,  50],
    [100,   0, 200,   0],
    // Upper grid — verticals
    [100,   0, 100, 100],
    [150,   0, 150, 100],
    [200,   0, 200, 100],
  ]
  return (
    <g>
      {segs.map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={STROKE}
          strokeWidth={SW}
          strokeLinecap="square"
        />
      ))}
    </g>
  )
}

// ── Illustration ──────────────────────────────────────────────────────────────
// viewBox gives 24 px margin around the 200×200 content so labels aren't clipped.

export default function RoadMapOSN16PQ14Illustration() {
  return (
    <svg
      viewBox="-24 -24 248 248"
      width={248}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <RoadMapGrid />

      {/* A — below bottom-left corner */}
      <text
        x={0} y={218}
        textAnchor="middle"
        fontSize={16} fontWeight={700}
        fill={LABEL_INK}
        className="font-display"
      >A</text>

      {/* B — to the lower-right of the inner staircase junction */}
      <text
        x={107} y={107}
        textAnchor="start"
        fontSize={16} fontWeight={700}
        fill={LABEL_INK}
        className="font-display"
      >B</text>

      {/* C — above top-right corner */}
      <text
        x={200} y={-10}
        textAnchor="middle"
        fontSize={16} fontWeight={700}
        fill={LABEL_INK}
        className="font-display"
      >C</text>
    </svg>
  )
}
