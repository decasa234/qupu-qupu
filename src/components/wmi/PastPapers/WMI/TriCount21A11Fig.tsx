// TriCount21A11Fig — SEAMO 2021 Paper A Q11
// "How many triangles are there in the figure below?"  Answer: 14  (choice A)
//
// Source: 2021.imgs/017.jpg  — a crown-like figure with 5 outer vertices
// and 8 drawn line segments that create exactly 14 triangles.
//
// Outer vertices:
//   T  — top apex
//   L  — upper-left wing tip
//   R  — upper-right wing tip
//   BL — lower-left inner corner
//   BR — lower-right inner corner
//
// Drawn segments (8):
//   T–L   outer left wing edge
//   T–R   outer right wing edge
//   T–BL  inner left edge (apex to lower-left)
//   T–BR  inner right edge (apex to lower-right)
//   L–BL  left wing base
//   R–BR  right wing base
//   L–BR  crossing diagonal (left to lower-right)
//   R–BL  crossing diagonal (right to lower-left)
//   (no bottom base BL–BR)
//
// Interior intersections (auto-computed):
//   F  = L–BR ∩ R–BL      (centre X)
//   G  = T–BL ∩ L–BR      (inner-left)
//   H  = T–BR ∩ R–BL      (inner-right)
//
// Triangle catalogue (14):
//   T-L-BL   T-L-BR   T-L-G
//   T-R-BL   T-R-BR   T-R-H
//   T-BL-H   T-BR-G
//   L-BL-F   L-BL-G
//   R-BR-F   R-BR-H
//   BL-F-G   BR-F-H
//
// Classification: STEM (figure in stem; answer choices are numbers)
// Pure SVG, SSR-safe — no hooks, no framer-motion, no window/document.

// ── Geometry constants ────────────────────────────────────────────────────────

const VW  = 280
const VH  = 240
const PAD = 18

// Outer named vertices
const VT: [number, number]  = [VW / 2,         PAD]
const VL: [number, number]  = [PAD,             VH * 0.46]
const VR: [number, number]  = [VW - PAD,        VH * 0.46]
const VBL: [number, number] = [VW * 0.22,       VH - PAD]
const VBR: [number, number] = [VW * 0.78,       VH - PAD]

// ── Line-segment intersection ─────────────────────────────────────────────────

function intersect(
  p1: [number, number], p2: [number, number],
  p3: [number, number], p4: [number, number],
): [number, number] | null {
  const [x1, y1] = p1, [x2, y2] = p2
  const [x3, y3] = p3, [x4, y4] = p4
  const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
  if (Math.abs(d) < 1e-9) return null
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d
  const s = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / d
  if (t < -1e-9 || t > 1 + 1e-9 || s < -1e-9 || s > 1 + 1e-9) return null
  return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)]
}

// Interior intersection points
const VF  = intersect(VL, VBR, VR, VBL)  ?? [VW / 2, VH * 0.75] // L–BR ∩ R–BL
const VG  = intersect(VT, VBL, VL, VBR)  ?? [VW * 0.32, VH * 0.62] // T–BL ∩ L–BR
const VH_ = intersect(VT, VBR, VR, VBL)  ?? [VW * 0.68, VH * 0.62] // T–BR ∩ R–BL

// ── Colours ───────────────────────────────────────────────────────────────────

const C_BG     = '#FFFBF0'
const C_FILL   = '#FEF3C7'
const C_STROKE = '#92400E'
const C_DOT    = '#B45309'
const C_GREEN  = '#10B981'
const C_GFILL  = 'rgba(16,185,129,0.22)'

// ── SVG point-string helper ───────────────────────────────────────────────────

function pts(...points: [number, number][]): string {
  return points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

// ── Figure exports (used by explainer) ───────────────────────────────────────

/** All named vertices for the explainer to reference. */
export const CROWN_VERTS = {
  T: VT, L: VL, R: VR, BL: VBL, BR: VBR,
  F: VF, G: VG, H: VH_,
} as const

/** The 14 valid triangles, by vertex name triples, for explainer step highlights. */
export const CROWN_TRIS: ReadonlyArray<readonly [keyof typeof CROWN_VERTS, keyof typeof CROWN_VERTS, keyof typeof CROWN_VERTS]> = [
  ['T', 'L',  'BL'],  ['T', 'L',  'BR'],  ['T', 'L',  'G'],
  ['T', 'R',  'BL'],  ['T', 'R',  'BR'],  ['T', 'R',  'H'],
  ['T', 'BL', 'H'],   ['T', 'BR', 'G'],
  ['L', 'BL', 'F'],   ['L', 'BL', 'G'],
  ['R', 'BR', 'F'],   ['R', 'BR', 'H'],
  ['BL', 'F', 'G'],   ['BR', 'F', 'H'],
] as const

// ── Reusable figure component ─────────────────────────────────────────────────

export interface TriCount21A11FigureProps {
  /** Highlight a specific triangle (vertex-name triple). */
  highlight?: readonly [keyof typeof CROWN_VERTS, keyof typeof CROWN_VERTS, keyof typeof CROWN_VERTS] | null
}

export function TriCount21A11Figure({ highlight = null }: TriCount21A11FigureProps) {
  const hPts = highlight
    ? (highlight.map((k) => CROWN_VERTS[k]) as [number, number][])
    : null

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: VW, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Background */}
      <rect width={VW} height={VH} fill={C_BG} rx={8} />

      {/* Crown fill (outer region shading) */}
      <polygon
        points={pts(VT, VL, VBL, VBR, VR)}
        fill={C_FILL}
        stroke="none"
      />

      {/* Highlight overlay */}
      {hPts && hPts.length === 3 && (
        <polygon
          points={pts(...hPts as [[number, number], [number, number], [number, number]])}
          fill={C_GFILL}
          stroke={C_GREEN}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      )}

      {/* ── Drawn segments ── */}

      {/* Outer wing edges */}
      <line x1={VT[0]}  y1={VT[1]}  x2={VL[0]}  y2={VL[1]}  stroke={C_STROKE} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={VT[0]}  y1={VT[1]}  x2={VR[0]}  y2={VR[1]}  stroke={C_STROKE} strokeWidth={2.5} strokeLinecap="round" />
      {/* Wing base edges */}
      <line x1={VL[0]}  y1={VL[1]}  x2={VBL[0]} y2={VBL[1]} stroke={C_STROKE} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={VR[0]}  y1={VR[1]}  x2={VBR[0]} y2={VBR[1]} stroke={C_STROKE} strokeWidth={2.5} strokeLinecap="round" />
      {/* Inner edges from apex */}
      <line x1={VT[0]}  y1={VT[1]}  x2={VBL[0]} y2={VBL[1]} stroke={C_STROKE} strokeWidth={2}   strokeLinecap="round" />
      <line x1={VT[0]}  y1={VT[1]}  x2={VBR[0]} y2={VBR[1]} stroke={C_STROKE} strokeWidth={2}   strokeLinecap="round" />
      {/* Crossing diagonals */}
      <line x1={VL[0]}  y1={VL[1]}  x2={VBR[0]} y2={VBR[1]} stroke={C_STROKE} strokeWidth={2}   strokeLinecap="round" />
      <line x1={VR[0]}  y1={VR[1]}  x2={VBL[0]} y2={VBL[1]} stroke={C_STROKE} strokeWidth={2}   strokeLinecap="round" />

      {/* Interior intersection dots */}
      <circle cx={VF[0]}  cy={VF[1]}  r={3} fill={C_DOT} />
      <circle cx={VG[0]}  cy={VG[1]}  r={3} fill={C_DOT} />
      <circle cx={VH_[0]} cy={VH_[1]} r={3} fill={C_DOT} />
    </svg>
  )
}

// ── Default export — static illustration ─────────────────────────────────────

export default function TriCount21A11Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'A crown-shaped figure with apex at the top and two wing tips at mid-left and mid-right. ' +
        'Eight line segments create an interior mesh with three crossing points. ' +
        'Count all triangles of every size — the total is 14.'
      }
    >
      <TriCount21A11Figure />
    </div>
  )
}

// ── Registry entry (return as text — do NOT wire here) ────────────────────────
//
//   VISUALS['SEAMO-21-A-Q11'] = {
//     type: 'stem',
//     illustration: () => import('./TriCount21A11Fig'),
//   }
