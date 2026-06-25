import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SquareRect19B4 } from './SquareRect19B4Illustration'
import { buildSquareRect19B4Steps, AREA, ANSWER_CHOICE } from './squareRect19B4Steps'

// SEAMO-19-B-Q4 — Square ABCD contains tilted rectangle EFGH; find area.
// Answer: 16 cm² → choice D.
//
// Beats:
//   1. Derive side of square from FB = 4, FB = 2·AF → AF = 2, side = 6.
//   2. Place coordinates; show E F G H.
//   3. Apply shoelace formula — show the arithmetic.
//   4. Area = 16 cm² → choice D.

const GREEN = '#10B981'
const BLUE = '#30598A'
const ORANGE = '#f0853a'

export default function SquareRect19B4Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildSquareRect19B4Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: FB = 4 so AF = 2 and the square has side 6. Coordinates: E=(0,4) F=(2,6) G=(6,2) H=(4,0). Shoelace formula gives area = ${AREA} cm², choice ${ANSWER_CHOICE}.`,
    `Penjelasan: FB = 4 jadi AF = 2 dan persegi bersisi 6. Koordinat: E=(0,4) F=(2,6) G=(6,2) H=(4,0). Rumus tali sepatu memberikan luas = ${AREA} cm², pilihan ${ANSWER_CHOICE}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* figure coming alive */}
        <SquareRect19B4 showCoords={beat.showCoords} showArea={beat.showArea} />

        {/* live arithmetic line */}
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
                  ? t(`Area of EFGH = ${beat.math}`, `Luas EFGH = ${beat.math}`)
                  : beat.math}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* kid-first caption */}
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
