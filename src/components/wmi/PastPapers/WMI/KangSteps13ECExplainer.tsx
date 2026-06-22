import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  StaircaseBottom,
  StaircaseTop,
  DashedGap,
  KangFigure,
  RabbitFig,
  bottomStepTread,
  topStepTread,
  SVG_W,
  SVG_H,
  TREAD_W,
  RISER_H,
  PAD,
  BOTTOM_VISIBLE,
  COLOR,
} from './KangSteps13ECIllustration'
import { buildKangSteps13ECSteps } from './kangSteps13ECSteps'

// IKMC-20-EC-Q13 — post-answer animation.
// Reuses StaircaseBottom, StaircaseTop, DashedGap, KangFigure, RabbitFig from the
// illustration so the animation reads as the static scene coming alive.
//
// Animation beats:
//   0. intro     — static scene: kangaroo at step 1, rabbit at step 100.
//   1. formula   — show the two position formulas.
//   2. round-9   — mid-state label: K=64, R=73. Still apart.
//   3. round-10  — mid-state label: K=71, R=70. Crossed!
//   4. crossing  — highlight meeting step 70 with a label panel.
//   5. result    — meeting confirmed at 70, green.

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN = '#10B981'
const BLUE = '#30598A'

// ── Baseline for the visible staircase (matches illustration) ─────────────────
const BASELINE_Y = PAD.top + (BOTTOM_VISIBLE + 3) * RISER_H   // matches illustration's VISIBLE_H

// ── Mid-state position marker ─────────────────────────────────────────────────
// When animals are in the hidden middle of the staircase, we render a floating
// label panel inside the dashed-gap zone.

const GAP_LEFT = PAD.left + BOTTOM_VISIBLE * TREAD_W
const GAP_RIGHT = GAP_LEFT + 80  // matches GAP_W in illustration
const GAP_CX = (GAP_LEFT + GAP_RIGHT) / 2
const GAP_CY = BASELINE_Y - (BOTTOM_VISIBLE + 1.5) * RISER_H  // mid-height of gap

interface MidStateLabelProps {
  kangStep: number
  rabbitStep: number
  color: string
  isResult: boolean
}

function MidStateLabel({ kangStep, rabbitStep, color, isResult }: MidStateLabelProps) {
  const boxW = 100
  const boxH = 52
  const boxX = GAP_CX - boxW / 2
  const boxY = GAP_CY - boxH / 2

  return (
    <g>
      {/* background panel */}
      <rect x={boxX} y={boxY} width={boxW} height={boxH} rx={8} fill={isResult ? '#D1FAE5' : '#E1EFFB'} stroke={color} strokeWidth={2} />
      {/* kangaroo line */}
      <rect x={boxX + 6} y={boxY + 8} width={10} height={10} rx={2} fill={COLOR.KANGAROO} />
      <text x={boxX + 20} y={boxY + 13} dominantBaseline="central" fontSize={10} fontWeight={700} fill={COLOR.INK} fontFamily="ui-sans-serif, system-ui, sans-serif">
        K = {kangStep}
      </text>
      {/* rabbit line */}
      <circle cx={boxX + 11} cy={boxY + 34} r={5} fill={COLOR.RABBIT} />
      <text x={boxX + 20} y={boxY + 34} dominantBaseline="central" fontSize={10} fontWeight={700} fill={COLOR.INK} fontFamily="ui-sans-serif, system-ui, sans-serif">
        R = {rabbitStep}
      </text>
    </g>
  )
}

// ── Meeting-point dashed ring (appears during crossing + result) ──────────────

function MeetingRing() {
  return (
    <rect
      x={GAP_CX - 56}
      y={GAP_CY - 30}
      width={112}
      height={60}
      rx={12}
      fill="none"
      stroke={GREEN}
      strokeWidth={3}
      strokeDasharray="6 3"
    />
  )
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function KangSteps13ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildKangSteps13ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const highlightBottomSet = new Set(beat.highlightBottom)
  const highlightTopSet = new Set(beat.highlightTop)
  const accentColor = isResult ? GREEN : BLUE

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: setelah 9 putaran kanguru di 64, kelinci di 73; setelah 10 putaran kanguru di 71, kelinci di 70 — bersilangan di anak tangga 70; jawaban D.'
      : 'Explainer: after 9 rounds kangaroo at 64, rabbit at 73; after 10 rounds kangaroo at 71, rabbit at 70 — crossed at step 70; answer D.'

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ display: 'block', maxWidth: SVG_W }}
          aria-hidden="true"
        >
          {/* white background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* staircase clusters with optional highlights */}
          <StaircaseBottom
            highlightSteps={highlightBottomSet.size > 0 ? highlightBottomSet : undefined}
            highlightColor={accentColor}
          />
          <DashedGap />
          <StaircaseTop
            highlightSteps={highlightTopSet.size > 0 ? highlightTopSet : undefined}
            highlightColor={accentColor}
          />

          {/* kangaroo: shown at step 1 for intro/formula, mid-state otherwise */}
          <AnimatePresence mode="wait">
            {!beat.showMidState && (
              <motion.g
                key={`kang-end`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 22 }}
              >
                {(() => {
                  const { x, y } = bottomStepTread(1)
                  return <KangFigure x={x} y={y} />
                })()}
              </motion.g>
            )}
          </AnimatePresence>

          {/* rabbit: shown at step 100 for intro/formula, mid-state otherwise */}
          <AnimatePresence mode="wait">
            {!beat.showMidState && (
              <motion.g
                key={`rabbit-end`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 22 }}
              >
                {(() => {
                  const { x, y } = topStepTread(0)
                  return <RabbitFig x={x} y={y} />
                })()}
              </motion.g>
            )}
          </AnimatePresence>

          {/* mid-state label panel (rounds 9, 10, crossing, result) */}
          <AnimatePresence mode="wait">
            {beat.showMidState && (
              <motion.g
                key={`mid-${beat.phase}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
              >
                <MidStateLabel
                  kangStep={beat.kangarooStep}
                  rabbitStep={beat.rabbitStep}
                  color={accentColor}
                  isResult={isResult}
                />
              </motion.g>
            )}
          </AnimatePresence>

          {/* meeting ring on crossing + result beats */}
          <AnimatePresence>
            {(beat.phase === 'crossing' || beat.phase === 'result') && (
              <motion.g
                key="meet-ring"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              >
                <MeetingRing />
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* equation row */}
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
