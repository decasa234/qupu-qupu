// IKMC-19-PE-Q13 — "Woven strips" static figure + shared WeavePanel primitive.
//
// PROBLEM ONLY: shows the front-view weave — 2 red vertical strips over 2 grey
// horizontal strips, vertical on top at all 4 crossings.
//
// Also exports:
//   WeavePanel     — shared primitive used by the explainer and the options.
//   Weave13Option  — renders one A-E answer option as a WeavePanel.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

import type { WmiChoice } from '../../../../types/wmi'

// ── Layout constants ──────────────────────────────────────────────────────────

/** SVG viewBox size (square). */
export const VIEWBOX = 140

// Left vertical strip
const V_LEFT_X = 30
const V_STRIP_W = 28

// Right vertical strip
const V_RIGHT_X = 82

// Top horizontal strip
const H_TOP_Y = 30
const H_STRIP_H = 28

// Bottom horizontal strip
const H_BOT_Y = 82

// Vertical strips span full height; horizontal strips span full width.
// Each crossing is a VxH rectangle.

// ── Colour tokens ─────────────────────────────────────────────────────────────

const RED_FILL    = '#E53535'
const RED_STROKE  = '#1F2937'
const GREY_FILL   = '#E0E0E0'
const GREY_STROKE = '#1F2937'
const STRIP_SW    = 1.5

// ── WeavePanel ────────────────────────────────────────────────────────────────

export interface WeavePanelProps {
  /**
   * [TL, TR, BL, BR] — true = vertical (red) strip on top at that crossing.
   * false = horizontal (grey) strip on top.
   */
  vertOver: [boolean, boolean, boolean, boolean]
  /** Total rendered width in pixels (viewBox is always VIEWBOX×VIEWBOX). */
  width?: number
  /**
   * 'default' — standard 28px strip widths.
   * 'wide-h'  — wider horizontal strips (38px tall) to distinguish option E.
   */
  stripStyle?: 'default' | 'wide-h'
  /** Optional aria-label for the SVG. */
  ariaLabel?: string
}

/**
 * Draws a 2-vertical × 2-horizontal woven-strip grid.
 *
 * Painter algorithm:
 *   1. Draw full grey horizontal strip bodies.
 *   2. Draw full red vertical strip bodies.
 *   3. At each crossing, redraw the "over" strip's rectangle on top
 *      (with fill only, to cleanly cover the "under" strip's body in that region).
 *   4. Redraw outlines for both strip bodies (so the boundary lines sit on top).
 */
export function WeavePanel({ vertOver, width = VIEWBOX, stripStyle = 'default', ariaLabel }: WeavePanelProps) {
  const hH = stripStyle === 'wide-h' ? 38 : H_STRIP_H
  // For wide-h, keep the top horizontal centred on the same Y as default
  const hTopY = stripStyle === 'wide-h' ? H_TOP_Y - 5 : H_TOP_Y
  const hBotY = stripStyle === 'wide-h' ? H_BOT_Y - 5 : H_BOT_Y

  // Crossing rects for this strip style
  const crossings = [
    { x: V_LEFT_X,  y: hTopY },
    { x: V_RIGHT_X, y: hTopY },
    { x: V_LEFT_X,  y: hBotY },
    { x: V_RIGHT_X, y: hBotY },
  ] as const

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      width={width}
      style={{ display: 'block' }}
      role="img"
      aria-label={ariaLabel ?? 'Woven strips pattern'}
    >
      {/* white background */}
      <rect x={0} y={0} width={VIEWBOX} height={VIEWBOX} fill="white" />

      {/* ── Step 1: grey horizontal strip bodies ── */}
      <rect
        x={0} y={hTopY}
        width={VIEWBOX} height={hH}
        fill={GREY_FILL}
      />
      <rect
        x={0} y={hBotY}
        width={VIEWBOX} height={hH}
        fill={GREY_FILL}
      />

      {/* ── Step 2: red vertical strip bodies ── */}
      <rect
        x={V_LEFT_X} y={0}
        width={V_STRIP_W} height={VIEWBOX}
        fill={RED_FILL}
      />
      <rect
        x={V_RIGHT_X} y={0}
        width={V_STRIP_W} height={VIEWBOX}
        fill={RED_FILL}
      />

      {/* ── Step 3: redraw crossing "over" strips ── */}
      {vertOver.map((vOnTop, i) => {
        const { x, y } = crossings[i]
        const w = V_STRIP_W
        const h = hH
        return vOnTop ? (
          // vertical on top → redraw red rect at crossing
          <rect key={i} x={x} y={y} width={w} height={h} fill={RED_FILL} />
        ) : (
          // horizontal on top → redraw grey rect at crossing
          <rect key={i} x={x} y={y} width={w} height={h} fill={GREY_FILL} />
        )
      })}

      {/* ── Step 4: outline strokes for horizontal strips ── */}
      <rect
        x={0} y={hTopY}
        width={VIEWBOX} height={hH}
        fill="none"
        stroke={GREY_STROKE}
        strokeWidth={STRIP_SW}
      />
      <rect
        x={0} y={hBotY}
        width={VIEWBOX} height={hH}
        fill="none"
        stroke={GREY_STROKE}
        strokeWidth={STRIP_SW}
      />

      {/* outline strokes for vertical strips */}
      <rect
        x={V_LEFT_X} y={0}
        width={V_STRIP_W} height={VIEWBOX}
        fill="none"
        stroke={RED_STROKE}
        strokeWidth={STRIP_SW}
      />
      <rect
        x={V_RIGHT_X} y={0}
        width={V_STRIP_W} height={VIEWBOX}
        fill="none"
        stroke={RED_STROKE}
        strokeWidth={STRIP_SW}
      />
    </svg>
  )
}

// ── Crossing configurations per option ───────────────────────────────────────

/** Per-option crossing config (true = vertical on top at [TL, TR, BL, BR]). */
const OPTION_CONFIG: Record<string, {
  vertOver: [boolean, boolean, boolean, boolean]
  stripStyle?: 'default' | 'wide-h'
  ariaLabel: string
}> = {
  A: {
    vertOver: [true, true, true, true],
    stripStyle: 'default',
    ariaLabel: 'Option A: red vertical strips on top at all 4 crossings',
  },
  B: {
    vertOver: [false, false, false, false],
    stripStyle: 'default',
    ariaLabel: 'Option B: grey horizontal strips on top at all 4 crossings (correct answer)',
  },
  C: {
    vertOver: [true, true, false, false],
    stripStyle: 'default',
    ariaLabel: 'Option C: red on top at top row, grey on top at bottom row',
  },
  D: {
    vertOver: [false, true, true, false],
    stripStyle: 'default',
    ariaLabel: 'Option D: diagonal crossing pattern',
  },
  E: {
    vertOver: [false, false, false, false],
    stripStyle: 'wide-h',
    ariaLabel: 'Option E: wider grey horizontal strips on top at all crossings',
  },
}

// ── Weave13Option ─────────────────────────────────────────────────────────────

/**
 * Renders one A–E answer option as the appropriate WeavePanel.
 * Binds to choice.label — unknown labels fall back to plain text.
 */
export function Weave13Option({ choice }: { choice: WmiChoice }) {
  const label = (choice.label ?? '').trim().toUpperCase()
  const config = OPTION_CONFIG[label]
  if (!config) return <span>{choice.text}</span>

  return (
    <WeavePanel
      vertOver={config.vertOver}
      width={80}
      stripStyle={config.stripStyle}
      ariaLabel={config.ariaLabel}
    />
  )
}

// ── Default export: stem illustration ────────────────────────────────────────

/**
 * Weave13Illustration
 *
 * Static, problem-only figure for IKMC-19-PE-Q13.
 * Shows the front view: 2 red vertical strips woven over 2 grey horizontal
 * strips — vertical on top at all 4 crossings.
 */
export default function Weave13Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Empat strip dijalin membentuk pola: dua strip merah vertikal dan dua strip abu-abu horizontal. ' +
        'Strip merah berada di atas di setiap titik persilangan.'
      }
    >
      <WeavePanel
        vertOver={[true, true, true, true]}
        width={160}
        ariaLabel="Stem figure: red vertical strips on top at all 4 crossings"
      />
    </div>
  )
}

// Layout constants are exported at declaration site above; no re-export needed.
