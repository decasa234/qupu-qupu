import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Stickers17EC } from './Stickers17ECIllustration'
import { buildStickers17ECSteps } from './stickers17ECSteps'

// Post-answer explainer for IKMC-21-EC-Q17.
// Animates the constraint-propagation deduction on the 5-square sticker strip:
//   1. Fix apple at sq 1.
//   2. Rule out flower at sq 2 (only one free neighbour).
//   3. Rule out flower at sq 3 (forces star to sq 5 — forbidden).
//   4. Land flower at sq 4 (both neighbours free → circle/triangle fit; star → sq 2 ✓).
//   5. Reveal the full arrangement.
//   6. Green spotlight on sq 4 — answer D.
//
// Mirrors Stickers17ECIllustration's colour tokens. Pure render; SSR-safe.

const BLUE = '#30598A'
const GREEN = '#10B981'

export default function Stickers17ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildStickers17ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: dengan eliminasi kendala, bunga ada di kotak ${story.answer} — jawaban D.`
      : `Explainer: by constraint elimination, the flower is on square ${story.answer} — answer D.`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The strip primitive — drives placement + highlighting */}
        <Stickers17EC
          placement={beat.placement}
          highlighted={beat.highlighted}
          answerRing={beat.answerRing}
          showRules={true}
          lang={lang}
        />

        {/* Final answer badge */}
        {beat.result && (
          <motion.div
            key="answer-badge"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: GREEN }}
          >
            {lang === 'id' ? `Kotak ${story.answer}` : `Square ${story.answer}`}
          </motion.div>
        )}

        {/* Caption / instruction card */}
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
