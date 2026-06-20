import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SVG_W,
  SVG_H,
  SockPile,
} from './Socks7Illustration'
import { buildSocks7Steps } from './socks7Steps'

// IKMC-19-PE-Q7 — post-answer animation.
//
// Reuses SockPile from Socks7Illustration so the animation reads as the same
// scattered pile coming alive with highlights.
//
// Animation beats:
//   0. intro   — bare pile, "find matching numbers"
//   1. pair-1  — highlight number 1 socks, counter = 1
//   2. pair-2  — highlight 1+2, counter = 2
//   3. pair-3  — highlight 1+2+3, counter = 3
//   4. pair-4  — highlight 1+2+3+5, counter = 4
//   5. pair-5  — highlight 1+2+3+5+7, counter = 5
//   6. result  — all 5 pairs lit, green "5 pairs → C"

const GREEN = '#10B981'
const BLUE = '#30598A'
const TEAL = '#007A87'

export default function Socks7Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildSocks7Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const litSet = useMemo(() => new Set(beat.litNumbers), [beat.litNumbers])

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: kaus kaki berlabel 1, 2, 3, 5, dan 7 masing-masing muncul dua kali — membentuk 5 pasang. Jawaban C.'
      : 'Explainer: socks labelled 1, 2, 3, 5, and 7 each appear twice — forming 5 pairs. Answer C.'

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />
          <SockPile litNumbers={litSet} />
        </svg>

        {/* pair counter row */}
        <div className="flex min-h-[2.5rem] items-center justify-center gap-2">
          <AnimatePresence mode="wait">
            {beat.pairCount > 0 && (
              <motion.div
                key={beat.pairCount}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="flex items-center gap-2"
              >
                {/* pair dots — one per pair found */}
                {Array.from({ length: beat.pairCount }, (_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0 }}
                    className="h-4 w-4 rounded-full"
                    style={{ background: isResult ? GREEN : TEAL }}
                  />
                ))}
                <span
                  className="ml-1 font-display text-sm font-black tabular-nums"
                  style={{ color: isResult ? GREEN : TEAL }}
                >
                  {lang === 'id' ? `${beat.pairCount} pasang` : `${beat.pairCount} pair${beat.pairCount > 1 ? 's' : ''}`}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* equation chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
