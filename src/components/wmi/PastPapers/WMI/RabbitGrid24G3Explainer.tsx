import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildRabbitSteps } from './rabbitGrid24G3Steps'
import { RabbitGridFigure } from './RabbitGrid24G3Illustration'

// Post-answer explainer for WMI-24F3A-Q24 (HARD). The rabbit has exactly one
// jump path that skips every stone and ends at the carrot: E,F,H,G,B,A,C,D.
// We trace it one jump per beat (driving RabbitGridFigure's pathUpto), stamp
// each stone's visit number, then read A,C,E,G → ACEG = 6714. Everything is
// derived from the shared jump data (the anti-drift glue), never re-hardcoded.

// Palette echoes the static figure (qupu tokens).
const ORANGE = '#f0853a' // qupu-brand-orange (path / lit stone)
const BRAND_BLUE = '#30598A' // qupu-brand-blue (captions)
const PEACH = '#FFD3B1' // qupu-peach
const SHELL = '#FFF9F4' // qupu-shell (panel)
const GREEN = '#10B981'
const GREEN_INK = '#065F46'

// A small chip showing one answer-key stone (A,C,E,G) and the visit number it
// got. Lights up green the moment that stone is reached on the path.
function KeyChip({ stone, visit }: { stone: string; visit?: number }) {
  const known = visit != null
  return (
    <motion.div
      animate={{ scale: known ? 1.04 : 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      className="flex flex-col items-center rounded-lg border-2 px-2.5 py-1"
      style={{
        background: known ? '#ECFDF5' : SHELL,
        borderColor: known ? GREEN : PEACH,
      }}
    >
      <span className="font-display text-sm font-black" style={{ color: known ? GREEN_INK : BRAND_BLUE }}>
        {stone}
      </span>
      <span className="font-display text-lg font-black tabular-nums" style={{ color: known ? GREEN_INK : '#9aa3b2' }}>
        {known ? visit : '?'}
      </span>
    </motion.div>
  )
}

export default function RabbitGrid24G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildRabbitSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const { aceg, answer } = story

  const ariaLabel = T(
    `Strategy: trace the one jump path that skips every stone and ends at the carrot, then read the visit numbers of A, C, E, G. ACEG = ${answer}.`,
    `Strategi: telusuri satu jalur lompat yang melewati setiap batu dan berakhir di wortel, lalu baca nomor kunjungan A, C, E, G. ACEG = ${answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[300px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* the grid coming alive: path grows jump by jump, the active stone lit */}
        <motion.div
          key={`grid-${beat.litStone ?? 'none'}-${beat.pathUpto}`}
          initial={{ opacity: 0.85 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="w-full"
        >
          <RabbitGridFigure litStone={beat.litStone} pathUpto={beat.pathUpto} />
        </motion.div>

        {/* answer-key chips: A, C, E, G fill in as the rabbit reaches them */}
        <div className="flex items-center gap-2">
          <span className="font-display text-xs font-extrabold" style={{ color: BRAND_BLUE }}>
            {T('A C E G', 'A C E G')}
          </span>
          <KeyChip stone="A" visit={beat.revealed.A} />
          <KeyChip stone="C" visit={beat.revealed.C} />
          <KeyChip stone="E" visit={beat.revealed.E} />
          <KeyChip stone="G" visit={beat.revealed.G} />
        </div>

        {/* assembled answer, revealed on the final beat */}
        <div className="flex min-h-[1.75rem] items-center justify-center">
          {beat.result && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="font-display text-2xl font-black tabular-nums"
              style={{ color: GREEN_INK }}
            >
              {`ACEG = ${aceg.A}${aceg.C}${aceg.E}${aceg.G}`}
            </motion.div>
          )}
        </div>

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : { background: '#E1EFFB', borderColor: ORANGE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
