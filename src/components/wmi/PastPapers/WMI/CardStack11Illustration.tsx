// IKMC-19-PE-Q11 (2019 IKMC Pre-Ecolier Q11) — five overlapping square cards.
//
// "Five square cards are stacked on a table, as shown. The cards are removed
//  one by one from the top of the stack. In what order are the cards removed?"
//  Answer: D — 5-2-3-1-4 (top to bottom).
//
// The static illustration shows ONLY the initial stacking arrangement — five
// overlapping coloured numbered squares exactly as in the source figure
// (docs/reference/ocr-res/ikmc/contest/preecolier/2019.imgs/016.jpg).
//
// From the source crop the layout is:
//   Card 1 (green)  — top-left
//   Card 4 (yellow) — top-right
//   Card 3 (white)  — centre horizontal strip (over cards 1, 2, 4, 5)
//   Card 2 (blue)   — bottom-left
//   Card 5 (red)    — large, bottom-right
//
// Stacking order top→bottom: 5, 2, 3, 1, 4
// (card 5 is rendered last / highest z; card 4 is rendered first / lowest z)
//
// Co-exports:
//   CardStack11          — the raw primitive used by the explainer
//   CARD_STACK_ORDER     — [5, 2, 3, 1, 4] removal order
//   CARD_COLORS          — per-card fill palette
//
// Pure render, SSR-safe, deterministic — no random / Date / side-effects.

// ── palette ──────────────────────────────────────────────────────────────────
const INK = '#1F2937'

// Colours match the source scan (approximate QUPU-token neighbours).
export const CARD_COLORS: Record<number, { fill: string; label: string }> = {
  1: { fill: '#8CC63F', label: '#1F4D00' },  // green  (qupu-brand-green family)
  2: { fill: '#29ABE2', label: '#003D5C' },  // blue   (qupu-brand-blue family)
  3: { fill: '#FFFFFF', label: '#1F2937' },  // white  (plain card)
  4: { fill: '#F7C72E', label: '#5A3D00' },  // yellow
  5: { fill: '#E8342A', label: '#5C0000' },  // red    (warm accent)
}

// ── layout ───────────────────────────────────────────────────────────────────
// All coords in the 280 × 260 viewBox.
export const VIEW_W = 280
export const VIEW_H = 260
const S = 108 // card side length

// Card positions — {x, y} = top-left corner of the card rect
export const CARD_POS: Record<number, { x: number; y: number }> = {
  1: { x: 10,  y: 10  },   // top-left
  4: { x: 142, y: 10  },   // top-right
  3: { x: 56,  y: 80  },   // centre horizontal strip (slightly shorter)
  2: { x: 10,  y: 140 },   // bottom-left
  5: { x: 100, y: 118 },   // bottom-right, large
}

// Card 3 is a flatter rectangle (wide horizontal strip across the middle)
// Card heights: most are S×S squares; card 3 is a shorter-height strip
export const CARD_SIZE: Record<number, { w: number; h: number }> = {
  1: { w: S,       h: S },
  4: { w: S,       h: S },
  3: { w: S + 36,  h: 52 },  // wider, shorter — horizontal strip
  2: { w: S,       h: S },
  5: { w: S + 22,  h: S + 22 },  // largest card at bottom-right
}

// Stacking z-order: rendered bottom-to-top (first = bottom, last = top).
// Bottom: 4, then 1, then 3, then 2, then 5 (top).
const Z_ORDER = [4, 1, 3, 2, 5] as const

// The removal sequence (top to bottom):
export const CARD_STACK_ORDER = [5, 2, 3, 1, 4] as const

// ── sub-component ────────────────────────────────────────────────────────────

interface CardProps {
  id: number
  /** 0–1 opacity, used by the explainer to dim removed cards. */
  opacity?: number
  /** Override fill (explainer uses this to highlight the top card). */
  highlight?: boolean
}

export function SquareCard({ id, opacity = 1, highlight = false }: CardProps) {
  const { x, y } = CARD_POS[id]
  const { w, h } = CARD_SIZE[id]
  const { fill, label } = CARD_COLORS[id]
  const strokeW = highlight ? 3.5 : 2.5

  return (
    <g opacity={opacity}>
      {/* card face */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={4}
        fill={fill}
        stroke={INK}
        strokeWidth={strokeW}
      />
      {/* highlight ring for the "currently on top" beat */}
      {highlight && (
        <rect
          x={x - 4}
          y={y - 4}
          width={w + 8}
          height={h + 8}
          rx={7}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={3}
          strokeDasharray="6 3"
        />
      )}
      {/* card number */}
      <text
        x={x + w / 2}
        y={y + h / 2 + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={32}
        fontWeight={800}
        fill={label}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {id}
      </text>
    </g>
  )
}

// ── primitive ─────────────────────────────────────────────────────────────────

export interface CardStack11Props {
  /**
   * Set of card IDs that have already been removed (explainer uses this to
   * fade them out). The static illustration passes an empty set.
   */
  removed?: ReadonlySet<number>
  /**
   * Which card is currently being highlighted as the "top" card (explainer
   * passes the next card to remove). Null = no highlight.
   */
  highlight?: number | null
}

/**
 * Raw primitive: renders all five cards in the correct stacking order.
 * `removed` cards are faded to 0.12 opacity; `highlight` draws a dashed
 * amber ring around the top card. The static illustration passes no props.
 */
export function CardStack11({ removed = new Set(), highlight = null }: CardStack11Props) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* table surface */}
      <rect x={0} y={VIEW_H - 18} width={VIEW_W} height={18} fill="#E5D9B6" />
      <line x1={0} y1={VIEW_H - 18} x2={VIEW_W} y2={VIEW_H - 18} stroke="#C4A95A" strokeWidth={2} />

      {/* cards, bottom-to-top z order */}
      {Z_ORDER.map((id) => (
        <SquareCard
          key={id}
          id={id}
          opacity={removed.has(id) ? 0.12 : 1}
          highlight={highlight === id}
        />
      ))}
    </svg>
  )
}

// ── static illustration ───────────────────────────────────────────────────────

const ARIA_ID =
  'Lima kartu persegi ditumpuk di atas meja: kartu 1 (hijau, kiri atas), kartu 4 (kuning, kanan atas), ' +
  'kartu 3 (putih, tengah), kartu 2 (biru, kiri bawah), dan kartu 5 (merah, kanan bawah). ' +
  'Kartu diambil satu per satu dari atas tumpukan — tentukan urutannya.'

export default function CardStack11Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA_ID}>
      <CardStack11 />
    </div>
  )
}
