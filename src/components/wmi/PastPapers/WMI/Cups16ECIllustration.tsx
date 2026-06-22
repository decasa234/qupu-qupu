// IKMC-21-EC-Q16 — "Nora plays with 3 cups on the kitchen table. She takes
// the left-hand cup, flips it over, and puts it to the right of the other
// cups. The picture shows the first move. What do the cups look like after
// 10 moves?" Answer: B.
//
// READING THE SCAN:
//   2021.imgs/048.jpg — stem: 3 upright cups [U, U, U] with arc arrow showing
//     the leftmost cup being flipped (→ D) and placed on the right.
//   Options (2021.imgs/049–053.jpg):
//     A (049) — [D, U, U]  dome-left, upright-mid, upright-right
//     B (050) — [D, D, U]  dome-left, dome-mid, upright-right  ← ANSWER (state after 4 moves)
//     C (051) — [U, U, D]  upright-left, upright-mid, dome-right
//     D (052) — [U, U, U]  all upright (same as initial)
//     E (053) — [D, D, D]  all upside-down (state after 3 moves)
//
// CYCLE LOGIC (U=opening-up/right-side-up, D=opening-down/upside-down):
//   Move rule: take leftmost cup, flip it, place on right.
//   State 0 (initial): [U, U, U]
//   State 1 after move 1:  [U, U, D]  = option C
//   State 2 after move 2:  [U, D, D]
//   State 3 after move 3:  [D, D, D]  = option E
//   State 4 after move 4:  [D, D, U]  = option B  ← ANSWER
//   State 5 after move 5:  [D, U, U]  = option A
//   State 6 after move 6:  [U, U, U]  = option D (cycle repeats)
//   After 10 moves: 10 mod 6 = 4 → state 4 = [D, D, U] = option B ✓
//
// Co-exports:
//   CupGlyph        — shared SVG primitive rendering one cup (U or D)
//   CupRow          — shared SVG primitive: three cups in a row
//   Cups16ECOption  — per-choice renderer for CHOICE_RENDERERS
//   CUP_GEOM        — layout constants reused by the explainer
//   CupOrientation  — 'U' | 'D' type
//
// Pure render, SSR-safe, deterministic — no random / Date / side-effects.

import type { WmiChoice } from '../../../../types/wmi'

// ── types ──────────────────────────────────────────────────────────────────────
export type CupOrientation = 'U' | 'D'
export type CupState = [CupOrientation, CupOrientation, CupOrientation]

// ── palette ───────────────────────────────────────────────────────────────────
const CUP_FILL   = '#FFFFFF'
const CUP_STROKE = '#374151'
const SHADE_FILL = '#E5E7EB'

// ── geometry constants ────────────────────────────────────────────────────────
const CUP_W  = 50   // cup width
const CUP_H  = 46   // cup height
const GAP    = 14   // gap between cups
const PAD    = 12   // viewBox padding

export const CUP_GEOM = {
  CUP_W,
  CUP_H,
  GAP,
  PAD,
  ROW_W: CUP_W * 3 + GAP * 2,
} as const

// ── option data ───────────────────────────────────────────────────────────────
// Each option maps to [left, mid, right] orientations.
// U = opening up (right-side up); D = opening down (upside-down / dome shape).
const OPTION_STATES: Record<string, CupState> = {
  A: ['D', 'U', 'U'],
  B: ['D', 'D', 'U'],   // ← correct answer (state after 4 moves)
  C: ['U', 'U', 'D'],
  D: ['U', 'U', 'U'],
  E: ['D', 'D', 'D'],
}

// ── shared SVG primitive: one cup ─────────────────────────────────────────────
//
// A "right-side up" cup (U) looks like a frustum: narrow at top, wider at
// bottom, with an elliptical opening at top and a flat oval base at the bottom.
// An "upside-down" cup (D) is the frustum inverted: wider at top, narrow at
// the flat (now-top) base — a dome / lid shape.
//
// Layout origin is (x, y) = top-left corner of the bounding box.

export function CupGlyph({
  orientation,
  x = 0,
  y = 0,
  highlight = false,
}: {
  orientation: CupOrientation
  x?: number
  y?: number
  highlight?: boolean
}) {
  const w = CUP_W
  const h = CUP_H
  // Frustum half-widths at each end
  const topHalfW = orientation === 'U' ? w * 0.38 : w * 0.48
  const botHalfW = orientation === 'U' ? w * 0.48 : w * 0.38
  const ellH = 7  // ellipse height (depth of rim/base oval)
  const cx = x + w / 2

  // Trapezoid side points (the body of the cup)
  const topY = y + ellH * 0.5
  const botY = y + h - ellH * 0.5

  // Handle (attached to right side of cup body)
  const handleX1 = cx + botHalfW
  const handleY1 = y + h * 0.38
  const handleX2 = cx + botHalfW
  const handleY2 = y + h * 0.62
  const handleCX = cx + botHalfW + w * 0.22

  const highlightStroke = '#F59E0B'

  if (orientation === 'U') {
    // Right-side up: narrow top opening, wide flat bottom
    const openTopY = y
    const baseY = y + h
    return (
      <g>
        {/* body trapezoid fill */}
        <path
          d={`M${cx - topHalfW},${topY} L${cx + topHalfW},${topY} L${cx + botHalfW},${botY} L${cx - botHalfW},${botY} Z`}
          fill={highlight ? '#FEF3C7' : SHADE_FILL}
          stroke={highlight ? highlightStroke : CUP_STROKE}
          strokeWidth={highlight ? 2 : 1.5}
          strokeLinejoin="round"
        />
        {/* flat base ellipse at bottom */}
        <ellipse
          cx={cx}
          cy={baseY}
          rx={botHalfW}
          ry={ellH * 0.5}
          fill={highlight ? '#FEF3C7' : CUP_FILL}
          stroke={highlight ? highlightStroke : CUP_STROKE}
          strokeWidth={highlight ? 2 : 1.5}
        />
        {/* opening ellipse at top */}
        <ellipse
          cx={cx}
          cy={openTopY}
          rx={topHalfW}
          ry={ellH * 0.38}
          fill={highlight ? '#FEF3C7' : CUP_FILL}
          stroke={highlight ? highlightStroke : CUP_STROKE}
          strokeWidth={highlight ? 2 : 1.5}
        />
        {/* handle (bezier curve to the right) */}
        <path
          d={`M${handleX1},${handleY1} C${handleCX},${handleY1} ${handleCX},${handleY2} ${handleX2},${handleY2}`}
          fill="none"
          stroke={highlight ? highlightStroke : CUP_STROKE}
          strokeWidth={highlight ? 2 : 1.5}
          strokeLinecap="round"
        />
      </g>
    )
  }

  // Upside-down (D): wide at top (flat closed base), narrow at bottom (small opening)
  const flatBaseY = y
  const smallOpenY = y + h
  return (
    <g>
      {/* body trapezoid fill */}
      <path
        d={`M${cx - topHalfW},${topY} L${cx + topHalfW},${topY} L${cx + botHalfW},${botY} L${cx - botHalfW},${botY} Z`}
        fill={highlight ? '#FEF3C7' : SHADE_FILL}
        stroke={highlight ? highlightStroke : CUP_STROKE}
        strokeWidth={highlight ? 2 : 1.5}
        strokeLinejoin="round"
      />
      {/* flat top (base of cup, now at top) */}
      <ellipse
        cx={cx}
        cy={flatBaseY}
        rx={topHalfW}
        ry={ellH * 0.5}
        fill={highlight ? '#FEF3C7' : CUP_FILL}
        stroke={highlight ? highlightStroke : CUP_STROKE}
        strokeWidth={highlight ? 2 : 1.5}
      />
      {/* small opening ellipse at bottom */}
      <ellipse
        cx={cx}
        cy={smallOpenY}
        rx={botHalfW}
        ry={ellH * 0.38}
        fill={highlight ? '#FEF3C7' : CUP_FILL}
        stroke={highlight ? highlightStroke : CUP_STROKE}
        strokeWidth={highlight ? 2 : 1.5}
      />
      {/* handle — now on the lower portion (since cup is inverted) */}
      <path
        d={`M${handleX1},${handleY1} C${handleCX},${handleY1} ${handleCX},${handleY2} ${handleX2},${handleY2}`}
        fill="none"
        stroke={highlight ? highlightStroke : CUP_STROKE}
        strokeWidth={highlight ? 2 : 1.5}
        strokeLinecap="round"
      />
    </g>
  )
}

// ── shared SVG primitive: three cups in a row ─────────────────────────────────

export interface CupRowProps {
  state: CupState
  /** Index 0/1/2 to highlight with amber ring, or null. */
  highlightIndex?: number | null
  /** When true highlights the entire row with a green tint. */
  highlightResult?: boolean
}

export function CupRow({ state, highlightIndex = null }: CupRowProps) {
  const { CUP_W: cw, CUP_H: ch, GAP, PAD, ROW_W } = CUP_GEOM
  const vw = ROW_W + 2 * PAD
  const vh = ch + 2 * PAD

  return (
    <svg
      viewBox={`0 0 ${vw} ${vh}`}
      width={Math.min(240, vw)}
      aria-hidden="true"
    >
      {state.map((orientation, i) => (
        <CupGlyph
          key={`cup-${i}`}
          orientation={orientation}
          x={PAD + i * (cw + GAP)}
          y={PAD}
          highlight={highlightIndex === i}
        />
      ))}
    </svg>
  )
}

// ── option renderer ───────────────────────────────────────────────────────────

/**
 * Renders ONE answer option (A–E) for IKMC-21-EC-Q16.
 * Each option shows a row of three cups in the specified orientations.
 */
export function Cups16ECOption({ choice }: { choice: WmiChoice }) {
  const key = (choice.label ?? '').trim().toUpperCase()
  const state = OPTION_STATES[key]
  if (!state) return <span>{choice.text}</span>

  const { CUP_W: cw, CUP_H: ch, GAP, PAD, ROW_W } = CUP_GEOM
  const vw = ROW_W + 2 * PAD
  const vh = ch + 2 * PAD

  return (
    <svg
      viewBox={`0 0 ${vw} ${vh}`}
      width="100%"
      style={{ maxWidth: 200, display: 'block' }}
      role="img"
      aria-label={`Option ${key}`}
    >
      {state.map((orientation, i) => (
        <CupGlyph
          key={`cup-${i}`}
          orientation={orientation}
          x={PAD + i * (cw + GAP)}
          y={PAD}
        />
      ))}
    </svg>
  )
}

// ── stem illustration ─────────────────────────────────────────────────────────
//
// Shows:
//   1. Initial state: three upright cups [U, U, U]
//   2. Arc arrow showing the leftmost cup being flipped and placed on the right.
//   3. Resulting state after move 1: [U, U, D] (for illustration context)
//
// Only shows the PROBLEM (initial state + the first move as described), never
// shows the answer.

const ARIA_EN =
  'Three cups standing upright on a table. An arrow shows the leftmost cup ' +
  'being flipped over and placed to the right of the other two cups. ' +
  'This is the first move. What do the cups look like after 10 moves?'

const ARIA_ID =
  'Tiga cangkir berdiri tegak di atas meja. Sebuah panah menunjukkan ' +
  'cangkir paling kiri dibalik dan diletakkan di sebelah kanan dua cangkir lainnya. ' +
  'Ini adalah gerakan pertama. Bagaimana tampilan cangkir setelah 10 gerakan?'

export default function Cups16ECIllustration({ lang = 'en' }: { lang?: string } = {}) {
  const { CUP_W: cw, CUP_H: ch, GAP, PAD } = CUP_GEOM

  // Two groups side-by-side: before and after with an arrow
  // "Before" — 3 upright cups
  // Arrow — arc showing leftmost moving to right
  // "After" — 2 upright + 1 upside-down on right (state 1)
  const ROW_W = cw * 3 + GAP * 2
  const ARROW_W  = 44    // width of the arc arrow zone
  const TOTAL_W  = ROW_W + ARROW_W + ROW_W + 2 * PAD
  const TOTAL_H  = ch + 2 * PAD + 20  // extra for label text
  const arrowMidX = PAD + ROW_W + ARROW_W / 2

  return (
    <div
      className="my-4 flex justify-center overflow-x-auto"
      role="img"
      aria-label={lang === 'id' ? ARIA_ID : ARIA_EN}
    >
      <svg
        viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`}
        width={Math.min(520, TOTAL_W)}
        style={{ display: 'block' }}
      >
        {/* ── BEFORE: all 3 cups upright ── */}
        {([0, 1, 2] as const).map((i) => (
          <CupGlyph
            key={`before-${i}`}
            orientation="U"
            x={PAD + i * (cw + GAP)}
            y={PAD}
            highlight={i === 0}
          />
        ))}

        {/* ── ARC ARROW from left-group to right-group ── */}
        {/* Arrow path: arc going from left side up and over to right side */}
        <path
          d={`M${PAD + cw * 0.5},${PAD - 4}
              C${arrowMidX - 12},${PAD - 24}
               ${arrowMidX + 12},${PAD - 24}
               ${PAD + ROW_W + ARROW_W + cw * 2.5},${PAD - 4}`}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={2}
          strokeDasharray="none"
          markerEnd="url(#arrow-head)"
        />
        {/* Arrowhead definition */}
        <defs>
          <marker
            id="arrow-head"
            markerWidth="8"
            markerHeight="8"
            refX="4"
            refY="4"
            orient="auto"
          >
            <path d="M0,1 L7,4 L0,7 Z" fill="#F59E0B" />
          </marker>
        </defs>

        {/* "flip" label under arrow */}
        <text
          x={arrowMidX}
          y={PAD - 4}
          textAnchor="middle"
          fontSize="9"
          fill="#92400E"
          fontWeight="700"
        >
          {lang === 'id' ? 'balik + pindahkan' : 'flip + move'}
        </text>

        {/* ── AFTER: state after move 1 = [U, U, D] ── */}
        {([
          ['U', 0],
          ['U', 1],
          ['D', 2],
        ] as Array<[CupOrientation, number]>).map(([orientation, i]) => (
          <CupGlyph
            key={`after-${i}`}
            orientation={orientation}
            x={PAD + ROW_W + ARROW_W + i * (cw + GAP)}
            y={PAD}
            highlight={i === 2}
          />
        ))}

        {/* Move label at bottom */}
        <text
          x={PAD + ROW_W / 2}
          y={PAD + ch + 16}
          textAnchor="middle"
          fontSize="10"
          fill="#6B7280"
          fontWeight="600"
        >
          {lang === 'id' ? 'Awal' : 'Start'}
        </text>
        <text
          x={PAD + ROW_W + ARROW_W + ROW_W / 2}
          y={PAD + ch + 16}
          textAnchor="middle"
          fontSize="10"
          fill="#6B7280"
          fontWeight="600"
        >
          {lang === 'id' ? 'Setelah 1 gerakan' : 'After 1 move'}
        </text>
      </svg>
    </div>
  )
}
