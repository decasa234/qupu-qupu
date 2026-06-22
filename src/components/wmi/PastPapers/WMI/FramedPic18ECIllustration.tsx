// IKMC-19-EC-Q18 — "Anna used 32 small white squares to frame a 7 by 7 picture."
//
// PROBLEM ONLY: shows the static figure the student sees in the paper:
//   - a 7×7 inner picture area (drawn as a scene with colour)
//   - a 1-square-wide border of small white squares around it (the 32-square frame)
//   - the total outer grid is 9×9
//
// Does NOT show:
//   - the formula 4(n+2)−4
//   - the answer (44 squares for a 10×10 picture)
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.
//
// Pool reuse: adapts the square-grid primitive pattern from CalcGrid8ECIllustration
// (grid cell sizing, PAD, cx/cy helpers), and the overall container style from
// PinnedPhotos9ECIllustration (flex-justify-center wrapper + role="img").

// ── Layout constants (re-exported so the explainer can overlay in the same coords) ──

/** Side length of each small square in the grid (px). */
export const CELL = 28

/** Outer padding. */
export const PAD = 8

/** Number of cells in the inner picture (n×n). */
export const INNER_N = 7

/** Total outer grid dimension = INNER_N + 2 (one border cell each side). */
export const OUTER_N = INNER_N + 2  // 9

/** Full SVG width = PAD*2 + OUTER_N * CELL. */
export const SVG_W = PAD * 2 + OUTER_N * CELL   // 268

/** Full SVG height (same as width — square grid). */
export const SVG_H = SVG_W   // 268

// ── Colour tokens ────────────────────────────────────────────────────────────

export const COLOR = {
  /** White frame squares fill. */
  FRAME_FILL:   '#FFFFFF',
  /** Frame square border. */
  FRAME_STROKE: '#374151',
  /** Grid line weight for frame cells. */
  FRAME_SW:     1.5,
  /** Inner picture light-blue sky fill. */
  SKY:          '#BAE6FD',
  /** Inner picture ground fill. */
  GROUND:       '#D4B896',
  /** Inner picture general midground. */
  GRASS:        '#86EFAC',
  /** Inner picture body/scene stroke. */
  SCENE_INK:    '#1F2937',
} as const

// ── Coordinate helpers ────────────────────────────────────────────────────────

/** Left edge of column `c` (0-indexed in the 9×9 outer grid). */
const gx = (c: number) => PAD + c * CELL
/** Top edge of row `r` (0-indexed in the 9×9 outer grid). */
const gy = (r: number) => PAD + r * CELL

/** Y coordinate of the bottom edge of the outer grid (used by explainer). */
export const OUTER_BOTTOM_Y = PAD + OUTER_N * CELL

// ── FrameGrid primitive (co-exported for explainer reuse) ───────────────────

export interface FrameGridProps {
  /**
   * Highlight a specific border square at (row, col) in the outer 9×9 grid.
   * row and col are 0-indexed. null = no highlight.
   */
  highlight?: { r: number; c: number } | null
  /** Tint colour for highlighted border cells. */
  highlightFill?: string
  /** Show count label on highlighted side (e.g. "9 squares"). */
  sideLabel?: string | null
}

/**
 * The shared framed-picture primitive.
 *
 * Outer 9×9 grid: border cells (the frame) are drawn as small white squares
 * with a visible stroke. The inner 7×7 region is drawn as a simple
 * child-like scene (sky, ground, grass) — showing the "picture" that is
 * being framed.
 */
export function FrameGrid({ highlight = null, highlightFill = '#FDE68A', sideLabel = null }: FrameGridProps) {
  // ── Inner picture area (skip border row/col = outer indices 1–7) ──────────
  const innerX = gx(1)
  const innerY = gy(1)
  const innerW = INNER_N * CELL
  const innerH = INNER_N * CELL

  // ── Sky occupies top ~55% of inner picture ────────────────────────────────
  const skyH = Math.round(innerH * 0.55)
  // ── Ground (dirt) occupies bottom ~20% ───────────────────────────────────
  const groundH = Math.round(innerH * 0.20)
  // ── Grass strip between sky and ground ───────────────────────────────────
  const grassH = innerH - skyH - groundH

  // ── Sun in sky (top-left) ─────────────────────────────────────────────────
  const sunCx = innerX + CELL * 1.3
  const sunCy = innerY + CELL * 1.2

  // ── Simple house (right side of picture) ─────────────────────────────────
  const houseX = innerX + CELL * 4.6
  const houseY = innerY + skyH - CELL * 1.6
  const houseW = CELL * 2
  const houseH = CELL * 1.9

  // ── Stick figure (centre of picture) ─────────────────────────────────────
  const figX = innerX + CELL * 2.8
  const figBaseY = innerY + skyH + grassH  // ground line

  // ── Border cells: iterate all cells on outer ring ────────────────────────
  const frameCells: JSX.Element[] = []
  for (let r = 0; r < OUTER_N; r++) {
    for (let c = 0; c < OUTER_N; c++) {
      const isBorder = r === 0 || r === OUTER_N - 1 || c === 0 || c === OUTER_N - 1
      if (!isBorder) continue
      const isHi = highlight != null && highlight.r === r && highlight.c === c
      frameCells.push(
        <rect
          key={`f${r}_${c}`}
          x={gx(c)}
          y={gy(r)}
          width={CELL}
          height={CELL}
          fill={isHi ? highlightFill : COLOR.FRAME_FILL}
          stroke={isHi ? '#D97706' : COLOR.FRAME_STROKE}
          strokeWidth={isHi ? 2.5 : COLOR.FRAME_SW}
        />,
      )
    }
  }

  return (
    <g>
      {/* ── Inner picture background ── */}
      {/* sky */}
      <rect x={innerX} y={innerY} width={innerW} height={skyH} fill={COLOR.SKY} />
      {/* grass strip */}
      <rect x={innerX} y={innerY + skyH} width={innerW} height={grassH} fill={COLOR.GRASS} />
      {/* ground */}
      <rect x={innerX} y={innerY + skyH + grassH} width={innerW} height={groundH} fill={COLOR.GROUND} />

      {/* ── Scene details ── */}

      {/* sun circle + rays */}
      <circle cx={sunCx} cy={sunCy} r={CELL * 0.38} fill="#FDE68A" stroke="#D97706" strokeWidth={1.5} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180
        const r0 = CELL * 0.44
        const r1 = CELL * 0.60
        return (
          <line
            key={`ray${deg}`}
            x1={sunCx + Math.cos(rad) * r0}
            y1={sunCy + Math.sin(rad) * r0}
            x2={sunCx + Math.cos(rad) * r1}
            y2={sunCy + Math.sin(rad) * r1}
            stroke="#D97706"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        )
      })}

      {/* house: body + roof */}
      <rect x={houseX} y={houseY + CELL * 0.55} width={houseW} height={houseH - CELL * 0.55}
        fill="#FEF3C7" stroke={COLOR.SCENE_INK} strokeWidth={1.5} />
      {/* roof triangle */}
      <polygon
        points={`${houseX},${houseY + CELL * 0.55} ${houseX + houseW / 2},${houseY} ${houseX + houseW},${houseY + CELL * 0.55}`}
        fill="#F87171" stroke={COLOR.SCENE_INK} strokeWidth={1.5}
      />
      {/* door */}
      <rect
        x={houseX + houseW * 0.35} y={houseY + houseH - CELL * 0.65}
        width={houseW * 0.3} height={CELL * 0.65}
        fill="#A78BFA" stroke={COLOR.SCENE_INK} strokeWidth={1}
      />

      {/* stick figure */}
      {/* head */}
      <circle cx={figX} cy={figBaseY - CELL * 1.65} r={CELL * 0.25} fill="#FDBA74" stroke={COLOR.SCENE_INK} strokeWidth={1.5} />
      {/* body */}
      <line x1={figX} y1={figBaseY - CELL * 1.4} x2={figX} y2={figBaseY - CELL * 0.7}
        stroke={COLOR.SCENE_INK} strokeWidth={1.5} strokeLinecap="round" />
      {/* arms */}
      <line x1={figX - CELL * 0.25} y1={figBaseY - CELL * 1.2} x2={figX + CELL * 0.25} y2={figBaseY - CELL * 1.0}
        stroke={COLOR.SCENE_INK} strokeWidth={1.5} strokeLinecap="round" />
      {/* legs */}
      <line x1={figX} y1={figBaseY - CELL * 0.7} x2={figX - CELL * 0.2} y2={figBaseY}
        stroke={COLOR.SCENE_INK} strokeWidth={1.5} strokeLinecap="round" />
      <line x1={figX} y1={figBaseY - CELL * 0.7} x2={figX + CELL * 0.2} y2={figBaseY}
        stroke={COLOR.SCENE_INK} strokeWidth={1.5} strokeLinecap="round" />

      {/* ── Frame (border) cells drawn on top ── */}
      {frameCells}

      {/* ── Optional side label ── */}
      {sideLabel != null && (
        <text
          x={SVG_W / 2}
          y={gy(OUTER_N) + 14}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={800}
          fill="#374151"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {sideLabel}
        </text>
      )}
    </g>
  )
}

// ── Default export: static stem illustration (no formula, no answer) ─────────

/**
 * FramedPic18ECIllustration
 *
 * Static, problem-only figure for IKMC-19-EC-Q18.
 * Shows a 7×7 picture framed by 32 small white squares (outer 9×9 grid).
 * Does NOT reveal the formula or the 10×10 answer.
 */
export default function FramedPic18ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Gambar berukuran 7 kali 7 dibingkai oleh kotak-kotak kecil putih, ' +
        'membentuk grid luar 9 kali 9. Tepi berisi 32 kotak putih kecil. ' +
        'Anna menggunakan 32 kotak kecil putih untuk membingkai gambar 7×7 ini.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(320, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* The framed picture */}
        <FrameGrid />
      </svg>
    </div>
  )
}
