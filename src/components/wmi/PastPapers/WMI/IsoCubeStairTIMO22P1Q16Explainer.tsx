// Post-answer explainer for TIMO-22-P1H-Q16.
// "Ada berapa kubus dalam gambar 2?" — Answer: 20
//
// Animation: figure 1 lights up gold (unit counted = 5),
// then figure 2 reveals one copy at a time (each new copy lit gold),
// landing on 4 copies × 5 = 20.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE, ISO_GOLD_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'
import {
  TIMO22P1Q16_UNIT,
} from './IsoCubeStairTIMO22P1Q16Illustration'
import { buildIsoCubeStairTIMO22P1Q16Steps } from './isoCubeStairTIMO22P1Q16Steps'

const GREEN = '#10B981'

/** Build figure-2 cubes, highlighting the most-recently-added copy in gold. */
function buildFig2Cubes(copiesRevealed: number): IsoCube[] {
  const result: IsoCube[] = []
  for (let i = 0; i < copiesRevealed; i++) {
    const isNew = i === copiesRevealed - 1
    TIMO22P1Q16_UNIT.forEach((c) =>
      result.push({
        ...c,
        x: c.x + i,
        color: isNew ? ISO_GOLD_PALETTE.top : undefined,
      }),
    )
  }
  return result
}

export default function IsoCubeStairTIMO22P1Q16Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildIsoCubeStairTIMO22P1Q16Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const unitCubes: IsoCube[] = TIMO22P1Q16_UNIT.map((c) => ({
    ...c,
    color: beat.phase === 'unit' ? ISO_GOLD_PALETTE.top : undefined,
  }))

  const fig2Cubes = buildFig2Cubes(beat.copiesRevealed)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Gambar 1 = 5 kubus; Gambar 2 = 4 salinan × 5 = 20 kubus.'
      : 'Explainer: Figure 1 = 5 cubes; Figure 2 = 4 copies × 5 = 20 cubes.'

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-end justify-center gap-4">
          {/* Figure 1 — unit shape */}
          <div className="flex flex-col items-center gap-1">
            <span className="font-display text-xs font-bold text-gray-500">
              {lang === 'id' ? 'Gambar 1 (satuan)' : 'Figure 1 (unit)'}
            </span>
            <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2">
              <IsoCubes
                cubes={unitCubes}
                size={22}
                palette={ISO_BLUE_PALETTE}
                viewPadding={6}
              />
            </div>
          </div>

          {/* Figure 2 — revealed copy by copy */}
          {beat.copiesRevealed > 0 && (
            <div className="flex flex-col items-center gap-1">
              <span className="font-display text-xs font-bold text-gray-500">
                {lang === 'id' ? 'Gambar 2' : 'Figure 2'}
              </span>
              <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2">
                <IsoCubes
                  cubes={fig2Cubes}
                  size={22}
                  palette={ISO_BLUE_PALETTE}
                  viewPadding={6}
                />
              </div>
            </div>
          )}
        </div>

        {beat.runningTotal > 0 && (
          <motion.div
            key={`count-${beat.runningTotal}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : '#30598A' }}
          >
            {beat.runningTotal}
          </motion.div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
