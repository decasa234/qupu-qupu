// IKMC-21-PE-Q6 — "Four identical pieces of paper are placed as shown.
// Michael wants to punch a hole that goes through all four pieces. At which
// point should Michael punch the hole?"
// Answer: D.
//
// Stem illustration: four identical light-blue rectangles placed in a 2×2
// step/offset arrangement (each sheet shifted right and down relative to the
// previous). Five labelled points A–E are marked where the figure shows them.
// Only point D lies in the region covered by all four sheets simultaneously.
//
// Reading from 2021.imgs/013.jpg:
//   Sheet 1 (back-left)   — top-left
//   Sheet 2 (back-right)  — top-right, shifted ~right
//   Sheet 3 (front-left)  — middle, shifted ~down
//   Sheet 4 (front-right) — bottom-right, shifted right+down
//
// Points (approx. centres of labelled dots in the original):
//   A — top-left area of the arrangement, on only the back sheets
//   B — top-right area, on only the back sheets
//   C — bottom-left area, on only the front sheets
//   D — center of the staircase overlap — covered by ALL four sheets (answer)
//   E — bottom-center, on only some sheets
//
// Co-exports:
//   PaperPunch6PE          — shared primitive used by the explainer
//   SHEET_DEFS             — the four {x, y, w, h} rectangles in the viewBox
//   POINT_DEFS             — the five {label, cx, cy, coveredBy} entries
//   VIEW_W / VIEW_H        — viewBox dimensions
//
// Pure render, SSR-safe, deterministic — no random / Date / side-effects.

// ── viewBox ──────────────────────────────────────────────────────────────────
export const VIEW_W = 240
export const VIEW_H = 200

// ── palette ───────────────────────────────────────────────────────────────────
const SHEET_FILL   = '#87CEEB'   // light sky-blue, matching the OCR image
const SHEET_STROKE = '#2F6EA0'   // darker blue outline
const POINT_DOT_R  = 5           // dot radius
const DOT_FILL     = '#1F2937'
const DOT_STROKE   = '#FFFFFF'
const LABEL_INK    = '#1F2937'
const HIGHLIGHT_RING_R = 8       // highlight ring radius

// ── sheet layout ──────────────────────────────────────────────────────────────
// Four 100×75 sheets arranged in a staircase pattern, each shifted +30 right
// and +25 down from the previous. This creates a central 4-sheet overlap region.
const W  = 100   // sheet width
const H  = 75    // sheet height
const DX = 30    // horizontal step between sheets
const DY = 25    // vertical step between sheets

// Sheets in back-to-front draw order (back drawn first so front overlaps).
export const SHEET_DEFS = [
  { id: 's1', x: 20,        y: 20        },  // back-left (sheet 1)
  { id: 's2', x: 20 + DX,   y: 20        },  // back-right (sheet 2)
  { id: 's3', x: 20,        y: 20 + DY   },  // front-left (sheet 3)
  { id: 's4', x: 20 + DX,   y: 20 + DY  },   // front-right (sheet 4)
].map(s => ({ ...s, w: W, h: H }))

// ── point definitions ─────────────────────────────────────────────────────────
// Positions of the five labelled points, and which sheet indices cover them.
// The 4-sheet overlap rectangle is:
//   x: [20+DX, 20+W]  = [50, 120]
//   y: [20+DY, 20+H]  = [45, 95]
// Point D is placed at the centre of that overlap: (85, 70).
export const POINT_DEFS = [
  { label: 'A', cx: 35,  cy: 32,  coveredBy: [0, 1] },      // top-left, on s1+s2
  { label: 'B', cx: 130, cy: 32,  coveredBy: [1, 3] },      // top-right, on s2+s4
  { label: 'C', cx: 35,  cy: 100, coveredBy: [2, 3] },      // bottom-left, on s3+s4
  { label: 'D', cx: 85,  cy: 68,  coveredBy: [0, 1, 2, 3] }, // CENTER — all four sheets
  { label: 'E', cx: 130, cy: 100, coveredBy: [3] },          // bottom-right, only s4
] as const

export type PointLabel = 'A' | 'B' | 'C' | 'D' | 'E'

export interface PaperPunch6PEProps {
  /**
   * When set, highlights the overlap region of all four sheets (amber fill).
   * Used by the explainer to reveal where all four overlap.
   */
  showOverlap?: boolean
  /**
   * Label of the currently spotlighted point (amber ring). Null = none.
   */
  activePoint?: PointLabel | null
  /**
   * When true, draw the answer dot (D) in green and mark it as correct.
   */
  showAnswer?: boolean
}

// Overlap region (where all 4 sheets coincide)
const OV_X = 20 + DX   // 50
const OV_Y = 20 + DY   // 45
const OV_W = W - DX    // 70
const OV_H = H - DY    // 50

/**
 * Shared primitive. Renders four staircase-arranged paper sheets with five
 * labelled points A–E. Used by both the illustration (default export) and the
 * explainer animation.
 */
export function PaperPunch6PE({
  showOverlap  = false,
  activePoint  = null,
  showAnswer   = false,
}: PaperPunch6PEProps = {}) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── Four sheets, back to front ───────────────────────────────── */}
      {SHEET_DEFS.map((s) => (
        <rect
          key={s.id}
          x={s.x}
          y={s.y}
          width={s.w}
          height={s.h}
          rx={3}
          fill={SHEET_FILL}
          stroke={SHEET_STROKE}
          strokeWidth={1.5}
          opacity={0.85}
        />
      ))}

      {/* ── Overlap region highlight (animator only) ─────────────────── */}
      {showOverlap && (
        <rect
          x={OV_X}
          y={OV_Y}
          width={OV_W}
          height={OV_H}
          rx={2}
          fill="#FBBF24"
          fillOpacity={0.35}
          stroke="#D97706"
          strokeWidth={1.8}
          strokeDasharray="5 3"
        />
      )}

      {/* ── Labelled points A–E ──────────────────────────────────────── */}
      {POINT_DEFS.map((p) => {
        const isActive = activePoint === p.label
        const isAnswer = showAnswer && p.label === 'D'
        const dotFill  = isAnswer ? '#10B981' : DOT_FILL
        return (
          <g key={p.label}>
            {/* highlight ring when active */}
            {isActive && (
              <circle
                cx={p.cx}
                cy={p.cy}
                r={HIGHLIGHT_RING_R}
                fill="none"
                stroke="#F59E0B"
                strokeWidth={2.2}
              />
            )}
            {/* dot */}
            <circle
              cx={p.cx}
              cy={p.cy}
              r={POINT_DOT_R}
              fill={dotFill}
              stroke={DOT_STROKE}
              strokeWidth={1.2}
            />
            {/* label text */}
            <text
              x={p.cx + (p.label === 'A' || p.label === 'C' ? -11 : 10)}
              y={p.cy + 1}
              textAnchor={p.label === 'A' || p.label === 'C' ? 'end' : 'start'}
              dominantBaseline="central"
              fontSize={12}
              fontWeight={700}
              fill={isAnswer ? '#065F46' : LABEL_INK}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {p.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── static illustration (default export) ─────────────────────────────────────

const ARIA_LABEL_EN =
  'Four identical light-blue rectangular pieces of paper are stacked in a ' +
  'staircase arrangement, each shifted slightly right and down. Five points ' +
  'A, B, C, D, and E are marked on the arrangement. Find the point that lies ' +
  'inside all four sheets at once.'

export default function PaperPunch6PEIllustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA_LABEL_EN}>
      <PaperPunch6PE />
    </div>
  )
}
