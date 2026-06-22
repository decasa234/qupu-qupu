// IKMC-21-EC-Q18 — "7 cards turned upside-down" stem illustration.
//
// READING THE SCAN (docs/reference/ocr-res/ikmc/contest/ecolier/2021.imgs/059.jpg):
//   Seven cards labeled A–G arranged side by side in one row.
//   Each card shows two numbers: the top number is upright, the bottom number is
//   printed upside-down (representing the "other side" value when flipped).
//   Top row values:    A=7  B=5  C=4  D=2  E=8  F=3  G=2  → sum=31
//   Bottom row values: A=4  B=3  C=5  D=5  E=7  F=7  G=4  → sum=35
//
// QUESTION: Which single card should the teacher flip upside-down so that the
//   sum of the top-row numbers equals the sum of the bottom-row numbers?
// ANSWER: Card G (top=2, bottom=4); flipping it makes both rows = 33. Answer E.
//
// STEM ONLY: choices are text labels (A / C / D / F / G), not picture options.
//
// Co-exports:
//   UpsideCards18EC        — shared primitive (used by explainer)
//   CARDS_DATA             — card label + top/bottom values (anti-drift)
//   UC18_VW / UC18_VH      — shared SVG viewport constants
//
// Pure render, SSR-safe, deterministic.

// ── Palette (qupu tokens) ─────────────────────────────────────────────────────
const CARD_FILL    = '#FFFBF2'
const CARD_STROKE  = '#D97706'
const INK          = '#1F2937'
const LABEL_BG     = '#FEF3C7'
const LABEL_STROKE = '#D97706'
const FLIP_STROKE  = '#DC2626'   // red border when highlighted (for explainer)
const FLIP_BG      = '#FEF2F2'

// ── Card data (bound to seed quantities — anti-drift) ─────────────────────────
export interface CardDatum {
  label: string    // 'A'–'G'
  top: number      // value in the top row (upright)
  bottom: number   // value in the bottom row (printed upside-down on the card)
}

/** All 7 cards exactly as they appear in 2021.imgs/059.jpg. */
export const CARDS_DATA: CardDatum[] = [
  { label: 'A', top: 7, bottom: 4 },
  { label: 'B', top: 5, bottom: 3 },
  { label: 'C', top: 4, bottom: 5 },
  { label: 'D', top: 2, bottom: 5 },
  { label: 'E', top: 8, bottom: 7 },
  { label: 'F', top: 3, bottom: 7 },
  { label: 'G', top: 2, bottom: 4 },
]

// ── Layout constants ──────────────────────────────────────────────────────────
const CW        = 44   // card width
const CH        = 64   // card height (two rows: top + bottom numbers)
const CR        = 5    // corner radius
const GAP       = 6    // horizontal gap between cards
const LABEL_H   = 16   // height of the bottom card label bar
const PAD_X     = 8
const PAD_Y     = 10

const N = CARDS_DATA.length  // 7

export const UC18_VW = N * CW + (N - 1) * GAP + 2 * PAD_X   // 7*44+6*6+16 = 380
export const UC18_VH = CH + LABEL_H + 2 * PAD_Y              // 64+16+20 = 100

// ── Shared primitive ──────────────────────────────────────────────────────────

export interface UpsideCards18ECProps {
  /**
   * Index (0-based) of the card to highlight with a red border (the flipped card).
   * null = no highlight (default stem view).
   */
  highlightIdx?: number | null
  /**
   * When a card is highlighted (flipped), show its new top/bottom values here
   * instead of the original. Used by the explainer's "after flip" beat.
   */
  flippedValues?: { top: number; bottom: number } | null
}

/**
 * Draws the row of 7 two-sided cards exactly as in the source figure.
 * Each card has: top number (upright), divider line, bottom number (upside-down glyph).
 */
export function UpsideCards18EC({
  highlightIdx = null,
  flippedValues = null,
}: UpsideCards18ECProps = {}) {
  return (
    <svg
      viewBox={`0 0 ${UC18_VW} ${UC18_VH}`}
      width={Math.min(420, UC18_VW)}
      aria-hidden="true"
    >
      {CARDS_DATA.map((card, i) => {
        const x    = PAD_X + i * (CW + GAP)
        const y    = PAD_Y
        const isHL = highlightIdx === i

        // When flipped, swap the rendered top/bottom values
        const topVal    = isHL && flippedValues ? flippedValues.top    : card.top
        const bottomVal = isHL && flippedValues ? flippedValues.bottom : card.bottom

        const fillColor   = isHL ? FLIP_BG   : CARD_FILL
        const strokeColor = isHL ? FLIP_STROKE : CARD_STROKE
        const strokeW     = isHL ? 2.5 : 1.5

        const midY = y + CH / 2

        return (
          <g key={card.label}>
            {/* card body */}
            <rect
              x={x}
              y={y}
              width={CW}
              height={CH}
              rx={CR}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeW}
            />

            {/* horizontal divider */}
            <line
              x1={x + 4}
              y1={midY}
              x2={x + CW - 4}
              y2={midY}
              stroke={strokeColor}
              strokeWidth={0.8}
              opacity={0.5}
            />

            {/* top number (upright) */}
            <text
              x={x + CW / 2}
              y={midY - 8}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={18}
              fontWeight="800"
              fontFamily="sans-serif"
              fill={INK}
            >
              {topVal}
            </text>

            {/* bottom number (rotated 180° to look upside-down, matching source) */}
            <text
              x={x + CW / 2}
              y={midY + 18}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={18}
              fontWeight="800"
              fontFamily="sans-serif"
              fill={INK}
              transform={`rotate(180 ${x + CW / 2} ${midY + 18})`}
            >
              {bottomVal}
            </text>

            {/* card letter label below */}
            <rect
              x={x + (CW - 20) / 2}
              y={y + CH + 3}
              width={20}
              height={LABEL_H - 4}
              rx={3}
              fill={LABEL_BG}
              stroke={isHL ? FLIP_STROKE : LABEL_STROKE}
              strokeWidth={isHL ? 1.5 : 0.8}
            />
            <text
              x={x + CW / 2}
              y={y + CH + 11}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={10}
              fontWeight="900"
              fontFamily="sans-serif"
              fill={isHL ? '#DC2626' : '#92400E'}
            >
              {card.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Static illustration (default export) ─────────────────────────────────────

const ARIA_EN =
  '7 cards labeled A through G in a row. Each card shows two numbers: ' +
  'top (upright) and bottom (upside-down). ' +
  'Card A: top 7, bottom 4. Card B: top 5, bottom 3. Card C: top 4, bottom 5. ' +
  'Card D: top 2, bottom 5. Card E: top 8, bottom 7. Card F: top 3, bottom 7. ' +
  'Card G: top 2, bottom 4. ' +
  'Top-row sum = 31; bottom-row sum = 35. ' +
  'Which card should the teacher flip so both row sums are equal?'

const ARIA_ID =
  '7 kartu berlabel A sampai G berjajar. Setiap kartu menunjukkan dua angka: ' +
  'atas (tegak) dan bawah (terbalik). ' +
  'Kartu A: atas 7, bawah 4. Kartu B: atas 5, bawah 3. Kartu C: atas 4, bawah 5. ' +
  'Kartu D: atas 2, bawah 5. Kartu E: atas 8, bawah 7. Kartu F: atas 3, bawah 7. ' +
  'Kartu G: atas 2, bawah 4. ' +
  'Jumlah baris atas = 31; jumlah baris bawah = 35. ' +
  'Kartu mana yang harus dibalik oleh guru agar kedua baris memiliki jumlah yang sama?'

export default function UpsideCards18ECIllustration({ lang = 'en' }: { lang?: string } = {}) {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={lang === 'id' ? ARIA_ID : ARIA_EN}
    >
      <UpsideCards18EC />
    </div>
  )
}
