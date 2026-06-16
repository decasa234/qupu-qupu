import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Maze23G2, OPTIMAL_ROUTE } from './RobotMaze23G2Illustration'
import { buildRobotMaze23G2Steps } from './robotMaze23G2Steps'

// WMI-23F2A-Q25 — post-answer explainer for the forward/right-only square maze
// (answer = 20). We walk the verified shortest legal route ONE square per beat
// with a running squares-passed counter, calling out the two revisited squares
// that push the count up — so the kid SEES why repeats add to 20 instead of just
// being told. The traced route + robot are drawn by the Maze23G2 primitive (the
// same scene as the static figure), driven by route=OPTIMAL_ROUTE + step=beat.step.
//
// Echo the qupu tokens the static maze already uses so the animation reads as the
// same scene coming alive (route / robot in fill-qupu-brand-orange / -brand-blue).
const ORANGE = '#f0853a' // fill-qupu-brand-orange (route / count accent)
const BLUE = '#30598A' // fill-qupu-brand-blue (intro / straight accent)
const GREEN = '#10B981' // result accent (the exit)
const PURPLE = '#7C5CBF' // revisit accent (a square used again)

export default function RobotMaze23G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildRobotMaze23G2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const counting = beat.phase === 'step' || beat.result
  const accent = beat.result ? GREEN : beat.revisit ? PURPLE : beat.move === 'right' ? ORANGE : BLUE

  // Label for the move chip.
  const moveLabel =
    beat.move === 'enter'
      ? t('enter', 'masuk')
      : beat.move === 'right'
        ? t('turn right', 'belok kanan')
        : t('go straight', 'lurus')

  const ariaLabel = t(
    `Explainer: walk the shortest legal route through the square maze one square at a time. The robot may only go straight or turn right, and every square it enters counts — even the two it passes through twice. Counting all ${OPTIMAL_ROUTE.length} squares, the least number passed through is ${story.answer}.`,
    `Penjelasan: telusuri rute sah terpendek di labirin persegi satu kotak demi satu kotak. Robot hanya boleh lurus atau belok kanan, dan setiap kotak yang dimasuki dihitung — termasuk dua kotak yang dilewati dua kali. Menghitung semua ${OPTIMAL_ROUTE.length} kotak, paling sedikit yang dilewati adalah ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The maze with the route traced up to the current square. */}
        <Maze23G2 route={OPTIMAL_ROUTE} step={beat.step} />

        {/* Tally panel: the move taken vs. the running squares-passed count. */}
        <div className="flex w-full items-stretch justify-center gap-2">
          <TallyChip
            color={beat.revisit ? PURPLE : beat.move === 'right' ? ORANGE : BLUE}
            label={t('this move', 'gerakan ini')}
            value={moveLabel}
            active={counting || beat.phase === 'intro'}
          />
          <div className="flex items-center font-display text-lg font-black text-qupu-muted">→</div>
          <TallyChip
            color={ORANGE}
            label={t('squares passed', 'kotak dilewati')}
            value={`${beat.count} / ${story.answer}`}
            active={counting}
          />
        </div>

        {/* Big running counter once we start walking; turns green at the exit. */}
        {counting && (
          <motion.div
            key={`count-${beat.count}-${beat.result ? 'r' : 's'}-${index}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 480, damping: 22 }}
            className="font-display text-3xl font-black tabular-nums"
            style={{ color: accent }}
          >
            {beat.count}
          </motion.div>
        )}

        {/* Caption box — tinted by the move type / revisit / result. */}
        <motion.div
          key={`cap-${index}`}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.revisit
                ? { background: '#EFE9FA', borderColor: PURPLE, color: '#4A3585' }
                : beat.move === 'right'
                  ? { background: '#FFF1E6', borderColor: ORANGE, color: '#9a4a12' }
                  : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}

function TallyChip({
  color,
  label,
  value,
  active,
}: {
  color: string
  label: string
  value: string
  active: boolean
}) {
  return (
    <motion.div
      animate={{ scale: active ? 1 : 0.96, opacity: active ? 1 : 0.7 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className="flex flex-1 flex-col items-center gap-1 rounded-xl border-2 px-2 py-1.5"
      style={{ borderColor: color, background: '#FFFFFF' }}
    >
      <span className="font-display text-sm font-black tabular-nums" style={{ color }}>
        {value}
      </span>
      <span className="text-center text-[10px] font-bold uppercase tracking-wide text-qupu-muted">{label}</span>
    </motion.div>
  )
}
