// IKMC-23-EC-Q17 — "6 beavers and 2 kangaroos in a line; every window of 3 has exactly 1 kangaroo"
//
// STEM ILLUSTRATION ONLY — shows the problem: 8 numbered circles (animals) in a line.
// Does NOT reveal which positions are kangaroos or the answer (C = position 3).
//
// Source: OCR 2023.imgs/048.jpg — 8 light-grey circles numbered 1–8 in a row.
//
// Adapted from ChildrenLine7PEIllustration (same "N items in a row" primitive).
//
// Co-exports (reused by AnimalLine17ECExplainer):
//   AnimalGlyph      — draws one circle-framed numbered animal (beaver or kangaroo)
//   SVG_W / SVG_H   — canvas dimensions
//   ANIMAL_CX        — x-centres for the 8 positions
//   GROUND_Y         — baseline y
//   COLOR            — palette
//   KANGAROO_POS     — set of 0-based indices that are kangaroos {2, 5}
//
// Pure SVG, no Math.random, no Date, SSR-safe & deterministic.

// ── layout constants ──────────────────────────────────────────────────────────

export const SVG_W = 480
export const SVG_H = 120

/** Y of the ground line (bottom of the animal circles). */
export const GROUND_Y = 95

/** Radius of each animal circle. */
export const R = 20

/** X centres of the 8 animals (even spacing with small left/right margin). */
export const ANIMAL_CX: number[] = Array.from({ length: 8 }, (_, i) => 34 + i * 58)

/**
 * 0-based indices of the two kangaroo positions (3rd and 6th positions).
 * Positions 3 & 6 (1-indexed) satisfy every window of 3 consecutive animals.
 */
export const KANGAROO_POS: ReadonlySet<number> = new Set([2, 5]) // 0-based: positions 3 & 6

// ── colour tokens ─────────────────────────────────────────────────────────────

export const COLOR = {
  BG: '#FFFFFF',
  CIRCLE_FILL: '#E5E7EB',      // light grey (faithful to the OCR source)
  CIRCLE_STROKE: '#6B7280',
  CIRCLE_STROKE_KANGAROO: '#7C3AED',  // violet ring for kangaroos (explainer only)
  BEAVER_BODY: '#92400E',      // brown
  BEAVER_STROKE: '#451A03',
  KANGAROO_BODY: '#6D28D9',    // purple
  KANGAROO_STROKE: '#3B0764',
  NUMBER: '#111827',
  NUMBER_KANGAROO: '#7C3AED',
  GROUND: '#D4B896',
  GROUND_LINE: '#8B6914',
} as const

// ── BeaverGlyph — single-codepoint glyph approach ────────────────────────────

/** Small beaver icon drawn with plain paths inside a bounding box. */
export function BeaverGlyph({ cx, cy }: { cx: number; cy: number }) {
  const r = 10
  // Body: rounded rect; head: circle above; flat tail at bottom
  return (
    <g>
      {/* tail (flat paddle below body) */}
      <ellipse
        cx={cx}
        cy={cy + r + 4}
        rx={9}
        ry={4}
        fill={COLOR.BEAVER_BODY}
        stroke={COLOR.BEAVER_STROKE}
        strokeWidth={0.8}
      />
      {/* body */}
      <ellipse
        cx={cx}
        cy={cy + 2}
        rx={8}
        ry={9}
        fill={COLOR.BEAVER_BODY}
        stroke={COLOR.BEAVER_STROKE}
        strokeWidth={0.8}
      />
      {/* head */}
      <circle
        cx={cx}
        cy={cy - 7}
        r={6}
        fill={COLOR.BEAVER_BODY}
        stroke={COLOR.BEAVER_STROKE}
        strokeWidth={0.8}
      />
      {/* eye */}
      <circle cx={cx + 2} cy={cy - 8} r={1.2} fill="#111827" />
      {/* buck tooth */}
      <rect
        x={cx - 1.5}
        y={cy - 4}
        width={3}
        height={2.5}
        rx={0.5}
        fill="#FEFCE8"
        stroke="#92400E"
        strokeWidth={0.5}
      />
    </g>
  )
}

// ── KangarooGlyph ─────────────────────────────────────────────────────────────

/** Small kangaroo icon — upright body, short ears, tail. */
export function KangarooGlyph({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {/* tail */}
      <path
        d={`M ${cx + 4} ${cy + 10} Q ${cx + 12} ${cy + 14} ${cx + 10} ${cy + 4}`}
        fill="none"
        stroke={COLOR.KANGAROO_BODY}
        strokeWidth={3}
        strokeLinecap="round"
      />
      {/* body */}
      <ellipse
        cx={cx}
        cy={cy + 4}
        rx={7}
        ry={9}
        fill={COLOR.KANGAROO_BODY}
        stroke={COLOR.KANGAROO_STROKE}
        strokeWidth={0.8}
      />
      {/* head */}
      <ellipse
        cx={cx - 1}
        cy={cy - 7}
        rx={5}
        ry={6}
        fill={COLOR.KANGAROO_BODY}
        stroke={COLOR.KANGAROO_STROKE}
        strokeWidth={0.8}
      />
      {/* ears */}
      <ellipse cx={cx - 4} cy={cy - 13} rx={2} ry={3.5} fill={COLOR.KANGAROO_BODY} stroke={COLOR.KANGAROO_STROKE} strokeWidth={0.6} />
      <ellipse cx={cx + 2} cy={cy - 13} rx={2} ry={3.5} fill={COLOR.KANGAROO_BODY} stroke={COLOR.KANGAROO_STROKE} strokeWidth={0.6} />
      {/* eye */}
      <circle cx={cx + 1} cy={cy - 7} r={1.2} fill="#111827" />
    </g>
  )
}

// ── AnimalGlyph — one numbered circle ─────────────────────────────────────────

export interface AnimalGlyphProps {
  /** 0-based index (0 = position 1). */
  index: number
  /** True when this circle should be rendered as a kangaroo. */
  isKangaroo: boolean
  /** Override circle stroke colour (for the explainer highlights). */
  strokeOverride?: string
}

/**
 * Draws one circle with a position number (1-based) and an animal glyph inside.
 * In the STEM illustration, all animals look the same type (beaver)
 * to avoid revealing the answer. The explainer passes `isKangaroo` to reveal.
 */
export function AnimalGlyph({ index, isKangaroo, strokeOverride }: AnimalGlyphProps) {
  const cx = ANIMAL_CX[index]
  const cy = GROUND_Y - R - 4
  const label = String(index + 1)

  return (
    <g>
      {/* circle frame */}
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill={COLOR.CIRCLE_FILL}
        stroke={strokeOverride ?? COLOR.CIRCLE_STROKE}
        strokeWidth={strokeOverride ? 2.5 : 1.5}
      />

      {/* animal glyph — scaled to fit inside the circle */}
      <g transform={`translate(${cx},${cy - 2}) scale(0.72)`}>
        {isKangaroo ? (
          <KangarooGlyph cx={0} cy={0} />
        ) : (
          <BeaverGlyph cx={0} cy={0} />
        )}
      </g>

      {/* position number below the circle */}
      <text
        x={cx}
        y={GROUND_Y + 4}
        textAnchor="middle"
        dominantBaseline="hanging"
        fontSize={10}
        fontWeight={700}
        fill={COLOR.NUMBER}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────────

/**
 * AnimalLine17ECIllustration
 *
 * Stem figure for IKMC-23-EC-Q17.
 * Shows 8 numbered circles (animals) in a line, faithful to OCR 2023.imgs/048.jpg.
 * All animals are rendered as beavers — the kangaroo positions are NOT revealed.
 */
export default function AnimalLine17ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        '8 hewan berurutan dalam satu barisan, masing-masing diberi nomor 1 sampai 8.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(520, SVG_W)}
        style={{ display: 'block', maxWidth: '100%' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

        {/* animals — all shown as beavers in the stem */}
        {ANIMAL_CX.map((_, i) => (
          <AnimalGlyph key={i} index={i} isKangaroo={false} />
        ))}
      </svg>
    </div>
  )
}
