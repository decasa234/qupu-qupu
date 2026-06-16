import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Pieces20, Cuboid20 } from './P20G2Q6Illustration'
import { buildP20G2Q6Steps } from './p20G2Q6Steps'

// WMI-20P2A-Q6 — post-answer animation for "which solid can be built from the
// pieces?". The four options were images, so the seed answer (default "B") names
// the correct one. We reuse the Pieces20 + Cuboid20 primitives: first count the
// 3 matched pairs, then assemble the cuboid one face-pair per beat (long → front,
// wide → top, small → ends), landing on option B. The cube is named as the trap.

const GREEN = '#10B981'
const BLUE = '#30598A'

export default function P20G2Q6Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answerLabel = (props.correctAnswer || 'B').trim() || 'B'
  const story = useMemo(() => buildP20G2Q6Steps(lang, answerLabel), [lang, answerLabel])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: tiga pasang persegi panjang adalah 6 sisi sebuah kotak (balok), jadi jawabannya pilihan ${answerLabel}.`
      : `Explainer: three pairs of rectangles are the 6 faces of a box (cuboid), so the answer is option ${answerLabel}.`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex w-full items-center justify-center" style={{ minHeight: 150 }}>
          {beat.showBox ? (
            <motion.div
              key="box"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
            >
              <Cuboid20 litPair={beat.litPair} />
            </motion.div>
          ) : (
            <Pieces20 highlightId={beat.highlightId} />
          )}
        </div>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
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
