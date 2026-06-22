// SEAMO-16-A-Q24 explainer — "How many friendly pairs?" (answer 18).
//
// Animates the two-pass count:
//   Beat 0      — intro
//   Beats 1–3   — horizontal pairs row-by-row (3, 2, 1 → subtotal 6)
//   Beat 4      — transition banner
//   Beats 5–7   — diagonal pairs row-by-row (6, 4, 2 → subtotal 12)
//   Beat 8      — grand total 6 + 12 = 18 ✓

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FriendlyCircles16A24, TOTAL_PAIRS } from './FriendlyCircles16A24Illustration'
import {
  buildFriendlyCircles16A24Steps,
  FRIENDLY_CIRCLES_ANSWER,
} from './friendlyCircles16A24Steps'

// ── palette ───────────────────────────────────────────────────────────────────
const BLUE  = '#30598A'
const GREEN = '#10B981'
const AMBER = '#F59E0B'

export default function FriendlyCircles16A24Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const t     = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildFriendlyCircles16A24Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: 10 circles in a triangular arrangement. Count all ${TOTAL_PAIRS} friendly (touching) pairs: 6 horizontal + 12 diagonal = ${FRIENDLY_CIRCLES_ANSWER}.`,
    `Penjelasan: 10 lingkaran dalam susunan segitiga. Hitung semua ${TOTAL_PAIRS} pasang bersahabat (bersentuhan): 6 horizontal + 12 diagonal = ${FRIENDLY_CIRCLES_ANSWER}.`,
  )

  const captionColour = beat.result
    ? GREEN
    : beat.highlightNodes.size > 0
    ? AMBER
    : BLUE

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Strategy banner */}
        <div
          className="rounded-lg bg-blue-50 px-3 py-1 text-center font-display text-xs font-bold"
          style={{ color: BLUE }}
        >
          {t(
            'Horizontal pairs + diagonal pairs = total',
            'Pasang horizontal + pasang diagonal = total',
          )}
        </div>

        {/* The 10-circle figure, with highlighted edges/nodes */}
        <FriendlyCircles16A24
          highlightGroups={beat.highlightGroups}
          highlightNodes={beat.highlightNodes}
          runningCount={beat.runningCount}
        />

        {/* Caption */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={`cap-${index}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="text-center font-display text-sm leading-snug"
            style={{ color: captionColour }}
          >
            {beat.caption}
          </motion.p>
        </AnimatePresence>

        {/* Final answer chip */}
        {beat.result && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 16, delay: 0.15 }}
            className="rounded-xl px-4 py-1.5 font-display text-base font-extrabold"
            style={{ background: GREEN, color: '#fff' }}
          >
            {t(
              `${FRIENDLY_CIRCLES_ANSWER} friendly pairs`,
              `${FRIENDLY_CIRCLES_ANSWER} pasang bersahabat`,
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
