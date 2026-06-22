/**
 * IKMC-21-PE-Q1 — "A kangaroo laid out 3 sticks like this —— to make a shape.
 * It's not allowed to break or to bend the sticks. Which shape could the kangaroo make?"
 * Answer: E.
 *
 * The five options ARE the figures — there is no separate stem illustration.
 * This file only exports the CHOICE RENDERER Sticks1PEOption.
 *
 * Key insight: the kangaroo has 3 equal-length, straight sticks.
 *   A — 8-armed asterisk: needs 4 sticks (×4 crossing at center, 45° apart).
 *   B — H-shape: 2 tall verticals + 1 shorter horizontal. The horizontal is
 *       shorter, so 3 equal sticks cannot make this shape without bending/cutting.
 *   C — 3-line cross-diagonal: one NE diagonal, one NW diagonal, one horizontal —
 *       the sticks are not the same length, so also impossible.
 *   D — Diamond frame + 2 inner diagonals: needs at least 6 sticks.
 *   E — 6-armed asterisk: EXACTLY 3 equal sticks all passing through the same
 *       central point (at 0°, 60°, 120°) — can be made without breaking or bending.
 *
 * Bound to quantities: { "Number of sticks": "3" } (breakdown.quantities[0]).
 *
 * Pure SVG, no Math.random, no Date, SSR-safe.
 */

import type { WmiChoice } from '../../../../types/wmi'

// ── Design tokens ─────────────────────────────────────────────────────────────

const INK   = '#1F2937'
const STICK = '#374151'   // dark grey, clean matchstick look
const SW    = 3           // stroke-width for sticks

// ── Geometry helpers ──────────────────────────────────────────────────────────

/** SVG viewBox is 80 × 80 for every option, centred at (40, 40). */
const CX = 40
const CY = 40
const R  = 30   // half-length of each stick in SVG units

/** Convert degrees to radians. */
function rad(deg: number): number {
  return (deg * Math.PI) / 180
}

/** A stick as a <line> through (cx,cy) at angle `deg`, half-length `r`. */
function Stick({ cx = CX, cy = CY, r = R, deg }: { cx?: number; cy?: number; r?: number; deg: number }) {
  const dx = r * Math.cos(rad(deg))
  const dy = r * Math.sin(rad(deg))
  return (
    <line
      x1={cx - dx} y1={cy - dy}
      x2={cx + dx} y2={cy + dy}
      stroke={STICK} strokeWidth={SW} strokeLinecap="round"
    />
  )
}

// ── Option SVG constructors ───────────────────────────────────────────────────

/**
 * Option A — 8-armed asterisk.
 * 4 sticks crossing at center: 0°, 45°, 90°, 135°.
 * Needs 4 sticks → cannot be made with 3.
 */
function OptionA() {
  return (
    <svg viewBox="0 0 80 80" width={72} height={72} aria-hidden="true" style={{ display: 'block' }}>
      <Stick deg={0} />
      <Stick deg={45} />
      <Stick deg={90} />
      <Stick deg={135} />
    </svg>
  )
}

/**
 * Option B — H-configuration.
 * Two tall vertical sticks (height 2R) + one shorter horizontal crossing both
 * at their midpoints. Because the horizontal is shorter than the verticals, you
 * cannot build this with 3 sticks of equal length without cutting one.
 *
 * Drawn: 2 vertical lines 24 px apart, linked by a horizontal bar at midheight.
 * The horizontal has length 24 px while the verticals are 60 px — visibly shorter.
 */
function OptionB() {
  const VH = 30   // half-height of the vertical sticks
  const HW = 12   // half-width of the horizontal bar (shorter than VH)
  const xL = CX - HW   // x of left vertical
  const xR = CX + HW   // x of right vertical
  return (
    <svg viewBox="0 0 80 80" width={72} height={72} aria-hidden="true" style={{ display: 'block' }}>
      {/* Left vertical */}
      <line x1={xL} y1={CY - VH} x2={xL} y2={CY + VH} stroke={STICK} strokeWidth={SW} strokeLinecap="round" />
      {/* Right vertical */}
      <line x1={xR} y1={CY - VH} x2={xR} y2={CY + VH} stroke={STICK} strokeWidth={SW} strokeLinecap="round" />
      {/* Shorter horizontal crossbar */}
      <line x1={xL} y1={CY} x2={xR} y2={CY} stroke={STICK} strokeWidth={SW} strokeLinecap="round" />
    </svg>
  )
}

/**
 * Option C — 3-line cross-diagonal arrangement.
 * One long diagonal (top-left → bottom-right), one long diagonal (top-right → bottom-left)
 * forming an X, plus one shorter horizontal segment at lower-right area.
 * The segments are different lengths, so impossible with 3 equal sticks.
 */
function OptionC() {
  // Long X diagonals centred slightly upper-left of viewbox
  const cx2 = 36
  const cy2 = 36
  const r2  = 26   // full diagonals
  // Short horizontal at lower-right
  const hxL = 46
  const hxR = 74
  const hy  = 54
  return (
    <svg viewBox="0 0 80 80" width={72} height={72} aria-hidden="true" style={{ display: 'block' }}>
      {/* Diagonal top-left → bottom-right */}
      <line
        x1={cx2 - r2} y1={cy2 - r2}
        x2={cx2 + r2} y2={cy2 + r2}
        stroke={STICK} strokeWidth={SW} strokeLinecap="round"
      />
      {/* Diagonal top-right → bottom-left */}
      <line
        x1={cx2 + r2} y1={cy2 - r2}
        x2={cx2 - r2} y2={cy2 + r2}
        stroke={STICK} strokeWidth={SW} strokeLinecap="round"
      />
      {/* Shorter horizontal at lower-right */}
      <line
        x1={hxL} y1={hy}
        x2={hxR} y2={hy}
        stroke={STICK} strokeWidth={SW} strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Option D — Diamond (rhombus) with 2 inner diagonal crosses.
 * Outer diamond outline: 4 sticks (top, right, bottom, left).
 * Two diagonals through the diamond centre: 2 more sticks.
 * Total: 6 sticks — far too many.
 */
function OptionD() {
  const r2 = 26   // half-diagonal of the diamond
  const cx2 = CX
  const cy2 = CY
  return (
    <svg viewBox="0 0 80 80" width={72} height={72} aria-hidden="true" style={{ display: 'block' }}>
      {/* Diamond outline — 4 sides */}
      <line x1={cx2}       y1={cy2 - r2} x2={cx2 + r2} y2={cy2}       stroke={STICK} strokeWidth={SW} strokeLinecap="round" />
      <line x1={cx2 + r2}  y1={cy2}      x2={cx2}       y2={cy2 + r2} stroke={STICK} strokeWidth={SW} strokeLinecap="round" />
      <line x1={cx2}       y1={cy2 + r2} x2={cx2 - r2}  y2={cy2}      stroke={STICK} strokeWidth={SW} strokeLinecap="round" />
      <line x1={cx2 - r2}  y1={cy2}      x2={cx2}       y2={cy2 - r2} stroke={STICK} strokeWidth={SW} strokeLinecap="round" />
      {/* Inner diagonals (X inside diamond) */}
      <line x1={cx2 - r2} y1={cy2}      x2={cx2 + r2} y2={cy2}      stroke={STICK} strokeWidth={SW} strokeLinecap="round" />
      <line x1={cx2}      y1={cy2 - r2} x2={cx2}      y2={cy2 + r2} stroke={STICK} strokeWidth={SW} strokeLinecap="round" />
    </svg>
  )
}

/**
 * Option E — 6-armed asterisk. ← THE ANSWER
 * Exactly 3 sticks all passing through the same central point, spaced 60° apart
 * (0°, 60°, 120°). Same length. Can be made with 3 unbroken, unbent sticks.
 */
function OptionE() {
  return (
    <svg viewBox="0 0 80 80" width={72} height={72} aria-hidden="true" style={{ display: 'block' }}>
      <Stick deg={0} />
      <Stick deg={60} />
      <Stick deg={120} />
    </svg>
  )
}

// ── Shape data ────────────────────────────────────────────────────────────────

const OPTION_COMPONENTS: Record<string, () => React.JSX.Element> = {
  A: OptionA,
  B: OptionB,
  C: OptionC,
  D: OptionD,
  E: OptionE,
}

const SHAPE_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Option A: 8-armed star shape — needs 4 sticks, not 3.',
    id: 'Pilihan A: bintang 8 lengan — membutuhkan 4 batang, bukan 3.',
  },
  B: {
    en: 'Option B: H-shaped figure — the middle bar is shorter, so 3 equal sticks cannot make this.',
    id: 'Pilihan B: bentuk H — batang tengah lebih pendek, sehingga 3 batang sama panjang tidak dapat membuat ini.',
  },
  C: {
    en: 'Option C: two crossing diagonals and a horizontal — sticks are different lengths, impossible with 3 equal sticks.',
    id: 'Pilihan C: dua diagonal bersilang dan satu horizontal — batang berbeda panjang, mustahil dengan 3 batang sama panjang.',
  },
  D: {
    en: 'Option D: diamond outline plus two inner diagonals — needs 6 sticks.',
    id: 'Pilihan D: kerangka belah ketupat ditambah dua diagonal dalam — membutuhkan 6 batang.',
  },
  E: {
    en: 'Option E: 6-armed star — made from exactly 3 equal sticks crossing at one centre point (0°, 60°, 120°). This is the answer.',
    id: 'Pilihan E: bintang 6 lengan — dibuat dari tepat 3 batang sama panjang bersilang di satu titik tengah (0°, 60°, 120°). Ini jawabannya.',
  },
}

// ── Choice renderer ───────────────────────────────────────────────────────────

/**
 * Sticks1PEOption — renders one A/B/C/D/E choice as an SVG stick figure.
 * Registered in CHOICE_RENDERERS for IKMC-21-PE-Q1.
 */
export function Sticks1PEOption({ choice }: { choice: WmiChoice }) {
  const Component = OPTION_COMPONENTS[choice.label]
  const aria      = SHAPE_ARIA[choice.label]
  if (!Component) return <span>{choice.text}</span>
  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <Component />
    </span>
  )
}

// ── Named re-exports for the explainer ───────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export { INK, STICK, SW, R, CX, CY, rad, Stick }
