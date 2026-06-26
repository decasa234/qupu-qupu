// SIMOC-19-G2-Q8 — "Which solid is formed by the net below?"
//
// Stem: 6-face cross net for a 4:1:1 rectangular prism.
// Net layout (cross, 4 rows × 1 col, with end flanks on row 2):
//
//        [back  ]
//        [top   ]
//  [L]   [front ]   [R]
//        [bottom]
//
// Answer: B — the long rectangular prism.
//
// Default export  → NetFoldSIMOC19G2Q8Illustration (stem net, SSR-safe).
// Named export    → NetFoldSIMOC19G2Q8Option (choice renderer A–D + E fallback).
//
// Pure SVG, no hooks, no framer-motion, SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Isometric rectangular prism helper
// ---------------------------------------------------------------------------

const SQ3H = Math.sqrt(3) / 2 // ≈ 0.866

function isoP(x: number, y: number, z: number, S: number): [number, number] {
  return [(x - y) * SQ3H * S, (x + y) * 0.5 * S - z * S]
}

function polyPts(verts: [number, number][]): string {
  return verts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
}

interface IsoBoxProps {
  /** Width (right axis). */
  W: number
  /** Depth (back axis). */
  D: number
  /** Height (up axis). */
  H: number
  /** Pixels per unit. */
  S?: number
  topFill?: string
  frontFill?: string
  rightFill?: string
  stroke?: string
  pad?: number
  /** SVG width in px; height auto-scales. */
  width?: number
}

function IsoBox({
  W, D, H, S = 12,
  topFill = '#D6EBF7',
  frontFill = '#8FC6E8',
  rightFill = '#5BA8D4',
  stroke = '#1F2937',
  pad = 4,
  width = 100,
}: IsoBoxProps) {
  const p = (x: number, y: number, z: number) => isoP(x, y, z, S)

  const top   = [p(0,0,H), p(W,0,H), p(W,D,H), p(0,D,H)]
  const front = [p(0,0,0), p(W,0,0), p(W,0,H), p(0,0,H)]
  const right = [p(W,0,0), p(W,D,0), p(W,D,H), p(W,0,H)]

  const all = [...top, ...front, ...right]
  const xs = all.map(([x]) => x)
  const ys = all.map(([, y]) => y)
  const minX = Math.min(...xs) - pad
  const minY = Math.min(...ys) - pad
  const maxX = Math.max(...xs) + pad
  const maxY = Math.max(...ys) + pad
  const vbW = maxX - minX
  const vbH = maxY - minY

  return (
    <svg
      viewBox={`${minX} ${minY} ${vbW} ${vbH}`}
      width={width}
      height={Math.round((width * vbH) / vbW)}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <polygon points={polyPts(top)}   fill={topFill}   stroke={stroke} strokeWidth={1.2} strokeLinejoin="round" />
      <polygon points={polyPts(front)} fill={frontFill} stroke={stroke} strokeWidth={1.2} strokeLinejoin="round" />
      <polygon points={polyPts(right)} fill={rightFill} stroke={stroke} strokeWidth={1.2} strokeLinejoin="round" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Option box data
// ---------------------------------------------------------------------------

interface BoxDef { W: number; D: number; H: number; ariaEn: string; ariaId: string }

const BOX_DEFS: Record<string, BoxDef> = {
  A: {
    W: 2, D: 2, H: 2,
    ariaEn: 'Option A: a cube with equal width, depth, and height.',
    ariaId: 'Pilihan A: kubus dengan lebar, kedalaman, dan tinggi yang sama.',
  },
  B: {
    W: 4, D: 1, H: 1,
    ariaEn: 'Option B: a long rectangular prism, four times longer than it is wide or tall.',
    ariaId: 'Pilihan B: balok panjang, empat kali lebih panjang dari lebar atau tingginya.',
  },
  C: {
    W: 1.5, D: 0.4, H: 3,
    ariaEn: 'Option C: a tall thin slab, much taller than it is wide, with shallow depth.',
    ariaId: 'Pilihan C: balok tipis tinggi, jauh lebih tinggi dari lebarnya, dengan kedalaman kecil.',
  },
  D: {
    W: 3, D: 1.5, H: 0.5,
    ariaEn: 'Option D: a flat panel, wide and deep but very thin in height.',
    ariaId: 'Pilihan D: papan datar, lebar dan dalam tetapi sangat tipis tingginya.',
  },
}

// ---------------------------------------------------------------------------
// Cross net SVG (stem illustration)
// ---------------------------------------------------------------------------
//
// Net for a 4:1:1 rectangular prism.
// Units: CW = 4 units, CH = 1 unit, CD = 1 unit.
// px per unit = 20.
// Face rectangles (x, y, w, h):
//   row 0 (back face):    (CD, 0,    CW, CH)
//   row 1 (top face):     (CD, CH,   CW, CH)
//   row 2 center (front): (CD, CH*2, CW, CH)
//   row 2 left  (end):    (0,  CH*2, CD, CH)
//   row 2 right (end):    (CD+CW, CH*2, CD, CH)
//   row 3 (bottom face):  (CD, CH*3, CW, CH)

const U = 20   // px per unit
const CW = 4 * U   // 80
const CH = 1 * U   // 20
const CD = 1 * U   // 20

const NET_VB_W = CD + CW + CD  // 120
const NET_VB_H = CH * 4        // 80

const NET_BG   = '#EFF6FF'
const NET_WIDE = '#BFDBFE'  // tint for the 4 wide faces
const NET_END  = '#93C5FD'  // tint for the 2 end square faces
const NET_SK   = '#1E40AF'

const NET_FACES = [
  { x: CD,      y: 0,     w: CW, h: CH, fill: NET_WIDE }, // back
  { x: CD,      y: CH,    w: CW, h: CH, fill: NET_WIDE }, // top
  { x: 0,       y: CH*2,  w: CD, h: CH, fill: NET_END  }, // left end
  { x: CD,      y: CH*2,  w: CW, h: CH, fill: NET_WIDE }, // front (center row)
  { x: CD+CW,   y: CH*2,  w: CD, h: CH, fill: NET_END  }, // right end
  { x: CD,      y: CH*3,  w: CW, h: CH, fill: NET_WIDE }, // bottom
] as const

function NetSVG({ width = 240 }: { width?: number }) {
  const h = Math.round((width * NET_VB_H) / NET_VB_W)
  return (
    <svg
      viewBox={`0 0 ${NET_VB_W} ${NET_VB_H}`}
      width={width}
      height={h}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <rect x={0} y={0} width={NET_VB_W} height={NET_VB_H} fill={NET_BG} fillOpacity={0} />
      {NET_FACES.map((f, i) => (
        <rect
          key={i}
          x={f.x} y={f.y} width={f.w} height={f.h}
          fill={f.fill}
          stroke={NET_SK}
          strokeWidth={1.5}
        />
      ))}
      {/* Fold-line tick marks at interior edges */}
      <line x1={CD} y1={CH}   x2={CD+CW} y2={CH}   stroke={NET_SK} strokeWidth={0.8} strokeDasharray="3 2" />
      <line x1={CD} y1={CH*2} x2={CD+CW} y2={CH*2} stroke={NET_SK} strokeWidth={0.8} strokeDasharray="3 2" />
      <line x1={CD} y1={CH*3} x2={CD+CW} y2={CH*3} stroke={NET_SK} strokeWidth={0.8} strokeDasharray="3 2" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Default export — stem illustration (the flat net)
// ---------------------------------------------------------------------------

/**
 * NetFoldSIMOC19G2Q8Illustration — shows the flat 6-face cross net.
 * The stem; does NOT reveal the answer.
 */
export default function NetFoldSIMOC19G2Q8Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Jaring-jaring (net) berbentuk salib dengan 6 sisi persegi panjang: empat sisi lebar (biru muda) dan dua sisi persegi kecil (biru) di kiri dan kanan baris tengah."
    >
      <NetSVG width={240} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Named export — choice renderer for A / B / C / D
// ---------------------------------------------------------------------------

/**
 * NetFoldSIMOC19G2Q8Option — renders one answer choice (A–D) as an isometric
 * rectangular prism. Registered in CHOICE_RENDERERS for SIMOC-19-G2-Q8.
 */
export function NetFoldSIMOC19G2Q8Option({ choice }: { choice: WmiChoice }) {
  const def = BOX_DEFS[choice.label]
  if (!def) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={def.ariaId}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <IsoBox W={def.W} D={def.D} H={def.H} S={12} width={80} />
    </span>
  )
}

// ---------------------------------------------------------------------------
// NetGroup — the 6 faces + fold lines as bare SVG group (no wrapping <svg>).
// Use inside a parent <svg viewBox="0 0 120 80"> for embedding.
// ---------------------------------------------------------------------------

export function NetGroup({ highlights }: { highlights?: Array<{ x: number; y: number; w: number; h: number; color: string }> }) {
  return (
    <g>
      {NET_FACES.map((f, i) => (
        <rect key={i} x={f.x} y={f.y} width={f.w} height={f.h} fill={f.fill} stroke={NET_SK} strokeWidth={1.5} />
      ))}
      <line x1={CD} y1={CH}   x2={CD+CW} y2={CH}   stroke={NET_SK} strokeWidth={0.8} strokeDasharray="3 2" />
      <line x1={CD} y1={CH*2} x2={CD+CW} y2={CH*2} stroke={NET_SK} strokeWidth={0.8} strokeDasharray="3 2" />
      <line x1={CD} y1={CH*3} x2={CD+CW} y2={CH*3} stroke={NET_SK} strokeWidth={0.8} strokeDasharray="3 2" />
      {highlights?.map((hl, i) => (
        <rect key={`hl-${i}`} x={hl.x} y={hl.y} width={hl.w} height={hl.h} fill={hl.color} />
      ))}
    </g>
  )
}

// Re-export constants for the explainer coordinate system.
export { NET_VB_W, NET_VB_H, IsoBox }
