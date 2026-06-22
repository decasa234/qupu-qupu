// Boxes13PEExplainer.tsx — IKMC-23-PE-Q13 post-answer explainer.
//
// Animates inclusion-exclusion beat-by-beat:
//   Beat 0: empty grid (intro)
//   Beat 1: rows 3 & 6 painted (10 boxes)
//   Beat 2: + cols C & D painted (10 + 12 = 22 with double-count)
//   Beat 3: 4 overlap boxes highlighted; subtract → 18 painted
//   Beat 4: 30 − 18 = 12 not painted (unpainted cells highlighted)
//   Beat 5: final answer C = 12
//
// Reuses BoxGrid13Primitive from Boxes13PEIllustration.
// Deterministic + SSR-safe. No Math.random / Date.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  BoxGrid13Primitive,
  GRID_ROWS,
  GRID_COLS,
  PAINT_TOTALS,
  isPainted,
  PAINTED_ROWS,
  PAINTED_COLS,
} from './Boxes13PEIllustration'
import { buildBoxes13PESteps } from './boxes13PESteps'
import type { CellMode } from './boxes13PESteps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const BLUE        = '#30598A'
const BLUE_LIGHT  = '#E1EFFB'
const GREEN       = '#059669'
const GREEN_LIGHT = '#D1FAE5'
const PAINT_FILL  = '#93C5FD'   // soft blue for painted cells
const OVERLAP_FILL = '#F59E0B'  // amber for overlapping cells

// ── cell fill logic per cell mode ─────────────────────────────────────────────

function isOverlapCell(row: number, col: number): boolean {
  return PAINTED_ROWS.has(row) && PAINTED_COLS.has(col)
}

function getCellFill(mode: CellMode, row: number, col: number): string {
  switch (mode) {
    case 'none':
      return '#FFFFFF'

    case 'rows':
      // Only paint cells that are in a painted row (not col yet)
      return PAINTED_ROWS.has(row) ? PAINT_FILL : '#FFFFFF'

    case 'cols':
      // Paint rows + cols; overlap cells shown in amber to foreshadow double-count
      if (isOverlapCell(row, col)) return OVERLAP_FILL
      if (PAINTED_ROWS.has(row) || PAINTED_COLS.has(col)) return PAINT_FILL
      return '#FFFFFF'

    case 'overlap':
      // Same as cols but amber overlap is prominent
      if (isOverlapCell(row, col)) return OVERLAP_FILL
      if (PAINTED_ROWS.has(row) || PAINTED_COLS.has(col)) return PAINT_FILL
      return '#FFFFFF'

    case 'unpainted':
    case 'answer':
      // Painted cells are blue; unpainted are white
      return isPainted(row, col) ? PAINT_FILL : '#FFFFFF'

    default:
      return '#FFFFFF'
  }
}

// ── animated grid with per-cell fill ─────────────────────────────────────────

function AnimatedGrid({ mode }: { mode: CellMode }) {
  const cellFill = useMemo(
    () => (row: number, col: number) => getCellFill(mode, row, col),
    [mode],
  )

  return <BoxGrid13Primitive cellFill={cellFill} />
}

// ── equation bar ──────────────────────────────────────────────────────────────

interface EqBarProps {
  mode: CellMode
}

function EqBar({ mode }: EqBarProps) {
  // Build the three addends visible progressively
  const showRows     = mode !== 'none'
  const showCols     = mode === 'cols' || mode === 'overlap' || mode === 'unpainted' || mode === 'answer'
  const showOverlap  = mode === 'overlap' || mode === 'unpainted' || mode === 'answer'
  const showPainted  = mode === 'overlap' || mode === 'unpainted' || mode === 'answer'
  const showFinal    = mode === 'unpainted' || mode === 'answer'

  const chipStyle = (bg: string, border: string, text: string) => ({
    background: bg,
    borderColor: border,
    color: text,
  })

  return (
    <div className="flex flex-wrap items-center justify-center gap-1 font-display text-sm font-extrabold">
      {showRows && (
        <motion.div
          className="rounded-lg border-2 px-2 py-0.5"
          style={chipStyle(BLUE_LIGHT, BLUE, BLUE)}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 260, damping: 22 }}
        >
          {`5+5=10`}
        </motion.div>
      )}

      {showCols && (
        <>
          <motion.span
            className="text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            +
          </motion.span>
          <motion.div
            className="rounded-lg border-2 px-2 py-0.5"
            style={chipStyle(BLUE_LIGHT, BLUE, BLUE)}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, type: 'spring', stiffness: 260, damping: 22 }}
          >
            {`6+6=12`}
          </motion.div>
        </>
      )}

      {showOverlap && (
        <>
          <motion.span
            className="text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            −
          </motion.span>
          <motion.div
            className="rounded-lg border-2 px-2 py-0.5"
            style={chipStyle('#FEF3C7', '#B45309', '#92400E')}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, type: 'spring', stiffness: 260, damping: 22 }}
          >
            {`4`}
          </motion.div>
        </>
      )}

      {showPainted && (
        <>
          <motion.span
            className="text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            =
          </motion.span>
          <motion.div
            className="rounded-lg border-2 px-2 py-0.5"
            style={chipStyle(BLUE_LIGHT, BLUE, BLUE)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.15, type: 'spring', stiffness: 240, damping: 18 }}
          >
            {`${PAINT_TOTALS.painted} painted`}
          </motion.div>
        </>
      )}

      {showFinal && (
        <>
          <motion.span
            className="text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            →
          </motion.span>
          <motion.div
            className="rounded-lg border-2 px-2 py-0.5"
            style={chipStyle(GREEN_LIGHT, GREEN, '#065F46')}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2, type: 'spring', stiffness: 240, damping: 18 }}
          >
            {`${GRID_ROWS * GRID_COLS} − ${PAINT_TOTALS.painted} = ${GRID_ROWS * GRID_COLS - PAINT_TOTALS.painted}`}
          </motion.div>
        </>
      )}
    </div>
  )
}

// ── main export ───────────────────────────────────────────────────────────────

type Lang = 'en' | 'id'
const t = (lang: Lang, en: string, id: string) => (lang === 'id' ? id : en)

export default function Boxes13PEExplainer(props: ExplainerProps) {
  const lang: Lang = props.lang ?? 'en'

  const { steps, finalIndex } = useMemo(() => buildBoxes13PESteps(lang), [lang])
  const index = useBeatControl(finalIndex, {
    ...props,
    holds: steps.map((s) => s.hold),
  })
  const beat = steps[index] ?? steps[finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: GREEN_LIGHT, borderColor: GREEN, color: '#065F46' }
    : { background: BLUE_LIGHT, borderColor: BLUE, color: BLUE }

  const ariaLabel = t(
    lang,
    `Grid inclusion-exclusion: row 3 (5) + row 6 (5) + col C (6) + col D (6) minus 4 overlaps = 18 painted; 30 minus 18 = 12 not painted. Answer C.`,
    `Inklusi-eksklusi kisi: baris 3 (5) + baris 6 (5) + kol C (6) + kol D (6) dikurangi 4 tumpang tindih = 18 dicat; 30 dikurangi 18 = 12 tidak dicat. Jawaban C.`,
  )

  return (
    <div
      className="mx-auto w-full max-w-[380px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Grid */}
        <AnimatedGrid mode={beat.cellMode} />

        {/* Equation bar */}
        <EqBar mode={beat.cellMode} />

        {/* Caption */}
        <motion.div
          key={beat.phase}
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
