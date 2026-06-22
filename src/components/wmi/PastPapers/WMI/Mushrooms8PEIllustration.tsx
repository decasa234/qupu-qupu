/* eslint-disable react-refresh/only-export-components */
// IKMC-21-PE-Q8 — "The picture shows 2 mushrooms. What is the difference between
// their heights?"  Answer: B (5).
//
// Reading the scan (2021.imgs/015.jpg):
//   - A vertical ruler runs along the RIGHT edge of the figure, numbered 0 (bottom)
//     to 12 (top).
//   - LEFT mushroom (taller): stem bottom at 0, cap top at 11 → height = 11
//   - RIGHT mushroom (shorter): stem bottom at 0, cap top at 6  → height = 6
//   - Difference = 11 − 6 = 5  (choice B).
//
// The STATIC illustration shows ONLY the problem figure — the two mushrooms with
// the ruler — and does NOT label the heights or reveal the answer.
//
// The co-exported primitive (Mushrooms8PEScene) accepts beat-control props so the
// explainer can overlay height brackets without re-drawing the scene.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── shared layout constants ────────────────────────────────────────────────────

/** SVG canvas size. */
export const SVG_W = 260
export const SVG_H = 240

/** Ruler geometry. */
export const RULER_X = 218          // x of the ruler baseline line
export const RULER_BOTTOM_Y = 218   // SVG y for ruler value 0
export const RULER_TOP_Y = 18       // SVG y for ruler value 12
export const RULER_MAX = 12         // max tick value

/** Pixels per ruler unit. */
export const PX_PER_UNIT = (RULER_BOTTOM_Y - RULER_TOP_Y) / RULER_MAX // 16.67

/** Convert ruler value to SVG y coordinate. */
export const rulerY = (v: number): number =>
  RULER_BOTTOM_Y - v * PX_PER_UNIT

/** Mushroom measurements (ruler units). */
export const TALL_HEIGHT = 11       // left mushroom, taller
export const SHORT_HEIGHT = 6       // right mushroom, shorter
export const ANSWER = TALL_HEIGHT - SHORT_HEIGHT  // 5

/** Colour palette. */
export const COLOR = {
  GROUND: '#D4C5A0',
  STEM: '#E8D08A',
  STEM_STROKE: '#8B6914',
  CAP_LEFT: '#E84040',    // classic red toadstool
  CAP_LEFT_STROKE: '#A31C1C',
  CAP_RIGHT: '#E84040',
  CAP_RIGHT_STROKE: '#A31C1C',
  SPOT: '#FFFFFF',
  RULER_LINE: '#4B5563',
  RULER_TEXT: '#1F2937',
  BRACKET: '#30598A',
} as const

// ── mushroom centre x positions ───────────────────────────────────────────────

/** X centre of the tall (left) mushroom. */
export const LEFT_X = 80
/** X centre of the short (right) mushroom. */
export const RIGHT_X = 158

// ── mushroom primitive ─────────────────────────────────────────────────────────

interface MushroomProps {
  cx: number           // horizontal centre
  heightUnits: number  // height in ruler units
  capScale?: number    // cap width scale relative to height (default 1)
}

/**
 * A simple two-part mushroom: rectangular stem + semicircular/arched cap.
 * The stem sits on the ground line (RULER_BOTTOM_Y) and rises to `heightUnits`
 * on the ruler scale.
 */
export function Mushroom({ cx, heightUnits, capScale = 1 }: MushroomProps) {
  const topY = rulerY(heightUnits)
  const groundY = RULER_BOTTOM_Y

  // Stem: tall slender rectangle
  const stemW = 12 * capScale
  const stemLeft = cx - stemW / 2

  // Cap sits on top of the stem. Its height is ~40% of total mushroom height.
  const totalH = groundY - topY
  const capH = totalH * 0.45
  const capW = totalH * 0.65 * capScale
  const capTopY = topY
  const capBottomY = topY + capH
  const stemTopY = capBottomY  // stem starts where cap ends

  return (
    <g>
      {/* stem */}
      <rect
        x={stemLeft}
        y={stemTopY}
        width={stemW}
        height={groundY - stemTopY}
        rx={2}
        fill={COLOR.STEM}
        stroke={COLOR.STEM_STROKE}
        strokeWidth={1.5}
      />
      {/* cap — arch shape */}
      <path
        d={`M ${cx - capW / 2} ${capBottomY}
            Q ${cx - capW / 2} ${capTopY} ${cx} ${capTopY}
            Q ${cx + capW / 2} ${capTopY} ${cx + capW / 2} ${capBottomY}
            Z`}
        fill={COLOR.CAP_LEFT}
        stroke={COLOR.CAP_LEFT_STROKE}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* white polka dots on cap */}
      <circle cx={cx} cy={capTopY + capH * 0.35} r={capW * 0.1} fill={COLOR.SPOT} />
      <circle cx={cx - capW * 0.28} cy={capTopY + capH * 0.6} r={capW * 0.08} fill={COLOR.SPOT} />
      <circle cx={cx + capW * 0.28} cy={capTopY + capH * 0.6} r={capW * 0.08} fill={COLOR.SPOT} />
    </g>
  )
}

// ── ruler primitive ────────────────────────────────────────────────────────────

/**
 * Vertical ruler on the right side of the figure.
 * Ticks at every unit, labeled at 0, 3, 6, 9, 12.
 */
export function Ruler() {
  const ticks = Array.from({ length: RULER_MAX + 1 }, (_, i) => i)
  const LABEL_AT = new Set([0, 3, 6, 9, 12])

  return (
    <g>
      {/* vertical baseline */}
      <line
        x1={RULER_X}
        y1={RULER_BOTTOM_Y}
        x2={RULER_X}
        y2={RULER_TOP_Y}
        stroke={COLOR.RULER_LINE}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {ticks.map((v) => {
        const y = rulerY(v)
        const tickLen = LABEL_AT.has(v) ? 8 : 5
        const showLabel = LABEL_AT.has(v)
        return (
          <g key={v}>
            <line
              x1={RULER_X - tickLen}
              y1={y}
              x2={RULER_X}
              y2={y}
              stroke={COLOR.RULER_LINE}
              strokeWidth={showLabel ? 1.5 : 1}
            />
            {showLabel && (
              <text
                x={RULER_X - tickLen - 4}
                y={y}
                textAnchor="end"
                dominantBaseline="central"
                fontSize={10}
                fontWeight={700}
                fill={COLOR.RULER_TEXT}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {v}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

// ── scene primitive (reused by explainer) ─────────────────────────────────────

export interface Mushrooms8PESceneProps {
  /** When true, show a dashed height line alongside the tall mushroom. */
  showTallBracket?: boolean
  /** When true, show a dashed height line alongside the short mushroom. */
  showShortBracket?: boolean
  /** When true, show the difference bracket between the two top marks. */
  showDiffBracket?: boolean
}

/**
 * Shared scene primitive: ground, two mushrooms, ruler.
 * The explainer overlays brackets by passing the show* props.
 */
export function Mushrooms8PEScene({
  showTallBracket = false,
  showShortBracket = false,
  showDiffBracket = false,
}: Mushrooms8PESceneProps = {}) {
  const tallTopY = rulerY(TALL_HEIGHT)
  const shortTopY = rulerY(SHORT_HEIGHT)
  const groundY = RULER_BOTTOM_Y
  const bracketX = RULER_X + 16   // brackets go to the right of the ruler

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={Math.min(240, SVG_W)}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* white background */}
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

      {/* ground strip */}
      <rect x={0} y={groundY} width={SVG_W} height={SVG_H - groundY} fill={COLOR.GROUND} />
      <line
        x1={0}
        y1={groundY}
        x2={SVG_W}
        y2={groundY}
        stroke={COLOR.STEM_STROKE}
        strokeWidth={2}
      />

      {/* left (tall) mushroom */}
      <Mushroom cx={LEFT_X} heightUnits={TALL_HEIGHT} capScale={1.0} />

      {/* right (short) mushroom */}
      <Mushroom cx={RIGHT_X} heightUnits={SHORT_HEIGHT} capScale={0.8} />

      {/* ruler */}
      <Ruler />

      {/* optional tall-mushroom height bracket */}
      {showTallBracket && (
        <g>
          <line
            x1={bracketX}
            y1={tallTopY}
            x2={bracketX}
            y2={groundY}
            stroke={COLOR.BRACKET}
            strokeWidth={2}
            strokeDasharray="4 3"
          />
          <line x1={bracketX - 4} y1={tallTopY} x2={bracketX + 4} y2={tallTopY} stroke={COLOR.BRACKET} strokeWidth={2} />
          <line x1={bracketX - 4} y1={groundY} x2={bracketX + 4} y2={groundY} stroke={COLOR.BRACKET} strokeWidth={2} />
          <text
            x={bracketX + 10}
            y={(tallTopY + groundY) / 2}
            dominantBaseline="central"
            fontSize={11}
            fontWeight={700}
            fill={COLOR.BRACKET}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {TALL_HEIGHT}
          </text>
        </g>
      )}

      {/* optional short-mushroom height bracket */}
      {showShortBracket && (
        <g>
          <line
            x1={bracketX + 28}
            y1={shortTopY}
            x2={bracketX + 28}
            y2={groundY}
            stroke="#f0853a"
            strokeWidth={2}
            strokeDasharray="4 3"
          />
          <line x1={bracketX + 24} y1={shortTopY} x2={bracketX + 32} y2={shortTopY} stroke="#f0853a" strokeWidth={2} />
          <line x1={bracketX + 24} y1={groundY} x2={bracketX + 32} y2={groundY} stroke="#f0853a" strokeWidth={2} />
          <text
            x={bracketX + 38}
            y={(shortTopY + groundY) / 2}
            dominantBaseline="central"
            fontSize={11}
            fontWeight={700}
            fill="#f0853a"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {SHORT_HEIGHT}
          </text>
        </g>
      )}

      {/* optional difference bracket between the two tops */}
      {showDiffBracket && (
        <g>
          {/* dashed line from short top up to tall top height */}
          <line
            x1={RIGHT_X + 22}
            y1={shortTopY}
            x2={RIGHT_X + 22}
            y2={tallTopY}
            stroke="#10B981"
            strokeWidth={2.5}
            strokeDasharray="4 3"
          />
          <line x1={RIGHT_X + 18} y1={shortTopY} x2={RIGHT_X + 26} y2={shortTopY} stroke="#10B981" strokeWidth={2} />
          <line x1={RIGHT_X + 18} y1={tallTopY} x2={RIGHT_X + 26} y2={tallTopY} stroke="#10B981" strokeWidth={2} />
          <text
            x={RIGHT_X + 32}
            y={(shortTopY + tallTopY) / 2}
            dominantBaseline="central"
            fontSize={13}
            fontWeight={900}
            fill="#10B981"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {ANSWER}
          </text>
        </g>
      )}
    </svg>
  )
}

// ── default export: static problem illustration ────────────────────────────────

/**
 * Mushrooms8PEIllustration
 *
 * Static, problem-only figure for IKMC-21-PE-Q8.
 * Shows two mushrooms beside a ruler (0–12). Does NOT reveal the heights
 * or the difference — students must read the scale themselves.
 */
export default function Mushrooms8PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Dua jamur di atas tanah dengan penggaris di sisi kanan (0 sampai 12). Jamur kiri lebih tinggi dari jamur kanan. Berapakah selisih tinggi mereka?"
    >
      <Mushrooms8PEScene />
    </div>
  )
}
