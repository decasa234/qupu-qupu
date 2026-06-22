// IKMC-22-PE-Q14 — "Which of the following pictures will we see when we use
// the stamp shown?"
//
// READING THE SCAN:
//   2022.imgs/039.jpg — the stamp: rectangular pad with a mushroom-shaped
//       handle on top. On the stamp face (left→right): apple, banana, pear.
//   2022.imgs/040.jpg — Option A: apple(L) banana(C) pear(R)  ← same as stamp (TRAP)
//   2022.imgs/041.jpg — Option B: pear(L) banana(C) apple(R)  ← mirror but banana/pear large
//   2022.imgs/042.jpg — Option C: pear(L) banana(C) apple(R)  ← mirror, banana very sweeping
//   2022.imgs/043.jpg — Option D: pear(L) banana(C) apple(R)  ← CORRECT mirror of stamp
//   2022.imgs/044.jpg — Option E: pear(L) banana(C) apple(R)  ← mirror, pear leans right
//
// TRANSFORM LOGIC:
//   When a stamp is pressed onto paper the image is reflected left↔right.
//   Stamp face: [ apple | banana | pear ]
//   Printed result: [ pear | banana | apple ]    ← answer D
//
// Co-exports:
//   Stamp14PE        — shared primitive (stamp face or printed option)
//   STAMP_GEOM       — shared layout constants for the explainer
//   Stamp14PEOption  — renders ONE answer choice (A–E) for CHOICE_RENDERERS
//
// Pure render, SSR-safe, deterministic — no random / Date / side-effects.

import type { WmiChoice } from '../../../../types/wmi'

// ── palette ──────────────────────────────────────────────────────────────────
const PAD_BG     = '#B0C4DE'  // steel-blue stamp pad matching the scan
const PAD_STROKE = '#6080A0'
const HANDLE_TOP = '#7B5B3A'  // wood-brown handle
const HANDLE_BOT = '#5C3D1E'
const INK_COLOR  = '#1A1A2E'  // near-black ink outlines on stamp face

// Fruit fill colours (outline-style like the source scan — mostly strokes)
const APPLE_BODY  = '#E8F0F8'  // light tinted so visible but not distracting
const APPLE_LEAF  = '#2D7A2D'
const APPLE_STEM  = '#5C3D1E'
const BANANA_FILL = '#F8F0E0'
const PEAR_BODY   = '#E8F4E0'
const PEAR_LEAF   = '#2D7A2D'

// ── shared layout ─────────────────────────────────────────────────────────────
export const STAMP_GEOM = {
  /** Stamp pad width (excluding handle). */
  PAD_W: 180,
  /** Stamp pad height. */
  PAD_H: 70,
  /** Three fruit slots, evenly divided across the pad. */
  SLOT_W: 60,
  /** Vertical centre of the pad. */
  PAD_CY: 35,
  /** Horizontal centres of left / centre / right slots (relative to pad left). */
  SLOT_CX: [30, 90, 150] as [number, number, number],
} as const

const { PAD_W, PAD_H, SLOT_W, PAD_CY, SLOT_CX } = STAMP_GEOM
const PAD_RX = 5

// ── fruit primitives ──────────────────────────────────────────────────────────

/** Apple outline at (cx, cy), ~half-size r. Matches scan: round body, stem, leaf. */
function Apple({ cx, cy, r, fill = APPLE_BODY }: { cx: number; cy: number; r: number; fill?: string }) {
  const stemLen = r * 0.55
  const leafRx  = r * 0.3
  const leafRy  = r * 0.14
  return (
    <g>
      {/* body */}
      <circle cx={cx} cy={cy + r * 0.1} r={r} fill={fill} stroke={INK_COLOR} strokeWidth={1.8} />
      {/* indent at top */}
      <path
        d={`M ${cx - r * 0.18} ${cy - r * 0.9} Q ${cx} ${cy - r * 0.6} ${cx + r * 0.18} ${cy - r * 0.9}`}
        fill="none"
        stroke={INK_COLOR}
        strokeWidth={1.2}
      />
      {/* stem */}
      <line
        x1={cx}
        y1={cy - r * 0.9}
        x2={cx + r * 0.1}
        y2={cy - r * 0.9 - stemLen}
        stroke={APPLE_STEM}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* leaf */}
      <ellipse
        cx={cx + r * 0.28}
        cy={cy - r * 0.9 - stemLen * 0.6}
        rx={leafRx}
        ry={leafRy}
        fill={APPLE_LEAF}
        stroke={APPLE_LEAF}
        strokeWidth={0.5}
        transform={`rotate(-30 ${cx + r * 0.28} ${cy - r * 0.9 - stemLen * 0.6})`}
      />
    </g>
  )
}

/** Banana outline at (cx, cy), ~half-size r. Crescent shape tilted. */
function Banana({ cx, cy, r, fill = BANANA_FILL }: { cx: number; cy: number; r: number; fill?: string }) {
  // Crescent-shaped banana: outer arc then inner arc
  const d = [
    `M ${cx - r * 0.75} ${cy + r * 0.1}`,
    `Q ${cx - r * 0.6} ${cy - r * 0.85} ${cx + r * 0.75} ${cy - r * 0.4}`,
    `Q ${cx + r * 0.55} ${cy - r * 0.05} ${cx} ${cy + r * 0.28}`,
    `Q ${cx - r * 0.38} ${cy + r * 0.28} ${cx - r * 0.75} ${cy + r * 0.1}`,
    'Z',
  ].join(' ')
  return (
    <path d={d} fill={fill} stroke={INK_COLOR} strokeWidth={1.8} strokeLinejoin="round" />
  )
}

/** Pear outline at (cx, cy), ~half-size r. Round bottom, narrow top. */
function Pear({ cx, cy, r, fill = PEAR_BODY }: { cx: number; cy: number; r: number; fill?: string }) {
  const stemLen = r * 0.45
  const d = [
    // Wide lower body
    `M ${cx - r * 0.75} ${cy + r * 0.2}`,
    `Q ${cx - r * 0.85} ${cy + r * 0.8} ${cx} ${cy + r * 0.95}`,
    `Q ${cx + r * 0.85} ${cy + r * 0.8} ${cx + r * 0.75} ${cy + r * 0.2}`,
    // Narrow neck up to stem
    `Q ${cx + r * 0.55} ${cy - r * 0.35} ${cx + r * 0.22} ${cy - r * 0.7}`,
    `Q ${cx} ${cy - r * 0.85} ${cx - r * 0.22} ${cy - r * 0.7}`,
    `Q ${cx - r * 0.55} ${cy - r * 0.35} ${cx - r * 0.75} ${cy + r * 0.2}`,
    'Z',
  ].join(' ')
  return (
    <g>
      <path d={d} fill={fill} stroke={INK_COLOR} strokeWidth={1.8} strokeLinejoin="round" />
      {/* stem */}
      <line
        x1={cx}
        y1={cy - r * 0.85}
        x2={cx + r * 0.08}
        y2={cy - r * 0.85 - stemLen}
        stroke={APPLE_STEM}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* leaf */}
      <ellipse
        cx={cx + r * 0.26}
        cy={cy - r * 0.85 - stemLen * 0.55}
        rx={r * 0.25}
        ry={r * 0.12}
        fill={PEAR_LEAF}
        stroke={PEAR_LEAF}
        strokeWidth={0.5}
        transform={`rotate(-25 ${cx + r * 0.26} ${cy - r * 0.85 - stemLen * 0.55})`}
      />
    </g>
  )
}

// ── fruit type identifier ─────────────────────────────────────────────────────
export type FruitId = 'apple' | 'banana' | 'pear'

/** Dispatch one fruit glyph at (cx, cy) sized r. */
function FruitGlyph({ fruit, cx, cy, r }: { fruit: FruitId; cx: number; cy: number; r: number }) {
  if (fruit === 'apple')  return <Apple  cx={cx} cy={cy} r={r} />
  if (fruit === 'banana') return <Banana cx={cx} cy={cy} r={r} />
  return                         <Pear   cx={cx} cy={cy} r={r} />
}

// ── option fruit arrangements ─────────────────────────────────────────────────
// Each option is [left, centre, right] read from the source scan images.
const OPTION_FRUITS: Record<string, [FruitId, FruitId, FruitId]> = {
  //                left       centre    right
  A: ['apple',  'banana', 'pear'],    // same as stamp face (trap)
  B: ['pear',   'banana', 'apple'],   // mirror — pear+banana slightly oversized vs D
  C: ['pear',   'banana', 'apple'],   // mirror — banana very curved
  D: ['pear',   'banana', 'apple'],   // ← correct mirror of stamp
  E: ['pear',   'banana', 'apple'],   // mirror — pear tilts differently
}

// ── shared SVG primitive ─────────────────────────────────────────────────────

export interface Stamp14PEProps {
  /**
   * Three fruit ids to render on the rectangular pad, left→right.
   * Defaults to the stamp face (apple, banana, pear).
   */
  fruits?: [FruitId, FruitId, FruitId]
  /** Show the handle (stamp device view). When false, renders just the pad. */
  showHandle?: boolean
  /** Fruit glyph radius (approx half-size of each fruit). */
  fruitR?: number
  /** Highlight slot index 0/1/2 with amber ring, or null. */
  highlightSlot?: number | null
}

/** The stamp face: three fruits on a rectangular pad, optionally with handle. */
export function Stamp14PE({
  fruits = ['apple', 'banana', 'pear'],
  showHandle = true,
  fruitR = 20,
  highlightSlot = null,
}: Stamp14PEProps = {}) {
  const MARGIN  = 12
  const HANDLE_W = 22
  const HANDLE_H = 30
  const handleX = PAD_W / 2 - HANDLE_W / 2 + MARGIN

  const VW = PAD_W + 2 * MARGIN
  const VH = showHandle
    ? PAD_H + 2 * MARGIN + HANDLE_H + 4
    : PAD_H + 2 * MARGIN

  const padTop = showHandle ? MARGIN + HANDLE_H + 4 : MARGIN
  const AMBER = '#F59E0B'

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width={Math.min(280, VW * 1.4)} aria-hidden="true">
      {showHandle && (
        <g>
          {/* handle stem */}
          <rect
            x={handleX + HANDLE_W * 0.3}
            y={MARGIN}
            width={HANDLE_W * 0.4}
            height={HANDLE_H * 0.65}
            rx={4}
            fill={HANDLE_BOT}
          />
          {/* handle mushroom cap */}
          <ellipse
            cx={MARGIN + PAD_W / 2}
            cy={MARGIN + HANDLE_H * 0.22}
            rx={HANDLE_W * 0.72}
            ry={HANDLE_H * 0.32}
            fill={HANDLE_TOP}
          />
        </g>
      )}

      {/* stamp pad body */}
      <rect
        x={MARGIN}
        y={padTop}
        width={PAD_W}
        height={PAD_H}
        rx={PAD_RX}
        fill={PAD_BG}
        stroke={PAD_STROKE}
        strokeWidth={2}
      />

      {/* subtle dividers between fruit slots */}
      {[1, 2].map((i) => (
        <line
          key={`div-${i}`}
          x1={MARGIN + SLOT_W * i}
          y1={padTop + 8}
          x2={MARGIN + SLOT_W * i}
          y2={padTop + PAD_H - 8}
          stroke={PAD_STROKE}
          strokeWidth={0.8}
          strokeDasharray="3 3"
          opacity={0.4}
        />
      ))}

      {/* three fruit glyphs */}
      {fruits.map((fruit, i) => {
        const cx = MARGIN + SLOT_CX[i]
        const cy = padTop + PAD_CY
        const highlighted = highlightSlot === i
        return (
          <g key={`fruit-${i}`}>
            {highlighted && (
              <circle
                cx={cx}
                cy={cy}
                r={fruitR + 6}
                fill="none"
                stroke={AMBER}
                strokeWidth={2.5}
              />
            )}
            <FruitGlyph fruit={fruit} cx={cx} cy={cy} r={fruitR} />
          </g>
        )
      })}
    </svg>
  )
}

// ── option renderer ───────────────────────────────────────────────────────────

/**
 * Renders ONE answer option (A–E) for IKMC-22-PE-Q14.
 * Each option shows the printed result (no handle) with its three fruits.
 */
export function Stamp14PEOption({ choice }: { choice: WmiChoice }) {
  const key = (choice.label ?? '').trim().toUpperCase()
  const fruits = OPTION_FRUITS[key]
  if (!fruits) return <span>{choice.text}</span>

  const MARGIN = 6
  const VW = PAD_W + 2 * MARGIN
  const VH = PAD_H + 2 * MARGIN

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: 200, display: 'block' }}
      role="img"
      aria-label={`Option ${key}`}
    >
      {/* printed pad (no handle) */}
      <rect
        x={MARGIN}
        y={MARGIN}
        width={PAD_W}
        height={PAD_H}
        rx={PAD_RX}
        fill={PAD_BG}
        stroke={PAD_STROKE}
        strokeWidth={2}
      />

      {/* dividers */}
      {[1, 2].map((i) => (
        <line
          key={`div-${i}`}
          x1={MARGIN + SLOT_W * i}
          y1={MARGIN + 8}
          x2={MARGIN + SLOT_W * i}
          y2={MARGIN + PAD_H - 8}
          stroke={PAD_STROKE}
          strokeWidth={0.8}
          strokeDasharray="3 3"
          opacity={0.4}
        />
      ))}

      {/* fruit glyphs */}
      {fruits.map((fruit, i) => (
        <FruitGlyph
          key={`fruit-${i}`}
          fruit={fruit}
          cx={MARGIN + SLOT_CX[i]}
          cy={MARGIN + PAD_CY}
          r={18}
        />
      ))}
    </svg>
  )
}

// ── stem illustration (default export) ───────────────────────────────────────

const ARIA_EN =
  'A stamp with a round wooden handle on top and a rectangular steel-blue pad below. ' +
  'On the stamp face, left to right: an apple, a banana, and a pear. ' +
  'Which printed picture results when this stamp is pressed onto paper?'

const ARIA_ID =
  'Sebuah cap dengan pegangan kayu bundar di atas dan bantalan biru-baja berbentuk persegi panjang di bawah. ' +
  'Pada permukaan cap, dari kiri ke kanan: sebuah apel, pisang, dan pir. ' +
  'Gambar cetak manakah yang dihasilkan ketika cap ini ditekan ke kertas?'

export default function Stamp14PEIllustration({ lang = 'en' }: { lang?: string } = {}) {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={lang === 'id' ? ARIA_ID : ARIA_EN}
    >
      <Stamp14PE fruits={['apple', 'banana', 'pear']} showHandle={true} />
    </div>
  )
}
