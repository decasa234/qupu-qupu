// IKMC-20-EC-Q18 — stem illustration only (text-option choices).
//
// "6 people each order one scoop of ice cream. They order 3 scoops of vanilla,
// 2 scoops of chocolate and 1 scoop of lemon. They top the ice creams with
// 3 cherries, 2 wafers and 1 chocolate chip. They use one topping on each
// scoop, such that no two ice creams are alike. Which of the following
// combinations is not possible?"
//
// The stem figure (docs/reference/ocr-res/ikmc/contest/ecolier/2020.imgs/047.jpg)
// shows two groups:
//   LEFT: 6 ice cream cones in a row — 3 white (vanilla), 2 dark (chocolate),
//         1 grey (lemon), each a single plain scoop atop a cross-hatched waffle cone.
//   RIGHT: the 6 toppings — 3 cherries (dark blob + stem), 2 wafer discs (circles
//          with grid), 1 chocolate chip square (solid dark square).
//
// Does NOT show: any pairing of (scoop, topping) or the answer (C).
//
// Pool reuse: cone/scoop geometry adapted from the Pieces8ECIllustration cross-hatched
// cone primitive. SVG only — no raster, no Math.random.
// Pure render — SSR-safe and deterministic.

// ── Shared palette (re-exported for explainer) ─────────────────────────────────

export const COLOR = {
  BG:              '#FFFFFF',
  CONE_FILL:       '#F5DEB3', // warm waffle tan
  CONE_STROKE:     '#7C5025', // brown outline
  CONE_GRID:       '#A0642A', // cross-hatch lines inside cone

  SCOOP_VANILLA:   '#F5F0E8', // near-white cream
  SCOOP_CHOC:      '#4A2C0A', // very dark brown
  SCOOP_LEMON:     '#C8C4B0', // medium grey-beige (light on paper)
  SCOOP_STROKE:    '#374151',

  CHERRY_BODY:     '#2D2D2D', // dark blob (appears nearly black in scan)
  CHERRY_STEM:     '#374151',
  WAFER_FILL:      '#E8DBC8', // light biscuit
  WAFER_STROKE:    '#9B7B4E',
  WAFER_GRID:      '#C9A87A',
  CHIP_FILL:       '#1F1410', // near-black chocolate square

  LABEL:           '#374151',
  LABEL_VANILLA:   '#6B4F28',
  LABEL_CHOC:      '#F5DEB3',
  LABEL_LEMON:     '#374151',
} as const

// ── SVG layout constants (re-exported so explainer can mirror the scene) ──────

/** Total SVG width. */
export const SVG_W = 320
/** Total SVG height. */
export const SVG_H = 140

/** Width of the cones group (left column). */
export const CONES_AREA_W = 200
/** X origin for the toppings group (right column). */
export const TOPPINGS_X = 210

// ── Sub-components ─────────────────────────────────────────────────────────────

/**
 * IceCreamCone — a single-scoop cone.
 *
 * cx, cy: centre of the scoop (bottom of circle).
 * scoopFill: fill colour for the scoop.
 * scoopStroke: stroke for the scoop outline.
 */
export function IceCreamCone({
  cx, cy,
  scoopFill,
  scoopStroke = COLOR.SCOOP_STROKE,
}: {
  cx: number
  cy: number
  scoopFill: string
  scoopStroke?: string
}) {
  const SCOOP_R  = 15    // scoop radius
  const CONE_H   = 36    // cone height (tip at cy + CONE_H)
  const CONE_W   = 24    // cone half-base width on each side (full base = 2*CONE_W)
  const CROSS_N  = 3     // number of cross-hatch lines in each direction

  // Scoop sits so its bottom centre touches the cone opening top
  const scoopCy = cy      // centre of scoop circle
  // Cone apex
  const apexX = cx
  const apexY = cy + SCOOP_R + CONE_H

  // Cross-hatch inside the cone:
  // The cone triangle has vertices: (cx-CONE_W, cy+SCOOP_R), (cx+CONE_W, cy+SCOOP_R), apex
  const coneTopY = cy + SCOOP_R
  const coneH    = CONE_H

  // Horizontal lines in the cone (parallel to base)
  const hLines: Array<{ x1: number; y1: number; x2: number; y2: number }> = []
  for (let i = 1; i <= CROSS_N; i++) {
    const t  = i / (CROSS_N + 1)           // fraction from top to apex
    const ly = coneTopY + t * coneH
    // Width at this y: linearly interpolates from CONE_W to 0
    const lw = CONE_W * (1 - t)
    hLines.push({ x1: cx - lw, y1: ly, x2: cx + lw, y2: ly })
  }

  // Diagonal lines — simple X grid (2 lines)
  const diagLines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [
    // top-left to apex
    { x1: cx - CONE_W * 0.5, y1: coneTopY, x2: cx, y2: apexY },
    // top-right to apex
    { x1: cx + CONE_W * 0.5, y1: coneTopY, x2: cx, y2: apexY },
  ]

  return (
    <g>
      {/* Cone body */}
      <polygon
        points={`${cx - CONE_W},${coneTopY} ${cx + CONE_W},${coneTopY} ${apexX},${apexY}`}
        fill={COLOR.CONE_FILL}
        stroke={COLOR.CONE_STROKE}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      {/* Cross-hatch */}
      {hLines.map((l, i) => (
        <line key={`h${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={COLOR.CONE_GRID} strokeWidth={0.7} />
      ))}
      {diagLines.map((l, i) => (
        <line key={`d${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={COLOR.CONE_GRID} strokeWidth={0.7} />
      ))}

      {/* Scoop */}
      <circle
        cx={cx}
        cy={scoopCy}
        r={SCOOP_R}
        fill={scoopFill}
        stroke={scoopStroke}
        strokeWidth={1.2}
      />
    </g>
  )
}

/**
 * Cherry — a dark round cherry with a curved stem (matches the paper's look).
 */
export function Cherry({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {/* stem */}
      <path
        d={`M ${cx} ${cy - 8} Q ${cx + 5} ${cy - 14} ${cx + 3} ${cy - 18}`}
        fill="none"
        stroke={COLOR.CHERRY_STEM}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      {/* berry */}
      <circle cx={cx} cy={cy - 5} r={6.5} fill={COLOR.CHERRY_BODY} />
    </g>
  )
}

/**
 * WaferDisc — a round wafer with a grid pattern (matches paper's wafer circle).
 */
export function WaferDisc({ cx, cy }: { cx: number; cy: number }) {
  const R = 9
  return (
    <g>
      <circle cx={cx} cy={cy} r={R} fill={COLOR.WAFER_FILL} stroke={COLOR.WAFER_STROKE} strokeWidth={1.2} />
      {/* 2×2 grid inside */}
      <line x1={cx - R + 2} y1={cy} x2={cx + R - 2} y2={cy} stroke={COLOR.WAFER_GRID} strokeWidth={0.8} />
      <line x1={cx} y1={cy - R + 2} x2={cx} y2={cy + R - 2} stroke={COLOR.WAFER_GRID} strokeWidth={0.8} />
    </g>
  )
}

/**
 * ChocolateChip — a small solid dark square (matches the paper's chocolate chip).
 */
export function ChocolateChip({ cx, cy }: { cx: number; cy: number }) {
  const S = 10
  return (
    <rect
      x={cx - S / 2}
      y={cy - S / 2}
      width={S}
      height={S}
      rx={1.5}
      fill={COLOR.CHIP_FILL}
    />
  )
}

// ── Default export ─────────────────────────────────────────────────────────────

/**
 * IceCream18ECIllustration
 *
 * Static stem figure for IKMC-20-EC-Q18.
 *
 * LEFT column: 6 ice cream cones in a row.
 *   Scoop colours (left to right): vanilla, vanilla, vanilla, chocolate,
 *   chocolate, lemon — matching the counts in the stem (3V, 2C, 1L).
 *
 * RIGHT column: 6 toppings.
 *   3 cherries (top row), 2 wafer discs + 1 chocolate chip (bottom row).
 *
 * Does NOT show any (scoop, topping) pairing or the answer.
 */
export default function IceCream18ECIllustration() {
  // Cone layout: 6 cones spaced evenly across CONES_AREA_W
  const CONE_SPACING = 32
  const CONES_START_X = 20
  const CONE_BASE_Y   = 54  // Y of scoop centre

  const scoopColors = [
    COLOR.SCOOP_VANILLA,
    COLOR.SCOOP_VANILLA,
    COLOR.SCOOP_VANILLA,
    COLOR.SCOOP_CHOC,
    COLOR.SCOOP_CHOC,
    COLOR.SCOOP_LEMON,
  ]

  // Toppings layout: arranged in a 2-row block on the right
  const TX = TOPPINGS_X
  const CHERRY_Y    = 38
  const TOPPING2_Y  = 80

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Enam scoop es krim: 3 vanila (putih), 2 cokelat (gelap), 1 lemon (abu-abu), ' +
        'masing-masing di atas kerucut wafel. ' +
        'Di sebelah kanan: 3 ceri, 2 wafer (lingkaran bergaris), dan 1 kepingan cokelat (kotak gelap). ' +
        'Setiap scoop mendapat satu topping, tidak ada dua es krim yang sama.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(320, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

        {/* ── Ice cream cones (left) ── */}
        {scoopColors.map((fill, i) => (
          <IceCreamCone
            key={i}
            cx={CONES_START_X + i * CONE_SPACING}
            cy={CONE_BASE_Y}
            scoopFill={fill}
          />
        ))}

        {/* ── Toppings (right) ── */}

        {/* 3 cherries — top row */}
        <Cherry cx={TX + 14}  cy={CHERRY_Y} />
        <Cherry cx={TX + 40}  cy={CHERRY_Y} />
        <Cherry cx={TX + 66}  cy={CHERRY_Y} />

        {/* 2 wafer discs — bottom row, left */}
        <WaferDisc cx={TX + 14}  cy={TOPPING2_Y} />
        <WaferDisc cx={TX + 40}  cy={TOPPING2_Y} />

        {/* 1 chocolate chip square — bottom row, right */}
        <ChocolateChip cx={TX + 68} cy={TOPPING2_Y} />
      </svg>
    </div>
  )
}
