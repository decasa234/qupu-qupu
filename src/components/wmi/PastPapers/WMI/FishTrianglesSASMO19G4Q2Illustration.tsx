// FishTrianglesSASMO19G4Q2Illustration — SASMO-19-G4-Q2
//
// "How many triangles are there in the picture below?"
//
// Faithful SVG reconstruction of the fish-triangle figure in
// docs/reference/ocr-res/sasmo/contest/g4/2019-2020.imgs/002.jpg
//
// The figure is a stylised fish composed entirely of triangular line segments:
//   • Body: a kite (diamond) outline — a quadrilateral, NOT itself a triangle.
//   • Dorsal fin   — small triangle overlapping the body at T (top vertex).
//   • Ventral fin  — small triangle overlapping the body at B (bottom vertex).
//   • Pectoral fin — small left-pointing triangle near the snout L, with a
//                    tiny nested triangle inside it.
//   • Tail — right-pointing triangle divided by 3 radiating lines from the
//             tail tip into 4 triangular wedges (W1–W4).
//
// Triangle count (answer B = 12):
//   Small (size 1):  4 tail wedges + 1 dorsal + 1 ventral + 2 pectoral = 8
//   Medium (size 2): consecutive tail-wedge pairs W1+W2, W2+W3, W3+W4  = 3
//   Large  (size 4): the whole tail triangle                             = 1
//   Total: 8 + 3 + 1 = 12  ✓
//
// Pure render — no hooks, no Math.random, no Date — SSR-safe.

export const SVG_W = 300
export const SVG_H = 185

// ── body kite ─────────────────────────────────────────────────────────────────
export const L = [50,  92] as const   // snout / left tip
export const T = [145, 32] as const   // top junction
export const R = [222, 92] as const   // right junction (body ↔ tail)
export const B = [145, 153] as const  // bottom junction

// ── dorsal fin (small triangle at top, base sits on lines L→T and T→R) ───────
// base points at ~35% from T along each body edge
export const DF_L    = [112, 53] as const   // on line L→T
export const DF_R    = [173, 53] as const   // on line T→R
export const DF_APEX = [143, 10] as const   // apex above body

// ── ventral fin (mirror of dorsal, below B) ───────────────────────────────────
export const VF_L    = [112, 131] as const  // on line L→B
export const VF_R    = [173, 131] as const  // on line B→R
export const VF_APEX = [143, 175] as const  // apex below body

// ── pectoral fins (left area near snout L) ────────────────────────────────────
// Outer fin: small left-pointing triangle
export const PF_TIP = [18, 92]  as const
export const PF_TOP = [50, 70]  as const
export const PF_BOT = [50, 114] as const
// Inner tiny triangle nested inside the outer pectoral fin
export const PI_TIP = [29, 92]  as const
export const PI_TOP = [44, 80]  as const
export const PI_BOT = [44, 104] as const

// ── tail (right-pointing triangle, tip on the far right) ──────────────────────
export const TAIL_TOP = [224, 58]  as const  // top of tail's left base
export const TAIL_TIP = [286, 92]  as const  // rightmost tip
export const TAIL_BOT = [224, 126] as const  // bottom of tail's left base
// 3 radiating dividers from TAIL_TIP → left base, creating 4 triangular wedges
export const D1 = [224, 74]  as const
export const D2 = [224, 92]  as const   // horizontal midline through the tip
export const D3 = [224, 110] as const

// ── render helpers ─────────────────────────────────────────────────────────────
const INK  = '#1E293B'
const FILL = '#F8FAFC'

function pt([x, y]: readonly [number, number]): string {
  return `${x},${y}`
}

export default function FishTrianglesSASMO19G4Q2Illustration() {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      {/* body kite (quadrilateral outline) */}
      <polygon
        points={`${pt(L)} ${pt(T)} ${pt(R)} ${pt(B)}`}
        fill={FILL}
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* dorsal fin */}
      <polygon
        points={`${pt(DF_L)} ${pt(DF_APEX)} ${pt(DF_R)}`}
        fill={FILL}
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* ventral fin */}
      <polygon
        points={`${pt(VF_L)} ${pt(VF_APEX)} ${pt(VF_R)}`}
        fill={FILL}
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* pectoral fin — outer */}
      <polygon
        points={`${pt(PF_TIP)} ${pt(PF_TOP)} ${pt(PF_BOT)}`}
        fill={FILL}
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* pectoral fin — inner tiny triangle */}
      <polygon
        points={`${pt(PI_TIP)} ${pt(PI_TOP)} ${pt(PI_BOT)}`}
        fill={FILL}
        stroke={INK}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* tail — outer boundary */}
      <polygon
        points={`${pt(TAIL_TOP)} ${pt(TAIL_TIP)} ${pt(TAIL_BOT)}`}
        fill={FILL}
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* tail — 3 internal radiating dividers → 4 wedge triangles */}
      <line x1={TAIL_TIP[0]} y1={TAIL_TIP[1]} x2={D1[0]} y2={D1[1]} stroke={INK} strokeWidth="1.5" />
      <line x1={TAIL_TIP[0]} y1={TAIL_TIP[1]} x2={D2[0]} y2={D2[1]} stroke={INK} strokeWidth="1.5" />
      <line x1={TAIL_TIP[0]} y1={TAIL_TIP[1]} x2={D3[0]} y2={D3[1]} stroke={INK} strokeWidth="1.5" />
    </svg>
  )
}
