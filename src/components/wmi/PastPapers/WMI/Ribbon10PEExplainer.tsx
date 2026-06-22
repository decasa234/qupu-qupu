import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { RibbonSerpentineDiagram } from './Ribbon10PEIllustration'
import { buildRibbon10PESteps } from './ribbon10PESteps'

// IKMC-21-PE-Q10 — post-answer explainer for the folded-ribbon cut question.
//
// Reuses the RibbonSerpentineDiagram primitive from the illustration,
// adding per-beat row highlighting and equation overlay.
//
// Beats:
//   0. intro      — static ribbon, set the scene.
//   1. count-rows — highlight all 6 layers; the cut passes through all of them.
//   2. per-row    — highlight one layer as example; 1 cut → 2 pieces.
//   3. compute    — 6 × 2 = 12 highlighted in all rows.
//   4. result     — green finish, 12 → D.

const GREEN = '#10B981'
const BLUE = '#30598A'

export default function Ribbon10PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildRibbon10PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: pita dilipat 6 lapisan, satu potongan vertikal menembus semua lapisan; 6 × 2 = 12 potongan — jawaban D.`
      : `Explainer: ribbon folded into 6 layers; one vertical cut passes through all layers; 6 × 2 = 12 pieces — answer D.`

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Ribbon diagram with beat-driven highlights */}
        <RibbonSerpentineDiagram
          highlightRows={beat.highlightRows}
          showCut={beat.showCut}
          showScissors={beat.showScissors}
          highlightColor={isResult ? GREEN : '#f59e0b'}
        />

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
                style={{ background: isResult ? GREEN : BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
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
