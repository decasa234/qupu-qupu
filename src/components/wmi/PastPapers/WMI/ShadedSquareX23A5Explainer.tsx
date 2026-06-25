// SEAMO-X 2023 Paper A Q5 — animated explainer.
// Drives beat-by-beat through: intro → outer square (144) → diamond (72) → shaded (36) → result.
// Beat 0 (intro) → Beat 1 (outer) → Beat 2 (diamond) → Beat 3 (shaded) → Beat 4 (result).

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ShadedSquareX23A5 } from './ShadedSquareX23A5Illustration'
import { buildShadedSquareX23A5Steps } from './shadedSquareX23A5Steps'

const BLUE      = '#1E40AF'
const BLUE_BG   = '#DBEAFE'
const GREEN     = '#059669'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#064E3B'

export default function ShadedSquareX23A5Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildShadedSquareX23A5Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: luas terluar 144 cm², belah ketupat 72 cm², daerah diarsir 36 cm².'
      : 'Explainer: outer area 144 cm², diamond 72 cm², shaded region 36 cm².'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* equation badge */}
        {beat.equation ? (
          <motion.div
            key={`eq-${index}`}
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="rounded-full px-5 py-1 text-sm font-extrabold tabular-nums"
            style={
              beat.result
                ? { background: GREEN, color: '#FFFFFF' }
                : { background: '#FFFFFF', border: `2px solid ${BLUE}`, color: BLUE }
            }
          >
            {beat.equation}
          </motion.div>
        ) : (
          <div className="h-8" />
        )}

        {/* figure with per-beat phase highlight */}
        <motion.div
          key={`fig-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26 }}
          className="w-full"
        >
          <ShadedSquareX23A5 phase={beat.phase} />
        </motion.div>

        {/* caption */}
        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          className="min-h-[44px] w-full max-w-[340px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>

      </div>
    </div>
  )
}
