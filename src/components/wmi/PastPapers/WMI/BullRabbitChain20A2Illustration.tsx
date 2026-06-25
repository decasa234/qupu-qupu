// BullRabbitChain20A2Illustration — SEAMO 2020 Paper A, Q2
//
// PROBLEM: "How many rabbits are equivalent to a bull?"
// Figure (2020.imgs/003.jpg) shows three animal-equality rows:
//   Row 1: 1 bull  =  4 white goats
//   Row 2: 1 white goat  =  2 rabbits
//   Row 3: 1 bull  =  ? (question mark)
//
// Answer D = 8 (via chain: 1 bull = 4 goats, 1 goat = 2 rabbits → 4 × 2 = 8)
//
// Seed quantities:
//   "1 bull = 4 dogs (from figure)"  — the white-goat figures
//   "1 dog = 2 rabbits (from figure)"
//   "4 × 2 = 8 rabbits"
//
// Classification: stem-only. Choices are numeric (A–E = 5,6,7,8,9); no picture options.
// SSR-safe: no hooks, no framer-motion, no Math.random, no Date.

// ── Layout ────────────────────────────────────────────────────────────────────

export const SVG_W = 340
export const SVG_H = 270

// Row y-centres
export const ROW_Y: [number, number, number] = [52, 140, 228]

// Column x-positions: left-animal, equals-sign, right-group-centre
export const COL_LEFT = 52
export const COL_EQ   = 128
export const COL_RIGHT = 220

// ── Palette ───────────────────────────────────────────────────────────────────

export const COLOR = {
  BG:             '#FFFFFF',
  DIVIDER:        '#E5E7EB',
  EQ:             '#374151',
  QUESTION:       '#7C3AED',
  BULL_BODY:      '#92350A',   // deep red-brown
  BULL_STROKE:    '#5C1A00',
  BULL_HORN:      '#F5D062',   // warm gold
  GOAT_BODY:      '#F1F5F9',   // off-white
  GOAT_STROKE:    '#94A3B8',
  GOAT_HORN:      '#CBD5E1',
  RABBIT_BODY:    '#D4A96A',   // warm tan
  RABBIT_STROKE:  '#92580A',
  RABBIT_EAR:     '#E8C9A0',
  INK:            '#1F2937',
} as const

// ── Animal glyphs ─────────────────────────────────────────────────────────────

/**
 * BullGlyph — stocky body, horns, short tail.
 * Centred at (cx, cy); designed for cy ≈ 0 being the body centre.
 */
export function BullGlyph({ cx, cy, size = 1 }: { cx: number; cy: number; size?: number }) {
  const s = size
  return (
    <g transform={`translate(${cx},${cy}) scale(${s})`}>
      {/* body */}
      <ellipse cx={0} cy={0} rx={26} ry={18}
        fill={COLOR.BULL_BODY} stroke={COLOR.BULL_STROKE} strokeWidth={1.8} />
      {/* head */}
      <ellipse cx={-30} cy={-6} rx={14} ry={12}
        fill={COLOR.BULL_BODY} stroke={COLOR.BULL_STROKE} strokeWidth={1.5} />
      {/* left horn */}
      <path d={`M -38 -14 Q -46 -24 -40 -28`}
        fill="none" stroke={COLOR.BULL_HORN} strokeWidth={3} strokeLinecap="round" />
      {/* right horn */}
      <path d={`M -24 -14 Q -18 -24 -24 -28`}
        fill="none" stroke={COLOR.BULL_HORN} strokeWidth={3} strokeLinecap="round" />
      {/* nostril */}
      <ellipse cx={-38} cy={-4} rx={4} ry={3}
        fill={COLOR.BULL_STROKE} opacity={0.4} />
      {/* eye */}
      <circle cx={-27} cy={-10} r={2} fill={COLOR.BULL_STROKE} />
      {/* 4 legs */}
      {[-16, -6, 6, 16].map((lx, i) => (
        <rect key={i} x={lx - 3} y={14} width={6} height={14} rx={2}
          fill={COLOR.BULL_BODY} stroke={COLOR.BULL_STROKE} strokeWidth={1} />
      ))}
      {/* tail */}
      <path d={`M 25 -4 Q 34 -12 30 -20`}
        fill="none" stroke={COLOR.BULL_STROKE} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  )
}

/**
 * GoatGlyph — slender white body, short horns.
 * Smaller than the bull; centred at (cx, cy).
 */
export function GoatGlyph({ cx, cy, size = 1 }: { cx: number; cy: number; size?: number }) {
  const s = size
  return (
    <g transform={`translate(${cx},${cy}) scale(${s})`}>
      {/* body */}
      <ellipse cx={0} cy={0} rx={18} ry={12}
        fill={COLOR.GOAT_BODY} stroke={COLOR.GOAT_STROKE} strokeWidth={1.5} />
      {/* head */}
      <ellipse cx={-20} cy={-4} rx={10} ry={9}
        fill={COLOR.GOAT_BODY} stroke={COLOR.GOAT_STROKE} strokeWidth={1.2} />
      {/* horns */}
      <path d={`M -26 -10 Q -30 -18 -26 -20`}
        fill="none" stroke={COLOR.GOAT_HORN} strokeWidth={2} strokeLinecap="round" />
      <path d={`M -16 -10 Q -14 -18 -18 -20`}
        fill="none" stroke={COLOR.GOAT_HORN} strokeWidth={2} strokeLinecap="round" />
      {/* eye */}
      <circle cx={-18} cy={-5} r={1.5} fill={COLOR.GOAT_STROKE} />
      {/* 4 legs */}
      {[-10, -4, 4, 10].map((lx, i) => (
        <rect key={i} x={lx - 2} y={10} width={4} height={11} rx={1.5}
          fill={COLOR.GOAT_BODY} stroke={COLOR.GOAT_STROKE} strokeWidth={1} />
      ))}
      {/* tail */}
      <path d={`M 17 -2 Q 22 -8 20 -14`}
        fill="none" stroke={COLOR.GOAT_STROKE} strokeWidth={2} strokeLinecap="round" />
    </g>
  )
}

/**
 * RabbitGlyph — rounded body, tall ears, short tail.
 * Centred at (cx, cy).
 */
export function RabbitGlyph({ cx, cy, size = 1 }: { cx: number; cy: number; size?: number }) {
  const s = size
  return (
    <g transform={`translate(${cx},${cy}) scale(${s})`}>
      {/* ear left */}
      <ellipse cx={-5} cy={-20} rx={3.5} ry={9}
        fill={COLOR.RABBIT_EAR} stroke={COLOR.RABBIT_STROKE} strokeWidth={1} />
      {/* ear right */}
      <ellipse cx={3} cy={-20} rx={3.5} ry={9}
        fill={COLOR.RABBIT_EAR} stroke={COLOR.RABBIT_STROKE} strokeWidth={1} />
      {/* head */}
      <ellipse cx={0} cy={-8} rx={9} ry={8}
        fill={COLOR.RABBIT_BODY} stroke={COLOR.RABBIT_STROKE} strokeWidth={1.2} />
      {/* body */}
      <ellipse cx={0} cy={6} rx={11} ry={10}
        fill={COLOR.RABBIT_BODY} stroke={COLOR.RABBIT_STROKE} strokeWidth={1.5} />
      {/* eye */}
      <circle cx={-3} cy={-9} r={1.5} fill={COLOR.RABBIT_STROKE} />
      {/* nose */}
      <circle cx={-6} cy={-5} r={1} fill="#D97706" />
      {/* tail */}
      <circle cx={8} cy={10} r={3.5}
        fill={COLOR.RABBIT_EAR} stroke={COLOR.RABBIT_STROKE} strokeWidth={0.8} />
      {/* 2 feet */}
      <ellipse cx={-4} cy={16} rx={5} ry={3}
        fill={COLOR.RABBIT_BODY} stroke={COLOR.RABBIT_STROKE} strokeWidth={1} />
      <ellipse cx={4} cy={16} rx={5} ry={3}
        fill={COLOR.RABBIT_BODY} stroke={COLOR.RABBIT_STROKE} strokeWidth={1} />
    </g>
  )
}

// ── Row renderers ──────────────────────────────────────────────────────────────

/** One animal equal-sign row.
 *  left: glyph (already positioned), count+glyph on right, or "?" for last row. */

/** Row 1: 1 bull = 4 goats */
function Row1({ dimRight = false }: { dimRight?: boolean }) {
  const ry = ROW_Y[0]
  // Goat spacing: 4 goats fit in width ~(COL_RIGHT to COL_RIGHT+110)
  const goatXs = [-34, -12, 10, 32]
  return (
    <g>
      <BullGlyph cx={COL_LEFT} cy={ry} />
      <text x={COL_EQ} y={ry + 1} textAnchor="middle" dominantBaseline="central"
        fontSize={22} fontWeight={900} fill={COLOR.EQ}>=</text>
      <g opacity={dimRight ? 0.3 : 1}>
        {goatXs.map((dx, i) => (
          <GoatGlyph key={i} cx={COL_RIGHT + dx} cy={ry} size={0.9} />
        ))}
      </g>
    </g>
  )
}

/** Row 2: 1 goat = 2 rabbits */
function Row2({ dimRight = false }: { dimRight?: boolean }) {
  const ry = ROW_Y[1]
  const rabbitXs = [-18, 18]
  return (
    <g>
      <GoatGlyph cx={COL_LEFT} cy={ry} />
      <text x={COL_EQ} y={ry + 1} textAnchor="middle" dominantBaseline="central"
        fontSize={22} fontWeight={900} fill={COLOR.EQ}>=</text>
      <g opacity={dimRight ? 0.3 : 1}>
        {rabbitXs.map((dx, i) => (
          <RabbitGlyph key={i} cx={COL_RIGHT + dx} cy={ry} size={0.9} />
        ))}
      </g>
    </g>
  )
}

/** Row 3: 1 bull = ? rabbit(s) — show answer ghost on right */
function Row3({ revealCount }: { revealCount?: number }) {
  const ry = ROW_Y[2]
  return (
    <g>
      <BullGlyph cx={COL_LEFT} cy={ry} />
      <text x={COL_EQ} y={ry + 1} textAnchor="middle" dominantBaseline="central"
        fontSize={22} fontWeight={900} fill={COLOR.EQ}>=</text>
      {revealCount !== undefined ? (
        // Reveal: show "8" and a faint rabbit group
        <g>
          <text x={COL_RIGHT} y={ry} textAnchor="middle" dominantBaseline="central"
            fontSize={28} fontWeight={900} fill="#10B981">
            {revealCount}
          </text>
          <text x={COL_RIGHT + 36} y={ry} textAnchor="start" dominantBaseline="central"
            fontSize={13} fontWeight={700} fill="#10B981">
            rabbits
          </text>
        </g>
      ) : (
        // Stem: show "?"
        <text x={COL_RIGHT} y={ry} textAnchor="middle" dominantBaseline="central"
          fontSize={32} fontWeight={900} fill={COLOR.QUESTION}>?</text>
      )}
    </g>
  )
}

// ── Shared diagram ────────────────────────────────────────────────────────────

export interface BullRabbitDiagramProps {
  /** Which rows to dim (0-indexed). For the explainer to highlight one row at a time. */
  dimRows?: number[]
  /** When true, row 3 shows the answer (8) instead of "?". */
  revealAnswer?: boolean
}

export function BullRabbitDiagram({
  dimRows = [],
  revealAnswer = false,
}: BullRabbitDiagramProps) {
  const dim = new Set(dimRows)
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

      {/* dividers between rows */}
      {[96, 186].map((dy, i) => (
        <line key={i} x1={8} y1={dy} x2={SVG_W - 8} y2={dy}
          stroke={COLOR.DIVIDER} strokeWidth={1.5} />
      ))}

      <g opacity={dim.has(0) ? 0.3 : 1}><Row1 /></g>
      <g opacity={dim.has(1) ? 0.3 : 1}><Row2 /></g>
      <g opacity={dim.has(2) ? 0.3 : 1}>
        <Row3 revealCount={revealAnswer ? 8 : undefined} />
      </g>
    </svg>
  )
}

// ── Default export: stem illustration ────────────────────────────────────────

/**
 * BullRabbitChain20A2Illustration
 *
 * Stem figure for SEAMO 2020 Paper A, Q2.
 * Shows the three animal-equality rows from the source figure (003.jpg):
 *   Row 1: 1 bull = 4 goats
 *   Row 2: 1 goat = 2 rabbits
 *   Row 3: 1 bull = ? (question mark — answer NOT shown)
 */
export default function BullRabbitChain20A2Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Three animal-equality rows: one bull equals four goats; one goat equals two rabbits; one bull equals question mark.'
      }
    >
      <BullRabbitDiagram />
    </div>
  )
}
