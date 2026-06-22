// IKMC-19-EC-Q24 — "ostriches and camels ordering footwear and hats"
//
// PROBLEM ONLY: shows the scene from the paper —
//   - An ostrich wearing red shoes (2 feet) and a hat.
//   - A camel wearing blue shoes (4 hooves) and a hat.
//   - Labels showing the shoe counts (16 pairs red, 40 blue).
//   - A "?" for the number of hats.
//
// Does NOT show:
//   - The number of ostriches (16), camels (10), or hats (26).
//   - The answer (A = 26).
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── layout constants (re-exported for the explainer) ──────────────────────────

export const SVG_W = 320
export const SVG_H = 220

// Camel sits on the left, ostrich on the right
export const CAMEL_CX = 90
export const OSTRICH_CX = 230
export const GROUND_Y = 185

// ── colour tokens ────────────────────────────────────────────────────────────

export const COLOR = {
  GROUND: '#D4B896',
  CAMEL_BODY: '#C8862A',
  CAMEL_STROKE: '#8B5E0A',
  OSTRICH_BODY: '#3CB371',
  OSTRICH_STROKE: '#1A6B40',
  NECK: '#9DC850',
  SHOE_RED: '#DC2626',
  SHOE_BLUE: '#2563EB',
  HAT_FILL: '#4B5563',
  HAT_BRIM: '#1F2937',
  LABEL: '#1F2937',
  INK: '#374151',
  QUESTION: '#7C3AED',
} as const

// ── Camel primitive ──────────────────────────────────────────────────────────

/**
 * Camel body: a rounded rectangle hump body, 4 legs with blue shoes.
 * cx, baseY: horizontal centre and Y of the bottom of the body (above legs).
 */
export function CamelGlyph({ cx, baseY }: { cx: number; baseY: number }) {
  // Body proportions
  const bw = 58  // body width
  const bh = 40  // body height
  const humpH = 14 // single hump rise
  const legH = 26
  const legW = 8
  const shoeH = 7
  const shoeW = 12

  const bodyTop = baseY - bh - humpH
  const bodyLeft = cx - bw / 2

  // Hump path (single hump at centre)
  const humpCX = cx
  const humpTop = bodyTop - 2

  // Leg positions (4 legs)
  const legSpacing = bw / 5
  const legXs = [
    bodyLeft + legSpacing * 0.8,
    bodyLeft + legSpacing * 1.8,
    bodyLeft + legSpacing * 3.0,
    bodyLeft + legSpacing * 4.0,
  ]
  const legTopY = baseY
  const legBotY = baseY + legH

  // Head (small ellipse left of body)
  const headCX = bodyLeft - 10
  const headCY = bodyTop + bh * 0.2
  const neckX1 = bodyLeft - 2
  const neckY1 = bodyTop + bh * 0.3
  const neckX2 = headCX + 8
  const neckY2 = headCY + 8

  return (
    <g>
      {/* neck */}
      <line
        x1={neckX1} y1={neckY1}
        x2={neckX2} y2={neckY2}
        stroke={COLOR.CAMEL_STROKE}
        strokeWidth={10}
        strokeLinecap="round"
      />

      {/* hump */}
      <ellipse
        cx={humpCX}
        cy={humpTop + humpH / 2}
        rx={bw * 0.25}
        ry={humpH * 0.7}
        fill={COLOR.CAMEL_BODY}
        stroke={COLOR.CAMEL_STROKE}
        strokeWidth={1.5}
      />

      {/* body */}
      <rect
        x={bodyLeft}
        y={bodyTop}
        width={bw}
        height={bh}
        rx={10}
        fill={COLOR.CAMEL_BODY}
        stroke={COLOR.CAMEL_STROKE}
        strokeWidth={2}
      />

      {/* head */}
      <ellipse
        cx={headCX}
        cy={headCY}
        rx={12}
        ry={9}
        fill={COLOR.CAMEL_BODY}
        stroke={COLOR.CAMEL_STROKE}
        strokeWidth={1.5}
      />

      {/* eye */}
      <circle cx={headCX - 3} cy={headCY - 2} r={2} fill={COLOR.CAMEL_STROKE} />

      {/* 4 legs */}
      {legXs.map((lx, i) => (
        <rect
          key={i}
          x={lx - legW / 2}
          y={legTopY}
          width={legW}
          height={legH - shoeH}
          rx={3}
          fill={COLOR.CAMEL_BODY}
          stroke={COLOR.CAMEL_STROKE}
          strokeWidth={1}
        />
      ))}

      {/* 4 blue shoes */}
      {legXs.map((lx, i) => (
        <rect
          key={i}
          x={lx - shoeW / 2}
          y={legBotY - shoeH}
          width={shoeW}
          height={shoeH}
          rx={3}
          fill={COLOR.SHOE_BLUE}
          stroke="#1D4ED8"
          strokeWidth={1}
        />
      ))}

      {/* hat */}
      <rect
        x={cx - 14}
        y={bodyTop - 22}
        width={28}
        height={16}
        rx={3}
        fill={COLOR.HAT_FILL}
        stroke={COLOR.HAT_BRIM}
        strokeWidth={1.5}
      />
      {/* hat brim */}
      <rect
        x={cx - 20}
        y={bodyTop - 8}
        width={40}
        height={5}
        rx={2}
        fill={COLOR.HAT_BRIM}
      />
    </g>
  )
}

// ── Ostrich primitive ─────────────────────────────────────────────────────────

/**
 * Ostrich body: round body, long neck + small head, 2 legs with red shoes.
 */
export function OstrichGlyph({ cx, baseY }: { cx: number; baseY: number }) {
  const bodyRX = 22
  const bodyRY = 26
  const legH = 34
  const legW = 7
  const shoeH = 7
  const shoeW = 11

  // Body
  const bodyCY = baseY - legH - bodyRY + 4

  // Long neck from top of body, curving up
  const neckBotX = cx - 5
  const neckBotY = bodyCY - bodyRY + 6
  const neckTopX = cx - 14
  const neckTopY = bodyCY - bodyRY - 28

  // Head (small circle at top of neck)
  const headCX = neckTopX - 8
  const headCY = neckTopY - 4

  // Legs (2 legs)
  const legXs = [cx - 9, cx + 9]
  const legTopY = baseY - legH
  const legBotY = baseY

  return (
    <g>
      {/* neck */}
      <line
        x1={neckBotX} y1={neckBotY}
        x2={neckTopX} y2={neckTopY}
        stroke={COLOR.NECK}
        strokeWidth={9}
        strokeLinecap="round"
      />

      {/* body */}
      <ellipse
        cx={cx}
        cy={bodyCY}
        rx={bodyRX}
        ry={bodyRY}
        fill={COLOR.OSTRICH_BODY}
        stroke={COLOR.OSTRICH_STROKE}
        strokeWidth={2}
      />

      {/* head */}
      <ellipse
        cx={headCX}
        cy={headCY}
        rx={9}
        ry={7}
        fill={COLOR.NECK}
        stroke={COLOR.OSTRICH_STROKE}
        strokeWidth={1.5}
      />

      {/* eye */}
      <circle cx={headCX - 2} cy={headCY - 1} r={2} fill={COLOR.OSTRICH_STROKE} />

      {/* beak */}
      <line
        x1={headCX - 9}
        y1={headCY + 1}
        x2={headCX - 17}
        y2={headCY + 3}
        stroke={COLOR.CAMEL_BODY}
        strokeWidth={3}
        strokeLinecap="round"
      />

      {/* 2 legs */}
      {legXs.map((lx, i) => (
        <rect
          key={i}
          x={lx - legW / 2}
          y={legTopY}
          width={legW}
          height={legH - shoeH}
          rx={3}
          fill={COLOR.NECK}
          stroke={COLOR.OSTRICH_STROKE}
          strokeWidth={1}
        />
      ))}

      {/* 2 red shoes */}
      {legXs.map((lx, i) => (
        <rect
          key={i}
          x={lx - shoeW / 2}
          y={legBotY - shoeH}
          width={shoeW}
          height={shoeH}
          rx={3}
          fill={COLOR.SHOE_RED}
          stroke="#B91C1C"
          strokeWidth={1}
        />
      ))}

      {/* hat */}
      <rect
        x={headCX - 10}
        y={headCY - 20}
        width={20}
        height={12}
        rx={2}
        fill={COLOR.HAT_FILL}
        stroke={COLOR.HAT_BRIM}
        strokeWidth={1.5}
      />
      {/* hat brim */}
      <rect
        x={headCX - 15}
        y={headCY - 10}
        width={30}
        height={4}
        rx={2}
        fill={COLOR.HAT_BRIM}
      />
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────────

/**
 * Animals24ECIllustration
 *
 * Static stem figure for IKMC-19-EC-Q24.
 * Shows: a camel (4 blue shoes) and an ostrich (2 red shoes) each wearing a hat.
 * Labels: "16 pasang sepatu merah" / "40 sepatu biru" and "? topi".
 * Does NOT show: ostrich/camel counts or the answer (26 hats).
 */
export default function Animals24ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Seekor unta dengan 4 sepatu biru dan sebuah topi, dan seekor burung unta dengan 2 sepatu merah dan sebuah topi. ' +
        'Tukang sepatu membuat 16 pasang sepatu merah untuk burung unta dan 40 sepatu biru untuk unta. ' +
        'Berapa banyak topi yang dibuat?'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(360, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* ground strip */}
        <rect x={0} y={GROUND_Y} width={SVG_W} height={SVG_H - GROUND_Y} fill={COLOR.GROUND} />
        <line x1={0} y1={GROUND_Y} x2={SVG_W} y2={GROUND_Y} stroke="#8B6914" strokeWidth={2} />

        {/* camel (left) */}
        <CamelGlyph cx={CAMEL_CX} baseY={GROUND_Y} />

        {/* ostrich (right) */}
        <OstrichGlyph cx={OSTRICH_CX} baseY={GROUND_Y} />

        {/* red-shoe label (below ostrich) */}
        <text
          x={OSTRICH_CX}
          y={GROUND_Y + 14}
          textAnchor="middle"
          fontSize={9}
          fontWeight={700}
          fill={COLOR.SHOE_RED}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          16 pairs red shoes
        </text>

        {/* blue-shoe label (below camel) */}
        <text
          x={CAMEL_CX}
          y={GROUND_Y + 14}
          textAnchor="middle"
          fontSize={9}
          fontWeight={700}
          fill={COLOR.SHOE_BLUE}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          40 blue shoes
        </text>

        {/* question: hats? */}
        <text
          x={SVG_W / 2}
          y={14}
          textAnchor="middle"
          dominantBaseline="hanging"
          fontSize={14}
          fontWeight={900}
          fill={COLOR.QUESTION}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          ? hats
        </text>
      </svg>
    </div>
  )
}
