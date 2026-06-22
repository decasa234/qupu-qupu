// IKMC-23-PE-Q20 — Two-storey maze stem illustration + option renderer.
//
// Question: Sam walks from the entrance (Floor 1, top-left) to the exit (Floor 1,
// bottom-right), going through both floors. In what order will she find the wall
// stickers (frog, boar, shark)?  Answer B = shark → boar → frog.
//
// Floor layout (3 cols × 2 rows of rooms each floor):
//   Floor 1:
//     Row 0: [entrance→] room(0,0) | room(0,1) | room(0,2) [🐸 frog]
//     Row 1: [⇑stairs]  room(1,0) | room(1,1) | room(1,2) [→ exit]
//   Floor 2:
//     Row 0: [🐗 boar]  room(0,0) | room(0,1) [🦈 shark] | room(0,2)
//     Row 1: [⇓stairs]  room(1,0) | room(1,1)            | room(1,2)
//
// Correct path: F1 enter top-left → cross right → stairs down-left to F2 →
//   shark (F2 r0c1) → boar (F2 r0c0) → stairs back → frog (F1 r0c2) → exit.
// Order: 🦈 → 🐗 → 🐸  Answer B.
//
// SVG-only, SSR-safe, no state.

import type { WmiChoice } from '../../../../types/wmi'

// ------------------------------------------------------------------ palette --

const WALL = '#6B7280'        // room walls
const ROOM_FILL = '#F9FAFB'   // room interior
const ACCENT = '#F59E0B'      // arrows / stairs / highlights
const LABEL_COLOR = '#374151' // floor labels
const DOOR_GAP = 16           // width of a door opening in px

// ------------------------------------------------------------------ layout ---

const CELL_W = 64  // room width
const CELL_H = 52  // room height
const COLS = 3
const ROWS = 2
const FLOOR_W = COLS * CELL_W
const FLOOR_H = ROWS * CELL_H
const GAP_X = 28   // horizontal gap between Floor 1 and Floor 2 panels
const PAD = 26     // outer padding
const LABEL_H = 16 // height reserved for floor label above each panel

// Total viewBox
const VIEW_W = (FLOOR_W + PAD) * 2 + GAP_X
const VIEW_H = FLOOR_H + PAD * 2 + LABEL_H

// Floor 1 panel: left side
const F1_X = PAD
const F1_Y = PAD + LABEL_H

// Floor 2 panel: right side
const F2_X = PAD + FLOOR_W + GAP_X
const F2_Y = PAD + LABEL_H

// ----------------------------------------------------------------- helpers ---

/** Top-left pixel of a room (col, row) within a floor panel offset (ox,oy). */
const rx = (col: number, ox: number) => ox + col * CELL_W
const ry = (row: number, oy: number) => oy + row * CELL_H

/** Centre of a room. */
const rcx = (col: number, ox: number) => rx(col, ox) + CELL_W / 2
const rcy = (row: number, oy: number) => ry(row, oy) + CELL_H / 2

// ---------------------------------------------------------------- sub-parts --

/** A single room rectangle with optional doors (gaps in walls). */
function Room({
  col,
  row,
  ox,
  oy,
  doorRight,
  doorDown,
}: {
  col: number
  row: number
  ox: number
  oy: number
  doorRight?: boolean
  doorDown?: boolean
}) {
  const x = rx(col, ox)
  const y = ry(row, oy)
  const W = CELL_W
  const H = CELL_H
  const half = DOOR_GAP / 2

  // Draw each wall as individual line segments, leaving gaps for doors.
  // Top wall: always full (boundary or connecting row)
  // Left wall: always full (boundary or connecting col)
  // Right wall: gap in middle if doorRight
  // Bottom wall: gap in middle if doorDown

  const midX = x + W / 2
  const midY = y + H / 2

  return (
    <g>
      <rect x={x} y={y} width={W} height={H} fill={ROOM_FILL} />
      {/* top */}
      <line x1={x} y1={y} x2={x + W} y2={y} stroke={WALL} strokeWidth={2} />
      {/* left */}
      <line x1={x} y1={y} x2={x} y2={y + H} stroke={WALL} strokeWidth={2} />
      {/* right wall (with or without door gap) */}
      {doorRight ? (
        <>
          <line x1={x + W} y1={y} x2={x + W} y2={midY - half} stroke={WALL} strokeWidth={2} />
          <line x1={x + W} y1={midY + half} x2={x + W} y2={y + H} stroke={WALL} strokeWidth={2} />
        </>
      ) : (
        <line x1={x + W} y1={y} x2={x + W} y2={y + H} stroke={WALL} strokeWidth={2} />
      )}
      {/* bottom wall (with or without door gap) */}
      {doorDown ? (
        <>
          <line x1={x} y1={y + H} x2={midX - half} y2={y + H} stroke={WALL} strokeWidth={2} />
          <line x1={midX + half} y1={y + H} x2={x + W} y2={y + H} stroke={WALL} strokeWidth={2} />
        </>
      ) : (
        <line x1={x} y1={y + H} x2={x + W} y2={y + H} stroke={WALL} strokeWidth={2} />
      )}
    </g>
  )
}

/** A small directional arrow (IN or OUT) on the floor border. */
function BorderArrow({
  x,
  y,
  dir,
  label,
}: {
  x: number
  y: number
  dir: 'right' | 'left'
  label: string
}) {
  const len = 18
  const head = 7
  // Arrow tip at (x,y), pointing in dir
  const dx = dir === 'right' ? 1 : -1
  const tx = x
  const ty = y
  const sx = tx - dx * len
  const ux = dx
  const uy = 0
  const baseX = tx - ux * head
  const baseY = ty - uy * head
  const px = -uy
  const py = ux
  return (
    <g>
      <line x1={sx} y1={ty} x2={baseX} y2={baseY} stroke={ACCENT} strokeWidth={2.5} strokeLinecap="round" />
      <polygon
        points={`${tx},${ty} ${baseX + px * head * 0.6},${baseY + py * head * 0.6} ${baseX - px * head * 0.6},${baseY - py * head * 0.6}`}
        fill={ACCENT}
      />
      <text
        x={sx - dx * 4}
        y={ty + 1}
        textAnchor={dir === 'right' ? 'end' : 'start'}
        dominantBaseline="central"
        fontSize={9}
        fontWeight="bold"
        fill={ACCENT}
      >
        {label}
      </text>
    </g>
  )
}

/** Staircase symbol (double up-arrow or down-arrow text) centred in a room. */
function StairsGlyph({ col, row, ox, oy, dir }: { col: number; row: number; ox: number; oy: number; dir: 'up' | 'down' }) {
  const cx2 = rcx(col, ox)
  const cy2 = rcy(row, oy)
  return (
    <text
      x={cx2}
      y={cy2 + 1}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={20}
      fill={ACCENT}
      fontWeight="bold"
    >
      {dir === 'up' ? '⇑' : '⇓'}
    </text>
  )
}

/** A sticker glyph (emoji) centred in a room. */
function Sticker({ col, row, ox, oy, glyph }: { col: number; row: number; ox: number; oy: number; glyph: string }) {
  return (
    <text
      x={rcx(col, ox)}
      y={rcy(row, oy) + 1}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={22}
    >
      {glyph}
    </text>
  )
}

/** One complete floor plan (3×2 grid). */
function FloorPlan({
  ox,
  oy,
  label,
  children,
}: {
  ox: number
  oy: number
  label: string
  children: React.ReactNode
}) {
  return (
    <g>
      {/* Floor label */}
      <text
        x={ox + FLOOR_W / 2}
        y={oy - 4}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize={10}
        fontWeight="bold"
        fill={LABEL_COLOR}
      >
        {label}
      </text>
      {children}
    </g>
  )
}

// ------------------------------------------- Door connectivity description ---
//
// Floor 1: Sam walks from entrance (r0c0) rightward along row 0.
//   doors: r0c0 right→r0c1, r0c1 right→r0c2 (frog room)
//   stairs: r1c0 connects up to Floor 2
//   also: r0c0 down→r1c0 (to reach stairs), r1c0 right→r1c1, r1c1 right→r1c2 (exit)
//
// Floor 2: Sam arrives r1c0 stairs, goes right across row 0.
//   doors: r0c0 right→r0c1 (shark), r0c0 connects down from r1c0
//   also: r1c0 right→r1c1 connects to row 0

// ----------------------------------------------------------------- Maze20PE --

export interface Maze20PEProps {
  /**
   * Optional: highlight a segment of the path. Encoded as "floor:r,c" pairs
   * joined by "-", e.g. "1:0,0-1:0,1-2:1,0-2:0,1-2:0,0-1:0,2".
   * The stem leaves this null; the explainer passes it.
   */
  litPath?: string | null
}

const TRAIL = '#F59E0B'

/**
 * Shared primitive: two-storey maze in flat 2-D schematic. Used by both the
 * stem illustration (no litPath) and the explainer (with litPath).
 */
export function Maze20PE({ litPath = null }: Maze20PEProps) {
  // Decode lit path to pixel polyline points
  const trailPoints = (() => {
    if (!litPath) return null
    // Format: "floor:row,col-floor:row,col-..."
    const segs = litPath.split('-').map((tok) => {
      const m = /^([12]):(\d),(\d)$/.exec(tok)
      if (!m) return null
      const floor = Number(m[1])
      const row = Number(m[2])
      const col = Number(m[3])
      const ox = floor === 1 ? F1_X : F2_X
      const oy = floor === 1 ? F1_Y : F2_Y
      return `${rcx(col, ox)},${rcy(row, oy)}`
    })
    if (segs.some((s) => s === null)) return null
    return (segs as string[]).join(' ')
  })()

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width={Math.min(380, VIEW_W)}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {/* ---- Floor 1 ---- */}
      <FloorPlan ox={F1_X} oy={F1_Y} label="Lantai 1 / Floor 1">
        {/* Row 0 rooms */}
        <Room col={0} row={0} ox={F1_X} oy={F1_Y} doorRight doorDown />
        <Room col={1} row={0} ox={F1_X} oy={F1_Y} doorRight />
        <Room col={2} row={0} ox={F1_X} oy={F1_Y} />
        {/* Row 1 rooms */}
        <Room col={0} row={1} ox={F1_X} oy={F1_Y} doorRight />
        <Room col={1} row={1} ox={F1_X} oy={F1_Y} doorRight />
        <Room col={2} row={1} ox={F1_X} oy={F1_Y} />

        {/* Entrance arrow — comes in from left of room (0,0) */}
        <BorderArrow
          x={F1_X}
          y={rcy(0, F1_Y)}
          dir="right"
          label="IN"
        />

        {/* Exit arrow — goes out right of room (1,2) */}
        <BorderArrow
          x={F1_X + FLOOR_W}
          y={rcy(1, F1_Y)}
          dir="right"
          label="OUT"
        />

        {/* Frog sticker in Floor 1 row 0, col 2 */}
        <Sticker col={2} row={0} ox={F1_X} oy={F1_Y} glyph="🐸" />

        {/* Stairs up in Floor 1 row 1, col 0 */}
        <StairsGlyph col={0} row={1} ox={F1_X} oy={F1_Y} dir="up" />
      </FloorPlan>

      {/* ---- Floor 2 ---- */}
      <FloorPlan ox={F2_X} oy={F2_Y} label="Lantai 2 / Floor 2">
        {/* Row 0 rooms */}
        <Room col={0} row={0} ox={F2_X} oy={F2_Y} doorRight doorDown />
        <Room col={1} row={0} ox={F2_X} oy={F2_Y} />
        <Room col={2} row={0} ox={F2_X} oy={F2_Y} />
        {/* Row 1 rooms */}
        <Room col={0} row={1} ox={F2_X} oy={F2_Y} doorRight />
        <Room col={1} row={1} ox={F2_X} oy={F2_Y} />
        <Room col={2} row={1} ox={F2_X} oy={F2_Y} />

        {/* Boar sticker in Floor 2 row 0, col 0 */}
        <Sticker col={0} row={0} ox={F2_X} oy={F2_Y} glyph="🐗" />

        {/* Shark sticker in Floor 2 row 0, col 1 */}
        <Sticker col={1} row={0} ox={F2_X} oy={F2_Y} glyph="🦈" />

        {/* Stairs down in Floor 2 row 1, col 0 */}
        <StairsGlyph col={0} row={1} ox={F2_X} oy={F2_Y} dir="down" />
      </FloorPlan>

      {/* ---- Lit path (explainer only) ---- */}
      {trailPoints && (
        <polyline
          points={trailPoints}
          fill="none"
          stroke={TRAIL}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.85}
        />
      )}
    </svg>
  )
}

// --------------------------------------------------------- Maze20PEOption ----

/**
 * Renders a single answer choice for IKMC-23-PE-Q20 as a row of 3 animal
 * glyphs (the encounter order). Used as the CHOICE_RENDERERS entry.
 *
 * The mapping from label → order is fixed by the source paper:
 *   A: frog → boar → shark   (🐸 🐗 🦈)
 *   B: shark → boar → frog   (🦈 🐗 🐸)  ← correct
 *   C: boar → shark → frog   (🐗 🦈 🐸)
 *   D: boar → frog → shark   (🐗 🐸 🦈)
 *   E: shark → frog → boar   (🦈 🐸 🐗)
 */
const OPTION_ORDER: Record<string, readonly string[]> = {
  A: ['🐸', '🐗', '🦈'],  // frog, boar, shark
  B: ['🦈', '🐗', '🐸'],  // shark, boar, frog
  C: ['🐗', '🦈', '🐸'],  // boar, shark, frog
  D: ['🐗', '🐸', '🦈'],  // boar, frog, shark
  E: ['🦈', '🐸', '🐗'],  // shark, frog, boar
}

const CIRCLE_R = 20
const OPT_CX = [28, 76, 124]  // circle centres
const OPT_W = 152
const OPT_H = 56

export function Maze20PEOption({ choice }: { choice: WmiChoice }) {
  const label = (choice.label ?? '').trim().toUpperCase()
  const glyphs = OPTION_ORDER[label]

  if (!glyphs) {
    // Fallback: render plain text
    return <span>{choice.text}</span>
  }

  const animalNames: Record<string, string> = {
    '🦈': 'hiu / shark',
    '🐗': 'babi hutan / boar',
    '🐸': 'katak / frog',
  }
  const ariaLabel = glyphs.map((g) => animalNames[g] ?? g).join(', ')

  return (
    <svg
      viewBox={`0 0 ${OPT_W} ${OPT_H}`}
      width={OPT_W}
      height={OPT_H}
      style={{ display: 'block' }}
      role="img"
      aria-label={ariaLabel}
    >
      {glyphs.map((glyph, i) => (
        <g key={i}>
          <circle
            cx={OPT_CX[i]}
            cy={OPT_H / 2}
            r={CIRCLE_R}
            fill={ROOM_FILL}
            stroke={WALL}
            strokeWidth={1.5}
          />
          <text
            x={OPT_CX[i]}
            y={OPT_H / 2 + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={22}
          >
            {glyph}
          </text>
        </g>
      ))}
      {/* Arrow separators */}
      {[48, 96].map((ax) => (
        <text
          key={ax}
          x={ax}
          y={OPT_H / 2 + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fill={ACCENT}
          fontWeight="bold"
        >
          {'→'}
        </text>
      ))}
    </svg>
  )
}

// --------------------------------------------------------- default export ----

/**
 * Stem illustration: bare maze (no path highlighted), wrapped in the standard
 * QUPU figure shell.
 */
export default function Maze20PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Labirin dua lantai: Sam masuk dari kiri atas Lantai 1 dan keluar di kanan bawah Lantai 1. Stiker katak ada di sudut kanan atas Lantai 1, stiker babi hutan di sudut kiri atas Lantai 2, stiker hiu di tengah atas Lantai 2. Tangga menghubungkan kiri bawah kedua lantai. Dalam urutan apa Sam menemukan stiker-stiker itu?"
    >
      <Maze20PE />
    </div>
  )
}
