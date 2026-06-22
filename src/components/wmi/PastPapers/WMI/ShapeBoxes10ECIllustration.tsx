/**
 * IKMC-21-EC-Q10 — "Sofie wants to pick five different shapes from the boxes."
 *
 * The figure shows 5 vertical open boxes (box 1–5), each containing several
 * blue geometric shapes. Sofie picks exactly 1 shape from each box so that
 * all 5 chosen shapes are different. The question asks which shape she MUST
 * pick from box 4.
 *
 * Box contents (read from the source scan, 2021.imgs/034.jpg):
 *   Box 1: star, pentagon
 *   Box 2: star, circle, pentagon
 *   Box 3: circle, pentagon, triangle
 *   Box 4: star, circle, diamond          ← diamond is UNIQUE to box 4
 *   Box 5: star, circle, triangle
 *
 * Answer shapes: A=star  B=circle  C=pentagon  D=triangle  E=diamond
 * Correct answer: E (diamond) — only box 4 can provide a diamond.
 *
 * Primitive: ShapeBoxes10EC (shared with the explainer).
 * Pure SVG — no randomness, no side effects, SSR-safe & deterministic.
 */

// ── colour tokens ──────────────────────────────────────────────────────────
const SHAPE_FILL = '#30598A'       // qupu-brand-blue — shape body
const SHAPE_STROKE = '#1a3b60'     // slightly darker outline
const BOX_WALL = '#1F2937'         // dark ink — box walls
const BOX_FILL = '#F8FAFC'         // near-white interior
const LIT_FILL = '#EEF4FB'         // light blue — highlighted box floor
const LIT_STROKE = '#f0853a'       // qupu-brand-orange — highlight ring
const NUM_INK = '#64748B'          // slate — box-number label
const DIAMOND_FILL = '#f0853a'     // orange — answer diamond (highlighted)
const DIAMOND_STROKE = '#c8631f'

// ── shape types ────────────────────────────────────────────────────────────
export type ShapeType = 'star' | 'circle' | 'pentagon' | 'triangle' | 'diamond'

// ── Shape glyph: draws ONE shape centred in a `size`×`size` cell ──────────
interface GlyphProps {
  shape: ShapeType
  cx: number
  cy: number
  r: number
  highlighted?: boolean
}

function starPoints(cx: number, cy: number, ro: number, ri: number, n: number): string {
  const pts: string[] = []
  for (let i = 0; i < n * 2; i++) {
    const angle = (Math.PI / n) * i - Math.PI / 2
    const rr = i % 2 === 0 ? ro : ri
    pts.push(`${(cx + rr * Math.cos(angle)).toFixed(2)},${(cy + rr * Math.sin(angle)).toFixed(2)}`)
  }
  return pts.join(' ')
}

function pentagonPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = []
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
    pts.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`)
  }
  return pts.join(' ')
}

export function ShapeGlyph({ shape, cx, cy, r, highlighted = false }: GlyphProps) {
  const fill = highlighted ? DIAMOND_FILL : SHAPE_FILL
  const stroke = highlighted ? DIAMOND_STROKE : SHAPE_STROKE
  const sw = Math.max(1.2, r * 0.12)

  if (shape === 'circle') {
    return <circle cx={cx} cy={cy} r={r * 0.88} fill={fill} stroke={stroke} strokeWidth={sw} />
  }
  if (shape === 'star') {
    return (
      <polygon
        points={starPoints(cx, cy, r, r * 0.42, 5)}
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    )
  }
  if (shape === 'pentagon') {
    return (
      <polygon
        points={pentagonPoints(cx, cy, r * 0.92)}
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    )
  }
  if (shape === 'triangle') {
    const h = r * 1.7
    const pts = [
      `${cx.toFixed(2)},${(cy - h / 2).toFixed(2)}`,
      `${(cx - r * 0.92).toFixed(2)},${(cy + h / 2).toFixed(2)}`,
      `${(cx + r * 0.92).toFixed(2)},${(cy + h / 2).toFixed(2)}`,
    ].join(' ')
    return (
      <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
    )
  }
  // diamond (rotated square)
  const pts = [
    `${cx.toFixed(2)},${(cy - r).toFixed(2)}`,
    `${(cx + r * 0.72).toFixed(2)},${cy.toFixed(2)}`,
    `${cx.toFixed(2)},${(cy + r).toFixed(2)}`,
    `${(cx - r * 0.72).toFixed(2)},${cy.toFixed(2)}`,
  ].join(' ')
  return (
    <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
  )
}

// ── Box contents table ──────────────────────────────────────────────────────
// Each sub-array lists the shapes in that box (index 0 = box 1 … index 4 = box 5).
export const BOX_SHAPES: ShapeType[][] = [
  ['star', 'pentagon'],               // box 1
  ['star', 'circle', 'pentagon'],     // box 2
  ['circle', 'pentagon', 'triangle'], // box 3
  ['star', 'circle', 'diamond'],      // box 4  ← diamond unique here
  ['star', 'circle', 'triangle'],     // box 5
]

// The shape that must be picked from box 4.
export const BOX4_FORCED: ShapeType = 'diamond'

// ── Shared primitive ───────────────────────────────────────────────────────
export interface ShapeBoxes10ECProps {
  /** 0-based box index whose border glows (animator use). null = no glow. */
  litBox?: number | null
  /** If true, draw the diamond in box 4 in orange to signal the forced pick. */
  highlightDiamond?: boolean
}

const BOX_W = 76
const BOX_H = 120
const BOX_GAP = 16
const PAD = 16
const WALL = 2.5
const NUM_H = 18    // height reserved below each box for the label
const SHAPE_R = 17  // shape glyph radius

export function ShapeBoxes10EC({ litBox = null, highlightDiamond = false }: ShapeBoxes10ECProps) {
  const N = 5
  const width = PAD * 2 + N * BOX_W + (N - 1) * BOX_GAP
  const height = PAD + BOX_H + NUM_H + PAD * 0.5

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: 440, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {BOX_SHAPES.map((shapes, bi) => {
        const bx = PAD + bi * (BOX_W + BOX_GAP)
        const by = PAD
        const lit = litBox === bi
        const floorFill = lit ? LIT_FILL : BOX_FILL
        const wallColor = lit ? LIT_STROKE : BOX_WALL
        const wallW = lit ? 3 : WALL

        // Layout shapes in a column inside the box.
        const slotH = BOX_H / (shapes.length + 1)

        return (
          <g key={bi}>
            {/* box walls: left + right + bottom (open top) */}
            <rect
              x={bx}
              y={by}
              width={BOX_W}
              height={BOX_H}
              fill={floorFill}
              stroke="none"
            />
            {/* left wall */}
            <line
              x1={bx}
              y1={by}
              x2={bx}
              y2={by + BOX_H}
              stroke={wallColor}
              strokeWidth={wallW}
              strokeLinecap="round"
            />
            {/* right wall */}
            <line
              x1={bx + BOX_W}
              y1={by}
              x2={bx + BOX_W}
              y2={by + BOX_H}
              stroke={wallColor}
              strokeWidth={wallW}
              strokeLinecap="round"
            />
            {/* bottom wall */}
            <line
              x1={bx}
              y1={by + BOX_H}
              x2={bx + BOX_W}
              y2={by + BOX_H}
              stroke={wallColor}
              strokeWidth={wallW}
              strokeLinecap="round"
            />

            {/* shapes inside the box */}
            {shapes.map((shape, si) => {
              const cy = by + slotH * (si + 1)
              const cx = bx + BOX_W / 2
              const isDiamond = shape === 'diamond'
              const hl = isDiamond && highlightDiamond
              return (
                <ShapeGlyph
                  key={si}
                  shape={shape}
                  cx={cx}
                  cy={cy}
                  r={SHAPE_R}
                  highlighted={hl}
                />
              )
            })}

            {/* box number label */}
            <text
              x={bx + BOX_W / 2}
              y={by + BOX_H + NUM_H - 2}
              textAnchor="middle"
              fontSize={11}
              fill={NUM_INK}
              fontFamily="sans-serif"
              fontWeight="600"
            >
              {`box ${bi + 1}`}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Default export — stem illustration (shows only the problem) ─────────────
export default function ShapeBoxes10ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Lima kotak terbuka berisi berbagai bentuk biru. ' +
        'Kotak 1: bintang, segi lima. ' +
        'Kotak 2: bintang, lingkaran, segi lima. ' +
        'Kotak 3: lingkaran, segi lima, segitiga. ' +
        'Kotak 4: bintang, lingkaran, belah ketupat. ' +
        'Kotak 5: bintang, lingkaran, segitiga. ' +
        'Sofie memilih 1 bentuk dari tiap kotak — semuanya harus berbeda. Bentuk apa yang harus dia ambil dari kotak 4?'
      }
    >
      <ShapeBoxes10EC />
    </div>
  )
}
