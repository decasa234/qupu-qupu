// IKMC-23-EC-Q16 — Two-storey maze stem illustration + option renderer.
//
// Question: Sam walks through the two-storey maze from the entrance (ground floor,
// bottom-right) to the exit (ground floor, left). She passes 3 wall stickers.
// In what order will she see them?
//
// Maze layout (3 cols × 2 rows per floor):
//   Ground floor:
//     Row 0: [⇑ Left-Stair / OUT←  r0c0] [🐗 Boar  r0c1] [⇑ Right-Stair  r0c2]
//     Row 1: [r1c0]                        [r1c1]          [IN→  r1c2]
//
//   First floor:
//     Row 0: [⇓ Left-Stair / 🦈 Shark  ff_r0c0] [ff_r0c1] [⇓ Right-Stair / 🐸 Frog  ff_r0c2]
//     Row 1: [ff_r1c0]                            [ff_r1c1] [ff_r1c2]
//
//   Left section (ff_r0c0) and Right section (ff_r0c2) on the first floor are NOT
//   connected to each other — Sam must return to the ground floor between them.
//
// Correct path:
//   IN (ground r1c2) → ground r0c2 → RIGHT STAIR UP → ff_r0c2 (🐸 Frog!)
//   → DOWN via right stair → ground r0c2 → r0c1 (🐗 Boar!)
//   → r0c0 → LEFT STAIR UP → ff_r0c0 (🦈 Shark!)
//   → DOWN via left stair → ground r0c0 → OUT (←)
//
//   Order: 🐸 → 🐗 → 🦈   Answer A.
//
// Adapted from Maze20PEIllustration (same house style, same Room primitive).
// SVG-only, SSR-safe, no state.

import type { WmiChoice } from '../../../../types/wmi'

// ------------------------------------------------------------------ palette --

const WALL = '#6B7280'
const ROOM_FILL = '#F9FAFB'
const ACCENT = '#F59E0B'
const LABEL_COLOR = '#374151'
const DOOR_GAP = 16

// ------------------------------------------------------------------ layout ---

const CELL_W = 64
const CELL_H = 52
const COLS = 3
const ROWS = 2
const FLOOR_W = COLS * CELL_W
const FLOOR_H = ROWS * CELL_H
const GAP_X = 28
const PAD = 26
const LABEL_H = 16

const VIEW_W = (FLOOR_W + PAD) * 2 + GAP_X
const VIEW_H = FLOOR_H + PAD * 2 + LABEL_H

// Ground floor panel: left side
const GF_X = PAD
const GF_Y = PAD + LABEL_H

// First floor panel: right side
const FF_X = PAD + FLOOR_W + GAP_X
const FF_Y = PAD + LABEL_H

// ----------------------------------------------------------------- helpers ---

const rx = (col: number, ox: number) => ox + col * CELL_W
const ry = (row: number, oy: number) => oy + row * CELL_H
const rcx = (col: number, ox: number) => rx(col, ox) + CELL_W / 2
const rcy = (row: number, oy: number) => ry(row, oy) + CELL_H / 2

// ---------------------------------------------------------------- sub-parts --

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
  const midX = x + W / 2
  const midY = y + H / 2

  return (
    <g>
      <rect x={x} y={y} width={W} height={H} fill={ROOM_FILL} />
      <line x1={x} y1={y} x2={x + W} y2={y} stroke={WALL} strokeWidth={2} />
      <line x1={x} y1={y} x2={x} y2={y + H} stroke={WALL} strokeWidth={2} />
      {doorRight ? (
        <>
          <line x1={x + W} y1={y} x2={x + W} y2={midY - half} stroke={WALL} strokeWidth={2} />
          <line x1={x + W} y1={midY + half} x2={x + W} y2={y + H} stroke={WALL} strokeWidth={2} />
        </>
      ) : (
        <line x1={x + W} y1={y} x2={x + W} y2={y + H} stroke={WALL} strokeWidth={2} />
      )}
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
      <line
        x1={sx}
        y1={ty}
        x2={baseX}
        y2={baseY}
        stroke={ACCENT}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
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

function StairsGlyph({
  col,
  row,
  ox,
  oy,
  dir,
}: {
  col: number
  row: number
  ox: number
  oy: number
  dir: 'up' | 'down'
}) {
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

function Sticker({
  col,
  row,
  ox,
  oy,
  glyph,
}: {
  col: number
  row: number
  ox: number
  oy: number
  glyph: string
}) {
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

// ---------------------------------------------------------------- Maze16EC ---
//
// Ground floor door layout:
//   r1c2 → doorDown connects r0c2 (Sam walks north from IN to right stair)
//   r0c2 → doorRight NO (right boundary has stair, no door right)
//   r0c2 → r0c1: door (Sam walks from right stair to Boar room)
//   r0c1 → r0c0: door (Sam walks from Boar to left stair / OUT)
//   r0c0: OUT exits left
//
// First floor door layout:
//   ff_r0c2: right stair entry — no horizontal doors (isolated right pocket)
//   ff_r0c0: left stair entry — no horizontal doors (isolated left pocket)

export interface Maze16ECProps {
  /**
   * Optional lit path for the explainer. Encoded as "floor:r,c" tokens joined
   * by "-", where floor=1 is ground and floor=2 is first (upper) floor.
   */
  litPath?: string | null
}

const TRAIL = '#F59E0B'

export function Maze16EC({ litPath = null }: Maze16ECProps) {
  const trailPoints = (() => {
    if (!litPath) return null
    const segs = litPath.split('-').map((tok) => {
      const m = /^([12]):(\d),(\d)$/.exec(tok)
      if (!m) return null
      const floor = Number(m[1])
      const row = Number(m[2])
      const col = Number(m[3])
      const ox = floor === 1 ? GF_X : FF_X
      const oy = floor === 1 ? GF_Y : FF_Y
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
      {/* ---- Ground floor ---- */}
      <FloorPlan ox={GF_X} oy={GF_Y} label="Lantai Dasar / Ground Floor">
        {/* Row 0: left-stair(r0c0) | Boar(r0c1) | right-stair(r0c2) */}
        {/* r0c0 has door-right to r0c1 */}
        <Room col={0} row={0} ox={GF_X} oy={GF_Y} doorRight />
        {/* r0c1 has door-right to r0c2 */}
        <Room col={1} row={0} ox={GF_X} oy={GF_Y} doorRight />
        {/* r0c2: right-stair — doorDown to r1c2 */}
        <Room col={2} row={0} ox={GF_X} oy={GF_Y} doorDown />
        {/* Row 1: plain rooms */}
        <Room col={0} row={1} ox={GF_X} oy={GF_Y} />
        <Room col={1} row={1} ox={GF_X} oy={GF_Y} />
        {/* r1c2: IN — doorDown already handled by r0c2; no door right (entrance from border) */}
        <Room col={2} row={1} ox={GF_X} oy={GF_Y} />

        {/* OUT arrow at left of r0c0 */}
        <BorderArrow x={GF_X} y={rcy(0, GF_Y)} dir="left" label="OUT" />

        {/* IN arrow at right of r1c2 */}
        <BorderArrow x={GF_X + FLOOR_W} y={rcy(1, GF_Y)} dir="left" label="IN" />

        {/* Left stair (⇑) at r0c0 */}
        <StairsGlyph col={0} row={0} ox={GF_X} oy={GF_Y} dir="up" />

        {/* Boar sticker at r0c1 */}
        <Sticker col={1} row={0} ox={GF_X} oy={GF_Y} glyph="🐗" />

        {/* Right stair (⇑) at r0c2 */}
        <StairsGlyph col={2} row={0} ox={GF_X} oy={GF_Y} dir="up" />
      </FloorPlan>

      {/* ---- First floor ---- */}
      <FloorPlan ox={FF_X} oy={FF_Y} label="Lantai Satu / First Floor">
        {/* Row 0: left-pocket with Shark (r0c0) | middle (r0c1) | right-pocket with Frog (r0c2) */}
        {/* r0c0 and r0c2 are isolated pockets — no horizontal doors between them */}
        <Room col={0} row={0} ox={FF_X} oy={FF_Y} />
        <Room col={1} row={0} ox={FF_X} oy={FF_Y} />
        <Room col={2} row={0} ox={FF_X} oy={FF_Y} />
        {/* Row 1: plain rooms */}
        <Room col={0} row={1} ox={FF_X} oy={FF_Y} />
        <Room col={1} row={1} ox={FF_X} oy={FF_Y} />
        <Room col={2} row={1} ox={FF_X} oy={FF_Y} />

        {/* Left stair (⇓) at ff_r0c0 — also has Shark */}
        <StairsGlyph col={0} row={0} ox={FF_X} oy={FF_Y} dir="down" />
        {/* Shark sticker offset slightly so both glyph and stair are readable */}
        <text
          x={rcx(0, FF_X)}
          y={rcy(0, FF_Y) + 14}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={16}
        >
          🦈
        </text>

        {/* Right stair (⇓) at ff_r0c2 — also has Frog */}
        <StairsGlyph col={2} row={0} ox={FF_X} oy={FF_Y} dir="down" />
        <text
          x={rcx(2, FF_X)}
          y={rcy(0, FF_Y) + 14}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={16}
        >
          🐸
        </text>
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

// --------------------------------------------------------- Maze16ECOption ----

/**
 * Renders one answer choice for IKMC-23-EC-Q16 as a row of 3 animal glyphs
 * (encounter order). Used as the CHOICE_RENDERERS entry.
 *
 * Mapping from label → sticker order (from seed):
 *   A: frog → boar → shark  (🐸 🐗 🦈)  ← correct
 *   B: shark → boar → frog  (🦈 🐗 🐸)
 *   C: boar → shark → frog  (🐗 🦈 🐸)
 *   D: boar → frog → shark  (🐗 🐸 🦈)
 *   E: frog → shark → boar  (🐸 🦈 🐗)
 */
const OPTION_ORDER_16EC: Record<string, readonly string[]> = {
  A: ['🐸', '🐗', '🦈'],
  B: ['🦈', '🐗', '🐸'],
  C: ['🐗', '🦈', '🐸'],
  D: ['🐗', '🐸', '🦈'],
  E: ['🐸', '🦈', '🐗'],
}

const CIRCLE_R = 20
const OPT_CX = [28, 76, 124]
const OPT_W = 152
const OPT_H = 56

export function Maze16ECOption({ choice }: { choice: WmiChoice }) {
  const label = (choice.label ?? '').trim().toUpperCase()
  const glyphs = OPTION_ORDER_16EC[label]

  if (!glyphs) {
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
 * Stem illustration: bare maze (no path highlighted).
 */
export default function Maze16ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Labirin dua lantai: Sam masuk dari kanan bawah Lantai Dasar. Di Lantai Dasar ada stiker babi hutan di tengah dan dua tangga (kiri dan kanan) ke Lantai Satu. Di Lantai Satu, tangga kanan menuju stiker katak dan tangga kiri menuju stiker hiu. Keluar dari kiri atas Lantai Dasar. Dalam urutan apa Sam menemukan stiker-stiker itu?"
    >
      <Maze16EC />
    </div>
  )
}
