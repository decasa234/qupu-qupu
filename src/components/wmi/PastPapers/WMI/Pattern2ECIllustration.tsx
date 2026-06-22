// IKMC-20-EC-Q2 — "Which piece completes the pattern?"
//
// Source figure (docs/reference/ocr-res/ikmc/contest/ecolier/2020.imgs/006.jpg):
// A 5-column × 3-row grid of decorative orange-on-white tiles. Every tile shows
// the SAME ornamental design in one of 4 rotations (0°/90°/180°/270°):
//   — a large white quarter-circle arc anchored at one corner (≈75% of tile radius)
//   — two white teardrop/seed shapes in the diagonally opposite corner area
//   — orange background fills the rest
//
// Rotation convention (clockwise, 0° = arc at top-left corner):
//   0°  : arc top-left,    seeds bottom-right
//   90° : arc top-right,   seeds bottom-left
//   180°: arc bottom-right, seeds top-left
//   270°: arc bottom-left,  seeds top-right
//
// Stem grid (row 0 = top, col 0 = left):
//   Row 0: 270  0   90  180  270
//   Row 1:   0  90  [?] 270    0
//   Row 2: 180 270    0   90  180
//
// Pattern rule: within each row every successive tile is +90° clockwise.
// Derivation of missing cell (row 1, col 2):
//   col 1 = 90°, so col 2 = 90° + 90° = 180°   ← answer E
//
// Options (007–011.jpg → A–E):
//   A (007.jpg): arc top-right  → 90°   — wrong (already in row 1 col 1)
//   B (008.jpg): arc top-left   → 0°    — wrong (col 0 of row 1)
//   C (009.jpg): arc bottom-left → 270° — wrong
//   D (010.jpg): white asterisk on orange — completely different design, wrong
//   E (011.jpg): arc bottom-right → 180° — CORRECT
//
// Co-exports:
//   OrnamTile          — draws one tile at (tx,ty) with given rotation (0|90|180|270)
//   Pattern2ECGrid     — the shared 5×3 grid primitive (reused by explainer)
//   Pattern2ECOption   — CHOICE_RENDERERS entry
//
// Pool component adapted from: MissingPiece9PEIllustration (same grid-with-hole
// + Option renderer structure) and P21G1Q22Illustration (rotation-based cell logic).
//
// Pure SVG. SSR-safe. No Math.random / Date.now at module scope.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Brand palette (qupu orange-on-white scheme, matching the real scan)
// ---------------------------------------------------------------------------

const TILE_BG   = '#F97316'  // qupu-brand orange (#F97316 ≈ orange-500)
const TILE_WHITE = '#FFFFFF'
const BORDER    = '#1A1A1A'
const HOLE_BG   = '#FFFFFF'

// ---------------------------------------------------------------------------
// OrnamTile — draws one ornamental tile in a sz×sz box at SVG position (tx,ty).
//
// The design (in 0° / arc-top-left orientation):
//   1. Orange rect background
//   2. White quarter-circle sector: center (0,0) radius = sz*0.74, covering TL
//   3. Two white teardrop seeds in the BR corner region
//   4. Rotation is applied via SVG transform around the tile centre (tx+sz/2, ty+sz/2)
// ---------------------------------------------------------------------------

export type TileRot = 0 | 90 | 180 | 270


interface OrnamTileProps {
  tx: number   // tile left x in SVG coords
  ty: number   // tile top y in SVG coords
  sz: number   // tile edge size in px
  rot: TileRot // rotation in degrees (0 | 90 | 180 | 270)
}

export function OrnamTile({ tx, ty, sz, rot }: OrnamTileProps) {
  const cx = tx + sz / 2
  const cy = ty + sz / 2
  const r = sz * 0.74

  // Seed centres and radii in 0° local coords (relative to tile TL = 0,0).
  // Two seeds in the BR corner area:
  //   Seed 1: elongated, tilted toward the diagonal
  //   Seed 2: similar but slightly lower/further left
  const s1cx = sz * 0.71
  const s1cy = sz * 0.58
  const s1rx = sz * 0.14
  const s1ry = sz * 0.075
  const s1rot = -42

  const s2cx = sz * 0.56
  const s2cy = sz * 0.73
  const s2rx = sz * 0.13
  const s2ry = sz * 0.07
  const s2rot = -48

  return (
    <g transform={`rotate(${rot}, ${cx}, ${cy})`}>
      {/* orange background */}
      <rect x={tx} y={ty} width={sz} height={sz} fill={TILE_BG} />

      {/* white quarter-circle arc sector at TL corner */}
      <path
        d={`M ${tx} ${ty} L ${tx + r} ${ty} A ${r} ${r} 0 0 1 ${tx} ${ty + r} Z`}
        fill={TILE_WHITE}
      />

      {/* white seed 1 (elongated ellipse, BR area) */}
      <ellipse
        cx={tx + s1cx}
        cy={ty + s1cy}
        rx={s1rx}
        ry={s1ry}
        fill={TILE_WHITE}
        transform={`rotate(${s1rot}, ${tx + s1cx}, ${ty + s1cy})`}
      />

      {/* white seed 2 (elongated ellipse, further BR) */}
      <ellipse
        cx={tx + s2cx}
        cy={ty + s2cy}
        rx={s2rx}
        ry={s2ry}
        fill={TILE_WHITE}
        transform={`rotate(${s2rot}, ${tx + s2cx}, ${ty + s2cy})`}
      />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Grid data — 5 cols × 3 rows, rotation per cell.
// Missing cell = row 1, col 2.
// ---------------------------------------------------------------------------

export const GRID_COLS = 5
export const GRID_ROWS = 3

// Pattern: within each row, each successive column is +90° clockwise.
// Row 0 starts at 270°, Row 1 at 0°, Row 2 at 180°.
const ROW_STARTS: TileRot[] = [270, 0, 180]

export function cellRot(row: number, col: number): TileRot {
  const deg = (ROW_STARTS[row] + col * 90) % 360
  return deg as TileRot
}

export const MISSING_ROW = 1
export const MISSING_COL = 2

/** The rotation the missing tile needs (derived from the pattern). */
export const ANSWER_ROT: TileRot = cellRot(MISSING_ROW, MISSING_COL)  // 180°

/** The correct answer letter. */
export const ANSWER_LABEL = 'E'

/** Which rotation each option shows (A–E → rotation in degrees). */
export const OPTION_ROTS: Record<'A' | 'B' | 'C' | 'D' | 'E', TileRot | null> = {
  A: 90,   // arc top-right
  B: 0,    // arc top-left
  C: 270,  // arc bottom-left
  D: null, // completely different design (asterisk)
  E: 180,  // arc bottom-right ← CORRECT
}

// ---------------------------------------------------------------------------
// Pattern2ECGrid — the shared 5×3 grid primitive (reused by explainer).
// showAnswer: fill the missing cell with the correct tile (option E = 180°).
// highlightRow/Col: draw amber rings around cells in that row/col.
// ---------------------------------------------------------------------------

export const TILE_SZ = 64   // px per tile in the stem illustration
const GAP = 3               // gap between tiles (matches the grid lines in scan)

interface GridProps {
  showAnswer?: boolean
  highlightRow?: number | null
  highlightCol?: number | null
  tileSz?: number
}

export function Pattern2ECGrid({
  showAnswer = false,
  highlightRow = null,
  highlightCol = null,
  tileSz = TILE_SZ,
}: GridProps) {
  const gap = Math.round(GAP * (tileSz / TILE_SZ))
  const step = tileSz + gap
  const totalW = GRID_COLS * step - gap
  const totalH = GRID_ROWS * step - gap
  const pad = 4

  return (
    <svg
      viewBox={`0 0 ${totalW + pad * 2} ${totalH + pad * 2}`}
      width={Math.min(360, totalW + pad * 2)}
      style={{ display: 'block', margin: '0 auto' }}
      role="presentation"
      aria-hidden="true"
    >
      {Array.from({ length: GRID_ROWS }).map((_, row) =>
        Array.from({ length: GRID_COLS }).map((_, col) => {
          const tx = pad + col * step
          const ty = pad + row * step
          const isMissing = row === MISSING_ROW && col === MISSING_COL
          const isHighlighted =
            (highlightRow != null && highlightRow === row) ||
            (highlightCol != null && highlightCol === col)

          return (
            <g key={`${row}-${col}`}>
              {isMissing ? (
                // Missing cell
                showAnswer ? (
                  <OrnamTile tx={tx} ty={ty} sz={tileSz} rot={ANSWER_ROT} />
                ) : (
                  <>
                    <rect x={tx} y={ty} width={tileSz} height={tileSz} fill={HOLE_BG} stroke={BORDER} strokeWidth={1.5} />
                    <text
                      x={tx + tileSz / 2}
                      y={ty + tileSz / 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={tileSz * 0.45}
                      fontWeight={900}
                      fill="#DC2626"
                      fontFamily="serif"
                    >
                      ?
                    </text>
                  </>
                )
              ) : (
                <OrnamTile tx={tx} ty={ty} sz={tileSz} rot={cellRot(row, col)} />
              )}

              {/* amber highlight ring */}
              {isHighlighted && (
                <rect
                  x={tx + 2}
                  y={ty + 2}
                  width={tileSz - 4}
                  height={tileSz - 4}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  rx={3}
                />
              )}

              {/* tile border */}
              <rect
                x={tx}
                y={ty}
                width={tileSz}
                height={tileSz}
                fill="none"
                stroke={BORDER}
                strokeWidth={1.5}
              />
            </g>
          )
        }),
      )}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Pattern2ECIllustration — default export: the stem (missing cell = "?").
// The answer tile is NEVER shown here.
// ---------------------------------------------------------------------------

export default function Pattern2ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="A 5 by 3 grid of ornamental tiles. Each tile shows the same orange-and-white decorative design in one of four rotations. The center tile of the middle row is missing — marked with a question mark. Choose the piece that completes the pattern."
    >
      <Pattern2ECGrid showAnswer={false} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pattern2ECOption — CHOICE_RENDERERS entry.
// Renders one candidate tile (A–E) as a small SVG picture.
//
// A (90°):  arc top-right
// B (0°):   arc top-left
// C (270°): arc bottom-left
// D (null): asterisk / star on orange (completely different design)
// E (180°): arc bottom-right  ← CORRECT
// ---------------------------------------------------------------------------

const OPTION_SZ = 60  // tile size for the option renderer (px)

function AsteriskTile({ tx, ty, sz }: { tx: number; ty: number; sz: number }) {
  // Option D: white asterisk shape on orange (as seen in 010.jpg).
  // Rendered as a white 6-point star / cross with two diagonal bands.
  const m = sz / 2
  const armW = sz * 0.13
  const longR = sz * 0.44
  // 3 rotated rectangles creating a 6-spoke star (0°, 60°, 120°)
  return (
    <g>
      <rect x={tx} y={ty} width={sz} height={sz} fill={TILE_BG} />
      {[0, 60, 120].map((deg) => (
        <rect
          key={deg}
          x={tx + m - armW / 2}
          y={ty + m - longR}
          width={armW}
          height={longR * 2}
          fill={TILE_WHITE}
          transform={`rotate(${deg}, ${tx + m}, ${ty + m})`}
        />
      ))}
    </g>
  )
}

const ARIA_LABELS: Record<string, string> = {
  A: 'Option A: tile with arc at top-right (90° rotation).',
  B: 'Option B: tile with arc at top-left (0° rotation).',
  C: 'Option C: tile with arc at bottom-left (270° rotation).',
  D: 'Option D: tile with white star shape on orange — does not match the pattern.',
  E: 'Option E: tile with arc at bottom-right (180° rotation) — correct answer.',
}

export function Pattern2ECOption({ choice }: { choice: WmiChoice }) {
  const label = choice.label as 'A' | 'B' | 'C' | 'D' | 'E'
  const rot = OPTION_ROTS[label]
  const sz = OPTION_SZ
  const pad = 4
  const total = sz + pad * 2

  return (
    <span
      role="img"
      aria-label={ARIA_LABELS[label] ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 2 }}
    >
      <svg
        viewBox={`0 0 ${total} ${total}`}
        width={total}
        height={total}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {rot != null ? (
          <OrnamTile tx={pad} ty={pad} sz={sz} rot={rot} />
        ) : (
          <AsteriskTile tx={pad} ty={pad} sz={sz} />
        )}
        <rect
          x={pad}
          y={pad}
          width={sz}
          height={sz}
          fill="none"
          stroke={BORDER}
          strokeWidth={1.5}
        />
      </svg>
    </span>
  )
}
