import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { DigitTriple25G1 } from './DigitTriple25G1Illustration'
import { buildDigitTripleSteps } from './digitTriple25G1Steps'

// WMI-25F1A-Q17 post-answer animation. Teaches the method, not just the answer:
// the spread is driven by the TENS digits, so we choose three close tens
// (4, 6, 7), hand the leftovers (9, 2, 0) to the units, and build 70 → 62 → 49
// so the numbers crowd together. Result: 70 − 49 = 21.

// qupu colour tokens echoed as hex, matching the static illustration.
const ORANGE = '#f0853a' // qupu-brand-orange
const ORANGE_DK = '#C56A12'
const BLUE = '#30598A' // qupu-brand-blue
const GREEN = '#10B981'
const GREEN_DK = '#065F46'
const GREEN_FILL = '#D1FAE5'

export default function DigitTriple25G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildDigitTripleSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Strategy: pick three close tens digits 4, 6, 7 so the numbers crowd together — 49, 62, 70 — then largest minus smallest is 70 − 49 = ${story.answer}.`,
    `Strategi: pilih tiga angka puluhan yang dekat 4, 6, 7 supaya bilangan berdekatan — 49, 62, 70 — lalu terbesar dikurangi terkecil 70 − 49 = ${story.answer}.`,
  )

  // Caption box styling: blue for setup/build, green on the winning result beat.
  const captionStyle = beat.result
    ? { background: GREEN_FILL, borderColor: GREEN, color: GREEN_DK }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The static scene coming alive — slots fill one at a time. */}
        <motion.div
          key={index}
          initial={{ opacity: 0.6, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="w-full"
        >
          <DigitTriple25G1 formed={beat.formed} />
        </motion.div>

        {/* The tens-cluster / units split, revealed on the 'pick' beat. */}
        {beat.tens && beat.units && beat.phase !== 'goal' && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center gap-4 font-display text-sm font-extrabold"
          >
            <span className="flex items-center gap-1" style={{ color: ORANGE_DK }}>
              {T('tens', 'puluhan')}:{' '}
              <span className="tabular-nums" style={{ color: ORANGE }}>
                {beat.tens.join(' ')}
              </span>
            </span>
            <span className="flex items-center gap-1" style={{ color: BLUE }}>
              {T('units', 'satuan')}:{' '}
              <span className="tabular-nums">{beat.units.join(' ')}</span>
            </span>
          </motion.div>
        )}

        {/* The winning difference, called out big on the result beat. */}
        {beat.result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: GREEN }}
          >
            {`${story.high} − ${story.low} = ${story.answer}`}
          </motion.div>
        )}

        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
