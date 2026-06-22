/**
 * IKMC-21-PE-Q20 — "Stan has five toys… On which shelf can the puzzle NOT be placed?"
 *
 * Stem illustration: a five-shelf bookcase (shelves numbered 1 at the bottom to
 * 5 at the top), shown EMPTY — no toys placed yet. The labels match the answer
 * choices (A=1, B=2, C=3, D=4, E=5).
 *
 * Faithfully reconstructed from docs/reference/ocr-res/ikmc/contest/preecolier/
 * 2021.imgs/040.jpg: a warm-wood bookcase with five evenly-spaced shelves,
 * each numbered on the left side.
 *
 * The PROBLEM figure never shows any toys or indicates which shelf is blocked.
 *
 * Pure render — no Math.random, no Date, no window/document at module top.
 * SSR-safe and deterministic.
 */

// ── colour tokens ────────────────────────────────────────────────────────────

export const COLOR = {
  CASE_FILL:   '#C8935A', // warm oak body
  CASE_STROKE: '#8B5E3C',
  SHELF_FILL:  '#E8C99A', // lighter shelf boards
  SHELF_STROKE:'#9E6B3A',
  SIDE_FILL:   '#B07840', // side panels (darker)
  BACK_FILL:   '#F5E8D0', // back panel (very light)
  INK:         '#3B1E08', // label text
  NUM_FILL:    '#FFFFFF', // shelf-number badge
  NUM_STROKE:  '#9E6B3A',
} as const

// ── geometry ─────────────────────────────────────────────────────────────────

export const SVG_W  = 200
export const SVG_H  = 260

/** Inner left edge of bookcase interior. */
export const INNER_X = 28
/** Inner right edge. */
export const INNER_R = 172
/** Inner width. */
export const INNER_W = INNER_R - INNER_X  // 144

/** Y of the TOP outer edge of the bookcase (top board). */
export const CASE_TOP    = 10
/** Y of the BOTTOM outer edge (floor board). */
export const CASE_BOTTOM = 250

/** Thickness of each board. */
export const BOARD_T = 10
/** Number of shelves. */
export const N_SHELVES = 5

/**
 * Returns the Y coordinate of the TOP edge of a shelf board, for shelf n
 * (1 = bottom, 5 = top). Shelves are evenly distributed between the top and
 * bottom boards, inside the case.
 *
 * Interior runs from (CASE_TOP + BOARD_T) to (CASE_BOTTOM - BOARD_T).
 * There are N_SHELVES shelf-boards; the spaces between / above / below them
 * are equal.
 */
export function shelfTopY(n: number): number {
  // interior bounds
  const interiorTop    = CASE_TOP    + BOARD_T
  const interiorBottom = CASE_BOTTOM - BOARD_T
  const interiorH      = interiorBottom - interiorTop

  // N_SHELVES boards of BOARD_T each; divide remaining space into (N_SHELVES+1) gaps
  const totalBoardH = N_SHELVES * BOARD_T
  const gap = (interiorH - totalBoardH) / (N_SHELVES + 1)

  // shelf 1 is at the bottom of the interior, shelf N at the top.
  // index from bottom: shelf 1 → slot 0, shelf 5 → slot 4.
  const slotFromBottom = n - 1
  const slotFromTop    = N_SHELVES - 1 - slotFromBottom

  return interiorTop + gap * (slotFromTop + 1) + BOARD_T * slotFromTop
}

/** Y of the mid-point of the bay ABOVE shelf n (the bay that's reached by toy on shelf n). */
export function bayMidY(n: number): number {
  const shY = shelfTopY(n)
  if (n === N_SHELVES) {
    // bay above shelf 5 goes from shelf5-top up to the top board bottom
    return (CASE_TOP + BOARD_T + shY) / 2
  }
  const shYAbove = shelfTopY(n + 1)
  return (shY + (shYAbove + BOARD_T)) / 2
}

// ── sub-components ───────────────────────────────────────────────────────────

/** The empty bookcase structure: two sides, top, bottom, back, and five shelf boards. */
export function BookcaseStructure() {
  const sideW = INNER_X          // width of each side panel
  const topY  = CASE_TOP
  const botY  = CASE_BOTTOM

  return (
    <g>
      {/* back panel */}
      <rect x={INNER_X} y={topY + BOARD_T} width={INNER_W} height={botY - topY - 2 * BOARD_T}
            fill={COLOR.BACK_FILL} stroke="none" />

      {/* left side panel */}
      <rect x={0} y={topY} width={sideW} height={botY - topY + BOARD_T}
            fill={COLOR.SIDE_FILL} stroke={COLOR.CASE_STROKE} strokeWidth={1.5} />

      {/* right side panel */}
      <rect x={INNER_R} y={topY} width={sideW} height={botY - topY + BOARD_T}
            fill={COLOR.SIDE_FILL} stroke={COLOR.CASE_STROKE} strokeWidth={1.5} />

      {/* top board */}
      <rect x={0} y={topY} width={SVG_W} height={BOARD_T}
            fill={COLOR.CASE_FILL} stroke={COLOR.CASE_STROKE} strokeWidth={1.5} />

      {/* bottom board */}
      <rect x={0} y={botY} width={SVG_W} height={BOARD_T}
            fill={COLOR.CASE_FILL} stroke={COLOR.CASE_STROKE} strokeWidth={1.5} />

      {/* five shelf boards */}
      {Array.from({ length: N_SHELVES }, (_, i) => {
        const n = i + 1
        const y = shelfTopY(n)
        return (
          <rect key={n} x={INNER_X} y={y} width={INNER_W} height={BOARD_T}
                fill={COLOR.SHELF_FILL} stroke={COLOR.SHELF_STROKE} strokeWidth={1.2} />
        )
      })}
    </g>
  )
}

/** Shelf number badge drawn on the left side of the bay above shelf n. */
export function ShelfLabel({ n }: { n: number }) {
  const my = bayMidY(n)
  const cx = 14
  return (
    <g>
      <circle cx={cx} cy={my} r={9} fill={COLOR.NUM_FILL} stroke={COLOR.NUM_STROKE} strokeWidth={1.4} />
      <text
        x={cx} y={my}
        textAnchor="middle" dominantBaseline="central"
        fontSize={11} fontWeight={800} fill={COLOR.INK}
        fontFamily="system-ui, sans-serif"
      >
        {n}
      </text>
    </g>
  )
}

// ── toy glyph (simple iconic SVG primitives) ─────────────────────────────────

export type ToyName = 'ball' | 'blocks' | 'game' | 'puzzle' | 'car'

export const TOY_COLOR: Record<ToyName, string> = {
  ball:   '#EF4444', // red
  blocks: '#F59E0B', // amber
  game:   '#8B5CF6', // violet
  puzzle: '#10B981', // green
  car:    '#3B82F6', // blue
}

/** Renders a small toy icon centred at (cx, cy), sized to fit in a shelf bay. */
export function ToyIcon({ toy, cx, cy, size = 26, opacity = 1 }: {
  toy: ToyName
  cx: number
  cy: number
  size?: number
  opacity?: number
}) {
  const h = size / 2
  const c = TOY_COLOR[toy]
  const dk = '#1F2937' // dark stroke

  if (toy === 'ball') {
    return (
      <g opacity={opacity}>
        <circle cx={cx} cy={cy} r={h * 0.85} fill={c} stroke={dk} strokeWidth={1.4} />
        <path d={`M${cx - h * 0.5},${cy - h * 0.3} Q${cx},${cy - h * 0.9} ${cx + h * 0.5},${cy - h * 0.3}`}
              fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={1.5} />
      </g>
    )
  }

  if (toy === 'blocks') {
    // a small stack of two square blocks
    const bw = size * 0.38
    return (
      <g opacity={opacity}>
        <rect x={cx - bw} y={cy - h * 0.05} width={bw * 0.95} height={bw * 0.9}
              fill={c} stroke={dk} strokeWidth={1.2} rx={2} />
        <rect x={cx + bw * 0.05} y={cy - h * 0.05} width={bw * 0.95} height={bw * 0.9}
              fill="#FCD34D" stroke={dk} strokeWidth={1.2} rx={2} />
        <rect x={cx - bw * 0.45} y={cy - h * 0.95} width={bw * 0.9} height={bw * 0.9}
              fill={c} stroke={dk} strokeWidth={1.2} rx={2} />
      </g>
    )
  }

  if (toy === 'game') {
    // a game console outline
    const w = size * 0.85
    const gh = size * 0.55
    return (
      <g opacity={opacity}>
        <rect x={cx - w / 2} y={cy - gh / 2} width={w} height={gh}
              fill={c} stroke={dk} strokeWidth={1.3} rx={5} />
        {/* d-pad cross */}
        <rect x={cx - w * 0.28} y={cy - gh * 0.12} width={w * 0.18} height={gh * 0.4}
              fill="#fff" rx={1} />
        <rect x={cx - w * 0.37} y={cy} width={w * 0.36} height={gh * 0.18}
              fill="#fff" rx={1} />
        {/* button */}
        <circle cx={cx + w * 0.24} cy={cy} r={gh * 0.16} fill="#fff" />
      </g>
    )
  }

  if (toy === 'puzzle') {
    // a jigsaw-style piece (simple interlocking shape)
    const s = size * 0.44
    return (
      <g opacity={opacity}>
        <rect x={cx - s} y={cy - s} width={s * 2} height={s * 2}
              fill={c} stroke={dk} strokeWidth={1.3} rx={3} />
        {/* tab out */}
        <circle cx={cx + s} cy={cy} r={s * 0.32} fill={c} stroke={dk} strokeWidth={1.3} />
        {/* notch in (covered by a white circle — simulates cut) */}
        <circle cx={cx} cy={cy - s} r={s * 0.28} fill={COLOR.BACK_FILL} stroke={dk} strokeWidth={1} />
        {/* lines */}
        <line x1={cx - s} y1={cy} x2={cx + s} y2={cy} stroke={dk} strokeWidth={0.8} />
        <line x1={cx} y1={cy - s} x2={cx} y2={cy + s} stroke={dk} strokeWidth={0.8} />
      </g>
    )
  }

  // car
  const w  = size * 0.9
  const ch = size * 0.48
  const wheelR = size * 0.14
  return (
    <g opacity={opacity}>
      {/* body */}
      <rect x={cx - w / 2} y={cy - ch * 0.35} width={w} height={ch * 0.65}
            fill={c} stroke={dk} strokeWidth={1.3} rx={4} />
      {/* roof */}
      <rect x={cx - w * 0.28} y={cy - ch * 0.85} width={w * 0.56} height={ch * 0.52}
            fill={c} stroke={dk} strokeWidth={1.2} rx={4} />
      {/* wheels */}
      {[-0.3, 0.3].map((xf, i) => (
        <circle key={i} cx={cx + w * xf} cy={cy + ch * 0.18} r={wheelR}
                fill="#1F2937" stroke={dk} strokeWidth={1} />
      ))}
    </g>
  )
}

// ── full static figure ───────────────────────────────────────────────────────

export default function Bookcase20PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Lemari buku lima rak bernomor 1 (bawah) sampai 5 (atas), kosong — tempat Stan menyimpan mainannya"
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H + 10}`}
        width="100%"
        style={{ display: 'block', margin: '0 auto', maxWidth: 220 }}
        aria-hidden="true"
      >
        <BookcaseStructure />
        {Array.from({ length: N_SHELVES }, (_, i) => (
          <ShelfLabel key={i + 1} n={i + 1} />
        ))}
      </svg>
    </div>
  )
}
