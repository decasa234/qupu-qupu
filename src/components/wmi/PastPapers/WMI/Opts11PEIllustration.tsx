// IKMC-20-PE-Q11 — "Five shapes are made by glueing cubes together face to face.
//                   Which shape uses the most cubes?"  Answer: E (green, 6 cubes).
//
// The A–E choices ARE the only figures (no separate stem image).
// This file provides ONLY the option renderer (Opts11PEOption) — no stem illustration.
//
// Shapes reconstructed from OCR crops 036–040:
//   A (yellow)  — staircase of 4: descending from upper-left [0,0,2],[1,0,2] + [2,0,1] + [3,0,0]
//   B (orange)  — plus/cross of 5: center [1,1,0] + 4 arms
//   C (pink)    — S-pentomino of 5: front 3 cubes + 2 cubes behind-right
//   D (purple)  — Z-pentomino of 5: front 3 cubes + 2 cubes behind-left
//   E (green)   — L-tower of 6: base row of 4 + 2 more stacked on leftmost → most cubes
//
// Pure SVG, no random, no dates, SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Isometric cube primitive (same projection as CubeShapes14Illustration)
// ---------------------------------------------------------------------------

const INK = '#1F2937'
const SIZE = 22         // cube edge px
const CX = SIZE * 0.866 // horizontal run per iso unit
const CY = SIZE * 0.5   // vertical run per iso unit

type Voxel3 = [number, number, number]

function project([x, y, z]: Voxel3): { sx: number; sy: number } {
  return { sx: (x + y) * CX, sy: (x - y) * CY - z * SIZE }
}

function paintOrder(voxels: Voxel3[]): Voxel3[] {
  return [...voxels].sort((a, b) => b[1] - a[1] || a[2] - b[2] || a[0] - b[0])
}

// ---------------------------------------------------------------------------
// Per-shape colour palettes (top / left / right faces)
// ---------------------------------------------------------------------------

interface Palette { top: string; left: string; right: string }

const PALETTES: Record<string, Palette> = {
  A: { top: '#FFF176', left: '#FFD600', right: '#F9A825' }, // yellow
  B: { top: '#FFCC80', left: '#FF9800', right: '#E65100' }, // orange
  C: { top: '#F48FB1', left: '#E91E63', right: '#880E4F' }, // pink/red
  D: { top: '#CE93D8', left: '#9C27B0', right: '#6A1B9A' }, // purple
  E: { top: '#A5D6A7', left: '#4CAF50', right: '#2E7D32' }, // green
}

// ---------------------------------------------------------------------------
// Voxel sets for each shape
// ---------------------------------------------------------------------------

// A — staircase of 4 cubes (descending from upper-left to lower-right)
// Top level (z=2): 2 cubes at x=0,1
// Mid level (z=1): 1 cube at x=2
// Bottom (z=0):    1 cube at x=3
const VOXELS_A: Voxel3[] = [
  [0, 0, 2], [1, 0, 2],
  [2, 0, 1],
  [3, 0, 0],
]

// B — plus/cross of 5 cubes (flat, ground level)
// Center [1,1,0] + N/E/S/W arms
const VOXELS_B: Voxel3[] = [
  [1, 0, 0],              // front arm
  [0, 1, 0], [1, 1, 0], [2, 1, 0], // middle row (left, center, right)
  [1, 2, 0],              // back arm
]

// C — S-pentomino of 5 (flat, ground level)
// Front row: x=0,1,2 at y=0
// Back row: x=1,2 at y=1 (shifted right)
const VOXELS_C: Voxel3[] = [
  [0, 0, 0], [1, 0, 0], [2, 0, 0],
  [1, 1, 0], [2, 1, 0],
]

// D — Z-pentomino of 5 (flat, ground level, mirror of C)
// Front row: x=0,1,2 at y=0
// Back row: x=0,1 at y=1 (shifted left)
const VOXELS_D: Voxel3[] = [
  [0, 0, 0], [1, 0, 0], [2, 0, 0],
  [0, 1, 0], [1, 1, 0],
]

// E — L-tower of 6 cubes (MOST cubes → answer E)
// Base row of 4 at z=0: x=0,1,2,3
// Tower of 2 more stacked on left (x=0): z=1,2
const VOXELS_E: Voxel3[] = [
  [0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0], // base row
  [0, 0, 1],                                    // 2nd level of tower
  [0, 0, 2],                                    // 3rd level of tower (top)
]

const SHAPE_VOXELS: Record<string, Voxel3[]> = {
  A: VOXELS_A,
  B: VOXELS_B,
  C: VOXELS_C,
  D: VOXELS_D,
  E: VOXELS_E,
}

const CUBE_COUNTS: Record<string, number> = { A: 4, B: 5, C: 5, D: 5, E: 6 }

// ---------------------------------------------------------------------------
// CubeGroupColored — renders a voxel set with a per-shape colour palette
// ---------------------------------------------------------------------------

interface CubeGroupColoredProps {
  voxels: Voxel3[]
  palette: Palette
  width?: number
  pad?: number
}

function cubeGroupBounds(voxels: Voxel3[]): { minX: number; minY: number; maxX: number; maxY: number } {
  const pts = voxels.flatMap((v) => {
    const { sx, sy } = project(v)
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

export function CubeGroupColored({ voxels, palette, width = 90, pad = 6 }: CubeGroupColoredProps) {
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
        const { sx, sy } = project(v)
        const topPts   = `${sx},${sy} ${sx + CX},${sy - CY} ${sx + 2 * CX},${sy} ${sx + CX},${sy + CY}`
        const leftPts  = `${sx},${sy} ${sx + CX},${sy + CY} ${sx + CX},${sy + CY + SIZE} ${sx},${sy + SIZE}`
        const rightPts = `${sx + CX},${sy + CY} ${sx + 2 * CX},${sy} ${sx + 2 * CX},${sy + SIZE} ${sx + CX},${sy + CY + SIZE}`
        return (
          <g key={i}>
            <polygon points={topPts}   fill={palette.top}   stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
            <polygon points={leftPts}  fill={palette.left}  stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
            <polygon points={rightPts} fill={palette.right} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
          </g>
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Aria labels
// ---------------------------------------------------------------------------

const SHAPE_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Shape A: yellow staircase of 4 cubes descending from upper-left to lower-right.',
    id: 'Bentuk A: tangga kuning dari 4 kubus turun dari kiri atas ke kanan bawah.',
  },
  B: {
    en: 'Shape B: orange plus/cross of 5 cubes arranged flat on the ground.',
    id: 'Bentuk B: salib oranye dari 5 kubus tersusun datar di tanah.',
  },
  C: {
    en: 'Shape C: pink S-shaped arrangement of 5 cubes — front row of 3 with 2 behind to the right.',
    id: 'Bentuk C: susunan S merah muda dari 5 kubus — baris depan 3 dengan 2 di belakang kanan.',
  },
  D: {
    en: 'Shape D: purple Z-shaped arrangement of 5 cubes — front row of 3 with 2 behind to the left.',
    id: 'Bentuk D: susunan Z ungu dari 5 kubus — baris depan 3 dengan 2 di belakang kiri.',
  },
  E: {
    en: 'Shape E: green L-tower of 6 cubes — base row of 4 with a 3-cube-tall tower on the left. This shape uses the most cubes.',
    id: 'Bentuk E: menara L hijau dari 6 kubus — baris dasar 4 dengan menara setinggi 3 kubus di kiri. Bentuk ini menggunakan kubus paling banyak.',
  },
}

// ---------------------------------------------------------------------------
// Option renderer — renders ONE choice by label A/B/C/D/E
// ---------------------------------------------------------------------------

/**
 * Opts11PEOption — renders one A–E choice as a coloured isometric cube figure.
 * Registered in CHOICE_RENDERERS for IKMC-20-PE-Q11.
 */
export function Opts11PEOption({ choice }: { choice: WmiChoice }) {
  const k = choice.label as keyof typeof SHAPE_VOXELS
  const voxels = SHAPE_VOXELS[k]
  const palette = PALETTES[k]
  const aria = SHAPE_ARIA[k]
  if (!voxels || !palette) return <span>{choice.text}</span>

  const count = CUBE_COUNTS[k]

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      title={`${count} cube${count !== 1 ? 's' : ''}`}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <CubeGroupColored voxels={voxels} palette={palette} width={80} pad={6} />
    </span>
  )
}
