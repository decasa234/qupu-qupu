// IKMC-20-PE-Q15 — "This card lies on the table. It is flipped over its top
// edge then flipped over its left edge. What does the card look like after
// the two flips?" Answer: B (down-triangle, square, circle).
//
// READING THE SCAN:
//   2020.imgs/048.jpg — original card: circle (left) | square (middle) | triangle↑ (right)
//   2020.imgs/049.jpg — diagram showing two sequential flips with arrows:
//       flip 1 over top edge → card goes above original
//       flip 2 over left edge → card goes left of position after flip 1
//
// OPTIONS (2020.imgs/050–054.jpg):
//   A — circle, square, ▼             (circle left, square mid, down-triangle right)
//   B — ▼, square, circle             (down-triangle left, square mid, circle right) ← ANSWER
//   C — square, circle, ▼             (square left, circle mid, down-triangle right)
//   D — circle, square, △             (circle left, square mid, triangle-up right)
//   E — △, square, circle             (triangle-up left, square mid, circle right)
//
// TRANSFORM LOGIC:
//   Start:   [ circle | square | △ ]
//   Flip 1 (over top edge = vertical mirror): shapes reverse top↔bottom, triangle flips to ▼
//   After F1: [ circle | square | ▼ ]   (same left-right order, triangle now pointing down)
//   Flip 2 (over left edge = horizontal mirror): columns reverse left↔right
//   After F2: [ ▼ | square | circle ]   ← this is answer B
//
// Net effect: a 180° rotation of the card, so the rightmost triangle
// ends up leftmost and upside-down, and the leftmost circle ends up rightmost.
//
// Co-exports:
//   CardFlip15PE         — shared primitive (stem or option rendering)
//   SHAPES               — the three shape identifiers on the original card
//   CARD_GEOM            — shared layout constants for the explainer
//
// Pure render, SSR-safe, deterministic — no random / Date / side-effects.

import type { WmiChoice } from '../../../../types/wmi'

// ── palette ──────────────────────────────────────────────────────────────────
const CARD_FILL  = '#FFFFFF'
const CARD_STROKE = '#374151'
const SHAPE_FILL = '#1F1F1F'  // dark-filled shapes matching the scan

// ── layout constants ─────────────────────────────────────────────────────────
export const CARD_W = 180
export const CARD_H  = 60
const CARD_RX = 6
// Three shape slots, evenly spaced within the card
const SLOT_W  = CARD_W / 3          // 60 px per slot
const SLOT_CY = CARD_H / 2          // vertical centre of card
const SHAPE_R  = 18                  // radius / half-size of each shape glyph

// Slot centre-x values (relative to card left edge)
const SLOT_CX = [SLOT_W * 0.5, SLOT_W * 1.5, SLOT_W * 2.5] as const  // 30, 90, 150

// ── shape identifiers ─────────────────────────────────────────────────────────
export type ShapeId = 'circle' | 'square' | 'tri-up' | 'tri-down'

/** The three shapes on the ORIGINAL card, left to right. */
export const SHAPES: [ShapeId, ShapeId, ShapeId] = ['circle', 'square', 'tri-up']

// ── option data ───────────────────────────────────────────────────────────────
// Each option is [left, middle, right] shape ids
const OPTION_SHAPES: Record<string, [ShapeId, ShapeId, ShapeId]> = {
  A: ['circle', 'square', 'tri-down'],
  B: ['tri-down', 'square', 'circle'],    // ← correct answer
  C: ['square', 'circle', 'tri-down'],
  D: ['circle', 'square', 'tri-up'],
  E: ['tri-up', 'square', 'circle'],
}

// ── shared SVG primitive ─────────────────────────────────────────────────────

export interface CardFlip15PEProps {
  /** Three shape ids to render left→right on the card. Defaults to original card. */
  shapes?: [ShapeId, ShapeId, ShapeId]
  /**
   * When true, highlights the middle shape with an amber ring (used by
   * the explainer to call attention to the square staying in place).
   */
  highlightMiddle?: boolean
  /**
   * Optional index (0, 1, 2) of the shape slot to highlight with an amber ring.
   */
  highlightSlot?: number | null
}

/** Draw one shape glyph at (cx, cy) within the card. */
function ShapeGlyph({
  shape,
  cx,
  cy,
  r = SHAPE_R,
  fill = SHAPE_FILL,
  highlightRing = false,
}: {
  shape: ShapeId
  cx: number
  cy: number
  r?: number
  fill?: string
  highlightRing?: boolean
}) {
  const ringColor = '#F59E0B'
  const ringStrokeW = 2.5

  if (shape === 'circle') {
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill={fill} />
        {highlightRing && (
          <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke={ringColor} strokeWidth={ringStrokeW} />
        )}
      </g>
    )
  }

  if (shape === 'square') {
    const half = r * 0.9
    return (
      <g>
        <rect x={cx - half} y={cy - half} width={half * 2} height={half * 2} fill={fill} />
        {highlightRing && (
          <rect
            x={cx - half - 4}
            y={cy - half - 4}
            width={(half + 4) * 2}
            height={(half + 4) * 2}
            fill="none"
            stroke={ringColor}
            strokeWidth={ringStrokeW}
            rx={3}
          />
        )}
      </g>
    )
  }

  if (shape === 'tri-up') {
    // Equilateral triangle pointing up
    const h = r * 1.1
    const pts = `${cx},${cy - h} ${cx - r},${cy + h * 0.5} ${cx + r},${cy + h * 0.5}`
    return (
      <g>
        <polygon points={pts} fill={fill} />
        {highlightRing && (
          <polygon
            points={`${cx},${cy - h - 5} ${cx - r - 5},${cy + h * 0.5 + 4} ${cx + r + 5},${cy + h * 0.5 + 4}`}
            fill="none"
            stroke={ringColor}
            strokeWidth={ringStrokeW}
          />
        )}
      </g>
    )
  }

  // tri-down — equilateral triangle pointing down
  const h = r * 1.1
  const pts = `${cx},${cy + h} ${cx - r},${cy - h * 0.5} ${cx + r},${cy - h * 0.5}`
  return (
    <g>
      <polygon points={pts} fill={fill} />
      {highlightRing && (
        <polygon
          points={`${cx},${cy + h + 5} ${cx - r - 5},${cy - h * 0.5 - 4} ${cx + r + 5},${cy - h * 0.5 - 4}`}
          fill="none"
          stroke={ringColor}
          strokeWidth={ringStrokeW}
        />
      )}
    </g>
  )
}

export const CARD_GEOM = {
  CARD_W,
  CARD_H,
  SLOT_W,
  SLOT_CY,
  SHAPE_R,
  SLOT_CX,
} as const

/**
 * Bare card primitive: three shapes left-to-right on a white rounded-rect card.
 * Defaults to the original card (circle | square | triangle-up).
 */
export function CardFlip15PE({
  shapes = SHAPES,
  highlightMiddle = false,
  highlightSlot = null,
}: CardFlip15PEProps = {}) {
  const PAD = 12
  const VW = CARD_W + 2 * PAD
  const VH = CARD_H + 2 * PAD

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width={Math.min(280, VW)}
      aria-hidden="true"
    >
      {/* card body */}
      <rect
        x={PAD}
        y={PAD}
        width={CARD_W}
        height={CARD_H}
        rx={CARD_RX}
        fill={CARD_FILL}
        stroke={CARD_STROKE}
        strokeWidth={2.5}
      />

      {/* dividers between slots */}
      {[1, 2].map((i) => (
        <line
          key={`div-${i}`}
          x1={PAD + SLOT_W * i}
          y1={PAD + 6}
          x2={PAD + SLOT_W * i}
          y2={PAD + CARD_H - 6}
          stroke={CARD_STROKE}
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.35}
        />
      ))}

      {/* three shape glyphs */}
      {shapes.map((shape, i) => (
        <ShapeGlyph
          key={`shape-${i}`}
          shape={shape}
          cx={PAD + SLOT_CX[i]}
          cy={PAD + SLOT_CY}
          r={SHAPE_R}
          fill={SHAPE_FILL}
          highlightRing={highlightSlot === i || (highlightMiddle && i === 1)}
        />
      ))}
    </svg>
  )
}

// ── option renderer ───────────────────────────────────────────────────────────

/**
 * Renders ONE answer option (A–E) for IKMC-20-PE-Q15.
 * Each option shows a card with three shapes as per the scan.
 */
export function CardFlip15PEOption({ choice }: { choice: WmiChoice }) {
  const key = (choice.label ?? '').trim().toUpperCase()
  const shapes = OPTION_SHAPES[key]
  if (!shapes) return <span>{choice.text}</span>

  const PAD = 8
  const VW = CARD_W + 2 * PAD
  const VH = CARD_H + 2 * PAD

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: 200, display: 'block' }}
      role="img"
      aria-label={`Option ${key}`}
    >
      {/* card body */}
      <rect
        x={PAD}
        y={PAD}
        width={CARD_W}
        height={CARD_H}
        rx={CARD_RX}
        fill={CARD_FILL}
        stroke={CARD_STROKE}
        strokeWidth={2.5}
      />

      {/* dividers */}
      {[1, 2].map((i) => (
        <line
          key={`div-${i}`}
          x1={PAD + SLOT_W * i}
          y1={PAD + 6}
          x2={PAD + SLOT_W * i}
          y2={PAD + CARD_H - 6}
          stroke={CARD_STROKE}
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.35}
        />
      ))}

      {/* three shapes */}
      {shapes.map((shape, i) => (
        <ShapeGlyph
          key={`shape-${i}`}
          shape={shape}
          cx={PAD + SLOT_CX[i]}
          cy={PAD + SLOT_CY}
          r={SHAPE_R}
          fill={SHAPE_FILL}
        />
      ))}
    </svg>
  )
}

// ── static illustration (default export) ─────────────────────────────────────

const ARIA_EN =
  'A card lying on the table showing three dark shapes in a row: ' +
  'a filled circle on the left, a filled square in the middle, and a filled triangle (pointing up) on the right. ' +
  'The card is first flipped over its top edge, then flipped over its left edge. ' +
  'What does the card look like after both flips?'

const ARIA_ID =
  'Sebuah kartu di atas meja menampilkan tiga bentuk gelap berjajar: ' +
  'lingkaran penuh di kiri, persegi penuh di tengah, dan segitiga penuh (menunjuk ke atas) di kanan. ' +
  'Kartu dibalik melewati tepi atasnya, lalu dibalik melewati tepi kirinya. ' +
  'Bagaimana tampilan kartu setelah kedua pembalikan?'

export default function CardFlip15PEIllustration({ lang = 'en' }: { lang?: string } = {}) {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={lang === 'id' ? ARIA_ID : ARIA_EN}
    >
      <CardFlip15PE shapes={SHAPES} />
    </div>
  )
}
