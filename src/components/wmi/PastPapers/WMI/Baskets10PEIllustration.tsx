/**
 * IKMC-22-PE-Q10 — "Which basket is the puppy sleeping in?"
 *
 * STEM ONLY — shows five numbered baskets, each with a distinct pattern.
 * Does NOT reveal the answer (basket 5) or label any animal to a basket.
 *
 * Five baskets from the source image:
 *   1 – tall oval, orange-brown diagonal crosshatch weave, blue rim (no lid)
 *   2 – square tub, mint-green with large black polka dots
 *   3 – wide picnic, orange-brown diagonal crosshatch weave, handles + lid
 *   4 – square tub, mint-green with large black polka dots (same pattern as 2)
 *   5 – wide picnic, yellow-tan horizontal brick stripe, handles + lid
 *
 * Co-exports: BasketGlyph (used by the explainer overlay animations).
 *
 * Pure render — no Math.random, no Date, SSR-safe.
 */

// ── Layout ────────────────────────────────────────────────────────────────────

export const SVG_W = 360
export const SVG_H = 170

// Basket centre X positions; all share the same baseline Y.
export const BASKET_CX = [36, 100, 180, 260, 324] as const
export const BASELINE_Y = 148

// ── Colours ───────────────────────────────────────────────────────────────────

export const C = {
  // Basket 1 & 3 — diagonal weave
  WEAVE_FILL: '#D97706',   // amber-600
  WEAVE_STROKE: '#92400E', // amber-900
  WEAVE_STRIPE: '#1D4ED8', // blue-700 (diagonal lines)
  RIM_B: '#1D4ED8',        // basket-1 blue rim
  // Basket 2 & 4 — polka dot tub
  TUB_FILL: '#A7F3D0',     // emerald-200
  TUB_STROKE: '#065F46',   // emerald-900
  DOT: '#1F2937',          // gray-900
  // Basket 5 — horizontal brick
  BRICK_FILL: '#FCD34D',   // yellow-300
  BRICK_STROKE: '#92400E', // amber-900
  BRICK_LINE: '#D97706',   // amber-600
  // Handles
  HANDLE: '#92400E',
  // Labels
  LABEL: '#374151',
} as const

// ── Primitive: BasketGlyph ─────────────────────────────────────────────────────

export interface BasketGlyphProps {
  cx: number
  baseY: number
  type: 1 | 2 | 3 | 4 | 5
  /** Optional highlight ring colour (used by explainer). */
  highlight?: string | null
}

/**
 * Draws one basket centred at cx with bottom at baseY.
 * basket types 1/3 share the weave pattern; 2/4 share polka-dots; 5 is bricks.
 */
export function BasketGlyph({ cx, baseY, type, highlight = null }: BasketGlyphProps) {
  switch (type) {
    case 1:
      return <WeaveOval cx={cx} baseY={baseY} highlight={highlight} />
    case 2:
      return <PolkaTub cx={cx} baseY={baseY} dots={12} highlight={highlight} />
    case 3:
      return <WeavePicnic cx={cx} baseY={baseY} highlight={highlight} />
    case 4:
      return <PolkaTub cx={cx} baseY={baseY} dots={15} highlight={highlight} />
    case 5:
      return <BrickPicnic cx={cx} baseY={baseY} highlight={highlight} />
  }
}

// ── Basket 1: tall oval weave, no lid ─────────────────────────────────────────

function WeaveOval({
  cx,
  baseY,
  highlight,
}: {
  cx: number
  baseY: number
  highlight?: string | null
}) {
  const w = 44
  const h = 56
  const rx = w / 2
  const ry = h / 2
  const cy = baseY - h

  // clip to ellipse
  const clipId = `weave-oval-${cx}`

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
        </clipPath>
      </defs>

      {/* body fill */}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={C.WEAVE_FILL} />

      {/* weave diagonal lines — NW-SE */}
      {[-28, -18, -8, 2, 12, 22, 32, 42].map((offset) => (
        <line
          key={`nwse-${offset}`}
          x1={cx - rx + offset - 20}
          y1={cy - ry}
          x2={cx - rx + offset + 20}
          y2={cy + ry}
          stroke={C.WEAVE_STROKE}
          strokeWidth={1.2}
          clipPath={`url(#${clipId})`}
        />
      ))}

      {/* weave diagonal lines — NE-SW */}
      {[-28, -18, -8, 2, 12, 22, 32, 42].map((offset) => (
        <line
          key={`nesw-${offset}`}
          x1={cx + rx - offset + 20}
          y1={cy - ry}
          x2={cx + rx - offset - 20}
          y2={cy + ry}
          stroke={C.WEAVE_STROKE}
          strokeWidth={1.2}
          clipPath={`url(#${clipId})`}
        />
      ))}

      {/* outline */}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={C.WEAVE_STROKE} strokeWidth={2} />

      {/* top rim (blue) */}
      <ellipse
        cx={cx}
        cy={cy - ry + 5}
        rx={rx + 2}
        ry={5}
        fill={C.RIM_B}
        stroke={C.WEAVE_STROKE}
        strokeWidth={1}
      />

      {/* handle arc */}
      <path
        d={`M ${cx - 10} ${cy - ry + 4} Q ${cx} ${cy - ry - 14} ${cx + 10} ${cy - ry + 4}`}
        fill="none"
        stroke={C.WEAVE_STROKE}
        strokeWidth={3}
        strokeLinecap="round"
      />

      {highlight && (
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx + 5}
          ry={ry + 5}
          fill="none"
          stroke={highlight}
          strokeWidth={3}
          strokeDasharray="5 3"
        />
      )}
    </g>
  )
}

// ── Basket 2 & 4: polka-dot tub ──────────────────────────────────────────────

function PolkaTub({
  cx,
  baseY,
  dots,
  highlight,
}: {
  cx: number
  baseY: number
  dots: number
  highlight?: string | null
}) {
  const w = 42
  const h = 48
  const x = cx - w / 2
  const y = baseY - h
  const rx = 4

  // Build a deterministic grid of dot positions (3 cols × rows)
  const cols = 3
  const rows = Math.ceil(dots / cols)
  const dotSpacingX = (w - 10) / (cols - 1)
  const dotSpacingY = (h - 14) / (rows - 1 || 1)

  const dotPositions: { dx: number; dy: number }[] = []
  let count = 0
  for (let r = 0; r < rows && count < dots; r++) {
    for (let c = 0; c < cols && count < dots; c++) {
      dotPositions.push({
        dx: x + 5 + c * dotSpacingX,
        dy: y + 7 + r * dotSpacingY,
      })
      count++
    }
  }

  return (
    <g>
      {/* tub body */}
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={C.TUB_FILL} stroke={C.TUB_STROKE} strokeWidth={1.8} />

      {/* dots */}
      {dotPositions.map((p, i) => (
        <circle key={i} cx={p.dx} cy={p.dy} r={3.5} fill={C.DOT} />
      ))}

      {/* top rim band */}
      <rect x={x - 1} y={y - 4} width={w + 2} height={8} rx={2} fill={C.TUB_FILL} stroke={C.TUB_STROKE} strokeWidth={1.5} />

      {highlight && (
        <rect
          x={x - 5}
          y={y - 7}
          width={w + 10}
          height={h + 10}
          rx={rx + 3}
          fill="none"
          stroke={highlight}
          strokeWidth={3}
          strokeDasharray="5 3"
        />
      )}
    </g>
  )
}

// ── Basket 3: wide picnic, weave pattern, with handles ───────────────────────

function WeavePicnic({
  cx,
  baseY,
  highlight,
}: {
  cx: number
  baseY: number
  highlight?: string | null
}) {
  const w = 58
  const h = 40
  const lidH = 16
  const x = cx - w / 2
  const bodyY = baseY - h
  const lidY = bodyY - lidH
  const clipId = `weave-picnic-${cx}`
  const clipLidId = `weave-picnic-lid-${cx}`

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <rect x={x} y={bodyY} width={w} height={h} rx={4} />
        </clipPath>
        <clipPath id={clipLidId}>
          <rect x={x} y={lidY} width={w} height={lidH} rx={3} />
        </clipPath>
      </defs>

      {/* body fill */}
      <rect x={x} y={bodyY} width={w} height={h} rx={4} fill={C.WEAVE_FILL} />

      {/* body weave NW-SE */}
      {[-40, -28, -18, -8, 2, 12, 22, 32, 42, 52, 62, 72].map((off) => (
        <line
          key={`b-nwse-${off}`}
          x1={x + off - 20}
          y1={bodyY}
          x2={x + off + 20}
          y2={bodyY + h}
          stroke={C.WEAVE_STROKE}
          strokeWidth={1.2}
          clipPath={`url(#${clipId})`}
        />
      ))}

      {/* body weave NE-SW */}
      {[-40, -28, -18, -8, 2, 12, 22, 32, 42, 52, 62, 72].map((off) => (
        <line
          key={`b-nesw-${off}`}
          x1={x + w - off + 20}
          y1={bodyY}
          x2={x + w - off - 20}
          y2={bodyY + h}
          stroke={C.WEAVE_STROKE}
          strokeWidth={1.2}
          clipPath={`url(#${clipId})`}
        />
      ))}

      {/* body outline */}
      <rect x={x} y={bodyY} width={w} height={h} rx={4} fill="none" stroke={C.WEAVE_STROKE} strokeWidth={2} />

      {/* lid fill */}
      <rect x={x} y={lidY} width={w} height={lidH} rx={3} fill={C.WEAVE_FILL} />

      {/* lid weave NW-SE */}
      {[-40, -28, -18, -8, 2, 12, 22, 32, 42, 52, 62, 72].map((off) => (
        <line
          key={`l-nwse-${off}`}
          x1={x + off - 20}
          y1={lidY}
          x2={x + off + 20}
          y2={lidY + lidH}
          stroke={C.WEAVE_STROKE}
          strokeWidth={1.2}
          clipPath={`url(#${clipLidId})`}
        />
      ))}

      {/* lid weave NE-SW */}
      {[-40, -28, -18, -8, 2, 12, 22, 32, 42, 52, 62, 72].map((off) => (
        <line
          key={`l-nesw-${off}`}
          x1={x + w - off + 20}
          y1={lidY}
          x2={x + w - off - 20}
          y2={lidY + lidH}
          stroke={C.WEAVE_STROKE}
          strokeWidth={1.2}
          clipPath={`url(#${clipLidId})`}
        />
      ))}

      {/* lid outline */}
      <rect x={x} y={lidY} width={w} height={lidH} rx={3} fill="none" stroke={C.WEAVE_STROKE} strokeWidth={2} />

      {/* centre latch */}
      <circle cx={cx} cy={bodyY} r={3.5} fill={C.WEAVE_STROKE} />

      {/* handles (left & right) */}
      <path
        d={`M ${x + 6} ${lidY + 4} Q ${x - 8} ${lidY - 10} ${x + 6} ${lidY + lidH - 4}`}
        fill="none"
        stroke={C.HANDLE}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d={`M ${x + w - 6} ${lidY + 4} Q ${x + w + 8} ${lidY - 10} ${x + w - 6} ${lidY + lidH - 4}`}
        fill="none"
        stroke={C.HANDLE}
        strokeWidth={3}
        strokeLinecap="round"
      />

      {highlight && (
        <rect
          x={x - 5}
          y={lidY - 5}
          width={w + 10}
          height={h + lidH + 10}
          rx={6}
          fill="none"
          stroke={highlight}
          strokeWidth={3}
          strokeDasharray="5 3"
        />
      )}
    </g>
  )
}

// ── Basket 5: wide picnic, horizontal brick stripe, with handles ──────────────

function BrickPicnic({
  cx,
  baseY,
  highlight,
}: {
  cx: number
  baseY: number
  highlight?: string | null
}) {
  const w = 58
  const h = 38
  const lidH = 14
  const x = cx - w / 2
  const bodyY = baseY - h
  const lidY = bodyY - lidH

  // Horizontal stripe rows (body + lid)
  const stripeH = 7
  const bodyStripes = Math.ceil(h / stripeH)
  const lidStripes = Math.ceil(lidH / stripeH)

  return (
    <g>
      {/* body */}
      <rect x={x} y={bodyY} width={w} height={h} rx={3} fill={C.BRICK_FILL} stroke={C.BRICK_STROKE} strokeWidth={2} />
      {/* horizontal stripes on body */}
      {Array.from({ length: bodyStripes }).map((_, i) => (
        <line
          key={`bs-${i}`}
          x1={x + 1}
          y1={bodyY + (i + 1) * stripeH}
          x2={x + w - 1}
          y2={bodyY + (i + 1) * stripeH}
          stroke={C.BRICK_LINE}
          strokeWidth={1}
        />
      ))}
      {/* vertical offsets (brick pattern) */}
      {Array.from({ length: bodyStripes }).map((_, i) => {
        const rowY = bodyY + i * stripeH
        const offset = i % 2 === 0 ? 0 : w / 4
        return (
          <line
            key={`bv-${i}`}
            x1={x + (w / 2) + offset}
            y1={rowY}
            x2={x + (w / 2) + offset}
            y2={Math.min(rowY + stripeH, bodyY + h)}
            stroke={C.BRICK_LINE}
            strokeWidth={1}
          />
        )
      })}

      {/* lid */}
      <rect x={x} y={lidY} width={w} height={lidH} rx={3} fill={C.BRICK_FILL} stroke={C.BRICK_STROKE} strokeWidth={2} />
      {Array.from({ length: lidStripes }).map((_, i) => (
        <line
          key={`ls-${i}`}
          x1={x + 1}
          y1={lidY + (i + 1) * stripeH}
          x2={x + w - 1}
          y2={lidY + (i + 1) * stripeH}
          stroke={C.BRICK_LINE}
          strokeWidth={1}
        />
      ))}

      {/* centre latch */}
      <circle cx={cx} cy={bodyY} r={3} fill={C.BRICK_STROKE} />

      {/* handles */}
      <path
        d={`M ${x + 6} ${lidY + 3} Q ${x - 8} ${lidY - 9} ${x + 6} ${lidY + lidH - 3}`}
        fill="none"
        stroke={C.HANDLE}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d={`M ${x + w - 6} ${lidY + 3} Q ${x + w + 8} ${lidY - 9} ${x + w - 6} ${lidY + lidH - 3}`}
        fill="none"
        stroke={C.HANDLE}
        strokeWidth={3}
        strokeLinecap="round"
      />

      {highlight && (
        <rect
          x={x - 5}
          y={lidY - 5}
          width={w + 10}
          height={h + lidH + 10}
          rx={6}
          fill="none"
          stroke={highlight}
          strokeWidth={3}
          strokeDasharray="5 3"
        />
      )}
    </g>
  )
}

// ── Default export: Stem illustration ─────────────────────────────────────────

/**
 * Baskets10PEIllustration
 *
 * Shows all 5 numbered baskets as described in IKMC-22-PE-Q10.
 * Does NOT reveal the answer or assign animals.
 */
export default function Baskets10PEIllustration() {
  const ariaLabel =
    'Five baskets numbered 1 to 5. ' +
    'Basket 1: tall oval with orange-brown diagonal weave and blue rim. ' +
    'Basket 2: square tub with mint-green background and black polka dots. ' +
    'Basket 3: wide picnic basket with orange-brown diagonal weave and side handles. ' +
    'Basket 4: square tub with mint-green background and black polka dots (same pattern as basket 2). ' +
    'Basket 5: wide picnic basket with yellow-tan horizontal brick pattern and side handles.'

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(400, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* Baskets */}
        {([1, 2, 3, 4, 5] as const).map((type, i) => (
          <BasketGlyph
            key={type}
            cx={BASKET_CX[i]}
            baseY={BASELINE_Y}
            type={type}
          />
        ))}

        {/* Basket number labels */}
        {BASKET_CX.map((bx, i) => (
          <text
            key={i}
            x={bx}
            y={BASELINE_Y + 12}
            textAnchor="middle"
            dominantBaseline="hanging"
            fontSize={11}
            fontWeight={700}
            fill={C.LABEL}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {i + 1}
          </text>
        ))}
      </svg>
    </div>
  )
}
