/**
 * IKMC-21-EC-Q5 — post-answer explainer for the shooting-target question.
 *
 * Teaches the "add ring values" strategy:
 *   Beat 0 — intro: rings score 10 → 9 → 8 → 7.
 *   Beat 1 — target A: 7+7+8 = 22.
 *   Beat 2 — target B: 7+7+9 = 23.
 *   Beat 3 — target C: 7+8+8 = 23.
 *   Beat 4 — target D: 7+8+9 = 24.
 *   Beat 5 — target E: 8+9+10 = 27 — highest!
 *   Beat 6 — result: Ricky's target is E.
 *
 * Reuses TargetSVG + OPTION_DOTS from Targets5ECIllustration so the animation
 * reads as the same figures coming alive.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TargetSVG, TARGET_SCORES } from './Targets5ECIllustration'
import { buildTargets5ECSteps } from './targets5ECSteps'

// ── dot sets (same as Illustration — repeated for SSR-safety) ─────────────────
interface Dot { dx: number; dy: number }

const OPTION_DOTS: Record<string, Dot[]> = {
  A: [{ dx: -28, dy: 24 }, { dx: 0,   dy: 32 }, { dx: 22,  dy: 16  }],
  B: [{ dx: -24, dy: 28 }, { dx: -8,  dy: 32 }, { dx: -14, dy: -14 }],
  C: [{ dx: -30, dy: 22 }, { dx: -20, dy: -20 }, { dx: 22,  dy: -16 }],
  D: [{ dx: -10, dy: 34 }, { dx: -24, dy: 12 }, { dx: 10,  dy: -14 }],
  E: [{ dx: -20, dy: 20 }, { dx: -10, dy: 14 }, { dx: 0,   dy: 0   }],
}

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const

// ── colour tokens ─────────────────────────────────────────────────────────────
const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_TXT = '#065F46'
const ORANGE    = '#F59E0B'
const ORANGE_BG = '#FFF7ED'
const INK       = '#1F2937'
const GREY_BR   = '#D1D5DB'

// ── TargetPanel ────────────────────────────────────────────────────────────────
interface TargetPanelProps {
  label: string
  active: boolean
  isAnswer: boolean
  highlightRing: 7 | 8 | 9 | 10 | null
  score: number | null
}

function TargetPanel({ label, active, isAnswer, highlightRing, score }: TargetPanelProps) {
  const dots = OPTION_DOTS[label] ?? OPTION_DOTS['A']
  const borderColor = active && isAnswer ? GREEN : active ? ORANGE : GREY_BR

  return (
    <motion.div
      layout
      className="flex flex-col items-center gap-0.5"
      style={{
        border: `2.5px solid ${borderColor}`,
        borderRadius: 10,
        padding: '4px 6px',
        background: '#fff',
        minWidth: 62,
      }}
    >
      <div style={{ width: 52 }}>
        <TargetSVG dots={dots} highlightRing={active ? highlightRing : null} />
      </div>
      <span
        className="font-display text-xs font-bold"
        style={{ color: active && isAnswer ? GREEN : active ? ORANGE : INK }}
      >
        {label}
      </span>
      <AnimatePresence>
        {active && score !== null && (
          <motion.div
            key={`score-${label}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="rounded px-1 py-0.5 text-center font-display font-bold"
            style={{
              fontSize: 10,
              background: isAnswer ? GREEN_BG : ORANGE_BG,
              color: isAnswer ? GREEN_TXT : '#92400E',
              border: `1.5px solid ${isAnswer ? GREEN : ORANGE}`,
            }}
          >
            {score} pts
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main explainer ─────────────────────────────────────────────────────────────

export default function Targets5ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildTargets5ECSteps(lang), [lang])
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
      ? 'Penjelasan: Jumlahkan nilai cincin untuk setiap target. Target E: 8+9+10=27 — skor tertinggi. Target Ricky adalah E.'
      : 'Explainer: Add ring values for each target. Target E: 8+9+10=27 — the highest score. Ricky\'s target is E.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Five target panels */}
        <div className="flex flex-wrap items-end justify-center gap-2">
          {LABELS.map((label) => {
            const isActive = beat.activeOption === label || (beat.phase === 'result' && label === 'E')
            const isAnswer = label === 'E' && (beat.phase === 'targetE' || beat.phase === 'result')
            const score = isActive ? TARGET_SCORES[label] : null
            const highlightRing = isActive ? beat.highlightRing : null

            return (
              <TargetPanel
                key={label}
                label={label}
                active={isActive}
                isAnswer={isAnswer}
                highlightRing={highlightRing}
                score={score}
              />
            )
          })}
        </div>

        {/* Equation chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

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
