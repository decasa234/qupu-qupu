/**
 * SEAMO-20-A-Q6 — Stem illustration
 * "There are 10 ostriches and goats on a farm. An ostrich has 2 legs
 *  while a goat has 4 legs. The farmer counts 32 legs in total.
 *  How many goats are there on the farm?"
 *
 * Shown: 3 ostriches (2 legs each) on the left, 3 goats (4 legs each)
 * on the right, with a ground strip and info badges for
 * "10 burung unta & kambing" and "32 kaki".
 * The answer (6 goats) is NOT revealed here.
 *
 * No existing primitive covers ostriches/goats.
 * Copy-adapted from FarmAnimals16A22Illustration (chicken/rabbit pattern).
 *
 * Co-exports: OstrichGlyph, GoatGlyph (for the explainer).
 *
 * Pure render — no Math.random, no Date, SSR-safe.
 */

// ── Layout constants (re-exported for the explainer) ─────────────────────────

export const SVG_W = 340
export const SVG_H = 210
export const GROUND_Y = 162

// Ostrich row: 3 ostriches on the left half
export const OSTRICH_CXS = [44, 100, 156] as const
export const OSTRICH_BASE_Y = GROUND_Y

// Goat row: 3 goats on the right half
export const GOAT_CXS = [210, 265, 315] as const
export const GOAT_BASE_Y = GROUND_Y

// ── Colour tokens ─────────────────────────────────────────────────────────────

export const C = {
  SKY:          '#EFF6FF', // blue-50
  GROUND:       '#D4B896',
  GROUND_LINE:  '#8B6914',
  // Ostrich colours
  OB_BODY:      '#1F2937', // dark body feathers (gray-800)
  OB_NECK:      '#D97706', // amber-600 — tan neck
  OB_HEAD:      '#F97316', // orange
  OB_BEAK:      '#FBBF24', // amber-400
  OB_EYE:       '#FFFFFF',
  OB_LEG:       '#F59E0B', // amber-500
  OB_WING:      '#374151', // gray-700
  // Goat colours
  GT_BODY:      '#E5E7EB', // gray-200
  GT_DK:        '#9CA3AF', // gray-400
  GT_DARK:      '#6B7280', // gray-500
  GT_HORN:      '#D97706', // amber
  GT_NOSE:      '#F9A8D4', // pink-200
  GT_PATCH:     '#D1D5DB', // gray-300
  GT_LEG:       '#9CA3AF',
  // Labels
  LABEL_BG:     '#FEF3C7', // amber-100
  LABEL_TEXT:   '#92400E', // amber-900
  TOTAL_BG:     '#F0FDF4', // green-50
  TOTAL_TEXT:   '#15803D', // green-700
  QUESTION_CLR: '#7C3AED',
} as const

// ── OstrichGlyph ──────────────────────────────────────────────────────────────

/**
 * A simple cartoon ostrich facing right.
 * cx = horizontal centre of body; baseY = ground level.
 * An ostrich has 2 long legs.
 */
export function OstrichGlyph({ cx, baseY }: { cx: number; baseY: number }) {
  const bodyRX = 14
  const bodyRY = 16
  const legH   = 24
  const neckH  = 22
  const headR  = 7

  // Body centre (large oval, above legs)
  const bodyCY = baseY - legH - bodyRY + 6

  // Neck rises from top of body
  const neckBotX = cx + 4
  const neckBotY = bodyCY - bodyRY + 6
  const neckTopX = cx + 12
  const neckTopY = neckBotY - neckH

  // Head
  const headCX = neckTopX + 2
  const headCY = neckTopY - headR + 1

  // Beak
  const beakTipX = headCX + headR + 7
  const beakMidY = headCY + 2

  // 2 long legs
  const legXs: [number, number] = [cx - 5, cx + 5]
  const legTopY = bodyCY + bodyRY - 6
  const legBotY = baseY

  return (
    <g>
      {/* Body (large dark oval — feathers) */}
      <ellipse
        cx={cx}
        cy={bodyCY}
        rx={bodyRX}
        ry={bodyRY}
        fill={C.OB_BODY}
        stroke={C.OB_WING}
        strokeWidth={1.5}
      />

      {/* Wing accent */}
      <ellipse
        cx={cx - 4}
        cy={bodyCY + 4}
        rx={8}
        ry={6}
        fill={C.OB_WING}
        stroke="none"
        opacity={0.6}
      />

      {/* Neck */}
      <path
        d={`M${neckBotX},${neckBotY} Q${neckBotX + 10},${neckBotY - 12} ${neckTopX},${neckTopY}`}
        stroke={C.OB_NECK}
        strokeWidth={7}
        fill="none"
        strokeLinecap="round"
      />

      {/* Head */}
      <circle
        cx={headCX}
        cy={headCY}
        r={headR}
        fill={C.OB_HEAD}
        stroke={C.OB_NECK}
        strokeWidth={1}
      />

      {/* Eye */}
      <circle cx={headCX + 2} cy={headCY - 1} r={2} fill={C.OB_EYE} />
      <circle cx={headCX + 2} cy={headCY - 1} r={1} fill={C.OB_BODY} />

      {/* Beak */}
      <polygon
        points={`${headCX + headR - 1},${beakMidY - 2} ${beakTipX},${beakMidY} ${headCX + headR - 1},${beakMidY + 3}`}
        fill={C.OB_BEAK}
        stroke={C.OB_NECK}
        strokeWidth={0.5}
      />

      {/* 2 long legs */}
      {legXs.map((lx, i) => (
        <g key={i}>
          {/* upper leg */}
          <line
            x1={lx}
            y1={legTopY}
            x2={lx + 2}
            y2={legTopY + legH * 0.55}
            stroke={C.OB_LEG}
            strokeWidth={4}
            strokeLinecap="round"
          />
          {/* lower leg (slightly angled) */}
          <line
            x1={lx + 2}
            y1={legTopY + legH * 0.55}
            x2={lx - 2}
            y2={legBotY}
            stroke={C.OB_LEG}
            strokeWidth={3}
            strokeLinecap="round"
          />
          {/* foot */}
          <line
            x1={lx - 6}
            y1={legBotY}
            x2={lx + 5}
            y2={legBotY}
            stroke={C.OB_LEG}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </g>
      ))}
    </g>
  )
}

// ── GoatGlyph ────────────────────────────────────────────────────────────────

/**
 * A simple cartoon goat facing right.
 * cx = horizontal centre of body; baseY = ground level.
 * A goat has 4 legs.
 */
export function GoatGlyph({ cx, baseY }: { cx: number; baseY: number }) {
  const bodyRX = 13
  const bodyRY = 10
  const legH   = 14
  const legW   = 3

  // Body sits above ground
  const bodyCY = baseY - legH - bodyRY + 2

  // Head (to the right, slightly above body)
  const headCX = cx + bodyRX - 1
  const headCY = bodyCY - bodyRY + 4
  const headR  = 7

  // Horns (two short lines from top of head)
  const hornBaseY = headCY - headR
  const hornH = 8

  // Beard (tiny hanging oval)
  const beardCX = headCX + 5
  const beardCY = headCY + headR + 3

  // 4 legs
  const legXs: [number, number, number, number] = [cx - 8, cx - 2, cx + 3, cx + 8]
  const legTopY = bodyCY + bodyRY - 2
  const legBotY = baseY

  return (
    <g>
      {/* Tail (small upright stub at back-left of body) */}
      <line
        x1={cx - bodyRX + 2}
        y1={bodyCY - 4}
        x2={cx - bodyRX - 3}
        y2={bodyCY - 10}
        stroke={C.GT_DK}
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {/* Body */}
      <ellipse
        cx={cx}
        cy={bodyCY}
        rx={bodyRX}
        ry={bodyRY}
        fill={C.GT_BODY}
        stroke={C.GT_DARK}
        strokeWidth={1.5}
      />

      {/* Body patches */}
      <ellipse
        cx={cx - 2}
        cy={bodyCY + 2}
        rx={5}
        ry={4}
        fill={C.GT_PATCH}
        stroke="none"
      />

      {/* Head */}
      <circle
        cx={headCX}
        cy={headCY}
        r={headR}
        fill={C.GT_BODY}
        stroke={C.GT_DARK}
        strokeWidth={1.5}
      />

      {/* Horns */}
      <line
        x1={headCX - 3}
        y1={hornBaseY}
        x2={headCX - 5}
        y2={hornBaseY - hornH}
        stroke={C.GT_HORN}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <line
        x1={headCX + 2}
        y1={hornBaseY}
        x2={headCX + 1}
        y2={hornBaseY - hornH}
        stroke={C.GT_HORN}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Eye */}
      <circle cx={headCX + 3} cy={headCY - 1} r={1.5} fill={C.GT_DARK} />

      {/* Nose */}
      <ellipse cx={headCX + headR - 1} cy={headCY + 2} rx={3} ry={2} fill={C.GT_NOSE} stroke={C.GT_DARK} strokeWidth={0.5} />

      {/* Beard */}
      <ellipse
        cx={beardCX}
        cy={beardCY}
        rx={2.5}
        ry={4}
        fill={C.GT_BODY}
        stroke={C.GT_DARK}
        strokeWidth={1}
      />

      {/* 4 legs */}
      {legXs.map((lx, i) => (
        <g key={i}>
          <line
            x1={lx}
            y1={legTopY}
            x2={lx}
            y2={legBotY - 2}
            stroke={C.GT_DARK}
            strokeWidth={legW}
            strokeLinecap="round"
          />
          {/* hoof */}
          <line
            x1={lx - 2}
            y1={legBotY - 1}
            x2={lx + 2}
            y2={legBotY - 1}
            stroke={C.GT_HORN}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </g>
      ))}
    </g>
  )
}

// ── Default export ─────────────────────────────────────────────────────────────

/**
 * FarmOstrichGoat20A6Illustration
 *
 * Static stem figure for SEAMO-20-A-Q6.
 * Shows: 3 ostriches (2-legged) on the left and 3 goats (4-legged) on
 * the right, on a ground strip.
 * Labels: "10 burung unta & kambing" total, "32 kaki" total.
 * The answer (6 goats) is NOT shown.
 */
export default function FarmOstrichGoat20A6Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Tiga ekor burung unta (2 kaki) dan tiga ekor kambing (4 kaki) berdiri di atas tanah. Label menunjukkan 10 hewan dan 32 kaki."
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

        {/* divider between animal groups */}
        <line x1={184} y1={GROUND_Y - 60} x2={184} y2={GROUND_Y} stroke="#CBD5E1" strokeWidth={1} strokeDasharray="4,3" />

        {/* ostriches */}
        {OSTRICH_CXS.map((cx, i) => (
          <OstrichGlyph key={i} cx={cx} baseY={OSTRICH_BASE_Y} />
        ))}

        {/* goats */}
        {GOAT_CXS.map((cx, i) => (
          <GoatGlyph key={i} cx={cx} baseY={GOAT_BASE_Y} />
        ))}

        {/* leg count labels above animals */}
        <text
          x={OSTRICH_CXS[1]}
          y={GROUND_Y - 62}
          textAnchor="middle"
          fontSize={8}
          fill={C.OB_NECK}
          fontWeight={700}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          2 kaki
        </text>
        <text
          x={GOAT_CXS[1]}
          y={GROUND_Y - 62}
          textAnchor="middle"
          fontSize={8}
          fill={C.GT_DARK}
          fontWeight={700}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          4 kaki
        </text>

        {/* question mark banner */}
        <text
          x={SVG_W / 2}
          y={12}
          textAnchor="middle"
          dominantBaseline="hanging"
          fontSize={12}
          fontWeight={900}
          fill={C.QUESTION_CLR}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          ? kambing
        </text>

        {/* ── Bottom info bar ─────────────────────────────────────── */}

        {/* total animals badge */}
        <rect x={4} y={GROUND_Y + 4} width={162} height={24} rx={6} fill={C.LABEL_BG} stroke="#D97706" strokeWidth={1} />
        <text
          x={85}
          y={GROUND_Y + 20}
          textAnchor="middle"
          fontSize={9.5}
          fontWeight={700}
          fill={C.LABEL_TEXT}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          10 burung unta &amp; kambing
        </text>

        {/* total legs badge */}
        <rect x={172} y={GROUND_Y + 4} width={106} height={24} rx={6} fill={C.TOTAL_BG} stroke="#16A34A" strokeWidth={1} />
        <text
          x={225}
          y={GROUND_Y + 20}
          textAnchor="middle"
          fontSize={9.5}
          fontWeight={700}
          fill={C.TOTAL_TEXT}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          32 kaki total
        </text>
      </svg>
    </div>
  )
}
