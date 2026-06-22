// IKMC-21-EC-Q11 — "18 cubes are coloured white or grey or black and are arranged
// as shown. The figures show the white and the black parts. Which of the following
// is the grey part?"  Answer: E.
//
// STEM: A 3×3×2 = 18-cube rectangular solid viewed in standard isometric projection
// (x = right, y = depth/back, z = height). Cubes are coloured:
//
//   WHITE (4)  — front-left 2×2 on the top layer (z=1):
//                (0,0,1), (1,0,1), (0,1,1), (1,1,1)
//
//   BLACK (5)  — right column + back row at z=0:
//                (2,0,0), (2,1,0), (2,2,0), (0,2,0), (1,2,0)
//
//   GREY  (9)  — everything else:
//                z=0: (0,0,0), (1,0,0), (0,1,0), (1,1,0)  — front-left 2×2
//                z=1: (2,0,1), (2,1,1), (2,2,1), (0,2,1), (1,2,1)  — right col + back row
//
// The stem illustration shows ALL 18 cubes in their correct colours so the student
// can identify the white and black regions (the reference insets are drawn separately
// in the OCR paper; here we colour the full solid directly).
//
// Co-exports:
//   Cubes11ECOption — renders ONE A–E grey candidate for CHOICE_RENDERERS.
//
// Reuses the isometric voxel projection from CubeShapes14Illustration / Bricks2ECIllustration.
// Pure SVG. No random. No dates. SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Isometric primitive (same projection as CubeStack19P1 / CubeShapes14)
// ---------------------------------------------------------------------------

const INK = '#1F2937'
const SIZE = 22       // cube edge in px
const CX = SIZE * 0.866  // horizontal iso run
const CY = SIZE * 0.5    // vertical iso run

// Colour palettes — top / left-slope / right-slope
const WHITE_TOP   = '#F0F4F8'
const WHITE_LEFT  = '#CBD5E0'
const WHITE_RIGHT = '#A0AEC0'

const BLACK_TOP   = '#4A5568'
const BLACK_LEFT  = '#2D3748'
const BLACK_RIGHT = '#1A202C'

const GREY_TOP   = '#C0C8D0'
const GREY_LEFT  = '#8896A4'
const GREY_RIGHT = '#647080'

export type Voxel = [number, number, number]

function project([x, y, z]: Voxel): { sx: number; sy: number } {
  return { sx: (x + y) * CX, sy: (x - y) * CY - z * SIZE }
}

function paintOrder(voxels: Voxel[]): Voxel[] {
  return [...voxels].sort((a, b) => b[1] - a[1] || a[2] - b[2] || a[0] - b[0])
}

// ---------------------------------------------------------------------------
// Cube colour classification for the 3×3×2 stem
// ---------------------------------------------------------------------------

const WHITE_SET = new Set(['0,0,1', '1,0,1', '0,1,1', '1,1,1'])
const BLACK_SET = new Set(['2,0,0', '2,1,0', '2,2,0', '0,2,0', '1,2,0'])

function cubeColor(x: number, y: number, z: number): 'white' | 'black' | 'grey' {
  const k = `${x},${y},${z}`
  if (WHITE_SET.has(k)) return 'white'
  if (BLACK_SET.has(k)) return 'black'
  return 'grey'
}

// ---------------------------------------------------------------------------
// Single isometric cube — fills from colour palette
// ---------------------------------------------------------------------------

interface CubeProps {
  v: Voxel
  topFill: string
  leftFill: string
  rightFill: string
  opacity?: number
}

function IsoCube({ v, topFill, leftFill, rightFill, opacity = 1 }: CubeProps) {
  const { sx, sy } = project(v)
  const topPts   = `${sx},${sy} ${sx+CX},${sy-CY} ${sx+2*CX},${sy} ${sx+CX},${sy+CY}`
  const leftPts  = `${sx},${sy} ${sx+CX},${sy+CY} ${sx+CX},${sy+CY+SIZE} ${sx},${sy+SIZE}`
  const rightPts = `${sx+CX},${sy+CY} ${sx+2*CX},${sy} ${sx+2*CX},${sy+SIZE} ${sx+CX},${sy+CY+SIZE}`
  return (
    <g opacity={opacity}>
      <polygon points={topPts}   fill={topFill}   stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
      <polygon points={leftPts}  fill={leftFill}  stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
      <polygon points={rightPts} fill={rightFill} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Full 18-cube stem with tri-colour faces
// ---------------------------------------------------------------------------

function buildStemVoxels(): Voxel[] {
  const out: Voxel[] = []
  for (let x = 0; x < 3; x++)
    for (let y = 0; y < 3; y++)
      for (let z = 0; z < 2; z++)
        out.push([x, y, z])
  return out
}

const STEM_VOXELS: Voxel[] = buildStemVoxels()

function voxelBounds(voxels: Voxel[], pad = 8): { vbX: number; vbY: number; vbW: number; vbH: number } {
  const pts = voxels.flatMap(v => {
    const { sx, sy } = project(v)
    return [sx, sx + 2 * CX, sy - CY, sy + CY + SIZE]
  })
  const minX = Math.min(...pts.filter((_, i) => i % 4 === 0)) - pad
  const maxX = Math.max(...pts.filter((_, i) => i % 4 === 1)) + pad
  const minY = Math.min(...pts.filter((_, i) => i % 4 === 2)) - pad
  const maxY = Math.max(...pts.filter((_, i) => i % 4 === 3)) + pad
  return { vbX: minX, vbY: minY, vbW: maxX - minX, vbH: maxY - minY }
}

function StemSVG() {
  const { vbX, vbY, vbW, vbH } = voxelBounds(STEM_VOXELS, 10)
  return (
    <svg
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      width="100%"
      style={{ maxWidth: 260, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {paintOrder(STEM_VOXELS).map((v, i) => {
        const col = cubeColor(v[0], v[1], v[2])
        const top   = col === 'white' ? WHITE_TOP   : col === 'black' ? BLACK_TOP   : GREY_TOP
        const left  = col === 'white' ? WHITE_LEFT  : col === 'black' ? BLACK_LEFT  : GREY_LEFT
        const right = col === 'white' ? WHITE_RIGHT : col === 'black' ? BLACK_RIGHT : GREY_RIGHT
        return <IsoCube key={i} v={v} topFill={top} leftFill={left} rightFill={right} />
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Reference insets — white part and black part side by side
// (mirrors the small sub-figures shown in the OCR paper to the right of the stem)
// ---------------------------------------------------------------------------

const WHITE_VOXELS: Voxel[] = [[0,0,1], [1,0,1], [0,1,1], [1,1,1]]
const BLACK_VOXELS: Voxel[] = [[2,0,0], [2,1,0], [2,2,0], [0,2,0], [1,2,0]]

function PartGroup({ voxels, topFill, leftFill, rightFill, label }: {
  voxels: Voxel[]
  topFill: string
  leftFill: string
  rightFill: string
  label: string
}) {
  const { vbX, vbY, vbW, vbH } = voxelBounds(voxels, 6)
  const aspect = vbH / vbW
  const w = 90
  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        width={w}
        height={Math.round(w * aspect)}
        aria-hidden="true"
      >
        {paintOrder(voxels).map((v, i) => (
          <IsoCube key={i} v={v} topFill={topFill} leftFill={leftFill} rightFill={rightFill} />
        ))}
      </svg>
      <span className="font-display text-xs font-bold" style={{ color: '#374151' }}>{label}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stem illustration (default export)
// ---------------------------------------------------------------------------

export default function Cubes11ECIllustration() {
  return (
    <div
      className="my-4 flex flex-col items-center gap-4"
      role="img"
      aria-label={
        'An 18-cube 3×3×2 solid shown in isometric view. ' +
        'The white cubes occupy the front-left 2×2 area of the top layer. ' +
        'The black cubes occupy the right column and back row of the bottom layer. ' +
        'The remaining 9 grey cubes form the grey part to identify.'
      }
    >
      {/* Main 3×3×2 solid */}
      <div className="w-full overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
        <StemSVG />
      </div>

      {/* Reference: white + black sub-figures */}
      <div className="flex items-center justify-center gap-6" aria-hidden="true">
        <PartGroup
          voxels={WHITE_VOXELS}
          topFill={WHITE_TOP} leftFill={WHITE_LEFT} rightFill={WHITE_RIGHT}
          label="White / Putih"
        />
        <PartGroup
          voxels={BLACK_VOXELS}
          topFill={BLACK_TOP} leftFill={BLACK_LEFT} rightFill={BLACK_RIGHT}
          label="Black / Hitam"
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Grey candidate voxel sets for A–E options
// ---------------------------------------------------------------------------
// The grey cubes (9 in total from the 3×3×2 stem) are:
//   z=0: (0,0,0), (1,0,0), (0,1,0), (1,1,0)  — front-left 2×2
//   z=1: (2,0,1), (2,1,1), (2,2,1), (0,2,1), (1,2,1)  — right col + back row
//
// The distractors show different 9-cube arrangements that look plausible but
// don't match the actual grey positions in the stem.
// ---------------------------------------------------------------------------

// Correct grey (E): the true grey cube positions
const OPT_E: Voxel[] = [
  [0,0,0], [1,0,0], [0,1,0], [1,1,0],          // z=0 front-left 2×2
  [2,0,1], [2,1,1], [2,2,1], [0,2,1], [1,2,1], // z=1 right-col + back row
]

// Wrong option A: grey occupies the back 3×3×1 slab of z=0 + right column at z=1
const OPT_A: Voxel[] = [
  [0,2,0], [1,2,0], [2,2,0], [0,1,0], [2,1,0], // z=0 back row + right mid
  [2,0,0],                                        // z=0 right-front corner
  [2,0,1], [2,1,1], [2,2,1],                     // z=1 right column
]

// Wrong option B: a 3×3×1 flat slab at z=0 (all of bottom layer grey) — not 9 cubes total
// simplified to 9: full bottom z=0 except back-right corner
const OPT_B: Voxel[] = [
  [0,0,0], [1,0,0], [2,0,0],
  [0,1,0], [1,1,0], [2,1,0],
  [0,2,0], [1,2,0], [2,2,0],
]

// Wrong option C: right column + back column both layers — staircase
const OPT_C: Voxel[] = [
  [0,2,0], [1,2,0], [2,2,0], [2,1,0], [2,0,0],
  [0,2,1], [1,2,1], [2,2,1], [2,1,1],
]

// Wrong option D: front 3×1×2 + left 2 cols z=1 — different shape
const OPT_D: Voxel[] = [
  [0,0,0], [1,0,0], [2,0,0],
  [0,0,1], [1,0,1],
  [0,1,0], [0,1,1], [1,1,0], [1,1,1],
]

const OPTION_VOXELS: Record<string, Voxel[]> = {
  A: OPT_A,
  B: OPT_B,
  C: OPT_C,
  D: OPT_D,
  E: OPT_E,
}

const OPTION_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Option A: 9 grey cubes in a right-back arrangement with a gap.',
    id: 'Pilihan A: 9 kubus abu-abu di posisi kanan-belakang dengan celah.',
  },
  B: {
    en: 'Option B: 9 grey cubes forming a flat 3×3 slab at the bottom layer.',
    id: 'Pilihan B: 9 kubus abu-abu membentuk lempengan 3×3 di lapisan bawah.',
  },
  C: {
    en: 'Option C: 9 grey cubes along the right column and back row, both layers.',
    id: 'Pilihan C: 9 kubus abu-abu di kolom kanan dan baris belakang, dua lapisan.',
  },
  D: {
    en: 'Option D: 9 grey cubes in a front-row and left-column arrangement.',
    id: 'Pilihan D: 9 kubus abu-abu di baris depan dan kolom kiri.',
  },
  E: {
    en: 'Option E: 9 grey cubes — front-left 2×2 at the bottom, right column and back row at the top. The correct grey part.',
    id: 'Pilihan E: 9 kubus abu-abu — 2×2 depan-kiri di bawah, kolom kanan dan baris belakang di atas. Bagian abu-abu yang benar.',
  },
}

// ---------------------------------------------------------------------------
// Option renderer for CHOICE_RENDERERS
// ---------------------------------------------------------------------------

function OptionGroup({ voxels, width = 88 }: { voxels: Voxel[]; width?: number }) {
  const { vbX, vbY, vbW, vbH } = voxelBounds(voxels, 5)
  const aspect = vbH / vbW
  return (
    <svg
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      width={width}
      height={Math.round(width * aspect)}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {paintOrder(voxels).map((v, i) => (
        <IsoCube key={i} v={v} topFill={GREY_TOP} leftFill={GREY_LEFT} rightFill={GREY_RIGHT} />
      ))}
    </svg>
  )
}

/**
 * Cubes11ECOption — renders one A/B/C/D/E grey-candidate figure.
 * Registered in CHOICE_RENDERERS for IKMC-21-EC-Q11.
 */
export function Cubes11ECOption({ choice }: { choice: WmiChoice }) {
  const k = choice.label
  const voxels = OPTION_VOXELS[k]
  const aria = OPTION_ARIA[k]
  if (!voxels) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <OptionGroup voxels={voxels} width={80} />
    </span>
  )
}
