import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CubeWall, TOTAL_CUBES } from './P23G3Q18Illustration'
import { buildP23G3Q18Steps } from './p23G3Q18Steps'

// WMI-23P3A-Q18 — post-answer explainer for the unit-cube wall.
// Reuses the CubeWall primitive: each beat lights one more bottom layer and
// shows the running cube total, landing on 49 → choice C.

const GREEN = '#10B981'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'

export default function P23G3Q18Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildP23G3Q18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const aria = t(
    `Count the one-cube-thick wall layer by layer from the bottom: ${TOTAL_CUBES} cubes in all, so the answer is choice C.`,
    `Hitung tembok setebal satu kubus lapis demi lapis dari bawah: ${TOTAL_CUBES} kubus seluruhnya, jadi jawabannya pilihan C.`,
  )

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-full" style={{ maxWidth: 300 }}>
          <CubeWall litLayers={beat.litLayers} />

          {/* running cube-count chip */}
          {beat.count > 0 && (
            <motion.div
              key={`count-${beat.count}`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
              className="absolute right-0 top-0 flex items-center gap-1 rounded-xl border-2 px-2.5 py-1 font-display text-base font-extrabold"
              style={{
                background: beat.result ? '#D1FAE5' : BLUE_BG,
                borderColor: beat.result ? GREEN : BLUE,
                color: beat.result ? '#065F46' : BLUE,
              }}
            >
              <span aria-hidden="true">{t('Cubes:', 'Kubus:')}</span>
              <span>{beat.count}</span>
            </motion.div>
          )}
        </div>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
