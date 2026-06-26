import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CircleRingFigure } from './CircleRingOSN24NT1Q1Illustration'
import { buildCircleRingOSN24NT1Q1Steps } from './circleRingOSN24NT1Q1Steps'

const GREEN     = '#059669'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE      = '#2563EB'
const BLUE_BG   = '#DBEAFE'

export default function CircleRingOSN24NT1Q1Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'id'
  const steps = useMemo(() => buildCircleRingOSN24NT1Q1Steps(lang), [lang])
  const index = useBeatControl(steps.length - 1, {
    ...props,
    holds: steps.map((s) => s.hold),
  })
  const beat = steps[index] ?? steps[steps.length - 1]

  return (
    <div
      className="mx-auto w-full max-w-[380px]"
      role="img"
      aria-label={
        lang === 'id'
          ? 'Penjelasan: temukan x pada susunan lingkaran dengan syarat jumlah bertetangga. x = 6.'
          : 'Explainer: find x in the circle-ring constraint puzzle. x = 6.'
      }
    >
      <div className="flex flex-col items-center gap-3">
        {/* Ring figure */}
        <motion.div
          key={`ring-${index}`}
          initial={{ opacity: 0.75, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          className="w-full"
        >
          <CircleRingFigure
            highlight={beat.highlight}
            reveal={beat.reveal}
            xSolved={beat.xSolved}
          />
        </motion.div>

        {/* Caption */}
        <motion.div
          key={`caption-${index}`}
          className="w-full min-h-[44px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG,  borderColor: BLUE,  color: BLUE  }
          }
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
