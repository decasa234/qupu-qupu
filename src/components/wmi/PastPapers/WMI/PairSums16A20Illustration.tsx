// SEAMO-16-A-Q20 — "Given that … What is the value of circle?"
//
// Figures: docs/reference/ocr-res/seamo/contest/paper-a/2016.imgs/016.jpg (□ + ◆ = 36)
//          017.jpg (□ + ⊙ = 40)
//          018.jpg (◆ + ⊙ = 52)
// Answer: ⊙ = 28  (sum-all trick: (□+◆)+(□+⊙)+(◆+⊙) = 128 → □+◆+⊙ = 64 → ⊙ = 64−36 = 28)
//
// Adapted from ShapeEquationIllustration.tsx — same layout engine, bespoke glyphs.

import type React from 'react'

// ── Solved values (bound to breakdown.quantities) ──────────────────────────
export const SUM_ALL = 36 + 40 + 52 // 128
export const TRIPLE_SUM = SUM_ALL / 2 // 64  (□+◆+⊙ = 64)
export const SQUARE_DIAMOND_SUM = 36  // □+◆ = 36
export const CIRCLE_VALUE = TRIPLE_SUM - SQUARE_DIAMOND_SUM // 28 = answer
export const SQUARE_VALUE = 40 - CIRCLE_VALUE // 12
export const DIAMOND_VALUE = 36 - SQUARE_VALUE // 24

// ── Symbol colours (faithful to the crop images) ────────────────────────────
const SQ_FILL = '#9B59B6'   // purple square
const SQ_STROKE = '#6C3483'
const DI_FILL = '#E67E22'   // orange diamond-cluster
const DI_STROKE = '#A04000'
const CI_FILL = '#F1C40F'   // yellow circle (outer)
const CI_STROKE = '#B7950B'
const CI_INNER = '#1a1a1a'  // dark inner circle dot

const GLYPH_STROKE = '#1F2937'
const GLYPH_R = 16           // bounding half-size for all glyphs

// ── Symbol glyph renderers (cx, cy are centre coords) ──────────────────────
function SquareGlyph({ cx, cy, filled = false, dim = false }: { cx: number; cy: number; filled?: boolean; dim?: boolean }) {
  const s = GLYPH_R * 1.4
  return (
    <rect
      x={cx - s / 2} y={cy - s / 2} width={s} height={s}
      fill={filled ? SQ_FILL : '#FFFFFF'} stroke={filled ? SQ_STROKE : SQ_FILL}
      strokeWidth={2.5} rx={2}
      opacity={dim ? 0.3 : 1}
    />
  )
}

/** 4-diamond rhombus cluster — faithful to the orange ◆◆◆◆ motif in the crop. */
function DiamondGlyph({ cx, cy, filled = false, dim = false }: { cx: number; cy: number; filled?: boolean; dim?: boolean }) {
  // Four small rotated squares arranged in a 2×2 diamond pattern
  const r = 7.5  // half-size of each mini-diamond
  const off = r + 2 // offset from centre
  const miniDiamond = (dx: number, dy: number) => {
    const pts = `${dx},${dy - r} ${dx + r},${dy} ${dx},${dy + r} ${dx - r},${dy}`
    return <polygon key={`${dx},${dy}`} points={pts} fill={filled ? DI_FILL : DI_FILL} stroke={DI_STROKE} strokeWidth={1} opacity={dim ? 0.3 : 1} />
  }
  return (
    <g>
      {miniDiamond(cx, cy - off)}
      {miniDiamond(cx + off, cy)}
      {miniDiamond(cx, cy + off)}
      {miniDiamond(cx - off, cy)}
    </g>
  )
}

/** Yellow circle with dark inner dot — faithful to the ⊙ in the crop. */
function CircleGlyph({ cx, cy, filled = false, dim = false }: { cx: number; cy: number; filled?: boolean; dim?: boolean }) {
  return (
    <g opacity={dim ? 0.3 : 1}>
      <circle cx={cx} cy={cy} r={GLYPH_R} fill={CI_FILL} stroke={CI_STROKE} strokeWidth={2.5} />
      <circle cx={cx} cy={cy} r={GLYPH_R * 0.42} fill={CI_INNER} stroke="none" />
    </g>
  )
}

export type SymKind = 'square' | 'diamond' | 'circle'

export function SymGlyph({
  kind, cx, cy, filled = false, dim = false,
}: {
  kind: SymKind; cx: number; cy: number; filled?: boolean; dim?: boolean
}) {
  if (kind === 'square') return <SquareGlyph cx={cx} cy={cy} filled={filled} dim={dim} />
  if (kind === 'diamond') return <DiamondGlyph cx={cx} cy={cy} filled={filled} dim={dim} />
  return <CircleGlyph cx={cx} cy={cy} filled={filled} dim={dim} />
}

// ── Layout constants ─────────────────────────────────────────────────────────
const VIEW_W = 280
const VIEW_H = 160
const ROW_Y = [40, 80, 120] // y-centres of the three equation rows
const LEFT_PAD = 28
const GLYPH_GAP = 58         // generous gap so '+' has breathing room between glyphs

function rowLayout(syms: SymKind[]) {
  const glyphX = syms.map((_, i) => LEFT_PAD + GLYPH_R + i * GLYPH_GAP)
  const plusX = glyphX.slice(0, -1).map((x) => x + GLYPH_GAP / 2)
  const eqX = LEFT_PAD + GLYPH_R + syms.length * GLYPH_GAP - 6
  const totalX = eqX + 32
  return { glyphX, plusX, eqX, totalX }
}

// The three given equations (matches OCR crops in order)
export const EQUATIONS: { syms: SymKind[]; total: number }[] = [
  { syms: ['square', 'diamond'], total: 36 },
  { syms: ['square', 'circle'], total: 40 },
  { syms: ['diamond', 'circle'], total: 52 },
]

export interface PairSumsDiagramProps {
  /** Which row (0–2) to highlight; null = all neutral. */
  highlightRow?: number | null
  /** Show the solved value badge for the circle (=28). */
  showAnswer?: boolean
  /** Dim the first equation row (used when substituting). */
  dimFirst?: boolean
}

export function PairSumsDiagram({
  highlightRow = null,
  showAnswer = false,
  dimFirst = false,
}: PairSumsDiagramProps) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {EQUATIONS.map((eq, i) => {
        const { glyphX, plusX, eqX, totalX } = rowLayout(eq.syms)
        const dim = (highlightRow !== null && highlightRow !== i) || (dimFirst && i === 0)
        const filled = highlightRow === i
        return (
          <g key={i} opacity={dim ? 0.3 : 1}>
            {eq.syms.map((kind, j) => (
              <SymGlyph key={j} kind={kind} cx={glyphX[j]} cy={ROW_Y[i]} filled={filled} />
            ))}
            {plusX.map((x, j) => (
              <text key={j} x={x} y={ROW_Y[i]} textAnchor="middle" dominantBaseline="central"
                fontSize={18} fontWeight={800} fill={GLYPH_STROKE}>+</text>
            ))}
            <text x={eqX} y={ROW_Y[i]} textAnchor="middle" dominantBaseline="central"
              fontSize={18} fontWeight={800} fill={GLYPH_STROKE}>=</text>
            <text x={totalX} y={ROW_Y[i]} textAnchor="middle" dominantBaseline="central"
              fontSize={20} fontWeight={900} fill="#2f6df0">{eq.total}</text>
          </g>
        )
      })}

      {/* Answer badge: ⊙ = 28 */}
      {showAnswer && (
        <g>
          <line x1={LEFT_PAD} y1={VIEW_H - 26} x2={VIEW_W - 20} y2={VIEW_H - 26}
            stroke="#CBD5E1" strokeWidth={1.5} />
          <SymGlyph kind="circle" cx={LEFT_PAD + GLYPH_R + 4} cy={VIEW_H - 12} />
          <text x={LEFT_PAD + GLYPH_R * 2 + 10} y={VIEW_H - 12}
            dominantBaseline="central" fontSize={18} fontWeight={900} fill="#10B981">
            = {CIRCLE_VALUE}
          </text>
        </g>
      )}
    </svg>
  )
}

export default function PairSums16A20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Three pair-sum equations: square plus diamond equals 36; square plus circle equals 40; diamond plus circle equals 52. Find the value of circle."
    >
      <PairSumsDiagram />
    </div>
  )
}
