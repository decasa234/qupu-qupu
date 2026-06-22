/**
 * IKMC-20-EC-Q5 — post-answer explainer: piece-assembly matching.
 *
 * Animates checking each option A–E against the six-piece inventory, one beat
 * per option, then reveals that E (the bicycle) is the only figure that uses
 * all six pieces exactly.
 *
 * Reuses TwoPieces5ECDiagram from the illustration (the stem piece set) so the
 * inventory visual stays consistent. Uses buildTwoPieces5ECSteps for beat data.
 *
 * Beat sequence:
 *   0 — intro: show the 6 pieces, state the rule.
 *   1 — A eliminated (too many triangles).
 *   2 — B eliminated (has a square).
 *   3 — C eliminated (missing the large triangle).
 *   4 — D eliminated (shape mismatch).
 *   5 — E matches! All 6 pieces fit.
 *   6 — result: answer E.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TwoPieces5ECDiagram } from './TwoPieces5ECIllustration'
import { buildTwoPieces5ECSteps } from './twoPieces5ECSteps'
import type { Lang } from './twoPieces5ECSteps'

// ── colour tokens ────────────────────────────────────────────────────────────
const INK = '#1F2937'
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const RED = '#EF4444'
const RED_BG = '#FEE2E2'
const RED_TEXT = '#991B1B'
const BLUE = '#3B82F6'
const BLUE_BG = '#EFF6FF'
const GREY_BG = '#F3F4F6'
const GREY_TEXT = '#6B7280'

// ── option status chip ───────────────────────────────────────────────────────

interface OptionChipProps {
  label: string
  state: 'idle' | 'active' | 'eliminated' | 'answer'
}

function OptionChip({ label, state }: OptionChipProps) {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    idle:       { bg: GREY_BG,   text: GREY_TEXT, border: '#D1D5DB' },
    active:     { bg: BLUE_BG,   text: BLUE,      border: BLUE },
    eliminated: { bg: RED_BG,    text: RED_TEXT,   border: RED },
    answer:     { bg: GREEN_BG,  text: GREEN_TEXT, border: GREEN },
  }
  const s = styles[state] ?? styles.idle

  return (
    <motion.div
      layout
      animate={{ scale: state === 'active' || state === 'answer' ? 1.12 : 1 }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 34,
        height: 34,
        borderRadius: 8,
        background: s.bg,
        border: `2px solid ${s.border}`,
        color: s.text,
        fontWeight: 900,
        fontSize: 14,
        userSelect: 'none',
      }}
    >
      {state === 'eliminated' ? '✗' : state === 'answer' ? '✓' : label}
    </motion.div>
  )
}

// ── main explainer ───────────────────────────────────────────────────────────

export default function TwoPieces5ECExplainer({
  lang = 'id',
  step = 0,
  playing = false,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const safeLang = (lang === 'en' ? 'en' : 'id') as Lang
  const storyboard = useMemo(() => buildTwoPieces5ECSteps(safeLang), [safeLang])
  const { steps, finalIndex } = storyboard

  const holds = useMemo(() => steps.map((b) => b.hold), [steps])

  const beatIndex = useBeatControl(finalIndex, {
    step,
    playing,
    onStepCount: onStepCount ? () => onStepCount(steps.length) : undefined,
    onStepChange,
    onPlayEnd,
    holds,
  })

  const beat = steps[Math.min(beatIndex, finalIndex)]

  // Determine per-option display state
  function optionState(label: 'A' | 'B' | 'C' | 'D' | 'E'): OptionChipProps['state'] {
    const phaseMap: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'> = {
      checkA: 'A', checkB: 'B', checkC: 'C', checkD: 'D', checkE: 'E',
    }
    const phaseLabel = phaseMap[beat.phase]

    if (beat.result && label === 'E') return 'answer'
    if (beat.phase === 'result' && label !== 'E') return 'eliminated'

    if (phaseLabel === label) {
      if (beat.eliminated) return 'eliminated'
      if (beat.isAnswer) return 'answer'
      return 'active'
    }

    // Phases we've passed: A→B→C→D→E order
    const ORDER: Array<'A' | 'B' | 'C' | 'D' | 'E'> = ['A', 'B', 'C', 'D', 'E']
    const currentPhaseIdx = phaseLabel ? ORDER.indexOf(phaseLabel) : -1
    const labelIdx = ORDER.indexOf(label)

    if (currentPhaseIdx > labelIdx) {
      // Already processed — A,B,C,D are eliminated, E is the answer
      return label === 'E' ? 'idle' : 'eliminated'
    }

    return 'idle'
  }

  const LABELS: Array<'A' | 'B' | 'C' | 'D' | 'E'> = ['A', 'B', 'C', 'D', 'E']
  const isResult = beat.result

  // Caption styling
  let captionBg = BLUE_BG
  let captionBorder = BLUE
  let captionColor = INK
  if (beat.isAnswer || isResult) {
    captionBg = GREEN_BG
    captionBorder = GREEN
    captionColor = GREEN_TEXT
  } else if (beat.eliminated) {
    captionBg = RED_BG
    captionBorder = RED
    captionColor = RED_TEXT
  } else if (beat.phase === 'intro') {
    captionBg = '#F9FAFB'
    captionBorder = '#E5E7EB'
    captionColor = INK
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 4 }}>
      {/* Stem pieces diagram (always visible — the inventory reference) */}
      <div
        style={{
          border: '2px solid #E5E7EB',
          borderRadius: 10,
          background: '#FFFFFF',
          padding: '6px 4px 2px',
          maxWidth: 360,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <p style={{ textAlign: 'center', fontSize: 11, color: GREY_TEXT, margin: '0 0 2px', fontWeight: 700 }}>
          {safeLang === 'id' ? 'Potongan yang tersedia:' : 'Available pieces:'}
        </p>
        <TwoPieces5ECDiagram />
      </div>

      {/* Option status row */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'center',
          flexWrap: 'wrap',
          padding: '4px 0',
        }}
      >
        {LABELS.map((label) => (
          <OptionChip key={label} label={label} state={optionState(label)} />
        ))}
      </div>

      {/* Caption / explanation box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={beatIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          style={{
            background: captionBg,
            border: `2px solid ${captionBorder}`,
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: 14,
            lineHeight: 1.5,
            color: captionColor,
            fontWeight: isResult ? 700 : 400,
          }}
        >
          {beat.caption}
        </motion.div>
      </AnimatePresence>

      {/* Result badge */}
      {isResult && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            background: GREEN_BG,
            border: `2px solid ${GREEN}`,
            borderRadius: 10,
            padding: '10px 16px',
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 900, color: GREEN_TEXT }}>
            {safeLang === 'id' ? 'Jawaban: E' : 'Answer: E'}
          </span>
          <span style={{ fontSize: 13, color: GREEN_TEXT }}>
            {safeLang === 'id' ? '(sepeda — 6 potongan pas tepat)' : '(bicycle — all 6 pieces fit)'}
          </span>
        </motion.div>
      )}
    </div>
  )
}
