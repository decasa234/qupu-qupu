// HexRings21B22 — SEAMO 2021 Paper B Q22
// "The figure shows a number pattern within an array of hexagons.
//  In the middle, there is only one dot. There are 6 dots on the 1st hexagon.
//  There are 12 and 18 dots on the 2nd and 3rd hexagons, respectively.
//  How many dots are there in the 49th hexagon?"
//
// Answer: ring n has 6n dots → 49th hexagon = 6 × 49 = 294 dots.
//
// Figure (008.jpg): concentric hexagonal rings drawn with dots on vertices + equally
// spaced intermediate dots on each side. Ring n has n−1 intermediate dots per side,
// so n+1 dots per side and 6×n total.  The centre is a single dot.
//
// Classification: STEM illustration (fill-in answer = 294)
//
// Pure SVG, SSR-safe — no hooks, no framer-motion, no window/document.

// ── Colour tokens ─────────────────────────────────────────────────────────────

const DOT_FILL   = '#1F2937'   // gray-900 — matches the original black dots
const DOT_STROKE = '#1F2937'
const LINE_COL   = '#1F2937'   // hex outline strokes
const BG         = '#FFFFFF'   // white background (original figure is on white)
const LABEL_COL  = '#1F2937'   // gray-900 for labels
const HI_COL     = '#2563EB'   // blue-600 for explainer highlights
const HI_FILL    = '#EFF6FF'   // blue-50

// ── Geometry ──────────────────────────────────────────────────────────────────
//
// Pointy-top hexagon (vertices at top/bottom, flat sides on left/right).
// Ring n has circumradius RING_STEP * n (distance from centre to vertex).
//
// For a regular hexagon with circumradius R (pointy-top), vertices at angles:
//   θ_k = 90° + k × 60°   for k = 0..5  (0° = right, measured CCW in math, CW in SVG)
// In SVG (y increases downward):
//   vertex k: (cx + R × cos(−θ_k), cy + R × sin(−θ_k))
//
// Dot positions on ring n:
//   - 6 vertex dots
//   - For each of the 6 sides, n−1 equally-spaced interior dots
//   Total: 6 + 6×(n−1) = 6n ✓

const CX         = 0      // local centre (we'll translate each ring via <g transform>)
const CY         = 0
const RING_STEP  = 44     // px between rings (R₁=44, R₂=88, R₃=132)
const DOT_R      = 4.5    // dot radius
const CENTRE_DOT_R = 5    // slightly larger for the centre dot (makes it visible)
const LINE_W     = 1.8    // hexagon stroke width
const SVG_PAD    = 22     // outer padding
const N_RINGS    = 3      // we draw rings 1, 2, 3

const MAX_R      = RING_STEP * N_RINGS
const SVG_SIZE   = 2 * MAX_R + 2 * SVG_PAD   // square viewport

// Angle offsets: pointy-top hexagon, first vertex at top
const VERTEX_ANGLES = Array.from({ length: 6 }, (_, k) => (Math.PI / 2 + k * Math.PI / 3))

/** All dot positions on ring n (centre excluded). Returns [{px, py}] */
function ringDots(n: number, R: number): { px: number; py: number }[] {
  const pts: { px: number; py: number }[] = []
  for (let side = 0; side < 6; side++) {
    const a0 = VERTEX_ANGLES[side]
    const a1 = VERTEX_ANGLES[(side + 1) % 6]
    const x0 = Math.cos(a0) * R
    const y0 = -Math.sin(a0) * R   // negate: SVG y-axis is down
    const x1 = Math.cos(a1) * R
    const y1 = -Math.sin(a1) * R
    // n+1 dots per side (including endpoints): index 0..n
    // Include vertex at a0 but NOT a1 (a1 is the start vertex of the next side)
    for (let t = 0; t < n; t++) {
      const frac = t / n
      pts.push({
        px: x0 + (x1 - x0) * frac,
        py: y0 + (y1 - y0) * frac,
      })
    }
  }
  return pts  // 6n dots total
}

/** SVG polygon points string for ring n */
function hexPath(R: number): string {
  return VERTEX_ANGLES
    .map((a) => {
      const x = CX + Math.cos(a) * R
      const y = CY - Math.sin(a) * R
      return `${x.toFixed(3)},${y.toFixed(3)}`
    })
    .join(' ')
}

// ── Shared hex ring renderer ──────────────────────────────────────────────────

interface HexRingLayerProps {
  n: number
  R: number
  highlighted?: boolean
}

function HexRingLayer({ n, R, highlighted }: HexRingLayerProps) {
  const dots = ringDots(n, R)
  const dotFill = highlighted ? HI_COL : DOT_FILL
  const lineCol  = highlighted ? HI_COL : LINE_COL
  return (
    <g>
      <polygon
        points={hexPath(R)}
        fill="none"
        stroke={lineCol}
        strokeWidth={LINE_W}
        strokeLinejoin="round"
      />
      {dots.map(({ px, py }, i) => (
        <circle
          key={`rn${n}-d${i}`}
          cx={px}
          cy={py}
          r={DOT_R}
          fill={dotFill}
        />
      ))}
    </g>
  )
}

// ── Figure (reusable by explainer) ───────────────────────────────────────────

export interface HexRings21B22FigureProps {
  /** 1-indexed ring to highlight (null = none, 0 = highlight the centre dot only) */
  highlightRing?: number | null
  /** Show dot count labels beside each ring */
  showCounts?: boolean
  /** Maximum ring to draw (1–3, default 3) */
  maxRing?: number
}

export function HexRings21B22Figure({
  highlightRing = null,
  showCounts = false,
  maxRing = N_RINGS,
}: HexRings21B22FigureProps) {
  const rings = Array.from({ length: Math.min(maxRing, N_RINGS) }, (_, i) => i + 1)
  const effectiveSize = 2 * RING_STEP * Math.min(maxRing, N_RINGS) + 2 * SVG_PAD
  const cx = effectiveSize / 2
  const cy = effectiveSize / 2

  return (
    <svg
      viewBox={`0 0 ${effectiveSize} ${effectiveSize}`}
      width="100%"
      style={{ maxWidth: effectiveSize, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <rect width={effectiveSize} height={effectiveSize} fill={BG} />

      <g transform={`translate(${cx}, ${cy})`}>
        {/* Centre dot */}
        <circle
          cx={0}
          cy={0}
          r={CENTRE_DOT_R}
          fill={highlightRing === 0 ? HI_COL : DOT_FILL}
          stroke={highlightRing === 0 ? HI_COL : DOT_STROKE}
          strokeWidth={1}
        />

        {/* Rings drawn outer→inner so inner labels/dots sit on top */}
        {[...rings].reverse().map((n) => (
          <HexRingLayer
            key={`ring-${n}`}
            n={n}
            R={RING_STEP * n}
            highlighted={highlightRing === n}
          />
        ))}
      </g>

      {/* Optional dot-count labels (bottom-right of each ring) */}
      {showCounts && rings.map((n) => {
        const R = RING_STEP * n
        // Place label just past the bottom-right vertex of the ring
        const labelX = cx + Math.cos(-Math.PI / 6) * (R + 8) + 2
        const labelY = cy + Math.sin(-Math.PI / 6) * (R + 8) + 14
        return (
          <text
            key={`lbl-${n}`}
            x={labelX}
            y={labelY}
            fontSize={11}
            fontWeight={700}
            fill={highlightRing === n ? HI_COL : LABEL_COL}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            textAnchor="middle"
          >
            ={6 * n}
          </text>
        )
      })}
    </svg>
  )
}

// ── Explainer ─────────────────────────────────────────────────────────────────

export function HexRings21B22Explainer() {
  // Static multi-panel explainer — no hooks, SSR-safe.
  //
  // Panel layout (left→right, wrapped in flex):
  //   Panel 0: centre (1 dot)
  //   Panel 1: ring 1 (6 dots) highlighted
  //   Panel 2: rings 1–2 with ring 2 highlighted
  //   Panel 3: rings 1–3 with ring 3 highlighted
  //   Then formula line + answer

  const PANEL_W = 180
  const PANEL_H = 180
  const TOTAL_W = PANEL_W * 4

  // Local coords for 3-ring figure centred in 180×180
  const cx = PANEL_W / 2
  const cy = PANEL_H / 2

  // Scale to fit inside panel: 3 rings at RING_STEP=44 → max R=132, need 132+22 pad = 154px each side
  // Use a uniform scale factor
  const SCALE = (PANEL_W / 2 - 8) / (RING_STEP * N_RINGS)

  function scaledHexPath(n: number) {
    const R = RING_STEP * n * SCALE
    return VERTEX_ANGLES
      .map((a) => {
        const x = cx + Math.cos(a) * R
        const y = cy - Math.sin(a) * R
        return `${x.toFixed(2)},${y.toFixed(2)}`
      })
      .join(' ')
  }

  function scaledDots(n: number) {
    const R = RING_STEP * n * SCALE
    return ringDots(n, R).map(({ px, py }) => ({ px: cx + px, py: cy + py }))
  }

  const panels = [
    { label: 'Tengah', dotCount: 1, highlightRing: 0, maxRings: 0 },
    { label: 'Segi enam 1', dotCount: 6, highlightRing: 1, maxRings: 1 },
    { label: 'Segi enam 2', dotCount: 12, highlightRing: 2, maxRings: 2 },
    { label: 'Segi enam 3', dotCount: 18, highlightRing: 3, maxRings: 3 },
  ]

  const FORMULA_Y = PANEL_H + 20
  const EXPL_H    = PANEL_H + 60

  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Pola segi enam konsentris dengan titik-titik. Tengah: 1 titik. ' +
        'Segi enam ke-1: 6 titik. Segi enam ke-2: 12 titik. Segi enam ke-3: 18 titik. ' +
        'Pola: segi enam ke-n memiliki 6n titik. Segi enam ke-49: 6 × 49 = 294 titik.'
      }
    >
      <svg
        viewBox={`0 0 ${TOTAL_W} ${EXPL_H}`}
        width="100%"
        style={{ maxWidth: TOTAL_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        <rect width={TOTAL_W} height={EXPL_H} fill={BG} />

        {panels.map(({ label, dotCount, highlightRing, maxRings }, pi) => {
          const offsetX = pi * PANEL_W

          // Background panel
          const isPanelHi = true
          void isPanelHi

          return (
            <g key={`panel-${pi}`} transform={`translate(${offsetX}, 0)`}>
              {/* Panel border */}
              <rect
                x={4}
                y={4}
                width={PANEL_W - 8}
                height={PANEL_H - 8}
                rx={6}
                fill={HI_FILL}
                stroke={HI_COL}
                strokeWidth={1.5}
              />

              {/* Centre dot (always shown) */}
              <circle
                cx={cx}
                cy={cy}
                r={highlightRing === 0 ? 5.5 * SCALE : 5 * SCALE}
                fill={highlightRing === 0 ? HI_COL : DOT_FILL}
              />

              {/* Rings 1..maxRings */}
              {Array.from({ length: maxRings }, (_, i) => i + 1).reverse().map((n) => {
                const isHi = n === highlightRing
                const R = RING_STEP * n * SCALE
                const pts = scaledDots(n)
                return (
                  <g key={`p${pi}-r${n}`}>
                    <polygon
                      points={scaledHexPath(n)}
                      fill="none"
                      stroke={isHi ? HI_COL : LINE_COL}
                      strokeWidth={isHi ? 2.5 : LINE_W}
                      strokeLinejoin="round"
                    />
                    {pts.map(({ px, py }, di) => (
                      <circle
                        key={`p${pi}-r${n}-d${di}`}
                        cx={px}
                        cy={py}
                        r={DOT_R * SCALE}
                        fill={isHi ? HI_COL : DOT_FILL}
                      />
                    ))}
                    {/* Highlight ring glow */}
                    {isHi && (
                      <polygon
                        points={scaledHexPath(n)}
                        fill="none"
                        stroke={HI_COL}
                        strokeWidth={4}
                        strokeOpacity={0.3}
                        strokeLinejoin="round"
                      />
                    )}
                    {/* Dot count badge on highlighted ring */}
                    {isHi && (
                      <text
                        x={cx}
                        y={cy - R - 8}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight={800}
                        fill={HI_COL}
                        fontFamily="ui-sans-serif, system-ui, sans-serif"
                      >
                        {dotCount} titik
                      </text>
                    )}
                  </g>
                )
              })}

              {/* Centre panel: just show "1 titik" label */}
              {highlightRing === 0 && (
                <text
                  x={cx}
                  y={cy - 14 * SCALE}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={800}
                  fill={HI_COL}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {dotCount} titik
                </text>
              )}

              {/* Panel label */}
              <text
                x={PANEL_W / 2}
                y={PANEL_H - 8}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fill={LABEL_COL}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {label}
              </text>
            </g>
          )
        })}

        {/* Pattern formula */}
        <text
          x={TOTAL_W / 2}
          y={FORMULA_Y}
          textAnchor="middle"
          fontSize={13}
          fontWeight={600}
          fill={LABEL_COL}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          Segi enam ke-n → 6n titik
        </text>

        {/* Final answer */}
        <text
          x={TOTAL_W / 2}
          y={FORMULA_Y + 24}
          textAnchor="middle"
          fontSize={14}
          fontWeight={800}
          fill={HI_COL}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          Segi enam ke-49 → 6 × 49 = 294 titik
        </text>
      </svg>
    </div>
  )
}

// ── Default export — static stem illustration ─────────────────────────────────

export default function HexRings21B22Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Pola segi enam konsentris. Di tengah terdapat satu titik. ' +
        'Segi enam ke-1 memiliki 6 titik di sudut-sudutnya. ' +
        'Segi enam ke-2 memiliki 12 titik (termasuk titik-titik di tengah setiap sisi). ' +
        'Segi enam ke-3 memiliki 18 titik.'
      }
    >
      <HexRings21B22Figure />
    </div>
  )
}

// ── Registry entry (paste into registry.ts — do NOT edit here) ────────────────
//
//   'SEAMO-21-B-Q22': {
//     illustration: () => import('./HexRings21B22'),
//     explainer:    () => import('./HexRings21B22').then(m => ({ default: m.HexRings21B22Explainer })),
//   },
