// IKMC-22-PE-Q13 — "Which option shows the view from above this stack of discs?"
//
// STEM: side-view of a stepped disc stack (6 circular discs in decreasing size
// stacked on top of each other). The question asks the student to imagine the
// top-down view. Answer: A.
//
// Disc layers from BOTTOM (largest) to TOP (smallest):
//   1. Orange  (largest, r = R1)
//   2. Blue    (r = R2)
//   3. Cream   (r = R3)
//   4. Blue    (r = R4)
//   5. Orange  (r = R5)
//   6. Blue    (r = R6, tiny top)
//
// Side-view: drawn as stacked horizontal rectangular slabs centred on a
// vertical axis — each slab wider at the bottom, creating a stepped pyramid.
//
// Co-exports:
//   Discs13PEOption — renders ONE top-view choice (A–E) for CHOICE_RENDERERS.
//
// Pure SVG, SSR-safe, no random, no Date.

import type { WmiChoice } from '../../../../types/wmi'

// ── Colour palette (faithful to source images) ──────────────────────────────

const COL_ORANGE = '#E07030'   // warm orange
const COL_BLUE   = '#2060A0'   // mid blue
const COL_CREAM  = '#F0DFA0'   // cream / yellow-white
const INK        = '#1F2937'   // dark outline

// ── DiscStackPrimitive — SVG content for the side-view stem ─────────────────
//
// Each disc appears as a horizontal slab. The slab width = 2 × radius.
// Slab height = 12 px (thick enough to read). Total height ~78 px.
//
// Disc sizes (half-widths in SVG units):
const R = [56, 46, 37, 28, 19, 10] as const   // bottom → top half-widths
const SLAB_H = 12        // height of each slab (+ gap)
const GAP     = 1        // gap between slabs
const CX_STEM = 70       // horizontal centre of the stem SVG
const TOP_Y   = 6        // Y of topmost slab's top edge

// Colours bottom → top
const DISC_COLORS: string[] = [COL_ORANGE, COL_BLUE, COL_CREAM, COL_BLUE, COL_ORANGE, COL_BLUE]

function slabY(index: number): number {
  // index 0 = top slab, 5 = bottom slab (bottom disc is index 5 in reversed order)
  // We render top-to-bottom so index 0 = top disc (r=R[5]), index 5 = bottom disc (r=R[0])
  return TOP_Y + index * (SLAB_H + GAP)
}

/** Side-view disc stack — reusable in both illustration and explainer. */
export function DiscStackPrimitive() {
  // Render top disc first (smallest) down to bottom disc (largest)
  const slabs = DISC_COLORS.slice().reverse().map((color, i) => {
    const halfW = R[5 - i]  // R[5] = 10 for top, R[0] = 56 for bottom
    const y = slabY(i)
    const x = CX_STEM - halfW
    return (
      <g key={i}>
        <rect
          x={x}
          y={y}
          width={halfW * 2}
          height={SLAB_H}
          rx={SLAB_H / 2}
          fill={color}
          stroke={INK}
          strokeWidth={1.2}
        />
      </g>
    )
  })

  return <g>{slabs}</g>
}

// SVG canvas dimensions for the stem
export const STEM_W = 140
export const STEM_H = TOP_Y + 6 * (SLAB_H + GAP) + 4  // ≈ 86

// ── Default export: stem illustration ───────────────────────────────────────

/**
 * Discs13PEIllustration — problem-only side-view of the stacked discs.
 * Does NOT reveal the answer (top-view is the question).
 */
export default function Discs13PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Side view of a stack of six coloured discs (from bottom to top: orange, ' +
        'blue, cream, blue, orange, blue) — each disc smaller than the one below. ' +
        'Which of the options shows the view from directly above?'
      }
    >
      <svg
        viewBox={`0 0 ${STEM_W} ${STEM_H}`}
        width={STEM_W}
        height={STEM_H}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <rect x={0} y={0} width={STEM_W} height={STEM_H} fill="white" />
        <DiscStackPrimitive />
      </svg>
    </div>
  )
}

// ── Top-view option renderer ─────────────────────────────────────────────────
//
// Each option is a set of concentric circles. The five options A–E differ in
// the colour order of the rings, reconstructed faithfully from the source images:
//
//   A (answer) — outer→center: orange, blue, cream, blue, orange, blue (6 rings)
//   B          — outer→center: orange, blue, orange (3 rings, smaller figure)
//   C          — outer→center: cream, orange, blue, cream (4 rings, no orange outer)
//   D          — outer→center: cream, blue, cream, blue (4 rings, all cool/warm neutral)
//   E          — outer→center: orange, blue, cream, orange (4 rings)
//
// Source: 2022.imgs/036.jpg (A, C, E) and 2022.imgs/037.jpg (B, D)

const OPT_CX = 50         // centre X
const OPT_CY = 50         // centre Y
const OPT_VB = 100        // viewBox side

// Rings for each option: [outerRadius, color] pairs, from outside in.
// The innermost entry covers the center.
const OPTION_RINGS: Record<string, Array<{ r: number; fill: string }>> = {
  // A: 6 discs visible — outer orange ring, blue, cream, blue, orange, blue center
  A: [
    { r: 42, fill: COL_ORANGE },
    { r: 34, fill: COL_BLUE   },
    { r: 26, fill: COL_CREAM  },
    { r: 18, fill: COL_BLUE   },
    { r: 10, fill: COL_ORANGE },
    { r:  4, fill: COL_BLUE   },
  ],
  // B: 3 rings — outer orange, blue, tiny orange center (smaller stack visible)
  B: [
    { r: 38, fill: COL_ORANGE },
    { r: 26, fill: COL_BLUE   },
    { r:  8, fill: COL_ORANGE },
  ],
  // C: 4 rings — outer cream, orange, blue, cream center
  C: [
    { r: 40, fill: COL_CREAM  },
    { r: 30, fill: COL_ORANGE },
    { r: 20, fill: COL_BLUE   },
    { r:  8, fill: COL_CREAM  },
  ],
  // D: 4 rings — outer cream, blue, cream, blue center (no orange)
  D: [
    { r: 40, fill: COL_CREAM  },
    { r: 30, fill: COL_BLUE   },
    { r: 20, fill: COL_CREAM  },
    { r:  8, fill: COL_BLUE   },
  ],
  // E: 4 rings — outer orange, blue, cream, orange center
  E: [
    { r: 40, fill: COL_ORANGE },
    { r: 30, fill: COL_BLUE   },
    { r: 20, fill: COL_CREAM  },
    { r:  8, fill: COL_ORANGE },
  ],
}

const OPTION_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Option A: top-down view with six concentric rings — outer orange, blue, cream, blue, orange, blue center.',
    id: 'Pilihan A: tampak dari atas dengan enam lingkaran — luar oranye, biru, krem, biru, oranye, biru di tengah.',
  },
  B: {
    en: 'Option B: top-down view with three concentric rings — outer orange, blue, orange center.',
    id: 'Pilihan B: tampak dari atas dengan tiga lingkaran — luar oranye, biru, oranye di tengah.',
  },
  C: {
    en: 'Option C: top-down view with four concentric rings — outer cream, orange, blue, cream center.',
    id: 'Pilihan C: tampak dari atas dengan empat lingkaran — luar krem, oranye, biru, krem di tengah.',
  },
  D: {
    en: 'Option D: top-down view with four concentric rings — outer cream, blue, cream, blue center.',
    id: 'Pilihan D: tampak dari atas dengan empat lingkaran — luar krem, biru, krem, biru di tengah.',
  },
  E: {
    en: 'Option E: top-down view with four concentric rings — outer orange, blue, cream, orange center.',
    id: 'Pilihan E: tampak dari atas dengan empat lingkaran — luar oranye, biru, krem, oranye di tengah.',
  },
}

/**
 * Discs13PEOption — renders ONE top-view choice (A–E) for IKMC-22-PE-Q13.
 * Registered in CHOICE_RENDERERS.
 */
export function Discs13PEOption({ choice }: { choice: WmiChoice }) {
  const label = choice.label as string
  const rings = OPTION_RINGS[label]
  const aria = OPTION_ARIA[label]

  if (!rings) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <svg
        viewBox={`0 0 ${OPT_VB} ${OPT_VB}`}
        width={OPT_VB}
        height={OPT_VB}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <rect x={0} y={0} width={OPT_VB} height={OPT_VB} fill="white" />
        {/* Render from largest (outermost) to smallest (center) */}
        {rings.map(({ r, fill }, i) => (
          <circle
            key={i}
            cx={OPT_CX}
            cy={OPT_CY}
            r={r}
            fill={fill}
            stroke={INK}
            strokeWidth={1.2}
          />
        ))}
      </svg>
    </span>
  )
}
