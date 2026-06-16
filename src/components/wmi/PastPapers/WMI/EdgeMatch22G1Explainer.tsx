/**
 * WMI-22F1A-Q25 — edge-matching jigsaw explainer (Grade 1).
 *
 * Teaches the colour-match method beat-by-beat: state the rule, then fill one
 * empty box per beat (A → piece 7 turned, B → piece 2, C → piece 5 turned),
 * each time NAMING the edge colour that matches the bump above / the piece
 * beside it. Reads left to right to the answer 725.
 *
 * Pure render of the current beat — no Math.random, no Date. SSR-safe.
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { EdgeBoard, SOLUTION } from './EdgeMatch22G1Illustration'
import { buildEdgeMatch22G1Steps, EDGE_MATCH_G1_ANSWER } from './edgeMatch22G1Steps'

// Echoes the qupu tokens used in the static figure / sibling explainers.
const GREEN = '#10B981' // fill-qupu-green
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#30598A' // fill-qupu-blue
const BLUE_BG = '#E1EFFB'

// Board geometry (matches EdgeMatch22G1Illustration: BOARD_CELL=78, BOARD_PAD=10).
const BOARD_CELL = 78
const BOARD_PAD = 10
const VIEW_W = BOARD_CELL * 3 + BOARD_PAD * 2
const VIEW_H = BOARD_CELL * 3 + BOARD_PAD * 2
// The board <svg> caps its rendered width at 240; the focus overlay matches it.
const RENDER_W = Math.min(240, VIEW_W)
const COL_X: Record<'A' | 'B' | 'C', number> = { A: 0, B: 1, C: 2 }

export default function EdgeMatch22G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildEdgeMatch22G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const isResult = beat.result

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan teka-teki jigsaw: sisi yang bersentuhan harus sama warna dan potongan boleh diputar. Kotak A diisi potongan ${SOLUTION.A.piece} (diputar) yang atasnya merah cocok dengan tonjolan di atasnya; kotak B potongan ${SOLUTION.B.piece} dengan sisi kuning cocok ke A; kotak C potongan ${SOLUTION.C.piece} (diputar) dengan sisi putih cocok ke B. Dibaca kiri ke kanan jawabannya ${story.answer}.`
      : `Jigsaw explainer: touching edges must be the same colour and pieces may be turned. Box A takes piece ${SOLUTION.A.piece} (turned) whose red top matches the bump above it; box B takes piece ${SOLUTION.B.piece} whose yellow side matches A; box C takes piece ${SOLUTION.C.piece} (turned) whose white side matches B. Read left to right the answer is ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The board comes alive: one piece drops into A, then B, then C. */}
        <motion.div
          key={beat.phase}
          className="relative"
          style={{ width: RENDER_W }}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        >
          <EdgeBoard placed={beat.placed} />

          {/* Focus glow ring over the box being filled this beat. */}
          {beat.focus ? (
            <motion.svg
              className="pointer-events-none absolute inset-0"
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              width={RENDER_W}
              style={{ display: 'block' }}
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.rect
                x={BOARD_PAD + COL_X[beat.focus] * BOARD_CELL + 2}
                y={BOARD_PAD + BOARD_CELL * 2 + 2}
                width={BOARD_CELL - 4}
                height={BOARD_CELL - 4}
                rx={6}
                fill="none"
                stroke={GREEN}
                strokeWidth={4}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.svg>
          ) : null}
        </motion.div>

        {/* Final answer strip — the three box digits, left to right. */}
        {isResult ? (
          <motion.div
            key="answer"
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
          >
            {[SOLUTION.A.piece, SOLUTION.B.piece, SOLUTION.C.piece].map((digit, i) => (
              <motion.span
                key={i}
                className="flex h-9 w-9 items-center justify-center rounded-lg font-display text-base font-extrabold text-white"
                style={{ background: GREEN }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.12 * i, type: 'spring', stiffness: 300, damping: 18 }}
              >
                {digit}
              </motion.span>
            ))}
          </motion.div>
        ) : null}

        {/* Caption box. */}
        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="min-h-[44px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
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

// Re-exported so the static answer is visible to readers of this module.
export { EDGE_MATCH_G1_ANSWER }
