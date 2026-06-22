/**
 * IKMC-22-PE-Q6 — post-answer explainer.
 *
 * Walks through each option A–E, eliminating wrong shapes, then reveals
 * that piece B is the correct missing piece (shape + pattern match).
 *
 * Reuses TornMap6PE (shared primitive) from TornMap6PEIllustration,
 * and TornMap6PEOption for the per-option badges.
 * Adapted from CutPiece5ECExplainer (try-and-eliminate pattern).
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TornMap6PE, TornMap6PEOption } from './TornMap6PEIllustration'
import { buildTornMap6PESteps } from './tornMap6PESteps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_TXT = '#065F46'
const RED       = '#EF4444'
const RED_BG    = '#FEE2E2'
const AMBER     = '#F59E0B'

// ── option badge ──────────────────────────────────────────────────────────────

function OptionBadge({
  label,
  eliminated,
  result,
}: {
  label: string
  eliminated: boolean
  result: boolean
}) {
  if (!label) return null
  const borderColor = result ? GREEN : eliminated ? RED : AMBER
  const bg          = result ? GREEN_BG : eliminated ? RED_BG : '#FFF7ED'
  const textColor   = result ? GREEN_TXT : eliminated ? '#991B1B' : '#92400E'
  const syntheticChoice = { label, text: label }

  return (
    <motion.div
      key={`opt-${label}-${result}-${eliminated}`}
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
      <TornMap6PEOption choice={syntheticChoice} />
      {result && (
        <span className="font-display text-sm font-extrabold" style={{ color: GREEN_TXT }}>
          ✓
        </span>
      )}
      {eliminated && (
        <span className="font-display text-sm font-extrabold" style={{ color: '#991B1B' }}>
          ✗
        </span>
      )}
    </motion.div>
  )
}

// ── explainer ─────────────────────────────────────────────────────────────────

export default function TornMap6PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildTornMap6PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TXT }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: periksa potongan A–E. A terlalu sempit, C salah bentuk, D terlalu lebar, E terlalu kecil. Potongan B berbentuk sudut dengan tanda X yang mengisi lubang peta dengan tepat. Jawaban B.'
      : 'Explainer: check pieces A–E. A too narrow, C wrong shape, D too wide, E too small. Piece B is the corner piece with an X mark that fills the map hole exactly. Answer B.'

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Map with optional answer fill */}
        <div className="w-full" style={{ maxWidth: 360 }}>
          <TornMap6PE
            showAnswer={beat.showAnswer}
            answerFill={GREEN}
            className="w-full"
          />
        </div>

        {/* Current option badge */}
        <AnimatePresence mode="wait">
          {beat.option && (
            <OptionBadge
              key={`${beat.option}-${beat.result}-${beat.eliminated}`}
              label={beat.option}
              eliminated={beat.eliminated}
              result={isResult}
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
