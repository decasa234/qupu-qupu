/**
 * IKMC-21-EC-Q4 — "Alaya draws a picture of the sun. Which of the following
 * answers is part of her picture?" (answer B)
 *
 * STEM: The full sun drawing — a circle with a smiley face, surrounded by
 * about 13 uneven spiky/jagged rays radiating outward. This is what is shown
 * in the problem figure (OCR 2021.imgs/015.jpg).
 *
 * The five answer options are each a small cluster of 2–3 spiky rays that
 * must be visually matched to a section of the sun's ray ring. Only option B
 * (a fan of 3 even rays) exactly matches a section of the full drawing.
 *
 * Co-exports Sun4ECOption (choice renderer for A–E) used by CHOICE_RENDERERS.
 *
 * Faithfully reconstructed from the source scan:
 *   015.jpg — full sun (stem)
 *   016.jpg — option A (2 narrow rays, widely spaced)
 *   017.jpg — option B (3 rays, even fan — CORRECT answer)
 *   018.jpg — option C (3 rays, middle taller)
 *   019.jpg — option D (2 rays, wider V-shape)
 *   020.jpg — option E (3 rays, outer ones swept far outward)
 *
 * Pure SVG — no Math.random, no Date, no window/document. SSR-safe.
 */

import type { WmiChoice } from '../../../../types/wmi'

// ── colour tokens ─────────────────────────────────────────────────────────────

const INK = '#1F2937'
const RAY_FILL = '#FDE68A'
const RAY_STROKE = '#B45309'
const CIRCLE_FILL = '#FEF3C7'
const CIRCLE_STROKE = '#B45309'
const FACE_INK = '#78350F'

// ── Sun SVG dimensions ────────────────────────────────────────────────────────

export const SVG_W = 200
export const SVG_H = 200
export const CX = 100   // centre x
export const CY = 100   // centre y
export const R = 46     // sun circle radius

// ── Spiky ray primitive ───────────────────────────────────────────────────────

/**
 * A single spiky sun ray: an isoceles triangle pointing outward.
 * angleDeg = direction from centre (0 = right, 90 = down in SVG, etc.)
 * baseR    = inner radius (where the base of the triangle sits)
 * tipR     = outer radius (where the tip of the triangle sits)
 * halfW    = half-width of the base (in angle-space radians ≈ half-width px at baseR)
 */
function Ray({
  cx, cy, angleDeg, baseR, tipR, halfWidthDeg,
}: {
  cx: number
  cy: number
  angleDeg: number
  baseR: number
  tipR: number
  halfWidthDeg: number
}) {
  const toRad = (d: number) => (d * Math.PI) / 180
  const ang = toRad(angleDeg)
  const dL = toRad(angleDeg - halfWidthDeg)
  const dR = toRad(angleDeg + halfWidthDeg)

  const tipX = cx + tipR * Math.cos(ang)
  const tipY = cy + tipR * Math.sin(ang)
  const baseL = { x: cx + baseR * Math.cos(dL), y: cy + baseR * Math.sin(dL) }
  const baseR2 = { x: cx + baseR * Math.cos(dR), y: cy + baseR * Math.sin(dR) }

  return (
    <polygon
      points={`${tipX},${tipY} ${baseL.x},${baseL.y} ${baseR2.x},${baseR2.y}`}
      fill={RAY_FILL}
      stroke={RAY_STROKE}
      strokeWidth={1.2}
      strokeLinejoin="round"
    />
  )
}

// ── The 13 rays of the full sun ───────────────────────────────────────────────
// Distributed with slight irregularity (not perfect 360/13 spacing) to match
// the hand-drawn look in the source scan. All angles in degrees (SVG: 0=right).

const SUN_RAYS: Array<{ angleDeg: number; tipR: number; halfWidthDeg: number }> = [
  { angleDeg:   0, tipR: 88, halfWidthDeg: 6.5 },
  { angleDeg:  26, tipR: 86, halfWidthDeg: 6   },
  { angleDeg:  51, tipR: 90, halfWidthDeg: 6   },
  { angleDeg:  76, tipR: 86, halfWidthDeg: 6.5 },
  { angleDeg: 100, tipR: 88, halfWidthDeg: 6   },
  { angleDeg: 126, tipR: 86, halfWidthDeg: 6   },
  { angleDeg: 152, tipR: 90, halfWidthDeg: 6.5 },
  { angleDeg: 178, tipR: 88, halfWidthDeg: 6   },
  { angleDeg: 204, tipR: 86, halfWidthDeg: 6   },
  { angleDeg: 228, tipR: 90, halfWidthDeg: 6.5 },
  { angleDeg: 254, tipR: 88, halfWidthDeg: 6   },
  { angleDeg: 280, tipR: 86, halfWidthDeg: 6   },
  { angleDeg: 308, tipR: 90, halfWidthDeg: 6.5 },
]

// ── SunFace primitive ─────────────────────────────────────────────────────────

/** The smiley face inside the sun circle (eyes + smile arc). */
export function SunFace({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const eyeOffX = r * 0.28
  const eyeOffY = r * 0.2
  const smileR = r * 0.35

  // Smile arc: bottom half of a circle
  const smileX = cx
  const smileY = cy + r * 0.12
  const smileSX = smileX - smileR
  const smileSY = smileY
  const smileEX = smileX + smileR
  const smileEY = smileY

  return (
    <g>
      {/* left eye */}
      <circle cx={cx - eyeOffX} cy={cy - eyeOffY} r={r * 0.1} fill={FACE_INK} />
      {/* right eye */}
      <circle cx={cx + eyeOffX} cy={cy - eyeOffY} r={r * 0.1} fill={FACE_INK} />
      {/* smile arc */}
      <path
        d={`M ${smileSX} ${smileSY} A ${smileR} ${smileR * 0.55} 0 0 1 ${smileEX} ${smileEY}`}
        fill="none"
        stroke={FACE_INK}
        strokeWidth={r * 0.09}
        strokeLinecap="round"
      />
    </g>
  )
}

// ── FullSun primitive ─────────────────────────────────────────────────────────

/**
 * The complete sun: circle + face + all rays.
 * cx, cy: centre. r: circle radius.
 * Exported so the explainer can overlay highlights on the same geometry.
 */
export function FullSun({
  cx,
  cy,
  r,
  highlightRays,
}: {
  cx: number
  cy: number
  r: number
  highlightRays?: boolean
}) {
  const baseR = r + 4
  return (
    <g>
      {/* rays behind circle */}
      {SUN_RAYS.map((ray, i) => (
        <Ray
          key={i}
          cx={cx}
          cy={cy}
          angleDeg={ray.angleDeg}
          baseR={baseR}
          tipR={cx === CX ? ray.tipR : r + (ray.tipR - R)}  // scale tipR proportionally
          halfWidthDeg={ray.halfWidthDeg}
        />
      ))}
      {/* glow ring on highlight */}
      {highlightRays && (
        <circle
          cx={cx}
          cy={cy}
          r={cx === CX ? 91 : r * 2}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={4}
          strokeDasharray="6 3"
          opacity={0.7}
        />
      )}
      {/* main circle */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={CIRCLE_FILL}
        stroke={CIRCLE_STROKE}
        strokeWidth={2.5}
      />
      {/* smiley face */}
      <SunFace cx={cx} cy={cy} r={r} />
    </g>
  )
}

// ── Default export: stem illustration ─────────────────────────────────────────

/**
 * Sun4ECIllustration
 *
 * Stem-only figure for IKMC-21-EC-Q4.
 * Shows Alaya's full sun drawing — a smiley circle with ~13 spiky rays.
 * Does NOT show which answer matches (answer B). Does NOT show the options.
 */
export default function Sun4ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Alaya's sun drawing: a smiling circle with spiky rays all around."
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(240, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />
        <FullSun cx={CX} cy={CY} r={R} />
      </svg>
    </div>
  )
}

// ── Option renderer ───────────────────────────────────────────────────────────

/**
 * Each option shows a small cluster of 2–3 spiky rays.
 * Faithfully reconstructed from the source option crops (016–020.jpg).
 *
 * The options are rendered on a small square SVG so they fit inside choice
 * buttons without scaling issues.
 *
 * A: 2 rays, narrow points, widely spaced (angles ~-30°, +30°)
 * B: 3 rays, even fan (angles ~-22°, 0°, +22°) — CORRECT
 * C: 3 rays, middle taller/longer (angles ~-24°, 0°, +24°; middle tipR bigger)
 * D: 2 rays, wider V-shape (angles ~-38°, +38°)
 * E: 3 rays, outer ones very widely swept (angles ~-40°, 0°, +40°)
 */

const OPT_CX = 48
const OPT_CY = 56    // shifted down so rays radiate upward (matches crops)
const OPT_BASE_R = 2 // very small base so rays look like they emerge from a point

// In the option crops the rays radiate roughly upward from the bottom of the frame.
// We centre them pointing up (270° in SVG = up, since SVG y-axis is inverted).
const UP = 270

type OptionRaySpec = { angleDeg: number; tipR: number; halfWidthDeg: number }

const OPTION_RAYS: Record<string, OptionRaySpec[]> = {
  // A: 2 narrow rays, widely spaced
  A: [
    { angleDeg: UP - 24, tipR: 46, halfWidthDeg: 5   },
    { angleDeg: UP + 24, tipR: 44, halfWidthDeg: 5   },
  ],
  // B: 3 rays, even fan — correct answer
  B: [
    { angleDeg: UP - 20, tipR: 46, halfWidthDeg: 5.5 },
    { angleDeg: UP,      tipR: 48, halfWidthDeg: 5.5 },
    { angleDeg: UP + 20, tipR: 46, halfWidthDeg: 5.5 },
  ],
  // C: 3 rays, middle taller
  C: [
    { angleDeg: UP - 22, tipR: 40, halfWidthDeg: 5.5 },
    { angleDeg: UP,      tipR: 52, halfWidthDeg: 5.5 },
    { angleDeg: UP + 22, tipR: 40, halfWidthDeg: 5.5 },
  ],
  // D: 2 rays, wider V
  D: [
    { angleDeg: UP - 36, tipR: 46, halfWidthDeg: 6   },
    { angleDeg: UP + 36, tipR: 46, halfWidthDeg: 6   },
  ],
  // E: 3 rays, outer swept far outward
  E: [
    { angleDeg: UP - 40, tipR: 44, halfWidthDeg: 6   },
    { angleDeg: UP,      tipR: 46, halfWidthDeg: 5.5 },
    { angleDeg: UP + 40, tipR: 44, halfWidthDeg: 6   },
  ],
}

const OPT_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Option A: two narrow spiky rays spread widely apart.',
    id: 'Pilihan A: dua sinar runcing yang tersebar jauh.',
  },
  B: {
    en: "Option B: three rays in an even fan — this matches a section of Alaya's sun.",
    id: 'Pilihan B: tiga sinar dalam kipas rata — ini cocok dengan bagian matahari Alaya.',
  },
  C: {
    en: 'Option C: three rays, the middle one is taller than the outer two.',
    id: 'Pilihan C: tiga sinar, yang tengah lebih tinggi dari dua lainnya.',
  },
  D: {
    en: 'Option D: two rays in a wide V-shape.',
    id: 'Pilihan D: dua sinar dalam bentuk V lebar.',
  },
  E: {
    en: 'Option E: three rays with the outer two swept far outward.',
    id: 'Pilihan E: tiga sinar dengan dua sinar luar yang menyapu jauh keluar.',
  },
}

/**
 * Sun4ECOption — renders one A/B/C/D/E choice as a small ray-cluster SVG.
 * Registered in CHOICE_RENDERERS for IKMC-21-EC-Q4.
 */
export function Sun4ECOption({ choice }: { choice: WmiChoice }) {
  const k = choice.label as 'A' | 'B' | 'C' | 'D' | 'E'
  const rays = OPTION_RAYS[k]
  const aria = OPT_ARIA[k]
  if (!rays) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria.en}
      style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', padding: 4 }}
    >
      <svg
        viewBox="0 0 96 96"
        width={72}
        height={72}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={96} height={96} fill="white" />
        {rays.map((ray, i) => (
          <Ray
            key={i}
            cx={OPT_CX}
            cy={OPT_CY}
            angleDeg={ray.angleDeg}
            baseR={OPT_BASE_R}
            tipR={ray.tipR}
            halfWidthDeg={ray.halfWidthDeg}
          />
        ))}
        {/* small dot at origin to show ray source */}
        <circle cx={OPT_CX} cy={OPT_CY} r={3} fill={RAY_STROKE} />
        {/* option label */}
        <text
          x={82}
          y={88}
          textAnchor="end"
          dominantBaseline="auto"
          fontSize={11}
          fontWeight={800}
          fill={INK}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {k}
        </text>
      </svg>
    </span>
  )
}
