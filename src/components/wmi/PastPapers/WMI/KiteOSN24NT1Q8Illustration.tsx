// OSN-24-SD-NAS-TEORI1-Q8 — "Kite ABFC, area 100 cm², find white region"
//
// PROBLEM ONLY (no answer shown):
//   - Kite ABFC coloured as in the source paper:
//       orange = upper triangle ABC  (above diagonal BC)
//       blue   = triangles B-E-F and C-E-F  (lower wings)
//       white  = central triangle B-E-C  (the region the student must find)
//   - Labelled vertices A, B, C, D, E, F
//   - Dashed diagonals BC and AF
//
// Pure SVG, no hooks, no framer-motion — SSR-safe and deterministic.

// ── shared layout constants ──────────────────────────────────────────────────
// Kite geometry: BC:AF = 1:2, D = midpoint of AF = diagonal intersection,
// E = midpoint of DF.  Pixel scale: AF=120, BC=60.

export const SVG_W = 200
export const SVG_H = 250

/** x-coordinate of AF (the vertical axis of symmetry). */
export const CX = 100

/** y-coordinate of D (diagonal intersection = midpoint of AF). */
export const DY = 135

/** Half-length of BC (short diagonal). */
export const HC = 30   // BC = 60 total

/** Half-length of AF (long diagonal). */
export const HA = 60   // AF = 120 total

// Derived vertices
export const A = { x: CX,        y: DY - HA }  // (100, 75)
export const B = { x: CX - HC,   y: DY }        // (70, 135)
export const C = { x: CX + HC,   y: DY }        // (130, 135)
export const D = { x: CX,        y: DY }        // (100, 135)
export const F = { x: CX,        y: DY + HA }   // (100, 195)
export const E = { x: CX,        y: DY + HA / 2 } // (100, 165) — midpoint of DF

export const COLOR = {
  ORANGE:  '#F0842C',
  BLUE:    '#7B9FD4',
  WHITE:   '#FFFFFF',
  STROKE:  '#1F2937',
  DASHED:  '#6B7280',
  LABEL:   '#1F2937',
} as const

// ── helpers ─────────────────────────────────────────────────────────────────

function pt(p: { x: number; y: number }) {
  return `${p.x},${p.y}`
}

function polygon(pts: { x: number; y: number }[], fill: string, opacity = 1) {
  return (
    <polygon
      points={pts.map(pt).join(' ')}
      fill={fill}
      fillOpacity={opacity}
      stroke={COLOR.STROKE}
      strokeWidth={1.2}
      strokeLinejoin="round"
    />
  )
}

// ── default export ───────────────────────────────────────────────────────────

/**
 * KiteOSN24NT1Q8Illustration
 *
 * Static problem figure for OSN-24-SD-NAS-TEORI1-Q8.
 * Shows the coloured kite ABFC as printed in the paper;
 * does NOT reveal the white-area answer (25 cm²).
 */
export default function KiteOSN24NT1Q8Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Layang-layang ABFC dengan luas 100 cm². ' +
        'Daerah oranye di atas, daerah biru membentuk sayap di bawah, ' +
        'daerah putih di tengah bawah adalah yang dicari.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(240, SVG_W)}
        style={{ display: 'block' }}
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* ── coloured regions ── */}

        {/* orange: upper kite triangle A-B-C */}
        {polygon([A, B, C], COLOR.ORANGE)}

        {/* blue left wing: B-E-F */}
        {polygon([B, E, F], COLOR.BLUE)}

        {/* blue right wing: C-E-F */}
        {polygon([C, E, F], COLOR.BLUE)}

        {/* white central triangle B-E-C (explicit so it sits on top of blue overlap) */}
        <polygon
          points={[B, E, C].map(pt).join(' ')}
          fill={COLOR.WHITE}
          stroke={COLOR.STROKE}
          strokeWidth={1.2}
          strokeLinejoin="round"
        />

        {/* ── kite outline (on top) ── */}
        <polygon
          points={[A, B, F, C].map(pt).join(' ')}
          fill="none"
          stroke={COLOR.STROKE}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* ── dashed diagonals ── */}
        {/* AF vertical */}
        <line
          x1={A.x} y1={A.y} x2={F.x} y2={F.y}
          stroke={COLOR.DASHED} strokeWidth={1} strokeDasharray="5 3"
        />
        {/* BC horizontal */}
        <line
          x1={B.x} y1={B.y} x2={C.x} y2={C.y}
          stroke={COLOR.DASHED} strokeWidth={1} strokeDasharray="5 3"
        />

        {/* ── inner lines B-E and C-E ── */}
        <line
          x1={B.x} y1={B.y} x2={E.x} y2={E.y}
          stroke={COLOR.STROKE} strokeWidth={1.2}
        />
        <line
          x1={C.x} y1={C.y} x2={E.x} y2={E.y}
          stroke={COLOR.STROKE} strokeWidth={1.2}
        />

        {/* ── vertex dots ── */}
        {[A, B, C, D, E, F].map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill={COLOR.STROKE} />
        ))}

        {/* ── vertex labels ── */}
        {/* A — above */}
        <text x={A.x} y={A.y - 8} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLOR.LABEL} fontFamily="ui-sans-serif,system-ui,sans-serif">A</text>
        {/* B — left */}
        <text x={B.x - 10} y={B.y + 4} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLOR.LABEL} fontFamily="ui-sans-serif,system-ui,sans-serif">B</text>
        {/* C — right */}
        <text x={C.x + 10} y={C.y + 4} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLOR.LABEL} fontFamily="ui-sans-serif,system-ui,sans-serif">C</text>
        {/* D — right of centre (slightly offset from E label) */}
        <text x={D.x + 10} y={D.y - 4} textAnchor="start" fontSize={13} fontWeight={700} fill={COLOR.LABEL} fontFamily="ui-sans-serif,system-ui,sans-serif">D</text>
        {/* E — right */}
        <text x={E.x + 10} y={E.y + 4} textAnchor="start" fontSize={13} fontWeight={700} fill={COLOR.LABEL} fontFamily="ui-sans-serif,system-ui,sans-serif">E</text>
        {/* F — below */}
        <text x={F.x} y={F.y + 16} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLOR.LABEL} fontFamily="ui-sans-serif,system-ui,sans-serif">F</text>
      </svg>
    </div>
  )
}
