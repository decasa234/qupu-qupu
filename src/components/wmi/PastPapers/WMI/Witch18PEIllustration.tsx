// IKMC-21-PE-Q18 — stem illustration + co-exported option renderer.
//
// PROBLEM: A witch transforms fruit using two rules:
//   Rule 1: 3 apples → 1 banana    (shown as: 🍎🍎🍎 ──→ 🍌)
//   Rule 2: 3 bananas → 1 apple    (shown as: 🍌🍌🍌 ──→ 🍎)
//
// The stem figure (036.jpg) shows both rules side by side.
// Starting state (4A, 5B) and the question are text; no separate stem figure needed
// for those.
//
// The option images (037.jpg, 038.jpg, 039.jpg) show A–E result pictures:
//   A: 1 banana
//   B: 1 apple
//   C: 1 apple + 1 banana
//   D: 2 apples
//   E: 2 bananas
//
// Primitives exported:
//   Apple({ cx, cy, s })   — red apple (circle + stem + leaf)
//   Banana({ cx, cy, s })  — yellow banana crescent
//   WitchRulePanel({ highlighted }) — the two-rule transformation panel (stem)
//
// Default export: Witch18PEIllustration — the stem card showing both rules.
// Named export:   Witch18PEOption — renders ONE answer choice (picture option).
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

import type { WmiChoice } from '../../../../types/wmi'

// ── colour tokens ────────────────────────────────────────────────────────────

export const APPLE_FILL = '#EF4444'
export const APPLE_STROKE = '#B91C1C'
export const BANANA_FILL = '#FACC15'
export const BANANA_STROKE = '#CA8A04'
export const LEAF_FILL = '#16A34A'
export const LEAF_STROKE = '#15803D'
export const STEM_COL = '#92400E'
export const ARROW_COL = '#374151'
export const PANEL_BG = '#FFFBF0'
export const PANEL_STROKE = '#E4DACB'
export const HIGHLIGHT_STROKE = '#7C3AED' // violet — for animated rule highlight

// ── Apple primitive ──────────────────────────────────────────────────────────

/** A red apple (circle + short brown stem + tilted green leaf) centred at (cx, cy). */
export function Apple({ cx, cy, s }: { cx: number; cy: number; s: number }) {
  return (
    <g>
      {/* body */}
      <circle cx={cx} cy={cy + s * 0.1} r={s * 0.48} fill={APPLE_FILL} stroke={APPLE_STROKE} strokeWidth={1.5} />
      {/* stem */}
      <line
        x1={cx}
        y1={cy - s * 0.32}
        x2={cx}
        y2={cy - s * 0.62}
        stroke={STEM_COL}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* leaf */}
      <ellipse
        cx={cx + s * 0.22}
        cy={cy - s * 0.5}
        rx={s * 0.2}
        ry={s * 0.09}
        fill={LEAF_FILL}
        stroke={LEAF_STROKE}
        strokeWidth={1}
        transform={`rotate(-28 ${cx + s * 0.22} ${cy - s * 0.5})`}
      />
    </g>
  )
}

// ── Banana primitive ─────────────────────────────────────────────────────────

/** A yellow banana crescent centred at (cx, cy). */
export function Banana({ cx, cy, s }: { cx: number; cy: number; s: number }) {
  const d = [
    `M ${cx - s * 0.56} ${cy - s * 0.22}`,
    `Q ${cx} ${cy + s * 0.74} ${cx + s * 0.56} ${cy - s * 0.22}`,
    `Q ${cx + s * 0.4} ${cy + s * 0.18} ${cx} ${cy + s * 0.34}`,
    `Q ${cx - s * 0.4} ${cy + s * 0.18} ${cx - s * 0.56} ${cy - s * 0.22}`,
    'Z',
  ].join(' ')
  return <path d={d} fill={BANANA_FILL} stroke={BANANA_STROKE} strokeWidth={1.5} strokeLinejoin="round" />
}

// ── Arrow glyph ──────────────────────────────────────────────────────────────

/** A right-pointing arrow from (x1,y) to (x2,y). */
function Arrow({ x1, x2, y, color = ARROW_COL }: { x1: number; x2: number; y: number; color?: string }) {
  const head = 7
  return (
    <g>
      <line x1={x1} y1={y} x2={x2 - head} y2={y} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <polygon
        points={`${x2},${y} ${x2 - head},${y - head * 0.55} ${x2 - head},${y + head * 0.55}`}
        fill={color}
      />
    </g>
  )
}

// ── WitchRulePanel (shared primitive) ────────────────────────────────────────

const PANEL_W = 320
const PANEL_H = 120
const ROW_Y1 = 38   // vertical centre of Rule-1 row
const ROW_Y2 = 88   // vertical centre of Rule-2 row
const FRUIT_S = 16  // fruit size for panel
const FRUIT_GAP = 36 // horizontal gap between fruits in a trio
const TRIO_X0 = 28  // x of first fruit in a trio
const ARROW_X1 = TRIO_X0 + FRUIT_GAP * 2 + FRUIT_S + 12
const ARROW_X2 = ARROW_X1 + 52
const RESULT_X = ARROW_X2 + FRUIT_S

/**
 * The two-rule transformation panel.
 *
 * @param highlighted  1 = highlight Rule-1 row, 2 = highlight Rule-2 row, null = none.
 */
export function WitchRulePanel({ highlighted = null }: { highlighted?: 1 | 2 | null }) {
  const r1Color = highlighted === 1 ? HIGHLIGHT_STROKE : ARROW_COL
  const r2Color = highlighted === 2 ? HIGHLIGHT_STROKE : ARROW_COL

  return (
    <svg
      viewBox={`0 0 ${PANEL_W} ${PANEL_H}`}
      width="100%"
      style={{ maxWidth: PANEL_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* panel background */}
      <rect
        x={0}
        y={0}
        width={PANEL_W}
        height={PANEL_H}
        rx={10}
        fill={PANEL_BG}
        stroke={PANEL_STROKE}
        strokeWidth={2}
      />

      {/* Rule 1 highlight band */}
      {highlighted === 1 && (
        <rect
          x={4}
          y={4}
          width={PANEL_W - 8}
          height={PANEL_H / 2 - 4}
          rx={7}
          fill="#EDE9FE"
          stroke={HIGHLIGHT_STROKE}
          strokeWidth={2}
        />
      )}

      {/* Rule 2 highlight band */}
      {highlighted === 2 && (
        <rect
          x={4}
          y={PANEL_H / 2 + 4}
          width={PANEL_W - 8}
          height={PANEL_H / 2 - 8}
          rx={7}
          fill="#EDE9FE"
          stroke={HIGHLIGHT_STROKE}
          strokeWidth={2}
        />
      )}

      {/* ── Rule 1: 3 apples → 1 banana ── */}
      <Apple cx={TRIO_X0} cy={ROW_Y1} s={FRUIT_S} />
      <Apple cx={TRIO_X0 + FRUIT_GAP} cy={ROW_Y1} s={FRUIT_S} />
      <Apple cx={TRIO_X0 + FRUIT_GAP * 2} cy={ROW_Y1} s={FRUIT_S} />
      <Arrow x1={ARROW_X1} x2={ARROW_X2} y={ROW_Y1} color={r1Color} />
      {/* rule 1 label */}
      <text
        x={(ARROW_X1 + ARROW_X2) / 2}
        y={ROW_Y1 - 10}
        textAnchor="middle"
        fontSize={9}
        fill={r1Color}
        fontWeight={highlighted === 1 ? 800 : 600}
      >
        Rule 1
      </text>
      <Banana cx={RESULT_X} cy={ROW_Y1} s={FRUIT_S} />

      {/* divider */}
      <line
        x1={12}
        y1={PANEL_H / 2}
        x2={PANEL_W - 12}
        y2={PANEL_H / 2}
        stroke={PANEL_STROKE}
        strokeWidth={1}
        strokeDasharray="4 3"
      />

      {/* ── Rule 2: 3 bananas → 1 apple ── */}
      <Banana cx={TRIO_X0} cy={ROW_Y2} s={FRUIT_S} />
      <Banana cx={TRIO_X0 + FRUIT_GAP} cy={ROW_Y2} s={FRUIT_S} />
      <Banana cx={TRIO_X0 + FRUIT_GAP * 2} cy={ROW_Y2} s={FRUIT_S} />
      <Arrow x1={ARROW_X1} x2={ARROW_X2} y={ROW_Y2} color={r2Color} />
      {/* rule 2 label */}
      <text
        x={(ARROW_X1 + ARROW_X2) / 2}
        y={ROW_Y2 - 10}
        textAnchor="middle"
        fontSize={9}
        fill={r2Color}
        fontWeight={highlighted === 2 ? 800 : 600}
      >
        Rule 2
      </text>
      <Apple cx={RESULT_X} cy={ROW_Y2} s={FRUIT_S} />

      {/* stroke-width override for highlighted rule arrows already handled by color + text weight */}
      {/* Re-draw arrows with extra width when highlighted */}
      {highlighted === 1 && (
        <Arrow x1={ARROW_X1} x2={ARROW_X2} y={ROW_Y1} color={r1Color} />
      )}
      {highlighted === 2 && (
        <Arrow x1={ARROW_X1} x2={ARROW_X2} y={ROW_Y2} color={r2Color} />
      )}
    </svg>
  )
}

// ── Stem illustration ────────────────────────────────────────────────────────

/**
 * Default export — the stem card.
 * Shows the two rules from the source paper (036.jpg).
 * Does NOT show the starting amounts or the answer.
 */
export default function Witch18PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Dua aturan penyihir: Aturan 1 – 3 apel menjadi 1 pisang; Aturan 2 – 3 pisang menjadi 1 apel."
    >
      <WitchRulePanel highlighted={null} />
    </div>
  )
}

// ── Option renderer ──────────────────────────────────────────────────────────

/**
 * Per-option fruit layout read directly from the source paper images
 * (037.jpg, 038.jpg, 039.jpg):
 *   A: 1 banana
 *   B: 1 apple
 *   C: 1 apple + 1 banana
 *   D: 2 apples
 *   E: 2 bananas
 */
export type OptionLabel = 'A' | 'B' | 'C' | 'D' | 'E'

interface FruitSet {
  apples: number
  bananas: number
}

const OPTION_SETS: Record<OptionLabel, FruitSet> = {
  A: { apples: 0, bananas: 1 },
  B: { apples: 1, bananas: 0 },
  C: { apples: 1, bananas: 1 },
  D: { apples: 2, bananas: 0 },
  E: { apples: 0, bananas: 2 },
}

const OPT_VIEW = 80  // square viewBox
const OPT_S = 18    // fruit size in option view

/**
 * Named export — renders ONE answer choice as an SVG fruit picture.
 * Matches the source option images from the paper.
 */
export function Witch18PEOption({ choice }: { choice: WmiChoice }) {
  const label = (choice.label ?? '').trim().toUpperCase() as OptionLabel
  const set = OPTION_SETS[label]
  if (!set) return <span>{choice.text}</span>

  const total = set.apples + set.bananas
  const cx = OPT_VIEW / 2
  const cy = OPT_VIEW / 2

  // Layout: 1 fruit centred; 2 fruits side by side.
  const xOffsets: number[] =
    total === 1 ? [0] : total === 2 ? [-OPT_S * 0.9, OPT_S * 0.9] : [0]

  // Build sequence: apples first, then bananas (matches paper layout).
  const fruits: Array<'apple' | 'banana'> = [
    ...Array<'apple'>(set.apples).fill('apple'),
    ...Array<'banana'>(set.bananas).fill('banana'),
  ]

  const ariaText =
    label === 'A'
      ? '1 pisang'
      : label === 'B'
        ? '1 apel'
        : label === 'C'
          ? '1 apel dan 1 pisang'
          : label === 'D'
            ? '2 apel'
            : '2 pisang'

  return (
    <svg
      viewBox={`0 0 ${OPT_VIEW} ${OPT_VIEW}`}
      width={72}
      height={72}
      style={{ display: 'block' }}
      role="img"
      aria-label={`Pilihan ${label}: ${ariaText}`}
    >
      {fruits.map((kind, i) => {
        const x = cx + (xOffsets[i] ?? 0)
        if (kind === 'apple') return <Apple key={i} cx={x} cy={cy} s={OPT_S} />
        return <Banana key={i} cx={x} cy={cy} s={OPT_S} />
      })}
    </svg>
  )
}
