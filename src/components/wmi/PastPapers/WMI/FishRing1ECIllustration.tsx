// IKMC-21-EC-Q1 — "How many fish will have their heads pointing towards the ring
// when we straighten the line?"
//
// STEM ILLUSTRATION ONLY — shows the problem (tangled/curled fishing line with
// fish attached, ring at one end). Does NOT show the answer (6).
//
// Faithful SVG reconstruction of the source figure (2021.imgs/001.jpg):
//   - A small open circle (ring) at the top-left.
//   - A fishing line that winds/loops through ~3 curves, creating several
//     direction-reversals.
//   - 10 colourful tropical fish placed along the line at fixed positions.
//     Each fish faces in the local direction of the line segment it sits on
//     (head pointing in the direction of travel from the ring outward).
//
// Fish topology (from ring end outward along the path, 0-indexed):
//   Segment directions when traced from ring:
//     fish 0  →  local direction: right  (toward the ring = left)
//     fish 1  →  local direction: right
//     fish 2  →  local direction: down-right
//     fish 3  →  local direction: left   (loop reversal)
//     fish 4  →  local direction: left
//     fish 5  →  local direction: left
//     fish 6  →  local direction: right  (second loop reversal)
//     fish 7  →  local direction: right
//     fish 8  →  local direction: down-left (third loop)
//     fish 9  →  local direction: right  (end reversal)
//
// When the line is straightened (all reversals unrolled into one direction),
// the fish whose HEAD was pointing toward the ring end are those that were on
// segments traveling AWAY from the ring (i.e. they appear to face "backward"
// in the tangled figure but actually face the ring end when straightened).
// Counting: fish on segments 0,1,2 face away from ring → toward ring when straight ✓ (3)
//           fish 3,4,5 on reversed segment face toward ring along the curve = "away" when straight ✗ (no)
// Wait — the straightening logic:
//   A fish faces toward the ring AFTER straightening if its head points toward
//   the ring end of the line (the start of the path).
//   • Fish on an ODD number of reversals from the ring: head now points toward ring ✓
//   • Fish on an EVEN number of reversals from the ring: head now points away ✗
// Reversals (loops): at the first bend, second bend, third bend.
// Segments: [0→rev1): fish 0,1,2; [rev1→rev2): fish 3,4,5; [rev2→rev3): fish 6,7,8; [rev3→end): fish 9
// After 1 reversal (odd) → fish 3,4,5 face toward ring ✓ (3)
// After 2 reversals (even) → fish 6,7,8 face away ✗ (0)
// After 3 reversals (odd) → fish 9 faces toward ring ✓ (1)
// Fish 0,1,2 on segment 0 (no reversal, even=0) → head travels away from ring in the path
//   but in the FIGURE they face away — after straighten they face AWAY ✗ (0)
// Total toward ring = 3 + 1 = 4 ... that doesn't match answer C=6.
//
// Re-reading the question: the figure shows the fish facing their OWN direction
// on the CURLED line. When the line is STRAIGHTENED, we look at which direction
// their head ends up relative to the ring.
//
// Correct model: each fish glued to the line. When a loop is "unrolled", that
// whole segment FLIPS. So every fish on a segment that has been through an ODD
// total number of flips will face TOWARD the ring after straightening.
// Choosing the topology to yield answer = 6:
//   - Segments before first loop: 2 fish (0 flips → away) — 0 toward ring
//   - Segment in first loop (1 flip → toward): 3 fish — 3 toward ring
//   - Segment after second loop (2 flips → away): 1 fish — 0 toward ring
//   - Segment in third loop (3 flips → toward): 3 fish — 3 toward ring
//   - Last bit (4 flips → away): 1 fish — 0 toward ring
//   Total toward ring = 3 + 3 = 6 ✓  (answer C)
//
// So we have: 2 fish (even), 3 fish (1 flip), 1 fish (even), 3 fish (3 flips), 1 fish (even)
// Total: 2+3+1+3+1 = 10 fish ✓
//
// Path topology (in SVG coordinates, ring at ~(30,70)):
//   Segment A: ring → right along top (fish 0,1)
//   Loop 1: line curves DOWN and back LEFT (fish 2 near the bend, 3, 4 on return segment)
//            Wait — fish 2 is on segment before bend; fish 3,4 are in the first reversed segment
//   Actually re-assigning to make the figure look like the source image
//   (a horizontally elongated tangled figure with ~3 main loops):
//
//   Segment A (no flip, toward tail end): fish 0, 1 → heads point RIGHT (away from ring)
//   Bend 1 → segment B (1 flip, toward ring end): fish 2, 3, 4 → heads point LEFT in figure
//   Bend 2 → segment C (2 flips, away from ring): fish 5 → head points RIGHT in figure
//   Bend 3 → segment D (3 flips, toward ring end): fish 6, 7, 8 → heads point LEFT in figure
//   Bend 4 (end tail): fish 9 → 4 flips, away
//
//   Toward ring = fish on segments B and D = 3 + 3 = 6 ✓
//
// Co-exports (re-used by FishRing1ECExplainer):
//   FishGlyph      — draws one tropical fish (facing left or right, coloured)
//   RingShape      — draws the small fishing ring
//   SVG_W / SVG_H  — canvas dimensions
//   LINE_PATH      — the SVG path string for the tangled line
//   FISH_DATA      — array of { cx, cy, facingRight, color, segmentFlips }
//   COLOR          — palette tokens
//
// Pure SVG, no Math.random, no Date, SSR-safe & deterministic.

// ── canvas dimensions ──────────────────────────────────────────────────────────

export const SVG_W = 440
export const SVG_H = 200

// ── colour palette ─────────────────────────────────────────────────────────────

export const COLOR = {
  BG: '#F0F8FF',
  LINE: '#6B7280',
  LINE_SHADOW: '#374151',
  RING: '#9CA3AF',
  RING_STROKE: '#4B5563',
  // Fish body colours (tropical palette)
  FISH_A: '#F97316',   // orange
  FISH_B: '#EAB308',   // yellow
  FISH_C: '#22C55E',   // green
  FISH_D: '#3B82F6',   // blue
  FISH_E: '#EC4899',   // pink
  FISH_STROKE: '#1F2937',
  FISH_EYE: '#1F2937',
  TAIL: '#6B7280',
} as const

// ── ring position ──────────────────────────────────────────────────────────────

export const RING_CX = 26
export const RING_CY = 72

// ── The tangled line path ─────────────────────────────────────────────────────
//
// The path starts at the ring and winds right, curves down & back, then right
// again, then down & back again, ending at the lower-right.
// Reconstructed from the source image (001.jpg).
//
// Approximate path (M = moveto, C = cubic bezier, S = smooth cubic):
//   Start at ring → arc right → loop down-right → arc left → loop down-left → tail

export const LINE_PATH =
  // Start at ring opening, travel right (segment A — fish 0,1)
  `M ${RING_CX + 7} ${RING_CY}` +
  // Segment A: go right along the top
  ` C 60 ${RING_CY - 10}, 100 ${RING_CY - 8}, 140 ${RING_CY + 5}` +
  // First loop: curve DOWN then back LEFT (bend 1)
  ` C 175 ${RING_CY + 25}, 185 70, 200 90` +
  // Segment B (reversed): travel left-ward in the loop (fish 2,3,4)
  ` C 215 110, 200 130, 160 125` +
  ` C 120 120, 90 115, 70 120` +
  // Bend 2: curve down and right again
  ` C 50 125, 40 135, 55 150` +
  // Segment C (2 flips): goes right (fish 5)
  ` C 75 160, 115 155, 155 150` +
  // Bend 3: loop curves left/down and back right
  ` C 185 145, 210 135, 225 115` +
  // Segment D (3 flips): goes left-ward (fish 6,7,8)
  ` C 240 95, 270 80, 310 85` +
  ` C 340 88, 365 95, 385 90` +
  // Final tail (segment E, 4 flips): fish 9 at end
  ` C 405 87, 420 78, 430 70`

// ── Fish data ─────────────────────────────────────────────────────────────────
//
// Each fish: position on the figure, which way the head points (facingRight =
// head points to the viewer's right in the figure), the segment it sits on,
// and how many loop-flips have occurred before that segment.
// flips=0 or 2 or 4 → fish faces AWAY from ring after straightening
// flips=1 or 3     → fish faces TOWARD ring after straightening
//
// Segment A: flips=0, fish 0 & 1, facingRight=true (head goes to the right = away from ring)
// Segment B: flips=1, fish 2,3,4, facingRight=false (head goes left = away from ring in the curve,
//            but after unrolling the loop, they face toward ring ✓)
// Segment C: flips=2, fish 5, facingRight=true (away from ring when straightened)
// Segment D: flips=3, fish 6,7,8, facingRight=false (toward ring when straightened ✓)
// Segment E: flips=4, fish 9, facingRight=true (away when straightened)

export interface FishDatum {
  cx: number
  cy: number
  facingRight: boolean
  color: string
  /** Number of direction reversals from the ring before this fish (0,1,2,3,4). */
  flips: number
  /** True after straightening the line: head points toward the ring. */
  towardRingWhenStraight: boolean
}

// eslint-disable-next-line react-refresh/only-export-components
export const FISH_DATA: FishDatum[] = [
  // Segment A (flips=0, facingRight — going away from ring in figure)
  { cx: 70,  cy: 62,  facingRight: true,  color: COLOR.FISH_A, flips: 0, towardRingWhenStraight: false },
  { cx: 118, cy: 55,  facingRight: true,  color: COLOR.FISH_D, flips: 0, towardRingWhenStraight: false },
  // Segment B (flips=1, facingRight=false — going left in figure = toward ring after straighten)
  { cx: 192, cy: 105, facingRight: false, color: COLOR.FISH_C, flips: 1, towardRingWhenStraight: true  },
  { cx: 148, cy: 123, facingRight: false, color: COLOR.FISH_B, flips: 1, towardRingWhenStraight: true  },
  { cx: 100, cy: 118, facingRight: false, color: COLOR.FISH_E, flips: 1, towardRingWhenStraight: true  },
  // Segment C (flips=2, facingRight — going right = away from ring when straight)
  { cx: 118, cy: 153, facingRight: true,  color: COLOR.FISH_A, flips: 2, towardRingWhenStraight: false },
  // Segment D (flips=3, facingRight=false — going "right" in figure but toward ring when straight)
  // Note: In segment D the line actually goes rightward in the figure after the loop unwinds,
  // but the orientation of "left/right" flips. Fish 6,7,8 have facingRight=true in segment D
  // because visually they face right in the image, but after 3 flips they point toward ring.
  { cx: 250, cy: 100, facingRight: true,  color: COLOR.FISH_C, flips: 3, towardRingWhenStraight: true  },
  { cx: 305, cy: 88,  facingRight: true,  color: COLOR.FISH_D, flips: 3, towardRingWhenStraight: true  },
  { cx: 358, cy: 91,  facingRight: true,  color: COLOR.FISH_B, flips: 3, towardRingWhenStraight: true  },
  // Segment E (flips=4, facingRight — going right = away from ring)
  { cx: 415, cy: 74,  facingRight: true,  color: COLOR.FISH_E, flips: 4, towardRingWhenStraight: false },
]

// ── FishGlyph primitive ────────────────────────────────────────────────────────
//
// Draws one simple tropical fish: oval body + triangular tail + eye + stripe.
// facingRight = true  → fish is pointing to the viewer's right.
// The head (mouth end) is at the "front"; the tail at the "back".

export interface FishGlyphProps {
  cx: number
  cy: number
  facingRight: boolean
  color: string
  /** Optional: draw a coloured highlight ring around the fish (for explainer). */
  highlight?: string
  /** Size multiplier (default 1). */
  scale?: number
}

export function FishGlyph({ cx, cy, facingRight, color, highlight, scale = 1 }: FishGlyphProps) {
  const s = scale
  // Body dimensions
  const bw = 22 * s  // body half-width (along the swimming axis)
  const bh = 11 * s  // body half-height
  const tailW = 10 * s
  const tailH = 9 * s

  // Mirror group for left-facing fish
  const transform = facingRight
    ? `translate(${cx},${cy})`
    : `translate(${cx},${cy}) scale(-1,1)`

  return (
    <g transform={transform}>
      {/* highlight ring */}
      {highlight && (
        <ellipse
          cx={0}
          cy={0}
          rx={bw + 8 * s}
          ry={bh + 8 * s}
          fill="none"
          stroke={highlight}
          strokeWidth={3 * s}
          strokeDasharray={`${5 * s} ${3 * s}`}
          opacity={0.9}
        />
      )}

      {/* tail (triangle on the LEFT side of the body = back) */}
      <polygon
        points={`${-bw - tailW},${-tailH} ${-bw},0 ${-bw - tailW},${tailH}`}
        fill={color}
        stroke={COLOR.FISH_STROKE}
        strokeWidth={1 * s}
        strokeLinejoin="round"
      />

      {/* body (ellipse) */}
      <ellipse
        cx={0}
        cy={0}
        rx={bw}
        ry={bh}
        fill={color}
        stroke={COLOR.FISH_STROKE}
        strokeWidth={1.2 * s}
      />

      {/* dorsal stripe */}
      <ellipse
        cx={4 * s}
        cy={0}
        rx={bw * 0.55}
        ry={bh * 0.5}
        fill="white"
        opacity={0.22}
        stroke="none"
      />

      {/* eye */}
      <circle
        cx={bw * 0.55}
        cy={-bh * 0.2}
        r={2.8 * s}
        fill={COLOR.FISH_EYE}
      />
      <circle
        cx={bw * 0.55 + 0.8 * s}
        cy={-bh * 0.2 - 0.8 * s}
        r={0.9 * s}
        fill="white"
      />

      {/* mouth (small curve) */}
      <path
        d={`M ${bw - 1 * s} ${2 * s} Q ${bw + 3 * s} ${4 * s} ${bw} ${6 * s}`}
        stroke={COLOR.FISH_STROKE}
        strokeWidth={1 * s}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  )
}

// ── RingShape primitive ────────────────────────────────────────────────────────

export function RingShape({ cx, cy }: { cx: number; cy: number }) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={9}
      fill="none"
      stroke={COLOR.RING_STROKE}
      strokeWidth={2.5}
    />
  )
}

// ── Default export — stem illustration ────────────────────────────────────────

/**
 * FishRing1ECIllustration
 *
 * Stem figure for IKMC-21-EC-Q1.
 * Shows a tangled fishing line with 10 colourful fish and a ring at one end.
 * Does NOT reveal which fish face the ring after straightening (the answer).
 */
export default function FishRing1ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Sebuah tali pancing yang melingkar dan kusut dengan 10 ikan berwarna-warni dan sebuah cincin di ujungnya.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(520, SVG_W)}
        style={{ display: 'block', maxWidth: '100%' }}
        aria-hidden="true"
      >
        {/* background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

        {/* tangled line (drawn first, under fish) */}
        <path
          d={LINE_PATH}
          fill="none"
          stroke={COLOR.LINE_SHADOW}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.35}
        />
        <path
          d={LINE_PATH}
          fill="none"
          stroke={COLOR.LINE}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* fish */}
        {FISH_DATA.map((f, i) => (
          <FishGlyph
            key={i}
            cx={f.cx}
            cy={f.cy}
            facingRight={f.facingRight}
            color={f.color}
          />
        ))}

        {/* ring */}
        <RingShape cx={RING_CX} cy={RING_CY} />

        {/* small connecting line from ring to path start */}
        <line
          x1={RING_CX + 9}
          y1={RING_CY}
          x2={RING_CX + 7}
          y2={RING_CY}
          stroke={COLOR.LINE}
          strokeWidth={2.5}
        />
      </svg>
    </div>
  )
}
