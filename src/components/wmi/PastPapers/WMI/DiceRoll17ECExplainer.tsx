// DiceRoll17ECExplainer.tsx
// IKMC-20-EC-Q17 — post-answer beat-by-beat animation.
//
// Reuses the IsoDie and RollArrow primitives from DiceRoll17ECIllustration,
// and the SCENE constants. Tracks the die through 5 rightward rolls (6 squares)
// then reveals and sums the three ? faces → 4+2+1=7, answer B.
//
// Pattern follows FlagpoleCastle22Explainer (useBeatControl + AnimatePresence).

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SCENE,
  INITIAL,
  rollRight,
  IsoDie,
  RollArrow,
} from './DiceRoll17ECIllustration'
import { buildDiceRoll17ECSteps } from './diceRoll17ECSteps'

// ── Colours ────────────────────────────────────────────────────────────────────

const GREEN = '#10B981'
const BLUE = '#1D4ED8'
const ORANGE = '#F59E0B'
const INK = SCENE.INK

// ── Pre-compute dice orientations for each square ────────────────────────────

const N_SQUARES = SCENE.N_SQUARES

const ALL_ORIENTATIONS = Array.from({ length: N_SQUARES }, (_, i) => {
  let o = INITIAL
  for (let r = 0; r < i; r++) o = rollRight(o)
  return o
})

// ── Square highlight overlay ──────────────────────────────────────────────────

interface SquareHighlightProps { squareIdx: number }  // 0-based

function SquareHighlight({ squareIdx }: SquareHighlightProps) {
  const x = SCENE.TRACK_LEFT + squareIdx * SCENE.SQ_W
  const y = SCENE.TRACK_TOP
  return (
    <rect
      x={x} y={y}
      width={SCENE.SQ_W} height={SCENE.SQ_H}
      fill="none"
      stroke={ORANGE}
      strokeWidth={3}
      rx={2}
    />
  )
}

// ── Label showing revealed value on the final die ────────────────────────────

function RevealBadge({ x, y, value, color }: { x: number; y: number; value: string; color: string }) {
  return (
    <text
      x={x.toFixed(1)} y={y.toFixed(1)}
      textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight={900}
      fill={color}
    >
      {value}
    </text>
  )
}

// ── Main explainer ─────────────────────────────────────────────────────────────

export default function DiceRoll17ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildDiceRoll17ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  // Which square to highlight (0-based), -1 = none
  const highlightIdx = beat.activeSquare > 0 ? beat.activeSquare - 1 : -1

  // How many dice to show (rolling one at a time; show up to activeSquare, else all)
  // For intro/track beats, show all dice. For roll beats, show dice up to that square.
  const showDiceUpTo = beat.activeSquare > 0 ? beat.activeSquare : N_SQUARES

  // Should we reveal face values on the last die?
  const revealFinal = beat.revealTop !== '?' && beat.activeSquare === N_SQUARES

  const VIEW_W = SCENE.VIEW_W
  const VIEW_H = SCENE.VIEW_H

  const ariaLabel = lang === 'id'
    ? 'Penjelasan: dadu berguling 5 kali ke kanan; sisi atas=4, depan=2, kanan=1; total = 4+2+1 = 7, jawaban B.'
    : 'Explainer: die rolls 5 times to the right; top=4, front=2, right=1; total = 4+2+1 = 7, answer B.'

  return (
    <div className="mx-auto w-full max-w-[540px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Figure */}
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* Background */}
          <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="white" />

          {/* Floor track squares */}
          {Array.from({ length: N_SQUARES }, (_, i) => {
            const x = SCENE.TRACK_LEFT + i * SCENE.SQ_W
            const y = SCENE.TRACK_TOP
            return (
              <rect
                key={`sq-${i}`}
                x={x} y={y} width={SCENE.SQ_W} height={SCENE.SQ_H}
                fill={SCENE.TRACK_FILL} stroke={SCENE.TRACK_STROKE} strokeWidth={1.5}
              />
            )
          })}

          {/* Square number labels */}
          {Array.from({ length: N_SQUARES }, (_, i) => {
            const cx = SCENE.TRACK_LEFT + i * SCENE.SQ_W + SCENE.SQ_W / 2
            const y = SCENE.TRACK_TOP + SCENE.SQ_H + 12
            return (
              <text
                key={`lbl-${i}`}
                x={cx.toFixed(1)} y={y.toFixed(1)}
                textAnchor="middle" dominantBaseline="central"
                fontSize={11} fontWeight={600}
                fill="#64748B"
              >
                {i + 1}
              </text>
            )
          })}

          {/* Roll arrows between squares that have been reached */}
          {Array.from({ length: Math.max(0, showDiceUpTo - 1) }, (_, i) => {
            const fromCx = SCENE.TRACK_LEFT + i * SCENE.SQ_W + SCENE.SQ_W / 2
            const toCx = SCENE.TRACK_LEFT + (i + 1) * SCENE.SQ_W + SCENE.SQ_W / 2
            const arrowY = SCENE.TRACK_TOP - 6
            return <RollArrow key={`arr-${i}`} fromX={fromCx} toX={toCx} y={arrowY} />
          })}

          {/* Dice */}
          {Array.from({ length: showDiceUpTo }, (_, i) => {
            const cx = SCENE.TRACK_LEFT + i * SCENE.SQ_W + SCENE.SQ_W / 2
            const isLast = i === N_SQUARES - 1
            // Show ? on final die unless we've revealed it
            const showQ = isLast && !revealFinal
            return (
              <IsoDie
                key={`die-${i}`}
                cx={cx}
                cy={SCENE.TRACK_TOP}
                orientation={ALL_ORIENTATIONS[i]}
                showQuestion={showQ}
              />
            )
          })}

          {/* Active square highlight */}
          <AnimatePresence>
            {highlightIdx >= 0 && (
              <motion.g
                key={`highlight-${highlightIdx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 24 }}
              >
                <SquareHighlight squareIdx={highlightIdx} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Revealed values on the final die when beat.activeSquare == 6 */}
          <AnimatePresence>
            {revealFinal && (
              <motion.g
                key="reveal-values"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              >
                {/* These badges float beside the die face centroids */}
                {/* Top face label - above right-most die */}
                <RevealBadge
                  x={SCENE.TRACK_LEFT + (N_SQUARES - 1) * SCENE.SQ_W + SCENE.SQ_W / 2 - 2}
                  y={SCENE.TRACK_TOP - SCENE.DIE_H - SCENE.DIE_TOP_H * 2 - 8}
                  value={beat.revealTop}
                  color={isResult ? GREEN : ORANGE}
                />
                {/* Label annotation */}
                <text
                  x={(SCENE.TRACK_LEFT + (N_SQUARES - 1) * SCENE.SQ_W + SCENE.SQ_W / 2 + 14).toFixed(1)}
                  y={(SCENE.TRACK_TOP - SCENE.DIE_H - SCENE.DIE_TOP_H * 2 - 8).toFixed(1)}
                  textAnchor="start" dominantBaseline="central"
                  fontSize={9} fontWeight={700}
                  fill={INK}
                >
                  top
                </text>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* Equation row */}
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
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
