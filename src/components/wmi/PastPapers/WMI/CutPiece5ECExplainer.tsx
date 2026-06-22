/**
 * IKMC-19-EC-Q5 — post-answer explainer.
 *
 * Shows the 4×4 card-suit grid and cycles through options B, C, D, E
 * (all eliminated) before revealing option A (★ + ♣) highlighted in the
 * grid at row 2, cols 1–2 (the correct cut).
 *
 * Reuses SymbolGrid + CutPiece5ECOption from CutPiece5ECIllustration.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SymbolGrid, CutPiece5ECOption, GRID_VIEW_W, GRID_VIEW_H, PAD, OPTION_PAIR, type SymbolId } from './CutPiece5ECIllustration'
import { buildCutPiece5ECSteps } from './cutPiece5ECSteps'

// ─── colour tokens ───────────────────────────────────────────────────────────

const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const RED = '#EF4444'
const RED_BG = '#FEE2E2'
const ORANGE = '#F59E0B'

// ─── option badge ─────────────────────────────────────────────────────────────

/**
 * Shows the current option label and its domino picture.
 * If result===true, it gets green styling; if it's a wrong option it gets red.
 */
function OptionBadge({
  label,
  result,
  eliminated,
}: {
  label: string
  result: boolean
  eliminated: boolean
}) {
  if (!label) return null
  const pair = (OPTION_PAIR as Record<string, [SymbolId, SymbolId]>)[label]
  if (!pair) return null

  const borderColor = result ? GREEN : eliminated ? RED : ORANGE
  const bg = result ? GREEN_BG : eliminated ? RED_BG : '#FFF7ED'
  const textColor = result ? GREEN_TEXT : eliminated ? '#991B1B' : '#92400E'

  // Build a synthetic choice object so we can reuse CutPiece5ECOption
  const syntheticChoice = { label, text: label }

  return (
    <motion.div
      key={`opt-${label}-${result}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="flex items-center gap-2 rounded-xl border-2 px-3 py-1.5"
      style={{ borderColor, background: bg }}
    >
      <span className="font-display text-sm font-extrabold" style={{ color: textColor }}>
        {label}
      </span>
      <CutPiece5ECOption choice={syntheticChoice} />
      {result && (
        <span className="font-display text-sm font-extrabold" style={{ color: GREEN_TEXT }}>
          ✓
        </span>
      )}
      {eliminated && !result && (
        <span className="font-display text-sm font-extrabold" style={{ color: '#991B1B' }}>
          ✗
        </span>
      )}
    </motion.div>
  )
}

// ─── main explainer ───────────────────────────────────────────────────────────

export default function CutPiece5ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildCutPiece5ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const isEliminated = !isResult && beat.option !== '' && beat.option !== 'A'

  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: periksa setiap pilihan A–E. Opsi B memiliki bintang dan sekop yang tidak berdampingan, C memiliki dua bintang yang tidak berdampingan, D tidak memiliki hati di kiri berlian, E bukan potongan yang tepat. Opsi A (bintang + keriting) cocok dengan sel baris 3 kolom 2–3. Jawaban A.'
      : 'Explainer: check each option A–E. Option B has star and spade not adjacent, C has no two stars side-by-side, D has no heart immediately left of diamond, E does not match exactly. Option A (star + club) matches row 3 cols 2–3. Answer A.'

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* The 4×4 grid — highlights the matched cells during beats 5–6 */}
        <svg
          viewBox={`0 0 ${GRID_VIEW_W} ${GRID_VIEW_H}`}
          width="100%"
          style={{ display: 'block', maxWidth: GRID_VIEW_W * 1.4, margin: '0 auto' }}
          aria-hidden="true"
        >
          <SymbolGrid x={PAD} y={PAD} highlight={beat.highlight} />
        </svg>

        {/* Current option being checked */}
        <AnimatePresence mode="wait">
          {beat.option && (
            <OptionBadge
              key={`${beat.option}-${beat.result}`}
              label={beat.option}
              result={isResult}
              eliminated={isEliminated}
            />
          )}
        </AnimatePresence>

        {/* Caption */}
        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
