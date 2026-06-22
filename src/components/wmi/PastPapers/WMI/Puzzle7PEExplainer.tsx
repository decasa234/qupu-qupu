// IKMC-22-PE-Q7 — post-answer explainer: puzzle assembly → crescent moon.
//
// Reuses PuzzleOptionBox from Puzzle7PEIllustration so the options animate
// as the same figures from the choice renderer.
//
// Animation beats (see puzzle7PESteps.ts):
//   0. intro     — show the 4 pieces; blue + yellow + white.
//   1. yellow    — highlight the yellow shapes.
//   2. white     — highlight the white circle cutout.
//   3. crescent  — show assembled view → crescent emerges; option B glows.
//   4. eliminate — stamp A, C, D, E as wrong.
//   5. result    — option B glows green → answer B.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import Puzzle7PEIllustration, {
  PuzzleOptionBox,
  BLUE,
  YELLOW,
  WHITE,
} from './Puzzle7PEIllustration'
import { buildPuzzle7PESteps } from './puzzle7PESteps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN       = '#10B981'
const GREEN_BG    = '#D1FAE5'
const GREEN_TEXT  = '#065F46'
const RED         = '#EF4444'
const RED_BG      = '#FEE2E2'
const ORANGE      = '#F59E0B'
const ORANGE_BG   = '#FEF3C7'
const INK         = '#1A2B5A'
const CARD_BG     = '#EEF2FF'

// ── LABELS ────────────────────────────────────────────────────────────────────
const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'] as const

// ── OptionPanel ───────────────────────────────────────────────────────────────
interface OptionPanelProps {
  label: string
  highlightOption: string | null
  isCorrect: boolean
  isWrong: boolean
  isEliminate: boolean
}

function OptionPanel({ label, highlightOption, isCorrect, isWrong, isEliminate }: OptionPanelProps) {
  const isHighlighted = highlightOption === label
  const isEliminated = isEliminate && label !== 'B'

  let ring = 'transparent'
  let bg = 'transparent'
  let labelColor = INK

  if (isHighlighted && isCorrect) {
    ring = GREEN
    bg = GREEN_BG
    labelColor = GREEN_TEXT
  } else if (isHighlighted && !isCorrect && !isWrong) {
    ring = ORANGE
    bg = ORANGE_BG
    labelColor = '#92400E'
  } else if (isEliminated) {
    ring = RED
    bg = RED_BG
    labelColor = '#991B1B'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div
        style={{
          borderRadius: 8,
          border: `2.5px solid ${ring}`,
          background: bg,
          padding: 4,
          position: 'relative',
          transition: 'border-color 0.3s, background 0.3s',
        }}
      >
        <PuzzleOptionBox label={label} size={52} />
        {isEliminated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 900,
              color: RED,
              background: 'rgba(255,255,255,0.35)',
              borderRadius: 6,
            }}
          >
            ✗
          </motion.div>
        )}
        {isHighlighted && isCorrect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              position: 'absolute',
              top: -10,
              right: -10,
              background: GREEN,
              borderRadius: '50%',
              width: 22,
              height: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: WHITE,
              fontSize: 13,
              fontWeight: 900,
              boxShadow: '0 2px 6px rgba(16,185,129,0.4)',
            }}
          >
            ✓
          </motion.div>
        )}
      </div>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: labelColor,
          transition: 'color 0.3s',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </span>
    </div>
  )
}

// ── AssembledPreview ──────────────────────────────────────────────────────────
// Shows a 2×2 assembled square with the crescent moon artwork.
function AssembledPreview({ visible }: { visible: boolean }) {
  const S = 56   // assembled square side
  const r = S * 0.38  // yellow disc radius
  const wR = S * 0.27 // white circle radius
  const cx = S * 0.48
  const cy = S * 0.48
  const wCx = cx + S * 0.08
  const wCy = cy + S * 0.08

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
    >
      <svg
        viewBox={`0 0 ${S} ${S}`}
        width={S * 1.5}
        height={S * 1.5}
        aria-hidden="true"
        style={{ display: 'block', borderRadius: 6, border: `2px solid ${ORANGE}` }}
      >
        <rect x={0} y={0} width={S} height={S} fill={BLUE} />
        <circle cx={cx - S * 0.04} cy={cy - S * 0.04} r={r} fill={YELLOW} />
        <circle cx={wCx} cy={wCy} r={wR} fill={BLUE} />
      </svg>
      <span style={{ fontSize: 10, color: ORANGE, fontWeight: 700 }}>
        assembled →
      </span>
    </motion.div>
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function Puzzle7PEExplainer({
  lang = 'en',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const story = useMemo(() => buildPuzzle7PESteps(lang as 'en' | 'id'), [lang])
  const beat = useBeatControl(story.finalIndex, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    holds: story.steps.map((s) => s.hold),
  })

  const current = story.steps[beat]

  const showAssembled = ['crescent', 'eliminate', 'result'].includes(current.phase)
  const isEliminate = current.phase === 'eliminate' || current.phase === 'result'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        padding: '12px 8px',
        fontFamily: 'inherit',
      }}
      aria-live="polite"
    >
      {/* Stem illustration (pieces) */}
      <div style={{ width: '100%' }}>
        <Puzzle7PEIllustration />
      </div>

      {/* Assembled preview (beats 3–5) */}
      <AnimatePresence>
        {showAssembled && (
          <motion.div
            key="assembled"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <span style={{ fontSize: 12, color: INK, fontWeight: 600 }}>
              {lang === 'id' ? 'Ketika disusun:' : 'When assembled:'}
            </span>
            <AssembledPreview visible />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Options row */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {OPTION_LABELS.map((label) => (
          <OptionPanel
            key={label}
            label={label}
            highlightOption={current.highlightOption}
            isCorrect={current.isCorrect}
            isWrong={current.isWrong}
            isEliminate={isEliminate}
          />
        ))}
      </div>

      {/* Equation chip */}
      <AnimatePresence mode="wait">
        {current.equation && (
          <motion.div
            key={`eq-${beat}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: current.isCorrect ? GREEN_BG : ORANGE_BG,
              border: `1.5px solid ${current.isCorrect ? GREEN : ORANGE}`,
              borderRadius: 8,
              padding: '4px 14px',
              fontSize: 15,
              fontWeight: 700,
              color: current.isCorrect ? GREEN_TEXT : '#92400E',
              letterSpacing: '0.04em',
            }}
          >
            {current.equation}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Caption */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`cap-${beat}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background: current.result ? GREEN_BG : CARD_BG,
            border: `1.5px solid ${current.result ? GREEN : '#C7D2FE'}`,
            borderRadius: 10,
            padding: '10px 16px',
            fontSize: 13,
            lineHeight: 1.55,
            color: current.result ? GREEN_TEXT : INK,
            maxWidth: 380,
            textAlign: 'center',
          }}
        >
          {current.caption}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
