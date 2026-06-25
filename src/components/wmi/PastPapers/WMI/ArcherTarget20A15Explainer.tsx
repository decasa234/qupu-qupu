/**
 * SEAMO-20-A-Q15 — animated explainer for the archery-target question.
 *
 * Beats:
 *   0 — intro: show target, name the three ring values.
 *   1 — highlight middle ring (3 pts).
 *   2 — show 5 arrows, all in middle ring.
 *   3 — result: 5 × 3 = 15 pts → answer C.
 *
 * Reuses ArcherTargetSVG from the illustration file.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ArcherTargetSVG } from './ArcherTarget20A15Illustration'
import { buildArcherTarget20A15Steps } from './archerTarget20A15Steps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_TXT = '#065F46'

// ── Main explainer ─────────────────────────────────────────────────────────────

export default function ArcherTarget20A15Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildArcherTarget20A15Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const captionStyle = beat.result
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TXT }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Semua 5 anak panah mendarat di cincin tengah bernilai 3 poin. Total = 5 × 3 = 15 poin, jawaban C.'
      : 'Explainer: All 5 arrows land in the middle ring worth 3 pts each. Total = 5 × 3 = 15 pts, answer C.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Archery target */}
        <div style={{ width: 200 }}>
          <ArcherTargetSVG
            highlightRing={beat.highlightRing}
            showArrows={beat.showArrows}
          />
        </div>

        {/* Equation chip */}
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
                style={{ background: beat.result ? GREEN : BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
