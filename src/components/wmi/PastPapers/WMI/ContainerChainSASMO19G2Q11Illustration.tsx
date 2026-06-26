// SASMO-19-G2-Q11 — container-chain equivalence stem illustration.
//
// Q: "Berapa banyak cangkir air yang diperlukan untuk mengisi penuh ember?"
//    "How many cups of water are needed to fill up the pail?"
// Answer: D — 6 cups.
//
// Figure (scan 2019-2020.imgs/015.jpg) shows three picture-equation rows:
//   Row 1:  1 Pail      →  1 Gallon  + 1 Cup   + 1 Bottle
//   Row 2:  2 Gallons   →  4 Cups   + 1 Bottle
//   Row 3:  1 Bottle    →  2 Cups
//
// Solution chain:
//   1 Bottle  = 2 Cups
//   2 Gallons = 4 Cups + 1 Bottle = 4 + 2 = 6 Cups  →  1 Gallon = 3 Cups
//   1 Pail    = 1 Gallon + 1 Cup + 1 Bottle = 3 + 1 + 2 = 6 Cups   (Answer D)
//
// No CHOICE_RENDERERS needed — choices are text-only (A=5, B=4, C=9, D=6, E=None).
//
// Co-exports for the explainer (all SSR-safe, no hooks, no framer-motion):
//   CupGlyph2, BottleGlyph, GallonGlyph, PailGlyph
//
// Default export: ContainerChainSASMO19G2Q11Illustration({ lang?, highlightRow? })

// ── palette ───────────────────────────────────────────────────────────────────
const STROKE  = '#374151'
const FILL    = '#FFFFFF'
const HI_S    = '#F59E0B'
const HI_F    = '#FEF3C7'
const DIM_OPY = 0.28
const SW      = 1.8

// ── container glyphs ─────────────────────────────────────────────────────────
// Each glyph is centred at `cx` with its body bottom at `yBot`.

/** Drinking glass: top W=22, bottom W=15, body H=36, rim ellipse. */
export function CupGlyph2({
  cx, yBot, hi = false,
}: { cx: number; yBot: number; hi?: boolean }) {
  const s = hi ? HI_S : STROKE
  const f = hi ? HI_F : FILL
  const sw = hi ? 2.5 : SW
  return (
    <g>
      <path
        d={`M${cx - 11},${yBot - 36} L${cx + 11},${yBot - 36} L${cx + 7.5},${yBot} L${cx - 7.5},${yBot} Z`}
        fill={f} stroke={s} strokeWidth={sw} strokeLinejoin="round"
      />
      <ellipse cx={cx} cy={yBot - 36} rx={11} ry={2.5}
        fill={f} stroke={s} strokeWidth={sw}
      />
    </g>
  )
}

/** Milk/water bottle: body H=30 W=22, shoulder H=8, neck H=8 W=12, cap H=4. Total H=50. */
export function BottleGlyph({
  cx, yBot, hi = false,
}: { cx: number; yBot: number; hi?: boolean }) {
  const s = hi ? HI_S : STROKE
  const f = hi ? HI_F : FILL
  const sw = hi ? 2.5 : SW
  const bY = yBot - 30
  return (
    <g>
      {/* body */}
      <rect x={cx - 11} y={bY} width={22} height={30} rx={2} fill={f} stroke={s} strokeWidth={sw} />
      {/* shoulder: trapezoid neck-to-body */}
      <path
        d={`M${cx - 6},${bY - 8} L${cx + 6},${bY - 8} L${cx + 11},${bY} L${cx - 11},${bY} Z`}
        fill={f} stroke={s} strokeWidth={sw} strokeLinejoin="round"
      />
      {/* neck */}
      <rect x={cx - 6} y={bY - 16} width={12} height={8} fill={f} stroke={s} strokeWidth={sw} />
      {/* cap */}
      <rect x={cx - 5} y={bY - 20} width={10} height={4} rx={2}
        fill={hi ? '#FCD34D' : '#9CA3AF'} stroke={s} strokeWidth={sw}
      />
      {/* body detail line */}
      <line x1={cx - 9} y1={yBot - 14} x2={cx + 9} y2={yBot - 14} stroke={s} strokeWidth={sw * 0.6} />
    </g>
  )
}

/** Wide jug: body W=30 H=34, collar H=8, cap H=4, handle on right side. Total H=46. */
export function GallonGlyph({
  cx, yBot, hi = false,
}: { cx: number; yBot: number; hi?: boolean }) {
  const s = hi ? HI_S : STROKE
  const f = hi ? HI_F : FILL
  const sw = hi ? 2.5 : SW
  const bY = yBot - 34
  return (
    <g>
      {/* body */}
      <rect x={cx - 15} y={bY} width={30} height={34} rx={2} fill={f} stroke={s} strokeWidth={sw} />
      {/* collar: trapezoid body-to-neck */}
      <path
        d={`M${cx - 10},${bY - 8} L${cx + 10},${bY - 8} L${cx + 15},${bY} L${cx - 15},${bY} Z`}
        fill={f} stroke={s} strokeWidth={sw} strokeLinejoin="round"
      />
      {/* cap */}
      <rect x={cx - 7} y={bY - 12} width={14} height={4} rx={2}
        fill={hi ? '#FCD34D' : '#9CA3AF'} stroke={s} strokeWidth={sw}
      />
      {/* handle (cubic bezier on right side of body) */}
      <path
        d={`M${cx + 15},${bY + 6} C${cx + 22},${bY + 6} ${cx + 22},${bY + 22} ${cx + 15},${bY + 22}`}
        fill="none" stroke={s} strokeWidth={sw} strokeLinecap="round"
      />
      {/* body detail lines */}
      <line x1={cx - 13} y1={bY + 12} x2={cx + 12} y2={bY + 12} stroke={s} strokeWidth={sw * 0.6} />
      <line x1={cx - 13} y1={bY + 22} x2={cx + 12} y2={bY + 22} stroke={s} strokeWidth={sw * 0.6} />
    </g>
  )
}

/** Bucket: top W=40, bottom W=30, body H=42, arc handle above. */
export function PailGlyph({
  cx, yBot, hi = false,
}: { cx: number; yBot: number; hi?: boolean }) {
  const s = hi ? HI_S : STROKE
  const f = hi ? HI_F : FILL
  const sw = hi ? 2.5 : SW
  const bTop = yBot - 42
  return (
    <g>
      {/* body: trapezoid wider at top */}
      <path
        d={`M${cx - 20},${bTop} L${cx + 20},${bTop} L${cx + 15},${yBot} L${cx - 15},${yBot} Z`}
        fill={f} stroke={s} strokeWidth={sw} strokeLinejoin="round"
      />
      {/* handle arc going upward from top rim (sweep=0 → bows up) */}
      <path
        d={`M${cx - 16},${bTop} A20,14 0 0 0 ${cx + 16},${bTop}`}
        fill="none" stroke={s} strokeWidth={sw} strokeLinecap="round"
      />
      {/* body detail line */}
      <line x1={cx - 17} y1={bTop + 20} x2={cx + 17} y2={bTop + 20} stroke={s} strokeWidth={sw * 0.6} />
    </g>
  )
}

// ── local layout helpers ──────────────────────────────────────────────────────

function RowArrow({ cx, cy }: { cx: number; cy: number }) {
  const hw = 11, shH = 5, headH = 9, headW = 9
  return (
    <polygon
      points={[
        [cx - hw,           cy - shH ],
        [cx + hw - headW,   cy - shH ],
        [cx + hw - headW,   cy - headH],
        [cx + hw,           cy        ],
        [cx + hw - headW,   cy + headH],
        [cx + hw - headW,   cy + shH ],
        [cx - hw,           cy + shH ],
      ].map(([x, y]) => `${x},${y}`).join(' ')}
      fill="#9CA3AF"
    />
  )
}

function RowPlus({ x, cy }: { x: number; cy: number }) {
  return (
    <text x={x} y={cy + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#9CA3AF">
      +
    </text>
  )
}

function Label({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" fontSize="9" fontWeight="600" fill="#6B7280">
      {text}
    </text>
  )
}

// ── layout constants (pre-computed, centred in 290-wide viewBox) ──────────────
//
// Row 1:  Pail(44) Arrow(26) Gallon(36) +(10) Cup(22) +(10) Bottle(24)  = 172
// Row 2:  Gallon(36) +(10) Gallon(36) Arrow(26) Cup(22) +(10) ×3 +(10) Bottle(24) = 260
// Row 3:  Bottle(24) Arrow(26) Cup(22) +(10) Cup(22) = 104

const R1_Y = 72    // yBot for Row 1 (pail handle top ≈ y=16, SVG top pad 10 ✓)
const R2_Y = 148   // yBot for Row 2
const R3_Y = 228   // yBot for Row 3

const R1_ARROW_CY = 50   // vertical centre of row-1 arrow
const R2_ARROW_CY = 125  // vertical centre of row-2 arrow
const R3_ARROW_CY = 207  // vertical centre of row-3 arrow

// Row 1 x-centres
const R1_PAIL   = 81
const R1_ARROW  = 116
const R1_GAL    = 147
const R1_P1     = 170  // plus between gallon and cup
const R1_CUP    = 186
const R1_P2     = 202  // plus between cup and bottle
const R1_BOT    = 219

// Row 2 x-centres
const R2_GAL1   = 33
const R2_P1     = 56
const R2_GAL2   = 79
const R2_ARROW  = 110
const R2_CUP1   = 134
const R2_P2     = 150
const R2_CUP2   = 166
const R2_P3     = 182
const R2_CUP3   = 198
const R2_P4     = 214
const R2_CUP4   = 230
const R2_P5     = 246
const R2_BOT    = 263

// Row 3 x-centres
const R3_BOT    = 105
const R3_ARROW  = 130
const R3_CUP1   = 154
const R3_P1     = 170
const R3_CUP2   = 186

// ── aria labels ───────────────────────────────────────────────────────────────
const ARIA_EN =
  'Container chain: 1 pail equals 1 gallon plus 1 cup plus 1 bottle. ' +
  '2 gallons equal 4 cups plus 1 bottle. 1 bottle equals 2 cups. ' +
  'How many cups fill the pail?'

const ARIA_ID =
  'Rantai wadah: 1 ember sama dengan 1 galon ditambah 1 cangkir ditambah 1 botol. ' +
  '2 galon sama dengan 4 cangkir ditambah 1 botol. 1 botol sama dengan 2 cangkir. ' +
  'Berapa banyak cangkir yang mengisi penuh ember?'

// ── main component ────────────────────────────────────────────────────────────

export default function ContainerChainSASMO19G2Q11Illustration({
  lang = 'en',
  highlightRow = null,
}: {
  lang?: string
  highlightRow?: 1 | 2 | 3 | null
} = {}) {
  const h1 = highlightRow === 1
  const h2 = highlightRow === 2
  const h3 = highlightRow === 3
  const dimming = highlightRow !== null

  const t = (en: string, id: string) => lang === 'id' ? id : en

  return (
    <div
      className="my-4 flex justify-center overflow-x-auto"
      role="img"
      aria-label={lang === 'id' ? ARIA_ID : ARIA_EN}
    >
      <svg viewBox="0 0 290 256" width={Math.min(560, 290 * 2)} style={{ display: 'block' }}>

        {/* ── Row 1: Pail → Gallon + Cup + Bottle ── */}
        <g opacity={dimming && !h1 ? DIM_OPY : 1}>
          <PailGlyph   cx={R1_PAIL}  yBot={R1_Y} hi={h1} />
          <RowArrow cx={R1_ARROW} cy={R1_ARROW_CY} />
          <GallonGlyph cx={R1_GAL}   yBot={R1_Y} hi={h1} />
          <RowPlus  x={R1_P1} cy={R1_ARROW_CY} />
          <CupGlyph2   cx={R1_CUP}   yBot={R1_Y} hi={h1} />
          <RowPlus  x={R1_P2} cy={R1_ARROW_CY} />
          <BottleGlyph cx={R1_BOT}   yBot={R1_Y} hi={h1} />
          {/* label */}
          <Label x={R1_PAIL} y={R1_Y + 14} text={t('Pail', 'Ember')} />
        </g>

        {/* ── Row 2: Gallon + Gallon → Cup × 4 + Bottle ── */}
        <g opacity={dimming && !h2 ? DIM_OPY : 1}>
          <GallonGlyph cx={R2_GAL1}  yBot={R2_Y} hi={h2} />
          <RowPlus  x={R2_P1}    cy={R2_ARROW_CY} />
          <GallonGlyph cx={R2_GAL2}  yBot={R2_Y} hi={h2} />
          <RowArrow cx={R2_ARROW} cy={R2_ARROW_CY} />
          <CupGlyph2   cx={R2_CUP1}  yBot={R2_Y} hi={h2} />
          <RowPlus  x={R2_P2}    cy={R2_ARROW_CY} />
          <CupGlyph2   cx={R2_CUP2}  yBot={R2_Y} hi={h2} />
          <RowPlus  x={R2_P3}    cy={R2_ARROW_CY} />
          <CupGlyph2   cx={R2_CUP3}  yBot={R2_Y} hi={h2} />
          <RowPlus  x={R2_P4}    cy={R2_ARROW_CY} />
          <CupGlyph2   cx={R2_CUP4}  yBot={R2_Y} hi={h2} />
          <RowPlus  x={R2_P5}    cy={R2_ARROW_CY} />
          <BottleGlyph cx={R2_BOT}   yBot={R2_Y} hi={h2} />
          {/* label */}
          <Label x={R2_GAL1} y={R2_Y + 14} text={t('Gallon', 'Galon')} />
        </g>

        {/* ── Row 3: Bottle → Cup + Cup ── */}
        <g opacity={dimming && !h3 ? DIM_OPY : 1}>
          <BottleGlyph cx={R3_BOT}  yBot={R3_Y} hi={h3} />
          <RowArrow cx={R3_ARROW} cy={R3_ARROW_CY} />
          <CupGlyph2   cx={R3_CUP1} yBot={R3_Y} hi={h3} />
          <RowPlus  x={R3_P1}   cy={R3_ARROW_CY} />
          <CupGlyph2   cx={R3_CUP2} yBot={R3_Y} hi={h3} />
          {/* labels */}
          <Label x={R3_BOT}  y={R3_Y + 14} text={t('Bottle', 'Botol')} />
          <Label x={R3_CUP1} y={R3_Y + 14} text={t('Cup', 'Cangkir')} />
        </g>

      </svg>
    </div>
  )
}
