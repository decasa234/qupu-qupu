import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Weave6Panel, VB } from './Weave11ECIllustration'
import { buildWeave11ECSteps } from './weave11ECSteps'

// IKMC-19-EC-Q11 — post-answer animation for the 6-strip woven pattern.
//
// Six strips (3 cyan vertical + 3 yellow horizontal) form a 3×3 alternating weave.
// Looking from the back: LR mirror + over/under swap at every crossing
// → the opposite checkerboard → answer C.
//
// Animation beats:
//   0. intro  — front view (alternating, cyan at corners+centre).
//   1. mirror — same crossings, mirrored; caption: left↔right swap.
//   2. swap   — back result (yellow at corners+centre); caption: over/under swapped.
//   3. result — green border; caption: answer C.

const GREEN  = '#10B981'
const BLUE   = '#30598A'
const ORANGE = '#f0853a'

const PANEL_W = Math.min(160, VB)

// ── Swap indicator overlay ────────────────────────────────────────────────────

function SwapIndicator() {
  const cx = VB / 2
  const cy = VB / 2

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

function ResultHighlight() {
  return (
    <motion.rect
      key="result-highlight"
      x={3}
      y={3}
      width={VB - 6}
      height={VB - 6}
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

export default function Weave11ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildWeave11ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: dari balik, kiri-kanan bertukar dan atas-bawah bertukar, sehingga strip kuning berada di atas di sudut dan pusat — jawaban C.'
      : 'Explainer: from the back, left-right mirrors and over-under swaps, making yellow strips come on top at corners and centre — answer C.'

  const showSwapIndicator = beat.phase === 'swap'
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
              <Weave6Panel
                crossings={beat.crossings}
                width={PANEL_W}
                ariaLabel={beat.mirrored ? 'Back view of weave' : 'Front view of weave'}
              />
            </motion.div>
          </AnimatePresence>

          {/* overlay SVG for animated decorations */}
          <svg
            viewBox={`0 0 ${VB} ${VB}`}
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
