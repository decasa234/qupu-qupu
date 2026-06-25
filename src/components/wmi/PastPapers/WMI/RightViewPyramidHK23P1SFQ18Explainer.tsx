// Post-answer explainer for HKIMO-23-P1SF-Q18.
// "At least how many squares visible from the right?" — answer: 4.
//
// Animation: show full pyramid → highlight the 4 right-facing squares at x=3.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'
import { HK23P1SFQ18_CUBES } from './RightViewPyramidHK23P1SFQ18Illustration'
import { buildRightViewPyramidHK23P1SFQ18Steps } from './rightViewPyramidHK23P1SFQ18Steps'

const GOLD = '#FBBF24'
const GREEN = '#10B981'

/** The 4 right-face squares at x=3, y=0..3, z=0 */
const RIGHT_FACE_KEYS = new Set(['3,0,0', '3,1,0', '3,2,0', '3,3,0'])

function buildCubes(highlightRightFace: boolean): IsoCube[] {
  return HK23P1SFQ18_CUBES.map((c) => {
    const key = `${c.x},${c.y},${c.z}`
    if (highlightRightFace && RIGHT_FACE_KEYS.has(key)) {
      return { ...c, color: GOLD }
    }
    return c
  })
}

export default function RightViewPyramidHK23P1SFQ18Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildRightViewPyramidHK23P1SFQ18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const cubes = buildCubes(beat.highlightRightFace)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: lihat piramida dari kanan. Kolom kanan punya 4 persegi.'
      : 'Explainer: view pyramid from right. Right column has 4 visible squares.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Pyramid figure — right face highlighted when beat.highlightRightFace */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <IsoCubes
            cubes={cubes}
            size={22}
            palette={ISO_BLUE_PALETTE}
            viewPadding={10}
          />
        </div>

        {/* Answer count — shown on highlight beat */}
        {beat.highlightRightFace && (
          <motion.div
            key="count-4"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : '#30598A' }}
          >
            4
          </motion.div>
        )}

        {/* Caption */}
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
