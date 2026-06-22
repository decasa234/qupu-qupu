// IKMC-21-EC-Q19 — post-answer explainer.
//
// Reuses NeighborStrip from NeighborSums19ECIllustration so the animation
// reads as the same scene coming alive.
//
// Animation beats:
//   0. intro     — empty strip; explain the rule.
//   1. chain-a   — reveal cells 0,1 (9,6); below-sum 15 at gap 0.
//   2. chain-b   — reveal cell 2 (1); above-sum 7 at gap 1.
//   3. chain-c   — reveal cell 3 (2); below-sum 3 at gap 2.
//   4. chain-d   — reveal cell 4 = 7 (shaded); above-sum 9 at gap 3.
//   5. result    — all cells filled; answer D confirmed.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { NeighborStrip } from './NeighborSums19ECIllustration'
import { buildNeighborSums19ECSteps } from './neighborSums19ECSteps'

// ── palette (echoes the illustration tokens) ──────────────────────────────────
const BRAND_BLUE  = '#30598A'  // qupu-brand-blue — neutral chrome
const ORANGE      = '#f0853a'  // qupu-brand-orange — shaded cell accent
const GREEN       = '#10B981'
const GREEN_INK   = '#065F46'
const GREEN_SOFT  = '#D1FAE5'
const SHELL       = '#FFF9F4'  // qupu-shell (panel bg)
const PEACH       = '#FFD3B1'  // qupu-peach (panel border)
const PEACH_SOFT  = '#FDE3CF'  // shaded cell wash

// ── equation chip ─────────────────────────────────────────────────────────────

/** Small "A + B = C" chip shown during a chain beat. */
function EquationChip({
  lhs,
  rhs,
  sum,
  revealed,
}: {
  lhs: string | number
  rhs: string | number
  sum: number
  revealed: boolean
}) {
  const bg = revealed ? GREEN_SOFT : PEACH_SOFT
  const border = revealed ? GREEN : ORANGE
  const ink = revealed ? GREEN_INK : '#9a4a14'
  return (
    <div
      className="flex items-center gap-1 rounded-xl border-2 px-3 py-1"
      style={{ background: bg, borderColor: border }}
    >
      <span className="font-display text-xl font-black tabular-nums" style={{ color: BRAND_BLUE }}>
        {lhs}
      </span>
      <span className="font-display text-xl font-black" style={{ color: BRAND_BLUE }}>
        +
      </span>
      <motion.span
        key={String(rhs)}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        className="font-display text-xl font-black tabular-nums"
        style={{ color: ink }}
      >
        {rhs}
      </motion.span>
      <span className="font-display text-xl font-black" style={{ color: BRAND_BLUE }}>
        =
      </span>
      <span className="font-display text-xl font-black tabular-nums" style={{ color: ORANGE }}>
        {sum}
      </span>
    </div>
  )
}

// ── Main explainer ─────────────────────────────────────────────────────────────

export default function NeighborSums19ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildNeighborSums19ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Each label between two cells is their sum. Chain: 9+6=15, 6+1=7, 1+2=3, 2+7=9. The shaded cell holds 7 — answer D.`,
    `Setiap label antara dua kotak adalah jumlahnya. Rantai: 9+6=15, 6+1=7, 1+2=3, 2+7=9. Kotak yang diarsir berisi 7 — jawaban D.`,
  )

  // Which equation chip to show per phase.
  const chip = (() => {
    switch (beat.phase) {
      case 'chain-a': return <EquationChip lhs={9} rhs={6} sum={15} revealed={false} />
      case 'chain-b': return <EquationChip lhs={6} rhs={1} sum={7}  revealed={false} />
      case 'chain-c': return <EquationChip lhs={1} rhs={2} sum={3}  revealed={false} />
      case 'chain-d': return <EquationChip lhs={2} rhs={story.shadedValue} sum={9} revealed={true} />
      case 'result':  return <EquationChip lhs={2} rhs={story.shadedValue} sum={9} revealed={true} />
      default:        return null
    }
  })()

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[240px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* strip figure */}
        <NeighborStrip
          revealedValues={beat.revealed}
          highlightShaded={beat.highlightShaded}
        />

        {/* equation chip */}
        <AnimatePresence mode="wait">
          {chip && (
            <motion.div
              key={beat.phase}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'spring', stiffness: 360, damping: 24 }}
            >
              {chip}
            </motion.div>
          )}
        </AnimatePresence>

        {/* caption box */}
        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
              : beat.phase === 'chain-d'
                ? { background: PEACH_SOFT, borderColor: ORANGE, color: '#9a4a14' }
                : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
