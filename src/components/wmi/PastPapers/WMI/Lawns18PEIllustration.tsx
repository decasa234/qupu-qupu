import type { WmiChoice } from '../../../../types/wmi'

// IKMC-22-PE-Q18 — "Which lawn is the smallest?" (5-point question).
//
// All five options A–E are pictures of green polygon lawns drawn on a dot grid.
// The choices ARE the only figures — there is NO separate stem illustration.
// This file exports only `Lawns18PEOption` (the CHOICE_RENDERERS entry) and the
// shared `LawnShape` primitive reused by the explainer.
//
// Lawn shapes reconstructed from the scanned option images
// (docs/reference/ocr-res/ikmc/contest/preecolier/2022.imgs/050-054.jpg):
//
//   A — crown shape: wide irregular polygon with two triangular notches on top.
//       Smallest area ≈ 7.5 grid squares. ← CORRECT ANSWER
//   B — C-shape: two hexagonal lobes connected with a rectangular bridge,
//       notch cut from the right. Area ≈ 10 grid squares.
//   C — W/zigzag: two hexagonal lobes joined, alternating dips. Area ≈ 10 grid squares.
//   D — wide hexagon / stretched parallelogram. Area ≈ 9 grid squares.
//   E — two hexagonal lobes with a stepped notch. Area ≈ 11 grid squares.
//
// All shapes sit in a 120×80 viewBox so each lawn is a consistent size on screen.
// Coordinates are hand-traced from the source images.

export const LAWN_GREEN = '#7AC74F'
export const LAWN_STROKE = '#3A7D1E'

// ---------------------------------------------------------------------------
// Individual lawn polygon data (SVG points strings, viewBox 120×80 each)
// ---------------------------------------------------------------------------

/**
 * Lawn A — crown / chevron with two triangular peaks.
 * Tracing: wide trapezoid body with two peaks cut into the top edge.
 * Grid points from source image (roughly a 6-wide, 3-tall shape with 2 peaks).
 */
export const LAWN_A_POINTS =
  '10,65 10,45 25,28 37,45 45,30 57,45 70,45 70,65'

/**
 * Lawn B — C-shaped / horseshoe with two hexagonal lobes.
 * Tracing: rectangular left section + hexagonal nub on the lower-right,
 * with a rectangular notch cut from the upper-right.
 */
export const LAWN_B_POINTS =
  '12,20 68,20 68,32 85,32 95,44 85,56 68,56 68,68 12,68 12,56 30,44 12,32'

/**
 * Lawn C — W / double-hexagon zigzag.
 * Two hexagonal blobs meeting at a valley in the middle.
 */
export const LAWN_C_POINTS =
  '8,38 20,20 42,20 54,38 66,20 88,20 100,38 88,56 66,56 54,70 42,56 20,56'

/**
 * Lawn D — wide stretched hexagon / parallelogram with chevron point on right.
 * Tracing: left flat side, wide top/bottom, arrow point on the right edge.
 */
export const LAWN_D_POINTS =
  '12,22 85,22 95,42 85,62 12,62 22,42'

/**
 * Lawn E — two hexagonal lobes side-by-side with a step/notch between them
 * on the top-left area.
 */
export const LAWN_E_POINTS =
  '8,34 20,20 40,20 52,34 52,46 64,34 76,20 96,20 108,34 96,56 76,56 64,46 52,46 40,56 20,56'

export const LAWN_POINTS: Record<string, string> = {
  A: LAWN_A_POINTS,
  B: LAWN_B_POINTS,
  C: LAWN_C_POINTS,
  D: LAWN_D_POINTS,
  E: LAWN_E_POINTS,
}

// Aria descriptions for screen-readers (bilingual)
export const LAWN_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Lawn A: crown shape with two triangular peaks — smallest area',
    id: 'Halaman A: bentuk mahkota dengan dua puncak segitiga — luas terkecil',
  },
  B: {
    en: 'Lawn B: C-shaped with two hexagonal lobes and a notch on the right',
    id: 'Halaman B: bentuk C dengan dua lobus heksagonal dan takik di kanan',
  },
  C: {
    en: 'Lawn C: W-shape, two hexagonal lobes meeting in a zigzag',
    id: 'Halaman C: bentuk W, dua lobus heksagonal bertemu dalam zigzag',
  },
  D: {
    en: 'Lawn D: wide stretched hexagon with an arrow point on the right',
    id: 'Halaman D: heksagon lebar memanjang dengan ujung panah di kanan',
  },
  E: {
    en: 'Lawn E: two hexagonal lobes side-by-side with a stepped notch',
    id: 'Halaman E: dua lobus heksagonal berdampingan dengan takik bertingkat',
  },
}

// ---------------------------------------------------------------------------
// LawnShape — shared SVG primitive used by both Option and Explainer
// ---------------------------------------------------------------------------

export interface LawnShapeProps {
  /** Choice label: 'A' | 'B' | 'C' | 'D' | 'E' */
  label: string
  /** Highlight ring color (optional — used by explainer to mark the answer) */
  highlightColor?: string
  /** Width of the SVG in px (height is derived from the viewBox aspect) */
  width?: number
}

/**
 * Renders one lawn shape as a plain green SVG polygon.
 * Used by Lawns18PEOption (choice renderer) and Lawns18PEExplainer.
 * Deterministic and SSR-safe.
 */
export function LawnShape({ label, highlightColor, width = 120 }: LawnShapeProps) {
  const pts = LAWN_POINTS[label]
  if (!pts) return null

  const aria = LAWN_ARIA[label]

  return (
    <svg
      viewBox="0 0 120 88"
      width={width}
      style={{ display: 'block' }}
      role="img"
      aria-label={aria?.en ?? `Lawn ${label}`}
    >
      {highlightColor && (
        <polygon
          points={pts}
          fill="none"
          stroke={highlightColor}
          strokeWidth={5}
          strokeLinejoin="round"
        />
      )}
      <polygon
        points={pts}
        fill={LAWN_GREEN}
        stroke={LAWN_STROKE}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Lawns18PEOption — choice renderer (CHOICE_RENDERERS['IKMC-22-PE-Q18'])
// ---------------------------------------------------------------------------

/**
 * Renders one A/B/C/D/E lawn choice as an SVG polygon.
 * Registered as CHOICE_RENDERERS['IKMC-22-PE-Q18'].
 */
export function Lawns18PEOption({ choice }: { choice: WmiChoice }) {
  const label = (choice?.label ?? '').trim().toUpperCase()
  if (!LAWN_POINTS[label]) return <span>{choice?.text}</span>

  return (
    <span
      role="img"
      aria-label={LAWN_ARIA[label]?.en ?? `Lawn ${label}`}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <LawnShape label={label} width={100} />
    </span>
  )
}
