// SASMO-19-G2-Q11 — container-chain explainer.
//
// Walks through the chain solution beat by beat:
//   Beat 0 — show all rows (intro)
//   Beat 1 — highlight Row 3: 1 Bottle = 2 Cups
//   Beat 2 — highlight Row 2: 1 Gallon = 3 Cups
//   Beat 3 — highlight Row 1: Pail = 3+1+2 = 6 Cups
//   Beat 4 — result: Answer D (6 cups)
//
// Reuses ContainerChainSASMO19G2Q11Illustration (with highlightRow prop)
// and buildContainerChainSASMO19G2Q11Steps for the storyboard.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import ContainerChainSASMO19G2Q11Illustration from './ContainerChainSASMO19G2Q11Illustration'
import { buildContainerChainSASMO19G2Q11Steps } from './containerChainSASMO19G2Q11Steps'

// ── palette ───────────────────────────────────────────────────────────────────
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'
const AMBER     = '#F59E0B'
const AMBER_BG  = '#FEF3C7'
const AMBER_INK = '#78350F'

export default function ContainerChainSASMO19G2Q11Explainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'
  const story = useMemo(() => buildContainerChainSASMO19G2Q11Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const hasEq    = beat.equation !== null

  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    : beat.highlightRow !== null
      ? { background: AMBER_BG, borderColor: AMBER, color: AMBER_INK }
      : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Baca dari baris terkecil. Botol = 2 Cangkir. Galon = 3 Cangkir. Ember = 3+1+2 = 6 Cangkir. Jawaban D.'
      : 'Explainer: Work bottom-up. Bottle = 2 Cups. Gallon = 3 Cups. Pail = 3+1+2 = 6 Cups. Answer D.'

  return (
    <div className="mx-auto w-full max-w-[580px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* equation badge */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {hasEq && (
              <motion.div
                key={beat.equation}
                initial={{ scale: 0.82, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.82, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                className="rounded-full px-5 py-1 font-display text-sm font-extrabold tabular-nums"
                style={
                  isResult
                    ? { background: GREEN, color: '#FFFFFF' }
                    : { background: '#FFFFFF', border: `2px solid ${AMBER}`, color: AMBER_INK }
                }
              >
                {beat.equation}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* container-chain illustration with row highlight */}
        <motion.div
          key={`row-${beat.highlightRow}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="w-full"
        >
          <ContainerChainSASMO19G2Q11Illustration
            lang={lang}
            highlightRow={beat.highlightRow}
          />
        </motion.div>

        {/* caption */}
        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          className="min-h-[48px] w-full max-w-[500px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </motion.div>

      </div>
    </div>
  )
}
