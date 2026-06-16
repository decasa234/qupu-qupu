import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Bracelets23G1 } from './Bracelets23G1Illustration'
import { buildBracelets23G1Steps } from './bracelets23G1Steps'

// Colours echoing the static figure (qupu palette; raw hex for this paper).
const LABEL = '#C2410C' // bracelet name labels / measure accent
const TOTAL_FILL = '#2563EB' // blue cm totals
const GREEN = '#10B981' // winning verdict

export default function Bracelets23G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBracelets23G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const measuring = beat.phase === 'measure'
  const accent = beat.result ? GREEN : measuring ? LABEL : TOTAL_FILL

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: luruskan dan jumlahkan tiap gelang — Alice ${story.totals.Alice} cm, ` +
        `Becky ${story.totals.Becky} cm, Chloe ${story.totals.Chloe} cm; urutan terpanjang ke ` +
        `terpendek adalah Alice, Becky, Chloe (B).`
      : `Explainer: straighten and add up each bracelet — Alice ${story.totals.Alice} cm, ` +
        `Becky ${story.totals.Becky} cm, Chloe ${story.totals.Chloe} cm; longest to shortest is ` +
        `Alice, Becky, Chloe (B).`

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The bound primitive — the same scene, brought to life. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${beat.straighten ? 's' : 'c'}-${beat.order.join('')}-${beat.revealLengths ? 'r' : 'h'}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            className="flex justify-center"
          >
            <Bracelets23G1
              straighten={beat.straighten}
              revealLengths={beat.revealLengths}
              order={beat.order}
            />
          </motion.div>
        </AnimatePresence>

        {/* Bead-length addition for the bracelet being measured. */}
        {measuring && beat.total != null && (
          <motion.div
            key={`sum-${beat.name}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="font-display text-lg font-black tabular-nums"
            style={{ color: TOTAL_FILL }}
          >
            {beat.terms.map((term) => `${term.count}×${term.cm}`).join(' + ')}
            {` = ${beat.total} cm`}
          </motion.div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : measuring
                ? { background: '#FFFFFF', borderColor: accent, color: accent }
                : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
