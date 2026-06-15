// WMI-23P1A-Q18 (2023 Grade 1 Semifinal) — "How many MORE small blocks are needed
// to turn the solid on the LEFT into the solid on the RIGHT?"  Answer D = 5.
//
// Reconstructed from db/seed/wmi/figures/2023-semifinal-g1-a-q18.jpg (the JPG is
// NOT embedded): two isometric cube solids with a blue arrow between them. The
// left is a small stepped solid; the right is the same idea built up larger.
//
// Each solid is a stack of unit cubes given as a HEIGHT MAP over a 3-wide × 2-deep
// footprint (x = right, y = depth with y = 1 the back row, z = up). Every cube is
// fully supported (no floaters), so the totals are derivable by counting:
//   LEFT  height map → 5 cubes
//   RIGHT height map → 10 cubes
//   needed = 10 − 5 = 5  (answer D, choice "5").
//
// The static figure shows ONLY the two solids and the arrow — never a count, never
// the marked extra cubes. Revealing the counts (and the +5 difference) is the
// explainer's job, via the co-exported IsoSolid primitive (its `litCount` /
// `dimRest` props glow cubes as they are tallied).
//
// Pure render, SSR-safe, deterministic — no window/document/Math.random/Date.

const INK = '#3B3B2F'

// Isometric face palette: warm khaki cubes (matches the scan's olive-green boxes).
const TOP = '#EEF1C8'
const LEFT = '#CFD68F'
const RIGHT = '#B7C063'

// "lit" palette used by the explainer to glow cubes as they are counted.
const LIT_TOP = '#FFE08A'
const LIT_LEFT = '#F4B400'
const LIT_RIGHT = '#D97706'

export type Voxel = [number, number, number]

/* ----------------------------------------------------------------- data ---- */
// Column height maps. Key "x,y" → number of stacked cubes. y = 1 is the back row,
// y = 0 is the front row (nearest the viewer).
export const LEFT_HEIGHTS: Record<string, number> = {
  // back row (y=1): a 2-tall step on the left, a 1-tall to its right
  '0,1': 2, '1,1': 1,
  // front row (y=0): two single cubes
  '0,0': 1, '1,0': 1,
}
// total = 2 + 1 + 1 + 1 = 5

export const RIGHT_HEIGHTS: Record<string, number> = {
  // back row (y=1): a 2-tall ridge across all three columns
  '0,1': 2, '1,1': 2, '2,1': 2,
  // front row (y=0): a 2-tall step on the left, then two single cubes
  '0,0': 2, '1,0': 1, '2,0': 1,
}
// total = 2 + 2 + 2 + 2 + 1 + 1 = 10

const DEPTH = 2 // y: 0..1

/** Expand a height map into individual unit-cube voxels [x, y, z]. */
export function buildVoxels(heights: Record<string, number>): Voxel[] {
  const out: Voxel[] = []
  const cols = Math.max(...Object.keys(heights).map((k) => Number(k.split(',')[0]))) + 1
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < DEPTH; y++) {
      const h = heights[`${x},${y}`] ?? 0
      for (let z = 0; z < h; z++) out.push([x, y, z])
    }
  }
  return out
}

export const LEFT_VOXELS: Voxel[] = buildVoxels(LEFT_HEIGHTS)
export const RIGHT_VOXELS: Voxel[] = buildVoxels(RIGHT_HEIGHTS)
export const TOTAL_LEFT = LEFT_VOXELS.length // 5
export const TOTAL_RIGHT = RIGHT_VOXELS.length // 10
export const NEEDED = TOTAL_RIGHT - TOTAL_LEFT // 5

/* ------------------------------------------------------------- geometry ---- */
const SIZE = 30 // cube edge in px
const CX = SIZE * 0.86 // horizontal run of one iso unit
const CY = SIZE * 0.5 // vertical run of one iso unit

/** Project a voxel to the SVG plane (standard iso transform). */
function project([x, y, z]: Voxel): { sx: number; sy: number } {
  return { sx: (x + y) * CX, sy: (x - y) * CY - z * SIZE }
}

/** Painter's order: far cubes (back, low, left) first so near cubes overdraw them. */
function paintOrder(voxels: Voxel[]): Voxel[] {
  return [...voxels].sort((a, b) => b[1] - a[1] || a[2] - b[2] || a[0] - b[0])
}

/** One isometric unit cube. `lit` swaps in the warm palette; `dim` fades it back. */
function Cube({ v, ox, oy, lit = false, dim = false }: { v: Voxel; ox: number; oy: number; lit?: boolean; dim?: boolean }) {
  const { sx: px, sy: py } = project(v)
  const sx = px + ox
  const sy = py + oy
  const top = `${sx},${sy} ${sx + CX},${sy - CY} ${sx + 2 * CX},${sy} ${sx + CX},${sy + CY}`
  const leftF = `${sx},${sy} ${sx + CX},${sy + CY} ${sx + CX},${sy + CY + SIZE} ${sx},${sy + SIZE}`
  const rightF = `${sx + CX},${sy + CY} ${sx + 2 * CX},${sy} ${sx + 2 * CX},${sy + SIZE} ${sx + CX},${sy + CY + SIZE}`
  return (
    <g opacity={dim ? 0.3 : 1}>
      <polygon points={top} fill={lit ? LIT_TOP : TOP} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <polygon points={leftF} fill={lit ? LIT_LEFT : LEFT} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <polygon points={rightF} fill={lit ? LIT_RIGHT : RIGHT} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
    </g>
  )
}

export interface IsoSolidProps {
  /** Which solid to draw. */
  which: 'left' | 'right'
  /** How many cubes (in paint order) glow lit; the rest are normal. Default 0. */
  litCount?: number
  /** When true, cubes beyond `litCount` are dimmed (so a partial tally stands out). */
  dimRest?: boolean
  /** Max SVG width in px. */
  maxWidth?: number
}

/**
 * One isometric cube solid (left or right). At defaults it is the pristine figure:
 * the full solid, no count, no marks. The explainer passes `litCount` to glow cubes
 * one at a time while it tallies them.
 */
export function IsoSolid({ which, litCount = 0, dimRest = false, maxWidth = 200 }: IsoSolidProps) {
  const voxels = which === 'left' ? LEFT_VOXELS : RIGHT_VOXELS
  const ordered = paintOrder(voxels)

  // Tight viewBox from the projected footprint + headroom so nothing clips.
  const pts = ordered.map(project)
  const minX = Math.min(...pts.map((p) => p.sx))
  const maxX = Math.max(...pts.map((p) => p.sx)) + 2 * CX
  const minY = Math.min(...pts.map((p) => p.sy)) - CY
  const maxY = Math.max(...pts.map((p) => p.sy)) + CY + SIZE

  const pad = 16
  const ox = -minX + pad
  const oy = -minY + pad
  const vbW = maxX - minX + pad * 2
  const vbH = maxY - minY + pad * 2

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      width="100%"
      style={{ maxWidth, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {ordered.map((v, i) => (
        <Cube key={i} v={v} ox={ox} oy={oy} lit={i < litCount} dim={dimRest && i >= litCount} />
      ))}
    </svg>
  )
}

/** A simple right-pointing arrow, matching the scan's blue arrow between the solids. */
export function RightArrow({ size = 56 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 60" width={size} aria-hidden="true" style={{ display: 'block' }}>
      <polygon points="4,22 60,22 60,8 96,30 60,52 60,38 4,38" fill="#2BB3E6" stroke="#1796C7" strokeWidth={2} strokeLinejoin="round" />
    </svg>
  )
}

export default function P23G1Q18Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Dua bangun ruang dari kubus kecil dengan tanda panah biru di antaranya. Bangun kiri lebih kecil, bangun kanan lebih besar. Pertanyaannya: berapa kubus lagi yang diperlukan agar bangun kiri menjadi bangun kanan?"
    >
      <div className="flex items-center justify-center gap-1">
        <IsoSolid which="left" maxWidth={180} />
        <RightArrow />
        <IsoSolid which="right" maxWidth={210} />
      </div>
    </div>
  )
}
