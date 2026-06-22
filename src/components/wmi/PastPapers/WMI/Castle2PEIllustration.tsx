// IKMC-20-PE-Q2 — "Mordka took a selfie in front of this castle."
//
// Stem illustration: shows the REFERENCE castle as seen from the front.
// Does NOT show Mordka or the selfie answer.
//
// Castle silhouette (from OCR image 002.jpg):
//   Flat grey body with crenellated battlement on top.
//   Left→right merlon pattern: small, gap, small, gap, TALL centre, gap, small, gap, small.
//   Roughly symmetric, slightly wider at base.
//
// Co-exports:
//   CastleBattlement  — shared primitive (castle body+crenels), used by Option renderer.
//   SelfieHead        — shared person-face primitive, used by Option renderer.
//   Castle2PEOption   — renders one A–E choice (castle + selfie face).
//
// Pure SVG, no random, no Date, SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ── Shared geometry constants ─────────────────────────────────────────────────

/** Castle body dimensions (within a local coordinate system). */
export const CASTLE = {
  /** Total width of the castle body. */
  W: 200,
  /** Height of the main body (below the crenels). */
  BODY_H: 48,
  /** Crenel (merlon) height above the body top. */
  CRENEL_H: 22,
  /** Width of the tall centre merlon. */
  TALL_W: 20,
  /** Height of the tall centre merlon (extra above CRENEL_H). */
  TALL_EXTRA: 14,
  /** Width of each small merlon. */
  SMALL_W: 14,
  /** Gap between merlons. */
  GAP: 12,
} as const

/** Colour tokens. */
export const COLOR = {
  BODY: '#B8B8B8',
  STROKE: '#1F2937',
  FACE_FILL: '#F5F5F5',
  FACE_STROKE: '#1F2937',
  BG: '#FFFFFF',
} as const

// ── Castle body path builder ─────────────────────────────────────────────────

/**
 * Returns the SVG path data for the castle silhouette, with bottom-left at (0, 0)
 * and the base at y = BODY_H + CRENEL_H + TALL_EXTRA (top of viewbox = 0).
 *
 * Merlon layout (left→right), centred on the castle:
 *   small | gap | small | gap | TALL | gap | small | gap | small
 *
 * The castle is slightly wider at the bottom (shallow trapezoid).
 */
// eslint-disable-next-line react-refresh/only-export-components
export function castlePath(x: number, y: number, scale = 1): string {
  const { W, BODY_H, CRENEL_H, TALL_W, TALL_EXTRA, SMALL_W, GAP } = CASTLE
  const bW = W * scale
  const bH = BODY_H * scale
  const cH = CRENEL_H * scale
  const tW = TALL_W * scale
  const tE = TALL_EXTRA * scale
  const sW = SMALL_W * scale
  const gp = GAP * scale

  // Total battlement span: 4 small + 1 tall + 4 gaps
  const battleW = 4 * sW + tW + 4 * gp
  const battleX = x + (bW - battleW) / 2  // left edge of leftmost merlon

  const baseY = y + tE + cH + bH  // bottom of castle
  const bodyTopY = y + tE + cH    // top of the main body (below crenels)
  const crenelBaseY = y + tE      // base line of crenels
  const tallBaseY = y             // top of tall centre merlon

  // Merlon x positions (left edges)
  const m0 = battleX                            // small-left-1
  const m1 = m0 + sW + gp                      // small-left-2
  const tallX = m1 + sW + gp                   // tall centre
  const m2 = tallX + tW + gp                   // small-right-1
  const m3 = m2 + sW + gp                      // small-right-2

  // Build path: bottom-left → up the left face → trace the battlement → down the right face → close
  const pts: string[] = [
    `M ${x} ${baseY}`,
    `L ${x} ${bodyTopY}`,
    // battlement left edge to m0
    `L ${m0} ${bodyTopY}`,
    `L ${m0} ${crenelBaseY}`,
    `L ${m0 + sW} ${crenelBaseY}`,
    `L ${m0 + sW} ${bodyTopY}`,
    `L ${m1} ${bodyTopY}`,
    `L ${m1} ${crenelBaseY}`,
    `L ${m1 + sW} ${crenelBaseY}`,
    `L ${m1 + sW} ${bodyTopY}`,
    `L ${tallX} ${bodyTopY}`,
    `L ${tallX} ${tallBaseY}`,
    `L ${tallX + tW} ${tallBaseY}`,
    `L ${tallX + tW} ${bodyTopY}`,
    `L ${m2} ${bodyTopY}`,
    `L ${m2} ${crenelBaseY}`,
    `L ${m2 + sW} ${crenelBaseY}`,
    `L ${m2 + sW} ${bodyTopY}`,
    `L ${m3} ${bodyTopY}`,
    `L ${m3} ${crenelBaseY}`,
    `L ${m3 + sW} ${crenelBaseY}`,
    `L ${m3 + sW} ${bodyTopY}`,
    // right edge of castle back down
    `L ${x + bW} ${bodyTopY}`,
    `L ${x + bW} ${baseY}`,
    'Z',
  ]

  return pts.join(' ')
}

// ── Castle Battlement primitive ───────────────────────────────────────────────

interface CastleBattlementProps {
  /** SVG x origin of the castle (left edge). */
  x: number
  /** SVG y origin — the TOP of the tall centre merlon. */
  y: number
  /** Scale factor (1 = full size). */
  scale?: number
  /** Stroke width. Default 2. */
  strokeWidth?: number
}

/**
 * CastleBattlement — draws the castle silhouette centred at x, with top at y.
 * Exported for reuse in Option renderer and Explainer.
 */
export function CastleBattlement({ x, y, scale = 1, strokeWidth = 2 }: CastleBattlementProps) {
  const d = castlePath(x, y, scale)
  return (
    <path
      d={d}
      fill={COLOR.BODY}
      stroke={COLOR.STROKE}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  )
}

// ── Selfie face primitive ─────────────────────────────────────────────────────

interface SelfieHeadProps {
  /** Centre x of the head circle. */
  cx: number
  /** Centre y of the head circle. */
  cy: number
  /** Radius of the head. */
  r: number
  /** Stroke width. Default 2. */
  strokeWidth?: number
}

/**
 * SelfieHead — a simple circular face (circle + eyes + nose triangle + smile arc).
 * Exported for reuse in Option renderer and Explainer.
 */
export function SelfieHead({ cx, cy, r, strokeWidth = 2 }: SelfieHeadProps) {
  const eyeOff = r * 0.3
  const eyeY = cy - r * 0.18
  const eyeR = r * 0.09
  const noseSize = r * 0.14
  const noseY = cy + r * 0.04
  // Smile: arc below nose
  const smileY = cy + r * 0.35
  const smileW = r * 0.36
  const smileH = r * 0.12

  return (
    <g>
      {/* head */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={COLOR.FACE_FILL}
        stroke={COLOR.FACE_STROKE}
        strokeWidth={strokeWidth}
      />
      {/* left eye */}
      <circle cx={cx - eyeOff} cy={eyeY} r={eyeR} fill={COLOR.FACE_STROKE} />
      {/* right eye */}
      <circle cx={cx + eyeOff} cy={eyeY} r={eyeR} fill={COLOR.FACE_STROKE} />
      {/* nose triangle */}
      <path
        d={`M ${cx} ${noseY - noseSize} L ${cx - noseSize * 0.7} ${noseY + noseSize} L ${cx + noseSize * 0.7} ${noseY + noseSize} Z`}
        fill={COLOR.FACE_STROKE}
      />
      {/* smile */}
      <path
        d={`M ${cx - smileW} ${smileY} Q ${cx} ${smileY + smileH * 2} ${cx + smileW} ${smileY}`}
        fill="none"
        stroke={COLOR.FACE_STROKE}
        strokeWidth={strokeWidth * 0.8}
        strokeLinecap="round"
      />
    </g>
  )
}

// ── Stem illustration ─────────────────────────────────────────────────────────

const SVG_W = 260
const SVG_H = 120

/**
 * Castle2PEIllustration — static, problem-only figure for IKMC-20-PE-Q2.
 * Shows the reference castle as seen from the front.
 * Does NOT show Mordka or any selfie orientation.
 */
export default function Castle2PEIllustration() {
  // Castle placed so the tall centre merlon top is at y=14, centred horizontally
  const castleX = (SVG_W - CASTLE.W) / 2
  const castleY = 14

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'A castle battlement seen from the front. ' +
        'The top has five merlons: two small merlons on the left, one tall centre spire, two small merlons on the right.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(300, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />
        <CastleBattlement x={castleX} y={castleY} scale={1} strokeWidth={2.5} />
      </svg>
    </div>
  )
}

// ── Option renderer (A–E choices) ─────────────────────────────────────────────

/**
 * Option configuration for each choice A–E.
 *
 * Each option shows a selfie scene: Mordka's head at a given position relative
 * to the castle, which itself may be at a different horizontal offset.
 *
 * From the OCR images (003–007.jpg):
 *   A — head far LEFT (outside castle), castle to the RIGHT (only right portion visible). Spire RIGHT of head.
 *   B — head CENTRE of the castle (between merlons, castle extends equally L&R). Symmetrical.
 *   C — head slightly LEFT of centre, castle behind; spire appears to the RIGHT of head.
 *   D — head far LEFT (outside castle), castle to the RIGHT. Spire LEFT of castle centre, visible right of head.
 *   E — head far RIGHT (outside castle body), castle to the LEFT. Spire LEFT of head. ← CORRECT
 *
 * We encode each option as:
 *   headFrac — head centre x as fraction of OPTION_W
 *   castleOffsetFrac — left edge of castle as fraction of OPTION_W
 *   scale — castle scale
 */
interface OptionConfig {
  headFrac: number
  castleLeftFrac: number
  scale: number
  /** Aria label */
  ariaEn: string
  ariaId: string
}

const OPTION_W = 180
const OPTION_H = 80

// Castle height (body + crenels + tall extra) at scale s:
function castleTotalH(s: number) {
  return (CASTLE.BODY_H + CASTLE.CRENEL_H + CASTLE.TALL_EXTRA) * s
}

const OPTION_CONFIGS: Record<string, OptionConfig> = {
  A: {
    // Head far LEFT, castle starts near head (only right portion visible),
    // tall spire is to the RIGHT of head (wrong orientation for selfie from front)
    headFrac: 0.15,
    castleLeftFrac: 0.08,
    scale: 0.72,
    ariaEn: 'Option A: Mordka\'s face on the far left, castle extends to the right with spire to the right of the face.',
    ariaId: 'Pilihan A: wajah Mordka di kiri jauh, kastil memanjang ke kanan dengan menara di kanan wajah.',
  },
  B: {
    // Head centred within the castle body (between merlons)
    headFrac: 0.5,
    castleLeftFrac: 0.08,
    scale: 0.88,
    ariaEn: 'Option B: Mordka\'s face centred between the castle merlons.',
    ariaId: 'Pilihan B: wajah Mordka berada di tengah antara merlons kastil.',
  },
  C: {
    // Head slightly left of centre, spire to the right
    headFrac: 0.35,
    castleLeftFrac: 0.08,
    scale: 0.82,
    ariaEn: 'Option C: Mordka\'s face left of centre, castle spire to the right of the face.',
    ariaId: 'Pilihan C: wajah Mordka di kiri tengah, menara kastil di kanan wajah.',
  },
  D: {
    // Head far LEFT (below the battlement left edge), castle to the right, spire left-of-castle-centre
    headFrac: 0.1,
    castleLeftFrac: 0.16,
    scale: 0.72,
    ariaEn: 'Option D: Mordka\'s face on the far left outside the castle, spire visible in the castle to the right.',
    ariaId: 'Pilihan D: wajah Mordka di kiri jauh di luar kastil, menara terlihat di kastil sebelah kanan.',
  },
  E: {
    // Head far RIGHT (outside castle), castle to the LEFT — spire left of head. CORRECT.
    headFrac: 0.88,
    castleLeftFrac: 0.04,
    scale: 0.72,
    ariaEn: 'Option E: Mordka\'s face on the far right, castle extends to the left with the spire to the left of the face. Correct selfie orientation.',
    ariaId: 'Pilihan E: wajah Mordka di kanan jauh, kastil memanjang ke kiri dengan menara di kiri wajah. Orientasi selfie yang benar.',
  },
}

/**
 * Castle2PEOption — renders one A–E choice for IKMC-20-PE-Q2.
 * Each choice shows Mordka's face + the castle in a specific arrangement.
 */
export function Castle2PEOption({ choice }: { choice: WmiChoice }) {
  const cfg = OPTION_CONFIGS[choice.label]
  if (!cfg) return <span>{choice.text}</span>

  const { headFrac, castleLeftFrac, scale } = cfg
  const headCX = OPTION_W * headFrac
  const headR = 14
  const headCY = OPTION_H * 0.5

  // Castle: place its top at y so the castle base aligns with bottom of view
  const cH = castleTotalH(scale)
  const castleX = OPTION_W * castleLeftFrac
  const castleY = OPTION_H - cH - 4  // 4px margin from bottom

  return (
    <span
      role="img"
      aria-label={cfg.ariaEn}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <svg
        viewBox={`0 0 ${OPTION_W} ${OPTION_H}`}
        width={OPTION_W}
        height={OPTION_H}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <rect x={0} y={0} width={OPTION_W} height={OPTION_H} fill={COLOR.BG} />
        {/* castle behind the selfie face */}
        <CastleBattlement x={castleX} y={castleY} scale={scale} strokeWidth={1.8} />
        {/* Clip castle to option width to avoid overflow */}
        {/* Mordka's selfie face */}
        <SelfieHead cx={headCX} cy={headCY} r={headR} strokeWidth={1.8} />
      </svg>
    </span>
  )
}
