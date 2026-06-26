// SASMO-20-G4-Q11 — Two rectangles ABCD and PQRS (each 10×6 cm).
// ABCD: horizontal divider; 2 upward triangles (upper half) + 2 asymmetric triangles (lower half).
// PQRS: vertical divider; 4 inward-arrowhead gray triangles with white cutouts top/bottom.
// Both shaded areas = 30 cm². Stem only — no answer revealed.
// SSR-safe: no hooks, no framer-motion.

export const SVG_W = 460
export const SVG_H = 190

// ── Colour tokens ─────────────────────────────────────────────────────────────
export const C = {
  SHADE: '#9CA3AF',  // shaded triangles
  INK:   '#1F2937',  // borders + corner labels
  WHITE: '#FFFFFF',
} as const

// ── ABCD layout (10 cm × 6 cm @ 20 px/cm, landscape, horizontal divider) ────
export const ABCD = { x: 8, y: 38, w: 200, h: 120 } as const
export const AB_MY = ABCD.y + ABCD.h / 2  // = 98  horizontal midline y
export const AB_PX = ABCD.x + 140          // = 148 asymmetric split on midline (~7 cm)

// ── PQRS layout (10 cm × 6 cm @ 20 px/cm, landscape, vertical divider) ──────
export const PQRS = { x: 252, y: 38, w: 200, h: 120 } as const
export const PQ_MX  = PQRS.x + PQRS.w / 2        // = 352 vertical midline x
export const PQ_CLX = PQRS.x + PQRS.w / 4        // = 302 centre of left half
export const PQ_CRX = PQRS.x + 3 * PQRS.w / 4   // = 402 centre of right half
export const PQ_CY  = PQRS.y + PQRS.h / 2        // = 98  vertical centre

// ── Polygon point strings (exported for Explainer reuse) ─────────────────────

/** ABCD shaded triangle points */
export const ABCD_TRIS = {
  // Upper half — 2 triangles: base on midline, apex at AB edge
  upperL: `${ABCD.x},${AB_MY} ${ABCD.x + 100},${AB_MY} ${ABCD.x + 47},${ABCD.y}`,
  upperR: `${ABCD.x + 100},${AB_MY} ${ABCD.x + ABCD.w},${AB_MY} ${ABCD.x + 154},${ABCD.y}`,
  // Lower half — asymmetric split at AB_PX on the midline
  lowerL: `${ABCD.x},${ABCD.y + ABCD.h} ${ABCD.x},${AB_MY} ${AB_PX},${AB_MY}`,
  lowerR: `${AB_PX},${AB_MY} ${ABCD.x + ABCD.w},${AB_MY} ${ABCD.x + ABCD.w},${ABCD.y + ABCD.h}`,
} as const

/** PQRS shaded triangle points — 4 inward arrowheads (left/right of each half) */
export const PQRS_TRIS = {
  leftArr:     `${PQRS.x},${PQRS.y} ${PQ_CLX},${PQ_CY} ${PQRS.x},${PQRS.y + PQRS.h}`,
  midLeftArr:  `${PQ_CLX},${PQ_CY} ${PQ_MX},${PQRS.y} ${PQ_MX},${PQRS.y + PQRS.h}`,
  midRightArr: `${PQ_MX},${PQRS.y} ${PQ_CRX},${PQ_CY} ${PQ_MX},${PQRS.y + PQRS.h}`,
  rightArr:    `${PQ_CRX},${PQ_CY} ${PQRS.x + PQRS.w},${PQRS.y} ${PQRS.x + PQRS.w},${PQRS.y + PQRS.h}`,
} as const

// ── Shared static scene (re-exported for Explainer) ──────────────────────────

export function TwoRectsShadedBase() {
  const { x: ax, y: ay, w: aw, h: ah } = ABCD
  const { x: px, y: py, w: pw, h: ph } = PQRS
  const fs = 12
  const ff = 'system-ui,sans-serif'
  const fw = '700'

  return (
    <g>
      {/* ── ABCD ── */}
      <rect x={ax} y={ay} width={aw} height={ah} fill={C.WHITE} stroke={C.INK} strokeWidth={2} />
      {/* Shaded triangles */}
      <polygon points={ABCD_TRIS.upperL} fill={C.SHADE} stroke={C.INK} strokeWidth={1} />
      <polygon points={ABCD_TRIS.upperR} fill={C.SHADE} stroke={C.INK} strokeWidth={1} />
      <polygon points={ABCD_TRIS.lowerL} fill={C.SHADE} stroke={C.INK} strokeWidth={1} />
      <polygon points={ABCD_TRIS.lowerR} fill={C.SHADE} stroke={C.INK} strokeWidth={1} />
      {/* Horizontal midline */}
      <line x1={ax} y1={AB_MY} x2={ax + aw} y2={AB_MY} stroke={C.INK} strokeWidth={1.5} />
      {/* Outer border (redraw on top so it's never clipped by shading) */}
      <rect x={ax} y={ay} width={aw} height={ah} fill="none" stroke={C.INK} strokeWidth={2} />
      {/* Corner labels */}
      <text x={ax - 3} y={ay - 3} textAnchor="end" fontSize={fs} fontWeight={fw} fill={C.INK} fontFamily={ff}>A</text>
      <text x={ax + aw + 3} y={ay - 3} textAnchor="start" fontSize={fs} fontWeight={fw} fill={C.INK} fontFamily={ff}>B</text>
      <text x={ax + aw + 3} y={ay + ah + 12} textAnchor="start" fontSize={fs} fontWeight={fw} fill={C.INK} fontFamily={ff}>C</text>
      <text x={ax - 3} y={ay + ah + 12} textAnchor="end" fontSize={fs} fontWeight={fw} fill={C.INK} fontFamily={ff}>D</text>

      {/* ── PQRS ── */}
      <rect x={px} y={py} width={pw} height={ph} fill={C.WHITE} stroke={C.INK} strokeWidth={2} />
      {/* Gray arrowhead triangles */}
      <polygon points={PQRS_TRIS.leftArr}     fill={C.SHADE} stroke="none" />
      <polygon points={PQRS_TRIS.midLeftArr}  fill={C.SHADE} stroke="none" />
      <polygon points={PQRS_TRIS.midRightArr} fill={C.SHADE} stroke="none" />
      <polygon points={PQRS_TRIS.rightArr}    fill={C.SHADE} stroke="none" />
      {/* Vertical midline */}
      <line x1={PQ_MX} y1={py} x2={PQ_MX} y2={py + ph} stroke={C.INK} strokeWidth={1.5} />
      {/* Outer border (on top) */}
      <rect x={px} y={py} width={pw} height={ph} fill="none" stroke={C.INK} strokeWidth={2} />
      {/* Corner labels */}
      <text x={px - 3} y={py - 3} textAnchor="end" fontSize={fs} fontWeight={fw} fill={C.INK} fontFamily={ff}>P</text>
      <text x={px + pw + 3} y={py - 3} textAnchor="start" fontSize={fs} fontWeight={fw} fill={C.INK} fontFamily={ff}>Q</text>
      <text x={px + pw + 3} y={py + ph + 12} textAnchor="start" fontSize={fs} fontWeight={fw} fill={C.INK} fontFamily={ff}>R</text>
      <text x={px - 3} y={py + ph + 12} textAnchor="end" fontSize={fs} fontWeight={fw} fill={C.INK} fontFamily={ff}>S</text>
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────────

/**
 * TwoRectsShadedSASMO20G4Q11Illustration
 *
 * Side-by-side ABCD (horizontal divider, 4 shaded triangles) and PQRS
 * (vertical divider, 4 inward-arrowhead shaded triangles). Both shaded
 * regions = 30 cm². Does NOT reveal the answer.
 */
export default function TwoRectsShadedSASMO20G4Q11Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Dua persegi panjang ABCD dan PQRS dengan daerah yang diarsir — bandingkan luasnya"
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ width: '100%', maxWidth: SVG_W, display: 'block' }}
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />
        <TwoRectsShadedBase />
      </svg>
    </div>
  )
}
