/**
 * SASMO-19-G3-Q9 — Balloon-weight equivalence (balloon gondola figure)
 *
 * SOURCE: OCR g3/2019-2020.imgs/011.jpg
 * Three gondola panels side-by-side:
 *   Panel 1 (left):   11 balloons — dog + cat + dog + sheep
 *   Panel 2 (middle):  5 balloons — cat + sheep
 *   Panel 3 (right):   ? balloons — sheep + cat + dog
 *
 * BalanceScale primitive checked (IMPORT-FIRST) — does not fit (three separate
 * gondola panels, not a two-pan scale). Balloon glyph imported from glyphs;
 * cluster bodies drawn inline so strings converge naturally.
 *
 * SSR-safe: no hooks, no framer-motion, no Math.random, no Date.
 */

import { Balloon } from './primitives/glyphs'

// ── layout ────────────────────────────────────────────────────────────────────

export const SVG_W = 540
export const SVG_H = 220

/** X-centres of the three gondola panels. */
export const PANEL_CX = [90, 270, 450] as const

// Gondola geometry
const G_TOP_Y   = 130   // top-bar top edge
const G_BOT_Y   = 198   // bottom of gondola
const G_TOP_HW  = 42    // half-width at top
const G_BOT_HW  = 28    // half-width at bottom
const G_RIM_H   = 8     // top rim bar height

const G_FILL   = '#E65C00'
const G_DARK   = '#C44400'
const G_RIM    = '#FF9040'
const G_BUMP   = '#CC4800'   // bottom bumper circles

// Balloon body palette (deterministic)
const BP = ['#E63946', '#F4A261', '#2A9D8F', '#457B9D', '#E9C46A', '#C77DFF'] as const

// Animal chip styles
interface AnimalStyle { fill: string; stroke: string; shortLabel: string; fullLabel_id: string }
const AP: Record<string, AnimalStyle> = {
  S: { fill: '#F2EAD3', stroke: '#8B7540', shortLabel: 'S', fullLabel_id: 'Domba' },
  C: { fill: '#D4916A', stroke: '#7B4A2F', shortLabel: 'C', fullLabel_id: 'Kucing' },
  D: { fill: '#8B5E3C', stroke: '#4A2E16', shortLabel: 'D', fullLabel_id: 'Anjing' },
}

// Animals per panel
const PANEL_ANIMALS: readonly string[][] = [
  ['D', 'C', 'D', 'S'],  // panel 0 — 2 dogs, 1 cat, 1 sheep
  ['C', 'S'],             // panel 1 — cat + sheep
  ['S', 'C', 'D'],        // panel 2 — sheep + cat + dog (the question)
]

// ── balloon cluster offsets (relative to panel cx, absolute y) ───────────────
// Panel 0: 11 balloons (4-4-3 rows)
const B11: [number, number][] = [
  [-13.5,18], [-4.5,18], [4.5,18], [13.5,18],
  [-13.5,40], [-4.5,40], [4.5,40], [13.5,40],
  [-9,62],    [0,62],    [9,62],
]

// Panel 1: 5 balloons (3-2 rows)
const B5: [number, number][] = [
  [-9,38], [0,38], [9,38],
  [-4.5,58], [4.5,58],
]

// ── sub-components ────────────────────────────────────────────────────────────

interface GondolaProps {
  cx: number
  /** Highlight border color (explainer use) */
  highlight?: string
  /** Animals to display inside */
  animals: readonly string[]
  /** Show full labels (right panel only) */
  fullLabels?: boolean
  /** Override top count display */
  topLabel?: string | number
  /** Whether to show a "?" above the basket */
  question?: boolean
}

/**
 * BalloonGondola — one gondola panel (balloon cluster + basket + animals).
 * Exported for the Explainer.
 */
export function BalloonGondola({
  cx, highlight, animals, fullLabels, topLabel, question,
}: GondolaProps) {
  const offsets = topLabel === 11 ? B11 : topLabel === 5 ? B5 : []
  const bRadius = 9        // balloon oval rx
  const bRadiusY = 10.5   // balloon oval ry
  const convY = G_TOP_Y - 2  // string convergence y (just above gondola top)

  return (
    <g>
      {/* ── balloon bodies ────────────────────────────────────────────────── */}
      {!question && offsets.map(([dx, dy], i) => (
        <g key={i}>
          {/* body */}
          <ellipse
            cx={cx + dx}
            cy={dy}
            rx={bRadius}
            ry={bRadiusY}
            fill={BP[i % BP.length]}
          />
          {/* shine */}
          <ellipse
            cx={cx + dx - bRadius * 0.28}
            cy={dy - bRadiusY * 0.3}
            rx={bRadius * 0.35}
            ry={bRadiusY * 0.25}
            fill="rgba(255,255,255,0.38)"
          />
        </g>
      ))}

      {/* ── converging strings ───────────────────────────────────────────── */}
      {!question && offsets.map(([dx, dy], i) => (
        <line
          key={`str-${i}`}
          x1={cx + dx}
          y1={dy + bRadiusY + 1}
          x2={cx}
          y2={convY}
          stroke="#9CA3AF"
          strokeWidth={0.7}
          strokeLinecap="round"
          opacity={0.6}
        />
      ))}

      {/* ── question mark cluster ────────────────────────────────────────── */}
      {question && (
        <text
          x={cx}
          y={70}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={54}
          fontWeight={900}
          fill="#374151"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          ?
        </text>
      )}

      {/* ── gondola top rim bar ──────────────────────────────────────────── */}
      <rect
        x={cx - G_TOP_HW - 2}
        y={G_TOP_Y}
        width={(G_TOP_HW + 2) * 2}
        height={G_RIM_H}
        rx={3}
        fill={highlight ?? G_DARK}
      />

      {/* ── gondola body trapezoid ───────────────────────────────────────── */}
      <path
        d={[
          `M ${cx - G_TOP_HW} ${G_TOP_Y + G_RIM_H}`,
          `L ${cx + G_TOP_HW} ${G_TOP_Y + G_RIM_H}`,
          `L ${cx + G_BOT_HW} ${G_BOT_Y}`,
          `L ${cx - G_BOT_HW} ${G_BOT_Y}`,
          'Z',
        ].join(' ')}
        fill={highlight ? '#FFF7ED' : G_FILL}
        stroke={highlight ?? G_DARK}
        strokeWidth={highlight ? 2.5 : 0}
      />

      {/* inner shading */}
      <path
        d={[
          `M ${cx - G_TOP_HW} ${G_TOP_Y + G_RIM_H}`,
          `L ${cx + G_TOP_HW} ${G_TOP_Y + G_RIM_H}`,
          `L ${cx + G_BOT_HW} ${G_BOT_Y}`,
          `L ${cx - G_BOT_HW} ${G_BOT_Y}`,
          'Z',
        ].join(' ')}
        fill="rgba(0,0,0,0.07)"
        style={{ pointerEvents: 'none' }}
      />

      {/* ── bottom bumper circles ─────────────────────────────────────────── */}
      <circle cx={cx - G_BOT_HW + 8} cy={G_BOT_Y - 4} r={8} fill={G_BUMP} />
      <circle cx={cx + G_BOT_HW - 8} cy={G_BOT_Y - 4} r={8} fill={G_BUMP} />

      {/* ── gondola rim top highlight ─────────────────────────────────────── */}
      <rect
        x={cx - G_TOP_HW - 2}
        y={G_TOP_Y}
        width={(G_TOP_HW + 2) * 2}
        height={G_RIM_H}
        rx={3}
        fill="none"
        stroke={G_RIM}
        strokeWidth={1}
        opacity={0.5}
      />

      {/* ── animal chips inside gondola ──────────────────────────────────── */}
      {(() => {
        const n = animals.length
        const chipR = 11
        const spacing = Math.min(22, (G_TOP_HW * 2 - 10) / (n + 0.5))
        const startX = cx - ((n - 1) * spacing) / 2
        const chipY = G_TOP_Y + G_RIM_H + (G_BOT_Y - G_TOP_Y - G_RIM_H) / 2 + 2

        return animals.map((code, i) => {
          const a = AP[code]
          const ax = startX + i * spacing
          return (
            <g key={i}>
              <circle
                cx={ax}
                cy={chipY}
                r={chipR}
                fill={a.fill}
                stroke={a.stroke}
                strokeWidth={1.5}
              />
              <text
                x={ax}
                y={chipY}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={fullLabels ? 6 : 9}
                fontWeight={800}
                fill={a.stroke}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {fullLabels ? a.fullLabel_id : a.shortLabel}
              </text>
            </g>
          )
        })
      })()}

      {/* ── count label above (non-question panels) ──────────────────────── */}
      {!question && typeof topLabel === 'number' && (
        <text
          x={cx}
          y={10}
          textAnchor="middle"
          dominantBaseline="hanging"
          fontSize={13}
          fontWeight={800}
          fill="#1F2937"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {topLabel}
        </text>
      )}
    </g>
  )
}

// ── props ─────────────────────────────────────────────────────────────────────

export interface IllustrationProps {
  /** Beat-driven highlights: 0=none, 1=panel1(middle), 2=panel0(left), 3+=all */
  highlightPanel?: 0 | 1 | 2 | 3
  /** Show the answer (8) on the right panel */
  showAnswer?: boolean
  lang?: string
}

// ── default export ────────────────────────────────────────────────────────────

export default function BalloonAnimals19G3Q9Illustration({
  highlightPanel = 0,
  showAnswer = false,
}: IllustrationProps) {
  const hlColor = '#3B82F6'  // blue highlight ring

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-label="Tiga keranjang balon: keranjang kiri (11 balon, anjing+kucing+anjing+domba), tengah (5 balon, kucing+domba), kanan (? balon, domba+kucing+anjing)"
      role="img"
    >
      {/* background */}
      <rect width={SVG_W} height={SVG_H} fill="#F0F7FF" rx={10} />

      {/* sky gradient hint */}
      <rect x={0} y={0} width={SVG_W} height={120} fill="rgba(255,255,255,0.35)" rx={10} />

      {/* panel dividers */}
      <line x1={180} y1={10} x2={180} y2={SVG_H - 10} stroke="#CBD5E1" strokeWidth={1} strokeDasharray="4 4" />
      <line x1={360} y1={10} x2={360} y2={SVG_H - 10} stroke="#CBD5E1" strokeWidth={1} strokeDasharray="4 4" />

      {/* panel 0 — 11 balloons, dog+cat+dog+sheep */}
      <BalloonGondola
        cx={PANEL_CX[0]}
        animals={PANEL_ANIMALS[0]}
        topLabel={11}
        highlight={highlightPanel === 2 ? hlColor : undefined}
      />

      {/* panel 1 — 5 balloons, cat+sheep */}
      <BalloonGondola
        cx={PANEL_CX[1]}
        animals={PANEL_ANIMALS[1]}
        topLabel={5}
        highlight={highlightPanel === 1 ? hlColor : undefined}
      />

      {/* panel 2 — ? / answer panel, sheep+cat+dog */}
      <BalloonGondola
        cx={PANEL_CX[2]}
        animals={PANEL_ANIMALS[2]}
        topLabel={showAnswer ? 8 : undefined}
        question={!showAnswer}
        fullLabels={true}
        highlight={highlightPanel === 3 ? hlColor : undefined}
      />

      {/* answer balloon using the Balloon glyph when revealed */}
      {showAnswer && (
        <Balloon cx={PANEL_CX[2]} cy={45} r={22} color="#10B981" points={8} />
      )}
    </svg>
  )
}
