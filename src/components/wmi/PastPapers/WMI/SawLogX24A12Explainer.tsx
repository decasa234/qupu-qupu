/**
 * SEAMOX-24-A-Q12 — Animated explainer
 *
 * Walks through adding cuts to a log one at a time until we have 4 pieces,
 * then reveals 3 cuts × 2 min = 6 minutes.
 *
 * Uses `SawLogSVG` from the illustration file (shared SVG geometry).
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SawLogSVG } from './SawLogX24A12Illustration'
import { buildSawLogX24A12Steps } from './sawLogX24A12Steps'

const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'

export default function SawLogX24A12Explainer(props: ExplainerProps) {
  const lang  = (props.lang ?? 'en') as 'en' | 'id'
  const story = useMemo(() => buildSawLogX24A12Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? '3 potongan menghasilkan 4 bagian; 3 × 2 = 6 menit.'
      : '3 cuts make 4 pieces; 3 × 2 = 6 minutes.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* animated log */}
        <motion.div
          key={`log-${beat.cuts}-${beat.highlightCut}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          <SawLogSVG cuts={beat.cuts} highlightCut={beat.highlightCut} />
        </motion.div>

        {/* caption */}
        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="min-h-[44px] w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
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
