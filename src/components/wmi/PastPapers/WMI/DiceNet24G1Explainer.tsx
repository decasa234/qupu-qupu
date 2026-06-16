/**
 * DiceNet24G1Explainer — post-answer animation for WMI-24F1A-Q5 (2024 Grade 1 Final)
 *
 * Teaches the method one opposite-pair at a time:
 *   Fold the staircase net into a cube, then for each of the three opposite
 *   pairs light it up and work out |a − b|, growing a running sum:
 *     9 − 3 = 6 → 6 + (6 − 4 = 2) → 8 + (2 − 1 = 1) → 9
 *   Answer E: 9.
 *
 * Reuses the DiceNet24G1 primitive from the illustrator's file (same colours,
 * same layout, same glyphs) so the animation reads as the same scene coming
 * alive. Does NOT redraw the net.
 *
 * SSR-safe, deterministic. No Math.random, no Date.
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { DiceNet24G1, CELL } from './DiceNet24G1Illustration'
import { buildDiceNet24G1Steps } from './diceNet24G1Steps'

// Palette echoing the illustration's qupu colour tokens
const BRAND_BLUE = '#30598A'
const ORANGE = '#f0853a'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const SHELL = '#F0F7FC'
const PEACH = '#cfe8f5'

// Layout constants — wider than the static figure so the folded-cube glyph fits.
const PAD = 10
const GRID_COLS = 4
const GRID_ROWS = 3
const EXTRA_W = CELL * 1.9 // room for the folded-cube glyph at right
const VIEW_W = GRID_COLS * CELL + EXTRA_W + PAD * 2
const VIEW_H = GRID_ROWS * CELL + PAD * 2
const DISPLAY_W = 320

export default function DiceNet24G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildDiceNet24G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = t(
    `Strategy: fold the net into a cube, then add the differences of the three opposite-face pairs — 9 − 3 = 6, 6 − 4 = 2, 2 − 1 = 1, so 6 + 2 + 1 = ${story.total}. Answer E.`,
    `Strategi: lipat jaring jadi kubus, lalu jumlahkan selisih tiga pasang sisi berhadapan — 9 − 3 = 6, 6 − 4 = 2, 2 − 1 = 1, jadi 6 + 2 + 1 = ${story.total}. Jawaban E.`,
  )

  const isPair = beat.phase === 'pair'
  const isResult = beat.result

  // The accent matches the lit pair's highlight (orange) on pair beats.
  const accent = isResult ? GREEN : isPair ? ORANGE : BRAND_BLUE

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[280px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* animated net SVG */}
        <motion.div
          key={beat.phase + String(beat.litPair)}
          initial={{ opacity: 0.7, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            width={DISPLAY_W}
            style={{ display: 'block' }}
            aria-hidden="true"
          >
            <g transform={`translate(${PAD}, ${PAD})`}>
              <DiceNet24G1 litPair={beat.litPair} showFolded={beat.showFolded} />
            </g>
          </svg>
        </motion.div>

        {/* running difference readout — fixed height to prevent layout shift */}
        <div className="flex h-9 items-center justify-center">
          {isPair && beat.a != null && beat.b != null && (
            <motion.div
              key={`diff-${beat.litPair}`}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
              className="font-display text-xl font-black tabular-nums"
              style={{ color: ORANGE }}
            >
              {Math.max(beat.a, beat.b)} − {Math.min(beat.a, beat.b)} = {beat.diff}
            </motion.div>
          )}
          {isResult && (
            <motion.div
              key="result-sum"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
              className="font-display text-2xl font-black tabular-nums"
              style={{ color: GREEN }}
            >
              {story.total}
            </motion.div>
          )}
        </div>

        {/* caption box */}
        <motion.div
          key={beat.caption}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : isPair
                ? { background: '#FFFFFF', borderColor: accent, color: accent }
                : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
