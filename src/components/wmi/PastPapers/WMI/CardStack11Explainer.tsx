// IKMC-19-PE-Q11 — post-answer animation for the five-card stack.
//
// Reuses CardStack11 from CardStack11Illustration so the animation reads as
// the static scene coming alive. Beats:
//   0. intro     — full static stack; card 5 highlighted as topmost.
//   1. remove-5  — card 5 faded/removed; card 2 highlighted.
//   2. remove-2  — card 2 faded; card 3 highlighted.
//   3. remove-3  — card 3 faded; card 1 highlighted.
//   4. remove-1  — card 1 faded; card 4 highlighted (last).
//   5. result    — all cards faded; sequence "5 → 2 → 3 → 1 → 4" shown in green.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CardStack11 } from './CardStack11Illustration'
import { buildCardStack11Steps } from './cardStack11Steps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN = '#10B981'
const BLUE_BG = '#E1EFFB'
const BLUE_INK = '#30598A'

export default function CardStack11Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCardStack11Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result

  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: BLUE_BG, borderColor: BLUE_INK, color: BLUE_INK }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: kartu yang tidak ada kartu lain di atasnya diambil pertama. Urutan pengambilan: 5 → 2 → 3 → 1 → 4 — jawaban D.'
      : 'Explainer: the card with no other card on top is removed first. Removal order: 5 → 2 → 3 → 1 → 4 — answer D.'

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure — the stack with removals + highlights */}
        <CardStack11
          removed={beat.removed}
          highlight={beat.topCard}
        />

        {/* sequence pill — shows the partial removal order built so far */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.sequence !== '' && (
              <motion.span
                key={beat.sequence}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : BLUE_INK }}
              >
                {beat.sequence}
                {isResult && ' → D'}
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
