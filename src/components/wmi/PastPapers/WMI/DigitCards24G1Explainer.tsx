import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { DigitCards24G1 } from './DigitCards24G1Illustration'
import { buildDigitCards24G1Steps, type DigitGroup } from './digitCards24G1Steps'

// Echo the qupu tokens used by the static figure so the animation reads as the
// same scene coming alive.
const BLUE = '#2D7FB8' // even group (qupu-brand-blue)
const BLUE_DK = '#1E5C86'
const BLUE_FILL = '#E1EFFB'
const ORANGE = '#F2912B' // odd group (qupu-brand-orange)
const ORANGE_DK = '#C56A12'
const ORANGE_FILL = '#FCEBD6'
const GREEN = '#10B981'
const SLATE = '#CBD5E1'

const groupTone = (group: DigitGroup) =>
  group === 'even'
    ? { stroke: BLUE, fill: BLUE_FILL, text: BLUE_DK }
    : { stroke: ORANGE, fill: ORANGE_FILL, text: ORANGE_DK }

export default function DigitCards24G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildDigitCards24G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const tone = groupTone(beat.group)
  const groupLabel =
    beat.group === 'even'
      ? lang === 'id'
        ? 'genap'
        : 'even'
      : lang === 'id'
        ? 'ganjil'
        : 'odd'

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: buat genap 3 angka terkecil (${story.even}), lalu dari kartu sisa buat ganjil 2 angka terbesar — jawabannya ${story.answer}.`
      : `Explainer: build the smallest 3-digit even number (${story.even}), then the largest 2-digit odd from the leftovers — the answer is ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Mirror of the static figure: cards light up as they're chosen. */}
        <DigitCards24G1 pick3={beat.pick3} pick2={beat.pick2} showFormed={beat.showFormed} />

        {/* The number being assembled, slot by slot, coloured by group. */}
        <div className="flex items-center gap-2" aria-hidden="true">
          <span className="mr-1 font-display text-xs font-extrabold uppercase tracking-wide" style={{ color: tone.text }}>
            {groupLabel}
          </span>
          {beat.slots.map((d, i) => {
            const filled = d !== ''
            const done = beat.result
            return (
              <motion.div
                key={`${beat.group}-${i}`}
                initial={{ scale: 0.85 }}
                animate={{ scale: filled ? 1 : 0.92 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                className="flex h-12 w-10 items-center justify-center rounded-lg border-2 font-display text-3xl font-black tabular-nums"
                style={
                  filled
                    ? done
                      ? { borderColor: GREEN, background: '#D1FAE5', color: '#065F46' }
                      : { borderColor: tone.stroke, background: tone.fill, color: tone.text }
                    : { borderColor: SLATE, background: '#FFFFFF', color: SLATE }
                }
              >
                {filled ? d : '?'}
              </motion.div>
            )
          })}
        </div>

        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.group === 'even'
                ? { background: BLUE_FILL, borderColor: BLUE, color: BLUE_DK }
                : { background: ORANGE_FILL, borderColor: ORANGE, color: ORANGE_DK }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
