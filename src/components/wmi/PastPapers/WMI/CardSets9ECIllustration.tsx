// IKMC-21-EC-Q9 — "Card sorts" stem + option renderer.
//
// Stem (CardSets9ECIllustration): shows the THREE card types — apple, cherry,
// grapes — exactly as the source figure 028.jpg, with a horizontal label row.
// Does NOT show any arrangement (that is the option renderer's job).
//
// Option (CardSets9ECOption): renders ONE answer option (A–E) as a row of 5
// fruit cards in the arrangement from the source paper (029–033.jpg).
// Co-exported so CHOICE_RENDERERS can pick it up without importing the full
// illustration.
//
// CARD_SETS: the five arrangements. Bound to choice LABEL so the rendered
// sequence can never drift from the paper's figure.
//
// Fruit symbols are pure SVG geometry: apple = circle + stem + leaf;
// cherry = two circles + stems; grapes = cluster of circles.
//
// Pure render, SSR-safe, deterministic.

import type { WmiChoice } from '../../../../types/wmi'

// ── Palette (qupu tokens) ─────────────────────────────────────────────────────
const CREAM = '#FFF6E0'
const CREAM_EDGE = '#E4C97A'
const ORANGE = '#F2912B'
const ORANGE_DK = '#C56A12'
const RED_FRUIT = '#DC2626' // apple/cherry red
const RED_DK = '#991B1B' // darker red for fruit shading
const LEAF = '#16A34A' // green leaf
const GRAPE = '#7C3AED' // purple grapes
const GRAPE_DK = '#5B21B6'
const STEM_C = '#78350F' // brown stem

// ── Card geometry ─────────────────────────────────────────────────────────────
const CW = 40 // card width
const CH = 52 // card height
const CR = 4 // card corner radius

// ── Fruit renderers (SVG <g> fragments, drawn centred in the card) ────────────

/** Apple: red circle body, brown stem, green leaf. */
function Apple({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {/* body */}
      <circle cx={cx} cy={cy + 3} r={11} fill={RED_FRUIT} stroke={RED_DK} strokeWidth={1} />
      {/* dent at top */}
      <ellipse cx={cx} cy={cy - 7} rx={3} ry={2} fill={CREAM} />
      {/* stem */}
      <rect x={cx - 0.75} y={cy - 12} width={1.5} height={6} rx={0.75} fill={STEM_C} />
      {/* leaf */}
      <ellipse
        cx={cx + 4}
        cy={cy - 10}
        rx={5}
        ry={2.5}
        fill={LEAF}
        transform={`rotate(-30 ${cx + 4} ${cy - 10})`}
      />
    </g>
  )
}

/** Cherry: two red circles with stems meeting at a v. */
function Cherry({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {/* stems */}
      <line x1={cx} y1={cy - 8} x2={cx - 5} y2={cy + 1} stroke={STEM_C} strokeWidth={1.2} strokeLinecap="round" />
      <line x1={cx} y1={cy - 8} x2={cx + 5} y2={cy + 1} stroke={STEM_C} strokeWidth={1.2} strokeLinecap="round" />
      <line x1={cx} y1={cy - 12} x2={cx} y2={cy - 8} stroke={STEM_C} strokeWidth={1.2} strokeLinecap="round" />
      {/* berries */}
      <circle cx={cx - 5} cy={cy + 5} r={6} fill={RED_FRUIT} stroke={RED_DK} strokeWidth={1} />
      <circle cx={cx + 5} cy={cy + 5} r={6} fill={RED_FRUIT} stroke={RED_DK} strokeWidth={1} />
      {/* highlight */}
      <circle cx={cx - 7} cy={cy + 3} r={1.5} fill="white" opacity={0.5} />
      <circle cx={cx + 3} cy={cy + 3} r={1.5} fill="white" opacity={0.5} />
    </g>
  )
}

/** Grapes: cluster of 8 small circles in a triangle. */
function Grapes({ cx, cy }: { cx: number; cy: number }) {
  const R = 4
  const dots: [number, number][] = [
    [cx, cy - 6],
    [cx - 5, cy - 1],
    [cx + 5, cy - 1],
    [cx - 9, cy + 4],
    [cx, cy + 4],
    [cx + 9, cy + 4],
    [cx - 4, cy + 9],
    [cx + 4, cy + 9],
  ]
  return (
    <g>
      {/* stem */}
      <line x1={cx} y1={cy - 11} x2={cx} y2={cy - 7} stroke={STEM_C} strokeWidth={1.2} strokeLinecap="round" />
      {/* leaf */}
      <ellipse
        cx={cx + 4}
        cy={cy - 11}
        rx={4}
        ry={2}
        fill={LEAF}
        transform={`rotate(-20 ${cx + 4} ${cy - 11})`}
      />
      {/* grape circles */}
      {dots.map(([gx, gy], i) => (
        <circle key={i} cx={gx} cy={gy} r={R} fill={GRAPE} stroke={GRAPE_DK} strokeWidth={0.8} />
      ))}
    </g>
  )
}

// ── Fruit type ────────────────────────────────────────────────────────────────
export type FruitKey = 'apple' | 'cherry' | 'grapes'

function FruitGlyph({ type, cx, cy }: { type: FruitKey; cx: number; cy: number }) {
  if (type === 'apple') return <Apple cx={cx} cy={cy} />
  if (type === 'cherry') return <Cherry cx={cx} cy={cy} />
  return <Grapes cx={cx} cy={cy} />
}

// ── Card primitive ────────────────────────────────────────────────────────────
function FruitCard({
  type,
  x,
  y,
  highlight,
}: {
  type: FruitKey
  x: number
  y: number
  highlight?: boolean
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={CW}
        height={CH}
        rx={CR}
        fill={CREAM}
        stroke={highlight ? ORANGE : CREAM_EDGE}
        strokeWidth={highlight ? 2.5 : 1.5}
      />
      {/* inner frame */}
      <rect
        x={x + 3}
        y={y + 3}
        width={CW - 6}
        height={CH - 6}
        rx={2}
        fill="none"
        stroke={highlight ? ORANGE : CREAM_EDGE}
        strokeWidth={0.6}
        opacity={0.5}
      />
      <FruitGlyph type={type} cx={x + CW / 2} cy={y + CH / 2 + 1} />
    </g>
  )
}

// ── Card sequences per option ─────────────────────────────────────────────────
// Each is a row of 5 fruits, derived from the source paper 029–033.jpg.
// A is the impossible set: [apple, cherry, grapes, apple, grapes] — no single
// swap can group all same-fruit cards adjacently.
// B–E can each be fixed with exactly one swap.
export const CARD_SETS: Record<string, FruitKey[]> = {
  A: ['apple', 'cherry', 'grapes', 'apple', 'grapes'],
  B: ['grapes', 'apple', 'apple', 'grapes', 'cherry'],
  C: ['apple', 'grapes', 'grapes', 'cherry', 'apple'],
  D: ['apple', 'cherry', 'grapes', 'grapes', 'apple'],
  E: ['grapes', 'apple', 'cherry', 'grapes', 'apple'],
}

export const FRUIT_NAME_EN: Record<FruitKey, string> = {
  apple: 'apple',
  cherry: 'cherry',
  grapes: 'grapes',
}
export const FRUIT_NAME_ID: Record<FruitKey, string> = {
  apple: 'apel',
  cherry: 'ceri',
  grapes: 'anggur',
}

// ── Card row SVG (reused by stem + option) ────────────────────────────────────
const GAP = 6
const ROW_W = 5 * CW + 4 * GAP
const ROW_PAD_X = 8
const ROW_PAD_Y = 8
export const CS9_ROW_VIEW_W = ROW_W + 2 * ROW_PAD_X
export const CS9_ROW_VIEW_H = CH + 2 * ROW_PAD_Y

/** A horizontal row of 5 fruit cards. `highlight` set marks specific positions. */
export function CardRow9EC({ fruits, highlight }: { fruits: FruitKey[]; highlight?: number[] }) {
  const hlSet = new Set(highlight ?? [])
  return (
    <svg
      viewBox={`0 0 ${CS9_ROW_VIEW_W} ${CS9_ROW_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 260, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {fruits.map((f, i) => (
        <FruitCard
          key={i}
          type={f}
          x={ROW_PAD_X + i * (CW + GAP)}
          y={ROW_PAD_Y}
          highlight={hlSet.has(i)}
        />
      ))}
    </svg>
  )
}

// ── Option renderer (CHOICE_RENDERERS entry) ──────────────────────────────────
export function CardSets9ECOption({ choice }: { choice: WmiChoice }) {
  const label = (choice.label ?? '').trim().toUpperCase()
  const fruits = CARD_SETS[label]
  if (!fruits) return <span>{choice.text}</span>
  return (
    <div aria-label={`Set ${label}: ${fruits.map((f) => FRUIT_NAME_EN[f]).join(', ')}`}>
      <CardRow9EC fruits={fruits} />
    </div>
  )
}

// ── Stem illustration ─────────────────────────────────────────────────────────
// Shows the THREE card types with labels: apple | cherry | grapes.
// Mirrors the source paper's 028.jpg definition strip.
const STEM_FRUITS: FruitKey[] = ['apple', 'cherry', 'grapes']
const STEM_LABELS_EN = ['apple', 'cherry', 'grapes']
const STEM_LABELS_ID = ['apel', 'ceri', 'anggur']

const STEM_GAP = 16
const STEM_CARD_COLS = 3
const STEM_W = STEM_CARD_COLS * CW + (STEM_CARD_COLS - 1) * STEM_GAP
const STEM_PAD_X = 16
const STEM_PAD_TOP = 12
const STEM_PAD_BOT = 28 // room for labels
const STEM_VIEW_W = STEM_W + 2 * STEM_PAD_X
const STEM_VIEW_H = CH + STEM_PAD_TOP + STEM_PAD_BOT

export default function CardSets9ECIllustration({ lang = 'en' }: { lang?: 'en' | 'id' }) {
  const labels = lang === 'id' ? STEM_LABELS_ID : STEM_LABELS_EN
  const ariaLabel =
    lang === 'id'
      ? 'Tiga jenis kartu: kartu apel, kartu ceri, dan kartu anggur.'
      : 'Three card types: apple card, cherry card, and grapes card.'

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ariaLabel}>
      <svg
        viewBox={`0 0 ${STEM_VIEW_W} ${STEM_VIEW_H}`}
        width="100%"
        style={{ maxWidth: 220, display: 'block' }}
        aria-hidden="true"
      >
        {STEM_FRUITS.map((fruit, i) => {
          const x = STEM_PAD_X + i * (CW + STEM_GAP)
          const y = STEM_PAD_TOP
          return (
            <g key={fruit}>
              <FruitCard type={fruit} x={x} y={y} />
              <text
                x={x + CW / 2}
                y={y + CH + 14}
                textAnchor="middle"
                fontSize={10}
                fontWeight={600}
                fill={ORANGE_DK}
              >
                {labels[i]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
