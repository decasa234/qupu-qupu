// IKMC-22-PE-Q23 — "Kangy's car can only turn left. Which route can Kangy take?"
// Answer: A
//
// The five A–E route pictures ARE the answer choices. This file:
//   1. exports `RouteMap23PEOption` (named export) — renders one A/B/C/D/E route
//      as an SVG for use in CHOICE_RENDERERS['IKMC-22-PE-Q23'].
//   2. exports `default RouteMap23PEIllustration` — stem illustration showing the
//      left-turn-only constraint as a small annotated diagram.
//
// Route paths reconstructed faithfully from:
//   docs/reference/ocr-res/ikmc/contest/preecolier/2022.imgs/063.jpg (A top, D bottom)
//   docs/reference/ocr-res/ikmc/contest/preecolier/2022.imgs/064.jpg (B top, E bottom)
//   docs/reference/ocr-res/ikmc/contest/preecolier/2022.imgs/065.jpg (C)
//
// Left-turn rule (screen coordinates, Y increases downward):
//   A "left turn" = counterclockwise 90° rotation of the heading.
//   Valid next headings for each current heading:
//     going RIGHT (+x) → can only turn to UP (-y)
//     going UP   (-y) → can only turn to LEFT (-x)
//     going LEFT  (-x) → can only turn to DOWN (+y)
//     going DOWN  (+y) → can only turn to RIGHT (+x)
//
// Route A is the ONLY valid route — every corner is a CCW left turn.
// Routes B, C, D, E each contain at least one CW right turn and are eliminated.
//
// SSR-safe, no side effects, deterministic, no random/Date.

import type { WmiChoice } from '../../../../types/wmi'

// ── Grid constants ─────────────────────────────────────────────────────────────
/**
 * Pixels per grid unit in the option SVG. Each route is laid out on an integer
 * lattice; multiplying (col, row) by CELL gives SVG pixel coordinates.
 */
const CELL = 14
/** Padding around the route inside the option viewBox. */
const PAD = 10
/** viewBox side length: an 8×8 unit grid with padding on each side. */
const GRID_UNITS = 8
const VIEW = GRID_UNITS * CELL + 2 * PAD // 132

// ── Palette ───────────────────────────────────────────────────────────────────
const ROUTE_STROKE = '#1C1917' // dark ink — matches the thick pen in the source scan
const ROUTE_W      = 3.5       // stroke width
const DOT_R        = 4         // endpoint dot radius
const GRID_STROKE  = '#E5E7EB' // light grey grid (visual reference only)

// ── Helper ────────────────────────────────────────────────────────────────────
/** Convert a lattice (col, row) to an SVG pixel string "x,y". */
function px(col: number, row: number): string {
  return `${PAD + col * CELL},${PAD + row * CELL}`
}

/** Convert an array of [col, row] pairs to an SVG polyline points string. */
function pts(nodes: Array<[number, number]>): string {
  return nodes.map(([c, r]) => px(c, r)).join(' ')
}

// ── Route path definitions ────────────────────────────────────────────────────
// Each route is defined as an ordered sequence of (col, row) lattice nodes.
// Endpoints are listed first and last (they receive the filled dot markers).
//
// LEFT-TURN VERIFICATION for Route A (all transitions must be CCW):
//   (1,7)→(1,0): UP
//   (1,0)→(0,0): UP→LEFT ✓
//   (0,0)→(0,8): LEFT→DOWN ✓
//   (0,8)→(8,8): DOWN→RIGHT ✓
//   (8,8)→(8,0): RIGHT→UP ✓
//   (8,0)→(5,0): UP→LEFT ✓
//   (5,0)→(5,3): LEFT→DOWN ✓
//   (5,3)→(7,3): DOWN→RIGHT ✓  ← dot2
//   All turns: CCW only. Route A is valid.

/**
 * Route A — all left turns (the answer).
 *
 * Path: from dot (1,7) up the left wall of the left inner peninsula, across the
 * outer top (CCW), down the right outer wall, across the outer bottom, up the
 * right outer wall, then down into the right inner peninsula, ending at dot (7,3).
 * Every corner is a counterclockwise (left) turn.
 *
 * Faithful to 063.jpg top: large outer rectangle with two inner upward peninsulas;
 * dots at the bottom of each peninsula.
 */
export const PATH_A: Array<[number, number]> = [
  [1, 7], [1, 0], [0, 0], [0, 8], [8, 8], [8, 0], [5, 0], [5, 3], [7, 3],
]

/**
 * Route B — has right turns (eliminated).
 *
 * E-shape (backwards-F). Start dot at top-right, end dot at centre-right.
 * The horizontal shelves require RIGHT→DOWN transitions (right turns).
 *
 * Faithful to 064.jpg top.
 *
 * Right turn present at (2,4)→(2,2): heading LEFT then turning UP = RIGHT TURN.
 */
export const PATH_B: Array<[number, number]> = [
  [7, 0], [0, 0], [0, 7], [7, 7], [7, 5], [2, 5], [2, 3], [7, 3],
]

/**
 * Route C — has right turns (eliminated).
 *
 * Outer frame with one inner tall vertical strip (open at bottom). Start dot at
 * bottom-left, end dot at inside bottom of the inner strip.
 * The inner strip's right wall descends then the bottom segment goes LEFT, which
 * requires a DOWN→LEFT transition = RIGHT TURN.
 *
 * Faithful to 065.jpg.
 */
export const PATH_C: Array<[number, number]> = [
  [0, 8], [0, 0], [7, 0], [7, 8], [5, 8], [5, 3], [2, 3], [2, 8],
]

/**
 * Route D — has right turns (eliminated).
 *
 * Concentric clockwise spiral. The entire spiral is traversed with clockwise
 * (right) turns throughout.
 *
 * Faithful to 063.jpg bottom: start dot at bottom-left, endpoint inside the
 * centre of the spiral.
 */
export const PATH_D: Array<[number, number]> = [
  [0, 8], [0, 0], [8, 0], [8, 7], [1, 7], [1, 1], [7, 1], [7, 6],
  [2, 6], [2, 2], [6, 2], [6, 5], [3, 5],
]

/**
 * Route E — has right turns (eliminated).
 *
 * L + shelf shape. Start dot top-left, end dot top-right.
 * Going down the left side then RIGHT along the bottom then UP then LEFT creates
 * a RIGHT→DOWN transition (right turn).
 *
 * Faithful to 064.jpg bottom.
 */
export const PATH_E: Array<[number, number]> = [
  [0, 0], [0, 8], [7, 8], [7, 4], [3, 4], [3, 0],
]

// ── Lookup table ─────────────────────────────────────────────────────────────
const PATHS: Record<string, Array<[number, number]>> = {
  A: PATH_A,
  B: PATH_B,
  C: PATH_C,
  D: PATH_D,
  E: PATH_E,
}

// ── Grid background ───────────────────────────────────────────────────────────
function GridBg() {
  const lines: React.ReactNode[] = []
  for (let i = 0; i <= GRID_UNITS; i++) {
    const x = PAD + i * CELL
    const y = PAD + i * CELL
    lines.push(
      <line key={`v${i}`} x1={x} y1={PAD} x2={x} y2={PAD + GRID_UNITS * CELL}
        stroke={GRID_STROKE} strokeWidth={0.7} />,
      <line key={`h${i}`} x1={PAD} y1={y} x2={PAD + GRID_UNITS * CELL} y2={y}
        stroke={GRID_STROKE} strokeWidth={0.7} />,
    )
  }
  return <g>{lines}</g>
}

// ── Aria labels per option ────────────────────────────────────────────────────
const ARIA: Record<string, string> = {
  A: 'Rute A: persegi panjang luar besar dengan dua lorong dalam; semua belokan ke kiri (jawaban benar)',
  B: 'Rute B: bentuk E terbalik; mengandung belokan ke kanan',
  C: 'Rute C: bingkai luar dengan strip vertikal dalam; mengandung belokan ke kanan',
  D: 'Rute D: spiral searah jarum jam; mengandung belokan ke kanan',
  E: 'Rute E: bentuk L dengan rak; mengandung belokan ke kanan',
}

// ── Option renderer ───────────────────────────────────────────────────────────

/**
 * RouteMap23PEOption
 *
 * Renders one A–E route for IKMC-22-PE-Q23 as an SVG polyline on a grid.
 * Binds to `choice.label` so the drawn route can never drift from the source paper.
 *
 * Used as the CHOICE_RENDERERS entry for 'IKMC-22-PE-Q23'.
 */
export function RouteMap23PEOption({ choice }: { choice: WmiChoice }) {
  const label = (choice.label ?? '').trim().toUpperCase()
  const nodes = PATHS[label]

  if (!nodes || nodes.length === 0) return null

  const pathPoints = pts(nodes)
  const [startCol, startRow] = nodes[0]
  const [endCol, endRow] = nodes[nodes.length - 1]

  return (
    <div
      className="flex items-center justify-center"
      role="img"
      aria-label={ARIA[label] ?? `Rute ${label}`}
    >
      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        width={VIEW}
        height={VIEW}
        style={{ display: 'block' }}
      >
        {/* white background */}
        <rect x={0} y={0} width={VIEW} height={VIEW} fill="white" />

        {/* light grid for visual reference */}
        <GridBg />

        {/* route polyline */}
        <polyline
          points={pathPoints}
          fill="none"
          stroke={ROUTE_STROKE}
          strokeWidth={ROUTE_W}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* endpoint dots */}
        <circle cx={PAD + startCol * CELL} cy={PAD + startRow * CELL} r={DOT_R} fill={ROUTE_STROKE} />
        <circle cx={PAD + endCol * CELL} cy={PAD + endRow * CELL} r={DOT_R} fill={ROUTE_STROKE} />
      </svg>
    </div>
  )
}

// ── Stem illustration ─────────────────────────────────────────────────────────

/**
 * RouteMap23PEIllustration
 *
 * Stem diagram for IKMC-22-PE-Q23.
 *
 * The question asks which route a car can take when it can ONLY turn left
 * (never right). The stem shows two annotated road corners:
 *   • A left turn (CCW) labelled with a check mark — allowed.
 *   • A right turn (CW) labelled with an X — forbidden.
 *
 * This visual anchors the constraint before the student examines the five
 * route choices.
 */
export default function RouteMap23PEIllustration() {
  // Stem viewBox: 200 wide × 90 tall, two side-by-side corner diagrams.
  const STEM_W = 200
  const STEM_H = 90

  // Green (allowed) and red (forbidden) palette.
  const GREEN   = '#16A34A'
  const GREEN_BG= '#DCFCE7'
  const RED     = '#DC2626'
  const RED_BG  = '#FEE2E2'
  const INK     = '#1C1917'
  const ROAD_W  = 4

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Diagram aturan belok: panah melengkung ke kiri ditandai boleh (centang hijau); panah melengkung ke kanan ditandai tidak boleh (silang merah)"
    >
      <svg
        viewBox={`0 0 ${STEM_W} ${STEM_H}`}
        width={Math.min(280, STEM_W * 1.4)}
        style={{ display: 'block' }}
      >
        {/* ── LEFT TURN (allowed) — left panel ─────────────────────────────── */}
        {/* Background pill */}
        <rect x={4} y={4} width={90} height={82} rx={8} ry={8} fill={GREEN_BG} />

        {/* L-shaped road corner: going RIGHT then turning UP (CCW = left turn) */}
        {/* Horizontal segment */}
        <line x1={14} y1={56} x2={60} y2={56}
          stroke={INK} strokeWidth={ROAD_W} strokeLinecap="round" />
        {/* Vertical segment (going UP) */}
        <line x1={60} y1={56} x2={60} y2={18}
          stroke={INK} strokeWidth={ROAD_W} strokeLinecap="round" />
        {/* Arrow head at the top (pointing UP) */}
        <polygon points="60,12 55,22 65,22" fill={GREEN} />

        {/* Curved arrow at corner indicating LEFT turn direction */}
        <path
          d="M 46,56 A 14,14 0 0 0 60,42"
          fill="none"
          stroke={GREEN}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        {/* Arrowhead on the curve */}
        <polygon points="60,42 54,46 56,38" fill={GREEN} />

        {/* Label */}
        <text x={49} y={80} textAnchor="middle" fontFamily="system-ui,sans-serif"
          fontSize={11} fontWeight="700" fill={GREEN}>
          Boleh
        </text>
        {/* Checkmark icon */}
        <text x={90} y={20} textAnchor="end" fontFamily="system-ui,sans-serif"
          fontSize={18} fontWeight="900" fill={GREEN}>
          ✓
        </text>

        {/* ── RIGHT TURN (forbidden) — right panel ─────────────────────────── */}
        {/* Background pill */}
        <rect x={106} y={4} width={90} height={82} rx={8} ry={8} fill={RED_BG} />

        {/* L-shaped road corner: going RIGHT then turning DOWN (CW = right turn) */}
        {/* Horizontal segment */}
        <line x1={116} y1={30} x2={162} y2={30}
          stroke={INK} strokeWidth={ROAD_W} strokeLinecap="round" />
        {/* Vertical segment (going DOWN) */}
        <line x1={162} y1={30} x2={162} y2={68}
          stroke={INK} strokeWidth={ROAD_W} strokeLinecap="round" />
        {/* Arrow head at the bottom (pointing DOWN) */}
        <polygon points="162,74 157,64 167,64" fill={RED} />

        {/* Curved arrow at corner indicating RIGHT turn direction */}
        <path
          d="M 148,30 A 14,14 0 0 1 162,44"
          fill="none"
          stroke={RED}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        {/* Arrowhead on the curve */}
        <polygon points="162,44 156,40 158,48" fill={RED} />

        {/* Cross (X) over the right-turn panel */}
        <line x1={178} y1={10} x2={192} y2={24} stroke={RED} strokeWidth={3} strokeLinecap="round" />
        <line x1={192} y1={10} x2={178} y2={24} stroke={RED} strokeWidth={3} strokeLinecap="round" />

        {/* Label */}
        <text x={151} y={80} textAnchor="middle" fontFamily="system-ui,sans-serif"
          fontSize={11} fontWeight="700" fill={RED}>
          Tidak boleh
        </text>
      </svg>
    </div>
  )
}
