import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TrainBox4EC } from './TrainBox4ECIllustration'
import { buildTrainBox4ECSteps } from './trainBox4ECSteps'

// Colour tokens echo the illustration palette.
const INK = '#1F2937'
const BLUE = '#30598A'          // qupu-brand-blue
const BLUE_BG = '#E1EFFB'
const SHELL = '#FFF9F4'         // qupu-shell (panel bg)
const WARM_GREY = '#E4DACB'     // panel border
const GREEN = '#10B981'
const GREEN_DARK = '#065F46'

const ARIA_EN =
  'Bill must move 5 boxes to open the TRAIN box: ' +
  'first the top row (books, music sheets, board games = 3 moves), ' +
  'then the middle-row blockers (stuffed animals, bedding = 2 more). ' +
  'Minimum moves: 5. Answer C.'
const ARIA_ID =
  'Bill harus memindahkan 5 kotak untuk membuka kotak TRAIN: ' +
  'pertama baris atas (books, music sheets, board games = 3 langkah), ' +
  'lalu penghalang baris tengah (stuffed animals, bedding = 2 lagi). ' +
  'Minimum langkah: 5. Jawaban C.'

export default function TrainBox4ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildTrainBox4ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Caption panel style — green on result, blue otherwise.
  const captionStyle = beat.result
    ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_DARK }
    : { background: BLUE_BG, borderColor: BLUE, color: INK }

  return (
    <div
      className="mx-auto w-full max-w-[340px]"
      role="img"
      aria-label={lang === 'id' ? ARIA_ID : ARIA_EN}
    >
      <div
        className="flex flex-col items-center gap-3 rounded-2xl border-2 px-3 py-4"
        style={{ background: SHELL, borderColor: WARM_GREY }}
      >
        {/* Running move count — appears once Bill starts moving boxes. */}
        {beat.count > 0 && (
          <motion.div
            key={`count-${beat.count}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 340, damping: 20 }}
            className="font-display text-3xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : BLUE }}
          >
            {beat.count}
          </motion.div>
        )}

        {/* The box-shelf scene — boxes dim as they are moved. */}
        <TrainBox4EC movedBoxes={beat.movedBoxes} />

        {/* Caption with the step description. */}
        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
