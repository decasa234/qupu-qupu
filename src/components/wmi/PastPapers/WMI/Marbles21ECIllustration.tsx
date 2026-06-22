// IKMC-23-EC-Q21 — "Adam and Brenda have 9 marbles each."
//
// STEM ILLUSTRATION: 18 marbles (8 red + 10 blue) scattered inside a
// bordered rectangle, matching the printed figure (OCR: 2023.imgs/060.jpg).
//
// Shows only the problem — does NOT reveal who owns which marble,
// nor the answer (Adam has 4 blue marbles).
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── palette ──────────────────────────────────────────────────────────────────

/** Marble fill colours matching the scanned figure. */
export const RED_FILL = '#E53E3E'
export const RED_STROKE = '#9B1C1C'
export const BLUE_FILL = '#4C6EF5'
export const BLUE_STROKE = '#1E3A8A'

/** Box and text. */
export const BOX_FILL = '#F9FAFB'
export const BOX_STROKE = '#CBD5E1'
export const INK = '#1F2937'

// ── SVG viewport ─────────────────────────────────────────────────────────────

export const SVG_W = 280
export const SVG_H = 200

// ── deterministic marble positions ───────────────────────────────────────────
// Laid out manually to match the rough scatter in the original figure —
// 8 red (R) and 10 blue (B), no collision, no randomness.

export const MARBLE_R = 13

export type MarbleColour = 'red' | 'blue'

export interface MarbleDef {
  cx: number
  cy: number
  colour: MarbleColour
}

/** All 18 marble positions, deterministic. */
export const MARBLES: MarbleDef[] = [
  // row-ish top area
  { cx: 38,  cy: 38,  colour: 'blue' },
  { cx: 80,  cy: 28,  colour: 'red'  },
  { cx: 130, cy: 34,  colour: 'blue' },
  { cx: 175, cy: 25,  colour: 'blue' },
  { cx: 222, cy: 36,  colour: 'red'  },

  // upper-middle area
  { cx: 60,  cy: 72,  colour: 'red'  },
  { cx: 108, cy: 65,  colour: 'blue' },
  { cx: 155, cy: 68,  colour: 'red'  },
  { cx: 200, cy: 62,  colour: 'blue' },
  { cx: 248, cy: 55,  colour: 'blue' },

  // middle area
  { cx: 32,  cy: 108, colour: 'blue' },
  { cx: 82,  cy: 105, colour: 'red'  },
  { cx: 135, cy: 100, colour: 'blue' },
  { cx: 180, cy: 104, colour: 'red'  },
  { cx: 230, cy: 98,  colour: 'blue' },

  // lower area
  { cx: 55,  cy: 148, colour: 'blue' },
  { cx: 108, cy: 152, colour: 'red'  },
  { cx: 162, cy: 145, colour: 'blue' },
]

// ── Marble primitive ──────────────────────────────────────────────────────────

/**
 * One marble — a filled circle with a small highlight arc to give depth.
 * Exported so the explainer can reuse it for individual marble rendering.
 */
export function Marble({ cx, cy, colour }: MarbleDef) {
  const fill   = colour === 'red' ? RED_FILL   : BLUE_FILL
  const stroke = colour === 'red' ? RED_STROKE : BLUE_STROKE

  return (
    <g>
      {/* main disc */}
      <circle cx={cx} cy={cy} r={MARBLE_R} fill={fill} stroke={stroke} strokeWidth={1.5} />
      {/* small highlight — slightly off-centre top-left, no randomness */}
      <circle
        cx={cx - MARBLE_R * 0.28}
        cy={cy - MARBLE_R * 0.30}
        r={MARBLE_R * 0.22}
        fill="rgba(255,255,255,0.55)"
      />
    </g>
  )
}

// ── MarbleField primitive ─────────────────────────────────────────────────────

/**
 * All 18 marbles rendered as a scattered field inside the SVG.
 * Exported for explainer reuse.
 */
export function MarbleField({ marbles = MARBLES }: { marbles?: MarbleDef[] }) {
  return (
    <>
      {marbles.map((m, i) => (
        <Marble key={i} {...m} />
      ))}
    </>
  )
}

// ── Default export ────────────────────────────────────────────────────────────

/**
 * Marbles21ECIllustration
 *
 * Static, problem-only figure for IKMC-23-EC-Q21.
 * Shows: 8 red + 10 blue marbles scattered inside a bordered rectangle.
 * Does NOT show who owns which marble or the answer.
 */
export default function Marbles21ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Delapan belas kelereng berserakan: 8 kelereng merah dan 10 kelereng biru. ' +
        'Adam dan Brenda masing-masing memiliki 9 kelereng. ' +
        'Berapa banyak kelereng biru yang dimiliki Adam?'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(320, SVG_W)}
        style={{ display: 'block' }}
      >
        {/* background box */}
        <rect
          x={4} y={4}
          width={SVG_W - 8}
          height={SVG_H - 8}
          rx={10}
          fill={BOX_FILL}
          stroke={BOX_STROKE}
          strokeWidth={2}
        />

        {/* all 18 marbles */}
        <MarbleField />

        {/* legend strip at the bottom */}
        <rect
          x={4}
          y={SVG_H - 36}
          width={SVG_W - 8}
          height={32}
          rx={0}
          fill="rgba(249,250,251,0.92)"
          stroke={BOX_STROKE}
          strokeWidth={1}
        />
        {/* red swatch + count */}
        <circle cx={24} cy={SVG_H - 20} r={8} fill={RED_FILL} stroke={RED_STROKE} strokeWidth={1.5} />
        <text
          x={36}
          y={SVG_H - 20}
          dominantBaseline="central"
          textAnchor="start"
          fontSize={12}
          fontWeight={700}
          fill={INK}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          8
        </text>
        {/* blue swatch + count */}
        <circle cx={68} cy={SVG_H - 20} r={8} fill={BLUE_FILL} stroke={BLUE_STROKE} strokeWidth={1.5} />
        <text
          x={80}
          y={SVG_H - 20}
          dominantBaseline="central"
          textAnchor="start"
          fontSize={12}
          fontWeight={700}
          fill={INK}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          10
        </text>
        {/* total */}
        <text
          x={SVG_W - 8}
          y={SVG_H - 20}
          dominantBaseline="central"
          textAnchor="end"
          fontSize={11}
          fontWeight={600}
          fill={INK}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          total = 18
        </text>
      </svg>
    </div>
  )
}
