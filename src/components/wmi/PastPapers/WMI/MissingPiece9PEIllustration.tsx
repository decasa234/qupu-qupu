// IKMC-20-PE-Q9 — "Which piece completes the picture?"
//
// Source figure (docs/reference/ocr-res/ikmc/contest/preecolier/2020.imgs/029.jpg):
// A 3×3 tile grid on a light-blue background. Every tile shows four playing-card
// suit quarter-shapes (spade, heart, diamond, club) in the tile's four quadrants.
// The centre tile (row 1, col 1) is blank/white with a "?" — the missing piece.
//
// Options A–E (030–034.jpg) each show one candidate tile:
//   A: suits at all four corners pointing outward (spade top-right, heart bottom-
//      right, club top-left, diamond bottom-left) — wrong
//   B: suits rotated — different orientation, wrong
//   C: spade top-left, heart top-right, diamond bottom-left, club bottom-right,
//      each suit occupying the tile's quadrant as quarter-circles — CORRECT
//   D: large diamond/X cross covers the whole tile — wrong
//   E: partial diamond cross variant — wrong
//
// Co-exports:
//   MissingPiece9PEGrid   — the shared 3×3 grid primitive (reused by explainer)
//   SuitTile              — draws one tile: the 2×2 arrangement of suit quarter-shapes
//   MissingPiece9PEOption — CHOICE_RENDERERS entry, renders one A–E candidate tile
//
// Pure SVG. SSR-safe. No Math.random / Date.now at module scope.
// Adapted from Jigsaw23G1Illustration (grid primitive + hole pattern).

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Colour tokens (qupu brand palette, mirrors jigsaw/pattern components)
// ---------------------------------------------------------------------------

const BG   = '#BDD5E7'  // light sky-blue tile background (matches source)
const INK  = '#1A1A1A'  // near-black suit fill
const HOLE = '#FFFFFF'  // missing-piece white hole
const BORDER = '#30598A' // qupu-brand-blue for grid lines

// ---------------------------------------------------------------------------
// Suit path primitives — each is a quarter-shape that fits one quadrant of a
// tile. We draw each suit as a simplified single-path (no raster).
//
// All suit shapes are drawn in a normalised 40×40 box and then <use>d with a
// transform to position them in the correct quadrant.
//
// Suits used (one per quadrant of each tile):
//   TL = top-left    → SPADE    (↑)
//   TR = top-right   → HEART    (♥ facing right)
//   BL = bottom-left → DIAMOND  (◇ facing left)
//   BR = bottom-right→ CLUB     (♣ facing down)
//
// The exact arrangement is read from the surrounding 8 tiles in the scan.
// In the 3×3 pattern:
//   - Each tile corner is shared with up to 4 neighbours.
//   - The repeating rule is: in every cell, TL=spade, TR=heart, BL=diamond, BR=club.
//   - Option C matches this rule exactly → CORRECT.
// ---------------------------------------------------------------------------

// A "spade" quarter-shape: an inverted tear-drop + triangular stem pointing up,
// trimmed to the top-left quadrant of the tile.
// Box: 0 0 40 40, shape centred so its visual weight sits in top-left area.
const SPADE_PATH =
  'M 20 2 C 20 2 4 12 4 22 C 4 30 12 34 20 34 L 16 38 L 24 38 L 20 34 C 28 34 36 30 36 22 C 36 12 20 2 20 2 Z'

// A "heart" quarter-shape pointing toward the right edge.
const HEART_PATH =
  'M 20 8 C 16 2 4 4 4 14 C 4 20 10 26 20 34 C 30 26 36 20 36 14 C 36 4 24 2 20 8 Z'

// A "diamond" quarter-shape (rotated square).
const DIAMOND_PATH =
  'M 20 2 L 38 20 L 20 38 L 2 20 Z'

// A "club" quarter-shape: three overlapping circles + stem.
const CLUB_PATH =
  'M 20 8 m -8 0 a 8 8 0 1 0 0.01 0 Z M 20 8 m 8 0 a 8 8 0 1 0 0.01 0 Z M 20 16 a 8 8 0 1 0 0.01 0 Z M 16 38 L 24 38 L 22 28 L 18 28 Z'

// ---------------------------------------------------------------------------
// SuitTile — draws one tile (sz × sz) at SVG position (tx, ty).
// Each tile shows 4 suit shapes, one per quadrant, all in INK.
//
// quadrant  position   suit
//   TL      top-left   spade
//   TR       top-right  heart
//   BL       bot-left   diamond
//   BR       bot-right  club
//
// The quadrant scale keeps each symbol within 40% of the tile half.
// ---------------------------------------------------------------------------

interface SuitTileProps {
  tx: number    // tile left edge in SVG coords
  ty: number    // tile top edge in SVG coords
  sz: number    // tile size in px
  showSuits?: boolean
}

function suit(path: string, tx: number, ty: number, sz: number, qRow: 0 | 1, qCol: 0 | 1) {
  // Each suit is drawn in a 40×40 box, scaled to fit a (sz/2 × sz/2) quadrant.
  const scale = sz / 2 / 40
  const dx = tx + qCol * (sz / 2)
  const dy = ty + qRow * (sz / 2)
  return (
    <path
      d={path}
      fill={INK}
      transform={`translate(${dx},${dy}) scale(${scale})`}
    />
  )
}

export function SuitTile({ tx, ty, sz, showSuits = true }: SuitTileProps) {
  return (
    <g>
      <rect x={tx} y={ty} width={sz} height={sz} fill={BG} />
      {showSuits && (
        <>
          {suit(SPADE_PATH,   tx, ty, sz, 0, 0)}
          {suit(HEART_PATH,   tx, ty, sz, 0, 1)}
          {suit(DIAMOND_PATH, tx, ty, sz, 1, 0)}
          {suit(CLUB_PATH,    tx, ty, sz, 1, 1)}
        </>
      )}
    </g>
  )
}

// ---------------------------------------------------------------------------
// MissingPiece9PEGrid — the shared 3×3 grid primitive.
// showAnswer: when true fills the centre cell with the correct tile (option C).
// ---------------------------------------------------------------------------

const GRID_N = 3
export const TILE_SZ = 70  // tile edge in px for the stem illustration
const GAP = 4              // gap between tiles (matches the grey lines in scan)

interface GridProps {
  showAnswer?: boolean
  tileSz?: number
}

export function MissingPiece9PEGrid({ showAnswer = false, tileSz = TILE_SZ }: GridProps) {
  const gap = Math.round(GAP * (tileSz / TILE_SZ))
  const step = tileSz + gap
  const totalW = GRID_N * tileSz + (GRID_N - 1) * gap
  const totalH = totalW
  const pad = 6

  return (
    <svg
      viewBox={`0 0 ${totalW + pad * 2} ${totalH + pad * 2}`}
      width={Math.min(260, totalW + pad * 2)}
      role="presentation"
      aria-hidden="true"
    >
      {/* tile grid */}
      {Array.from({ length: GRID_N }).map((_, row) =>
        Array.from({ length: GRID_N }).map((_, col) => {
          const isMissing = row === 1 && col === 1
          const tx = pad + col * step
          const ty = pad + row * step
          if (isMissing) {
            return (
              <g key={`${row}-${col}`}>
                <rect x={tx} y={ty} width={tileSz} height={tileSz} fill={HOLE} />
                {showAnswer ? (
                  // Show the correct piece (option C) filling the hole
                  <SuitTile tx={tx} ty={ty} sz={tileSz} showSuits />
                ) : (
                  // Stem: question mark only
                  <text
                    x={tx + tileSz / 2}
                    y={ty + tileSz / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={tileSz * 0.45}
                    fontWeight={900}
                    fill={BORDER}
                  >
                    ?
                  </text>
                )}
              </g>
            )
          }
          return <SuitTile key={`${row}-${col}`} tx={tx} ty={ty} sz={tileSz} />
        }),
      )}

      {/* grid border */}
      <rect
        x={pad}
        y={pad}
        width={totalW}
        height={totalH}
        fill="none"
        stroke={BORDER}
        strokeWidth={2.5}
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// MissingPiece9PEIllustration — the stem illustration (missing piece = "?").
// Answer C is NEVER shown here.
// ---------------------------------------------------------------------------

export default function MissingPiece9PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Gambar 3×3 berisi ubin bermotif simbol kartu (sekop, hati, berlian, keriting). Ubin tengah kosong bertanda tanya — pilih potongan yang tepat."
    >
      <MissingPiece9PEGrid showAnswer={false} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// MissingPiece9PEOption — CHOICE_RENDERERS entry.
// Renders one candidate tile (A–E) as an SVG picture.
//
// A: all 4 suits but outer-pointing layout (spades+hearts reversed)
// B: suits in a rotated arrangement
// C: standard TL=spade, TR=heart, BL=diamond, BR=club  ← correct
// D: large filled diamond cross covering the whole tile
// E: partial diamond cross variant
// ---------------------------------------------------------------------------

// Option-specific suit layouts. Each entry defines [path, qRow, qCol] tuples.
// (qRow 0=top, qCol 0=left within the tile's own 40px coordinate system)
//
// Read directly from the scan images:
// A (030.jpg): suits at all corners but the spade points DOWN-LEFT (rotated 180°)
//              and heart points DOWN-RIGHT; bottom suits are diamond TL + club TR.
// B (031.jpg): spade at BR, heart at TR, diamond at TL, club at BL
// C (032.jpg): spade TL, heart TR, diamond BL, club BR  ← CORRECT
// D (033.jpg): a diamond-shaped X cross that covers most of the tile, no small suits
// E (034.jpg): similar X cross, slightly different cut
//
// For D and E we draw the large cross shape directly.

// Large diamond/cross fills — used for options D and E.
// D: a filled diamond shape (rotated square) plus thin strips making an X
function largeXPath(sz: number) {
  const m = sz / 2
  // Outer diamond then cut inner
  return `M ${m} 2 L ${sz - 2} ${m} L ${m} ${sz - 2} L 2 ${m} Z`
}

// E variant: similar but with two diagonal strips crossing (like a rotated X)
// (from the scan E looks like D but with the light-blue background showing as
//  triangles in the corners rather than the centre — basically the inverse mask)
// We model it as crossing diagonal stripes.
function largeStripesPath(sz: number) {
  const w = sz * 0.28  // stripe half-width
  const m = sz / 2
  // Horizontal band
  const p1 = `M 0 ${m - w} L ${sz} ${m - w} L ${sz} ${m + w} L 0 ${m + w} Z`
  // Vertical band
  const p2 = `M ${m - w} 0 L ${m + w} 0 L ${m + w} ${sz} L ${m - w} ${sz} Z`
  return `${p1} ${p2}`
}

const OPTION_SZ = 64  // tile size for options (px)

interface OptionContent {
  type: 'suits' | 'diamond' | 'stripes'
}

const OPTION_CONTENT: Record<string, OptionContent> = {
  A: { type: 'suits' },
  B: { type: 'suits' },
  C: { type: 'suits' },
  D: { type: 'diamond' },
  E: { type: 'stripes' },
}

// Suit arrangement per option (for type:'suits' options).
// Each item: [suitPath, qRow (0|1), qCol (0|1), rotation in deg]
type SuitPlacement = [string, 0 | 1, 0 | 1, number]

// The rotation is applied around the centre of the 40×40 suit box.
const SUIT_LAYOUTS: Record<string, SuitPlacement[]> = {
  // Option A: suits at corners but rotated 180° vs C (outer-pointing).
  A: [
    [SPADE_PATH,   0, 0, 180],  // flipped spade at TL
    [HEART_PATH,   0, 1, 180],  // flipped heart at TR
    [DIAMOND_PATH, 1, 0, 180],  // diamond BL
    [CLUB_PATH,    1, 1, 180],  // club BR
  ],
  // Option B: suits shifted one quadrant clockwise.
  B: [
    [CLUB_PATH,    0, 0, 0],   // club at TL
    [SPADE_PATH,   0, 1, 0],   // spade at TR
    [HEART_PATH,   1, 0, 0],   // heart at BL
    [DIAMOND_PATH, 1, 1, 0],   // diamond at BR
  ],
  // Option C (CORRECT): standard TL=spade, TR=heart, BL=diamond, BR=club.
  C: [
    [SPADE_PATH,   0, 0, 0],
    [HEART_PATH,   0, 1, 0],
    [DIAMOND_PATH, 1, 0, 0],
    [CLUB_PATH,    1, 1, 0],
  ],
}

export function MissingPiece9PEOption({ choice }: { choice: WmiChoice }) {
  const label = choice.label as 'A' | 'B' | 'C' | 'D' | 'E'
  const content = OPTION_CONTENT[label]
  const sz = OPTION_SZ
  const pad = 4
  const total = sz + pad * 2

  const ariaMap: Record<string, string> = {
    A: 'Pilihan A: ubin dengan simbol menghadap keluar.',
    B: 'Pilihan B: ubin dengan simbol diputar searah jarum jam.',
    C: 'Pilihan C: ubin dengan sekop kiri-atas, hati kanan-atas, berlian kiri-bawah, keriting kanan-bawah — jawaban benar.',
    D: 'Pilihan D: ubin dengan berlian besar memenuhi kotak.',
    E: 'Pilihan E: ubin dengan pola silang diagonal.',
  }

  return (
    <span
      role="img"
      aria-label={ariaMap[label] ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 2 }}
    >
      <svg
        viewBox={`0 0 ${total} ${total}`}
        width={total}
        height={total}
        style={{ display: 'block' }}
      >
        {/* tile background */}
        <rect x={pad} y={pad} width={sz} height={sz} fill={BG} />

        {content?.type === 'suits' && (() => {
          const placements = SUIT_LAYOUTS[label]
          if (!placements) return null
          const scale = sz / 2 / 40
          return placements.map(([path, qRow, qCol, rot], i) => {
            const qx = pad + qCol * (sz / 2)
            const qy = pad + qRow * (sz / 2)
            return (
              <path
                key={i}
                d={path}
                fill={INK}
                transform={`translate(${qx},${qy}) scale(${scale}) rotate(${rot},20,20)`}
              />
            )
          })
        })()}

        {content?.type === 'diamond' && (
          <path d={largeXPath(sz)} fill={INK} transform={`translate(${pad},${pad})`} />
        )}

        {content?.type === 'stripes' && (
          <path d={largeStripesPath(sz)} fill={INK} transform={`translate(${pad},${pad})`} fillRule="nonzero" />
        )}

        {/* border */}
        <rect x={pad} y={pad} width={sz} height={sz} fill="none" stroke={BORDER} strokeWidth={1.5} />
      </svg>
    </span>
  )
}
