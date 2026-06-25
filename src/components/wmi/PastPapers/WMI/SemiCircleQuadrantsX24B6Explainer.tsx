import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SquareArcScene } from './SemiCircleQuadrantsX24B6Illustration'
import { buildSemiCircleQuadrantsX24B6Steps } from './semiCircleQuadrantsX24B6Steps'

// SEAMOX-24-B-Q6 — animated explainer for the square/semicircle/quadrant area puzzle.
//
// Beat plan (5 beats, finalIndex = 4):
//   0  intro         — square frame + dashed arcs shown, no shading; problem context
//   1  semi-circle   — semi-circle shaded; area = 625π/2 labelled
//   2  quadrants     — corner quadrant areas highlighted (amber); equal area noted
//   3  middle strip  — outside-quadrant strip shaded; area = 1250 − 625π/2
//   4  result        — π terms cancel; total = 1250 cm² confirmed
//
// Reuses SquareArcScene from the illustration so the animation reads as the
// static figure coming alive beat-by-beat.

const GREEN = '#10B981'
const BLUE = '#30598A'

export default function SemiCircleQuadrantsX24B6Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildSemiCircleQuadrantsX24B6Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Luas setengah lingkaran = 625π/2 dan dua kuadran juga = 625π/2. Daerah di luar kuadran = 1250 − 625π/2. Suku π saling menghilangkan: total diarsir = 1250 cm².'
      : 'Explainer: Semi-circle area = 625π/2; two quadrant corner areas = 625π/2 (equal). Outside-quadrant strip = 1250 − 625π/2. The π terms cancel: total shaded = 1250 cm².'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Animated figure — scene props change per beat */}
        <motion.div
          key={`scene-${index}`}
          initial={{ opacity: 0.7, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        >
          <SquareArcScene
            shadeSemi={beat.scene.shadeSemi}
            shadeMiddle={beat.scene.shadeMiddle}
            highlightQuadrants={beat.scene.highlightQuadrants}
          />
        </motion.div>

        {/* Equation badge */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
        <div
          className="min-h-[3.5rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
