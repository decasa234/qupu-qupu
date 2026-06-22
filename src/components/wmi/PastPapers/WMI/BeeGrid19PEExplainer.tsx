// IKMC-20-PE-Q19 — Animated explainer for the bee honeycomb grid problem
//
// Each beat shows one valid pair of white cells highlighted in amber,
// plus the bee's walking path from A to B through those cells.
// The final beat reveals that there are exactly 5 such pairs (Answer C).

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BeeGrid19PE } from './BeeGrid19PEIllustration'
import { buildBeeGrid19PESteps } from './beeGrid19PESteps'

// Qupu palette tokens (raw values since we're in SVG/inline-style context)
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const AMBER = '#F59E0B'
const AMBER_BG = '#FEF3C7'

export default function BeeGrid19PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildBeeGrid19PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: temukan 5 cara mewarnai 2 sel putih agar lebah Mark bisa berjalan dari A ke B. Jawaban C = 5.'
      : 'Explainer: find 5 ways to colour 2 white cells so Mark the bee can walk from A to B. Answer C = 5.'

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Pair counter heading */}
        <div
          className="font-display text-xs font-extrabold uppercase tracking-wide"
          style={{ color: beat.result ? GREEN : BLUE }}
        >
          {beat.result
            ? T('All 5 valid pairs found!', 'Semua 5 pasangan valid ditemukan!')
            : beat.pairIndex !== null
              ? T(`Pair ${beat.pairIndex} of 5`, `Pasangan ${beat.pairIndex} dari 5`)
              : T('The challenge', 'Tantangannya')}
        </div>

        {/* Grid */}
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        >
          <BeeGrid19PE
            highlightedCells={beat.highlightedPair ?? []}
            showPath={beat.showPath}
            showBee={!beat.showPath}
          />
        </motion.div>

        {/* Running count badge — shows on pair beats and result beat */}
        {beat.count !== null && (
          <motion.div
            key={`count-${beat.count}`}
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg font-display text-lg font-extrabold text-white"
              style={{ background: AMBER }}
            >
              {beat.count}
            </div>
            <span className="font-display text-base font-extrabold" style={{ color: '#92400E' }}>
              {T('/ 5 ways', '/ 5 cara')}
            </span>
          </motion.div>
        )}

        {/* Result answer chip */}
        {beat.result && (
          <motion.div
            key="answer"
            className="flex items-center gap-2 rounded-xl px-4 py-2 font-display text-base font-extrabold"
            style={{ background: AMBER_BG, color: '#92400E', border: `2px solid ${AMBER}` }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
          >
            {T('Answer C = 5', 'Jawaban C = 5')}
          </motion.div>
        )}

        {/* Caption */}
        <div
          className="min-h-[48px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
