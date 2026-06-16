// Static card illustration for WMI-25F1A-Q2 (2025 G1 final).
//
// "A clothing store sells 4 kinds of products at the prices shown. The price
//  difference between two of the kinds is $8. What is the price difference (in
//  dollars) between the other two kinds?"   Answer: 9 (choice C).
//
// The source scan is a single row of four products, each with a tented price
// tag. Read from the origin PDF (the hat's price was dropped by OCR; recovered
// from a high-res render):
//   1. pink hat      $11
//   2. yellow shoes  $17
//   3. orange handbag $20
//   4. green socks   $9
//
// The pair differing by $8 is {shoes $17, socks $9}  (17 - 9 = 8).
// The OTHER pair is {hat $11, handbag $20}, differing by 20 - 11 = 9 → answer.
//
// This draws ONLY the setup — the four products with their visible prices. It
// never marks which pair differs by 8 or which by 9, and never reveals the
// answer. Post-answer, the animator highlights a chosen price pair via the
// co-exported primitive `ClothingPrices25G1`'s `litPair` prop (0-based indices).
//
// Pure render — no random, no dates, SSR-safe & deterministic. The primitive
// ignores bad `litPair` input so previews always render.

const INK = '#1F2937'
const BLUE = '#30598A' // qupu-brand-blue — price text + highlight outline (animator)
const TAG_FILL = '#FFF9F4' // qupu-shell — price-tag face
const TAG_SIDE = '#E4DACB' // tag fold / shadow (warm grey)
const LIT_FILL = '#FFF2DF' // qupu-cream — highlighted tag face (animator only)
const LIT_SIDE = '#F5D9BE' // highlighted tag fold (animator only)

// Product palettes (drawn icons — raw hex is allowed for the figures).
const HAT_PINK = '#E8839E'
const HAT_PINK_DARK = '#C85F7D'
const HAT_BAND = '#FBE3EB'
const SHOE_YELLOW = '#F4C53A'
const SHOE_ORANGE = '#EE7B36'
const SHOE_RED = '#D6492E'
const BAG_ORANGE = '#F0853A'
const BAG_ORANGE_DARK = '#C8631F'
const BAG_LIGHT = '#F8B27A'
const SOCK_OLIVE = '#7E8C3A'
const SOCK_YELLOW = '#E7C53A'
const SOCK_DOT = '#FFF6D6'

// The four products with their prices, left → right, read from the source scan.
const PRODUCTS = [
  { kind: 'hat', price: 11 },
  { kind: 'shoes', price: 17 },
  { kind: 'bag', price: 20 },
  { kind: 'socks', price: 9 },
] as const

const CELL_W = 96 // width allotted to each product column
const ICON_H = 78 // height of the product-icon band
const TAG_GAP = 12 // gap between icon and its price tag
const TAG_W = 64 // price-tag width
const TAG_H = 38 // price-tag height
const PAD = 16 // outer svg padding

/** A drawn pink sun hat. Centered in a CELL_W x ICON_H cell at (ox, oy). */
function Hat({ ox, oy }: { ox: number; oy: number }) {
  const cx = ox + CELL_W / 2
  const by = oy + ICON_H - 10 // brim baseline
  return (
    <g>
      {/* brim */}
      <ellipse cx={cx} cy={by} rx={38} ry={11} fill={HAT_PINK_DARK} />
      <ellipse cx={cx} cy={by - 2} rx={38} ry={10} fill={HAT_PINK} />
      {/* crown */}
      <path
        d={`M ${cx - 22} ${by - 2}
            Q ${cx - 24} ${by - 40} ${cx} ${by - 44}
            Q ${cx + 24} ${by - 40} ${cx + 22} ${by - 2} Z`}
        fill={HAT_PINK}
        stroke={HAT_PINK_DARK}
        strokeWidth={1.5}
      />
      {/* band */}
      <path
        d={`M ${cx - 22} ${by - 6}
            Q ${cx} ${by + 1} ${cx + 22} ${by - 6}
            L ${cx + 21} ${by - 13}
            Q ${cx} ${by - 6} ${cx - 21} ${by - 13} Z`}
        fill={HAT_BAND}
      />
      {/* bow */}
      <path d={`M ${cx + 14} ${by - 9} l 8 -5 l 0 12 Z`} fill={HAT_PINK_DARK} />
      <path d={`M ${cx + 14} ${by - 9} l -2 8 l 6 -2 Z`} fill={HAT_PINK_DARK} />
    </g>
  )
}

/** A drawn pair of yellow/red flat shoes. */
function Shoes({ ox, oy }: { ox: number; oy: number }) {
  const cx = ox + CELL_W / 2
  const baseY = oy + ICON_H - 14
  function shoe(sx: number) {
    return (
      <g>
        <path
          d={`M ${sx} ${baseY}
              q -2 -22 14 -24
              q 14 -1 14 14
              q 0 9 -6 11
              l -18 4
              q -5 1 -4 -5 Z`}
          fill={SHOE_YELLOW}
          stroke={SHOE_ORANGE}
          strokeWidth={1.6}
        />
        {/* sole */}
        <path d={`M ${sx - 1} ${baseY} l 30 -1 q 4 4 -2 6 l -26 1 q -4 -2 -2 -6 Z`} fill={SHOE_RED} />
        {/* strap */}
        <path d={`M ${sx + 8} ${baseY - 16} q 7 -7 14 0`} fill="none" stroke={SHOE_ORANGE} strokeWidth={2.4} />
        {/* bow accent */}
        <circle cx={sx + 4} cy={baseY - 9} r={2.6} fill={SHOE_RED} />
      </g>
    )
  }
  return (
    <g>
      <g transform={`translate(${cx - 34}, 0)`}>{shoe(0)}</g>
      <g transform={`translate(${cx + 2}, 0)`}>{shoe(0)}</g>
    </g>
  )
}

/** A drawn orange handbag/purse. */
function Bag({ ox, oy }: { ox: number; oy: number }) {
  const cx = ox + CELL_W / 2
  const top = oy + 14
  const bodyTop = top + 18
  const bodyBot = oy + ICON_H - 8
  return (
    <g>
      {/* handle */}
      <path
        d={`M ${cx - 16} ${bodyTop}
            Q ${cx - 18} ${top} ${cx} ${top}
            Q ${cx + 18} ${top} ${cx + 16} ${bodyTop}`}
        fill="none"
        stroke={BAG_ORANGE}
        strokeWidth={6}
        strokeLinecap="round"
      />
      {/* body */}
      <path
        d={`M ${cx - 24} ${bodyTop}
            L ${cx + 24} ${bodyTop}
            Q ${cx + 28} ${bodyTop} ${cx + 26} ${bodyBot - 6}
            Q ${cx + 25} ${bodyBot} ${cx + 18} ${bodyBot}
            L ${cx - 18} ${bodyBot}
            Q ${cx - 25} ${bodyBot} ${cx - 26} ${bodyBot - 6}
            Q ${cx - 28} ${bodyTop} ${cx - 24} ${bodyTop} Z`}
        fill={BAG_ORANGE}
        stroke={BAG_ORANGE_DARK}
        strokeWidth={1.6}
      />
      {/* flap highlight */}
      <path
        d={`M ${cx - 22} ${bodyTop + 2} L ${cx + 22} ${bodyTop + 2} L ${cx + 20} ${bodyTop + 12} L ${cx - 20} ${bodyTop + 12} Z`}
        fill={BAG_LIGHT}
        opacity={0.7}
      />
      {/* clasp */}
      <rect x={cx - 4} y={bodyTop + 14} width={8} height={6} rx={2} fill={BAG_ORANGE_DARK} />
    </g>
  )
}

/** A drawn green/yellow patterned sock. */
function Socks({ ox, oy }: { ox: number; oy: number }) {
  const cx = ox + CELL_W / 2
  const top = oy + 10
  const cuffH = 12
  return (
    <g>
      {/* leg + foot (L-shape) */}
      <path
        d={`M ${cx - 12} ${top}
            L ${cx + 12} ${top}
            L ${cx + 12} ${top + 40}
            Q ${cx + 12} ${top + 48} ${cx + 20} ${top + 50}
            L ${cx + 30} ${top + 52}
            Q ${cx + 38} ${top + 54} ${cx + 36} ${top + 62}
            Q ${cx + 34} ${top + 68} ${cx + 26} ${top + 66}
            L ${cx - 4} ${top + 60}
            Q ${cx - 12} ${top + 58} ${cx - 12} ${top + 48} Z`}
        fill={SOCK_OLIVE}
        stroke="#5E6A2A"
        strokeWidth={1.5}
      />
      {/* cuff */}
      <rect x={cx - 13} y={top - 1} width={26} height={cuffH} rx={3} fill={SOCK_YELLOW} stroke="#5E6A2A" strokeWidth={1.3} />
      {/* star + dots pattern */}
      <path
        d={`M ${cx} ${top + 20} l 2.2 4.6 l 5 0.5 l -3.7 3.4 l 1.1 4.9 l -4.6 -2.6 l -4.6 2.6 l 1.1 -4.9 l -3.7 -3.4 l 5 -0.5 Z`}
        fill={SOCK_YELLOW}
      />
      <circle cx={cx - 5} cy={top + 38} r={2.2} fill={SOCK_DOT} />
      <circle cx={cx + 6} cy={top + 42} r={2.2} fill={SOCK_DOT} />
      <circle cx={cx + 18} cy={top + 54} r={2} fill={SOCK_DOT} />
    </g>
  )
}

const ICONS: Record<string, (p: { ox: number; oy: number }) => JSX.Element> = {
  hat: Hat,
  shoes: Shoes,
  bag: Bag,
  socks: Socks,
}

/**
 * The row of four priced products.
 *
 * @param litPair  0-based indices (length 2) of the price pair to highlight.
 *                 The animator can light {1, 3} (shoes $17 & socks $9, the pair
 *                 differing by 8) or {0, 2} (hat $11 & bag $20, differing by 9).
 *                 Out-of-range / non-array / null input is ignored, so with no
 *                 props it renders the bare problem setup.
 *
 * The products and their prices are fixed (the question's data) and never change.
 */
export function ClothingPrices25G1({ litPair }: { litPair?: number[] | null } = {}) {
  const litSet = new Set(
    (Array.isArray(litPair) ? litPair : []).filter(
      (i) => Number.isInteger(i) && i >= 0 && i < PRODUCTS.length,
    ),
  )

  const width = PAD * 2 + PRODUCTS.length * CELL_W
  const height = PAD * 2 + ICON_H + TAG_GAP + TAG_H

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: 460, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {PRODUCTS.map((p, i) => {
        const ox = PAD + i * CELL_W
        const oy = PAD
        const Icon = ICONS[p.kind]
        const lit = litSet.has(i)

        // Tented price tag, centered under the icon.
        const tagX = ox + (CELL_W - TAG_W) / 2
        const tagY = oy + ICON_H + TAG_GAP
        const faceFill = lit ? LIT_FILL : TAG_FILL
        const foldFill = lit ? LIT_SIDE : TAG_SIDE
        const stroke = lit ? BLUE : INK
        const strokeW = lit ? 2.6 : 1.8

        return (
          <g key={i}>
            {Icon ? <Icon ox={ox} oy={oy} /> : null}

            {/* price tag: a small tent (folded card) */}
            {/* back fold */}
            <path
              d={`M ${tagX + TAG_W - 10} ${tagY}
                  L ${tagX + TAG_W} ${tagY + TAG_H}
                  L ${tagX + TAG_W - 12} ${tagY + TAG_H} Z`}
              fill={foldFill}
              stroke={stroke}
              strokeWidth={strokeW}
              strokeLinejoin="round"
            />
            {/* face */}
            <rect
              x={tagX}
              y={tagY}
              width={TAG_W - 10}
              height={TAG_H}
              rx={4}
              fill={faceFill}
              stroke={stroke}
              strokeWidth={strokeW}
            />
            {/* price */}
            <text
              x={tagX + (TAG_W - 10) / 2}
              y={tagY + TAG_H / 2 + 7}
              textAnchor="middle"
              fontSize={20}
              fontWeight="bold"
              fill={BLUE}
            >
              {`$${p.price}`}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Default export — the bare row of four priced products inside the card (no box). */
export default function ClothingPrices25G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Toko pakaian menjual empat jenis barang dengan harganya: ' +
        'topi seharga $11, sepatu seharga $17, tas seharga $20, dan kaus kaki seharga $9. ' +
        'Gambar belum menandai pasangan harga mana pun.'
      }
    >
      <ClothingPrices25G1 />
    </div>
  )
}
