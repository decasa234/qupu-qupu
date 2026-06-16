import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Q19Figure, Q19_VIEW_W } from './P22G1Q19Illustration'
import { buildP22G1Q19Steps } from './p22G1Q19Steps'

// WMI-22P1A-Q19 — post-answer enumeration. Each triangle in the figure lights up
// one at a time (smallest cells first, then the bigger combined triangles) with
// a running counter, landing on the keyed option. Reuses the static Q19Figure so
// the animation reads as the same picture coming alive. SSR-safe, deterministic.

const GREEN = '#10B981'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'

export default function P22G1Q19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answerLetter = props.correctAnswer || 'C'
  const story = useMemo(() => buildP22G1Q19Steps(lang, answerLetter), [lang, answerLetter])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const aria =
    lang === 'id'
      ? `Penjelasan: hitung setiap segitiga besar dan kecil satu per satu; kunci jawaban menandai pilihan ${answerLetter}.`
      : `Explainer: count every triangle big and small one at a time; the answer key marks option ${answerLetter}.`

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-full" style={{ maxWidth: Q19_VIEW_W }}>
          <Q19Figure litId={beat.litId} />

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
              <span aria-hidden="true">{lang === 'id' ? 'Hitung:' : 'Count:'}</span>
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
