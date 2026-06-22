// IKMC 2022 Pre-Ecolier Q15 — "Katrin builds a path around each square using tiles."
//
// PROBLEM ONLY: shows three example figures from the paper —
//   Stage 1: a 1×1 inner square, fully surrounded by tiles  (4 tiles shown).
//   Stage 3: a 3×3 inner square surrounded by tiles         (8 tiles shown).
//   Stage ?: the 5×5 case is asked (answer = 12, NOT revealed here).
//
// Each tile is 1 unit tall × 2 units wide (the horizontal tile shown in the source image).
// The border is 1 unit wide on each side, so:
//   outer side = inner + 2,  tile count = ((outer² - inner²) / 2).
//
// Co-exported primitives used by TilePath15PEExplainer:
//   TileFrame       — renders one framed example (inner + surrounding tiles)
//   STAGE_DATA      — the three stages' data
//   TILE_FILL       — salmon/brick colour matching the source images
//   TILE_STROKE     — darker border for tiles
//   INNER_FILL      — white interior
//   CELL            — unit cell size in px
//   SVG_W / SVG_H   — viewBox dimensions

// ── colour tokens ─────────────────────────────────────────────────────────────
export const TILE_FILL = '#E87070'   // salmon-brick, matching the original
export const TILE_STROKE = '#C04040'
export const INNER_FILL = '#FFFFFF'
export const FRAME_STROKE = '#1F2937'
export const INK = '#1F2937'

// ── layout constants ──────────────────────────────────────────────────────────
export const CELL = 16 // px per unit cell

// Each stage: inner square side in units, tile count, label
export type PathStage = {
  side: number        // inner square side length (units)
  tiles: number       // number of 1×2 tiles in the border
  label: string       // "sisi 1", "sisi 3", "sisi ?"
}

export const STAGE_DATA: PathStage[] = [
  { side: 1, tiles: 4, label: 'sisi 1' },
  { side: 3, tiles: 8, label: 'sisi 3' },
  { side: 5, tiles: 0, label: 'sisi 5 ?' },  // tiles=0 → unknown (not drawn in stem)
]

// Outer square side = inner + 2 (1-unit border each side)
const outerSide = (s: PathStage) => s.side + 2

/**
 * Renders one framed tile-path example inside a `size`-by-`size` bounding box at (ox, oy).
 * When `showTiles` is false (the question's third figure), only draws the outline hint.
 * When `highlightArea` is true, shades the border region in orange.
 */
export function TileFrame({
  stage,
  ox,
  oy,
  showTiles = true,
  highlightArea = false,
  countLabel,
}: {
  stage: PathStage
  ox: number
  oy: number
  showTiles?: boolean
  highlightArea?: boolean
  countLabel?: string
}) {
  const outer = outerSide(stage)
  const inner = stage.side
  const totalPx = outer * CELL   // total outer square size in px
  const innerPx = inner * CELL
  const borderPx = CELL          // 1 unit border

  // Top-left of the outer square
  const x0 = ox
  const y0 = oy

  // Inner square offset (border is 1 unit = CELL px on each side)
  const ix = x0 + borderPx
  const iy = y0 + borderPx

  if (!showTiles) {
    // Third figure in the paper — just a pale frame outline, no individual tiles
    return (
      <g>
        {/* outer border as pale fill */}
        <rect
          x={x0}
          y={y0}
          width={totalPx}
          height={totalPx}
          fill={highlightArea ? '#FFD09080' : '#F3E0E0'}
          stroke={FRAME_STROKE}
          strokeWidth={1.5}
        />
        {/* inner white square */}
        <rect
          x={ix}
          y={iy}
          width={innerPx}
          height={innerPx}
          fill={INNER_FILL}
          stroke={FRAME_STROKE}
          strokeWidth={1}
        />
        {/* dimension arrow + label inside */}
        <line
          x1={ix + 4}
          y1={iy + innerPx + 8}
          x2={ix + innerPx - 4}
          y2={iy + innerPx + 8}
          stroke={INK}
          strokeWidth={1.2}
          markerStart="url(#tpArrowL)"
          markerEnd="url(#tpArrowR)"
        />
        <text
          x={ix + innerPx / 2}
          y={iy + innerPx + 20}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={800}
          fill={INK}
          className="font-display"
        >
          {inner}
        </text>
        {countLabel && (
          <text
            x={x0 + totalPx / 2}
            y={y0 + totalPx + 16}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={800}
            fill={INK}
            className="font-display"
          >
            {countLabel}
          </text>
        )}
      </g>
    )
  }

  // Draw each tile as a 2×1 or 1×2 rect in the border band.
  // Strategy: tile the border with horizontal 2×1 tiles where they fit,
  // then 1×2 vertical tiles on left/right columns.
  //
  // The border region is outer² - inner² unit cells.
  // For side=1: outer=3, 8 border cells → place horizontal pairs in top/bottom
  //   rows (4 tiles of 2×1 each, matching the source image which shows 4 tiles).
  // For side=3: outer=5, 16 border cells → 8 tiles.
  //
  // Tile placement matches the source image layout:
  //   Top row:    horizontal tiles spanning 2 units each
  //   Bottom row: horizontal tiles spanning 2 units each
  //   Left/right columns (excluding corners already covered): vertical tiles
  //
  // To match the brick-like pattern in the source, we use:
  //   Top/bottom sides: (outer/2) horizontal tiles
  //   Left/right sides (interior rows): (inner/2) vertical tiles each
  //   Corner tiles: 1×1 cells filled as part of top/bottom rows
  //
  // For simplicity and faithfulness to the source, we use a uniform tiling:
  //   - Top row: horizontal tiles (2×1), outer/2 of them if outer is even, else stagger
  //   - Bottom row: same
  //   - Left column (inner rows): vertical tiles (1×2)
  //   - Right column (inner rows): vertical tiles (1×2)
  //
  // Source image 046 (side=1): shows the border divided into exactly 4 brick-shaped
  // tiles — top, bottom, left, right each one 2×1 or rotated 1×2.
  // Source image 047 (side=3): shows 8 tiles — 3 across top, 3 across bottom,
  //   1 on left mid, 1 on right mid = 8.

  const tiles: React.ReactNode[] = []
  let key = 0

  const tileStyle = {
    fill: TILE_FILL,
    stroke: TILE_STROKE,
    strokeWidth: 1,
  } as const

  // Top row: horizontal 2-unit tiles running left to right across full outer width
  // outer columns in pairs: floor(outer/2) tiles; if outer is odd, last col gets a 1×1
  for (let col = 0; col < outer; col += 2) {
    const w = col + 2 <= outer ? 2 * CELL : CELL
    tiles.push(
      <rect
        key={key++}
        x={x0 + col * CELL}
        y={y0}
        width={w}
        height={CELL}
        {...tileStyle}
      />
    )
  }

  // Bottom row: same pattern
  for (let col = 0; col < outer; col += 2) {
    const w = col + 2 <= outer ? 2 * CELL : CELL
    tiles.push(
      <rect
        key={key++}
        x={x0 + col * CELL}
        y={y0 + (outer - 1) * CELL}
        width={w}
        height={CELL}
        {...tileStyle}
      />
    )
  }

  // Left column: vertical 1×2 tiles in the inner rows only (rows 1..outer-2)
  for (let row = 1; row < outer - 1; row += 2) {
    const h = row + 2 <= outer - 1 ? 2 * CELL : CELL
    tiles.push(
      <rect
        key={key++}
        x={x0}
        y={y0 + row * CELL}
        width={CELL}
        height={h}
        {...tileStyle}
      />
    )
  }

  // Right column: vertical 1×2 tiles in the inner rows only
  for (let row = 1; row < outer - 1; row += 2) {
    const h = row + 2 <= outer - 1 ? 2 * CELL : CELL
    tiles.push(
      <rect
        key={key++}
        x={x0 + (outer - 1) * CELL}
        y={y0 + row * CELL}
        width={CELL}
        height={h}
        {...tileStyle}
      />
    )
  }

  return (
    <g>
      {/* border background (rendered under tiles for highlightArea) */}
      {highlightArea && (
        <rect
          x={x0}
          y={y0}
          width={totalPx}
          height={totalPx}
          fill="#FFD09060"
          stroke="none"
        />
      )}
      {/* inner white square first */}
      <rect
        x={ix}
        y={iy}
        width={innerPx}
        height={innerPx}
        fill={INNER_FILL}
        stroke="none"
      />
      {/* tiles on top */}
      {tiles}
      {/* outer border outline */}
      <rect
        x={x0}
        y={y0}
        width={totalPx}
        height={totalPx}
        fill="none"
        stroke={FRAME_STROKE}
        strokeWidth={1.5}
      />
      {/* inner outline */}
      <rect
        x={ix}
        y={iy}
        width={innerPx}
        height={innerPx}
        fill="none"
        stroke={FRAME_STROKE}
        strokeWidth={1}
      />
      {/* dimension label arrow below the figure */}
      {countLabel && (
        <text
          x={x0 + totalPx / 2}
          y={y0 + totalPx + 16}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={800}
          fill={INK}
          className="font-display"
        >
          {countLabel}
        </text>
      )}
    </g>
  )
}

// ── whole-figure SVG ──────────────────────────────────────────────────────────
//
// Three examples side-by-side, matching the paper layout:
//   [side=1 tiled] → [side=3 tiled] → [side=5 outline with "?"]
//
// Heights differ (outer=3,5,7 cells) so we align them at the top.

const STAGE_SIZES = STAGE_DATA.map((s) => outerSide(s) * CELL)
const MAX_H = Math.max(...STAGE_SIZES)
const GAP = 40
const PAD = 12
const LABEL_BELOW = 22

export const SVG_H = MAX_H + LABEL_BELOW + PAD * 2
export const SVG_W = STAGE_SIZES.reduce((a, b) => a + b, 0) + GAP * (STAGE_DATA.length - 1) + PAD * 2

export function TilePathFigure() {
  let cursor = PAD
  const entries = STAGE_DATA.map((stage, i) => {
    const sz = STAGE_SIZES[i]
    const ox = cursor
    cursor += sz + GAP
    return { stage, ox, sz }
  })

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: 400, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <defs>
        <marker id="tpArrowL" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M6,0 L0,3 L6,6 Z" fill={INK} />
        </marker>
        <marker id="tpArrowR" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L6,3 L0,6 Z" fill={INK} />
        </marker>
      </defs>

      {entries.map(({ stage, ox, sz }, i) => {
        const showTiles = stage.tiles > 0
        const label =
          stage.tiles > 0
            ? `${stage.tiles} ubin`
            : '? ubin'
        return (
          <g key={i}>
            <TileFrame
              stage={stage}
              ox={ox}
              oy={PAD}
              showTiles={showTiles}
              countLabel={label}
            />
            {/* arrow between stages */}
            {i < STAGE_DATA.length - 1 && (
              <line
                x1={ox + sz + 6}
                y1={PAD + MAX_H / 2}
                x2={ox + sz + GAP - 6}
                y2={PAD + MAX_H / 2}
                stroke="#D97706"
                strokeWidth={2}
                markerEnd="url(#tpArrowR)"
              />
            )}
            {/* side label above each figure */}
            <text
              x={ox + sz / 2}
              y={PAD - 2}
              textAnchor="middle"
              dominantBaseline="auto"
              fontSize={10}
              fontWeight={700}
              fill={INK}
              className="font-display"
            >
              {stage.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function TilePath15PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Katrin meletakkan ubin di sekeliling persegi. Sisi 1 butuh 4 ubin, sisi 3 butuh 8 ubin. Berapa ubin untuk sisi 5?"
    >
      <TilePathFigure />
    </div>
  )
}

export default TilePath15PEIllustration
