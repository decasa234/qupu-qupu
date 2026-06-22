// Post-answer explainer for IKMC-23-EC-Q6 (Kristoffer's transparent paper fold).
//
// Reuses the same 7-segment geometry from FoldPaper6ECIllustration.
// Animates beat-by-beat:
//   0  Intro — show unfolded paper
//   1  Highlight top half segments
//   2  Highlight bottom half segments
//   3  Fold (show overlay state)
//   4–6 Reveal each digit column
//   7  Show result 4:0:6 = answer E

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildFoldPaper6ECSteps } from './foldPaper6ECSteps'

// ─── palette (mirrors illustration) ─────────────────────────────────────────
const PAPER_FILL    = '#E8F5FC'
const PAPER_STROKE  = '#4A8BAA'
const FOLD_DASH     = '#3A72A0'
const SEG_FILL      = '#1B3A52'
const DOT_FILL      = '#8AAEC5'
const HL_TOP        = '#F59E0B'   // amber — top half highlight
const HL_BOT        = '#8B5CF6'   // violet — bottom half highlight
const HL_COL0       = '#10B981'   // green — col 0
const HL_COL1       = '#EF4444'   // red — col 1
const HL_COL2       = '#3B82F6'   // blue — col 2
const HL_RESULT     = '#10B981'   // green — result
const ANSWER_GREEN  = '#065F46'
const BLUE_DARK     = '#1E3A5C'

const SEG_T = 5

// ─── layout (same constants as illustration, slightly smaller stage) ─────────
const CELL_W = 48
const CELL_H = 46
const COL_GAP = 10
const PAD_X   = 14
const PAD_Y   = 12

const PW = PAD_X * 2 + 3 * CELL_W + 2 * COL_GAP
const PH = PAD_Y * 2 + 2 * CELL_H

const VW = PW
const VH = PH

const COL_X = [
  PAD_X,
  PAD_X + CELL_W + COL_GAP,
  PAD_X + CELL_W * 2 + COL_GAP * 2,
]

const ROW_TOP_Y = PAD_Y
const ROW_BOT_Y = PAD_Y + CELL_H
const FOLD_Y    = PAD_Y + CELL_H

// ─── segment rect helper (same as illustration) ──────────────────────────────
interface Rect { x: number; y: number; w: number; h: number }

function segRects(segs: string[], ox: number, oy: number, W: number, H: number): Rect[] {
  const g    = 2
  const half = H / 2
  const result: Rect[] = []
  for (const s of segs) {
    switch (s) {
      case 'T':  result.push({ x: ox + g, y: oy,                   w: W - 2 * g, h: SEG_T }); break
      case 'M':  result.push({ x: ox + g, y: oy + half - SEG_T/2,  w: W - 2 * g, h: SEG_T }); break
      case 'B':  result.push({ x: ox + g, y: oy + H - SEG_T,       w: W - 2 * g, h: SEG_T }); break
      case 'TL': result.push({ x: ox,     y: oy + g,                w: SEG_T,     h: half - g }); break
      case 'TR': result.push({ x: ox + W - SEG_T, y: oy + g,       w: SEG_T,     h: half - g }); break
      case 'BL': result.push({ x: ox,     y: oy + half,             w: SEG_T,     h: half - g }); break
      case 'BR': result.push({ x: ox + W - SEG_T, y: oy + half,    w: SEG_T,     h: half - g }); break
    }
  }
  return result
}

// ─── digit segment maps ──────────────────────────────────────────────────────
const DIGIT_SEGS: Record<string, string[]> = {
  '0': ['T', 'TL', 'TR', 'BL', 'BR', 'B'],
  '4': ['TL', 'TR', 'M', 'BR'],
  '6': ['T', 'TL', 'M', 'BL', 'BR', 'B'],
}

// Paper segment sets per half
const TOP_HALF_SEGS: string[][] = [
  ['TL', 'TR'],
  ['T', 'TL', 'TR'],
  ['T', 'TL'],
]

const BOT_HALF_SEGS: string[][] = [
  ['M', 'BR'],
  ['BL', 'BR', 'B'],
  ['M', 'BL', 'BR', 'B'],
]

// Result digits in each column
const COL_RESULT_DIGITS = ['4', '0', '6'] as const

// ─── explainer SVG ───────────────────────────────────────────────────────────

interface FoldSvgProps {
  highlight: string
  folded: boolean
  result: boolean
}

function FoldSvg({ highlight, folded }: FoldSvgProps) {
  type SegR = Rect & { key: string; color: string }

  // Determine highlight colour for top/bottom based on current beat
  function topColor() {
    if (highlight === 'top') return HL_TOP
    if (folded) {
      if (highlight === 'col0' || highlight === 'col1' || highlight === 'col2' || highlight === 'result')
        return SEG_FILL
      return SEG_FILL
    }
    return SEG_FILL
  }
  function botColor(ci: number) {
    if (highlight === 'bottom') return HL_BOT
    if (highlight === 'col0' && ci === 0) return HL_COL0
    if (highlight === 'col1' && ci === 1) return HL_COL1
    if (highlight === 'col2' && ci === 2) return HL_COL2
    if (highlight === 'result') {
      if (ci === 0) return HL_COL0
      if (ci === 1) return HL_COL1
      if (ci === 2) return HL_COL2
    }
    return SEG_FILL
  }

  const topRects: SegR[] = []
  const botRects: SegR[] = []
  const overlayRects: SegR[] = []   // when folded, top-half segments reflect onto bottom row

  COL_X.forEach((cx, ci) => {
    // top half segments
    segRects(TOP_HALF_SEGS[ci], cx, ROW_TOP_Y, CELL_W, CELL_H).forEach((r, ri) => {
      topRects.push({ ...r, key: `t${ci}-${ri}`, color: topColor() })
    })
    // bottom half segments
    const bc = botColor(ci)
    segRects(BOT_HALF_SEGS[ci], cx, ROW_BOT_Y, CELL_W, CELL_H).forEach((r, ri) => {
      botRects.push({ ...r, key: `b${ci}-${ri}`, color: bc })
    })

    // When folded: also draw the reflected top segments in the bottom row area
    // (top folds down: TL→TL same x but in bottom row, TR→TR, T→T in bottom row)
    // — effectively the same segment positions but at y = ROW_BOT_Y
    if (folded) {
      // The top-half segs when reflected appear at BOT row with the SAME segment IDs
      // (vertical mirror of a half-height cell maps TL↔TL, TR↔TR in the reflected half)
      const colHL = (ci === 0 && (highlight === 'col0' || highlight === 'result'))
        ? HL_COL0
        : (ci === 1 && (highlight === 'col1' || highlight === 'result'))
        ? HL_COL1
        : (ci === 2 && (highlight === 'col2' || highlight === 'result'))
        ? HL_COL2
        : highlight === 'top'
        ? HL_TOP
        : SEG_FILL

      segRects(TOP_HALF_SEGS[ci], cx, ROW_BOT_Y, CELL_W, CELL_H).forEach((r, ri) => {
        overlayRects.push({ ...r, key: `ov${ci}-${ri}`, color: colHL })
      })
    }
  })

  // When showing the full-result digit (col0/col1/col2/result), replace the
  // column rects with the complete digit segments for clarity
  const resultRects: SegR[] = []
  if (folded && (highlight === 'result' || highlight === 'col0' || highlight === 'col1' || highlight === 'col2')) {
    const activeCol = highlight === 'col0' ? 0 : highlight === 'col1' ? 1 : highlight === 'col2' ? 2 : -1
    COL_X.forEach((cx, ci) => {
      if (activeCol !== -1 && ci !== activeCol) return
      const colHL = ci === 0 ? HL_COL0 : ci === 1 ? HL_COL1 : HL_COL2
      const digit = COL_RESULT_DIGITS[ci]
      const segs = DIGIT_SEGS[digit] ?? []
      segRects(segs, cx, ROW_BOT_Y, CELL_W, CELL_H).forEach((r, ri) => {
        resultRects.push({ ...r, key: `res${ci}-${ri}`, color: colHL })
      })
    })
  }

  const showTopHalf = !folded || highlight === 'top'
  const showBotRects = resultRects.length === 0

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: 280, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Paper background — only bottom half when folded (top is gone) */}
      {!folded && (
        <rect x={0} y={0} width={PW} height={PH} rx={5} fill={PAPER_FILL} stroke={PAPER_STROKE} strokeWidth={2} />
      )}
      {folded && (
        <rect x={0} y={ROW_BOT_Y - PAD_Y} width={PW} height={CELL_H + PAD_Y * 2 - ROW_BOT_Y + PAD_Y} rx={5}
          fill={PAPER_FILL} stroke={PAPER_STROKE} strokeWidth={2}
        />
      )}
      {/* When folded use a full-height rect to keep size stable */}
      {folded && (
        <rect x={0} y={0} width={PW} height={PH} rx={5} fill={PAPER_FILL} stroke={PAPER_STROKE} strokeWidth={2} />
      )}

      {/* Separator dots (top half) */}
      {!folded && [1, 2].map((c) => {
        const dotX = COL_X[c] - COL_GAP / 2
        return [CELL_H * 0.35, CELL_H * 0.65].map((dy, di) => (
          <circle key={`dt${c}-${di}`} cx={dotX} cy={ROW_TOP_Y + dy} r={2} fill={DOT_FILL} />
        ))
      })}

      {/* Separator dots (bottom half — always visible) */}
      {[1, 2].map((c) => {
        const dotX = COL_X[c] - COL_GAP / 2
        return [CELL_H * 0.35, CELL_H * 0.65].map((dy, di) => (
          <circle key={`db${c}-${di}`} cx={dotX} cy={ROW_BOT_Y + dy} r={2} fill={DOT_FILL} />
        ))
      })}

      {/* Top highlight band */}
      {highlight === 'top' && (
        <motion.rect
          x={2} y={2} width={PW - 4} height={CELL_H + PAD_Y - 2}
          fill={HL_TOP} fillOpacity={0.12} rx={4}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
        />
      )}

      {/* Bottom highlight band */}
      {highlight === 'bottom' && (
        <motion.rect
          x={2} y={FOLD_Y} width={PW - 4} height={CELL_H + PAD_Y - 2}
          fill={HL_BOT} fillOpacity={0.12} rx={4}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
        />
      )}

      {/* Column highlight bands (folded state) */}
      {folded && (highlight === 'col0' || highlight === 'col1' || highlight === 'col2') && (() => {
        const ci = highlight === 'col0' ? 0 : highlight === 'col1' ? 1 : 2
        const colHL = ci === 0 ? HL_COL0 : ci === 1 ? HL_COL1 : HL_COL2
        return (
          <motion.rect
            x={COL_X[ci] - 4} y={ROW_BOT_Y - 4} width={CELL_W + 8} height={CELL_H + 8}
            fill={colHL} fillOpacity={0.12} rx={4} stroke={colHL} strokeWidth={1.5} strokeOpacity={0.4}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
          />
        )
      })()}

      {/* Top half segments (hidden when fully folded) */}
      {showTopHalf && topRects.map(({ key, x, y, w, h, color }) => (
        <motion.rect
          key={key} x={x} y={y} width={w} height={h} rx={1.5}
          fill={color} stroke={color} strokeWidth={0.5}
          animate={{ fill: color }} transition={{ duration: 0.3 }}
        />
      ))}

      {/* Bottom half segments */}
      {showBotRects && botRects.map(({ key, x, y, w, h, color }) => (
        <motion.rect
          key={key} x={x} y={y} width={w} height={h} rx={1.5}
          fill={color} stroke={color} strokeWidth={0.5}
          animate={{ fill: color }} transition={{ duration: 0.3 }}
        />
      ))}

      {/* Overlay of reflected top segments (when folded) */}
      {folded && showBotRects && overlayRects.map(({ key, x, y, w, h, color }) => (
        <motion.rect
          key={key} x={x} y={y} width={w} height={h} rx={1.5}
          fill={color} fillOpacity={0.55} stroke={color} strokeWidth={0.5}
          animate={{ fill: color }} transition={{ duration: 0.3 }}
        />
      ))}

      {/* Result digit segments (when highlighting specific columns or final result) */}
      {resultRects.map(({ key, x, y, w, h, color }) => (
        <motion.rect
          key={key} x={x} y={y} width={w} height={h} rx={1.5}
          fill={color} stroke={color} strokeWidth={0.5}
          initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
        />
      ))}

      {/* Dashed fold line (hidden once folded) */}
      {!folded && (
        <line
          x1={0} y1={FOLD_Y} x2={PW} y2={FOLD_Y}
          stroke={FOLD_DASH} strokeWidth={2.5} strokeDasharray="6 4"
        />
      )}

      {/* Fold indicator when transitioning */}
      {highlight === 'fold' && (
        <motion.line
          x1={0} y1={FOLD_Y} x2={PW} y2={FOLD_Y}
          stroke={HL_TOP} strokeWidth={3} strokeDasharray="6 4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
        />
      )}
    </svg>
  )
}

// ─── explainer component ─────────────────────────────────────────────────────

export default function FoldPaper6ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildFoldPaper6ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const accent   = isResult ? HL_RESULT : BLUE_DARK

  return (
    <div
      className="mx-auto w-full max-w-[340px]"
      role="img"
      aria-label={t(
        'Animated explanation: fold the transparent paper with digit segments along the dashed line; overlapping layers reveal the combined digits 4:0:6 — answer E.',
        'Penjelasan animasi: lipat kertas transparan berisi segmen angka sepanjang garis putus-putus; lapisan yang bertumpang menghasilkan angka gabungan 4:0:6 — jawaban E.',
      )}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Fold instruction banner */}
        <div className="rounded-lg bg-blue-50 px-3 py-1 text-center font-display text-xs font-bold text-blue-700">
          {t(
            'Transparent paper — fold top half DOWN along the dashed line',
            'Kertas transparan — lipat bagian atas KE BAWAH sepanjang garis putus-putus',
          )}
        </div>

        {/* Main figure */}
        <motion.div
          key={`${beat.highlight}-${beat.folded}`}
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 340, damping: 22 }}
        >
          <FoldSvg
            highlight={beat.highlight}
            folded={beat.folded}
            result={beat.result}
          />
        </motion.div>

        {/* Result reveal badge */}
        {isResult && (
          <motion.div
            key="answer-badge"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18 }}
            className="flex items-baseline gap-1 font-display"
          >
            {(['4', '0', '6'] as const).map((d, i) => (
              <span key={i} className="text-2xl font-black" style={{ color: i === 0 ? HL_COL0 : i === 1 ? HL_COL1 : HL_COL2 }}>
                {i > 0 && <span className="mx-0.5 text-base font-normal" style={{ color: BLUE_DARK }}>:</span>}
                {d}
              </span>
            ))}
            <span className="ml-1 text-xl font-black" style={{ color: HL_RESULT }}>
              &nbsp;→ E
            </span>
          </motion.div>
        )}

        {/* Caption */}
        <div
          className="min-h-[3.5rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: '#D1FAE5', borderColor: HL_RESULT, color: ANSWER_GREEN }
              : { background: '#EFF6FF', borderColor: accent, color: accent }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
