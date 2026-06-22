// IKMC-22-PE-Q11 — Animated explainer for the grid maze problem.
//
// Beat flow:
//   0  intro      — state the constraint (no blue squares)
//   1–4 eliminate — show B/C/D/E each hitting a blue square
//   5  trace      — show route A traced through the maze
//   6  result     — Kanga reaches the koala; answer A confirmed

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { MazeGrid11PE } from './MazeGrid11PEIllustration'
import { buildMazeGrid11PESteps } from './mazeGrid11PESteps'

// Qupu palette
const BLUE   = '#30598A'   // intro accent
const BLUE_BG = '#E1EFFB'
const RED    = '#EF4444'   // elimination accent
const RED_BG = '#FEE2E2'
const RED_INK = '#991B1B'
const GREEN  = '#10B981'   // valid / result accent
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const AMBER  = '#F59E0B'   // trace route colour

export default function MazeGrid11PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildMazeGrid11PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = t(
    'Explainer: trace each route on the 7×5 grid. Routes B, C, D, E each cross a blue square and are eliminated. Route A avoids all blue squares and is the valid path — answer A.',
    'Penjelasan: telusuri setiap rute pada kotak-kotak 7×5. Rute B, C, D, E masing-masing melewati kotak biru dan dieliminasi. Rute A menghindari semua kotak biru dan merupakan jalur valid — jawaban A.',
  )

  // Derive caption box style from current beat
  const captionStyle = (() => {
    if (beat.result) return { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    if (beat.phase === 'trace') return { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    if (beat.phase === 'eliminate') return { background: RED_BG, borderColor: RED, color: RED_INK }
    return { background: BLUE_BG, borderColor: BLUE, color: BLUE }
  })()

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Option status rail — one chip per option A–E */}
        <div className="flex w-full items-center justify-center gap-2">
          {(['A', 'B', 'C', 'D', 'E'] as const).map((letter) => {
            const isDone = (() => {
              // A chip is "done" if we've passed the beat that covers it
              if (letter === 'A') return beat.phase === 'trace' || beat.result
              const elimIdx = ['B', 'C', 'D', 'E'].indexOf(letter)
              // eliminate beats are indices 1–4
              return index >= elimIdx + 1
            })()
            const isValid = letter === 'A'
            const isCurrent = beat.option === letter

            let bg = '#F3F4F6'
            let border = '#D1D5DB'
            let color = '#6B7280'

            if (isCurrent && beat.phase === 'eliminate') { bg = RED_BG; border = RED; color = RED_INK }
            else if (isCurrent && (beat.phase === 'trace' || beat.result)) { bg = GREEN_BG; border = GREEN; color = GREEN_INK }
            else if (isDone && isValid) { bg = GREEN_BG; border = GREEN; color = GREEN_INK }
            else if (isDone && !isValid) { bg = RED_BG; border = RED; color = RED_INK }

            return (
              <motion.div
                key={letter}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                className="flex h-9 w-9 items-center justify-center rounded-lg border-2 font-display text-sm font-extrabold"
                style={{ background: bg, borderColor: border, color }}
              >
                {letter}
                {isDone && !isValid && (
                  <span className="ml-0.5 text-[9px]">✕</span>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* The maze — lit route shown only on trace/result beats */}
        <motion.div
          key={`maze-${index}`}
          initial={{ opacity: 0.7, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
        >
          <MazeGrid11PE litPath={beat.litPath} />
        </motion.div>

        {/* Route A answer badge (shows on result beat) */}
        {beat.result && (
          <motion.div
            key="answer-badge"
            className="flex items-center gap-2 rounded-xl border-2 px-4 py-1.5 font-display text-base font-extrabold"
            style={{ background: '#FEF3C7', borderColor: AMBER, color: '#92400E' }}
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
