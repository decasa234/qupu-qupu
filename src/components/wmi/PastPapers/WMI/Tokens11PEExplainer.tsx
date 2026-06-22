// IKMC-23-PE-Q11 — post-answer beat-driven explainer.
//
// Reuses Tokens11PE from the illustration so the animation reads as the same
// token-row scene coming alive, one logical step per beat.
//
// Beats:
//   0. intro   — show the static row; state the setup.
//   1. known   — highlight 10 and 2 with green rings; show 10 + 2 = 12.
//   2. remain  — show 18 − 12 = 6 remaining for the two ? tokens.
//   3. divide  — show 6 ÷ 2 = 3.
//   4. reveal  — fill both ? with 3; sum-line bracket appears.
//   5. result  — green chip confirming answer C.
import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  Tokens11PE,
  TOKEN_DATA,
  C_ANSWER_GREEN,
  VIEW_W,
  VIEW_H,
  R,
} from './Tokens11PEIllustration'
import { buildTokens11PESteps } from './tokens11PESteps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN  = '#10B981'
const BLUE   = '#30598A'
const INK    = '#1F2937'

// ── known-token highlight rings ───────────────────────────────────────────────
// Drawn as an SVG overlay on top of the primitive when showKnownHighlight = true.
// We highlight index 0 (value 10) and index 3 (value 2).

function KnownHighlightOverlay() {
  const known = TOKEN_DATA.filter((t) => t.value !== null)
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ position: 'absolute', top: 0, left: 0, maxWidth: VIEW_W, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {known.map((tok) => (
        <circle
          key={`hl-${tok.index}`}
          cx={tok.cx}
          cy={tok.cy}
          r={R + 5}
          fill="none"
          stroke={C_ANSWER_GREEN}
          strokeWidth={3}
          strokeDasharray="5 3"
        />
      ))}
    </svg>
  )
}

// ── equation strip ────────────────────────────────────────────────────────────

function EquationStrip({ text, result }: { text: string; result: boolean }) {
  return (
    <div
      className="w-full rounded-lg border-2 px-4 py-2 text-center font-display text-base font-extrabold"
      style={
        result
          ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
          : { background: '#EFF6FF', borderColor: BLUE, color: BLUE }
      }
    >
      {text}
    </div>
  )
}

// ── main explainer ────────────────────────────────────────────────────────────

export default function Tokens11PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildTokens11PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const captionStyle = beat.result
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: 10 + ? + ? + 2 = 18. Kita tahu 10 + 2 = 12, maka ? + ? = 6, jadi setiap ? = 3 — jawaban C.'
      : 'Explainer: 10 + ? + ? + 2 = 18. Known sum 10 + 2 = 12, so ? + ? = 6, meaning each ? = 3 — answer C.'

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure with known-highlight overlay */}
        <div
          className="relative w-full overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
          style={{ color: INK }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`beat-${index}`}
              initial={{ opacity: 0.65, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.65, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
              <Tokens11PE
                revealAnswer={beat.revealAnswer}
                showSumLine={beat.showSumLine}
              />
            </motion.div>
          </AnimatePresence>

          {/* highlight rings for known tokens */}
          {beat.showKnownHighlight && (
            <AnimatePresence>
              <motion.div
                key="hl-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
              >
                <KnownHighlightOverlay />
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* equation strip */}
        {beat.equation && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`eq-${beat.equation}`}
              className="w-full"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
            >
              <EquationStrip text={beat.equation} result={beat.result} />
            </motion.div>
          </AnimatePresence>
        )}

        {/* caption chip */}
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
