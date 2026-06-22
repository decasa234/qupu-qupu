/**
 * glyphs.tsx — Curated SVG glyph kit for WMI / IKMC illustration figures.
 *
 * Pure SVG render — no framer-motion, no React hooks, SSR-safe (no
 * window/document, no Math.random/Date.now).  Every glyph is authored on
 * a small integer coordinate system centred on (0, 0) and placed via
 * `translate(cx, cy) scale(s)`, matching the convention established in
 * Coin25G3Illustration (SeahorseGlyph, CrabGlyph) and Animals24ECIllustration.
 *
 * @exports Apple      – red apple with leaf/stem, `{ cx, cy, r?, color? }`
 * @exports Banana     – yellow curved banana, `{ cx, cy, r?, color? }`
 * @exports Star       – 5-point star, `{ cx, cy, r?, color? }`
 * @exports Coin       – gold coin disc with optional `label` text, `{ cx, cy, r?, color?, label? }`
 * @exports Candle     – cylindrical candle body with optional `lit` flame, `{ cx, cy, r?, color?, lit? }`
 * @exports Balloon    – oval balloon with knot/string, optional `points` badge, `{ cx, cy, r?, color?, points? }`
 * @exports Tree       – layered-triangle pine tree, `{ cx, cy, r?, color? }`
 * @exports House      – simple house (walls + roof), `{ cx, cy, r?, color? }`
 * @exports Arrow      – chevron arrow in any cardinal direction, `{ cx, cy, r?, color?, dir? }`
 * @exports Cherry     – pair of cherries on shared stem, `{ cx, cy, r?, color? }`
 *
 * When to use:
 *   Import individual glyphs into any Illustration/Explainer file instead of
 *   redrawing shapes from scratch; pass `cx`/`cy` to position each object
 *   inside the parent `<svg>` coordinate space.
 */

// ── Shared prop type ──────────────────────────────────────────────────────────

/** Common positioning + style props accepted by every glyph component. */
export interface GlyphProps {
  /** X centre in the parent SVG coordinate system. @default 0 */
  cx?: number
  /** Y centre in the parent SVG coordinate system. @default 0 */
  cy?: number
  /**
   * Governs the overall rendered radius / half-size.
   * Each glyph interprets this uniformly: a `16` r means roughly a 32×32 px
   * bounding box in SVG units. @default 16
   */
  r?: number
  /**
   * Primary fill colour.  Each glyph applies it to its dominant shape.
   * Accent / shadow / shine colours are derived from the house palette unless
   * overridden — keep the colour string as a CSS hex or named colour.
   */
  color?: string
}

// ── Apple ─────────────────────────────────────────────────────────────────────

/**
 * Apple — a single red (or custom-colour) apple with two-lobe body, stem and leaf.
 *
 * Matches the `Apple` primitive in AppleAdd19P1Illustration but adds a `color`
 * prop so the same shape can represent golden / green apple variants.
 */
export function Apple({ cx = 0, cy = 0, r = 16, color = '#E63946' }: GlyphProps) {
  const dark = darken(color, 0.25)
  const s = r / 12
  return (
    <g transform={`translate(${cx},${cy}) scale(${s})`}>
      {/* two lobes */}
      <circle cx={-5} cy={0} r={12} fill={color} />
      <circle cx={5} cy={0} r={12} fill={color} />
      <ellipse cx={0} cy={2.4} rx={12.6} ry={11} fill={color} />
      {/* shine */}
      <ellipse cx={-5} cy={-4.8} rx={2.6} ry={3.6} fill="#FFFFFF" opacity={0.55} />
      {/* base shading */}
      <path
        d="M -12 3.6 Q 0 15 12 3.6"
        fill="none"
        stroke={dark}
        strokeWidth={1.4}
        opacity={0.5}
      />
      {/* stem */}
      <rect x={-1.4} y={-15} width={2.8} height={6.6} rx={1.4} fill="#6B4226" />
      {/* leaf */}
      <ellipse
        cx={5.4}
        cy={-12.6}
        rx={4.8}
        ry={2.4}
        fill="#4CA14E"
        transform="rotate(-28 5.4 -12.6)"
      />
    </g>
  )
}

// ── Banana ────────────────────────────────────────────────────────────────────

/**
 * Banana — a curved yellow banana with ridgeline and tip marks.
 *
 * Authored on a ±14 unit grid; the curve is a cubic bézier arc.
 */
export function Banana({ cx = 0, cy = 0, r = 16, color = '#FFD23F' }: GlyphProps) {
  const dark = darken(color, 0.2)
  const s = r / 14
  return (
    <g transform={`translate(${cx},${cy}) scale(${s})`}>
      {/* outer (back) peel */}
      <path
        d="M -4 -14 C 16 -14 18 4 6 14 C -2 8 -10 0 -12 -8 C -14 -14 -8 -14 -4 -14 Z"
        fill={color}
        stroke={dark}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      {/* ridge line */}
      <path
        d="M -2 -12 C 10 -10 12 4 4 12"
        fill="none"
        stroke={dark}
        strokeWidth={1.8}
        strokeLinecap="round"
        opacity={0.55}
      />
      {/* tip nub at stem end */}
      <ellipse cx={-4} cy={-14} rx={3} ry={2} fill={dark} />
    </g>
  )
}

// ── Star ──────────────────────────────────────────────────────────────────────

/**
 * Star — a classic 5-point star rendered as a polygon.
 *
 * Outer tips at radius `r`, inner valleys at `r * 0.42`.
 */
export function Star({ cx = 0, cy = 0, r = 16, color = '#FBBF24' }: GlyphProps) {
  const dark = darken(color, 0.2)
  const pts = starPoints(0, 0, r, r * 0.42, 5, -Math.PI / 2)
  return (
    <g transform={`translate(${cx},${cy})`}>
      <polygon
        points={pts}
        fill={color}
        stroke={dark}
        strokeWidth={r * 0.07}
        strokeLinejoin="round"
      />
      {/* subtle inner shine */}
      <polygon
        points={starPoints(0, -r * 0.08, r * 0.5, r * 0.2, 5, -Math.PI / 2)}
        fill="#FFFFFF"
        opacity={0.25}
      />
    </g>
  )
}

// ── Coin ──────────────────────────────────────────────────────────────────────

/**
 * Coin — a gold disc with optional text label (e.g. a denomination or "1").
 *
 * Mirrors the CoinFace ring style from Coin25G3Illustration but uses a gold
 * palette and allows an arbitrary short text in the centre.
 */
export function Coin({
  cx = 0,
  cy = 0,
  r = 16,
  color = '#F59E0B',
  label,
}: GlyphProps & { label?: string }) {
  const dark = darken(color, 0.2)
  const fontSize = r * 0.7
  return (
    <g>
      {/* rim / outer ring */}
      <circle cx={cx} cy={cy} r={r} fill={dark} />
      {/* face */}
      <circle cx={cx} cy={cy} r={r * 0.86} fill={color} />
      {/* inner ring groove */}
      <circle cx={cx} cy={cy} r={r * 0.72} fill="none" stroke={dark} strokeWidth={r * 0.06} opacity={0.5} />
      {/* shine arc */}
      <ellipse
        cx={cx - r * 0.25}
        cy={cy - r * 0.28}
        rx={r * 0.2}
        ry={r * 0.12}
        fill="#FFFFFF"
        opacity={0.4}
        transform={`rotate(-35 ${cx - r * 0.25} ${cy - r * 0.28})`}
      />
      {/* optional label */}
      {label != null && (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight={900}
          fill={dark}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {label}
        </text>
      )}
    </g>
  )
}

// ── Candle ────────────────────────────────────────────────────────────────────

/**
 * Candle — a cylindrical wax candle body with wick and optional lit flame.
 *
 * `lit=true` adds a teardrop flame (amber/yellow), matching the flame style
 * in Candles1ECIllustration.  Body height is `r * 2.4`, width is `r`.
 */
export function Candle({
  cx = 0,
  cy = 0,
  r = 16,
  color = '#9CA3AF',
  lit = false,
}: GlyphProps & { lit?: boolean }) {
  const dark = darken(color, 0.18)
  const bw = r             // body width
  const bh = r * 2.4       // body height
  const bodyX = cx - bw / 2
  const bodyY = cy - bh / 2
  const wickH = r * 0.5
  const wickTopY = bodyY - wickH
  const flameCy = wickTopY - r * 0.55
  return (
    <g>
      {/* candle body */}
      <rect
        x={bodyX}
        y={bodyY}
        width={bw}
        height={bh}
        rx={bw * 0.22}
        fill={color}
        stroke={dark}
        strokeWidth={r * 0.1}
      />
      {/* drip streak */}
      <path
        d={`M ${cx - bw * 0.18} ${bodyY} q ${bw * 0.06} ${r * 0.5} 0 ${r * 0.9}`}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={r * 0.14}
        strokeLinecap="round"
        opacity={0.45}
      />
      {/* wick */}
      <line
        x1={cx}
        y1={bodyY}
        x2={cx}
        y2={wickTopY}
        stroke="#374151"
        strokeWidth={r * 0.12}
        strokeLinecap="round"
      />
      {/* flame */}
      {lit && (
        <g>
          <ellipse
            cx={cx}
            cy={flameCy}
            rx={r * 0.32}
            ry={r * 0.52}
            fill="#FCD34D"
            stroke="#F59E0B"
            strokeWidth={r * 0.08}
          />
          <ellipse
            cx={cx}
            cy={flameCy + r * 0.12}
            rx={r * 0.15}
            ry={r * 0.28}
            fill="#FEF3C7"
            opacity={0.75}
          />
        </g>
      )}
    </g>
  )
}

// ── Balloon ───────────────────────────────────────────────────────────────────

/**
 * Balloon — oval balloon with knot dot, hanging string, optional `points` badge.
 *
 * Extends the `BalloonShape` primitive from Balloons20ECIllustration; the
 * `points` prop draws a centred number label inside the balloon body.
 */
export function Balloon({
  cx = 0,
  cy = 0,
  r = 16,
  color = '#4A90D9',
  points,
}: GlyphProps & { points?: number | string }) {
  const rx = r
  const ry = r * 1.15
  const knotY = cy + ry + r * 0.22
  const strEnd = knotY + r * 1.4
  const dark = darken(color, 0.2)
  const pointStr = points != null ? String(points) : undefined
  const fontSize = pointStr && pointStr.length > 1 ? r * 0.75 : r * 0.88
  return (
    <g>
      {/* body */}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={color} />
      {/* shine */}
      <ellipse
        cx={cx - rx * 0.28}
        cy={cy - ry * 0.3}
        rx={rx * 0.35}
        ry={ry * 0.25}
        fill="rgba(255,255,255,0.35)"
      />
      {/* knot dot */}
      <circle cx={cx} cy={knotY} r={r * 0.25} fill={color} />
      {/* string */}
      <line
        x1={cx}
        y1={knotY + r * 0.25}
        x2={cx}
        y2={strEnd}
        stroke="#6B7280"
        strokeWidth={r * 0.09}
        strokeLinecap="round"
      />
      {/* optional label */}
      {pointStr != null && (
        <text
          x={cx}
          y={cy + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight={900}
          fill="#FFFFFF"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {pointStr}
        </text>
      )}
      {/* highlight ring (not shown by default; callers may stroke with opacity) */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={dark}
        strokeWidth={r * 0.07}
        opacity={0.5}
      />
    </g>
  )
}

// ── Tree ──────────────────────────────────────────────────────────────────────

/**
 * Tree — three layered triangular tiers over a brown trunk, evoking a pine/fir.
 *
 * Authored on a ±r coordinate system; tiers are stacked triangles with
 * slightly overlapping edges to create the classic Christmas-tree silhouette.
 */
export function Tree({ cx = 0, cy = 0, r = 16, color = '#16A34A' }: GlyphProps) {
  const dark = darken(color, 0.2)
  const tw = r * 2        // total width
  const th = r * 2.6      // total height of foliage
  const trunkH = r * 0.6
  const trunkW = r * 0.42

  // Three tiers from top to bottom; each is an isoceles triangle.
  const tiers = [
    { w: tw * 0.54, y: cy - th / 2 + th * 0.0, h: th * 0.48 },
    { w: tw * 0.78, y: cy - th / 2 + th * 0.33, h: th * 0.48 },
    { w: tw * 1.0,  y: cy - th / 2 + th * 0.57, h: th * 0.48 },
  ]

  const tierPts = (w: number, topY: number, h: number) =>
    `${cx},${topY} ${cx + w / 2},${topY + h} ${cx - w / 2},${topY + h}`

  return (
    <g>
      {/* trunk */}
      <rect
        x={cx - trunkW / 2}
        y={cy + th / 2}
        width={trunkW}
        height={trunkH}
        rx={trunkW * 0.3}
        fill="#92400E"
      />
      {/* tiers (back to front) */}
      {tiers.map((t, i) => (
        <polygon
          key={i}
          points={tierPts(t.w, t.y, t.h)}
          fill={i === 0 ? color : i === 1 ? dark : darken(color, 0.1)}
          stroke="#FFFFFF"
          strokeWidth={r * 0.04}
          strokeLinejoin="round"
          opacity={1}
        />
      ))}
    </g>
  )
}

// ── House ─────────────────────────────────────────────────────────────────────

/**
 * House — rectangular walls with a triangular roof and a centred door.
 *
 * Wall colour is taken from `color`; roof is a darker shade.  The door is
 * a small rounded rectangle at the bottom centre.
 */
export function House({ cx = 0, cy = 0, r = 16, color = '#60A5FA' }: GlyphProps) {
  const dark = darken(color, 0.22)
  const ww = r * 1.8      // wall width
  const wh = r * 1.4      // wall height
  const rh = r * 1.0      // roof triangle height
  const wallX = cx - ww / 2
  const wallY = cy - wh / 2 + rh * 0.3
  const doorW = r * 0.46
  const doorH = r * 0.7
  const roofPts = `${cx},${wallY - rh} ${cx + ww / 2 + r * 0.12},${wallY} ${cx - ww / 2 - r * 0.12},${wallY}`
  return (
    <g>
      {/* walls */}
      <rect x={wallX} y={wallY} width={ww} height={wh} rx={r * 0.08} fill={color} stroke={dark} strokeWidth={r * 0.1} />
      {/* roof */}
      <polygon points={roofPts} fill={dark} stroke={darken(color, 0.35)} strokeWidth={r * 0.08} strokeLinejoin="round" />
      {/* chimney */}
      <rect
        x={cx + ww * 0.2}
        y={wallY - rh * 0.88}
        width={r * 0.25}
        height={rh * 0.52}
        rx={r * 0.06}
        fill={dark}
      />
      {/* door */}
      <rect
        x={cx - doorW / 2}
        y={wallY + wh - doorH}
        width={doorW}
        height={doorH}
        rx={doorW * 0.35}
        fill={dark}
        opacity={0.7}
      />
      {/* window */}
      <rect
        x={cx - ww * 0.32}
        y={wallY + wh * 0.2}
        width={r * 0.44}
        height={r * 0.44}
        rx={r * 0.08}
        fill="#FEF3C7"
        stroke={dark}
        strokeWidth={r * 0.06}
        opacity={0.85}
      />
    </g>
  )
}

// ── Arrow ─────────────────────────────────────────────────────────────────────

/**
 * Arrow — a filled chevron arrowhead pointing in one of four cardinal
 * directions.  Drawn as a polygon centred on (cx, cy); the span of the
 * arrowhead tip-to-tail is `r * 1.6`.
 */
export function Arrow({
  cx = 0,
  cy = 0,
  r = 16,
  color = '#374151',
  dir = 'right',
}: GlyphProps & { dir?: 'up' | 'down' | 'left' | 'right' }) {
  // Authored pointing RIGHT; rotated by `rotDeg` to achieve other directions.
  const rotDeg: Record<string, number> = { right: 0, down: 90, left: 180, up: 270 }
  const deg = rotDeg[dir] ?? 0
  const hw = r * 0.8  // half-width of arrowhead (x span)
  const hh = r * 0.65 // half-height of arrowhead (y span)
  const notchX = -hw * 0.4  // inward notch depth

  // Chevron / arrowhead polygon (pointing right, centred on origin)
  const pts = [
    `${hw},0`,
    `${notchX},${hh}`,
    `${-hw * 0.1},${hh * 0.42}`,
    `${-hw * 0.1},${-hh * 0.42}`,
    `${notchX},${-hh}`,
  ].join(' ')

  return (
    <g transform={`translate(${cx},${cy}) rotate(${deg})`}>
      <polygon points={pts} fill={color} strokeLinejoin="round" />
    </g>
  )
}

// ── Cherry ────────────────────────────────────────────────────────────────────

/**
 * Cherry — a pair of cherries sharing a Y-shaped stem, matching the style
 * from CherryCount20Illustration (`CherryBunch`).
 *
 * Two cherry circles hang below the shared stem apex; a small leaf sits at the top.
 */
export function Cherry({ cx = 0, cy = 0, r = 16, color = '#F43F5E' }: GlyphProps) {
  const dark = darken(color, 0.18)
  const cr = r * 0.52    // cherry radius
  const stemLen = r * 0.9
  // offsets from centre to each cherry
  const lx = cx - r * 0.52
  const rx2 = cx + r * 0.52
  const cherryY = cy + r * 0.5
  const apexY = cy - stemLen * 0.2
  const stemTopY = cy - r * 0.85

  return (
    <g>
      {/* shared stem from top to apex */}
      <path
        d={`M ${cx} ${stemTopY} L ${cx} ${apexY}`}
        fill="none"
        stroke="#1F2937"
        strokeWidth={r * 0.12}
        strokeLinecap="round"
      />
      {/* left branch */}
      <path
        d={`M ${cx} ${apexY} Q ${lx * 0.7 + cx * 0.3} ${apexY + stemLen * 0.3} ${lx} ${cherryY - cr}`}
        fill="none"
        stroke="#1F2937"
        strokeWidth={r * 0.11}
        strokeLinecap="round"
      />
      {/* right branch */}
      <path
        d={`M ${cx} ${apexY} Q ${rx2 * 0.7 + cx * 0.3} ${apexY + stemLen * 0.3} ${rx2} ${cherryY - cr}`}
        fill="none"
        stroke="#1F2937"
        strokeWidth={r * 0.11}
        strokeLinecap="round"
      />
      {/* leaf */}
      <ellipse
        cx={cx + r * 0.34}
        cy={stemTopY - r * 0.06}
        rx={r * 0.44}
        ry={r * 0.2}
        fill="#65A30D"
        transform={`rotate(-26 ${cx + r * 0.34} ${stemTopY - r * 0.06})`}
      />
      {/* left cherry */}
      <circle cx={lx} cy={cherryY} r={cr} fill={color} />
      <path
        d={`M ${lx - cr * 0.45} ${cherryY + cr * 0.18} Q ${lx - cr * 0.18} ${cherryY + cr * 0.64} ${lx + cr * 0.27} ${cherryY + cr * 0.64}`}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={r * 0.1}
        strokeLinecap="round"
        opacity={0.7}
      />
      {/* right cherry */}
      <circle cx={rx2} cy={cherryY} r={cr} fill={color} />
      <path
        d={`M ${rx2 - cr * 0.45} ${cherryY + cr * 0.18} Q ${rx2 - cr * 0.18} ${cherryY + cr * 0.64} ${rx2 + cr * 0.27} ${cherryY + cr * 0.64}`}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={r * 0.1}
        strokeLinecap="round"
        opacity={0.7}
      />
      {/* dark shading ring */}
      <circle cx={lx} cy={cherryY} r={cr} fill="none" stroke={dark} strokeWidth={r * 0.07} opacity={0.45} />
      <circle cx={rx2} cy={cherryY} r={cr} fill="none" stroke={dark} strokeWidth={r * 0.07} opacity={0.45} />
    </g>
  )
}

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Compute points string for a regular N-point star polygon.
 * @param cx        centre X
 * @param cy        centre Y
 * @param outerR    outer tip radius
 * @param innerR    inner valley radius
 * @param n         number of points (5 for standard star)
 * @param startAngle  rotation offset in radians (default −π/2 for top-pointing)
 */
function starPoints(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  n: number,
  startAngle: number,
): string {
  const pts: string[] = []
  for (let i = 0; i < n * 2; i++) {
    const angle = startAngle + (i * Math.PI) / n
    const rad = i % 2 === 0 ? outerR : innerR
    pts.push(`${cx + rad * Math.cos(angle)},${cy + rad * Math.sin(angle)}`)
  }
  return pts.join(' ')
}

/**
 * Produce a darkened hex colour by a fraction [0..1].
 * Keeps things in the same palette family without importing a colour library.
 */
function darken(hex: string, amount: number): string {
  // Normalise to 6-digit hex
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (h.length !== 6) return hex // bail on non-standard values
  const r = Math.max(0, Math.round(parseInt(h.slice(0, 2), 16) * (1 - amount)))
  const g = Math.max(0, Math.round(parseInt(h.slice(2, 4), 16) * (1 - amount)))
  const b = Math.max(0, Math.round(parseInt(h.slice(4, 6), 16) * (1 - amount)))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
