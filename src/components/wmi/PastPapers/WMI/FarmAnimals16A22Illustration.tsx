/**
 * SEAMO-16-A-Q22 — Stem illustration
 * "A farmer has 17 chickens and rabbits. He counts 52 legs in all.
 *  How many chickens does he have?"
 *
 * Shown: a row of 4 chickens (2 legs each) and a row of 4 rabbits (4 legs
 * each), with a label "17 chickens + rabbits" and "52 legs total".
 * The answer (8 chickens) is NOT revealed here.
 *
 * No existing primitive covers chickens/rabbits.
 * Adapted in style from Animals24ECIllustration (inline SVG glyphs,
 * exported layout constants for the explainer).
 *
 * Co-exports: ChickenGlyph, RabbitGlyph (used by the explainer).
 *
 * Pure render — no Math.random, no Date, SSR-safe.
 */

// ── Layout constants (re-exported for the explainer) ─────────────────────────

export const SVG_W = 340
export const SVG_H = 210
export const GROUND_Y = 162

// Chicken row: 4 representative chickens across the top half
export const CHICKEN_CXS = [42, 100, 158, 216] as const
export const CHICKEN_BASE_Y = GROUND_Y

// Rabbit row — same baseline but offset right of the chickens
export const RABBIT_CXS = [260, 305] as const  // only 2 fit; we show "…" label
export const RABBIT_BASE_Y = GROUND_Y

// ── Colour tokens ─────────────────────────────────────────────────────────────

export const C = {
  SKY:          '#EFF6FF', // blue-50
  GROUND:       '#D4B896',
  GROUND_LINE:  '#8B6914',
  CHICKEN_BODY: '#F97316', // orange-500
  CHICKEN_DK:   '#C2410C', // orange-700
  COMB:         '#DC2626', // red
  BEAK:         '#FBBF24', // amber-400
  RABBIT_BODY:  '#9CA3AF', // gray-400
  RABBIT_DK:    '#4B5563', // gray-600
  EAR_INNER:    '#FBCFE8', // pink-200
  LEG:          '#6B7280', // gray-500
  LABEL_BG:     '#FEF3C7', // amber-100
  LABEL_TEXT:   '#92400E', // amber-900
  BADGE_BG:     '#DBEAFE', // blue-100
  BADGE_TEXT:   '#1D4ED8', // blue-700
  TOTAL_BG:     '#F0FDF4', // green-50
  TOTAL_TEXT:   '#15803D', // green-700
} as const

// ── ChickenGlyph ──────────────────────────────────────────────────────────────

/**
 * A simple cartoon chicken facing right.
 * cx = horizontal centre of body; baseY = ground level.
 */
export function ChickenGlyph({ cx, baseY }: { cx: number; baseY: number }) {
  const bodyRX = 13
  const bodyRY = 11
  const legH = 14
  const legW = 3

  // Body sits above ground; legs hang down from body bottom
  const bodyCY = baseY - legH - bodyRY + 2

  // Head (small circle to the right of the body)
  const headCX = cx + bodyRX - 2
  const headCY = bodyCY - bodyRY + 2
  const headR = 7

  // Comb (3 small bumps on top of head)
  const combY = headCY - headR

  // Beak (triangle pointing right)
  const beakTipX = headCX + headR + 5
  const beakMidY = headCY

  // Legs (2 legs)
  const legXs = [cx - 4, cx + 4]
  const legTopY = baseY - legH
  const legBotY = baseY

  // Wing (small arc)
  const wingCX = cx - 3
  const wingCY = bodyCY + 2

  return (
    <g>
      {/* Body */}
      <ellipse
        cx={cx}
        cy={bodyCY}
        rx={bodyRX}
        ry={bodyRY}
        fill={C.CHICKEN_BODY}
        stroke={C.CHICKEN_DK}
        strokeWidth={1.5}
      />

      {/* Wing */}
      <ellipse
        cx={wingCX}
        cy={wingCY}
        rx={7}
        ry={5}
        fill={C.CHICKEN_DK}
        stroke={C.CHICKEN_DK}
        strokeWidth={1}
        opacity={0.5}
      />

      {/* Head */}
      <circle
        cx={headCX}
        cy={headCY}
        r={headR}
        fill={C.CHICKEN_BODY}
        stroke={C.CHICKEN_DK}
        strokeWidth={1.5}
      />

      {/* Comb */}
      <circle cx={headCX - 3} cy={combY - 1} r={2.5} fill={C.COMB} />
      <circle cx={headCX}     cy={combY - 3} r={2.5} fill={C.COMB} />
      <circle cx={headCX + 3} cy={combY - 1} r={2.5} fill={C.COMB} />

      {/* Wattle */}
      <ellipse cx={headCX + 1} cy={headCY + headR - 1} rx={2.5} ry={3.5} fill={C.COMB} />

      {/* Beak */}
      <polygon
        points={`${headCX + headR - 1},${beakMidY - 2} ${beakTipX},${beakMidY} ${headCX + headR - 1},${beakMidY + 2}`}
        fill={C.BEAK}
        stroke={C.CHICKEN_DK}
        strokeWidth={0.5}
      />

      {/* Eye */}
      <circle cx={headCX + 2} cy={headCY - 1} r={1.5} fill={C.CHICKEN_DK} />

      {/* 2 legs */}
      {legXs.map((lx, i) => (
        <g key={i}>
          <line
            x1={lx}
            y1={legTopY}
            x2={lx}
            y2={legBotY - 3}
            stroke={C.BEAK}
            strokeWidth={legW}
            strokeLinecap="round"
          />
          {/* foot / talon stub */}
          <line
            x1={lx - 4}
            y1={legBotY - 2}
            x2={lx + 4}
            y2={legBotY - 2}
            stroke={C.BEAK}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </g>
      ))}
    </g>
  )
}

// ── RabbitGlyph ───────────────────────────────────────────────────────────────

/**
 * A simple cartoon rabbit facing right.
 * cx = horizontal centre of body; baseY = ground level.
 */
export function RabbitGlyph({ cx, baseY }: { cx: number; baseY: number }) {
  const bodyRX = 11
  const bodyRY = 13
  const legH = 10
  const legW = 4

  // Body sits above ground; 4 legs
  const bodyCY = baseY - legH - bodyRY + 4

  // Head
  const headCX = cx + 4
  const headCY = bodyCY - bodyRY + 4
  const headR = 8

  // Ears (2 tall ovals on top of head)
  const earW = 4
  const earH = 14
  const earL_CX = headCX - 5
  const earR_CX = headCX + 5
  const earTopY = headCY - headR - earH + 2

  // 4 legs
  const legXs = [cx - 6, cx - 1, cx + 4, cx + 9]
  const legTopY = baseY - legH
  const legBotY = baseY

  return (
    <g>
      {/* Ears (outer) */}
      <ellipse cx={earL_CX} cy={earTopY + earH / 2} rx={earW} ry={earH} fill={C.RABBIT_BODY} stroke={C.RABBIT_DK} strokeWidth={1} />
      <ellipse cx={earR_CX} cy={earTopY + earH / 2} rx={earW} ry={earH} fill={C.RABBIT_BODY} stroke={C.RABBIT_DK} strokeWidth={1} />

      {/* Ear inner */}
      <ellipse cx={earL_CX} cy={earTopY + earH / 2 + 2} rx={earW - 2} ry={earH - 4} fill={C.EAR_INNER} />
      <ellipse cx={earR_CX} cy={earTopY + earH / 2 + 2} rx={earW - 2} ry={earH - 4} fill={C.EAR_INNER} />

      {/* Body */}
      <ellipse
        cx={cx}
        cy={bodyCY}
        rx={bodyRX}
        ry={bodyRY}
        fill={C.RABBIT_BODY}
        stroke={C.RABBIT_DK}
        strokeWidth={1.5}
      />

      {/* Tail (small circle on the back) */}
      <circle cx={cx - bodyRX + 1} cy={bodyCY + 4} r={4} fill="white" stroke={C.RABBIT_DK} strokeWidth={1} />

      {/* Head */}
      <circle
        cx={headCX}
        cy={headCY}
        r={headR}
        fill={C.RABBIT_BODY}
        stroke={C.RABBIT_DK}
        strokeWidth={1.5}
      />

      {/* Eye */}
      <circle cx={headCX + 3} cy={headCY - 2} r={1.5} fill={C.RABBIT_DK} />

      {/* Nose */}
      <circle cx={headCX + headR - 1} cy={headCY + 1} r={1.5} fill={C.COMB} />

      {/* 4 legs */}
      {legXs.map((lx, i) => (
        <g key={i}>
          <line
            x1={lx}
            y1={legTopY}
            x2={lx}
            y2={legBotY}
            stroke={C.LEG}
            strokeWidth={legW}
            strokeLinecap="round"
          />
        </g>
      ))}
    </g>
  )
}

// ── Default export ─────────────────────────────────────────────────────────────

/**
 * FarmAnimals16A22Illustration
 *
 * Static stem figure for SEAMO-16-A-Q22.
 * Shows: 4 chickens (2-legged) on the left and 2 rabbits (4-legged) on
 * the right, on a grass ground strip.
 * Labels: "17 ayam dan kelinci" total, "52 kaki" total.
 * The answer (8 chickens) is NOT shown.
 */
export default function FarmAnimals16A22Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Empat ekor ayam dan dua ekor kelinci berdiri di atas tanah. Label menunjukkan total 17 hewan dan 52 kaki."
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(380, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* sky background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={C.SKY} />

        {/* ground strip */}
        <rect x={0} y={GROUND_Y} width={SVG_W} height={SVG_H - GROUND_Y} fill={C.GROUND} />
        <line x1={0} y1={GROUND_Y} x2={SVG_W} y2={GROUND_Y} stroke={C.GROUND_LINE} strokeWidth={2} />

        {/* chickens */}
        {CHICKEN_CXS.map((cx, i) => (
          <ChickenGlyph key={i} cx={cx} baseY={CHICKEN_BASE_Y} />
        ))}

        {/* rabbits */}
        {RABBIT_CXS.map((cx, i) => (
          <RabbitGlyph key={i} cx={cx} baseY={RABBIT_BASE_Y} />
        ))}

        {/* "…" hint that there are more animals */}
        {/* (not needed since the label captures the total) */}

        {/* ── Bottom info bar ─────────────────────────────────────── */}

        {/* total animals badge */}
        <rect x={4} y={GROUND_Y + 4} width={148} height={24} rx={6} fill={C.LABEL_BG} stroke="#D97706" strokeWidth={1} />
        <text
          x={78}
          y={GROUND_Y + 20}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          fill={C.LABEL_TEXT}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          17 ayam &amp; kelinci
        </text>

        {/* total legs badge */}
        <rect x={160} y={GROUND_Y + 4} width={134} height={24} rx={6} fill={C.TOTAL_BG} stroke="#16A34A" strokeWidth={1} />
        <text
          x={227}
          y={GROUND_Y + 20}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          fill={C.TOTAL_TEXT}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          52 kaki
        </text>

        {/* question mark */}
        <text
          x={SVG_W / 2}
          y={12}
          textAnchor="middle"
          dominantBaseline="hanging"
          fontSize={12}
          fontWeight={900}
          fill="#7C3AED"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          ? ayam
        </text>

        {/* chicken leg count label */}
        <text
          x={CHICKEN_CXS[1]}
          y={GROUND_Y - 3}
          textAnchor="middle"
          fontSize={8}
          fill={C.CHICKEN_DK}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          2 kaki
        </text>

        {/* rabbit leg count label */}
        <text
          x={RABBIT_CXS[0] + 22}
          y={GROUND_Y - 3}
          textAnchor="middle"
          fontSize={8}
          fill={C.RABBIT_DK}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          4 kaki
        </text>
      </svg>
    </div>
  )
}
