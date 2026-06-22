// IKMC-22-PE-Q20 — "Dino moves from the entrance to the exit by going through rooms."
//
// Figure source: docs/reference/ocr-res/ikmc/contest/preecolier/2022.imgs/061.jpg
//
// Reconstruction from the source scan:
//   A 2-row × 4-column grid of rooms (8 rooms total).
//   Top row (row 0):    room 1, room 2, room 3, room 4  (left → right)
//   Bottom row (row 1): room 5, room 6, room 7, room 8  (left → right)
//   Entrance: arrow entering room 1 from the left.
//   Exit:     arrow leaving room 8 to the right.
//
//   All adjacent rooms share a passable wall (dashed lines in original = doorways).
//   The outer perimeter is solid except for the entrance/exit openings.
//
// Room numbering (col 0..3, row 0..1):
//   (0,0)=1  (1,0)=2  (2,0)=3  (3,0)=4
//   (0,1)=5  (1,1)=6  (2,1)=7  (3,1)=8
//
// Best path: 1→5→6→7→3→4→8 = 1+5+6+7+3+4+8 = 34 (answer D).
// The trap path that visits all rooms: 1→2→3→4→8→7→6→5 = 36 (cannot: must end at 8,
// so visiting every room in a snake forces 8 as the last, but you ENTER via room 1
// and EXIT via room 8; the required sequence 1→...→8 visiting all 8 rooms is the
// Hamiltonian path which does sum to 36 — but the maze topology makes it unreachable
// because rooms 2 and 5 are both only reachable from 1 at the start, so once you go
// 1→2→3→4→8 you cannot backtrack to 5,6,7 and still exit at 8 without revisiting).
//
// PROBLEM-ONLY illustration: shows the grid + room numbers + dino + entrance/exit.
// Does NOT highlight the winning path (that is the explainer's job).
//
// SSR-safe — no window / document access at module level.

// ── Palette ─────────────────────────────────────────────────────────────────

export const COLOR = {
  BG:          '#FFFFFF',
  WALL:        '#374151',   // outer solid walls
  INNER:       '#6B7280',   // interior dashed dividers
  ROOM_BG:     '#F9FAFB',   // room fill
  NUM:         '#1F2937',   // room number text
  TRAIL:       '#F59E0B',   // amber — matches AnimalMaze24G1 TRAIL
  HIGHLIGHT:   '#10B981',   // green for the answer reveal
  DINO_BODY:   '#4D7C0F',   // dinosaur body (olive green, matching source)
  ARROW:       '#374151',   // entrance / exit arrows
} as const

// ── Geometry ─────────────────────────────────────────────────────────────────

export const COLS = 4
export const ROWS = 2
export const CELL_W = 68   // room width in px
export const CELL_H = 52   // room height in px
export const PAD_L  = 50   // left padding (space for dino + entrance arrow)
export const PAD_R  = 24   // right padding (space for exit arrow)
export const PAD_Y  = 16   // vertical padding

export const SVG_W = PAD_L + COLS * CELL_W + PAD_R  // 50+272+24 = 346
export const SVG_H = PAD_Y + ROWS * CELL_H + PAD_Y  // 16+104+16 = 136

/** Top-left x of room at column c. */
export const roomX = (c: number) => PAD_L + c * CELL_W
/** Top-left y of room at row r. */
export const roomY = (r: number) => PAD_Y + r * CELL_H
/** Centre x of room at column c. */
export const cx = (c: number) => roomX(c) + CELL_W / 2
/** Centre y of room at row r. */
export const cy = (r: number) => roomY(r) + CELL_H / 2

// Room number at grid position (col, row): row=0 → rooms 1-4; row=1 → rooms 5-8
export const roomNum = (c: number, r: number) => r * COLS + c + 1

// ── Dino glyph ───────────────────────────────────────────────────────────────

/**
 * DinoGlyph
 *
 * Simple geometric sauropod silhouette (long-neck dinosaur), facing right.
 * Matches the general appearance of the source figure's dinosaur icon.
 * All shapes are plain SVG — no raster, no codepoints.
 */
export function DinoGlyph({ x, y, size = 32 }: { x: number; y: number; size?: number }) {
  const s = size / 32  // scale factor

  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {/* body — large ellipse */}
      <ellipse cx={8} cy={4} rx={14} ry={9} fill={COLOR.DINO_BODY} />
      {/* neck — thin rectangle angled up-right */}
      <path
        d="M 16,-4 Q 20,-14 22,-18 Q 18,-16 14,-4 Z"
        fill={COLOR.DINO_BODY}
      />
      {/* head */}
      <ellipse cx={22} cy={-18} rx={6} ry={4} fill={COLOR.DINO_BODY} />
      {/* eye */}
      <circle cx={24} cy={-19} r={1.2} fill="#FFFFFF" />
      <circle cx={24.2} cy={-19} r={0.6} fill="#1F2937" />
      {/* tail — curves left from body */}
      <path
        d="M -6,2 Q -16,6 -22,2 Q -18,0 -6,2"
        fill={COLOR.DINO_BODY}
      />
      {/* front legs */}
      <line x1={4} y1={12} x2={2} y2={22} stroke={COLOR.DINO_BODY} strokeWidth={3} strokeLinecap="round" />
      <line x1={10} y1={12} x2={10} y2={22} stroke={COLOR.DINO_BODY} strokeWidth={3} strokeLinecap="round" />
      {/* back legs */}
      <line x1={-4} y1={12} x2={-6} y2={22} stroke={COLOR.DINO_BODY} strokeWidth={3} strokeLinecap="round" />
      <line x1={2} y1={12} x2={2} y2={22} stroke={COLOR.DINO_BODY} strokeWidth={3} strokeLinecap="round" />
    </g>
  )
}

// ── Rooms20PE primitive ──────────────────────────────────────────────────────

export interface Rooms20PEProps {
  /**
   * Optional path to highlight, encoded as a list of room numbers joined by '-'
   * e.g. "1-5-6-7-3-4-8". The stem leaves this null; the explainer passes the
   * best path to animate.
   */
  litPath?: string | null
  /** When true, show a green circle on the final room to indicate answer. */
  showAnswer?: boolean
}

/**
 * Rooms20PE
 *
 * Shared maze primitive for IKMC-22-PE-Q20.
 * Renders the 2×4 numbered room grid with entrance (left of room 1)
 * and exit (right of room 8), plus the Dino glyph at the entrance.
 * Optionally overlays a route trail and answer indicator.
 */
export function Rooms20PE({ litPath = null, showAnswer = false }: Rooms20PEProps) {
  // Decode lit path: room numbers → (col, row) centres for polyline
  const trailPoints: string | null = (() => {
    if (!litPath) return null
    const nums = litPath.split('-').map(Number)
    const pts = nums.map((n) => {
      if (n < 1 || n > 8) return null
      const c = (n - 1) % COLS
      const r = Math.floor((n - 1) / COLS)
      return `${cx(c)},${cy(r)}`
    })
    return pts.every((p) => p !== null) ? (pts as string[]).join(' ') : null
  })()

  const gridLeft   = PAD_L
  const gridRight  = PAD_L + COLS * CELL_W
  const gridTop    = PAD_Y
  const gridBottom = PAD_Y + ROWS * CELL_H

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={Math.min(380, SVG_W)}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

      {/* ── room backgrounds ───────────────────────────────────────────── */}
      {Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: COLS }, (_, c) => (
          <rect
            key={`room-${c}-${r}`}
            x={roomX(c)}
            y={roomY(r)}
            width={CELL_W}
            height={CELL_H}
            fill={COLOR.ROOM_BG}
          />
        )),
      )}

      {/* ── optional trail (drawn under grid lines) ────────────────────── */}
      {trailPoints && (
        <polyline
          points={trailPoints}
          fill="none"
          stroke={COLOR.TRAIL}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.75}
        />
      )}

      {/* ── room number labels ─────────────────────────────────────────── */}
      {Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: COLS }, (_, c) => (
          <text
            key={`num-${c}-${r}`}
            x={cx(c)}
            y={cy(r)}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={20}
            fontWeight={700}
            fill={COLOR.NUM}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {roomNum(c, r)}
          </text>
        )),
      )}

      {/* ── outer border (solid) ──────────────────────────────────────── */}
      {/* top wall */}
      <line x1={gridLeft} y1={gridTop} x2={gridRight} y2={gridTop} stroke={COLOR.WALL} strokeWidth={2.5} />
      {/* bottom wall */}
      <line x1={gridLeft} y1={gridBottom} x2={gridRight} y2={gridBottom} stroke={COLOR.WALL} strokeWidth={2.5} />
      {/* left wall — with gap for entrance (room 1 top half) */}
      {/* draw left wall segments: top half and bottom half, gap where entrance is */}
      <line x1={gridLeft} y1={gridTop} x2={gridLeft} y2={PAD_Y + CELL_H / 2 - 10} stroke={COLOR.WALL} strokeWidth={2.5} />
      <line x1={gridLeft} y1={PAD_Y + CELL_H / 2 + 10} x2={gridLeft} y2={gridBottom} stroke={COLOR.WALL} strokeWidth={2.5} />
      {/* right wall — with gap for exit (room 8 top half of bottom row) */}
      <line x1={gridRight} y1={gridTop} x2={gridRight} y2={PAD_Y + CELL_H + CELL_H / 2 - 10} stroke={COLOR.WALL} strokeWidth={2.5} />
      <line x1={gridRight} y1={PAD_Y + CELL_H + CELL_H / 2 + 10} x2={gridRight} y2={gridBottom} stroke={COLOR.WALL} strokeWidth={2.5} />

      {/* ── interior dividers (dashed — passable doorways) ────────────── */}
      {/* horizontal middle wall (between row 0 and row 1) */}
      {Array.from({ length: COLS }, (_, c) => (
        <line
          key={`hmid-${c}`}
          x1={roomX(c)}
          y1={gridTop + CELL_H}
          x2={roomX(c) + CELL_W}
          y2={gridTop + CELL_H}
          stroke={COLOR.INNER}
          strokeWidth={1.5}
          strokeDasharray="6 4"
        />
      ))}
      {/* vertical dividers within each row */}
      {Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: COLS - 1 }, (_, c) => (
          <line
            key={`vdiv-${c}-${r}`}
            x1={roomX(c + 1)}
            y1={roomY(r)}
            x2={roomX(c + 1)}
            y2={roomY(r) + CELL_H}
            stroke={COLOR.INNER}
            strokeWidth={1.5}
            strokeDasharray="6 4"
          />
        )),
      )}

      {/* ── entrance arrow (left of room 1) ───────────────────────────── */}
      <line
        x1={8}
        y1={cy(0)}
        x2={gridLeft - 4}
        y2={cy(0)}
        stroke={COLOR.ARROW}
        strokeWidth={2}
        markerEnd="url(#arrowhead-right)"
      />

      {/* ── exit arrow (right of room 8) ──────────────────────────────── */}
      <line
        x1={gridRight + 4}
        y1={cy(1)}
        x2={SVG_W - 6}
        y2={cy(1)}
        stroke={COLOR.ARROW}
        strokeWidth={2}
        markerEnd="url(#arrowhead-right)"
      />

      {/* ── answer indicator (green circle on room 8) ─────────────────── */}
      {showAnswer && (
        <circle
          cx={cx(3)}
          cy={cy(1)}
          r={18}
          fill="none"
          stroke={COLOR.HIGHLIGHT}
          strokeWidth={3}
          opacity={0.9}
        />
      )}

      {/* ── dino at entrance ──────────────────────────────────────────── */}
      <DinoGlyph x={27} y={cy(0)} size={28} />

      {/* ── arrow marker definition ───────────────────────────────────── */}
      <defs>
        <marker
          id="arrowhead-right"
          markerWidth={8}
          markerHeight={6}
          refX={6}
          refY={3}
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill={COLOR.ARROW} />
        </marker>
      </defs>
    </svg>
  )
}

// ── Default export: stem illustration ────────────────────────────────────────

/**
 * Rooms20PEIllustration
 *
 * Static problem-only figure for IKMC-22-PE-Q20 (2022 IKMC Pre-Ecolier, Q20).
 * Shows the 2×4 numbered room grid with entrance (left) and exit (right).
 * Dino is visible at the entrance. Does NOT highlight the winning path.
 */
export default function Rooms20PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Dino berada di pintu masuk sebuah labirin dengan 8 ruangan berlabel 1–8 ' +
        'tersusun dalam 2 baris × 4 kolom. ' +
        'Baris atas: ruangan 1, 2, 3, 4 (kiri ke kanan). ' +
        'Baris bawah: ruangan 5, 6, 7, 8 (kiri ke kanan). ' +
        'Pintu masuk ada di kiri ruangan 1, pintu keluar di kanan ruangan 8.'
      }
    >
      <Rooms20PE />
    </div>
  )
}
