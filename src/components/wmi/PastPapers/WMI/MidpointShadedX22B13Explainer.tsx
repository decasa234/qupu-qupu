import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { MidpointShadedX22B13 } from './MidpointShadedX22B13Illustration'
import { buildMidpointShadedX22B13Steps, INNER_AREA } from './midpointShadedX22B13Steps'

// SEAMO-X 2022 Paper B Q13 — Square ABCD (area 50 cm²); E,F,G,H are midpoints.
// Lines A→H, B→E, C→F, D→G form a shaded inner square with area = 50/5 = 10 cm².
//
// Beats:
//   0. Outer square + midpoints — caption: area = 50 cm².
//   1. Draw the 4 construction lines.
//   2. Shade the inner square; show "1/5 × 50".
//   3. Reveal "10 cm²" answer label.

const GREEN  = '#10B981'
const BLUE   = '#30598A'
const ORANGE = '#f0853a'

export default function MidpointShadedX22B13Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const t     = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildMidpointShadedX22B13Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: ABCD square area 50 cm². Lines from corners to non-adjacent midpoints form inner square. Area = 50 ÷ 5 = ${INNER_AREA} cm².`,
    `Penjelasan: Persegi ABCD luas 50 cm². Garis dari sudut ke titik tengah sisi yang tidak berdekatan membentuk persegi dalam. Luas = 50 ÷ 5 = ${INNER_AREA} cm².`,
  )

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* figure */}
        <MidpointShadedX22B13
          showLines={beat.showLines}
          showShading={beat.showShading}
          showAnswer={beat.showAnswer}
        />

        {/* live arithmetic */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="popLayout" initial={false}>
            {beat.math != null && (
              <motion.div
                key={beat.math}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="font-display text-base font-black tabular-nums"
                style={{ color: beat.result ? GREEN : ORANGE }}
              >
                {beat.result
                  ? t(`Area = ${beat.math}`, `Luas = ${beat.math}`)
                  : beat.math}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
