import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { ShapePattern23G1 } from './ShapePattern23G1Illustration'
import { buildShapePattern23G1Steps, TARGET_STARS } from './shapePattern23G1Steps'

// Post-answer explainer for WMI-23F1A-Q11 (2023 G1 final). The unit △ ▲ □ ☆ ★
// adds 2 stars per repeat, and those stars sit AFTER that unit's ▲. So the stars
// before the ▲ of unit n are 2(n − 1). The animation walks the running star
// count one unit at a time (0 → 2 → 4 → … → 12), reaches 12 at unit 7, and rings
// that ▲ at position 32 — landing on the answer.
//
// Reuses the ShapePattern23G1 primitive (do NOT redraw the strip) with its
// revealCountUpTo / markTriangleIndex overlays, so the animation reads as the
// same scene coming alive. Pure render of lang; SSR-safe.

// Echo the qupu tokens the static figure samples.
const STAR_BLUE = '#30598A' // running star tally → matches STAR_LABEL in the figure
const ORANGE = '#f0853a' // target ring colour from the figure
const WIN = '#10B981'
const INK = '#2B2622'

// Show enough of the strip to reach position 32 (unit 7's ▲) plus a little tail.
const STRIP_LENGTH = 35

export default function ShapePattern23G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildShapePattern23G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const accent = beat.result || beat.hit ? WIN : STAR_BLUE

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: tiap unit menambah 2 bintang setelah ▲-nya, jadi bintang sebelum ▲ unit ke-n = 2(n−1). Saat mencapai ${TARGET_STARS} bintang di unit ${story.winningUnit}, ▲-nya ada di posisi ${story.answer}.`
      : `Explainer: each unit adds 2 stars after its ▲, so stars before unit n's ▲ = 2(n−1). Reaching ${TARGET_STARS} stars at unit ${story.winningUnit}, its ▲ sits at position ${story.answer}.`

  // The running star count to spotlight (skip on the bare intro beat).
  const showTally = beat.phase !== 'intro' || beat.revealUpTo != null
  const tally = beat.starsBefore

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="overflow-x-auto">
          <ShapePattern23G1
            length={STRIP_LENGTH}
            revealCountUpTo={beat.revealUpTo ?? undefined}
            markTriangleIndex={beat.markPos}
          />
        </div>

        {showTally && (
          <motion.div
            key={`tally-${tally}`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 340, damping: 20 }}
            className="flex items-baseline gap-1.5 font-display"
            style={{ color: beat.hit ? WIN : STAR_BLUE }}
          >
            <span className="text-2xl font-black tabular-nums">{tally}</span>
            <span className="text-sm font-extrabold">
              {lang === 'id' ? `/ ${TARGET_STARS} bintang` : `/ ${TARGET_STARS} stars`}
            </span>
          </motion.div>
        )}

        {beat.result && beat.trianglePos != null && (
          <motion.div
            key="answer"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: WIN }}
          >
            {lang === 'id' ? 'Posisi ' : 'Position '}
            <span style={{ color: ORANGE }}>{beat.trianglePos}</span>
          </motion.div>
        )}

        <motion.div
          key={index}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: WIN, color: '#065F46' }
              : beat.hit
                ? { background: '#FDEBDD', borderColor: ORANGE, color: INK }
                : { background: '#FFFFFF', borderColor: accent, color: accent }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
