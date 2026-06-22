// IKMC-22-EC-Q8 — "John builds the tower shown. What will he see if he looks at his
// tower from above?"  Answer C.
//
// Reconstructed from docs/reference/ocr-res/ikmc/contest/ecolier/2022.imgs/016.jpg.
// The tower has four layers stacked along the y-axis (vertical):
//   1. Base slab   — large flat rectangle (very wide, very thin)
//   2. Medium slab — narrower flat rectangle centred on the base
//   3. Three bricks — three upright rectangular blocks side-by-side (3-wide row)
//   4. Top brick   — one tall narrow block centred on the three-brick row
//
// From directly above the footprint is three concentric rectangles:
//   outer  = base slab
//   middle = medium slab
//   inner  = the single top brick (the three-brick row has the same width as the medium
//            slab so it's invisible from above; only the topmost object stands out)
//
// This matches option C exactly.
//
// Co-exports:
//   BlockTower8ECOption   — renders ONE A–E top-view choice (for CHOICE_RENDERERS)
//
// Pure SVG, no random, no dates, SSR-safe.
// Isometric primitive reused from CubeStack19P1Illustration (same projection constants).

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

const INK = '#1F2937'

// Slab / brick colours — warm terracotta to match source paper's colour scheme
const SLAB_TOP   = '#E8B89A'   // terracotta top face
const SLAB_LEFT  = '#C8895E'   // terracotta left face
const SLAB_RIGHT = '#A5622A'   // terracotta right face

// ---------------------------------------------------------------------------
// Isometric projection
// ---------------------------------------------------------------------------

// We define our tower using a voxel-like coordinate system, but for slabs
// (non-unit-cube boxes) we work directly in SVG coordinates using an isometric
// projection where one "unit" = SIZE px.
//
// Projection: iso(x, y, z) →
//   sx = (x - y) * CX
//   sy = -(x + y) * CY - z * SZ
//
// Here x = right, y = depth (into screen), z = up.
// CX = horizontal run per unit, CY = vertical run per unit, SZ = height per unit.

const CX = 18   // half-width of one iso unit (horizontal)
const CY = 10   // half-height of one iso unit (depth axis, vertical component)
const SZ = 20   // vertical rise per height unit

interface Pt { x: number; y: number }

function iso(px: number, py: number, pz: number): Pt {
  return {
    x: (px - py) * CX,
    y: -(px + py) * CY - pz * SZ,
  }
}

function pts(...coords: Pt[]): string {
  return coords.map((p) => `${p.x},${p.y}`).join(' ')
}

// ---------------------------------------------------------------------------
// IsoBrick — draws one isometric rectangular box
// (wx, wy, wz) = dimensions in isometric units along x, y, z
// (ox, oy, oz) = origin corner (front-left-bottom)
// ---------------------------------------------------------------------------

interface BrickProps {
  ox: number; oy: number; oz: number
  wx: number; wy: number; wz: number
  topFill?: string; leftFill?: string; rightFill?: string
  strokeW?: number
}

function IsoBrick({
  ox, oy, oz, wx, wy, wz,
  topFill   = SLAB_TOP,
  leftFill  = SLAB_LEFT,
  rightFill = SLAB_RIGHT,
  strokeW   = 1.4,
}: BrickProps) {
  // Eight corners of the box
  const p000 = iso(ox,       oy,       oz)
  const p100 = iso(ox + wx,  oy,       oz)
  const p010 = iso(ox,       oy + wy,  oz)
  const p110 = iso(ox + wx,  oy + wy,  oz)
  const p001 = iso(ox,       oy,       oz + wz)
  const p101 = iso(ox + wx,  oy,       oz + wz)
  const p011 = iso(ox,       oy + wy,  oz + wz)
  const p111 = iso(ox + wx,  oy + wy,  oz + wz)

  const common = { stroke: INK, strokeWidth: strokeW, strokeLinejoin: 'round' as const }

  return (
    <g>
      {/* Top face */}
      <polygon points={pts(p001, p101, p111, p011)} fill={topFill}   {...common} />
      {/* Left face (viewer's left) */}
      <polygon points={pts(p011, p111, p110, p010)} fill={leftFill}  {...common} />
      {/* Right face (viewer's right) */}
      <polygon points={pts(p101, p111, p110, p100)} fill={rightFill} {...common} />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Tower geometry — four layers
// Origin: front-left corner of the base slab sits at iso(0,0,0)
//
// Layer 1 — base slab:  8 units wide (x), 5 deep (y), 1 tall (z), at z=0
// Layer 2 — med slab:   6 units wide, 4 deep, 1 tall,  at z=1, centred → ox=1, oy=0.5
// Layer 3 — 3 bricks:   3 × (1 wide, 3 deep, 2 tall), side by side, at z=2, centred
//                        each brick: wx=1.5, wy=3, wz=2; 3 bricks total wx=4.5
//                        centred in 6-wide slab → ox=0.75 each brick spaced 1.5 apart
// Layer 4 — top brick:  1.5 wide, 1.5 deep, 3 tall, centred, at z=4
// ---------------------------------------------------------------------------

// Layer dims
const L1 = { wx: 8, wy: 5, wz: 0.6, ox: 0, oy: 0, oz: 0 }
const L2 = { wx: 6, wy: 4, wz: 0.6, ox: 1, oy: 0.5, oz: L1.wz }
const L3_OZ = L2.oz + L2.wz
const BRICK_W = 1.4, BRICK_Y = 3.0, BRICK_Z = 1.8
const L3_OX = (L2.wx - BRICK_W * 3) / 2 + L2.ox  // centre in L2
const L3_OY = (L2.wy - BRICK_Y) / 2 + L2.oy
const L4 = { wx: 1.4, wy: 1.4, wz: 2.8, ox: 0, oy: 0, oz: 0 }
// Centre top brick on 3-brick row
const L4_OX = L3_OX + (BRICK_W * 3 - L4.wx) / 2
const L4_OY = L3_OY + (BRICK_Y - L4.wy) / 2
const L4_OZ = L3_OZ + BRICK_Z

// ---------------------------------------------------------------------------
// IsoTower — the full tower primitive (reused by explainer)
// ---------------------------------------------------------------------------

export interface IsoTowerProps {
  /** Which layer to highlight: 0=base, 1=med slab, 2=3-bricks, 3=top; undefined = all normal */
  highlightLayer?: number
}

export function IsoTower({ highlightLayer }: IsoTowerProps) {
  function fill(layer: number, face: 'top' | 'left' | 'right') {
    const hl = highlightLayer === layer
    if (hl) {
      return face === 'top' ? '#FFD23F' : face === 'left' ? '#F4B400' : '#D97706'
    }
    return face === 'top' ? SLAB_TOP : face === 'left' ? SLAB_LEFT : SLAB_RIGHT
  }

  // --- compute bounding box of all rendered points ---
  const allPts: Pt[] = []
  function addBoxPts(ox: number, oy: number, oz: number, wx: number, wy: number, wz: number) {
    for (let xi = 0; xi <= 1; xi++)
      for (let yi = 0; yi <= 1; yi++)
        for (let zi = 0; zi <= 1; zi++)
          allPts.push(iso(ox + xi * wx, oy + yi * wy, oz + zi * wz))
  }
  addBoxPts(L1.ox, L1.oy, L1.oz, L1.wx, L1.wy, L1.wz)
  addBoxPts(L2.ox, L2.oy, L2.oz, L2.wx, L2.wy, L2.wz)
  for (let b = 0; b < 3; b++) {
    addBoxPts(L3_OX + b * BRICK_W, L3_OY, L3_OZ, BRICK_W, BRICK_Y, BRICK_Z)
  }
  addBoxPts(L4_OX, L4_OY, L4_OZ, L4.wx, L4.wy, L4.wz)

  const minX = Math.min(...allPts.map((p) => p.x))
  const maxX = Math.max(...allPts.map((p) => p.x))
  const minY = Math.min(...allPts.map((p) => p.y))
  const maxY = Math.max(...allPts.map((p) => p.y))
  const PAD = 16
  const vbX = minX - PAD, vbY = minY - PAD
  const vbW = maxX - minX + PAD * 2, vbH = maxY - minY + PAD * 2

  return (
    <svg
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Layer 1 — base slab */}
      <IsoBrick
        {...L1}
        topFill={fill(0, 'top')} leftFill={fill(0, 'left')} rightFill={fill(0, 'right')}
      />
      {/* Layer 2 — medium slab */}
      <IsoBrick
        ox={L2.ox} oy={L2.oy} oz={L2.oz} wx={L2.wx} wy={L2.wy} wz={L2.wz}
        topFill={fill(1, 'top')} leftFill={fill(1, 'left')} rightFill={fill(1, 'right')}
      />
      {/* Layer 3 — three bricks, right to left in painter's order (higher y first) */}
      {[2, 1, 0].map((b) => (
        <IsoBrick
          key={b}
          ox={L3_OX + b * BRICK_W} oy={L3_OY} oz={L3_OZ}
          wx={BRICK_W} wy={BRICK_Y} wz={BRICK_Z}
          topFill={fill(2, 'top')} leftFill={fill(2, 'left')} rightFill={fill(2, 'right')}
        />
      ))}
      {/* Layer 4 — top brick */}
      <IsoBrick
        ox={L4_OX} oy={L4_OY} oz={L4_OZ} wx={L4.wx} wy={L4.wy} wz={L4.wz}
        topFill={fill(3, 'top')} leftFill={fill(3, 'left')} rightFill={fill(3, 'right')}
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Top-view option data
// Each choice A–E is rendered as concentric filled rectangles (top view).
// The source images show nested squares where:
//   A — 4 nested squares (very deep nesting, 4 distinct outlines)
//   B — outer + 2 nested (small centre)
//   C — outer + 1 mid inner + tiny centre  ← CORRECT (matches the tower's footprint)
//   D — 2 nested squares only
//   E — outer + tiny centre only (no mid layer)
// ---------------------------------------------------------------------------

// Each "ring" in the top-view is represented as a filled rect.
// We'll draw them outer→inner so each inner rect overdraws the outer.

interface Ring {
  // normalised fractions of a 100×100 canvas:
  x: number; y: number; w: number; h: number; fill: string; stroke: boolean
}

// Colours (warm terracotta fill for visible top surfaces, white for the
// "cut-out" interior so nested rings read clearly)
const FACE_C   = '#E8B89A'  // terracotta (visible ring face)
const FACE_INK = INK

function buildRings(choice: string): Ring[] {
  // The options show 100×100 px grids of nested squares.
  // The border of the outermost square is always present.
  // Inner squares are positioned symmetrically.

  switch (choice) {
    case 'A': // 4 concentric squares
      return [
        { x:  0, y:  0, w: 100, h: 100, fill: FACE_C,  stroke: true  },
        { x: 12, y: 12, w:  76, h:  76, fill: '#fff',  stroke: false },
        { x: 12, y: 12, w:  76, h:  76, fill: FACE_C,  stroke: true  },
        { x: 24, y: 24, w:  52, h:  52, fill: '#fff',  stroke: false },
        { x: 24, y: 24, w:  52, h:  52, fill: FACE_C,  stroke: true  },
        { x: 36, y: 36, w:  28, h:  28, fill: '#fff',  stroke: false },
        { x: 36, y: 36, w:  28, h:  28, fill: FACE_C,  stroke: true  },
        { x: 44, y: 44, w:  12, h:  12, fill: '#fff',  stroke: false },
        { x: 44, y: 44, w:  12, h:  12, fill: FACE_C,  stroke: true  },
      ]
    case 'B': // outer + small centre square (only 2 rings + tiny inner)
      return [
        { x:  0, y:  0, w: 100, h: 100, fill: FACE_C,  stroke: true  },
        { x: 28, y: 28, w:  44, h:  44, fill: '#fff',  stroke: false },
        { x: 28, y: 28, w:  44, h:  44, fill: FACE_C,  stroke: true  },
        { x: 40, y: 40, w:  20, h:  20, fill: '#fff',  stroke: false },
        { x: 40, y: 40, w:  20, h:  20, fill: FACE_C,  stroke: true  },
        { x: 46, y: 46, w:   8, h:   8, fill: '#fff',  stroke: false },
        { x: 46, y: 46, w:   8, h:   8, fill: FACE_C,  stroke: true  },
      ]
    case 'C': // outer + one medium inner + tiny centre  ← CORRECT
      return [
        { x:  0, y:  0, w: 100, h: 100, fill: FACE_C,  stroke: true  },
        { x: 16, y: 16, w:  68, h:  68, fill: '#fff',  stroke: false },
        { x: 16, y: 16, w:  68, h:  68, fill: FACE_C,  stroke: true  },
        { x: 40, y: 40, w:  20, h:  20, fill: '#fff',  stroke: false },
        { x: 40, y: 40, w:  20, h:  20, fill: FACE_C,  stroke: true  },
        { x: 46, y: 46, w:   8, h:   8, fill: '#fff',  stroke: false },
        { x: 46, y: 46, w:   8, h:   8, fill: FACE_C,  stroke: true  },
      ]
    case 'D': // 2 nested squares only
      return [
        { x:  0, y:  0, w: 100, h: 100, fill: FACE_C,  stroke: true  },
        { x: 18, y: 18, w:  64, h:  64, fill: '#fff',  stroke: false },
        { x: 18, y: 18, w:  64, h:  64, fill: FACE_C,  stroke: true  },
      ]
    case 'E': // outer + tiny centre only (no middle ring)
      return [
        { x:  0, y:  0, w: 100, h: 100, fill: FACE_C,  stroke: true  },
        { x: 44, y: 44, w:  12, h:  12, fill: '#fff',  stroke: false },
        { x: 44, y: 44, w:  12, h:  12, fill: FACE_C,  stroke: true  },
      ]
    default:
      return []
  }
}

const OPTION_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en:  'Option A: four concentric nested squares, four visible outlines.',
    id:  'Pilihan A: empat persegi konsentris bertingkat, empat garis tepi terlihat.',
  },
  B: {
    en:  'Option B: outer square with two inner squares — medium ring and tiny centre.',
    id:  'Pilihan B: persegi luar dengan dua persegi dalam — cincin sedang dan tengah kecil.',
  },
  C: {
    en:  'Option C: outer square, one medium inner square, and a tiny centre square — three rings total.',
    id:  'Pilihan C: persegi luar, satu persegi dalam sedang, dan persegi tengah kecil — tiga cincin total.',
  },
  D: {
    en:  'Option D: two concentric squares only.',
    id:  'Pilihan D: hanya dua persegi konsentris.',
  },
  E: {
    en:  'Option E: outer square with only a tiny centre square — no middle ring.',
    id:  'Pilihan E: persegi luar dengan hanya persegi tengah kecil — tanpa cincin tengah.',
  },
}

// Render one top-view option as nested concentric squares.
function TopViewSVG({ choice, size = 80 }: { choice: string; size?: number }) {
  const rings = buildRings(choice)
  return (
    <svg
      viewBox="-2 -2 104 104"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {rings.map((r, i) => (
        <rect
          key={i}
          x={r.x} y={r.y} width={r.w} height={r.h}
          fill={r.fill}
          stroke={r.stroke ? FACE_INK : 'none'}
          strokeWidth={r.stroke ? 1.5 : 0}
        />
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// BlockTower8ECOption — per-choice renderer (for CHOICE_RENDERERS)
// ---------------------------------------------------------------------------

/**
 * Renders ONE A–E top-view picture choice.
 * Used as the CHOICE_RENDERERS entry for IKMC-22-EC-Q8.
 */
export function BlockTower8ECOption({ choice }: { choice: WmiChoice }) {
  const aria = OPTION_ARIA[choice.label]
  if (!buildRings(choice.label).length) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <TopViewSVG choice={choice.label} size={76} />
    </span>
  )
}

// ---------------------------------------------------------------------------
// BlockTower8ECIllustration — stem (the 3-D tower)
// ---------------------------------------------------------------------------

export default function BlockTower8ECIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'A 3-D block tower made of four layers: a large flat base slab, a medium slab on top, ' +
        'three upright bricks side by side on the medium slab, and one tall narrow brick at the centre ' +
        'on top of the three bricks. The question asks for the top-down view of this tower.'
      }
    >
      <IsoTower />
    </div>
  )
}
