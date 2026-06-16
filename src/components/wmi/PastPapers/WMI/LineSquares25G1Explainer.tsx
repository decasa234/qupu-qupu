import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { LineSquares25G1 } from './LineSquares25G1Illustration'
import { buildLineSquares25G1Steps } from './lineSquares25G1Steps'

// Echo the qupu tokens used by the static figure so the animation reads as the
// same scene coming alive.
const ORANGE = '#f0853a' // fill-qupu-orange — the line + crossed-cell wash
const GREEN = '#10B981' // result accent
const BLUE = '#30598A' // fill-qupu-blue — neutral caption ink

export default function LineSquares25G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildLineSquares25G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const accent = beat.result ? GREEN : ORANGE

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: garis lurus terbaik melintasi kisi 4 kali 4 dengan melewati semua garis dalam — paling banyak ${story.answer} kotak.`
      : `Explainer: the best straight line crosses every interior gridline of the 4 by 4 grid — at most ${story.answer} squares.`

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <LineSquares25G1 showLine={beat.showLine} shadeCrossed={beat.shadeCrossed} />

        {/* running cell-count + crossings badges */}
        {beat.running > 0 && (
          <div className="flex items-center gap-2">
            <motion.div
              key={`run-${beat.running}-${beat.result ? 'r' : 'p'}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 360, damping: 22 }}
              className="font-display text-2xl font-black tabular-nums"
              style={{ color: accent }}
            >
              {beat.running}
            </motion.div>
            {beat.crossings != null && (
              <motion.div
                key={`cr-${beat.phase}`}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                className="rounded-full px-2 py-0.5 font-display text-xs font-extrabold"
                style={{ background: '#FCE9D8', color: ORANGE }}
              >
                {lang === 'id' ? `+${beat.crossings} lintasan` : `+${beat.crossings} crossings`}
              </motion.div>
            )}
          </div>
        )}

        <motion.div
          key={index}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.28 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.showLine
                ? { background: '#FFFFFF', borderColor: ORANGE, color: '#9A4A12' }
                : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
