// OSN-24-SD-NAS-TEORI2-Q10 — animated path explainer for "lompat berjumlah prima".
// Beat 0: intro (grid + rules recap)
// Beat 1: trace path A  1→7→6→4→11, sum 29 (prime ✓)
// Beat 2: trace path B  1→8→6→5→11, sum 31 (prime ✓)
// Beat 3: result — 2 valid paths

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PrimeJumpGrid } from './PrimeJumpOSN24NT2Q10Illustration'
import { buildPrimeJumpOSN24NT2Q10Steps } from './primeJumpOSN24NT2Q10Steps'

const GREEN     = '#059669'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE      = '#2563EB'
const BLUE_BG   = '#DBEAFE'
const BLUE_INK  = '#1E40AF'

export default function PrimeJumpOSN24NT2Q10Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'id'
  const steps = useMemo(() => buildPrimeJumpOSN24NT2Q10Steps(lang), [lang])
  const index = useBeatControl(steps.length - 1, {
    ...props,
    holds: steps.map((s) => s.hold),
  })
  const beat = steps[index] ?? steps[steps.length - 1]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: ada tepat 2 jalur valid — 1→7→6→4→11 berjumlah 29 (prima) dan 1→8→6→5→11 berjumlah 31 (prima).'
      : 'Explainer: exactly 2 valid paths — 1→7→6→4→11 sums to 29 (prime) and 1→8→6→5→11 sums to 31 (prime).'

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Grid with current path trail */}
        <motion.div
          key={`grid-${index}`}
          className="w-full"
          initial={{ opacity: 0.75 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        >
          <PrimeJumpGrid path={beat.path} trailColor={beat.trailColor} />
        </motion.div>

        {/* Caption */}
        <motion.div
          key={`cap-${index}`}
          className="w-full min-h-[44px] rounded-xl border-2 px-3 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE_INK }
          }
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        >
          {beat.caption}
        </motion.div>

        {/* Answer chip */}
        {beat.result && (
          <motion.div
            key="chip"
            className="rounded-xl px-5 py-2 font-display text-base font-extrabold text-white"
            style={{ background: GREEN }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
          >
            {lang === 'id' ? '2 jalur valid' : '2 valid paths'}
          </motion.div>
        )}
      </div>
    </div>
  )
}
