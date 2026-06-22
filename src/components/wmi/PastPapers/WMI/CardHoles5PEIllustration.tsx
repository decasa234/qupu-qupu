// IKMC-20-PE-Q5 — "José has two cards of the same size. Card A has four holes
// cut in it. José places card A directly on top of card B. What can José see?"
// Answer A.
//
// Stem illustration: Card A (grey, 4 round holes) placed over Card B (grey,
// 6 black stars). The viewer sees Card A on top with the stars of Card B
// showing only through the four holes.
//
// Hole layout (read from 2020.imgs/020.jpg):
//   • top-right
//   • left-center
//   • right-center
//   • bottom-left
//
// Card B star layout (6 stars, 3×2 grid):
//   Row 1 (top):    col-left, col-mid, col-right
//   Row 2 (bottom): col-left, col-mid, col-right
// (Stars fill the card B face; holes align so 3 of the 4 holes see a star.)
//
// Co-exports:
//   CardHoles5PE         — shared primitive used by the explainer
//   HOLE_POSITIONS       — the 4 hole {cx, cy} in the 200×200 viewBox
//   STAR_POSITIONS       — the 6 star {cx, cy} on card B
//   VIEW_SIZE            — viewBox side length
//
// Pure render, SSR-safe, deterministic — no random / Date / side-effects.

// ── viewBox / card ───────────────────────────────────────────────────────────
export const VIEW_SIZE = 220
const CARD_W = 90  // each card is 90×90 within the viewBox
const CARD_H = 90
const HOLE_R = 7   // radius of each cut-out hole
const STAR_R = 9   // radius of star circle on card B

// ── palette ───────────────────────────────────────────────────────────────────
const CARD_FILL  = '#CACACA'   // grey card face (matches scan)
const CARD_STROKE = '#555555'  // card border
const HOLE_OUTLINE = '#888888' // ring showing the hole edge on card A
const STAR_FILL   = '#1F1F1F'  // black stars on card B
const STAR_STROKE = '#000000'  // star outline
const ARROW_FILL  = '#333333'  // the → arrow between the two cards
const INK         = '#1F2937'  // label ink

// ── card A: hole positions (relative to card A top-left = 0,0) ───────────────
// Holes are at: top-right, left-center, right-center, bottom-left
// (read directly from 020.jpg)
const HOLE_REL = [
  { id: 'tr', rx: 68, ry: 18 },   // top-right
  { id: 'lc', rx: 18, ry: 45 },   // left-center
  { id: 'rc', rx: 68, ry: 45 },   // right-center
  { id: 'bl', rx: 18, ry: 72 },   // bottom-left
] as const

// Card B origin within the viewBox (right side of the arrow)
const CARD_B_X = 126
const CARD_B_Y = 65

// Card A origin (left side)
const CARD_A_X = 10
const CARD_A_Y = 65

// ── card B: star positions (relative to card B top-left = 0,0) ───────────────
// 6 stars in a 3-column × 2-row grid; spaced so they densely fill the card.
const STAR_REL = [
  { id: 's1', sx: 18, sy: 18 },   // row 1 col 1
  { id: 's2', sx: 45, sy: 18 },   // row 1 col 2
  { id: 's3', sx: 72, sy: 18 },   // row 1 col 3
  { id: 's4', sx: 18, sy: 63 },   // row 2 col 1
  { id: 's5', sx: 45, sy: 63 },   // row 2 col 2
  { id: 's6', sx: 72, sy: 63 },   // row 2 col 3
] as const

// ── absolute hole positions in the viewBox (card A's coordinate frame) ────────
export const HOLE_POSITIONS = HOLE_REL.map((h) => ({
  id: h.id,
  cx: CARD_A_X + h.rx,
  cy: CARD_A_Y + h.ry,
}))

// ── absolute star positions in the viewBox (card B's coordinate frame) ────────
export const STAR_POSITIONS = STAR_REL.map((s) => ({
  id: s.id,
  cx: CARD_B_X + s.sx,
  cy: CARD_B_Y + s.sy,
}))

// ── shared SVG primitive ─────────────────────────────────────────────────────

export interface CardHoles5PEProps {
  /**
   * When true, renders the overlay state: card A placed on top of card B,
   * showing only what is visible through the holes.
   * When false (default for the stem illustration), shows card A and card B
   * side-by-side with an arrow between them.
   */
  overlaid?: boolean
  /**
   * Controls which holes are "lit" (circled in amber) by the explainer.
   * 'tr' | 'lc' | 'rc' | 'bl'
   */
  activeHole?: string | null
}

/** A single 5-pointed star glyph at (cx, cy) with outer radius r. */
function StarGlyph({
  cx,
  cy,
  r = STAR_R,
  fill = STAR_FILL,
  stroke = STAR_STROKE,
}: {
  cx: number
  cy: number
  r?: number
  fill?: string
  stroke?: string
}) {
  // Build a 5-pointed star path from a centre + outer/inner radii.
  const outerR = r
  const innerR = r * 0.42
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 === 0 ? outerR : innerR
    pts.push(`${cx + rr * Math.cos(angle)},${cy + rr * Math.sin(angle)}`)
  }
  return (
    <polygon
      points={pts.join(' ')}
      fill={fill}
      stroke={stroke}
      strokeWidth={0.8}
      strokeLinejoin="round"
    />
  )
}

export function CardHoles5PE({ overlaid = false, activeHole = null }: CardHoles5PEProps) {
  if (overlaid) {
    // ── overlaid view: card A on top of card B ─────────────────────────────
    // The combined origin is where card A sits (card A and card B are aligned).
    const ox = 65  // centre x of the overlaid view
    const oy = 20  // top-left y of the overlaid card
    const cardW = CARD_W
    const cardH = CARD_H

    // Absolute hole positions in the overlaid view
    const holes = HOLE_REL.map((h) => ({
      id: h.id,
      cx: ox + h.rx,
      cy: oy + h.ry,
    }))

    // Absolute star positions in the overlaid view (same origin = same card B)
    const stars = STAR_REL.map((s) => ({
      id: s.id,
      cx: ox + s.sx,
      cy: oy + s.sy,
    }))

    // Which stars are visible through a hole? A hole sees a star if the hole
    // centre is within HOLE_R + STAR_R of a star centre.
    const holeSet = new Set(holes.map((h) => h.id))
    const visibleStars = stars.filter((star) =>
      holes.some(
        (hole) =>
          Math.hypot(hole.cx - star.cx, hole.cy - star.cy) < HOLE_R + STAR_R * 0.6,
      ),
    )

    return (
      <svg
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        width="100%"
        style={{ maxWidth: VIEW_SIZE, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* Card B face (underneath) */}
        <rect
          x={ox}
          y={oy}
          width={cardW}
          height={cardH}
          rx={4}
          fill={CARD_FILL}
          stroke={CARD_STROKE}
          strokeWidth={2}
        />
        {/* stars on card B */}
        {stars.map((s) => (
          <StarGlyph key={s.id} cx={s.cx} cy={s.cy} />
        ))}

        {/* Card A on top — clips everything except the hole regions */}
        <defs>
          <mask id="holes-mask">
            {/* white = show card A */}
            <rect x={ox} y={oy} width={cardW} height={cardH} fill="white" />
            {/* black = cut holes = see through */}
            {holes.map((h) => (
              <circle key={h.id} cx={h.cx} cy={h.cy} r={HOLE_R} fill="black" />
            ))}
          </mask>
        </defs>
        <rect
          x={ox}
          y={oy}
          width={cardW}
          height={cardH}
          rx={4}
          fill={CARD_FILL}
          stroke={CARD_STROKE}
          strokeWidth={2}
          mask="url(#holes-mask)"
        />

        {/* Visible stars through holes */}
        {visibleStars.map((s) => (
          <StarGlyph key={s.id} cx={s.cx} cy={s.cy} />
        ))}

        {/* Hole rings on card A surface */}
        {holes.map((h) => (
          <circle
            key={h.id}
            cx={h.cx}
            cy={h.cy}
            r={HOLE_R}
            fill="none"
            stroke={holeSet.has(h.id) && activeHole === h.id ? '#F59E0B' : HOLE_OUTLINE}
            strokeWidth={activeHole === h.id ? 2.5 : 1.5}
          />
        ))}
      </svg>
    )
  }

  // ── side-by-side view (stem illustration) ──────────────────────────────────
  return (
    <svg
      viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
      width="100%"
      style={{ maxWidth: VIEW_SIZE, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── Card A ─────────────────────────────────────────────────────── */}
      <rect
        x={CARD_A_X}
        y={CARD_A_Y}
        width={CARD_W}
        height={CARD_H}
        rx={4}
        fill={CARD_FILL}
        stroke={CARD_STROKE}
        strokeWidth={2}
      />
      {/* Four holes on card A — drawn as grey-filled circles with rings */}
      {HOLE_POSITIONS.map((h) => (
        <g key={h.id}>
          <circle cx={h.cx} cy={h.cy} r={HOLE_R} fill="#F0F0F0" />
          <circle
            cx={h.cx}
            cy={h.cy}
            r={HOLE_R}
            fill="none"
            stroke={activeHole === h.id ? '#F59E0B' : HOLE_OUTLINE}
            strokeWidth={activeHole === h.id ? 2.5 : 1.5}
          />
        </g>
      ))}

      {/* label "card A" */}
      <text
        x={CARD_A_X + CARD_W / 2}
        y={CARD_A_Y + CARD_H + 14}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={700}
        fill={INK}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        card A
      </text>

      {/* ── Arrow ──────────────────────────────────────────────────────── */}
      {/* Arrow body */}
      <line
        x1={CARD_A_X + CARD_W + 5}
        y1={CARD_A_Y + CARD_H / 2}
        x2={CARD_B_X - 5}
        y2={CARD_B_Y + CARD_H / 2}
        stroke={ARROW_FILL}
        strokeWidth={3}
      />
      {/* Arrowhead */}
      <polygon
        points={[
          `${CARD_B_X - 5},${CARD_B_Y + CARD_H / 2 - 6}`,
          `${CARD_B_X + 8},${CARD_B_Y + CARD_H / 2}`,
          `${CARD_B_X - 5},${CARD_B_Y + CARD_H / 2 + 6}`,
        ].join(' ')}
        fill={ARROW_FILL}
      />

      {/* ── Card B ─────────────────────────────────────────────────────── */}
      <rect
        x={CARD_B_X}
        y={CARD_B_Y}
        width={CARD_W}
        height={CARD_H}
        rx={4}
        fill={CARD_FILL}
        stroke={CARD_STROKE}
        strokeWidth={2}
      />
      {/* 6 stars on card B */}
      {STAR_POSITIONS.map((s) => (
        <StarGlyph key={s.id} cx={s.cx} cy={s.cy} />
      ))}

      {/* label "card B" */}
      <text
        x={CARD_B_X + CARD_W / 2}
        y={CARD_B_Y + CARD_H + 14}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={700}
        fill={INK}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        card B
      </text>
    </svg>
  )
}

// ── option renderer ───────────────────────────────────────────────────────────
// Each answer option (A–E) shows a grey card with 4 positions (matching the
// hole positions) where each position is either a filled black circle (star
// visible through that hole) or an empty ring (no star behind that hole).
//
// Layouts read from 2020.imgs/021–025.jpg:
//   A — tr=star, lc=star, rc=star, bl=empty    ← correct answer
//   B — tr=star, lc=star, rc=star, bl=star
//   C — tr=empty, lc=star, rc=star, bl=empty
//   D — tr=empty, lc=star, rc=star, bl=star    (approximate from scan)
//   E — tr=empty, lc=empty, rc=empty, bl=empty

type HoleId = 'tr' | 'lc' | 'rc' | 'bl'

const OPTION_DATA: Record<string, Record<HoleId, boolean>> = {
  A: { tr: true,  lc: true,  rc: true,  bl: false },  // answer
  B: { tr: true,  lc: true,  rc: true,  bl: true  },
  C: { tr: false, lc: true,  rc: true,  bl: false },
  D: { tr: false, lc: true,  rc: false, bl: true  },
  E: { tr: false, lc: false, rc: false, bl: false },
}

// Option card geometry (smaller, square, matching scan proportions)
const OPT_W = 90
const OPT_H = 90
const OPT_HOLE_R = 7
const OPT_STAR_R = 8

// Hole positions within the option card (same relative layout as Card A)
const OPT_HOLES: Record<HoleId, { x: number; y: number }> = {
  tr: { x: 68, y: 18 },
  lc: { x: 18, y: 45 },
  rc: { x: 68, y: 45 },
  bl: { x: 18, y: 72 },
}

import type { WmiChoice } from '../../../../types/wmi'

/**
 * Renders ONE answer option (A–E) for IKMC-20-PE-Q5.
 * Shows the result of placing card A on card B: at each hole position,
 * a filled star glyph if card B had a star there, or an empty ring otherwise.
 */
export function CardHoles5PEOption({ choice }: { choice: WmiChoice }) {
  const key = (choice.label ?? '').trim().toUpperCase() as keyof typeof OPTION_DATA
  const data = OPTION_DATA[key]
  if (!data) return <span>{choice.text}</span>

  const padX = 10
  const padY = 10
  const vw = OPT_W + 2 * padX
  const vh = OPT_H + 2 * padY

  return (
    <svg
      viewBox={`0 0 ${vw} ${vh}`}
      width="100%"
      style={{ maxWidth: 110, display: 'block' }}
      role="img"
      aria-label={`Option ${key}`}
    >
      {/* card face */}
      <rect
        x={padX}
        y={padY}
        width={OPT_W}
        height={OPT_H}
        rx={4}
        fill={CARD_FILL}
        stroke={CARD_STROKE}
        strokeWidth={2}
      />

      {/* each hole position: filled star or empty ring */}
      {(Object.entries(OPT_HOLES) as [HoleId, { x: number; y: number }][]).map(
        ([hid, pos]) => {
          const cx = padX + pos.x
          const cy = padY + pos.y
          const hasStar = data[hid]
          return hasStar ? (
            <StarGlyph key={hid} cx={cx} cy={cy} r={OPT_STAR_R} />
          ) : (
            <circle
              key={hid}
              cx={cx}
              cy={cy}
              r={OPT_HOLE_R}
              fill="none"
              stroke={HOLE_OUTLINE}
              strokeWidth={1.5}
            />
          )
        },
      )}
    </svg>
  )
}

// ── static illustration (default export) ─────────────────────────────────────

const ARIA_LABEL_EN =
  'Card A is a grey card with four round holes: top-right, left-center, right-center, bottom-left. ' +
  'Card B is a grey card filled with six black stars arranged in a 3-column by 2-row grid. ' +
  'José places card A on top of card B — find what shows through the holes.'

export default function CardHoles5PEIllustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA_LABEL_EN}>
      <CardHoles5PE overlaid={false} />
    </div>
  )
}
