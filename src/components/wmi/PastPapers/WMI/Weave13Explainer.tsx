import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { WeavePanel, VIEWBOX } from './Weave13Illustration'
import { buildWeave13Steps } from './weave13Steps'

// IKMC-19-PE-Q13 — post-answer animation for the woven-strips question.
//
// Four strips are woven together (2 red vertical + 2 grey horizontal, vertical
// on top in the stem). When you look from the other side, left↔right mirrors
// AND over/under swaps at every crossing → grey strips end up on top → answer B.
//
// Animation beats:
//   0. intro  — stem weave (front view), vertical on top, caption labels it.
//   1. mirror — same crossing pattern, mirrored horizontal; caption: left↔right swap.
//   2. swap   — grey on top (result crossing), mirrored; caption: over/under swapped.
//   3. result — same as beat 2 but with green border highlight; caption: answer B.

const GREEN  = '#10B981'
const BLUE   = '#30598A'
const ORANGE = '#f0853a'

// Width to render WeavePanel inside the explainer
const PANEL_W = Math.min(160, VIEWBOX)

// ── Swap indicator overlay ────────────────────────────────────────────────────

/**
 * Small "↕" badge drawn at the centre of the weave SVG to signal the
 * over/under swap happening at every crossing.
 */
function SwapIndicator() {
  const cx = VIEWBOX / 2
  const cy = VIEWBOX / 2

  return (
    <motion.g
      key="swap-indicator"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 18 }}
    >
      <circle cx={cx} cy={cy} r={17} fill="white" stroke={ORANGE} strokeWidth={2.5} />
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={16}
        fontWeight={900}
        fill={ORANGE}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        ↕
      </text>
    </motion.g>
  )
}

// ── Result highlight border ───────────────────────────────────────────────────

/** A green border rect inside the weave SVG to mark the correct back-view. */
function ResultHighlight() {
  return (
    <motion.rect
      key="result-highlight"
      x={3}
      y={3}
      width={VIEWBOX - 6}
      height={VIEWBOX - 6}
      fill="none"
      stroke={GREEN}
      strokeWidth={4}
      rx={6}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    />
  )
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function Weave13Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildWeave13Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: dari balik, kiri-kanan bertukar dan atas-bawah bertukar, sehingga strip abu-abu berada di atas — jawaban B.'
      : 'Explainer: from the back, left-right mirrors and over-under swaps, making grey strips come on top — answer B.'

  // Show the swap indicator during the swap beat
  const showSwapIndicator = beat.phase === 'swap'
  // Show the result highlight on result beat
  const showResult = beat.phase === 'result'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <div className="relative" style={{ width: PANEL_W }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${beat.phase}-${beat.mirrored ? 'mirrored' : 'normal'}`}
              initial={{ opacity: 0, scaleX: beat.mirrored ? -0.7 : 0.85 }}
              animate={{ opacity: 1, scaleX: beat.mirrored ? -1 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              style={{ transformOrigin: 'center' }}
            >
              <WeavePanel
                vertOver={beat.vertOver}
                width={PANEL_W}
                ariaLabel={beat.mirrored ? 'Back view of weave' : 'Front view of weave'}
              />
            </motion.div>
          </AnimatePresence>

          {/* overlay SVG for animated decorations (same viewBox as WeavePanel) */}
          <svg
            viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
            width={PANEL_W}
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <AnimatePresence>
              {showSwapIndicator && <SwapIndicator key="swap" />}
            </AnimatePresence>
            <AnimatePresence>
              {showResult && <ResultHighlight key="result" />}
            </AnimatePresence>
          </svg>
        </div>

        {/* equation chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black text-white"
                style={{ background: isResult ? GREEN : ORANGE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
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
