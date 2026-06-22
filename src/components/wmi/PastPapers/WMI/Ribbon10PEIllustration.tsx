// IKMC-21-PE-Q10 — "Edmund cut a ribbon as shown in the picture."
//
// Reconstructed from docs/reference/ocr-res/ikmc/contest/preecolier/2021.imgs/017.jpg:
// a ribbon folded into 6 horizontal serpentine rows, scissors at the top,
// and a single dashed vertical cut-line running through all 6 layers.
//
// STEM ILLUSTRATION only — shows the problem, not the answer (12 pieces).
// Choices are text numbers (A=9, B=10, C=11, D=12, E=13), so no Option renderer needed.
//
// Exports shared geometry constants so Ribbon10PEExplainer can overlay in the
// same coordinate space.

const ORANGE = '#f0853a'
const RIBBON_FILL = ORANGE
const RIBBON_STROKE = '#c45e14'
const CUT_STROKE = '#374151'   // dashed cut line
const SCISSORS_INK = '#1F2937'

// ── Layout ────────────────────────────────────────────────────────────────────
export const SVG_W = 220
export const SVG_H = 230

/** Left/right margins for the ribbon rows */
export const LEFT_X = 28
export const RIGHT_X = SVG_W - 28

/** Ribbon row height and vertical gap between rows */
export const ROW_H = 18          // height of each horizontal run
export const ROW_GAP = 8         // gap between runs
export const TOTAL_ROW_PITCH = ROW_H + ROW_GAP  // 26

/** Number of horizontal rows in the serpentine fold */
export const NUM_ROWS = 6

/** Y of the top edge of the first (topmost) row */
export const TOP_ROW_Y = 36

/** X position of the dashed cut line */
export const CUT_X = LEFT_X + (RIGHT_X - LEFT_X) * 0.38   // ~38% from left, matches scan

/** Rounded corner radius for the fold loops */
const LOOP_R = 10

// ── Ribbon path ───────────────────────────────────────────────────────────────
/**
 * Builds the SVG `d` path for a single horizontal ribbon row as a rounded rect.
 * Returns both the filled rect and a pair of "fold arc" guides are handled
 * separately by the loopPath.
 */
function rowRect(rowIndex: number) {
  const y = TOP_ROW_Y + rowIndex * TOTAL_ROW_PITCH
  return { x: LEFT_X, y, w: RIGHT_X - LEFT_X, h: ROW_H }
}

// The fold loops connect adjacent rows: even-indexed rows fold on the RIGHT,
// odd-indexed rows fold on the LEFT.
// Returns an SVG path string for the connecting loop between row `i` and row `i+1`.
function foldLoopPath(rowIndex: number): string {
  const r1 = rowRect(rowIndex)
  const r2 = rowRect(rowIndex + 1)
  const onRight = rowIndex % 2 === 0

  if (onRight) {
    // Right fold: row[i] right edge down to row[i+1] right edge
    const x = RIGHT_X
    const topY = r1.y + r1.h
    const botY = r2.y
    // Tight U-turn on the right
    return `M ${x} ${topY} C ${x + LOOP_R} ${topY}, ${x + LOOP_R} ${botY}, ${x} ${botY}`
  } else {
    // Left fold
    const x = LEFT_X
    const topY = r1.y + r1.h
    const botY = r2.y
    return `M ${x} ${topY} C ${x - LOOP_R} ${topY}, ${x - LOOP_R} ${botY}, ${x} ${botY}`
  }
}

// ── Scissors glyph ─────────────────────────────────────────────────────────
/**
 * Simple scissors silhouette at the top of the cut line.
 * cx = horizontal centre; bottomY = where the blades end.
 */
export function ScissorsGlyph({ cx, bottomY }: { cx: number; bottomY: number }) {
  const bx = cx
  const by = bottomY
  const tw = 9   // half-width of open blades
  const tl = 14  // blade length

  return (
    <g fill="none" stroke={SCISSORS_INK} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {/* Left blade */}
      <line x1={bx - 2} y1={by} x2={bx - tw} y2={by - tl} />
      {/* Right blade */}
      <line x1={bx + 2} y1={by} x2={bx + tw} y2={by - tl} />
      {/* Left handle loop */}
      <ellipse cx={bx - tw - 3} cy={by - tl - 5} rx={5} ry={4} />
      {/* Right handle loop */}
      <ellipse cx={bx + tw + 3} cy={by - tl - 5} rx={5} ry={4} />
      {/* Pivot dot */}
      <circle cx={bx} cy={by} r={2.5} fill={SCISSORS_INK} stroke="none" />
    </g>
  )
}

// ── Shared diagram primitive (also used by the explainer) ─────────────────
export interface RibbonDiagramProps {
  /** Which rows to highlight as "highlighted" (turn a distinct colour). */
  highlightRows?: number[]
  /** Whether to show the cut dashed line. */
  showCut?: boolean
  /** Whether to show the scissors. */
  showScissors?: boolean
  /** Colour override for highlighted rows; defaults to #10B981 (green). */
  highlightColor?: string
}

export function RibbonSerpentineDiagram({
  highlightRows = [],
  showCut = true,
  showScissors = true,
  highlightColor = '#10B981',
}: RibbonDiagramProps) {
  const lastRowRect = rowRect(NUM_ROWS - 1)
  const ribbonBottom = lastRowRect.y + lastRowRect.h

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: 260, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── ribbon rows ───────────────────────────────────────── */}
      {Array.from({ length: NUM_ROWS }, (_, i) => {
        const r = rowRect(i)
        const isHighlighted = highlightRows.includes(i)
        return (
          <rect
            key={`row-${i}`}
            x={r.x}
            y={r.y}
            width={r.w}
            height={r.h}
            rx={4}
            fill={isHighlighted ? highlightColor : RIBBON_FILL}
            stroke={isHighlighted ? '#059669' : RIBBON_STROKE}
            strokeWidth={1.5}
            style={{ transition: 'fill 0.3s' }}
          />
        )
      })}

      {/* ── fold loops connecting adjacent rows ───────────────── */}
      {Array.from({ length: NUM_ROWS - 1 }, (_, i) => (
        <path
          key={`loop-${i}`}
          d={foldLoopPath(i)}
          fill="none"
          stroke={RIBBON_STROKE}
          strokeWidth={ROW_H}
          strokeLinecap="round"
        />
      ))}

      {/* ── fold loop highlights ───────────────────────────────── */}
      {highlightRows.length > 0 && Array.from({ length: NUM_ROWS - 1 }, (_, i) => {
        // highlight the loop if BOTH the row above and below are highlighted
        const bothHighlighted = highlightRows.includes(i) && highlightRows.includes(i + 1)
        if (!bothHighlighted) return null
        return (
          <path
            key={`loop-hl-${i}`}
            d={foldLoopPath(i)}
            fill="none"
            stroke={highlightColor}
            strokeWidth={ROW_H - 2}
            strokeLinecap="round"
            style={{ transition: 'stroke 0.3s' }}
          />
        )
      })}

      {/* ── dashed cut line ────────────────────────────────────── */}
      {showCut && (
        <line
          x1={CUT_X}
          y1={showScissors ? TOP_ROW_Y - 2 : 8}
          x2={CUT_X}
          y2={ribbonBottom + 4}
          stroke={CUT_STROKE}
          strokeWidth={1.8}
          strokeDasharray="5 3"
          strokeLinecap="round"
        />
      )}

      {/* ── scissors ───────────────────────────────────────────── */}
      {showScissors && (
        <ScissorsGlyph cx={CUT_X} bottomY={TOP_ROW_Y - 4} />
      )}
    </svg>
  )
}

// ── Default export (static illustration) ─────────────────────────────────
export default function Ribbon10PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'A ribbon folded in 6 horizontal serpentine rows with scissors and a dashed vertical cut line. ' +
        'How many pieces does the cut produce?'
      }
    >
      <RibbonSerpentineDiagram />
    </div>
  )
}
