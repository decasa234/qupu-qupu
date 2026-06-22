import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  StaircaseGrid,
  KangarooFigure,
  RabbitFigure,
  SVG_W,
  SVG_H,
  stepTread,
  TREAD_W,
  COLOR,
} from './Staircase1PEIllustration'
import { buildStaircase1PESteps } from './staircase1PESteps'

// IKMC-20-PE-Q1 — post-answer animation.
// Reuses StaircaseGrid, KangarooFigure and RabbitFigure from the illustration
// so the animation reads as the static scene coming alive.
//
// Animation beats:
//   0. intro    — static scene: kangaroo at 1, rabbit at 9.
//   1. turn-1   — kangaroo → 4, rabbit → 7. Show new positions.
//   2. turn-2   — kangaroo → 7, rabbit → 5. They crossed!
//   3. crossing — highlight step 6 (where they passed each other).
//   4. result   — both on step 6; green.

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN = '#10B981'
const BLUE = '#30598A'
const ORANGE = '#F0853A'

// ── Arrow showing animal movement direction ────────────────────────────────────

function MovementArrow({
  fromStep,
  toStep,
  color,
  side,
}: {
  fromStep: number
  toStep: number
  color: string
  /** 'above' or 'below' the tread */
  side: 'above' | 'below'
}) {
  const from = stepTread(fromStep)
  const to = stepTread(toStep)
  const fromCx = from.x + TREAD_W / 2
  const toCx = to.x + TREAD_W / 2
  const arrowY = side === 'above' ? Math.min(from.y, to.y) - 14 : Math.max(from.y, to.y) + TREAD_W + 10

  return (
    <g stroke={color} strokeWidth={2} fill={color} strokeLinecap="round">
      <line x1={fromCx} y1={arrowY} x2={toCx} y2={arrowY} />
      {/* arrowhead pointing toward toStep */}
      {toCx > fromCx ? (
        <>
          <line x1={toCx} y1={arrowY} x2={toCx - 6} y2={arrowY - 4} />
          <line x1={toCx} y1={arrowY} x2={toCx - 6} y2={arrowY + 4} />
        </>
      ) : (
        <>
          <line x1={toCx} y1={arrowY} x2={toCx + 6} y2={arrowY - 4} />
          <line x1={toCx} y1={arrowY} x2={toCx + 6} y2={arrowY + 4} />
        </>
      )}
    </g>
  )
}

// ── Meeting-point flash ring ───────────────────────────────────────────────────

function MeetingRing({ step }: { step: number }) {
  const { x, y } = stepTread(step)
  const cx = x + TREAD_W / 2
  const cy = y - 20

  return (
    <circle
      cx={cx}
      cy={cy}
      r={22}
      fill="none"
      stroke={GREEN}
      strokeWidth={3}
      strokeDasharray="6 3"
    />
  )
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function Staircase1PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildStaircase1PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const highlightSet = new Set(beat.highlightSteps)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: setelah giliran 1 kanguru di anak tangga 4, kelinci di anak tangga 7; setelah giliran 2 kanguru di 7, kelinci di 5 — mereka bersilangan di anak tangga 6; jawaban D.'
      : 'Explainer: after turn 1 kangaroo is at step 4, rabbit at step 7; after turn 2 kangaroo at 7, rabbit at 5 — they crossed at step 6; answer D.'

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

          {/* staircase grid with optional highlights */}
          <StaircaseGrid
            highlightSteps={highlightSet.size > 0 ? highlightSet : undefined}
            highlightColor={isResult ? GREEN : ORANGE}
          />

          {/* kangaroo position */}
          <AnimatePresence mode="wait">
            <motion.g
              key={`k${beat.kangarooStep}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 360, damping: 22 }}
            >
              <KangarooFigure step={beat.kangarooStep} />
            </motion.g>
          </AnimatePresence>

          {/* rabbit position */}
          <AnimatePresence mode="wait">
            <motion.g
              key={`r${beat.rabbitStep}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 360, damping: 22 }}
            >
              <RabbitFigure step={beat.rabbitStep} />
            </motion.g>
          </AnimatePresence>

          {/* movement arrows for turn-1 */}
          <AnimatePresence>
            {beat.phase === 'turn-1' && (
              <motion.g
                key="arrows-t1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <MovementArrow fromStep={1} toStep={4} color={COLOR.KANGAROO} side="below" />
                <MovementArrow fromStep={9} toStep={7} color={COLOR.RABBIT} side="above" />
              </motion.g>
            )}
          </AnimatePresence>

          {/* movement arrows for turn-2 */}
          <AnimatePresence>
            {beat.phase === 'turn-2' && (
              <motion.g
                key="arrows-t2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <MovementArrow fromStep={4} toStep={7} color={COLOR.KANGAROO} side="below" />
                <MovementArrow fromStep={7} toStep={5} color={COLOR.RABBIT} side="above" />
              </motion.g>
            )}
          </AnimatePresence>

          {/* meeting-point ring on crossing + result beats */}
          <AnimatePresence>
            {(beat.phase === 'crossing' || beat.phase === 'result') && (
              <motion.g
                key="meet-ring"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              >
                <MeetingRing step={6} />
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
