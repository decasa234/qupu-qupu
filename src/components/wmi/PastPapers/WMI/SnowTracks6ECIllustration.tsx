/**
 * IKMC-19-EC-Q6 — "Snow Tracks"
 *
 * Three people crossed a snowy field. Their footprint tracks overlap — the
 * crossing order (first under = walked first) determines the answer.
 * Answer A: dotted (D) first, ribbed (R) second, oval (O) third.
 *
 * This file exports:
 *   - FootprintPrimitive  (named) — draws one shoe-sole at a given position/angle
 *   - SnowTracks6ECOption (named) — renders one A–E answer choice (3 shoes in order)
 *   - SnowTracks6ECIllustration (default) — the stem scene, problem-only (no labels)
 *
 * Pure SVG — no Math.random, no Date, no raster images. SSR-safe.
 */

import type { WmiChoice } from '../../../../types/wmi'

// ── layout constants (re-exported for the explainer) ─────────────────────────

export const SVG_W = 340
export const SVG_H = 200

/** Snow background colour. */
export const SNOW_BG = '#EEF4FB'
export const SNOW_STROKE = '#C8DCF0'

// ── shoe type tokens ──────────────────────────────────────────────────────────

export type ShoeType = 'D' | 'R' | 'O'

/** Shoe sole dimensions: all defined relative to a 28×18 medium "unit". */
const SOLE: Record<ShoeType, { rx: number; ry: number }> = {
  D: { rx: 16, ry: 11 }, // dotted / large
  R: { rx: 12, ry:  8 }, // ribbed / small
  O: { rx: 14, ry:  9 }, // oval  / medium
}

const SHOE_FILL: Record<ShoeType, string> = {
  D: '#F0E8FF', // soft lavender for dotted
  R: '#FFF0E0', // warm peach for ribbed
  O: '#E8F8F0', // pale mint for oval
}

const SHOE_STROKE: Record<ShoeType, string> = {
  D: '#7C3AED',
  R: '#C2410C',
  O: '#047857',
}

// ── FootprintPrimitive ────────────────────────────────────────────────────────

export interface FootprintPrimitiveProps {
  type: ShoeType
  /** Centre x of the sole. */
  cx: number
  /** Centre y of the sole. */
  cy: number
  /** Rotation in degrees. */
  rotate?: number
  /** Tint override for highlighting in the explainer. */
  fillOverride?: string
  strokeOverride?: string
  opacity?: number
}

/**
 * FootprintPrimitive — draws one shoe-sole outline with tread marks.
 *   'R' (ribbed):  horizontal line strokes inside
 *   'D' (dotted):  small circles in a 3×2 grid
 *   'O' (oval):    two smooth oval bumps
 */
export function FootprintPrimitive({
  type,
  cx,
  cy,
  rotate = 0,
  fillOverride,
  strokeOverride,
  opacity = 1,
}: FootprintPrimitiveProps) {
  const { rx, ry } = SOLE[type]
  const fill = fillOverride ?? SHOE_FILL[type]
  const stroke = strokeOverride ?? SHOE_STROKE[type]

  const transform = `translate(${cx},${cy}) rotate(${rotate})`

  return (
    <g transform={transform} opacity={opacity}>
      {/* sole outline */}
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill={fill} stroke={stroke} strokeWidth={1.4} />

      {/* tread pattern */}
      {type === 'R' && (
        // ribbed: 3 horizontal dashes
        <>
          <line x1={-rx * 0.55} y1={-ry * 0.45} x2={rx * 0.55} y2={-ry * 0.45} stroke={stroke} strokeWidth={1} strokeLinecap="round" />
          <line x1={-rx * 0.60} y1={0}            x2={rx * 0.60} y2={0}            stroke={stroke} strokeWidth={1} strokeLinecap="round" />
          <line x1={-rx * 0.50} y1={ry * 0.45}  x2={rx * 0.50} y2={ry * 0.45}  stroke={stroke} strokeWidth={1} strokeLinecap="round" />
        </>
      )}

      {type === 'D' && (
        // dotted: 3×2 grid of small circles
        <>
          {[-1, 0, 1].map((col) =>
            [-1, 1].map((row) => (
              <circle
                key={`${col}-${row}`}
                cx={col * rx * 0.35}
                cy={row * ry * 0.38}
                r={rx * 0.13}
                fill={stroke}
              />
            )),
          )}
        </>
      )}

      {type === 'O' && (
        // oval: two concentric oval bumps
        <>
          <ellipse cx={0} cy={-ry * 0.28} rx={rx * 0.52} ry={ry * 0.28} fill="none" stroke={stroke} strokeWidth={0.9} />
          <ellipse cx={0} cy={ ry * 0.28} rx={rx * 0.48} ry={ry * 0.24} fill="none" stroke={stroke} strokeWidth={0.9} />
        </>
      )}
    </g>
  )
}

// ── Footprint path helpers ────────────────────────────────────────────────────

/** One footstep: (left|right) offset from a path centre point. */
interface Step {
  cx: number
  cy: number
  rotate: number
}

/**
 * Generate a sequence of left/right footprint positions along a straight path.
 * origin: start of the path centre.
 * direction: unit vector of travel.
 * count: number of footprints.
 * spacing: distance between consecutive footprints along the path.
 * sideOffset: perpendicular offset for L/R alternation.
 */
function makeSteps(
  ox: number, oy: number,
  dx: number, dy: number,
  count: number,
  spacing: number,
  sideOffset: number,
): Step[] {
  // perpendicular vector (left of travel)
  const px = -dy
  const py =  dx
  const angleRad = Math.atan2(dy, dx)
  const angleDeg = (angleRad * 180) / Math.PI

  return Array.from({ length: count }, (_, i) => {
    const t = (i + 0.5) * spacing
    const side = i % 2 === 0 ? 1 : -1 // alternate L/R
    return {
      cx: ox + dx * t + px * sideOffset * side,
      cy: oy + dy * t + py * sideOffset * side,
      rotate: angleDeg + 90, // sole perpendicular to direction of travel
    }
  })
}

// ── Track definitions ─────────────────────────────────────────────────────────
// Z-order for PROBLEM: D (bottom) → R (middle) → O (top)
// This matches answer A (dotted walked first = under everything).

const TRACK_D_STEPS: Step[] = makeSteps(
  20, 165, // bottom-left origin
  0.78, -0.63, // diagonal up-right
  7, 36, 7,
)

const TRACK_R_STEPS: Step[] = makeSteps(
  10, 100, // left-center origin
  1.0, 0.08, // nearly horizontal
  8, 34, 6,
)

const TRACK_O_STEPS: Step[] = makeSteps(
  18, 28, // top-left origin
  0.70,  0.72, // diagonal down-right
  7, 36, 7,
)

// ── Stem illustration (default export) ───────────────────────────────────────

/**
 * SnowTracks6ECIllustration
 *
 * Shows three crossing footprint tracks in a snow field.
 * NO labels or order hints — the student must read the crossings.
 * Z-order: D (dotted) rendered first (under), then R (ribbed), then O (oval) on top.
 */
export default function SnowTracks6ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Three overlapping footprint tracks crossing a snow field. ' +
        'One track has dotted soles (larger), one has ribbed soles (smaller), ' +
        'and one has oval smooth soles (medium). The tracks cross each other in the centre.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(340, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* snow background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={SNOW_BG} />

        {/* subtle snow surface line near bottom */}
        <line x1={0} y1={SVG_H - 8} x2={SVG_W} y2={SVG_H - 8} stroke={SNOW_STROKE} strokeWidth={1} />

        {/* Track D (dotted) — rendered first = visually UNDER everything */}
        {TRACK_D_STEPS.map((s, i) => (
          <FootprintPrimitive key={`d-${i}`} type="D" cx={s.cx} cy={s.cy} rotate={s.rotate} />
        ))}

        {/* Track R (ribbed) — middle layer */}
        {TRACK_R_STEPS.map((s, i) => (
          <FootprintPrimitive key={`r-${i}`} type="R" cx={s.cx} cy={s.cy} rotate={s.rotate} />
        ))}

        {/* Track O (oval) — rendered last = visually ON TOP of everything */}
        {TRACK_O_STEPS.map((s, i) => (
          <FootprintPrimitive key={`o-${i}`} type="O" cx={s.cx} cy={s.cy} rotate={s.rotate} />
        ))}
      </svg>
    </div>
  )
}

// ── Option renderer ───────────────────────────────────────────────────────────

/** The order of shoes for each answer choice [1st, 2nd, 3rd]. */
export const OPTION_ORDER: Record<'A' | 'B' | 'C' | 'D' | 'E', [ShoeType, ShoeType, ShoeType]> = {
  A: ['D', 'R', 'O'], // answer
  B: ['D', 'O', 'R'],
  C: ['R', 'D', 'O'],
  D: ['O', 'D', 'R'],
  E: ['R', 'O', 'D'],
}

const OPT_SVG_W = 180
const OPT_SVG_H = 60
const OPT_PAD = 14
const OPT_STEP = (OPT_SVG_W - OPT_PAD * 2) / 3
const OPT_CY = 26

const OPTION_ARIA: Record<'A' | 'B' | 'C' | 'D' | 'E', { en: string; id: string }> = {
  A: { en: 'Option A: dotted first, ribbed second, oval third',   id: 'Pilihan A: titik pertama, bergaris kedua, oval ketiga' },
  B: { en: 'Option B: dotted first, oval second, ribbed third',   id: 'Pilihan B: titik pertama, oval kedua, bergaris ketiga' },
  C: { en: 'Option C: ribbed first, dotted second, oval third',   id: 'Pilihan C: bergaris pertama, titik kedua, oval ketiga' },
  D: { en: 'Option D: oval first, dotted second, ribbed third',   id: 'Pilihan D: oval pertama, titik kedua, bergaris ketiga' },
  E: { en: 'Option E: ribbed first, oval second, dotted third',   id: 'Pilihan E: bergaris pertama, oval kedua, titik ketiga' },
}

/**
 * SnowTracks6ECOption — renders one A–E answer choice as three shoe icons in
 * left-to-right order labeled 1 → 2 → 3. Used as a CHOICE_RENDERERS entry.
 */
export function SnowTracks6ECOption({ choice }: { choice: WmiChoice }) {
  const label = (choice.label ?? '').trim().toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E'
  const order = OPTION_ORDER[label]
  if (!order) return <span>{choice.text}</span>

  const aria = OPTION_ARIA[label]?.en ?? choice.text

  return (
    <svg
      viewBox={`0 0 ${OPT_SVG_W} ${OPT_SVG_H}`}
      width={OPT_SVG_W}
      height={OPT_SVG_H}
      style={{ display: 'block' }}
      role="img"
      aria-label={aria}
    >
      {order.map((type, i) => {
        const cx = OPT_PAD + OPT_STEP * i + OPT_STEP / 2
        return (
          <g key={i}>
            <FootprintPrimitive type={type} cx={cx} cy={OPT_CY} rotate={0} />
            {/* order label below */}
            <text
              x={cx}
              y={OPT_SVG_H - 6}
              textAnchor="middle"
              dominantBaseline="auto"
              fontSize={10}
              fontWeight={700}
              fill="#374151"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {i + 1}
            </text>
          </g>
        )
      })}

      {/* divider arrows between shoes */}
      {[1, 2].map((i) => {
        const x = OPT_PAD + OPT_STEP * i
        return (
          <text
            key={i}
            x={x}
            y={OPT_CY + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fill="#9CA3AF"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {'→'}
          </text>
        )
      })}
    </svg>
  )
}
