// IKMC-20-EC-Q9 — Cindy's concentric-ring colouring puzzle (2020 Ecolier Q9).
//
// "Cindy colours each region on the pattern either red, blue or yellow.
//  Regions that touch each other are coloured with different colours.
//  She colours the outer ring (region) of the pattern red.
//  How many regions does Cindy colour red?"
//
// SOURCE FIGURE (docs/reference/ocr-res/ikmc/contest/ecolier/2020.imgs/032.jpg):
// Five concentric circles on a white background — the outermost is the largest,
// innermost is an elliptical core. All rings are uncoloured in the problem.
// The figure is the PROBLEM only; the answer (3) is never shown here.
//
// ANSWER DERIVATION (anti-drift — bound to seed breakdown.quantities):
//   Ring 1 (outer):  red   (given)
//   Ring 2:          not red (blue or yellow — must differ from Ring 1)
//   Ring 3:          red   (must differ from Ring 2)
//   Ring 4:          not red
//   Ring 5 (inner):  red   (must differ from Ring 4)
//   → 3 red regions (rings 1, 3, 5) — answer C.
//
// Adapted from P25G1Q15Illustration's concentric-circle ring primitive.
// Co-exports ConcentricRings primitive for use by the explainer.
//
// SSR-safe: no window/document/random/Date. Pure render.

const INK = '#374151'       // ring stroke colour (dark gray)
const FILL_WHITE = '#FFFFFF' // uncoloured ring fill (problem state)
const FILL_RED = '#EF4444'   // ring 1/3/5 in explainer (revealed answer)
const FILL_NOT_RED = '#93C5FD' // ring 2/4 in explainer (blue)

// SVG layout
const CX = 110
const CY = 110
const VIEW_W = 220
const VIEW_H = 220

// Ring radii from outer to inner (5 rings, each 20 px apart)
export const RING_RADII = [96, 76, 56, 36, 18] as const

export type RingColour = 'white' | 'red' | 'not-red'

const FILL_MAP: Record<RingColour, string> = {
  white: FILL_WHITE,
  red: FILL_RED,
  'not-red': FILL_NOT_RED,
}

export interface ConcentricRingsProps {
  /**
   * Colour for each ring [outer→inner].
   * Default: all 'white' (the static problem state).
   * Use 'red' / 'not-red' to reveal the solution beat-by-beat in the explainer.
   */
  colours?: readonly RingColour[]
}

/**
 * Five concentric circles primitive — reused by both the illustration and the
 * explainer. Renders rings outer-first (largest circle drawn first, each inner
 * ring paints over it). With default colours = all white it matches the source
 * problem figure exactly.
 */
export function ConcentricRings({ colours = ['white', 'white', 'white', 'white', 'white'] }: ConcentricRingsProps) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 240, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill={FILL_WHITE} />
      {RING_RADII.map((r, i) => (
        <circle
          key={i}
          cx={CX}
          cy={CY}
          r={r}
          fill={FILL_MAP[colours[i] ?? 'white']}
          stroke={INK}
          strokeWidth={2.5}
        />
      ))}
    </svg>
  )
}

/** Default export — the bare uncoloured rings (the static question figure). */
export default function Rings9ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Pola dengan lima cincin konsentris yang belum diwarnai. Cindy akan mewarnai masing-masing daerah dengan warna merah, biru, atau kuning sehingga daerah yang bersentuhan memiliki warna berbeda. Cincin terluar diwarnai merah."
    >
      <ConcentricRings />
    </div>
  )
}
