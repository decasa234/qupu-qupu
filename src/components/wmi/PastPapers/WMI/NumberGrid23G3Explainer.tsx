// WMI-23F3A-Q23 (2023 Grade 3 Final) — animated explainer (post-answer).
//
// Strategy: there are exactly six "transversals" — ways to pick one number per
// row with all-different columns. A 3-digit number is divisible by 4 exactly
// when its LAST TWO digits form a multiple of 4. So we walk the six transversals
// one beat each, highlight each on the grid (via the figure's `pick` prop), list
// the arrangements whose back two digits are multiples of 4, and bump a running
// counter 0 → 0 → 2 → 4 → 6 → 8 → 8. Two all-odd transversals contribute nothing
// and linger a touch longer so the "0" reads. Final beat lands on 8.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { NumberGrid23G3 } from './NumberGrid23G3Illustration'
import { buildNumberGrid23G3Steps } from './numberGrid23G3Steps'

// ---- colour tokens (mirror fill-qupu-* Tailwind tokens) ----------------------
const BRAND_BLUE = '#30598A' // qupu-brand-blue — neutral panel + counter shell
const ORANGE = '#f0853a' // qupu-brand-orange — the live transversal accent
const GREEN = '#10B981' // win / divisible-by-4 hits
const GREEN_INK = '#065F46'
const RED = '#DC2626' // a transversal that contributes nothing
const MUTED = '#9aa3b2'

// One divisible-by-4 number found on this beat, shown as a chip with its last
// two digits underlined so the rule is visible.
function HitChip({ value }: { value: number }) {
  const s = String(value)
  return (
    <motion.div
      layout
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.6, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      className="rounded-lg border-2 px-2 py-0.5 font-display text-base font-black tabular-nums"
      style={{ background: '#ECFDF5', borderColor: GREEN, color: GREEN_INK }}
    >
      <span>{s[0]}</span>
      <span style={{ textDecoration: 'underline', textDecorationThickness: 2 }}>{s.slice(1)}</span>
    </motion.div>
  )
}

export default function NumberGrid23G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildNumberGrid23G3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isFinal = beat.result
  const zeroHits = beat.pick != null && beat.hits.length === 0

  // Counter colour: green on the win, red on a zero-hit transversal, else orange.
  const counterColor = isFinal ? GREEN : zeroHits ? RED : ORANGE

  const ariaLabel = t(
    `Explainer: there are six ways to pick one number per row in different columns. A number is a multiple of 4 when its last two digits are. Two all-odd picks give 0; the other four give 2 each — 0 + 2 + 2 + 2 + 2 + 0 = ${story.answer}. So ${story.answer} of the numbers are divisible by 4.`,
    `Penjelasan: ada enam cara memilih satu angka tiap baris dengan kolom berbeda. Sebuah bilangan kelipatan 4 jika dua digit terakhirnya kelipatan 4. Dua pilihan ganjil semua memberi 0; empat lainnya memberi 2 masing-masing — 0 + 2 + 2 + 2 + 2 + 0 = ${story.answer}. Jadi ${story.answer} bilangan habis dibagi 4.`,
  )

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* one-line legend: the divisible-by-4 rule, always visible */}
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          <span aria-hidden style={{ textDecoration: 'underline', textDecorationThickness: 2 }}>
            ÷4
          </span>
          {t('Check the last two digits', 'Cek dua digit terakhir')}
        </div>

        {/* the grid, with the current transversal highlighted via `pick` */}
        <NumberGrid23G3 pick={beat.pick} />

        {/* running total of divisible-by-4 numbers found so far */}
        <motion.div
          key={`tot-${index}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 18 }}
          className="flex items-center gap-2 rounded-full border-2 px-4 py-1 font-display text-sm font-extrabold"
          style={{ borderColor: counterColor, background: '#FFFFFF', color: counterColor }}
        >
          <span style={{ color: MUTED }}>{t('Multiples of 4 so far', 'Kelipatan 4 sejauh ini')}</span>
          <motion.span
            key={`n-${beat.runningTotal}-${index}`}
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 16 }}
            className="text-xl font-black tabular-nums"
          >
            {beat.runningTotal}
          </motion.span>
        </motion.div>

        {/* divisible-by-4 arrangements for this transversal (chips), or a "0" note */}
        <div className="flex min-h-[2rem] flex-wrap items-center justify-center gap-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {beat.hits.map((v) => (
              <HitChip key={`hit-${v}`} value={v} />
            ))}
          </AnimatePresence>
          {zeroHits && (
            <motion.div
              key={`zero-${index}`}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-lg border-2 px-3 py-0.5 font-display text-base font-black"
              style={{ background: '#FEE2E2', borderColor: RED, color: '#991B1B' }}
            >
              0 ✗
            </motion.div>
          )}
        </div>

        {/* caption */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`cap-${index}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
            style={
              isFinal
                ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
                : zeroHits
                  ? { background: '#FEE2E2', borderColor: RED, color: '#991B1B' }
                  : beat.pick != null
                    ? { background: '#FFF7ED', borderColor: ORANGE, color: '#9A3412' }
                    : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
            }
          >
            {beat.caption}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
