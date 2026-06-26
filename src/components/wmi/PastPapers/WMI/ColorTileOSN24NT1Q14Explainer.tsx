import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ColorTileFigure } from './ColorTileOSN24NT1Q14Illustration'
import { buildColorTileOSN24NT1Q14Steps } from './colorTileOSN24NT1Q14Steps'

const GREEN_BG  = '#D1FAE5'
const GREEN_BD  = '#059669'
const GREEN_INK = '#065F46'
const BLUE_BG   = '#DBEAFE'
const BLUE_BD   = '#2563EB'
const BLUE_INK  = '#1E3A8A'

export default function ColorTileOSN24NT1Q14Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'id'
  const steps = useMemo(() => buildColorTileOSN24NT1Q14Steps(lang), [lang])
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
          ? 'Penjelasan: pewarnaan bangun bersisian — total 648 susunan warna.'
          : 'Explainer: adjacent-shape colouring — 648 valid colour arrangements.'
      }
    >
      <div className="flex flex-col items-center gap-3">
        <motion.div
          key={`tile-${index}`}
          initial={{ opacity: 0.8, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          className="w-full"
        >
          <ColorTileFigure
            highlight={beat.highlight}
            colorMap={beat.colorMap}
          />
        </motion.div>

        <motion.div
          key={`cap-${index}`}
          className="w-full min-h-[48px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN_BD, color: GREEN_INK }
              : { background: BLUE_BG,  borderColor: BLUE_BD,  color: BLUE_INK }
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
