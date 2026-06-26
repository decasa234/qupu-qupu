// OSN-25-SD-NAS-SEMIFINAL-Q5 — safe-lock button grid illustration.
//
// STEM: a 2×4 keypad of buttons on a safe door. No buttons pressed.
// The problem asks how many ways to press exactly 4 buttons so each
// row and each column has an odd number of pressed buttons.
//
// Reuses: GridBoard primitive for the 2×4 button grid.
// Co-exports SafeButtonPanel so the explainer can show pressed states.
//
// SSR-safe: no hooks, no framer-motion, no Math.random.

import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'

// ── layout constants ──────────────────────────────────────────────────────────

const ROWS = 2
const COLS = 4
const CELL = 54

const GRID_W = COLS * CELL   // 216
const GRID_H = ROWS * CELL   // 108

// Panel padding around the grid (inside the safe-door background)
const PX = 18
const PY = 16

const PANEL_W = GRID_W + PX * 2   // 252
const PANEL_H = GRID_H + PY * 2   // 140

// SVG canvas (extra space for row-count badges in the explainer)
const SVG_W = PANEL_W + 72        // 324 — right margin for row badges
const SVG_H = PANEL_H + 28        // 168 — bottom margin for caption

// Grid top-left inside SVG
const GX = PX        // 18
const GY = PY        // 16

// ── colour tokens ─────────────────────────────────────────────────────────────

const COL_PANEL_BG  = '#D1D5DB'   // gray-300 — button panel surface
const COL_PANEL_BD  = '#9CA3AF'   // gray-400
const COL_BTN_NORM  = '#F3F4F6'   // gray-100 — unpressed button face
const COL_BTN_PRESS = '#A7F3D0'   // emerald-200 — pressed button face

// ── SafeButtonPanel — shared by illustration + explainer ──────────────────────

export interface SafeButtonPanelProps {
  /**
   * Which buttons are currently "pressed" (highlighted green).
   * Each entry is [row, col] with row 0 = top row, col 0 = leftmost.
   */
  pressed?: readonly [number, number][]
  /**
   * When true, render row-count badges (e.g. "1 ganjil ✓") to the right
   * of the grid. Used by the explainer; omitted in the stem illustration.
   */
  showRowBadges?: boolean
  lang?: 'en' | 'id'
}

export function SafeButtonPanel({
  pressed = [],
  showRowBadges = false,
  lang = 'id',
}: SafeButtonPanelProps) {
  const pressedSet = new Set(pressed.map(([r, c]) => `${r},${c}`))

  // Per-row pressed count for row badges
  const rowCounts = [0, 1].map((r) =>
    [0, 1, 2, 3].filter((c) => pressedSet.has(`${r},${c}`)).length,
  )

  const gridVb = gridBoardViewBox(ROWS, COLS, CELL)
  void gridVb  // used only for docs; viewBox is set on the <svg> element

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── button panel background ── */}
      <rect
        x={0} y={0}
        width={PANEL_W} height={PANEL_H}
        rx={10}
        fill={COL_PANEL_BG} stroke={COL_PANEL_BD} strokeWidth={2}
      />

      {/* ── GridBoard (cell fills + gridlines) ── */}
      <g transform={`translate(${GX}, ${GY})`}>
        <GridBoard
          rows={ROWS}
          cols={COLS}
          cellSize={CELL}
          fill={(r, c) =>
            pressedSet.has(`${r},${c}`) ? COL_BTN_PRESS : COL_BTN_NORM
          }
          highlight={(r, c) =>
            pressedSet.has(`${r},${c}`) ? 'green' : 'none'
          }
          gridStroke={COL_PANEL_BD}
        />
      </g>

      {/* ── button circle glyphs (drawn on top of GridBoard cells) ── */}
      {[0, 1].flatMap((r) =>
        [0, 1, 2, 3].map((c) => {
          const cx = GX + c * CELL + CELL / 2
          const cy = GY + r * CELL + CELL / 2
          const isPressed = pressedSet.has(`${r},${c}`)
          return (
            <circle
              key={`btn-${r}-${c}`}
              cx={cx} cy={cy}
              r={CELL * 0.3}
              fill={isPressed ? '#059669' : '#9CA3AF'}
              opacity={isPressed ? 0.9 : 0.5}
            />
          )
        }),
      )}

      {/* ── row count badges (shown in explainer) ── */}
      {showRowBadges &&
        [0, 1].map((r) => {
          const count = rowCounts[r]
          const isOdd = count % 2 === 1
          const badgeX = PANEL_W + 8
          const badgeY = GY + r * CELL + CELL / 2
          const badgeFill = pressed.length === 0
            ? '#F3F4F6'
            : isOdd ? '#D1FAE5' : '#FEE2E2'
          const badgeBorder = pressed.length === 0
            ? '#D1D5DB'
            : isOdd ? '#10B981' : '#EF4444'
          const textFill = pressed.length === 0
            ? '#9CA3AF'
            : isOdd ? '#065F46' : '#B91C1C'
          const label = pressed.length === 0
            ? '—'
            : `${count} ${isOdd ? (lang === 'id' ? 'ganjil ✓' : 'odd ✓') : (lang === 'id' ? 'genap ✗' : 'even ✗')}`
          return (
            <g key={`badge-${r}`}>
              <rect
                x={badgeX} y={badgeY - 14}
                width={62} height={28}
                rx={6}
                fill={badgeFill} stroke={badgeBorder} strokeWidth={1.5}
              />
              <text
                x={badgeX + 31} y={badgeY}
                textAnchor="middle" dominantBaseline="central"
                fontSize={10} fontWeight={700}
                fill={textFill}
                fontFamily="system-ui, sans-serif"
              >
                {label}
              </text>
            </g>
          )
        })}

      {/* ── caption ── */}
      <text
        x={PANEL_W / 2} y={PANEL_H + 17}
        textAnchor="middle"
        fontSize={11} fontWeight={600} fill="#6B7280"
        fontFamily="system-ui, sans-serif"
      >
        {t('Button pad 2 rows × 4 columns', 'Papan tombol 2 baris × 4 kolom')}
      </text>
    </svg>
  )
}

// ── default export: static stem illustration ─────────────────────────────────

export default function SafeButtonsOSN25NSFQ5Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Papan tombol lemari besi dengan 2 baris dan 4 kolom tombol."
    >
      <SafeButtonPanel />
    </div>
  )
}
