/**
 * TopViewCubesHK20P2Q17Illustration — HKIMO-20-P2H-Q17
 *
 * "At least how many squares can be seen if viewing the figure below from the top?"
 * Answer: 13 (10 × 1×1 + 3 × 2×2).
 *
 * Source: docs/reference/ocr-res/hkimo/heat/primary-2/2020.imgs/005.jpg
 *
 * 3D structure — top-view footprint (4 cols × 3 rows, inner back cells empty):
 *   r2 (back):   X  .  .  X   ← left tower h=3; right tower h=2
 *   r1 (middle): X  X  X  X   ← 4 cells at h=1
 *   r0 (front):  X  X  X  X   ← 4 cells at h=1
 *
 * Top-view square count (anti-drift — binds to breakdown.quantities):
 *   1×1: 10 (one per cell)
 *   2×2:  3 (cols 0-1 / 1-2 / 2-3 in the front two rows)
 *   Total = 13 ✓
 *
 * Primitive: IsoCubes (./primitives/IsoCubes). SSR-safe (no hooks, no framer-motion).
 */

import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ── voxel set (exported for reuse in explainer) ─────────────────────────────

export const HKIMO20P2Q17_CUBES: IsoCube[] = [
  // Back-left tower (h=3)
  { x: 0, y: 2, z: 0 }, { x: 0, y: 2, z: 1 }, { x: 0, y: 2, z: 2 },
  // Back-right tower (h=2)
  { x: 3, y: 2, z: 0 }, { x: 3, y: 2, z: 1 },
  // Middle row y=1 (h=1 each)
  { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 2, y: 1, z: 0 }, { x: 3, y: 1, z: 0 },
  // Front row y=0 (h=1 each)
  { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, { x: 3, y: 0, z: 0 },
]

// ── 2D top-view diagram (exported for explainer beats) ───────────────────────

const CELL = 36  // px per unit square
const PAD  = 10  // SVG padding

export const TV_VB_W = 4 * CELL + 2 * PAD  // 164
export const TV_VB_H = 3 * CELL + 2 * PAD  // 128

/**
 * Footprint cells as [row, col] pairs.
 * row=0 is front (bottom of SVG), row=2 is back (top of SVG).
 * Ordered front-to-back so index 0..9 labels them 1..10 naturally.
 */
const FOOTPRINT_CELLS: [number, number][] = [
  [0, 0], [0, 1], [0, 2], [0, 3],  // front row  → labels 1-4
  [1, 0], [1, 1], [1, 2], [1, 3],  // middle row → labels 5-8
  [2, 0], [2, 3],                   // back corners → labels 9-10
]

/** Grid column → SVG x. */
function gx(col: number) { return PAD + col * CELL }
/** Grid row → SVG y. row=0 → bottom, row=2 → top. */
function gy(row: number) { return PAD + (2 - row) * CELL }

export interface TopViewDiagramProps {
  /** Highlight 2×2 square A (cols 0-1, rows 0-1) — amber. */
  showA?: boolean
  /** Highlight 2×2 square B (cols 1-2, rows 0-1) — blue. */
  showB?: boolean
  /** Highlight 2×2 square C (cols 2-3, rows 0-1) — green. */
  showC?: boolean
  /** Show cell-number labels (1-10) to illustrate 1×1 count. */
  showCellNumbers?: boolean
}

/** Shared top-down 2D SVG — used by both the illustration and the explainer. */
export function TopViewDiagram({
  showA = false,
  showB = false,
  showC = false,
  showCellNumbers = false,
}: TopViewDiagramProps) {
  return (
    <svg
      viewBox={`0 0 ${TV_VB_W} ${TV_VB_H}`}
      width="100%"
      style={{ maxWidth: TV_VB_W * 1.8, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* White cell fills */}
      {FOOTPRINT_CELLS.map(([r, c]) => (
        <rect
          key={`bg-${r}-${c}`}
          x={gx(c)} y={gy(r)}
          width={CELL} height={CELL}
          fill="#FFFFFF"
          stroke="none"
        />
      ))}

      {/* 2×2 highlight A — amber (cols 0-1, rows 0-1) */}
      {showA && (
        <>
          <rect x={gx(0)} y={gy(1)} width={2 * CELL} height={2 * CELL} fill="#FDE68A" opacity={0.65} stroke="none" />
          <rect x={gx(0)} y={gy(1)} width={2 * CELL} height={2 * CELL} fill="none" stroke="#D97706" strokeWidth={2.5} />
          <text x={gx(0) + CELL} y={gy(1) - 3} textAnchor="middle" fontSize={11} fontWeight="700" fill="#D97706">A</text>
        </>
      )}

      {/* 2×2 highlight B — blue (cols 1-2, rows 0-1) */}
      {showB && (
        <>
          <rect x={gx(1)} y={gy(1)} width={2 * CELL} height={2 * CELL} fill="#BFDBFE" opacity={0.65} stroke="none" />
          <rect x={gx(1)} y={gy(1)} width={2 * CELL} height={2 * CELL} fill="none" stroke="#2563EB" strokeWidth={2.5} />
          <text x={gx(1) + CELL} y={gy(1) - 3} textAnchor="middle" fontSize={11} fontWeight="700" fill="#2563EB">B</text>
        </>
      )}

      {/* 2×2 highlight C — green (cols 2-3, rows 0-1) */}
      {showC && (
        <>
          <rect x={gx(2)} y={gy(1)} width={2 * CELL} height={2 * CELL} fill="#D1FAE5" opacity={0.65} stroke="none" />
          <rect x={gx(2)} y={gy(1)} width={2 * CELL} height={2 * CELL} fill="none" stroke="#10B981" strokeWidth={2.5} />
          <text x={gx(2) + CELL} y={gy(1) - 3} textAnchor="middle" fontSize={11} fontWeight="700" fill="#10B981">C</text>
        </>
      )}

      {/* Cell borders (drawn on top of fills) */}
      {FOOTPRINT_CELLS.map(([r, c]) => (
        <rect
          key={`border-${r}-${c}`}
          x={gx(c)} y={gy(r)}
          width={CELL} height={CELL}
          fill="none"
          stroke="#1F2937"
          strokeWidth={1.5}
        />
      ))}

      {/* Cell-number labels (1-10), shown when counting 1×1 squares */}
      {showCellNumbers && FOOTPRINT_CELLS.map(([r, c], i) => (
        <text
          key={`num-${r}-${c}`}
          x={gx(c) + CELL / 2}
          y={gy(r) + CELL / 2 + 4}
          textAnchor="middle"
          fontSize={10}
          fontWeight="700"
          fill="#374151"
        >
          {i + 1}
        </text>
      ))}
    </svg>
  )
}

// ── stem illustration (3D problem figure only — no answer) ───────────────────

interface Props {
  lang?: 'en' | 'id'
}

export default function TopViewCubesHK20P2Q17Illustration({ lang = 'en' }: Props) {
  const id = lang === 'id'
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        id
          ? 'Susunan kubus satuan 3D — hitung berapa banyak persegi jika dilihat dari atas.'
          : '3D arrangement of unit cubes — count the squares visible when viewed from above.'
      }
    >
      <IsoCubes
        cubes={HKIMO20P2Q17_CUBES}
        size={26}
        palette={ISO_BLUE_PALETTE}
        viewPadding={12}
        label={
          id
            ? 'Bangun 3D dari kubus satuan — lihat dari atas untuk menghitung persegi'
            : '3D figure of unit cubes — view from top to count squares'
        }
      />
    </div>
  )
}
