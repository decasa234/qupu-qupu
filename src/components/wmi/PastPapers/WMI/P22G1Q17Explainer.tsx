import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CubeLayerModel } from './P22G1Q17Illustration'
import { buildP22G1Q17Steps } from './p22G1Q17Steps'

// WMI-22P1A-Q17 — post-answer animation. Lights one horizontal layer at a time
// (bottom → top), reports its cube count, builds the [4, 1, 1] layer list and
// lands on the keyed option B. Reuses the static CubeLayerModel primitive so the
// animation reads as the same solid coming alive. SSR-safe, deterministic.

const GREEN = '#10B981'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'

export default function P22G1Q17Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answerLetter = props.correctAnswer || 'B'
  const story = useMemo(() => buildP22G1Q17Steps(lang, answerLetter), [lang, answerLetter])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const aria =
    lang === 'id'
      ? `Penjelasan: lapisan dari bawah ke atas berisi ${story.layers.join(', ')} kubus, jadi gambar ${answerLetter}.`
      : `Explainer: layers bottom to top hold ${story.layers.join(', ')} cubes, so figure ${answerLetter}.`

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-full" style={{ maxWidth: 280 }}>
          <CubeLayerModel litLayer={beat.litLayer} />

          {/* running layer-count chips, bottom → top reading order */}
          {beat.revealed.length > 0 && (
            <motion.div
              key={`rev-${beat.revealed.join('-')}`}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
              className="absolute right-0 top-0 flex items-center gap-1 rounded-xl border-2 px-2.5 py-1 font-display text-base font-extrabold"
              style={{
                background: beat.result ? '#D1FAE5' : BLUE_BG,
                borderColor: beat.result ? GREEN : BLUE,
                color: beat.result ? '#065F46' : BLUE,
              }}
            >
              <span>{beat.revealed.join(', ')}</span>
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
