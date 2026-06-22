// IKMC-20-EC-Q1 — "Which photo was taken on Tuesday?"
//
// A mushroom grows daily Mon–Fri. The A–E choices ARE the five photos
// (mushrooms of increasing size). There is NO separate stem figure because
// the choices duplicate it.
//
// TYPE: options-only — this file exports ONLY Mushroom1ECOption (the choice
// renderer). No default stem illustration export.
//
// Size ranking (from source paper, smallest→largest):
//   B (tiny sprout)  E (small)  C (medium-small)  D (medium-large)  A (tall)
//   Day 1=Mon  Day 2=Tue(E←answer)  Day 3=Wed  Day 4=Thu  Day 5=Fri
//
// Each mushroom is drawn with:
//   - a soil/grass base (wavy ellipse outline + a few spiky blades)
//   - a cylindrical stem (rounded rect)
//   - a dome cap (ellipse + partial lower ellipse for the underside rim)
//
// Pure SVG, no Math.random, no Date, SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ── Colour palette ────────────────────────────────────────────────────────────

const INK = '#1F2937'        // outline / stem
const CAP_FILL = '#6B7280'   // grey dome cap (matches source paper's grey-shaded cap)
const CAP_SHADE = '#4B5563'  // darker rim underside
const STEM_FILL = '#F3F4F6'  // near-white stem
const GRASS_FILL = '#D1D5DB' // light grey grass tufts (source is b&w)
const GROUND_FILL = '#E5E7EB'

// ── Mushroom shape descriptor ─────────────────────────────────────────────────

interface MushroomShape {
  /** Total SVG height */
  svgH: number
  /** Total SVG width */
  svgW: number
  /** Cap centre X */
  capCX: number
  /** Cap centre Y */
  capCY: number
  /** Cap horizontal radius */
  capRX: number
  /** Cap vertical radius */
  capRY: number
  /** Stem top Y */
  stemTopY: number
  /** Stem bottom Y */
  stemBotY: number
  /** Stem half-width */
  stemHW: number
  /** Ground / grass baseline Y */
  groundY: number
  /** Number of grass blades */
  blades: number
}

// The five mushrooms scaled to match the relative proportions in the source paper.
// B is the tiniest (barely emerging), A is the tallest with the widest cap.
// All drawn in a 80-wide viewBox, heights vary.

const SHAPES: Record<string, MushroomShape> = {
  // A — tallest, widest cap (Friday/Day 5)
  A: {
    svgW: 80, svgH: 100,
    capCX: 40, capCY: 28, capRX: 30, capRY: 22,
    stemTopY: 45, stemBotY: 72, stemHW: 8,
    groundY: 78, blades: 5,
  },
  // B — tiny sprout, cap barely formed (Monday/Day 1)
  B: {
    svgW: 80, svgH: 100,
    capCX: 40, capCY: 60, capRX: 14, capRY: 10,
    stemTopY: 67, stemBotY: 75, stemHW: 4,
    groundY: 78, blades: 5,
  },
  // C — medium mushroom (Wednesday/Day 3)
  C: {
    svgW: 80, svgH: 100,
    capCX: 40, capCY: 40, capRX: 24, capRY: 18,
    stemTopY: 54, stemBotY: 72, stemHW: 6,
    groundY: 78, blades: 5,
  },
  // D — medium-large, wide cap and distinct stem (Thursday/Day 4)
  D: {
    svgW: 80, svgH: 100,
    capCX: 40, capCY: 33, capRX: 27, capRY: 20,
    stemTopY: 49, stemBotY: 72, stemHW: 7,
    groundY: 78, blades: 5,
  },
  // E — small mushroom, second-smallest (TUESDAY / Day 2 — ANSWER)
  E: {
    svgW: 80, svgH: 100,
    capCX: 40, capCY: 52, capRX: 17, capRY: 12,
    stemTopY: 61, stemBotY: 74, stemHW: 5,
    groundY: 78, blades: 5,
  },
}

// ── Grass blade helper ────────────────────────────────────────────────────────

/**
 * Renders a small set of spiky grass blades centred at groundY on the
 * x-axis. Matches the wavy/spiky grass in the source paper.
 */
function GrassBlade({
  cx, groundY, bladeW, bladeH,
}: {
  cx: number
  groundY: number
  bladeW: number
  bladeH: number
}) {
  // Three-blade group: left-lean, centre-upright, right-lean
  const pts = [
    `${cx - bladeW},${groundY} ${cx - bladeW / 2},${groundY - bladeH} ${cx},${groundY}`,
    `${cx - bladeW / 4},${groundY} ${cx},${groundY - bladeH * 1.15} ${cx + bladeW / 4},${groundY}`,
    `${cx},${groundY} ${cx + bladeW / 2},${groundY - bladeH} ${cx + bladeW},${groundY}`,
  ]
  return (
    <>
      {pts.map((p, i) => (
        <polygon key={i} points={p} fill={GRASS_FILL} stroke={INK} strokeWidth={0.8} strokeLinejoin="round" />
      ))}
    </>
  )
}

// ── MushroomSVG ───────────────────────────────────────────────────────────────

function MushroomSVG({ shape, size = 72 }: { shape: MushroomShape; size?: number }) {
  const {
    svgW, svgH,
    capCX, capCY, capRX, capRY,
    stemTopY, stemBotY, stemHW,
    groundY, blades,
  } = shape

  const aspect = svgH / svgW
  const svgDisplayH = Math.round(size * aspect)

  // Ground ellipse dimensions
  const groundRX = svgW * 0.4
  const groundRY = 5

  // Grass blade spread: space evenly across the ground width
  const bladeSpacing = (groundRX * 2) / (blades + 1)
  const bladeStartX = capCX - groundRX + bladeSpacing
  const bladeW = bladeSpacing * 0.55
  const bladeH = groundRY * 2.2

  // Rim underside: a partial ellipse arc drawn as a path below the cap centre
  // to simulate the gills/underside visible in the source illustrations.
  const rimY = capCY + capRY * 0.3
  const rimRX = capRX * 0.85
  const rimRY = capRY * 0.35
  // SVG arc for the rim: left edge → right edge, swept downward
  const rimPath = `M ${capCX - rimRX},${rimY} A ${rimRX},${rimRY} 0 0 0 ${capCX + rimRX},${rimY}`

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width={size}
      height={svgDisplayH}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* Ground fill */}
      <ellipse cx={capCX} cy={groundY} rx={groundRX} ry={groundRY} fill={GROUND_FILL} />

      {/* Grass blades */}
      {Array.from({ length: blades }, (_, i) => (
        <GrassBlade
          key={i}
          cx={bladeStartX + i * bladeSpacing}
          groundY={groundY - groundRY + 1}
          bladeW={bladeW}
          bladeH={bladeH}
        />
      ))}

      {/* Ground outline */}
      <ellipse
        cx={capCX}
        cy={groundY}
        rx={groundRX}
        ry={groundRY}
        fill="none"
        stroke={INK}
        strokeWidth={1}
      />

      {/* Stem */}
      <rect
        x={capCX - stemHW}
        y={stemTopY}
        width={stemHW * 2}
        height={stemBotY - stemTopY}
        rx={stemHW * 0.6}
        ry={stemHW * 0.6}
        fill={STEM_FILL}
        stroke={INK}
        strokeWidth={1}
      />

      {/* Cap dome */}
      <ellipse
        cx={capCX}
        cy={capCY}
        rx={capRX}
        ry={capRY}
        fill={CAP_FILL}
        stroke={INK}
        strokeWidth={1.2}
      />

      {/* Underside rim arc */}
      <path
        d={rimPath}
        fill="none"
        stroke={CAP_SHADE}
        strokeWidth={1}
        strokeLinecap="round"
      />
    </svg>
  )
}

// ── Aria labels ───────────────────────────────────────────────────────────────

const OPTION_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Option A: a large mushroom with a wide dome cap and tall stem.',
    id: 'Pilihan A: jamur besar dengan tutup kubah lebar dan tangkai tinggi.',
  },
  B: {
    en: 'Option B: a tiny mushroom sprout just emerging from the ground.',
    id: 'Pilihan B: kecambah jamur kecil yang baru muncul dari tanah.',
  },
  C: {
    en: 'Option C: a medium-small mushroom.',
    id: 'Pilihan C: jamur berukuran kecil-sedang.',
  },
  D: {
    en: 'Option D: a medium-large mushroom with a wide cap.',
    id: 'Pilihan D: jamur berukuran sedang-besar dengan tutup lebar.',
  },
  E: {
    en: 'Option E: a small mushroom, the second-smallest of the five.',
    id: 'Pilihan E: jamur kecil, terkecil kedua dari lima pilihan.',
  },
}

// ── Co-export: choice option renderer ────────────────────────────────────────

/**
 * Mushroom1ECOption — renders one A/B/C/D/E choice as an SVG mushroom drawing.
 * Registered in CHOICE_RENDERERS for IKMC-20-EC-Q1.
 *
 * Each mushroom corresponds to one day Mon–Fri; sizes increase from Monday
 * (smallest) to Friday (largest). Tuesday = Day 2 = second-smallest = E.
 */
export function Mushroom1ECOption({ choice }: { choice: WmiChoice }) {
  const shape = SHAPES[choice.label]
  const aria = OPTION_ARIA[choice.label]
  if (!shape) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <MushroomSVG shape={shape} size={72} />
    </span>
  )
}

// Re-export MushroomSVG and SHAPES so the explainer can import them directly.
export { MushroomSVG, SHAPES }
export type { MushroomShape }
