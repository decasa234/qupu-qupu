import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { CookieSort24G1 } from './CookieSort24G1Illustration'
import { buildCookieSort24G1Steps } from './cookieSort24G1Steps'

// Mirror the illustrator's qupu tokens so the animation reads as the same scene.
const GREEN = '#10B981' // fill-qupu-emerald — a "same kind" trio passes
const ORANGE = '#f0853a' // matches the figure's lit-cookie orange / the answer
const RED = '#DC2626' // a trio that shares nothing — the odd one out
const BLUE = '#30598A' // working-state caption border

export default function CookieSort24G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCookieSort24G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Verdict colour: green for a same-kind trio, red for the odd one out.
  const verdict = beat.ok ? GREEN : beat.odd ? RED : BLUE

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: tiap kelompok dinyalakan dan dicek. A semua lingkaran, B semua 4 titik, C semua 1 titik, D semua segitiga — semua sejenis. E (1, 3, 6) bentuknya beda dan titiknya beda, jadi tidak sejenis. Jawabannya E.'
      : 'Explainer: light each group and check it. A all circles, B all 4 dots, C all 1 dot, D all triangles — each is the same kind. E (1, 3, 6) has mixed shapes and mixed dots, so it is not the same kind. The answer is E.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Reuse the static figure; light the current trio. */}
        <CookieSort24G1 litGroup={beat.litGroup} />

        {/* Option-letter badge + ✓/✗ verdict for the trio under test. */}
        {beat.label && (
          <motion.div
            key={`badge-${index}`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: beat.result ? 1.1 : 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="flex items-center gap-2 rounded-full border-2 px-4 py-1.5 font-display text-lg font-black"
            style={{ borderColor: verdict, color: verdict, background: '#FFFFFF' }}
          >
            <span>{beat.label}</span>
            <span aria-hidden>{beat.ok ? '✓' : '✗'}</span>
          </motion.div>
        )}

        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#FEE2E2', borderColor: RED, color: '#991B1B' }
              : beat.ok
                ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
                : beat.odd
                  ? { background: '#FEE2E2', borderColor: RED, color: '#991B1B' }
                  : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>

        {beat.result && (
          <motion.div
            key="answer"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black"
            style={{ color: ORANGE }}
          >
            {lang === 'id' ? 'Jawaban: ' : 'Answer: '}
            {story.answer}
          </motion.div>
        )}
      </div>
    </div>
  )
}
