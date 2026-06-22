/**
 * IKMC-22-EC-Q6 — Anna's number jigsaw explainer.
 *
 * Animates the solution beat-by-beat:
 *   • State the rule.
 *   • Inspect each hole cell's fixed neighbours.
 *   • Eliminate options C (conflict), keep D.
 *   • Drop piece D into the board.
 *   • Show the answer.
 *
 * Pure render of the current beat — no Math.random, no Date. SSR-safe.
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { JigsawBoard, JIGSAW_PIECES } from './Jigsaw6ECIllustration'
import { buildJigsaw6ECSteps, JIGSAW_6EC_ANSWER } from './jigsaw6ECSteps'

// Colour palette — echoes qupu tokens
const GREEN      = '#10B981'
const GREEN_BG   = '#D1FAE5'
const GREEN_INK  = '#065F46'
const BLUE       = '#30598A'
const BLUE_BG    = '#E1EFFB'

// Board geometry (must match JigsawBoard in illustration: CS=36, PAD=8)
const CS  = 36
const PAD = 8

// Focus cell positions for each hole slot
const FOCUS_RECTS: Record<string, { r: number; c: number }[]> = {
  top: [{ r: 2, c: 2 }],
  bl:  [{ r: 3, c: 2 }],
  bm:  [{ r: 3, c: 3 }],
  br:  [{ r: 3, c: 4 }],
}

const SVG_W = CS * 6 + PAD * 2
const SVG_H = CS * 6 + PAD * 2
const BOARD_RENDER_W = SVG_W

export default function Jigsaw6ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildJigsaw6ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const isResult = beat.result

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan teka-teki angka: aturannya, kotak yang bersentuhan tidak boleh memiliki angka sama. ` +
        `Kita periksa tiap kotak lubang — Potongan D (atas=2, bawah=3 1 4) tidak bentrok di mana pun. Jawaban: D.`
      : `Jigsaw explainer: the rule is adjacent squares cannot share the same number. ` +
        `We check each hole cell; piece D (top=2, bottom row 3 1 4) has no conflicts anywhere. Answer: D.`

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Board with optional piece drop-in */}
        <motion.div
          key={beat.phase}
          className="relative"
          style={{ width: BOARD_RENDER_W }}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        >
          <JigsawBoard
            filled={beat.filled}
            highlight={GREEN_BG}
          />

          {/* Focus ring(s) over the hole cell(s) being discussed */}
          {beat.focus ? (
            <motion.svg
              className="pointer-events-none absolute inset-0"
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              width={BOARD_RENDER_W}
              style={{ display: 'block' }}
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              {(FOCUS_RECTS[beat.focus] ?? []).map(({ r, c }) => (
                <motion.rect
                  key={`${r}-${c}`}
                  x={PAD + c * CS + 2}
                  y={PAD + r * CS + 2}
                  width={CS - 4}
                  height={CS - 4}
                  rx={4}
                  fill="none"
                  stroke={GREEN}
                  strokeWidth={3}
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}
            </motion.svg>
          ) : null}
        </motion.div>

        {/* Answer badge */}
        {isResult ? (
          <motion.div
            key="answer"
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
          >
            <motion.span
              className="flex h-10 w-10 items-center justify-center rounded-xl font-display text-lg font-extrabold text-white"
              style={{ background: GREEN }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            >
              {JIGSAW_6EC_ANSWER}
            </motion.span>
          </motion.div>
        ) : null}

        {/* Caption */}
        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="min-h-[48px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}

export { JIGSAW_6EC_ANSWER }
