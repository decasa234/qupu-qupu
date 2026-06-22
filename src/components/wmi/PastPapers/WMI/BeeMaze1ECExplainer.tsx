// IKMC-22-EC-Q1 — Animated explainer for the bee-to-flower grid maze.
//
// Beat flow:
//   0  intro      — state the task (trace each sequence on the grid)
//   1–4 eliminate — trace routes B, C, D, E in red; each misses the flower
//   5  trace      — trace route A in green; Buzz lands on the flower
//   6  result     — answer A confirmed

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BeeMaze1EC } from './BeeMaze1ECIllustration'
import { buildBeeMaze1ECSteps } from './beeMaze1ECSteps'

// Qupu palette
const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'
const RED       = '#EF4444'
const RED_BG    = '#FEE2E2'
const RED_INK   = '#991B1B'
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'
const AMBER     = '#F59E0B'
const AMBER_BG  = '#FEF3C7'
const AMBER_INK = '#92400E'

export default function BeeMaze1ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildBeeMaze1ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = t(
    'Explainer: trace each direction set on the 4×4 grid. Routes B, C, D, E each miss the flower and are eliminated. Route A (→↓→↓↓→) lands exactly on the flower — answer A.',
    'Penjelasan: ikuti setiap urutan arah di kotak-kotak 4×4. Rute B, C, D, E masing-masing melewatkan bunga dan dieliminasi. Rute A (→↓→↓↓→) tepat mendarat di bunga — jawaban A.',
  )

  // Caption box style
  const captionStyle = (() => {
    if (beat.result)                  return { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    if (beat.phase === 'trace')       return { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    if (beat.phase === 'eliminate')   return { background: RED_BG, borderColor: RED, color: RED_INK }
    return { background: BLUE_BG, borderColor: BLUE, color: BLUE }
  })()

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Option rail — chips for A–E */}
        <div className="flex w-full items-center justify-center gap-2">
          {(['A', 'B', 'C', 'D', 'E'] as const).map((letter) => {
            // A chip is "checked" once we've seen the beat that covers it.
            // eliminate beats cover B–E at story indices 1–4; trace/result cover A.
            const elimIdx = ['B', 'C', 'D', 'E'].indexOf(letter)
            const isDone = letter === 'A'
              ? beat.phase === 'trace' || beat.result
              : elimIdx !== -1 && index >= elimIdx + 1

            const isValid    = letter === 'A'
            const isCurrent  = beat.option === letter

            let bg     = '#F3F4F6'
            let border = '#D1D5DB'
            let color  = '#6B7280'

            if (isCurrent && beat.phase === 'eliminate') {
              bg = RED_BG; border = RED; color = RED_INK
            } else if (isCurrent && (beat.phase === 'trace' || beat.result)) {
              bg = GREEN_BG; border = GREEN; color = GREEN_INK
            } else if (isDone && isValid) {
              bg = GREEN_BG; border = GREEN; color = GREEN_INK
            } else if (isDone && !isValid) {
              bg = RED_BG; border = RED; color = RED_INK
            }

            return (
              <motion.div
                key={letter}
                animate={{ scale: isCurrent ? 1.12 : 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                className="flex h-9 w-9 flex-col items-center justify-center rounded-lg border-2 font-display text-sm font-extrabold leading-none"
                style={{ background: bg, borderColor: border, color }}
              >
                <span>{letter}</span>
                {isDone && !isValid && (
                  <span className="text-[8px] leading-none">✕</span>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* The grid — trail colour flips between red (eliminate) and green (trace/result) */}
        <motion.div
          key={`maze-${index}`}
          initial={{ opacity: 0.75, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
        >
          <BeeMaze1EC
            litPath={beat.litPath}
            trailColor={beat.trailColor}
          />
        </motion.div>

        {/* Answer badge (result beat only) */}
        {beat.result && (
          <motion.div
            key="answer-badge"
            className="flex items-center gap-2 rounded-xl border-2 px-4 py-1.5 font-display text-base font-extrabold"
            style={{ background: AMBER_BG, borderColor: AMBER, color: AMBER_INK }}
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
          >
            {t('Answer A', 'Jawaban A')}
          </motion.div>
        )}

        {/* Caption */}
        <motion.div
          key={`cap-${index}`}
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.22 }}
          className="min-h-[48px] w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </motion.div>

      </div>
    </div>
  )
}
