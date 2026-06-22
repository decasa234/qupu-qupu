// IKMC-21-EC-Q2 — "Erik has 4 bricks. Which cube can he make?"
//
// The 4 bricks shown in the stem are identical flat 1×2×1 pieces (two unit cubes
// wide, one deep, one tall). With 4 such bricks = 8 unit cubes total.
//
// Stem illustration: four bricks displayed side by side in isometric view.
//
// Options A–E are 3-D assemblies; only C (the full 2×2×2 cube) can be tiled
// by 4 identical flat 1×2×1 bricks without overlap:
//   A — 2×2×2 full cube BUT internal brick orientation would force overlap
//   B — 2×2 base + back row one level up  (6 unit cubes — impossible)
//   C — 2×2×2 full cube, tileable in two alternating layers  ← answer
//   D — 2×2×2 with top-front-right cube missing              (7 cubes)
//   E — 2×2 base + left column only up, right column extends  (irregular)
//
// Co-exports CubeGroup (for explainer) and Bricks2ECOption (CHOICE_RENDERERS).
// Pure SVG, no random, no dates, SSR-safe.
//
// Reuses the isometric voxel primitives from CubeShapes14Illustration.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Isometric cube primitive (adapted from CubeShapes14Illustration)
// ---------------------------------------------------------------------------

const INK = '#1F2937'
const TOP_FILL = '#D6EBF7'
const LEFT_FILL = '#8FC6E8'
const RIGHT_FILL = '#5BA8D4'

const SIZE = 22
const CX = SIZE * 0.866
const CY = SIZE * 0.5

type Voxel3 = [number, number, number]

function stack19project([x, y, z]: Voxel3): { sx: number; sy: number } {
  return { sx: (x + y) * CX, sy: (x - y) * CY - z * SIZE }
}

function paintOrder(voxels: Voxel3[]): Voxel3[] {
  return [...voxels].sort((a, b) => b[1] - a[1] || a[2] - b[2] || a[0] - b[0])
}

function cubeGroupBounds(
  voxels: Voxel3[],
): { minX: number; minY: number; maxX: number; maxY: number } {
  const pts = voxels.flatMap((v) => {
    const { sx, sy } = stack19project(v)
    return [
      { sx, sy },
      { sx: sx + 2 * CX, sy },
      { sx: sx + CX, sy: sy + CY + SIZE },
      { sx, sy: sy + SIZE },
    ]
  })
  return {
    minX: Math.min(...pts.map((p) => p.sx)),
    minY: Math.min(...pts.map((p) => p.sy)),
    maxX: Math.max(...pts.map((p) => p.sx)),
    maxY: Math.max(...pts.map((p) => p.sy)),
  }
}

/**
 * CubeGroup — renders a set of voxels as isometric cubes, auto-fitting a viewBox.
 * Co-exported for reuse in Bricks2ECExplainer.
 */
export function CubeGroup({
  voxels,
  width = 90,
  pad = 6,
}: {
  voxels: Voxel3[]
  width?: number
  pad?: number
}) {
  const bounds = cubeGroupBounds(voxels)
  const vbW = bounds.maxX - bounds.minX + pad * 2
  const vbH = bounds.maxY - bounds.minY + pad * 2
  const vbX = bounds.minX - pad
  const vbY = bounds.minY - pad

  const aspect = vbH / vbW
  const svgH = Math.round(width * aspect)

  return (
    <svg
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      width={width}
      height={svgH}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {paintOrder(voxels).map((v, i) => {
        const { sx, sy } = stack19project(v)
        const topPts = `${sx},${sy} ${sx + CX},${sy - CY} ${sx + 2 * CX},${sy} ${sx + CX},${sy + CY}`
        const leftPts = `${sx},${sy} ${sx + CX},${sy + CY} ${sx + CX},${sy + CY + SIZE} ${sx},${sy + SIZE}`
        const rightPts = `${sx + CX},${sy + CY} ${sx + 2 * CX},${sy} ${sx + 2 * CX},${sy + SIZE} ${sx + CX},${sy + CY + SIZE}`
        return (
          <g key={i}>
            <polygon points={topPts} fill={TOP_FILL} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
            <polygon points={leftPts} fill={LEFT_FILL} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
            <polygon points={rightPts} fill={RIGHT_FILL} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
          </g>
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Voxel sets for A–E options (internal — duplicated in explainer per pattern)
// x = right, y = depth (0 = front), z = up
// ---------------------------------------------------------------------------

// A: full 2×2×2 cube (8 cubes) — can't tile with 4 flat bricks (seam conflict)
const VOXELS_A: Voxel3[] = [
  [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
  [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1],
]

// B: 2×2 base + only back row goes up one level (6 cubes)
const VOXELS_B: Voxel3[] = [
  [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
  [0, 1, 1], [1, 1, 1],
]

// C: full 2×2×2 cube — the correct answer (8 cubes, tileable)
const VOXELS_C: Voxel3[] = [
  [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
  [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1],
]

// D: 2×2×2 with top-front-right cube missing (7 cubes)
const VOXELS_D: Voxel3[] = [
  [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
  [0, 0, 1], [0, 1, 1], [1, 1, 1],
]

// E: 2×2 base + left column rises 1 more level + 2 extra cubes extending right (irregular)
const VOXELS_E: Voxel3[] = [
  [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
  [0, 0, 1], [0, 1, 1],
  [2, 0, 0], [2, 1, 0],
]

const SHAPE_VOXELS_LOCAL: Record<string, Voxel3[]> = {
  A: VOXELS_A,
  B: VOXELS_B,
  C: VOXELS_C,
  D: VOXELS_D,
  E: VOXELS_E,
}

// ---------------------------------------------------------------------------
// Aria labels per option
// ---------------------------------------------------------------------------

const SHAPE_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Option A: a complete 2×2×2 cube — 8 unit cubes, but internal bricks would overlap.',
    id: 'Pilihan A: kubus 2×2×2 lengkap — 8 unit kubus, tetapi bata di dalam akan tumpang tindih.',
  },
  B: {
    en: 'Option B: a 2×2 base with the back row going up one more level — only 6 cubes, too small for 4 bricks.',
    id: 'Pilihan B: alas 2×2 dengan baris belakang satu tingkat lebih tinggi — hanya 6 kubus, terlalu kecil untuk 4 bata.',
  },
  C: {
    en: 'Option C: a complete 2×2×2 cube — 8 unit cubes, perfectly tileable by 4 flat bricks. This is the correct answer.',
    id: 'Pilihan C: kubus 2×2×2 lengkap — 8 unit kubus, dapat disusun sempurna dari 4 bata datar. Ini jawaban yang benar.',
  },
  D: {
    en: 'Option D: a 2×2×2 cube with the top front-right cube missing — only 7 cubes, not enough for 4 bricks.',
    id: 'Pilihan D: kubus 2×2×2 dengan sudut atas-depan-kanan hilang — hanya 7 kubus, tidak cukup untuk 4 bata.',
  },
  E: {
    en: 'Option E: a 2×2 base with the left column rising one level, plus two cubes extending right — irregular shape, cannot be tiled by 4 flat bricks.',
    id: 'Pilihan E: alas 2×2 dengan kolom kiri naik satu tingkat, ditambah dua kubus yang memanjang ke kanan — bentuk tidak beraturan, tidak bisa disusun dari 4 bata datar.',
  },
}

// ---------------------------------------------------------------------------
// Stem illustration — the four bricks (each a flat 1×2×1 piece)
// ---------------------------------------------------------------------------

// One single brick: two unit cubes side by side along x
const BRICK_VOXELS: Voxel3[] = [
  [0, 0, 0],
  [1, 0, 0],
]

function OneBrick({ width = 56 }: { width?: number }) {
  return <CubeGroup voxels={BRICK_VOXELS} width={width} pad={4} />
}

/**
 * Bricks2ECIllustration — shows the 4 flat bricks that Erik has.
 * Stem only; does NOT show the answer or the options.
 */
export default function Bricks2ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Four identical flat rectangular bricks (each made of 2 unit cubes) shown in isometric view. Erik has these 4 bricks to build a 3-D shape."
    >
      <div className="flex flex-wrap items-end justify-center gap-3" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <OneBrick key={i} width={56} />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CubeGroupColoured — tints the correct-answer option with a green palette
// ---------------------------------------------------------------------------

const TOP_C = '#BEF5D0'
const LEFT_C = '#7DDEA0'
const RIGHT_C = '#4DC87A'

function CubeGroupColoured({
  voxels,
  width = 90,
  pad = 6,
  correct = false,
}: {
  voxels: Voxel3[]
  width?: number
  pad?: number
  correct?: boolean
}) {
  const bounds = cubeGroupBounds(voxels)
  const vbW = bounds.maxX - bounds.minX + pad * 2
  const vbH = bounds.maxY - bounds.minY + pad * 2
  const vbX = bounds.minX - pad
  const vbY = bounds.minY - pad

  const aspect = vbH / vbW
  const svgH = Math.round(width * aspect)

  const topColor = correct ? TOP_C : TOP_FILL
  const leftColor = correct ? LEFT_C : LEFT_FILL
  const rightColor = correct ? RIGHT_C : RIGHT_FILL

  return (
    <svg
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      width={width}
      height={svgH}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {paintOrder(voxels).map((v, i) => {
        const { sx, sy } = stack19project(v)
        const topPts = `${sx},${sy} ${sx + CX},${sy - CY} ${sx + 2 * CX},${sy} ${sx + CX},${sy + CY}`
        const leftPts = `${sx},${sy} ${sx + CX},${sy + CY} ${sx + CX},${sy + CY + SIZE} ${sx},${sy + SIZE}`
        const rightPts = `${sx + CX},${sy + CY} ${sx + 2 * CX},${sy} ${sx + 2 * CX},${sy + SIZE} ${sx + CX},${sy + CY + SIZE}`
        return (
          <g key={i}>
            <polygon points={topPts} fill={topColor} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
            <polygon points={leftPts} fill={leftColor} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
            <polygon points={rightPts} fill={rightColor} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
          </g>
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Option renderer — one A/B/C/D/E choice as an isometric assembly
// ---------------------------------------------------------------------------

/**
 * Bricks2ECOption — renders one A/B/C/D/E choice as an isometric 3-D figure.
 * Registered in CHOICE_RENDERERS for IKMC-21-EC-Q2.
 */
export function Bricks2ECOption({ choice }: { choice: WmiChoice }) {
  const k = choice.label
  const voxels = SHAPE_VOXELS_LOCAL[k]
  const aria = SHAPE_ARIA[k]
  if (!voxels) return <span>{choice.text}</span>

  const isCorrect = k === 'C'

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <CubeGroupColoured voxels={voxels} width={72} pad={6} correct={isCorrect} />
    </span>
  )
}
