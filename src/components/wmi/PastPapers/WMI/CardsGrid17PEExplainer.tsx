// IKMC-20-PE-Q17 — post-answer explainer for the Latin-square card puzzle.
//
// Reuses CardsGrid17PE from CardsGrid17PEIllustration so the animation reads as
// the static board coming alive. Walks through:
//   intro → check row 2 → check col 1 → shape intersection → count deduction → reveal answer D.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CardsGrid17PE } from './CardsGrid17PEIllustration'
import { buildCardsGrid17PESteps } from './cardsGrid17PESteps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE_BG   = '#E1EFFB'
const BLUE_INK  = '#30598A'
const AMBER_BG  = '#FEF3C7'
const AMBER_INK = '#78350F'
const AMBER     = '#D97706'

export default function CardsGrid17PEExplainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'

  const story = useMemo(() => buildCardsGrid17PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const hasHighlight = beat.highlightRow !== null || beat.highlightCol !== null
  const captionStyle = beat.result
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    : hasHighlight
      ? { background: AMBER_BG, borderColor: AMBER, color: AMBER_INK }
      : { background: BLUE_BG, borderColor: BLUE_INK, color: BLUE_INK }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: baris 3 memerlukan persegi, kolom 2 memerlukan persegi — ' +
        'persegi adalah satu-satunya bentuk yang ada di kedua daftar. ' +
        'Jumlahnya adalah 1, sehingga jawabannya adalah D — satu persegi.'
      : 'Explainer: row 3 needs a square, col 2 needs a square — ' +
        'square is the only shape in both lists. ' +
        'The count is 1, so the answer is D — one square.'

  // Build row/col label chips for feedback
  const rowLabel = (r: number) =>
    lang === 'id' ? `Baris ${r + 1}` : `Row ${r + 1}`
  const colLabel = (c: number) =>
    lang === 'id' ? `Kolom ${c + 1}` : `Col ${c + 1}`

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Row/col highlight labels */}
        <div className="flex min-h-[1.75rem] items-center justify-center gap-2">
          <AnimatePresence mode="popLayout">
            {beat.highlightRow !== null && (
              <motion.div
                key={`row-${beat.highlightRow}`}
                initial={{ opacity: 0, y: -4, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.22 }}
                className="rounded-full px-3 py-0.5 font-display text-xs font-extrabold"
                style={{ background: AMBER_BG, color: AMBER_INK, border: `1.5px solid ${AMBER}` }}
              >
                {rowLabel(beat.highlightRow)}
              </motion.div>
            )}
            {beat.highlightCol !== null && (
              <motion.div
                key={`col-${beat.highlightCol}`}
                initial={{ opacity: 0, y: -4, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.22 }}
                className="rounded-full px-3 py-0.5 font-display text-xs font-extrabold"
                style={{ background: AMBER_BG, color: AMBER_INK, border: `1.5px solid ${AMBER}` }}
              >
                {colLabel(beat.highlightCol)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Board */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`board-${beat.highlightRow ?? 'n'}-${beat.highlightCol ?? 'n'}-${beat.revealAnswer}`}
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.93 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <CardsGrid17PE
              highlightRow={beat.highlightRow}
              highlightCol={beat.highlightCol}
              extraCard={
                beat.revealAnswer
                  ? { row: 2, col: 1, shape: 'sq', count: 1 }
                  : null
              }
              highlightCorrect={beat.revealAnswer ? [[2, 1]] : []}
            />
          </motion.div>
        </AnimatePresence>

        {/* Answer badge — appears on result beat */}
        <div className="flex min-h-[2.25rem] items-center justify-center">
          <AnimatePresence>
            {beat.result && (
              <motion.div
                key="result-badge"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 360, damping: 20 }}
                className="rounded-full px-5 py-1 font-display text-sm font-black text-white"
                style={{ background: GREEN }}
              >
                {lang === 'id' ? 'Jawaban D' : 'Answer D'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
